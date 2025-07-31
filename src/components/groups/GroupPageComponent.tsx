/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { GroupDetails } from "@/types/group";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface GroupPageProps {
    id: string,
}

export default function GroupPageComponent({ id }: GroupPageProps) {
    const router = useRouter()
    const [group, setGroup] = useState<GroupDetails | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        fetchGroupDetails()
    }, [])

    const fetchGroupDetails = async () => {
        try {
        const res = await fetch(`/api/groups/${id}`)
        if (res.ok) {
            const data: GroupDetails = await res.json()
            setGroup(data)
        } else {
            router.push("/groups")
        }
        } catch (err) {
            console.error("Error fetching group:", err)
            router.push("/groups")
        } finally {
            setLoading(false)
        }
    }

    const handleLeaveGroup = async () => {
        try {
        const res = await fetch(`/api/groups/${id}`, { method: "DELETE" })
        if (res.ok) {
            console.log("User left group")
            router.push("/groups")
        } else {
            console.error("Failed to leave group", await res.text())
        }
        } catch (err) {
            console.error("Error leaving group:", err)
        }
    }

    const handleCopyCode = async () => {
        if (!group) return
        try {
            await navigator.clipboard.writeText(group.code)
            toast(`Copied Code`);
        } catch (err) {
            console.error("Copy failed:", err)
            alert("Failed to copy code.")
        }
    }

    if (loading || !group) {
        return (
        <p className="h-full flex justify-center items-center">
            Loading...
        </p>
        )
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
                    <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                        <button
                            type="button"
                            onClick={handleCopyCode}
                            className="text-left font-semibold text-xl hover:cursor-pointer"
                        >
                            {group.code}
                        </button> 
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={0}>
                        <p>Copy code</p>
                        </TooltipContent>
                    </Tooltip>
                    </TooltipProvider>
                    <div className="mt-10">
                        <p className="mb-3">Members</p>
                        {group.members.map((member) => (
                            <div key={member.id} className="mb-2 font-semibold text-xl">
                                <p>{member.user.name} {member.role==="admin" ? <span className="font-normal text-sm">(Admin)</span> : ""}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={handleLeaveGroup}
                className="bg-red-200 mx-10 py-2 rounded-xl hover:cursor-pointer hover:bg-red-400 transition-colors duration-200">
                    Leave Group
                </button>
            </div>
        </div>
    )
}