'use client'

interface GroupCardProps {
    name: string
    code: string
    member_count: number
    task_count: number
}

export default function GroupCard({ name, code, member_count, task_count }: GroupCardProps) {
    return (
        <div className="border-2 border-neutral-400 rounded-xl w-full h-24 flex justify-between items-center px-10">
            <div>
                <p className="font-semibold text-xl">
                    {name}
                </p>
                <p className="text-sm mt-2">
                    Code : {code}
                </p>
            </div>
            <div className="text-[15px] space-y-2">
                <p>
                    <span className="font-semibold">members</span>: {member_count}
                </p>
                <p>
                    <span className="font-semibold">tasks</span> : {task_count}
                </p>
            </div>
        </div>
    )
}