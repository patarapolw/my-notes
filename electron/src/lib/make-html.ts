import { createIndentedFilter } from "indented-filter";
import h from "hyperscript";
import showdown from "showdown";
import pug from "hyperpug";
import { PORT } from '@patarapolw/my-notes__db';

export const simpleTableExt = {
  type: "lang",
  filter(text: string) {
    const rowRegex = /(?:(?:^|\r?\n)(?:\| )?(?:(?:.* \| )+.+)*(?:.* \| )+.+(?: \|)?(?:$|\r?\n))+/m;

    text = text.replace(rowRegex, (p0) => {
      return h("table.table", p0.trim().split("\n").map((pi) => {
        pi = pi.trim().replace(/^|/, "").replace(/|$/, "")

        return h("tr", pi.split(" | ").map((x) => x.trim()).map((qi) => {
          return h("td", qi);
        }))
      })).outerHTML;
    });

    return text;
  }
};

export const toExt = {
  type: "lang",
  filter: createIndentedFilter("^^to", (s, attrs) => {
    let {url, ...params} = attrs;
    let q = []
    for (const [k, v] of Object.entries<string>(params)) {
      q.push(`${k}=${encodeURIComponent(v)}`);
    }

    if (q.length > 0) {
      url = `${url}?${q.join("&")}`;
    }

    return h("router-link", {attrs: {to: url}}, s).outerHTML;
  })
}

export const slideExt = {
  type: "lang",
  filter: createIndentedFilter("^^slide", (s, attrs) => {
    const a = document.createElement("a");
    const url = new URL("https://reveal-md.herokuapp.com/");
    let q = "";
    if (attrs.github) {
      q = `https://raw.githubusercontent.com/${attrs.github}/master/${s}`;
      a.innerText = `github/${attrs.github}/${s}`;
    } else {
      q = s;
      a.innerText = s;
    }

    url.searchParams.append("q", q);
    a.href = url.href; 
    a.title = s;
    a.target = "_blank";

    return a.outerHTML;
  })
}

export const speakExt = {
  type: "lang",
  filter: createIndentedFilter("^^speak", (s0, attrs) => {
    let {lang, s} = attrs;

    return h("span.v-link.v-speak", {attrs: {lang: lang || "zh", s: s || s0}}, s0).outerHTML;
  })
}

export const apiExtension = {
  type: "lang",
  regex: /(\(| )\/api\//g,
  replace: `$1http://localhost:${PORT}/api/`
}

export default class MakeHTML {
  mdConverter: showdown.Converter;
  pugConverter: (s: string) => string;

  constructor() {
    this.mdConverter = new showdown.Converter({
      extensions: [simpleTableExt, toExt, slideExt, speakExt, apiExtension]
    });
    this.mdConverter.setFlavor("github");

    const pugFilters = {
      markdown: (text: string) => {
        return this.mdConverter.makeHtml(text);
      }
    };

    this.pugConverter = pug.compile({ filters: pugFilters });
  }

  parse(text: string) {
    const raw = text;
    let lang = "";

    const commentLines: string[] = [];
    const contentLines: string[] = [];
    let isContent = true;

    for (const line of text.split("\n")) {
      isContent = true;

      if (contentLines.length === 0 && line.startsWith("// ")) {
        commentLines.push(line.substr(3));
        isContent = false;
      }

      if (lang && line.startsWith("```")) {
        break;
      }

      if (contentLines.length === 0 && line.startsWith("```")) {
        lang = line.substr(3);
        isContent = false;
      }

      if (isContent) {
        contentLines.push(line);
      }
    }

    lang = lang || "markdown";

    const comment = commentLines.join("\n");
    let html = contentLines.join("\n") || text;

    switch (lang) {
      case "markdown": html = this.mdConverter.makeHtml(html); break;
      case "html": break;
      case "pug": html = this.pugConverter(html); break;
      default:
        const pre = h("pre");
        pre.innerText = html;
        html = pre.outerHTML;
    }

    return { lang, comment, content: html, raw };
  }
}