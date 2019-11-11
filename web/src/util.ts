import router from './router';

declare global {
  interface Window {
    require: NodeRequire;
  }
}

const electron: typeof import("electron") | null = window.require ? window.require("electron") : null;

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
    const newUrl = new URL(url, location.origin);
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

export function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');  // $& means the whole matched string
}

export function normalizeArray(it: any): any {
  if (Array.isArray(it)) {
    return it[0];
  }

  return it;
}

export function speak(s: string, lang: string = "zh-CN", rate: number = 0.8) {
  const allVoices = speechSynthesis.getVoices();
  let vs = allVoices.filter((v) => v.lang === lang);
  if (vs.length === 0) {
    const m1 = lang.substr(0, 2);
    const m2 = lang.substr(3, 2);
    const r1 = new RegExp(`^${m1}[-_]${m2}`, "i");

    vs = allVoices.filter((v) => r1.test(v.lang));
    if (vs.length === 0) {
      const r2 = new RegExp(`^${m1}`, "i");
      vs = allVoices.filter((v) => r2.test(v.lang));
    }
  }

  if (vs.length > 0) {
    const u = new SpeechSynthesisUtterance(s);
    u.lang = vs[0].lang;
    u.rate = rate || 0.8;
    speechSynthesis.speak(u);
  }
}

export function setTitle(s?: string) {
  document.getElementsByTagName("title")[0].innerText = s || "";
}

export function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export function openInNewWindow(url: string) {
  if (url.startsWith("#")) {
    if (electron) {
      router.push(url.slice(1));
      return;
    }
  }

  if (/\/\/localhost/.test(url)) {
    if (electron) {
      location.href = url;
      return;
    }
  } else {
    if (electron) {
      const { shell } = electron;
      shell.openExternal(url);
      return;
    }
  }

  open(url, "_blank");
}