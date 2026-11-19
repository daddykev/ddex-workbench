// packages/sdk/test/client.test.ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { DDEXClient, NetworkError, RateLimitError, SDK_VERSION } from "../src";
import pkg from "../package.json";

type Reply = { status: number; data?: unknown; headers?: Record<string, string> } | "network";

/**
 * Point the client's axios instance at a fake adapter that plays back the
 * given replies in order (the last one repeats). Returns the call counter.
 */
function stub(client: DDEXClient, replies: Reply[]) {
  const calls: InternalAxiosRequestConfig[] = [];
  const instance = (client as unknown as { client: { defaults: { adapter: unknown } } }).client;
  instance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    calls.push(config);
    const reply = replies[Math.min(calls.length - 1, replies.length - 1)];
    if (reply === "network") {
      throw new AxiosError("socket hang up", "ECONNRESET", config);
    }
    const response = {
      data: reply.data ?? {},
      status: reply.status,
      statusText: String(reply.status),
      headers: AxiosHeaders.from(reply.headers ?? {}),
      config,
    };
    if (reply.status >= 400) {
      throw new AxiosError(
        `Request failed with status code ${reply.status}`,
        AxiosError.ERR_BAD_REQUEST,
        config,
        undefined,
        response,
      );
    }
    return response;
  };
  return calls;
}

const VALID_RESULT = {
  valid: true,
  errors: [],
  warnings: [],
  metadata: {
    processingTime: 1,
    schemaVersion: "ERN 4.3",
    validatedAt: "2026-11-18T00:00:00.000Z",
    errorCount: 0,
    warningCount: 0,
    validationSteps: [],
  },
};

const RATE_LIMIT_HEADERS = {
  "RateLimit-Policy": "10;w=60",
  "RateLimit-Limit": "10",
  "RateLimit-Remaining": "0",
  "RateLimit-Reset": "60",
  "Retry-After": "60",
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("429 handling", () => {
  it("throws RateLimitError immediately without retrying", async () => {
    const client = new DDEXClient({ maxRetries: 3, retryDelay: 1 });
    const calls = stub(client, [
      {
        status: 429,
        headers: RATE_LIMIT_HEADERS,
        data: {
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Rate limit exceeded (10 requests per minute).",
            retryAfter: 42,
          },
        },
      },
    ]);

    const err = await client.validate("<xml/>", { version: "4.3" }).catch((e) => e);

    expect(err).toBeInstanceOf(RateLimitError);
    expect(calls).toHaveLength(1);
    expect(err.message).toBe("Rate limit exceeded (10 requests per minute).");
    // Body's error.retryAfter wins over the Retry-After header
    expect(err.retryAfter).toBe(42);
    expect(err.limit).toBe(10);
    expect(err.remaining).toBe(0);
    expect(err.reset).toBe(60);
    expect(err.policy).toBe("10;w=60");
  });

  it("falls back to the Retry-After header when the body has no retryAfter", async () => {
    const client = new DDEXClient({ retryDelay: 1 });
    stub(client, [{ status: 429, headers: { "Retry-After": "17" }, data: { error: { message: "slow down" } } }]);

    const err = await client.validate("<xml/>", { version: "4.3" }).catch((e) => e);

    expect(err).toBeInstanceOf(RateLimitError);
    expect(err.retryAfter).toBe(17);
    expect(err.limit).toBeUndefined();
  });

  it("ignores legacy X-RateLimit-* headers", async () => {
    const client = new DDEXClient({ retryDelay: 1 });
    stub(client, [
      {
        status: 429,
        headers: { "X-RateLimit-Limit": "100", "X-RateLimit-Remaining": "5" },
        data: { error: { message: "slow down", retryAfter: 5 } },
      },
    ]);

    const err = await client.validate("<xml/>", { version: "4.3" }).catch((e) => e);

    expect(err.limit).toBeUndefined();
    expect(err.remaining).toBeUndefined();
  });

  it("defaults retryAfter to 60 when neither body nor header has it", async () => {
    const client = new DDEXClient({ retryDelay: 1 });
    stub(client, [{ status: 429 }]);

    const err = await client.validate("<xml/>", { version: "4.3" }).catch((e) => e);

    expect(err.retryAfter).toBe(60);
  });
});

describe("retries", () => {
  it("retries 5xx with backoff and then succeeds", async () => {
    const client = new DDEXClient({ maxRetries: 3, retryDelay: 1 });
    const calls = stub(client, [{ status: 503 }, "network", { status: 200, data: VALID_RESULT }]);

    const result = await client.validate("<xml/>", { version: "4.3" });

    expect(result.valid).toBe(true);
    expect(calls).toHaveLength(3);
  });

  it("gives up after maxRetries and throws NetworkError", async () => {
    const client = new DDEXClient({ maxRetries: 2, retryDelay: 1 });
    const calls = stub(client, [{ status: 500 }]);

    const err = await client.validate("<xml/>", { version: "4.3" }).catch((e) => e);

    expect(err).toBeInstanceOf(NetworkError);
    expect(calls).toHaveLength(3); // first try + 2 retries
  });

  it("uses exponential backoff with jitter", () => {
    const client = new DDEXClient({ retryDelay: 1000 });
    const getRetryDelay = (n: number) =>
      (client as unknown as { getRetryDelay(n: number): number }).getRetryDelay(n);

    vi.spyOn(Math, "random").mockReturnValue(0);
    expect([0, 1, 2].map(getRetryDelay)).toEqual([500, 1000, 2000]);

    vi.spyOn(Math, "random").mockReturnValue(0.999999);
    expect(getRetryDelay(0)).toBeCloseTo(1000, 0);
    expect(getRetryDelay(10)).toBeLessThanOrEqual(30000);
  });
});

