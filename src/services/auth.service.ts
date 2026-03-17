import { signIn, signOut } from "next-auth/react";
import { createUser } from "./user.service";

export const authService = {
  async register(data: any) {
    return await createUser(data);
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
