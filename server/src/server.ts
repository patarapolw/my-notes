import express from "express";
import { Database } from "./db";

const app = express();
const port = process.env.PORT || 24000;

const db = new Database(app);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
