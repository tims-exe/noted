/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { GroupDetails } from "@/types/group";
import { useEffect, useState } from "react"

interface GroupPageProps {
    group_id: string,
}

export default function GroupPageComponent({ group_id }: GroupPageProps) {
    const [group, setGroup] = useState<GroupDetails | null>(null)

    useEffect(() => {
        fetchGroupDetails();
    }, [])

    const fetchGroupDetails = async () => {
        try {
            const response = await fetch(`/api/groups/${group_id}`)

            if (response.ok) {
                const data: GroupDetails = await response.json()
                setGroup(data)
                console.log(data)
            }
        } catch (error) {
            console.log("error in fetching group details : ", error)
        }
    }

    if (!group) {
        return <p className=" h-full flex justify-center items-center">Loading…</p>;
    }

    return (
        <div className="flex flex-row h-full">
            <div className="flex flex-4/5 px-10 py-10">
                main
            </div>
            <div className="w-0.5 bg-neutral-400 self-stretch my-10 rounded-full"></div>
            <div className="flex flex-col flex-1/5 px-10 py-10 justify-between">
                <div>
                    <p className="font-bold text-2xl">
                        {group.name}
                    </p>
                    <p className="mt-10">
                        Code
                    </p>
                    <button className="text-left hover:cursor-pointer font-semibold text-xl">
                        {group.code}
                    </button>
                    <div className="mt-10">
                        <p className="mb-3">Members</p>
                        {group.members.map((member) => (
                            <div key={member.id} className="mb-2 font-semibold text-xl">
                                <p>{member.user.name} {member.role==="admin" ? <span className="font-normal text-sm">(Admin)</span> : ""}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <button className="bg-red-200 mx-10 py-2 rounded-xl">
                    Leave Group
                </button>
            </div>
        </div>
    )
}