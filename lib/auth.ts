import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GitHubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        allowDangerousEmailAccountLinking: true,
      })
    ] : []),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: process.env.NODE_ENV === 'development',
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    pkceCodeVerifier: {
      name: `next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900, // 15 minutes
      },
    },
    state: {
      name: `next-auth.state`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 900, // 15 minutes
      },
    },
    nonce: {
      name: `next-auth.nonce`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("🔐 SignIn callback triggered:", { 
        email: user.email, 
        provider: account?.provider,
        type: account?.type 
      })
      
      try {
        // Always allow sign in - bypass any restrictions
        return true
      } catch (error) {
        console.error("❌ SignIn callback error:", error)
        return false
      }
    },
    async session({ session, user }) {
      console.log("📋 Session callback:", { 
        sessionUser: session?.user?.email,
        dbUser: user?.id 
      })
      
      if (session?.user && user) {
        session.user.id = user.id
      }
      return session
    },
  },
  events: {
    async signIn({ user, account }) {
      console.log("✅ Sign in successful:", user.email, "via", account?.provider)
      
      // Clean up any duplicate accounts for this email
      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
          include: { accounts: true }
        })
        
        if (existingUser && existingUser.accounts.length > 1) {
          console.log("🧹 Cleaning up duplicate accounts for:", user.email)
          // Keep only the most recent account
          const oldAccounts = existingUser.accounts.slice(0, -1)
          for (const oldAccount of oldAccounts) {
            await prisma.account.delete({ where: { id: oldAccount.id } })
          }
        }
      } catch (error) {
        console.log("⚠️ Account cleanup error (non-critical):", (error as Error).message)
      }
    },
  },
}
