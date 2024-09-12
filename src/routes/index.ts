import { Hono } from "hono";
import { router as linksRouter } from "./link";
import { router as redirectRouter } from "./redirect";

const apiRouter = new Hono();

apiRouter.route("/links", linksRouter);

// The order of the routes is important here.
// We want to make sure that the redirect route is defined last.
apiRouter.route("/", redirectRouter);

export { apiRouter };
