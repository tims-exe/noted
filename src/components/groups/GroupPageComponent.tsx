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
import GroupTaskSection from "./tasks/GroupTaskSection";
import AddTaskButton from "../buttons/AddTaskButton";
import { useWebSocket } from "@/hooks/useWebSocket";

interface GroupPageProps {
    id: string,
}

export default function GroupPageComponent({ id }: GroupPageProps) {
    console.log('🏠 GroupPageComponent: Rendering with id:', id);
    
    const router = useRouter()
    const [group, setGroup] = useState<GroupDetails | null>(null)
    const [loading, setLoading] = useState<boolean>(true)

    const { connectToGroup, disconnect, isConnected, error } = useWebSocket({
        onMessage: (event, data) => {
            console.log('📨 GroupPageComponent: Received WebSocket message:', event, data);
            
            if (event === "task_created" || event === "task_updated") {
                console.log('🔄 GroupPageComponent: Task created/updated, fetching group details');
                fetchGroupDetails();
            } else if (event === "task_deleted") {
                console.log('🗑️ GroupPageComponent: Task deleted, fetching group details');
                fetchGroupDetails();
                // Alternative: Update state directly instead of refetching
                // setGroup(prevGroup => {
                //     if (!prevGroup) return prevGroup;
                //     return {
                //         ...prevGroup,
                //         tasks: prevGroup.tasks?.filter(task => task.id !== data.id) || []
                //     }
                // })
            } else if (event === "user_joined" || event === "user_left") {
                console.log('👤 GroupPageComponent: User joined/left, fetching group details');
                fetchGroupDetails();
            }
        },
        onConnect: () => {
            console.log("✅ GroupPageComponent: WebSocket connected successfully")
        },
        onDisconnect: () => {
            console.log("❌ GroupPageComponent: WebSocket disconnected")
        }
    })

    const fetchGroupDetails = async () => {
        console.log('📡 GroupPageComponent: Fetching group details for id:', id);
        
        try {
            const res = await fetch(`/api/groups/${id}`)
            console.log('📡 GroupPageComponent: API response status:', res.status);
            
            if (res.ok) {
                const data: GroupDetails = await res.json()
                console.log('📡 GroupPageComponent: Received group data:', data);
                setGroup(data)
            } else {
                console.error('❌ GroupPageComponent: API request failed, redirecting to /groups');
                router.push("/groups")
            }
        } catch (err) {
            console.error("❌ GroupPageComponent: Error fetching group:", err)
            router.push("/groups")
        } finally {
            console.log('📡 GroupPageComponent: Setting loading to false');
            setLoading(false)
        }
    }

    // Fetch group details on component mount
    useEffect(() => {
        console.log('🔄 GroupPageComponent: useEffect triggered for fetchGroupDetails');
        fetchGroupDetails();
    }, [id])

    // Connect WebSocket when group data is available
    useEffect(() => {
        if (group?.code) {
            console.log('🔌 GroupPageComponent: Group loaded, connecting to WebSocket with code:', group.code);
            connectToGroup(group.code);
        }

        // Don't disconnect in cleanup to prevent React 18 Strict Mode issues
        // The disconnect will happen when component truly unmounts or group changes
    }, [group?.code, connectToGroup])

    // Separate useEffect for cleanup on unmount
    useEffect(() => {
        return () => {
            console.log('🧹 GroupPageComponent: Component unmounting - disconnecting WebSocket');
            disconnect();
        }
    }, [disconnect])

    // Debug WebSocket connection status
    useEffect(() => {
        console.log('🔌 GroupPageComponent: WebSocket status changed - Connected:', isConnected, 'Error:', error);
    }, [isConnected, error])

    const handleLeaveGroup = async () => {
        console.log('👋 GroupPageComponent: Leaving group with id:', id);
        
        try {
            const res = await fetch(`/api/groups/${id}`, { method: "DELETE" })
            if (res.ok) {
                console.log("✅ GroupPageComponent: User left group successfully")
                router.push("/groups")
            } else {
                console.error("❌ GroupPageComponent: Failed to leave group", await res.text())
            }
        } catch (err) {
            console.error("❌ GroupPageComponent: Error leaving group:", err)
        }
    }

    const handleCopyCode = async () => {
        if (!group) return
        console.log('📋 GroupPageComponent: Copying group code:', group.code);
        
        try {
            await navigator.clipboard.writeText(group.code)
            toast(`Copied Code`);
        } catch (err) {
            console.error("❌ GroupPageComponent: Copy failed:", err)
            alert("Failed to copy code.")
        }
    }

    const pendingTasks = group?.tasks?.filter(task => task.status === 'pending') || []
    const inProgressTasks = group?.tasks?.filter(task => task.status === 'in_progress') || []
    const completedTasks = group?.tasks?.filter(task => task.status === 'completed') || []

    console.log('📊 GroupPageComponent: Task counts - Pending:', pendingTasks.length, 'In Progress:', inProgressTasks.length, 'Completed:', completedTasks.length);
           
    if (loading || !group) {
        console.log('⏳ GroupPageComponent: Still loading or no group data - Loading:', loading, 'Group:', !!group);
        return (
            <p className="h-full flex justify-center items-center">
                Loading...
            </p>
        )
    }

    console.log('✅ GroupPageComponent: Rendering group interface for:', group.name);

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
                            groupCode={group.code}
                            onTaskChange={fetchGroupDetails}
                        />
                    </div>
                    <div className="flex flex-1 justify-center items-start border-l-2 border-r-2 border-black/35 h-full w-full">
                        <GroupTaskSection
                            title="In Progress"
                            tasks={inProgressTasks}
                            bgColor="bg-[#FEF8DF]"
                            emptyMsg="No tasks in progress"
                            align="self-center"
                            groupCode={group.code}
                            onTaskChange={fetchGroupDetails}
                        />
                    </div>
                    <div className="flex flex-1 justify-end items-start h-full min-w-0">
                        <GroupTaskSection
                            title="Completed"
                            tasks={completedTasks}
                            bgColor="bg-[#DFFEE0]"
                            emptyMsg="No completed tasks"
                            align="self-end mr-10"
                            groupCode={group.code}
                            onTaskChange={fetchGroupDetails}
                        />
                    </div>
                    <AddTaskButton group={true} groupId={group.id} groupCode={group.code} onTaskChange={fetchGroupDetails}/>
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
                    {/* Debug info - remove in production */}
                    <div className="mt-10 p-2 bg-gray-100 rounded text-xs">
                        <p>WebSocket Status: {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
                        {error && <p className="text-red-500">Error: {error}</p>}
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