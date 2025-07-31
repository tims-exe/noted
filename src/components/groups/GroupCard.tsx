'use client'

import { redirect } from "next/navigation"

interface GroupCardProps {
    group_code: string,
    name: string
    code: string
    member_count: number
    task_count: number
}

export default function GroupCard({ group_code, name, code, member_count, task_count }: GroupCardProps) {
    
    const handleGroupJoin = () => {
        redirect(`/groups/${group_code}`)
    }
    return (
        <button onClick={handleGroupJoin}
        className="border-2 border-neutral-400 rounded-xl w-full h-24 flex justify-between items-center px-10 hover:cursor-pointer hover:shadow-[0_0_20px_2px_rgba(0,0,0,0.30)] transition-shadow duration-200">
            <div className="text-start">
                <p className="font-semibold text-xl">
                    {name}
                </p>
                <p className="text-sm mt-2">
                    Code : {code}
                </p>
            </div>
            <div className="text-[15px] space-y-2 text-end">
                <p>
                    <span className="font-semibold">members</span>: {member_count}
                </p>
                <p>
                    <span className="font-semibold">tasks</span> : {task_count}
                </p>
            </div>
        </button>
    )
}