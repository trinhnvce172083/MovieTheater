import { describe, it, expect, afterEach, jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Login from "@/app/auth/Login/page";

describe("Login", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should render login form", () => {
    render(<Login />);
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("Mock login form", async () => {
    render(<Login />);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "admin1" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "12345Aa@" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));
  });
});