describe("request body", () => {
  it("does not send deprecated verbose or customRules options", async () => {
    const client = new DDEXClient();
    const calls = stub(client, [{ status: 200, data: VALID_RESULT }]);

    await client.validate("<xml/>", {
      version: "4.3",
      profile: "AudioAlbum",
      verbose: true,
      customRules: [],
    });

    const body = JSON.parse(calls[0].data as string);
    expect(body).toEqual({ content: "<xml/>", type: "ERN", version: "4.3", profile: "AudioAlbum" });
  });
});

describe("client identification", () => {
  it("sends a User-Agent with the package version in Node", async () => {
    expect(SDK_VERSION).toBe(pkg.version);
    const client = new DDEXClient();
    const calls = stub(client, [{ status: 200, data: VALID_RESULT }]);

    await client.validate("<xml/>", { version: "4.3" });

    const headers = AxiosHeaders.from(calls[0].headers);
    expect(headers.get("User-Agent")).toMatch(new RegExp(`^ddex-workbench-sdk/${pkg.version} \\(node/`));
    expect(headers.has("X-Client")).toBe(false);
  });

  it("sends X-Client instead of User-Agent in a browser", async () => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("document", {});
    try {
      const client = new DDEXClient();
      const calls = stub(client, [{ status: 200, data: VALID_RESULT }]);

      await client.validate("<xml/>", { version: "4.3" });

      const headers = AxiosHeaders.from(calls[0].headers);
      expect(headers.get("X-Client")).toMatch(new RegExp(`^ddex-workbench-sdk/${pkg.version} \\(browser/`));
      expect(headers.has("User-Agent")).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe("DDEXValidator", () => {
  it("parseSVRL counts failed-assert elements by role", () => {
    const client = new DDEXClient();
    const svrl = `<?xml version="1.0" encoding="UTF-8"?><svrl:schematron-output xmlns:svrl="http://purl.oclc.org/dsdl/svrl" schemaVersion="4.3">
      <svrl:failed-assert test="a" location="/x" role="error"><svrl:text>e1</svrl:text></svrl:failed-assert>
      <svrl:failed-assert test="b" location="/x" role="fatal"><svrl:text>e2</svrl:text></svrl:failed-assert>
      <svrl:failed-assert test="c" location="/x"><svrl:text>e3</svrl:text></svrl:failed-assert>
      <svrl:failed-assert test="d" location="/x" role="warning"><svrl:text>w1</svrl:text></svrl:failed-assert>
      <svrl:failed-assert test="e" location="/x" role="info"><svrl:text>i1</svrl:text></svrl:failed-assert>
      <svrl:fired-rule context="document" role="warning"/>
    </svrl:schematron-output>`;

    expect(client.validator.parseSVRL(svrl)).toMatchObject({
      assertions: 5,
      failures: 3,
      warnings: 2,
      firedRules: 1,
      schemaVersion: "4.3",
    });
  });

  it("generateSummary warns once that it is deprecated", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = new DDEXClient();

    client.validator.generateSummary(VALID_RESULT);
    client.validator.generateSummary(VALID_RESULT);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toMatch(/generateSummary\(\) is deprecated/);
  });
});

describe("deprecated key-management methods", () => {
  it("still call /keys, return the server's shape, and warn once each", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const client = new DDEXClient({ headers: { Authorization: "Bearer token" } });
    const listItem = {
      id: "k1",
      userId: "u1",
      name: "CI",
      created: "2026-11-01T00:00:00.000Z",
      lastUsed: null,
      requestCount: 3,
      rateLimit: 60,
      active: true,
    };
    const calls = stub(client, [
      { status: 200, data: [listItem] },
      { status: 200, data: [listItem] },
      { status: 200, data: { id: "k2", name: "New", key: "ddex_x", created: "2026-11-18T00:00:00.000Z", rateLimit: 60 } },
      { status: 204 },
    ]);

    const keys = await client.listApiKeys();
    await client.listApiKeys();
    const created = await client.createApiKey("New");
    await client.revokeApiKey("k2");

    expect(keys[0]).toEqual(listItem);
    expect(created.key).toBe("ddex_x");
    expect(calls.map((c) => `${c.method?.toUpperCase()} ${c.url}`)).toEqual([
      "GET /keys",
      "GET /keys",
      "POST /keys",
      "DELETE /keys/k2",
    ]);

    // One warning per method, not per call
    expect(warn).toHaveBeenCalledTimes(3);
    for (const call of warn.mock.calls) {
      expect(call[0]).toContain("isn't supported from the SDK");
      expect(call[0]).toContain("https://ddex-workbench.org/api-keys");
      expect(call[0]).toContain("removed in 2.0");
    }
  });
});
