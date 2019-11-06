import PouchDB from "pouchdb";
import QParser, { IQParserOptions } from "q2filter";
// @ts-ignore
import UrlSafeString from "url-safe-string";
// @ts-ignore
import pinyin from "chinese-to-pinyin";
import uuid4 from "uuid/v4";
import { TimeStamp, IFindOptions } from "@my-notes/db";
import { Router, Express } from "express";
import bodyParser from "body-parser";
import { CONFIG } from "../../config";

const StoragePouchDB = PouchDB.defaults({prefix: CONFIG.storage});

const uss = new UrlSafeString({
  regexRemovePattern: /((?!([a-z0-9.])).)/gi
});

class Collection<T extends {_id: string, tags?: string[]}> {
  public pouch: PouchDB.Database<TimeStamp<T>>;

  constructor(public name: string, public options: {
    parseQ: Partial<IQParserOptions<TimeStamp<T>>>;
  }) {
    this.pouch = new StoragePouchDB<TimeStamp<T>>(name);
  }

  get couchUrl() {
    return `${CONFIG.couch}/${this.name}`;
  }

  async init(app?: Router) {
    if (CONFIG.couch) {
      const r = await this.pouch.replicate.from(this.couchUrl);
      this.pouch.replicate.to(this.couchUrl, {live: true});

      return r.ok;
    }

    if (app) {
      const router = Router();
      router.post("/", async (req, res, next) => {
        try {
          const {q, options} = req.body;
          return res.json(await this.find(q, options));
        } catch(e) {
          return next(e);
        }
      });
      router.post("/:id", async (req, res, next) => {
        try {
          const { id } = req.params;
          return res.json(await this.get(id));
        } catch(e) {
          return next(e);
        }
      });
      router.put("/", async (req, res, next) => {
        try {
          return res.json(await this.create(req.body));
        } catch(e) {
          return next(e);
        }
      });
      router.put("/:id", async (req, res, next) => {
        try {
          const { id } = req.params;
          return res.json(await this.update(id, req.body));
        } catch(e) {
          return next(e);
        }
      });
      router.put("/:id/tag", async (req, res, next) => {
        try {
          const { id } = req.params;
          const { tag } = req.body;
          return res.json(await this.addTag(id, tag));
        } catch(e) {
          return next(e);
        }
      });
      router.delete("/:id/tag", async (req, res, next) => {
        try {
          const { id } = req.params;
          const { tag } = req.body;
          return res.json(await this.removeTag(id, tag));
        } catch(e) {
          return next(e);
        }
      });
      router.get("/safeId", async (req, res, next) => {
        try {
          const { title } = req.query;
          return res.json(await this.getSafeId(title));
        } catch(e) {
          return next(e);
        }
      });
      router.delete("/:id", async (req, res, next) => {
        try {
          const { id } = req.params;
          return res.json(await this.delete(id));
        } catch(e) {
          return next(e);
        }
      });

      app.use(`/${this.name}`, router);
    }

    return true;
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
    return await this.pouch.get(id);
  }

  async create(entry: T) {
    const { id } = await this.pouch.put({
      ...entry,
      createdAt: new Date().toISOString()
    });
    return { id };
  }

  async getSafeId(title?: string) {
    const ids = (await this.pouch.allDocs()).rows.map((r) => r.id);

    let outputId = title ? uss.generate(pinyin(title, {
      keepRest: true, toneToNumber: true
    })) as string : "";

    while (ids.includes(outputId)) {
      const m = /-(\d+)$/.exec(outputId);
      let i = 1;

      if (m) {
        i = parseInt(m[1]) + 1;
      }

      outputId = `${outputId.replace(/-(\d+)$/, "")}-${i}`;
    }

    return {
      id: outputId || uuid4()
    };
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

export class Database {
  cols = {
    user: new Collection<IUser>("user", {parseQ: {
      anyOf: ["email", "info.name", "info.website", "tag"],
      isString: ["email", "info.name", "info.website", "tag"]
    }}),
    post: new Collection<IPost>("post", {parseQ: {
      anyOf: ["title", "type", "tag"],
      isString: ["title", "type", "tag"]
    }})
  }

  constructor(private app: Express) {}

  async init() {
    const router = Router();
    router.use(bodyParser.json());

    await Promise.all(Object.values(this.cols).map((el) => el.init(this.app)));

    this.app.use("/api", router);
  }
}