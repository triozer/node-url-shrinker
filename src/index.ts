import { Hono } from "hono";
import { apiRouter } from "./routes";

const app = new Hono();

app.route("/", apiRouter);

export default app;
