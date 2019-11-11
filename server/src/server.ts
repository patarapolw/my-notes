import express, { Router } from "express";
import { Database } from "./db";
import history from "connect-history-api-fallback";
import "./config";
import "./auth";
import session from "express-session";
import passport from "passport";
import authRouter from "./routes/auth";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const port = process.env.PORT || 24000;
const db = new Database();

const isAsar = process.mainModule ? process.mainModule.filename.includes('app.asar') : false;
let isServerRunning = false;

app.use(session({
  secret: process.env.SECRET!,
  cookie: {},
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

(async () => {
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
