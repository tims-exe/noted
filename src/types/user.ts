import { DefaultSession } from "next-auth"

export type AppUser = DefaultSession["user"] & {
  id: string
  user_metadata?: {
    avatar_url?: string
    full_name?: string
  }
}
