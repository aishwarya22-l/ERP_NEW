import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import {
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
} from "../services/cacheService.js";

describe("cacheService", () => {
  const KEY = "test:key";

  afterEach(() => {
    cacheDel(KEY);
    cacheDelPattern("prefix:");
    cacheDelPattern("other:");
    jest.restoreAllMocks();
  });

  describe("cacheGet", () => {
    it("returns null for unknown key", () => {
      expect(cacheGet("does-not-exist")).toBeNull();
    });

    it("returns the stored value for a known key", () => {
      cacheSet(KEY, { foo: "bar" }, 60);
      expect(cacheGet(KEY)).toEqual({ foo: "bar" });
    });

    it("returns null and removes key after TTL expires", () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      cacheSet(KEY, "value", 10); // 10-second TTL

      // Advance time past TTL
      Date.now.mockReturnValue(now + 11_000);
      expect(cacheGet(KEY)).toBeNull();
    });
  });

  describe("cacheSet", () => {
    it("overwrites an existing key", () => {
      cacheSet(KEY, "first", 60);
      cacheSet(KEY, "second", 60);
      expect(cacheGet(KEY)).toBe("second");
    });

    it("defaults TTL to 60 seconds when not specified", () => {
      const now = Date.now();
      jest.spyOn(Date, "now").mockReturnValue(now);

      cacheSet(KEY, "val"); // default TTL = 60s

      Date.now.mockReturnValue(now + 59_000); // just before expiry
      expect(cacheGet(KEY)).toBe("val");

      Date.now.mockReturnValue(now + 61_000); // just after expiry
      expect(cacheGet(KEY)).toBeNull();
    });
  });

  describe("cacheDel", () => {
    it("removes a stored key", () => {
      cacheSet(KEY, "value", 60);
      cacheDel(KEY);
      expect(cacheGet(KEY)).toBeNull();
    });

    it("is a no-op for non-existent keys", () => {
      expect(() => cacheDel("ghost-key")).not.toThrow();
    });
  });

  describe("cacheDelPattern", () => {
    it("removes all keys starting with the prefix", () => {
      cacheSet("prefix:a", 1, 60);
      cacheSet("prefix:b", 2, 60);
      cacheSet("other:c", 3, 60);

      cacheDelPattern("prefix:");

      expect(cacheGet("prefix:a")).toBeNull();
      expect(cacheGet("prefix:b")).toBeNull();
      expect(cacheGet("other:c")).toBe(3); // untouched
    });

    it("is a no-op when no keys match the prefix", () => {
      cacheSet(KEY, "val", 60);
      cacheDelPattern("nomatch:");
      expect(cacheGet(KEY)).toBe("val");
    });
  });
});
