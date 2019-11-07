import express from "express";
import { Database } from "./db";

const app = express();
const port = process.env.PORT || 24000;

const db = new Database(app);

(async () => {
  await db.init();
  // console.log(app._router.stack);

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  });
})().catch(console.error);
