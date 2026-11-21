// packages/sdk/test/validator.test.ts
import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from "axios";
import { DDEXClient, DDEXError, ValidationError } from "../src";

type Reply = { status: number; data?: unknown };

/** Point the client's axios instance at a fake adapter that returns `reply`. */
function stub(client: DDEXClient, reply: Reply) {
  const instance = (client as unknown as { client: { defaults: { adapter: unknown } } }).client;
  instance.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    const response = {
      data: reply.data ?? {},
      status: reply.status,
      statusText: String(reply.status),
      headers: AxiosHeaders.from({}),
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
}

const root = (ns: string, extra = "") =>
  `<?xml version="1.0" encoding="UTF-8"?>\n<ern:NewReleaseMessage xmlns:ern="http://ddex.net/xml/ern/${ns}"${extra}/>`;

describe("detectVersion", () => {
  const { validator } = new DDEXClient();

  it.each([
    ["43", "4.3"],
    ["42", "4.2"],
    ["382", "3.8.2"],
    ["383", "3.8.3"],
  ])("detects the ern/%s namespace as %s", (ns, version) => {
    expect(validator.detectVersion(root(ns))).toBe(version);
  });

  it("detects 3.8.3 from MessageSchemaVersionId alone", () => {
    expect(validator.detectVersion('<NewReleaseMessage MessageSchemaVersionId="ern/383"/>')).toBe("3.8.3");
  });

  it("detects 3.8.3 from an xmlns:ernm namespace", () => {
    expect(
      validator.detectVersion('<ernm:NewReleaseMessage xmlns:ernm="http://ddex.net/xml/ern/383"/>'),
    ).toBe("3.8.3");
  });

  it("returns null for unknown input", () => {
    expect(validator.detectVersion("<Foo xmlns=\"http://example.com/other\"/>")).toBeNull();
    expect(validator.detectVersion("not xml")).toBeNull();
  });
});

describe("400 UNSUPPORTED_ERN_VERSION", () => {
  it("surfaces the API's message and code", async () => {
    const client = new DDEXClient({ maxRetries: 0 });
    const message = 'Version "3.8" is not supported. Supported versions: 4.3, 4.2, 3.8.3, 3.8.2';
    stub(client, {
      status: 400,
      data: { error: { code: "UNSUPPORTED_ERN_VERSION", message } },
    });

    const err = await client
      .validate("<x/>", { version: "3.8" as never })
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect(err).toBeInstanceOf(DDEXError);
    expect((err as ValidationError).message).toBe(message);
    expect((err as ValidationError).code).toBe("UNSUPPORTED_ERN_VERSION");
  });

  it("keeps VALIDATION_ERROR as the code when the API sends none", async () => {
    const client = new DDEXClient({ maxRetries: 0 });
    stub(client, { status: 400, data: { error: { message: "XML content is required" } } });

    const err = await client.validate("", { version: "4.3" }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ValidationError);
    expect((err as ValidationError).code).toBe("VALIDATION_ERROR");
  });
});

describe("valid result with warnings", () => {
  const warning = {
    line: 35,
    column: 0,
    message: '"US" is a valid territory code, but the published DDEX ERN 3.8.2 schema rejects every Nationality value here …',
    severity: "warning" as const,
    rule: "DDEX-Schema-Defect-Nationality",
  };
  const RESULT = {
    valid: true,
    errors: [],
    warnings: [warning],
    metadata: {
      processingTime: 1,
      schemaVersion: "ERN 3.8.2",
      validatedAt: "2026-11-20T00:00:00.000Z",
      errorCount: 0,
      warningCount: 1,
      validationSteps: [],
    },
  };

  it("stays valid through validate(), isValid() and validateAuto()", async () => {
    const client = new DDEXClient({ maxRetries: 0 });
    stub(client, { status: 200, data: RESULT });

    const result = await client.validate(root("382"), { version: "3.8.2" });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toEqual([warning]);

    expect(await client.validator.isValid(root("382"), { version: "3.8.2" })).toBe(true);
    expect((await client.validator.validateAuto(root("382"))).valid).toBe(true);
    expect(client.validator.getCriticalErrors(result)).toHaveLength(0);
  });
});
