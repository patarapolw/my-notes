import express from "express";
import { Database } from "./db";
import { ROOT } from "../../config";
import history from "connect-history-api-fallback";

const app = express();
const port = process.env.PORT || 24000;

app.use(history({
  rewrites: [{ from: /\/reveal/, to: '/reveal.html' }]
}));

app.use(express.static(`${ROOT}/web/dist`));

const db = new Database();

(async () => {
  await db.init(app);

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  });
})().catch(console.error);
