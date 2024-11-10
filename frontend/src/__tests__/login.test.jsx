import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Login from "../routes/login/login";
import apiRequest from "../lib/apiRequest";

jest.mock("../lib/apiRequest");

describe("Login Component", () => {
  const mockUpdateUser = jest.fn();

  const renderComponent = () => {
    return render(
      <AuthContext.Provider value={{ updateUser: mockUpdateUser }}>
        <Router>
          <Login />
        </Router>
      </AuthContext.Provider>
    );
  };

  it("renders the login form", () => {
    renderComponent();
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });

  it("allows the user to input username and password", () => {
    renderComponent();
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  it("calls handleSubmit on form submission", async () => {
    apiRequest.post.mockResolvedValueOnce({ data: { id: 1, name: "Test User" } });

    renderComponent();
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledWith({ id: 1, name: "Test User" }));
  });

  it("displays an error message when login fails", async () => {
    apiRequest.post.mockRejectedValueOnce({
      response: { data: { message: "Invalid credentials" } },
    });

    renderComponent();
    const usernameInput = screen.getByPlaceholderText("Username");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Login" });

    fireEvent.change(usernameInput, { target: { value: "wronguser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(loginButton);

    await waitFor(() => expect(screen.getByText("Invalid credentials")).toBeInTheDocument());
  });
});
