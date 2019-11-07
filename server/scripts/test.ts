/// <reference types="../src/declaration" />
import { Database } from "../src/db";
import fs from "fs";
import { ROOT } from "../../config";

(async () => {
  const db = new Database();
  await db.init();

  await Promise.all(db.pouch.map((p) => {
    return p.dump(fs.createWriteStream(`${ROOT}/backup/${p.name}`));
  }));
})().catch(console.error);
