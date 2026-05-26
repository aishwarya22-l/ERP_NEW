import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { isAuth, allowRoles, allowUserTypes } from "../middleware/auth.js";

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("isAuth middleware", () => {
  it("calls next() when session user is present", () => {
    const req = { session: { user: { id: 1, role: "admin" } } };
    const res = makeRes();
    const next = jest.fn();

    isAuth(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("responds 401 and does not call next() when session user is absent", () => {
    const req = { session: {} };
    const res = makeRes();
    const next = jest.fn();

    isAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: "Not logged in" }));
    expect(next).not.toHaveBeenCalled();
  });
});

describe("allowRoles middleware", () => {
  it("calls next() when user role matches an allowed role", () => {
    const req = { session: { user: { role: "admin" } } };
    const res = makeRes();
    const next = jest.fn();

    allowRoles("admin", "manager")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("responds 403 and does not call next() when role is not allowed", () => {
    const req = { session: { user: { role: "employee" } } };
    const res = makeRes();
    const next = jest.fn();

    allowRoles("admin", "manager")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("Access denied") }));
    expect(next).not.toHaveBeenCalled();
  });

  it("is case-insensitive: user role 'Admin' matches allowRoles('admin')", () => {
    const req = { session: { user: { role: "Admin" } } };
    const res = makeRes();
    const next = jest.fn();

    allowRoles("admin")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("is case-insensitive: allowRoles('MANAGER') matches role 'manager'", () => {
    const req = { session: { user: { role: "manager" } } };
    const res = makeRes();
    const next = jest.fn();

    allowRoles("MANAGER")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe("allowUserTypes middleware", () => {
  it("calls next() when userType matches", () => {
    const req = { session: { user: { userType: "internal" } } };
    const res = makeRes();
    const next = jest.fn();

    allowUserTypes("internal", "external")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it("responds 403 when userType does not match", () => {
    const req = { session: { user: { userType: "guest" } } };
    const res = makeRes();
    const next = jest.fn();

    allowUserTypes("internal")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
