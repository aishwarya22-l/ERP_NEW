import { describe, it, expect, beforeEach, jest } from "@jest/globals";

let mockQuery;
let mockNotifyUser;

jest.unstable_mockModule("../config/db.js", () => ({
  default: { query: (...args) => mockQuery(...args) },
}));

jest.unstable_mockModule("../sse.js", () => ({
  notifyUser: (...args) => mockNotifyUser(...args),
}));

const { send } = await import("../services/notificationService.js");

describe("notificationService.send", () => {
  beforeEach(() => {
    mockQuery = jest.fn().mockResolvedValue([{ insertId: 42 }]);
    mockNotifyUser = jest.fn();
  });

  it("inserts a notification row with correct params", async () => {
    await send(7, "ticket_update", "Updated", "Ticket #1 updated", "ticket", 1);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toMatch(/INSERT INTO notifications/i);
    expect(params).toEqual([7, "ticket_update", "Updated", "Ticket #1 updated", "ticket", 1]);
  });

  it("pushes a notification over SSE after DB insert", async () => {
    await send(7, "asset_assigned", "Asset assigned", "Laptop assigned to you", "assignment", 5);

    expect(mockNotifyUser).toHaveBeenCalledWith(
      7,
      "notification",
      expect.objectContaining({
        id: 42,
        type: "asset_assigned",
        title: "Asset assigned",
        message: "Laptop assigned to you",
        entity_type: "assignment",
        entity_id: 5,
        is_read: 0,
      })
    );
  });

  it("returns early without DB call when userId is falsy", async () => {
    await send(0, "ticket_update", "T", "M");
    await send(null, "ticket_update", "T", "M");
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockNotifyUser).not.toHaveBeenCalled();
  });

  it("resolves without throwing when DB insert fails", async () => {
    mockQuery.mockRejectedValueOnce(new Error("DB error"));
    await expect(send(7, "ticket_update", "T", "M")).resolves.toBeUndefined();
  });

  it("passes null for entityType and entityId when omitted", async () => {
    await send(3, "sla_breach", "SLA breached", "Ticket overdue");
    const [, params] = mockQuery.mock.calls[0];
    expect(params[4]).toBeNull(); // entityType
    expect(params[5]).toBeNull(); // entityId
  });
});
