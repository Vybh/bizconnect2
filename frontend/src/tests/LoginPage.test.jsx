import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "../pages/LoginPage.jsx";

vi.mock("../hooks/useLogin.js", () => ({
  useLogin: () => ({
    loginMutation: vi.fn(),
    isPending: false,
    error: null,
  }),
}));

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter>
      <QueryClientProvider client={qc}>
        <LoginPage />
      </QueryClientProvider>
    </MemoryRouter>
  );
}

describe("LoginPage", () => {
  it("renders email and password fields", () => {
    renderPage();
    expect(screen.getByPlaceholderText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your password/i)).toBeInTheDocument();
  });

  it("renders the sign in button", () => {
    renderPage();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty submit", async () => {
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("calls loginMutation with form data on valid submit", async () => {
    const loginMutation = vi.fn();
    vi.doMock("../hooks/useLogin.js", () => ({
      useLogin: () => ({ loginMutation, isPending: false, error: null }),
    }));

    renderPage();
    await userEvent.type(screen.getByPlaceholderText(/john@example.com/i), "test@test.com");
    await userEvent.type(screen.getByPlaceholderText(/your password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));
  });
});
