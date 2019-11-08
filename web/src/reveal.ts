import "./reveal.scss";
import "./global";
import RevealMd from "@patarapolw/reveal-md";
import db from './db';
const md = new RevealMd();

const url = new URL(location.href);
const id = url.searchParams.get("id");
if (id) {
  db.cols.post.get(id).then((r) => {
    if (r) {
      md.update(r.content);
    }
  })
}
