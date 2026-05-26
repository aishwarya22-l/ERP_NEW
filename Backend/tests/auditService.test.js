import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mutable reference — the wrapper in the factory always delegates to the
// current value, so resetting mockQuery in beforeEach just works.
let mockQuery;

jest.unstable_mockModule("../config/db.js", () => ({
  default: { query: (...args) => mockQuery(...args) },
}));

const { logEvent } = await import("../services/auditService.js");

describe("auditService.logEvent", () => {
  const actor = { id: 1, name: "Alice", role: "admin" };

  beforeEach(() => {
    mockQuery = jest.fn().mockResolvedValue([{ insertId: 1 }]);
  });

  it("inserts correct actor fields when actor is provided", async () => {
    await logEvent(actor, "employee", 10, "create", null, { name: "Bob" });

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO audit_logs/i);
    expect(params[0]).toBe(1);       // actor_id
    expect(params[1]).toBe("Alice"); // actor_name
    expect(params[2]).toBe("admin"); // actor_role
  });

  it("inserts NULL for actor fields when actor is null", async () => {
    await logEvent(null, "asset", 5, "delete", { name: "Laptop" }, null);

    const [, params] = mockQuery.mock.calls[0];
    expect(params[0]).toBeNull(); // actor_id
    expect(params[1]).toBeNull(); // actor_name
    expect(params[2]).toBeNull(); // actor_role
  });

  it("JSON-stringifies beforeData and afterData", async () => {
    const before = { status: "open" };
    const after = { status: "closed" };
    await logEvent(actor, "ticket", 3, "update", before, after);

    const [, params] = mockQuery.mock.calls[0];
    expect(params[6]).toBe(JSON.stringify(before)); // before_data
    expect(params[7]).toBe(JSON.stringify(after));  // after_data
  });

  it("passes null for beforeData when it is null (create event)", async () => {
    await logEvent(actor, "employee", 8, "create", null, { name: "Carol" });

    const [, params] = mockQuery.mock.calls[0];
    expect(params[6]).toBeNull();                             // before_data
    expect(params[7]).toBe(JSON.stringify({ name: "Carol" })); // after_data
  });

  it("passes null for afterData when it is null (delete event)", async () => {
    await logEvent(actor, "asset", 2, "delete", { name: "Monitor" }, null);

    const [, params] = mockQuery.mock.calls[0];
    expect(params[6]).toBe(JSON.stringify({ name: "Monitor" })); // before_data
    expect(params[7]).toBeNull();                                 // after_data
  });

  it("resolves without throwing when DB insert fails", async () => {
    mockQuery.mockRejectedValueOnce(new Error("connection refused"));
    await expect(logEvent(actor, "ticket", 1, "update", {}, {})).resolves.toBeUndefined();
  });
});
