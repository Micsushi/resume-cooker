import assert from "node:assert/strict";
import { test } from "node:test";
import {
  createAnthropicClient,
  createOpenRouterClient,
  createProviderClient,
  parseFindings
} from "./api-providers.mjs";

test("createProviderClient requires a key for anthropic", () => {
  assert.throws(
    () => createProviderClient({ provider: "anthropic", env: {} }),
    /ANTHROPIC_API_KEY/
  );
});

test("createProviderClient requires a key for openrouter", () => {
  assert.throws(
    () => createProviderClient({ provider: "openrouter", env: {} }),
    /OPENROUTER_API_KEY/
  );
});

test("createProviderClient rejects unknown providers", () => {
  assert.throws(
    () => createProviderClient({ provider: "mystery", env: {} }),
    /No API adapter implemented/
  );
});

test("parseFindings maps model JSON into normalized checks", () => {
  const text = 'noise [{"id":"x","severity":"high","status":"fail","evidence":"e"}] tail';
  const checks = parseFindings(text, "m", "openrouter");

  assert.equal(checks.length, 1);
  assert.equal(checks[0].severity, "high");
  assert.equal(checks[0].status, "fail");
  assert.equal(checks[0].provider, "openrouter");
  assert.equal(checks[0].content_left_machine, true);
});

test("parseFindings falls back to a warning on unparseable output", () => {
  const checks = parseFindings("not json at all", "m");

  assert.equal(checks[0].id, "api_review_unparseable");
  assert.equal(checks[0].status, "warning");
});

test("anthropic client posts to the API and parses findings via injected fetch", async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, init };
    return {
      ok: true,
      json: async () => ({
        content: [{ type: "text", text: '[{"id":"clarity","status":"warning","evidence":"e"}]' }]
      })
    };
  };

  const client = createAnthropicClient({ apiKey: "k", model: "test-model", fetchImpl });
  const checks = await client.review({ resumeText: "r", jdText: "j" });

  assert.match(captured.url, /api\.anthropic\.com/);
  assert.equal(captured.init.headers["x-api-key"], "k");
  assert.equal(checks[0].id, "clarity");
  assert.equal(checks[0].model, "test-model");
});

test("anthropic client raises on a non-ok response", async () => {
  const fetchImpl = async () => ({ ok: false, status: 429, text: async () => "slow down" });
  const client = createAnthropicClient({ apiKey: "k", fetchImpl });

  await assert.rejects(() => client.review({ resumeText: "r" }), /429/);
});

test("openrouter client posts chat completions and parses findings via injected fetch", async () => {
  let captured;
  const fetchImpl = async (url, init) => {
    captured = { url, init };
    return {
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '[{"id":"jd_fit","status":"warning","evidence":"e"}]'
            }
          }
        ]
      })
    };
  };

  const client = createOpenRouterClient({
    apiKey: "k",
    model: "openai/test",
    fetchImpl,
    referer: "https://example.invalid",
    title: "Resume Cooker Test"
  });
  const checks = await client.review({ resumeText: "r", jdText: "j" });

  assert.match(captured.url, /openrouter\.ai/);
  assert.equal(captured.init.headers.authorization, "Bearer k");
  assert.equal(captured.init.headers["http-referer"], "https://example.invalid");
  assert.equal(captured.init.headers["x-openrouter-title"], "Resume Cooker Test");
  assert.equal(checks[0].id, "jd_fit");
  assert.equal(checks[0].provider, "openrouter");
  assert.equal(checks[0].model, "openai/test");
});

test("openrouter client raises on a non-ok response", async () => {
  const fetchImpl = async () => ({ ok: false, status: 402, text: async () => "no credits" });
  const client = createOpenRouterClient({ apiKey: "k", fetchImpl });

  await assert.rejects(() => client.review({ resumeText: "r" }), /402/);
});
