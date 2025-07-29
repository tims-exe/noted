import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    } & DefaultSession["user"] & {
      user_metadata?: {
        avatar_url?: string
        full_name?: string
      }
    }
  }
}

// declare module "next-auth/jwt" {
//   interface JWT {
//     id: string
//   }
// }
