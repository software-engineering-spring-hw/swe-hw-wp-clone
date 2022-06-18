import { User } from "types/types";

type AuthOperationResponseUser = Omit<User, "email" | "password">;

type AuthOperationResponse = {
  user: AuthOperationResponseUser;
  token: string;
}

export function handleAuth(data: AuthOperationResponse) {
  const { token, user } = data;

  if (token && user) {
    localStorage.token = token;
    localStorage.loggedInUser = JSON.stringify(user);
    window.location.reload();
  }
}

export function getAuthData() {
  const { pathname } = window.location;
  const loggedInUser = localStorage.loggedInUser && JSON.parse(localStorage.loggedInUser);
  const isAuthenticated = Boolean(loggedInUser && localStorage.token);
  const isAuthForm = pathname === "/login" || pathname === "/register";
  return { loggedInUser, isAuthenticated, isAuthForm };
}

export function logout() {
  localStorage.clear();
  window.location.reload();
};