import Navbar from '@/components/Navbar'
import React from 'react'
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";


export default async function Groups() {
    const session = await getServerSession(authOptions);

    console.log(session);

    if (!session?.user) {
    redirect("/");
    }
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={session.user} />

            <div className="flex flex-1 my-10">
                <div className="flex flex-1 justify-center items-start font-semibold text-xl">
                    New group
                </div>
                <div className="w-0.5 bg-neutral-400 self-stretch mb-3 rounded-full"></div>
                <div className="flex flex-1 justify-center items-start font-semibold text-xl">
                    My groups
                </div>
            </div>
        </div>

    )
}
