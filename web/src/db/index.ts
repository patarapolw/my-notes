import PouchDB from "pouchdb";
import QParser, { ISortOptions, IQParserOptions } from "q2filter";
import UrlSafeString from "url-safe-string";
import pinyin from "chinese-to-pinyin";
import uuid4 from "uuid/v4";

const uss = new UrlSafeString({
  regexRemovePattern: /((?!([a-z0-9.])).)/gi
});

const COUCH_DB_URL = "";

export interface IFindOptions {
  offset: number;
  limit: number | null;
  sort: ISortOptions | null;
  fields: string[];
}

export type TimeStamp<T> = T & {
  createdAt: string;
  updatedAt?: string;
}

class Collection<T extends {_id: string, tags?: string[]}> {
  public pouch: PouchDB.Database<TimeStamp<T>>;

  constructor(public name: string, public options: {
    parseQ: Partial<IQParserOptions<TimeStamp<T>>>;
  }) {
    this.pouch = new PouchDB<TimeStamp<T>>(name);
  }

  get couchUrl() {
    return `${COUCH_DB_URL}/${this.name}`;
  }

  async init() {
    if (COUCH_DB_URL) {
      const r = await this.pouch.replicate.from(this.couchUrl, {live: true});
      this.pouch.replicate.to(this.couchUrl, {live: true});

      return r.ok;
    }

    return false;
  }

  async find(q: string | Record<string, any>, options: Partial<IFindOptions> = {}) {
    const qp = new QParser<TimeStamp<T>>(q, this.options.parseQ);
    const sortBy = qp.result.sortBy || {
      key: "updatedAt",
      desc: true
    };

    const r = await this.pouch.query<TimeStamp<T>>((doc, emit) => {
      if (emit && qp.filter(doc)) {
        Object.keys(doc).forEach((k) => {
          if (options.fields) {
            if (!options.fields.includes(k)) {
              delete (doc as any)[k];
            }
          }
        });

        emit((doc as any)[sortBy.key], doc);
      }
    }, {
      skip: options.offset,
      limit: options.limit || 10,
      descending: sortBy.desc
    });

    return {
      data: Array.from(r.rows.values()).map((el) => el.value),
      count: r.total_rows
    };
  }

  async get(id: string) {
    return await this.pouch.get(id)
  }

  async create(entry: T) {
    return (await this.pouch.put({
      ...entry,
      createdAt: new Date().toISOString()
    })).id;
  }

  async getSafeId(title?: string) {
    const ids = (await this.pouch.allDocs()).rows.map((r) => r.id);

    let outputId = title ? uss.generate(pinyin(title, {
      keepRest: true, toneToNumber: true
    })) : "";
  
    while (ids.includes(outputId)) {
      const m = /-(\d+)$/.exec(outputId);
      let i = 1;
  
      if (m) {
        i = parseInt(m[1]) + 1;
      }
  
      outputId = `${outputId.replace(/-(\d+)$/, "")}-${i}`;
    }
  
    return outputId || uuid4();
  }

  async update(id: string, u: Partial<T>) {
    return await this.pouch.get(id).then((d) => {
      Object.assign(d, JSON.parse(JSON.stringify(u)));
      return this.pouch.put(d);
    })
  }

  async delete(id: string) {
    return await this.pouch.get(id).then((d) => {
      return this.pouch.remove(d);
    })
  }

  async addTag(id: string, tags: string[]) {
    return await this.pouch.get(id).then((d) => {
      if (d.tags) {
        for (const t of d.tags) {
          if (!tags.includes(t)) {
            d.tags.push(t);
          }
        }
      } else {
        d.tags = tags;
      }

      return this.pouch.put(d);
    });
  }

  async removeTag(id: string, tags: string[]) {
    return await this.pouch.get(id).then((d) => {
      if (d.tags) {
        const newTags: string[] = [];
        for (const t of d.tags) {
          if (!tags.includes(t)) {
            newTags.push(t);
          }
        }

        if (newTags.length > 0) {
          d.tags = newTags;
        } else {
          delete d.tags;
        }
      }

      return this.pouch.put(d);
    });
  }
}

export interface IUser {
  _id: string;
  type?: string;
  email: string;
  picture?: string;
  secret: string;
  info?: {
    name?: string;
    website?: string;
  };
  tags?: string[];
}

export interface IPost {
  _id: string;
  title: string;
  date?: string;
  type?: string;
  tags?: string[];
  headers: any;
  content: string;
}

class Database {
  user = new Collection<IUser>("user", {parseQ: {
    anyOf: ["email", "info.name", "info.website", "tag"],
    isString: ["email", "info.name", "info.website", "tag"]
  }});

  post = new Collection<IPost>("post", {parseQ: {
    anyOf: ["title", "type", "tag"],
    isString: ["title", "type", "tag"]
  }})

  async init() {
    return await Promise.all([
      this.user.init(),
      this.post.init()
    ]).then((r) => r.every((it) => it));
  }
}

const db = new Database();

export default db;
