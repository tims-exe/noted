'use client'

import { useSession, signOut } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'
import Image from 'next/image'


export default function HomePage() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status !== 'loading' && !session) {
      redirect('/')
    }
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {session.user?.image && (
                <Image
                    className="h-10 w-10 rounded-full"
                    src={session.user.image}
                    alt={session.user.name || 'User'}
                    width={40}
                    height={40}
                />
              )}
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {session.user?.name}
              </div>
              <div className="text-sm text-gray-500">
                {session.user?.email}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              User Details
            </h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Name:</span> {session.user?.name}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {session.user?.email}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID:</span> {session.user?.id}
              </p>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}