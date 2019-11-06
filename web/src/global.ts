import { IUser } from '@my-notes/db';

declare global {
  interface Window {
    fetchJSON(url: string, data?: any, method?: string): Promise<Response>
  }
}

export const fetchJSON = async (url: string, data?: Record<string, any> | null, method: string = "POST") => {
  let r: Response;
  if (method !== "GET") {
    r = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: data ? JSON.stringify(data) : undefined
    });
  } else {
    const newUrl = new URL(url);
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

window.fetchJSON = fetchJSON;

export const g: {
  q: string;
  user: Partial<IUser>
} = {
  q: "",
  user: {}
};
