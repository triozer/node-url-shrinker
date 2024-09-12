import { describe, expect, it, beforeEach } from "bun:test";
import app from "../../src/index";
import { db } from "../../src/db";
import { links, visits } from "../../src/db/schema";

const TEST_URL = "http://localhost";

describe("URL Shortener API", () => {
  beforeEach(async () => {
    // Clear the database before each test
    await db.delete(visits);
    await db.delete(links);
  });

  describe("POST /links", () => {
    it("should create a new link", async () => {
      const req = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      });
      const res = await app.fetch(req);

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.url).toBe("https://example.com");
      expect(data.slug).toBeDefined();
    });

    it("should return an existing link if URL already exists", async () => {
      const firstReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      });
      const firstRes = await app.fetch(firstReq);
      const firstData = await firstRes.json();

      const secondReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      });
      const secondRes = await app.fetch(secondReq);
      const secondData = await secondRes.json();

      expect(secondRes.status).toBe(200);
      expect(secondData.id).toBe(firstData.id);
    });

    it("should return an error if slug already exists", async () => {
      const firstReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com", slug: "test" }),
      });
      await app.fetch(firstReq);

      const secondReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://another-example.com",
          slug: "test",
        }),
      });
      const res = await app.fetch(secondReq);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Slug already exists");
    });

    it("should return an error if URL is not provided", async () => {
      const req = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const res = await app.fetch(req);
      expect(res.status).toBe(400);
    });
  });

  describe("PATCH /links/:id", () => {
    it("should update an existing link", async () => {
      const createReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      });
      const createRes = await app.fetch(createReq);
      const createData = await createRes.json();

      const updateReq = new Request(`http://localhost/links/${createData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://updated-example.com" }),
      });
      const updateRes = await app.fetch(updateReq);

      expect(updateRes.status).toBe(200);
      const updateData = await updateRes.json();
      expect(updateData.url).toBe("https://updated-example.com");
    });

    it("should return an error if link not found", async () => {
      const req = new Request(`${TEST_URL}/links/non-existent-id`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      });
      const res = await app.fetch(req);

      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Link not found");
    });
  });

  describe("GET /links", () => {
    it("should retrieve all links", async () => {
      const firstReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example1.com" }),
      });
      await app.fetch(firstReq);

      const secondReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example2.com" }),
      });
      await app.fetch(secondReq);

      const getReq = new Request(`${TEST_URL}/links`);
      const res = await app.fetch(getReq);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBe(2);
    });

    it("should retrieve a specific link by slug", async () => {
      const createReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com", slug: "test-slug" }),
      });
      const createRes = await app.fetch(createReq);
      const createData = await createRes.json();

      const getReq = new Request(`${TEST_URL}/links?slug=test-slug`);
      const res = await app.fetch(getReq);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(createData.id);
    });
  });

  describe("GET /links/:id", () => {
    it("should retrieve a specific link by ID", async () => {
      const createReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      });
      const createRes = await app.fetch(createReq);
      const createData = await createRes.json();

      const getReq = new Request(`http://localhost/links/${createData.id}`);
      const res = await app.fetch(getReq);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(createData.id);
    });

    it("should return an error if link not found", async () => {
      const req = new Request(`${TEST_URL}/links/non-existent-id`);
      const res = await app.fetch(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Link not found");
    });
  });

  describe("DELETE /links/:id", () => {
    it("should delete a specific link", async () => {
      const createReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://example.com" }),
      });
      const createRes = await app.fetch(createReq);
      const createData = await createRes.json();

      const deleteReq = new Request(`http://localhost/links/${createData.id}`, {
        method: "DELETE",
      });
      const deleteRes = await app.fetch(deleteReq);
      expect(deleteRes.status).toBe(200);

      const getReq = new Request(`http://localhost/links/${createData.id}`);
      const getRes = await app.fetch(getReq);
      expect(getRes.status).toBe(404);
    });

    it("should return an error if link not found", async () => {
      const req = new Request(`${TEST_URL}/links/non-existent-id`, {
        method: "DELETE",
      });
      const res = await app.fetch(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Link not found");
    });
  });

  describe("GET /:slug (Redirect)", () => {
    it("should redirect to the correct URL", async () => {
      const createReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com",
          slug: "test-redirect",
        }),
      });
      await app.fetch(createReq);

      const redirectReq = new Request(`${TEST_URL}/test-redirect`, {
        redirect: "manual",
      });
      const res = await app.fetch(redirectReq);
      expect(res.status).toBe(302);
      expect(res.headers.get("Location")).toBe("https://example.com");
    });

    it("should return an error if link not found", async () => {
      const req = new Request(`${TEST_URL}/non-existent-slug`);
      const res = await app.fetch(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Link not found");
    });

    it("should return an error if link has expired", async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
      const createReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com",
          slug: "expired",
          expiresAt: pastDate,
        }),
      });
      await app.fetch(createReq);

      const expiredReq = new Request(`${TEST_URL}/expired`);
      const res = await app.fetch(expiredReq);
      expect(res.status).toBe(410);
      const data = await res.json();
      expect(data.error).toBe("Link has expired");
    });
  });

  describe("GET /links/:id/visits", () => {
    it("should retrieve all visits for a specific link", async () => {
      const createReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com",
          slug: "visit-test",
        }),
      });
      const createRes = await app.fetch(createReq);
      const createData = await createRes.json();

      // Simulate visits
      const visitReq1 = new Request(`${TEST_URL}/visit-test`, {
        redirect: "manual",
      });
      await app.fetch(visitReq1);
      const visitReq2 = new Request(`${TEST_URL}/visit-test`, {
        redirect: "manual",
      });
      await app.fetch(visitReq2);

      const getVisitsReq = new Request(
        `http://localhost/links/${createData.id}/visits`
      );
      const res = await app.fetch(getVisitsReq);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBe(2);
    });

    it("should return an error if link not found", async () => {
      const req = new Request(`${TEST_URL}/links/non-existent-id/visits`);
      const res = await app.fetch(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Link not found");
    });
  });

  describe("GET /links/:id/visits/:visitId", () => {
    it("should retrieve a specific visit for a link", async () => {
      const createReq = new Request(`${TEST_URL}/links`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: "https://example.com",
          slug: "specific-visit-test",
        }),
      });
      const createRes = await app.fetch(createReq);
      const createData = await createRes.json();

      // Simulate a visit
      const visitReq = new Request(`${TEST_URL}/specific-visit-test`, {
        redirect: "manual",
      });
      await app.fetch(visitReq);

      const getVisitsReq = new Request(
        `http://localhost/links/${createData.id}/visits`
      );
      const visitsRes = await app.fetch(getVisitsReq);
      const visitsData = await visitsRes.json();
      const visitId = visitsData[0].id;

      const getSpecificVisitReq = new Request(
        `http://localhost/links/${createData.id}/visits/${visitId}`
      );
      const res = await app.fetch(getSpecificVisitReq);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.id).toBe(visitId);
    });

    it("should return an error if link or visit not found", async () => {
      const req = new Request(
        "http://localhost/links/non-existent-id/visits/non-existent-visit-id"
      );
      const res = await app.fetch(req);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe("Link not found");
    });
  });
});
