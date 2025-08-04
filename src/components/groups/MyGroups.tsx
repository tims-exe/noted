/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from "react";
import GroupCard from "./GroupCard";
import { Group } from "@/types/group";

export default function MyGroups () {
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        const fetchGroups = async () => {
            setLoading(true)
            try {
                const response = await fetch('/api/groups')
                if (response.ok) {
                    const fetchedGroups = await response.json()
                    setGroups(fetchedGroups);
                }
            } catch (error) {
                console.log('fetchGroups : ', error)
            } finally {
                setLoading(false)
            }
        }
        fetchGroups();
        console.log(groups)
    }, [])

    if (loading) {
        return (
        <div className="flex-1 flex justify-center items-center w-full h-full mb-20">
            <p>Loading...</p>
        </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col justify-start items-center w-full mt-10 px-24 ">
            {groups.length === 0 ? 
             <p className="h-full justify-center items-center flex mb-20">
                Create or join a Group
             </p> : 
             <div className="w-full space-y-4">
                {groups.map((group) => (
                    <GroupCard 
                    key={group.id} 
                    group_code={group.code} 
                    name={group.name} 
                    code={group.code} 
                    member_count={group._count.members} 
                    task_count={group._count.tasks}
                />  
                ))}
             </div>
        }
        </div>
    );
}