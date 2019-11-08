import express from "express";
import Database from "./db";

const app = express();
const port = process.env.PORT || 24000;
const db = new Database();

let isServerRunning = false;

(async () => {
  await db.init(app);

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
    isServerRunning = true;
    process.send("isServerRunning");
  });
})().catch(console.error);

process.on("message", (data) => {
  if (data === "isServerRunning" && isServerRunning) {
    process.send("isServerRunning");
  }
});
