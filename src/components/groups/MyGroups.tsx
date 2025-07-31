/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useEffect, useState } from "react";
import GroupCard from "./GroupCard";
import { Group } from "@/types/group";

export default function MyGroups () {
    const [groups, setGroups] = useState<Group[]>([])

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await fetch('/api/groups')
                if (response.ok) {
                    const fetchedGroups = await response.json()
                    setGroups(fetchedGroups);
                }
            } catch (error) {
                console.log('fetchGroups : ', error)
            }
        }
        fetchGroups();
        console.log(groups)
    }, [])

    console.log(groups.length)
    console.log(groups)

    return (
        <div className="flex-1 flex flex-col justify-start items-center w-full mt-10 px-24">
            {groups.length === 0 ? 
             <p>
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