import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: number
    email: string
    first_name: string
    last_name: string
    role: string
    profile_image?: string
  }

  interface Session {
    user: User & {
      id: number
      email: string
      first_name: string
      last_name: string
      role: string
      profile_image?: string
    }
  }
}