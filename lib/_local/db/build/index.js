export const PORT = (typeof process !== "undefined" ? process.env.PORT : null) || "24000";
export const ORIGIN = `http://localhost:${PORT}`;
class Collection {
    constructor(name) {
        this.name = name;
    }
    async find(q, options = {}) {
        return await fetchJSON(`/api/${this.name}/`, { q, options });
    }
    async get(id) {
        return await fetchJSON(`/api/${this.name}/${id}`);
    }
    async create(entry) {
        return await fetchJSON(`/api/${this.name}/`, entry, "PUT");
    }
    async getSafeId(title) {
        return await fetchJSON(`/api/${this.name}/safeId`, { title }, "GET");
    }
    async update(id, update) {
        return await fetchJSON(`/api/${this.name}/${id}`, update, "PUT");
    }
    async delete(id) {
        return await fetchJSON(`/api/${this.name}/${id}`, null, "DELETE");
    }
    async addTag(id, tag) {
        return await fetchJSON(`/api/${this.name}/${id}/tag`, { tag }, "PUT");
    }
    async removeTag(id, tag) {
        return await fetchJSON(`/api/${this.name}/${id}/tag`, { tag }, "PUT");
    }
}
export default class Database {
    constructor() {
        this.cols = {
            // user: new Collection("user"),
            post: new Collection("post"),
            media: new Collection("media")
        };
    }
    async uploadMedia(data, tag) {
        const formData = new FormData();
        formData.append("file", data);
        formData.append("tag", tag ? JSON.stringify(tag) : "");
        const r = await fetch("/api/media/", {
            method: "PUT",
            body: formData
        }).then((r) => r.json());
        return `/api/media/${r.id}`;
    }
}
const fetchJSON = async (url, data, method = "POST") => {
    let r;
    if (method !== "GET") {
        r = await fetch(new URL(url, ORIGIN).href, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: data ? JSON.stringify(data) : undefined
        });
    }
    else {
        const newUrl = new URL(url, ORIGIN);
        if (data) {
            for (const [k, v] of Object.entries(data)) {
                if (v) {
                    newUrl.searchParams.set(k, v);
                }
            }
        }
        r = await fetch(newUrl.href);
    }
    try {
        return await r.json();
    }
    catch (e) {
        return r;
    }
};
