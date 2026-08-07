import test from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../server.js";

test("chat endpoint rate limits repeated requests per IP", async () => {
  const { app } = createApp({
    embedOnStartup: false,
    rateLimit: {
      maxRequests: 3,
      windowMs: 60_000,
    },
  });

  const server = app.listen(0);

  await new Promise((resolve) => server.once("listening", resolve));
  const port = server.address().port;

  try {
    for (let i = 0; i < 5; i += 1) {
      const response = await fetch(`http://127.0.0.1:${port}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Tell me about the resume" }),
      });

      if (response.status === 429) {
        assert.equal(response.status, 429);
        const body = await response.json();
        assert.match(body.error, /Too many requests/i);
        return;
      }
    }

    assert.fail("Expected a rate-limit response after repeated requests.");
  } finally {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
