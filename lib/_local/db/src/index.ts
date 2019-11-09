export let PORT = typeof process !== "undefined" ? process.env.PORT : null;

export interface IFindOptions {
  offset: number;
  limit: number | null;
  sort: {
    key: string;
    desc: boolean;
  } | null;
  fields: string[];
}

export type TimeStamp<T> = T & {
  createdAt: string;
  updatedAt?: string;
}

// export interface IUser {
//   _id: string;
//   type?: string;
//   email: string;
//   picture?: string;
//   secret: string;
//   info?: {
//     name?: string;
//     website?: string;
//   };
//   tag?: string[];
// }

export interface IPost {
  _id: string;
  title: string;
  date?: string;
  type?: string;
  tag?: string[];
  headers: any;
  content: string;
}

export interface IMedia {
  _id: string;
  name: string;
  tag?: string[];
}

class Collection<T extends {_id: string, tag?: string[]}> {
  constructor(public name: string) {}

  async find(q: string, options: Partial<IFindOptions> = {}): Promise<{
    data: TimeStamp<T>[];
    count: number;
  }> {
    return await fetchJSON(`/api/${this.name}/`, {q, options});
  }

  async get(id: string): Promise<TimeStamp<T> | null> {
    return await fetchJSON(`/api/${this.name}/${id}`);
  }

  async create(entry: T): Promise<{id: string}> {
    return await fetchJSON(`/api/${this.name}/`, entry, "PUT");
  }

  async getSafeId(title?: string) {
    return await fetchJSON(`/api/${this.name}/safeId`, {title}, "GET");
  }

  async update(id: string, update: Partial<T>) {
    return await fetchJSON(`/api/${this.name}/${id}`, update, "PUT");
  }

  async delete(id: string) {
    return await fetchJSON(`/api/${this.name}/${id}`, null, "DELETE");
  }

  async addTag(id: string, tag: string[]) {
    return await fetchJSON(`/api/${this.name}/${id}/tag`, {tag}, "PUT");
  }

  async removeTag(id: string, tag: string[]) {
    return await fetchJSON(`/api/${this.name}/${id}/tag`, {tag}, "PUT");
  }
}

export default class Database {
  cols: {
    // user: Collection<IUser>;
    post: Collection<IPost>;
    media: Collection<IMedia>;
  }

  constructor() {
    this.cols = {
      // user: new Collection("user"),
      post: new Collection("post"),
      media: new Collection("media")
    }
  }

  async uploadMedia(data: File, tag?: string[]) {
    const ORIGIN = `http://localhost:${PORT || location.port}`;
    const formData = new FormData();
    formData.append("file", data);
    formData.append("tag", tag ? JSON.stringify(tag) : "");
    const r = await fetch(`${ORIGIN}/api/media/`, {
      method: "PUT",
      body: formData
    }).then((r) => r.json());

    return `${ORIGIN}/api/media/${r.id}`;
  }
}

const fetchJSON = async (url: string, data?: Record<string, any> | null, method: string = "POST") => {
  const ORIGIN = `http://localhost:${PORT || location.port}`;
  let r: Response;
  if (method !== "GET") {
    r = await fetch(new URL(url, ORIGIN).href, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: data ? JSON.stringify(data) : undefined
    });
  } else {
    const newUrl = new URL(url, ORIGIN);
    if (data) {
      for (const [k, v] of Object.entries<string>(data)) {
        if (v) {
          newUrl.searchParams.set(k, v);
        }
      }
    }
    r = await fetch(newUrl.href);
  }

  try {
    return await r.json();
  } catch(e) {
    return r;
  }
}