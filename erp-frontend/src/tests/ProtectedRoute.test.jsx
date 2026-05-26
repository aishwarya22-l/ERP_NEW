import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../routes/ProtectedRoute";

// Mock AuthContext so we control user/authLoading state per test
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from "../context/AuthContext";

const renderWithRouter = (ui, { initialPath = "/protected" } = {}) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<div>Home / Login</div>} />
        <Route path="/protected" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe("ProtectedRoute", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders nothing while auth is loading", () => {
    useAuth.mockReturnValue({ user: null, authLoading: true });

    const { container } = renderWithRouter(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("redirects to / when user is not authenticated", () => {
    useAuth.mockReturnValue({ user: null, authLoading: false });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Home / Login")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("renders children when user is authenticated and no roles required", () => {
    useAuth.mockReturnValue({ user: { id: 1, role: "employee" }, authLoading: false });

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("renders children when user role matches an allowed role", () => {
    useAuth.mockReturnValue({ user: { id: 2, role: "admin" }, authLoading: false });

    renderWithRouter(
      <ProtectedRoute roles={["admin", "manager"]}>
        <div>Admin area</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Admin area")).toBeInTheDocument();
  });

  it("redirects to / when user role is not in allowed roles", () => {
    useAuth.mockReturnValue({ user: { id: 3, role: "employee" }, authLoading: false });

    renderWithRouter(
      <ProtectedRoute roles={["admin"]}>
        <div>Admin area</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Home / Login")).toBeInTheDocument();
    expect(screen.queryByText("Admin area")).not.toBeInTheDocument();
  });

  it("is case-insensitive: role 'Admin' matches roles=['admin']", () => {
    useAuth.mockReturnValue({ user: { id: 4, role: "Admin" }, authLoading: false });

    renderWithRouter(
      <ProtectedRoute roles={["admin"]}>
        <div>Case test</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Case test")).toBeInTheDocument();
  });
});
