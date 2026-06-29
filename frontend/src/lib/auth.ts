export interface UserInfo {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "PROCUREMENT" | "MANAGER" | "EMPLOYEE" | "SUPPLIER";
  accountStatus: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  emailVerified: boolean;
  message: string;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function getStoredUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch("http://localhost:8082/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearAuth();
      return null;
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data));
    return data.token;
  } catch {
    clearAuth();
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  removeCookie("token");
  removeCookie("user");
}

export function isAuthenticated(): boolean {
  const user = getStoredUser();
  const token = getStoredToken();
  return !!(user && token && user.accountStatus === "APPROVED");
}

export function isAdmin(): boolean {
  const user = getStoredUser();
  return user?.role === "ADMIN";
}

export function hasRole(role: string): boolean {
  const user = getStoredUser();
  return user?.role === role;
}

function setCookie(name: string, value: string, days: number = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function removeCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export async function login(email: string, password: string) {
  const res = await fetch("http://localhost:8082/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, error: data.error || "Login failed", accountStatus: null };
  }

  localStorage.setItem("token", data.token || "");
  localStorage.setItem("refreshToken", data.refreshToken || "");
  localStorage.setItem("user", JSON.stringify(data));
  setCookie("token", data.token || "");
  setCookie("user", JSON.stringify(data));

  if (data.accountStatus !== "APPROVED") {
    return { ok: false, error: data.message || "Account not approved", accountStatus: data.accountStatus };
  }

  return { ok: true, error: null, accountStatus: data.accountStatus };
}

export async function register(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}) {
  const res = await fetch("http://localhost:8082/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();

  if (!res.ok) {
    return { ok: false, error: json.error || "Registration failed", details: json.details };
  }

  localStorage.setItem("user", JSON.stringify(json));
  return { ok: true, error: null, data: json };
}

export async function oauthLogin(provider: string, oauthToken: string, email: string, firstName: string, lastName: string) {
  const res = await fetch("http://localhost:8082/api/auth/oauth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, oauthToken, email, firstName, lastName }),
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, error: data.error || "OAuth login failed", accountStatus: null };
  }

  localStorage.setItem("token", data.token || "");
  localStorage.setItem("refreshToken", data.refreshToken || "");
  localStorage.setItem("user", JSON.stringify(data));
  setCookie("token", data.token || "");
  setCookie("user", JSON.stringify(data));

  if (data.accountStatus !== "APPROVED") {
    return { ok: false, error: data.message || "Account not approved", accountStatus: data.accountStatus };
  }

  return { ok: true, error: null, accountStatus: data.accountStatus };
}
