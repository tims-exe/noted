import Navbar from '@/components/Navbar'
import React from 'react'
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import NewGroupComponent from '@/components/groups/NewGroupComponent';


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
                <div className="flex flex-1 flex-col justify-start items-center">
                    <p className=' font-semibold text-xl'>
                        New group
                    </p>
                    <NewGroupComponent />
                </div>
                <div className="w-0.5 bg-neutral-400 self-stretch mb-3 rounded-full"></div>
                <div className="flex flex-1 flex-col justify-start items-center">
                    <p className=' font-semibold text-xl'>
                        My groups
                    </p>
                </div>
            </div>
        </div>

    )
}
