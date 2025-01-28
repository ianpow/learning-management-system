// /app/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: string
      name?: string  // Make name optional
    }
  }

  interface User {
    id: string
    email: string
    role: string
    name?: string  // Make name optional
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    name?: string  // Make name optional
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
      
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true }
        })
      
        if (!user) {
          return null
        }
      
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password_hash
        )
      
        if (!passwordMatch) {
          return null
        }
      
        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role.name
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  }
}