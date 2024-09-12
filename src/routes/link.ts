import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import { nanoid } from "nanoid";
import { db } from "@/db";
import {
  insertLinkSchema,
  insertVisitSchema,
  links,
  updateLinkSchema,
  visits,
} from "@/db/schema";
import { eq } from "drizzle-orm";

const router = new Hono();

/**
 * @route POST /
 * @description Creates a new link or returns an existing one if the URL already exists.
 */
router.post("/", zValidator("json", insertLinkSchema), async (c) => {
  const data = c.req.valid("json");

  if (!data.url) {
    return c.json({ error: "URL is required" }, 400);
  }

  if (!data.slug) {
    // Check if the url is already in the database
    let existingLink = db
      .select()
      .from(links)
      .where(eq(links.url, data.url))
      .get();

    if (existingLink) {
      return c.json(existingLink, 200);
    }
  }

  let slug = data.slug || nanoid(6);

  // Check if the slug is already in the database
  let existingLink = db.select().from(links).where(eq(links.slug, slug)).get();

  if (existingLink) {
    return c.json({ error: "Slug already exists" }, 400);
  }

  try {
    const link = await db
      .insert(links)
      .values({
        ...data,
        id: nanoid(),
        slug,
      })
      .returning();

    return c.json(link[0], 201);
  } catch (error) {
    return c.json({ error: "Failed to create link", details: error }, 500);
  }
});

/**
 * @route PATCH /:id
 * @description Updates an existing link.
 */
router.patch("/:id", zValidator("json", updateLinkSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const link = db.select().from(links).where(eq(links.id, id)).get();

  if (!link) {
    return c.json({ error: "Link not found" }, 404);
  }

  if (data.slug) {
    const existingLink = db
      .select()
      .from(links)
      .where(eq(links.slug, data.slug))
      .get();

    if (existingLink) {
      return c.json({ error: "Slug already exists" }, 400);
    }
  }

  try {
    const updatedLink = await db
      .update(links)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(links.id, id))
      .returning();

    return c.json(updatedLink[0], 200);
  } catch (error) {
    return c.json({ error: "Failed to update link", details: error }, 500);
  }
});

/**
 * @route GET /
 * @description Retrieves all links or a specific link by slug.
 */
router.get(
  "/",
  zValidator(
    "query",
    z
      .object({
        slug: z.string(),
      })
      .partial()
  ),
  async (c) => {
    const { slug } = c.req.valid("query");

    if (slug) {
      const allLinks = db
        .select()
        .from(links)
        .where(eq(links.slug, slug))
        .all();

      if (allLinks.length === 0) {
        return c.json({ error: "Link not found" }, 404);
      }

      if (allLinks.length > 1) {
        return c.json({ error: "Multiple links found" }, 404);
      }

      const link = allLinks[0];

      return c.json(link);
    }

    const allLinks = db.select().from(links).all();

    return c.json(allLinks);
  }
);

/**
 * @route GET /:id
 * @description Retrieves a specific link by ID.
 */
router.get("/:id", async (c) => {
  const id = c.req.param("id");

  const link = db.select().from(links).where(eq(links.id, id)).get();

  if (!link) {
    return c.json({ error: "Link not found" }, 404);
  }

  return c.json(link);
});

/**
 * @route DELETE /:id
 * @description Deletes a specific link by ID.
 */
router.delete("/:id", async (c) => {
  const id = c.req.param("id");

  const link = db.select().from(links).where(eq(links.id, id)).get();

  if (!link) {
    return c.json({ error: "Link not found" }, 404);
  }

  try {
    await db.delete(links).where(eq(links.id, id));

    return c.json({ message: "Link deleted" }, 200);
  } catch (error) {
    return c.json({ error: "Failed to delete link", details: error }, 500);
  }
});

// Visits
/**
 * @route GET /:id/visits
 * @description Retrieves all visits for a specific link.
 */
router.get("/:id/visits", async (c) => {
  const id = c.req.param("id");

  const link = db.select().from(links).where(eq(links.id, id)).get();

  if (!link) {
    return c.json({ error: "Link not found" }, 404);
  }

  const linkVisits = db
    .select()
    .from(visits)
    .where(eq(visits.linkId, id))
    .all();

  return c.json(linkVisits);
});

/**
 * @route GET /:id/visits/:visitId
 * @description Retrieves a specific visit for a link.
 */
router.get("/:id/visits/:visitId", async (c) => {
  const id = c.req.param("id");
  const visitId = c.req.param("visitId");

  const link = db.select().from(links).where(eq(links.id, id)).get();

  if (!link) {
    return c.json({ error: "Link not found" }, 404);
  }

  const visit = db.select().from(visits).where(eq(visits.id, visitId)).get();

  if (!visit) {
    return c.json({ error: "Visit not found" }, 404);
  }

  return c.json(visit);
});

export { router };
