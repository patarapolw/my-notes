declare module "chinese-to-pinyin";
declare module "url-safe-string";
declare module "pouchdb-replication-stream" {
  export const plugin: any;
  export const adapters: {
    writableStream: any;
  }
}

declare module "pouchdb" {
  import { WriteStream, ReadStream } from "fs";

  global {
    namespace PouchDB {
      interface Static {
        adapter(name: string, adapter: any): void;
      }

      interface Database {
        dump(stream: WriteStream): Promise<{ok: boolean}>;
        load(stream: ReadStream): Promise<{ok: boolean}>;
      }
    }
  }

  export default PouchDB;
}