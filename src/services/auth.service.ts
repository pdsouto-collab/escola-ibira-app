import { signIn, signOut } from "next-auth/react";
import { createUser } from "./user.service";

export const authService = {

  async register(data: any) {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(errorText || "Erro ao criar conta na Web");
    }
    return res.json();
  },

  async login(credentials: { email: string; password: string }) {
    const result = await signIn("credentials", {
      ...credentials,
      redirect: false,
    });

    if (result?.error) {
      throw new Error(result.error);
    }

    return result;
  },

  async logout() {
    return await signOut({ redirect: true, callbackUrl: "/login" });
  }
};
