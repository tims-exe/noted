'use client'

import Image from 'next/image'
import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { signOut } from 'next-auth/react'
import { Session } from 'next-auth'
import { redirect } from "next/navigation";

interface NavbarProps {
    user: Session["user"]
}

const Navbar = ({ user }: NavbarProps) => {
  return (
    <div>
        <div className="flex justify-between items-center mx-10 mt-6">
            <div className="flex-1 flex justify-start">
                <Image 
                src="/notes.png"
                alt=""
                width={30}
                height={30}
                />
            </div>
            <div className="flex-1 flex justify-center font-semibold text-xl text-black">
                Noted
            </div>
            <div className="flex-1 flex justify-end items-center gap-5">
                <button className='hover:cursor-pointer hover:bg-neutral-200 px-4 py-1 rounded-md transition-colors duration-300' onClick={() => {redirect("/dashboard")}}>
                    Dashboard
                </button>
                <button className='hover:cursor-pointer hover:bg-neutral-200 px-4 py-1 rounded-md transition-colors duration-300' onClick={() => {redirect("/groups")}}>
                    Groups
                </button>
                <Sheet>
                    <SheetTrigger className='hover:cursor-pointer'>
                        {user.image && (
                            <Image
                                src={user.image || 'N/A'}
                                alt="Avatar"
                                width={35}
                                height={35}
                                className="rounded-full"
                            />
                            )}
                    </SheetTrigger>
                    <SheetContent>
                    <SheetHeader>
                        <SheetTitle className="text-2xl">Profile</SheetTitle>
                    </SheetHeader>
                    <div className="px-4 flex flex-col justify-between h-screen pb-8 items-center">
                        <div className='self-start'>
                            <div className='font-normal text-[16px]'>Name :</div>
                            <div className='font-semibold mb-5 text-xl'> {user.name || 'N/A'}</div>
                            <div className='font-normal text-[16px]'>Email :</div> 
                            <div className='font-semibold mb-5 text-xl'>{user.email}</div>
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 w-[150px] hover:cursor-pointer"
                            >
                            Sign Out
                        </button>
                    </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
        <div className='px-10'>
            <div className=" mt-6 w-full h-0.5 bg-black/35 rounded-full"></div>
        </div>
    </div>
  )
}

export default Navbar
