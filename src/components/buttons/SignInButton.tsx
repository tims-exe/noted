'use client';

import React from 'react'
import { signIn } from 'next-auth/react'

const SignInButton = () => {
  return (
    <button
        className="bg-neutral-300 px-8 py-3 rounded-2xl mt-10 hover:cursor-pointer hover:bg-neutral-400 transition-colors duration-200"
        onClick={() => signIn('google')}
    >
        <p className="font-semibold">tasks</p>
    </button>
  )
}

export default SignInButton