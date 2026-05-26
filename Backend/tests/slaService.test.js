import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// --- computeDueAt: pure function, no mocks ---
// Import directly since computeDueAt has no external dependencies
const { computeDueAt } = await import("../services/slaService.js");

describe("computeDueAt", () => {
  const expectHoursFromNow = (date, expectedHours) => {
    const diffHours = (date.getTime() - Date.now()) / 1000 / 60 / 60;
    // Allow ±0.1h tolerance for test execution time
    expect(diffHours).toBeGreaterThan(expectedHours - 0.1);
    expect(diffHours).toBeLessThanOrEqual(expectedHours + 0.1);
  };

  it('returns due date ~4 hours from now for "urgent"', () => {
    expectHoursFromNow(computeDueAt("urgent"), 4);
  });

  it('returns due date ~8 hours from now for "high"', () => {
    expectHoursFromNow(computeDueAt("high"), 8);
  });

  it('returns due date ~24 hours from now for "medium"', () => {
    expectHoursFromNow(computeDueAt("medium"), 24);
  });

  it('returns due date ~72 hours from now for "low"', () => {
    expectHoursFromNow(computeDueAt("low"), 72);
  });

  it("defaults to 24 hours for an unknown priority", () => {
    expectHoursFromNow(computeDueAt("unknown"), 24);
    expectHoursFromNow(computeDueAt(undefined), 24);
  });

  it("returns a Date object", () => {
    expect(computeDueAt("medium")).toBeInstanceOf(Date);
  });
});

// --- checkEscalations: mocked DB ---

let mockQuery;

jest.unstable_mockModule("../config/db.js", () => ({
  default: { query: (...args) => mockQuery(...args) },
}));

const { checkEscalations } = await import("../services/slaService.js?escalation=1");

describe("checkEscalations", () => {
  beforeEach(() => {
    mockQuery = jest.fn().mockResolvedValue([{ affectedRows: 0 }]);
  });

  it("calls db.query with an UPDATE statement targeting tickets", async () => {
    await checkEscalations();
    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/UPDATE tickets/i);
    expect(sql).toMatch(/escalated/i);
    expect(sql).toMatch(/'escalated'/i);
  });

  it("resolves without throwing when db.query rejects", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB connection lost"));
    await expect(checkEscalations()).resolves.toBeUndefined();
  });
});
