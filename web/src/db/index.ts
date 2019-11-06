import UrlSafeString from "url-safe-string";
import pinyin from "chinese-to-pinyin";
import uuid4 from "uuid/v4";
import firebase, { firestore } from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import moment from "moment";
import { parseDuration } from "./xmoment";
import { firebaseConfig } from "./config.secret";

firebase.initializeApp(firebaseConfig);

const uss = new UrlSafeString({
  regexRemovePattern: /((?!([a-z0-9.])).)/gi
});

export interface ISortOptions {
  key: string;
  desc: boolean;
}

export interface IFindOptions {
  offset: number;
  limit: number | null;
  sort: ISortOptions | null;
  fields: string[];
}

export type TimeStamp<T> = T & {
  createdAt: any;
  updatedAt?: any;
}

class Collection<T extends {_id: string, tag?: string[]}> {
  ref: firestore.CollectionReference;

  constructor(public firestore: firestore.Firestore, public name: string) {
    this.ref = firestore.collection(name);
  }

  async find(q: string, options: Partial<IFindOptions> = {}) {
    const sortBy = (() => {
      const m = /(?:^| |\()(-)?sort:([A-Z.]+)(?:$| |\))/i.exec(q);
      if (m) {
        const [all, desc, key] = m;
        q = q.replace(all, "");

        return {
          key,
          desc: !!desc
        };
      }
    })() || {
      key: "updatedAt",
      desc: true
    };

    let r = this.ref.orderBy(sortBy.key, sortBy.desc ? "desc" : "asc");

    await (async () => {
      const regex = /(?:^| |\()([A-Z.]+)(<|<=|>|>=|==|:)(\S+|"[^"]+"|'[^']+')(?:$| |\))/gi;
      let m: RegExpExecArray | null = null;
      while (m = regex.exec(q)) {
        let [all, key, op, value] = m as any[];
        if (/^\d+(?:\.\d+)?$/.exec(value)) {
          value = parseFloat(value);
        }

        if (op === ":") {
          if (key === "tag") {
            op = "array-contains";
          } else if (["date", "createdAt", "updatedAt"].includes(key)) {
            const diff = parseDuration(value.toString());
            if (diff) {
              const timestamp = await this.getTimestamp();
              r = r
              .where(key, ">", timestamp.add(diff).add(-12, "hour").toDate())
              .where(key, "<", timestamp.add(diff).add(+12, "hour").toDate());
              continue;
            }
          } else {
            op = "==";
          }
        }

        r = r.where(key, op, value);
      }
    })();

    const startAt = options.offset || 0;
    let endBefore: number | undefined = undefined;

    if (options.limit !== null) {
      endBefore = startAt + (options.limit || 10);
    }

    const snapShot = await r.get();

    return {
      data: snapShot.docs.slice(startAt, endBefore).map((d) => d.data()) as TimeStamp<T>[],
      count: snapShot.size
    };
  }

  async get(id: string): Promise<TimeStamp<T> | null> {
    const doc = await this.ref.doc(id).get();
    return doc.exists ? doc.data() as any || null : null;
  }

  async create(entry: T) {
    return await this.ref.doc(entry._id).set({
      ...entry,
      createdAt: firestore.FieldValue.serverTimestamp()
    });
  }

  async getSafeId(title?: string) {
    const ids = (await this.ref.get()).docs.map((d) => d.id);

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
  
    return outputId || uuid4();
  }

  async update(id: string, u: Partial<T>) {
    return await this.ref.doc(id).update({
      ...JSON.parse(JSON.stringify(u)),
      updatedAt: firestore.FieldValue.serverTimestamp()
    });
  }

  async delete(id: string) {
    await this.ref.doc(id).delete();
  }

  async addTag(id: string, tags: string[]) {
    return await this.ref.doc(id).get().then((snapShot) => {
      const d = snapShot.data()!;

      if (d.tags) {
        for (const t of d.tags) {
          if (!tags.includes(t)) {
            d.tags.push(t);
          }
        }
      } else {
        d.tags = tags;
      }

      return this.ref.doc(id).set(d);
    });
  }

  async removeTag(id: string, tags: string[]) {
    return await this.ref.doc(id).get().then((snapShot) => {
      const d = snapShot.data()!;

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

      return this.ref.doc(id).set(d);
    });
  }

  async getTimestamp() {
    await this.firestore.collection(".info").doc("server").set({
      timestamp: firestore.FieldValue.serverTimestamp()
    });
    const data = (await this.firestore.collection(".info").doc("server").get()).data();
    return data ? moment(data.timestamp) : moment();
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
  firestore: firebase.firestore.Firestore;

  cols: {
    user: Collection<IUser>;
    post: Collection<IPost>;
  }

  constructor() {
    this.firestore = firestore();
    
    this.cols = {
      user: new Collection(this.firestore, "user"),
      post: new Collection(this.firestore, "post")
    }
  }
}

const db = new Database();

export default db;
