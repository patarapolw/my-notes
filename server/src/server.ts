import express, { Router } from "express";
import { Database, StoragePouchDB } from "./db";
import history from "connect-history-api-fallback";
import "./config";
import "./auth";
import session from "express-session";
import passport from "passport";
import authRouter from "./routes/auth";
import bodyParser from "body-parser";
import cors from "cors";
import { PORT, SECRET, CONFIG } from "./config";
import { generateSecret } from "./util";
import PouchSession from "session-pouchdb-store";

const app = express();
const db = new Database();

const isAsar = process.mainModule ? process.mainModule.filename.includes('app.asar') : false;
let isServerRunning = false;

(async () => {
  let secret = SECRET;
  if (!secret) {
    secret = await generateSecret();
    CONFIG.set("SECRET", secret);
  }

  app.use(session({
    secret,
    cookie: {},
    resave: false,
    saveUninitialized: true,
    store: new PouchSession(new StoragePouchDB("session"))
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());

  const apiRouter = Router();

  apiRouter.use(bodyParser.json());
  apiRouter.use(cors({
    origin: /\/\/localhost/
  }));
  apiRouter.post("/", (req, res) => {
    const { PORT } = process.env;
    return res.json({ PORT });
  })

  await db.init(apiRouter);

  app.use("/api", apiRouter);
  app.use("/api", authRouter);

  app.use(history({
    rewrites: [{ from: /^\/reveal/, to: '/reveal.html' }]
  }));
  
  app.use(express.static(isAsar ? `public` : `../electron/public`));

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
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
