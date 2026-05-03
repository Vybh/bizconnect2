import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import SignupPage from "../pages/SignupPage.jsx";

const mockSignup = vi.fn();

vi.mock("../hooks/useSignup.js", () => ({
  useSignup: () => ({
    signupMutation: mockSignup,
    isPending: false,
    error: null,
  }),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <SignupPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("SignupPage", () => {
  it("renders all form fields", () => {
    renderPage();
    expect(screen.getByPlaceholderText(/john smith/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/min 6 characters/i)).toBeInTheDocument();
  });

  it("shows validation errors on empty submit", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/full name is required/i)).toBeInTheDocument();
    });
  });

  it("calls signupMutation with correct data on valid submit", async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText(/john smith/i), "Jane Doe");
    await userEvent.type(screen.getByPlaceholderText(/john@example.com/i), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText(/min 6 characters/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        fullName: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
      });
    });
  });

  it("shows short password validation error", async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText(/john smith/i), "Jane Doe");
    await userEvent.type(screen.getByPlaceholderText(/john@example.com/i), "jane@example.com");
    await userEvent.type(screen.getByPlaceholderText(/min 6 characters/i), "abc");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });
  });
});
