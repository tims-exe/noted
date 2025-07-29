'use client'

import { signIn, useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import Image from "next/image";

export default function LandingPage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (session) {
      redirect('/dashboard')
    }
  }, [session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-screen relative w-full bg-white">
      <div className="relative z-10 flex flex-col justify-center items-center h-full">
        <div className="flex justify-center items-start">
          <Image src="/notes.png" alt="" width={40} height={40} />
          <p className="font-semibold text-2xl text-black bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm px-2 py-3 rounded-2xl">
            Noted
          </p>
        </div>
        <p>Built for people who get things done.</p>
        <button
          className="bg-neutral-300 px-8 py-3 rounded-2xl mt-10 hover:cursor-pointer hover:bg-neutral-400 transition-colors duration-200"
          onClick={() => signIn('google')}
        >
          <p className="font-semibold">tasks</p>
        </button>
      </div>
    </div>
  )
}



{/* <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Our App
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your Google account to continue
          </p>
        </div>
        <div>
          <button
            onClick={() => signIn('google')}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div> */}