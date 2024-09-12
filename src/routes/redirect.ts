import { Hono } from "hono";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { links, visits, selectLinkSchema } from "@/db/schema";
import { eq } from "drizzle-orm";

const router = new Hono();

/**
 * @route GET /:slug
 * @description Redirects to the URL associated with the given slug.
 */
router.get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  const link = selectLinkSchema.parse(
    db.select().from(links).where(eq(links.slug, slug)).get()
  );

  if (!link) {
    return c.json({ error: "Link not found" }, 404);
  }

  if (link.expiresAt && link.expiresAt < new Date()) {
    return c.json({ error: "Link has expired" }, 410);
  }

  try {
    await db.insert(visits).values({
      id: nanoid(),
      linkId: link.id,
    });

    return c.redirect(link.url);
  } catch (error) {
    return c.json({ error: "Failed to track visit", details: error }, 500);
  }
});

export { router };
