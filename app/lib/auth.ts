import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

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
          role: user.role.name // Make sure this is included
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role
        }
      }
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  }
}