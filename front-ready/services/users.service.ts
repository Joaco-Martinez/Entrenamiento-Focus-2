// src/services/users.service.ts
import { apiClient } from "./apiClient";

export type RegisterResponse = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "user" | "admin";
  subscriptionId: string | null;
  isPremium: boolean;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
};

export const usersService = {
  register: async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string
  ) => {
    return apiClient<RegisterResponse>("/users/register", {
      method: "POST",
      body: {
        email,
        password,
        firstName,
        lastName,
        phone,
      },
    });
  },
};
