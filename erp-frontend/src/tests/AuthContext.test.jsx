import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Simple consumer component that exposes auth state
const Consumer = ({ onReady }) => {
  const auth = useAuth();
  // Call onReady with the full auth object so tests can inspect it
  if (!auth.authLoading) onReady?.(auth);
  return (
    <div>
      {auth.authLoading ? "loading" : auth.user ? `user:${auth.user.name}` : "no-user"}
    </div>
  );
};

const renderAuth = (onReady) =>
  render(
    <AuthProvider>
      <Consumer onReady={onReady} />
    </AuthProvider>
  );

const makeFetch = (status, body) =>
  vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });

describe("AuthContext", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sets user from /auth/me on mount when response is ok", async () => {
    global.fetch = makeFetch(200, { id: 1, name: "Alice", role: "admin" });

    renderAuth();
    await waitFor(() => screen.getByText("user:Alice"));
  });

  it("leaves user null when /auth/me returns non-ok", async () => {
    global.fetch = makeFetch(401, { message: "Not logged in" });

    renderAuth();
    await waitFor(() => screen.getByText("no-user"));
  });

  it("leaves user null when fetch rejects (network error)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    renderAuth();
    await waitFor(() => screen.getByText("no-user"));
  });

  describe("login()", () => {
    it("sets user state and returns result on success", async () => {
      // First fetch is /auth/me (on mount), second is /auth/login
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve(null) }) // /auth/me
        .mockResolvedValueOnce({                                                  // /auth/login
          ok: true,
          json: () => Promise.resolve({ user: { id: 2, name: "Bob", role: "manager" } }),
        });

      let authRef;
      renderAuth((auth) => { authRef = auth; });

      await waitFor(() => expect(authRef).toBeDefined());

      let result;
      await act(async () => {
        result = await authRef.login({ email: "bob@example.com", password: "secret" });
      });

      expect(result).toEqual({ user: { id: 2, name: "Bob", role: "manager" } });
      await waitFor(() => screen.getByText("user:Bob"));
    });

    it("throws an Error with the server message on non-ok response", async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: false, json: () => Promise.resolve(null) }) // /auth/me
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ message: "Invalid credentials" }),
        });

      let authRef;
      renderAuth((auth) => { authRef = auth; });
      await waitFor(() => expect(authRef).toBeDefined());

      await expect(
        act(async () => { await authRef.login({ email: "x", password: "y" }); })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("logout()", () => {
    it("sets user to null and calls /auth/logout", async () => {
      global.fetch = vi.fn()
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 1, name: "Alice" }) }) // /auth/me
        .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }); // /auth/logout

      let authRef;
      renderAuth((auth) => { authRef = auth; });

      await waitFor(() => screen.getByText("user:Alice"));

      await act(async () => { await authRef.logout(); });

      await waitFor(() => screen.getByText("no-user"));

      const logoutCall = global.fetch.mock.calls.find(([url]) => url.includes("/auth/logout"));
      expect(logoutCall).toBeDefined();
      expect(logoutCall[1]).toMatchObject({ method: "POST" });
    });
  });
});
