import "./reveal.scss";
import "./global";
import RevealMd from "@patarapolw/reveal-md";
import db from './db';
import { simpleTableExt, toExt, slideExt, speakExt, apiExt } from './lib/make-html';

const md = new RevealMd({
  markdown: [simpleTableExt, toExt, slideExt, speakExt, apiExt]
});

const url = new URL(location.href);
const id = url.searchParams.get("id");
if (id) {
  db.cols.post.get(id).then((r) => {
    if (r) {
      md.update(r.content);
    }
  })
}
