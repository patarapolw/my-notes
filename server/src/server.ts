import express from "express";
import { Database } from "./db";
import history from "connect-history-api-fallback";
import "./config";

const app = express();
const port = process.env.PORT || 24000;
const db = new Database();

const isAsar = process.mainModule ? process.mainModule.filename.includes('app.asar') : false;
let isServerRunning = false;

(async () => {
  await db.init(app);

  app.use(history({
    rewrites: [{ from: /^\/reveal/, to: '/reveal.html' }]
  }));
  
  app.use(express.static(isAsar ? `public` : `../electron/public`));

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    isServerRunning = true;
    if (process.send) {
      process.send("isServerRunning");
    }
  });
})().catch(console.error);

process.on("message", (data) => {
  if (data === "isServerRunning" && isServerRunning) {
    if (process.send) {
      process.send("isServerRunning");
    }
  }
});
