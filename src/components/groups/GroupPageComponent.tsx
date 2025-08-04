/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { GroupDetails } from "@/types/group";
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner";
import { io, Socket } from 'socket.io-client';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import GroupTaskSection from "./tasks/GroupTaskSection";
import AddTaskButton from "../buttons/AddTaskButton";

interface GroupPageProps {
    id: string,
}

export default function GroupPageComponent({ id }: GroupPageProps) {
    const router = useRouter()
    const [group, setGroup] = useState<GroupDetails | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // 1. Fetch initial data
        fetchGroupDetails()
        
        // 2. Set up socket
        const s = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
        });
        
        setSocket(s);
        
        // 3. Tell server which group this client is in
        s.emit('join group', id);
        
        // 4. Listen for real-time task events
        s.on('task_created', (newTask) => {
            setGroup(g => {
                if (!g) return g;
                return {
                    ...g,
                    tasks: [newTask, ...g.tasks]
                };
            });
        });
        
        s.on('task_updated', (updatedTask) => {
            setGroup(g => {
                if (!g) return g;
                return {
                    ...g,
                    tasks: g.tasks.map(task => 
                        task.id === updatedTask.id ? updatedTask : task
                    )
                };
            });
        });
        
        s.on('task_deleted', (deletedTask) => {
            setGroup(g => {
                if (!g) return g;
                return {
                    ...g,
                    tasks: g.tasks.filter(task => task.id !== deletedTask.id)
                };
            });
        });
        
        // 5. Cleanup on unmount
        return () => {
            s.disconnect();
        };
    }, [id])

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

    const pendingTasks = group?.tasks?.filter(task => task.status === 'pending') || []
    const inProgressTasks = group?.tasks?.filter(task => task.status === 'in_progress') || []
    const completedTasks = group?.tasks?.filter(task => task.status === 'completed') || []

    console.log(pendingTasks)

    if (loading || !group) {
        return (
        <p className="h-full flex justify-center items-center">
            Loading...
        </p>
        )
    }

    return (
        <div className="flex flex-row h-full">
            <div className="flex flex-col flex-4/5 px-10 py-10">
                <h1 className="text-3xl font-bold mb-6">Tasks</h1>
                <div className="flex justify-between items-start w-full flex-1">
                    <div className="flex flex-1 justify-start items-start h-full w-full">
                        <GroupTaskSection
                            title="Pending"
                            tasks={pendingTasks}
                            bgColor="bg-[#FEDFDF]"
                            emptyMsg="No pending tasks"
                            align="self-start ml-10"
                        />
                    </div>
                    <div className="flex flex-1 justify-center items-start border-l-2 border-r-2 border-black/35 h-full w-full">
                        <GroupTaskSection
                            title="In Progress"
                            tasks={inProgressTasks}
                            bgColor="bg-[#FEF8DF]"
                            emptyMsg="No tasks in progress"
                            align="self-center"
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-start h-full min-w-0">
                        <GroupTaskSection
                            title="Completed"
                            tasks={completedTasks}
                            bgColor="bg-[#DFFEE0]"
                            emptyMsg="No completed tasks"
                            align="self-end mr-10"
                        />
                    </div>
                    <AddTaskButton group={true} groupId={group.id} socket={socket} />
                </div>
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