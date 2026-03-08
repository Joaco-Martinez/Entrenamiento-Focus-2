import { apiFetch } from "@/lib/api"

export const usersService = {
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
  ) {
    return apiFetch("/users/register", {
      method: "POST",
      body: JSON.stringify({ email, password, firstName, lastName, phone }),
    })
  },
}
