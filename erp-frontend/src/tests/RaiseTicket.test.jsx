import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock API modules before importing the component
vi.mock("../api/maintenanceApi", () => ({
  createMaintenanceLog: vi.fn(),
}));

vi.mock("../api/assetApi", () => ({
  getAssets: vi.fn(),
  getAssignedAssets: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn() };
});

import { createMaintenanceLog } from "../api/maintenanceApi";
import { getAssets, getAssignedAssets } from "../api/assetApi";
import RaiseTicket from "../pages/employee/RaiseTicket";
import { MemoryRouter } from "react-router-dom";

const renderPage = () =>
  render(
    <MemoryRouter>
      <RaiseTicket />
    </MemoryRouter>
  );

const ASSETS = [
  { id: 1, name: "Laptop", asset_tag: "LT-001", status: "available" },
  { id: 2, name: "Monitor", asset_tag: "MN-002", status: "assigned" },
];

describe("RaiseTicket page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAssets.mockResolvedValue({ data: ASSETS });
    getAssignedAssets.mockResolvedValue([]);
  });

  it("renders the form with empty fields on mount", async () => {
    renderPage();
    expect(await screen.findByLabelText(/asset/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/issue description/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /raise ticket/i })).toBeInTheDocument();
  });

  it("loads and shows assets in the select dropdown", async () => {
    renderPage();
    const select = await screen.findByLabelText(/asset/i);
    expect(select).toContainElement(await screen.findByText("Laptop (LT-001)"));
    expect(select).toContainElement(screen.getByText("Monitor (MN-002)"));
  });

  it("shows error when submitted with no asset selected", async () => {
    renderPage();
    await screen.findByLabelText(/asset/i); // wait for mount
    await userEvent.click(screen.getByRole("button", { name: /raise ticket/i }));
    expect(await screen.findByText(/please select an asset/i)).toBeInTheDocument();
    expect(createMaintenanceLog).not.toHaveBeenCalled();
  });

  it("shows error when issue description is too short (< 5 chars)", async () => {
    renderPage();
    const select = await screen.findByLabelText(/asset/i);
    await userEvent.selectOptions(select, "1");
    await userEvent.type(screen.getByLabelText(/issue description/i), "Hi");
    await userEvent.click(screen.getByRole("button", { name: /raise ticket/i }));
    expect(await screen.findByText(/at least 5 characters/i)).toBeInTheDocument();
    expect(createMaintenanceLog).not.toHaveBeenCalled();
  });

  it("calls createMaintenanceLog with correct payload on valid submit", async () => {
    createMaintenanceLog.mockResolvedValue({ id: 99 });

    renderPage();
    const select = await screen.findByLabelText(/asset/i);
    await userEvent.selectOptions(select, "1");
    await userEvent.type(screen.getByLabelText(/issue description/i), "Screen is flickering badly");
    await userEvent.click(screen.getByRole("button", { name: /raise ticket/i }));

    await waitFor(() =>
      expect(createMaintenanceLog).toHaveBeenCalledWith({
        asset_id: 1,
        issue: "Screen is flickering badly",
        priority: "medium",
        maintenance_type: null,
      })
    );
  });

  it("shows success banner with ticket ID after successful submit", async () => {
    createMaintenanceLog.mockResolvedValue({ id: 99 });

    renderPage();
    const select = await screen.findByLabelText(/asset/i);
    await userEvent.selectOptions(select, "1");
    await userEvent.type(screen.getByLabelText(/issue description/i), "Screen is flickering badly");
    await userEvent.click(screen.getByRole("button", { name: /raise ticket/i }));

    expect(await screen.findByText(/ticket #99/i)).toBeInTheDocument();
  });

  it("shows API error message when submission fails", async () => {
    createMaintenanceLog.mockRejectedValue(new Error("Server error"));

    renderPage();
    const select = await screen.findByLabelText(/asset/i);
    await userEvent.selectOptions(select, "1");
    await userEvent.type(screen.getByLabelText(/issue description/i), "Something is broken here");
    await userEvent.click(screen.getByRole("button", { name: /raise ticket/i }));

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  it("disables the submit button while submitting", async () => {
    let resolve;
    createMaintenanceLog.mockImplementation(
      () => new Promise((res) => { resolve = res; })
    );

    renderPage();
    const select = await screen.findByLabelText(/asset/i);
    await userEvent.selectOptions(select, "1");
    await userEvent.type(screen.getByLabelText(/issue description/i), "Keyboard not working");

    await userEvent.click(screen.getByRole("button", { name: /raise ticket/i }));

    expect(screen.getByRole("button", { name: /submitting/i })).toBeDisabled();

    resolve({ id: 50 });
    await waitFor(() => expect(screen.getByRole("button", { name: /raise ticket/i })).not.toBeDisabled());
  });
});
