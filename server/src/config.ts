import dotenv from "dotenv-flow";
import path from "path";
import mkdirp from "mkdirp";
import { AppDirs } from "appdirs";
import yaml from "js-yaml";
import fs from "fs";

dotenv.config({
  path: ".."
})
dotenv.config();

export const PORT = process.env.PORT || 24000;
export const DATA_PATH = process.env.DATA_PATH || path.join(new AppDirs("my-notes").userDataDir(), "data");

console.log(`DATA_PATH is at ${DATA_PATH}`);

mkdirp.sync(DATA_PATH);

class Config {
  PATH = path.join(DATA_PATH, "config.yaml");
  data: any = null;

  constructor() {
    try {
      this.data = yaml.safeLoad(fs.readFileSync(this.PATH, "utf8"));
    } catch(e) {}
  }

  get(key: string) {
    if (this.data) {
      return this.data[key];
    }

    return undefined;
  }

  set(key: string, value: any) {
    this.data = this.data || {};
    this.data[key] = value;
    this.save();
  }

  save() {
    if (this.data) {
      fs.writeFileSync(this.PATH, this.data);
    }
  }
}

export const CONFIG = new Config();
export const SECRET: string | undefined = process.env.SECRET || CONFIG.get("SECRET");

export function getAuth0(): {
  id: string;
  domain: string;
  secret: string;
} | undefined {
  try {
    return yaml.safeLoad(fs.readFileSync(path.join(DATA_PATH, "auth0.yaml"), "utf8"));
  } catch(e) {
    return CONFIG.get("AUTH0");
  }
}
