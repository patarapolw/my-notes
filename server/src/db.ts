/// <reference types="./declaration" />
import PouchDB from "pouchdb";
import QParser, { IQParserOptions } from "q2filter";
import UrlSafeString from "url-safe-string";
import pinyin from "chinese-to-pinyin";
import uuid4 from "uuid/v4";
import { TimeStamp, IFindOptions, IPost, IMedia } from "@patarapolw/my-notes__db";
import { Router } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import { AppDirs } from "appdirs";
import path from "path";
import mkdirp from "mkdirp";
import "./config";

const DATA_PATH = process.env.DATA_PATH || path.join(new AppDirs("my-notes").userDataDir(), "data");

console.log(`DATA_PATH is at ${DATA_PATH}`);

mkdirp.sync(DATA_PATH);

const StoragePouchDB = PouchDB.defaults({prefix: DATA_PATH + "/"});

const uss = new UrlSafeString({
  regexRemovePattern: /((?!([a-z0-9.])).)/gi
});

class Collection<T extends {_id: string, tag?: string[]}> {
  public pouch: PouchDB.Database<TimeStamp<T>>;

  constructor(public name: string, public options: {
    parseQ: Partial<IQParserOptions<TimeStamp<T>>>;
  }) {
    this.pouch = new StoragePouchDB<TimeStamp<T>>(name);
  }

  async init(app?: Router) {
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

  async addTag(id: string, tag: string[]) {
    return await this.pouch.get(id).then((d) => {
      if (d.tag) {
        for (const t of d.tag) {
          if (!tag.includes(t)) {
            d.tag.push(t);
          }
        }
      } else {
        d.tag = tag;
      }

      return this.pouch.put(d);
    });
  }

  async removeTag(id: string, tag: string[]) {
    return await this.pouch.get(id).then((d) => {
      if (d.tag) {
        const newTags: string[] = [];
        for (const t of d.tag) {
          if (!tag.includes(t)) {
            newTags.push(t);
          }
        }

        if (newTags.length > 0) {
          d.tag = newTags;
        } else {
          delete d.tag;
        }
      }

      return this.pouch.put(d);
    });
  }
}

export class Database {
  cols = {
    // user: new Collection<IUser>("user", {parseQ: {
    //   anyOf: ["email", "info.name", "info.website", "tag"],
    //   isString: ["email", "info.name", "info.website", "tag"]
    // }}),
    post: new Collection<IPost>("post", {parseQ: {
      anyOf: ["title", "type", "tag"],
      isString: ["title", "type", "tag"]
    }}),
    media: new Collection<IMedia & {
      _attachments: {
        [name: string]: {
          content_type: string;
          data: Buffer;
        }
      }
    }>("media", {parseQ: {
      anyOf: ["name", "tag"],
      isString: ["name", "tag"]
    }})
  }

  get pouch() {
    return Object.values(this.cols).map((el) => el.pouch);
  }

  async init(router?: Router) {
    await Promise.all(Object.values(this.cols).map((el) => el.init(router)));

    if (router) {
      const mediaRouter = Router();
      mediaRouter.use(fileUpload());
      mediaRouter.get("/:id", async (req, res, next) => {
        try {
          const p = await this.cols.media.pouch.get(req.params.id, {attachments: true, binary: true});
          const a = Object.values(p._attachments)[0];
          return res.send(p ? a.data : "");
        } catch(e) {
          return next(e);
        }
      });
      mediaRouter.put("/", async (req, res, next) => {
        try {
          const file = req.files!.file as UploadedFile;
          let {name, data} = file;
      
          if (name === "image.png") {
            name = new Date().toISOString();
          }
      
          const { tag } = req.body;
          let realTag: string[] | undefined = undefined;
          if (tag) {
            realTag = JSON.parse(tag);
          }
      
          const p = await this.cols.media.create({
            _id: (await this.cols.media.getSafeId(name)).id,
            name,
            tag: realTag,
            _attachments: {
              [name]: {
                content_type: file.mimetype,
                data
              }
            }
          });
          
          return res.json({
            id: p.id
          });
        } catch(e) {
          return next(e);
        }
      });

      router.use("/media", mediaRouter);
    }

    return router;
  }
}