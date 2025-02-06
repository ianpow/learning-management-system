// /app/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import './auth.types'
import { prisma } from '@/lib/prisma'

interface DbUser {
  id: number;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role_id: number;
  department_id: number;
  location_id: number;
  manager_id: number | null;
  profileImage: string | null;
  created_at: Date;
  updated_at: Date;
  role: {
    id: number;
    name: string;
    created_at: Date;
    updated_at: Date;
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
      
        const user: DbUser | null = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true }
        }) as (typeof user & { profile_image: string | null })
      
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
          first_name: user.first_name,
          last_name: user.last_name,
          name: `${user.first_name} ${user.last_name}`,
          role: user.role.name,
          profileImage: user.profileImage || undefined
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
          role: user.role,
          first_name: user.first_name,
          last_name: user.last_name,
          profileImage: user.profileImage || undefined
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
          role: token.role,
          first_name: token.first_name,
          last_name: token.last_name,
          profileImage: token.profileImage || undefined
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