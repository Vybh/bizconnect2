import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import FriendCard from "../components/FriendCard.jsx";

const mockUser = {
  _id: "123",
  fullName: "Alice Smith",
  profilePic: "https://example.com/pic.jpg",
  industry: "Technology",
  location: "New York",
  description: "Senior software engineer with 10 years of experience.",
  rating: 4.8,
  pricing: 150,
  experienceYears: 10,
};

function renderCard(user = mockUser) {
  return render(
    <MemoryRouter>
      <FriendCard user={user} />
    </MemoryRouter>
  );
}

describe("FriendCard", () => {
  it("renders the user name", () => {
    renderCard();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("renders the industry badge", () => {
    renderCard();
    expect(screen.getByText("Technology")).toBeInTheDocument();
  });

  it("renders the location", () => {
    renderCard();
    expect(screen.getByText("New York")).toBeInTheDocument();
  });

  it("renders truncated description", () => {
    renderCard();
    expect(screen.getByText(/Senior software engineer/)).toBeInTheDocument();
  });

  it("renders a message link pointing to /chat/:id", () => {
    renderCard();
    const link = screen.getByRole("link", { name: /message/i });
    expect(link).toHaveAttribute("href", "/chat/123");
  });

  it("renders rating", () => {
    renderCard();
    expect(screen.getByText("4.8")).toBeInTheDocument();
  });
});
