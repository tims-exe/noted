// components/TaskSection.tsx
import { Task } from "@/types/tasks";
import TaskCard from "./GroupTaskCards";


interface TaskSectionProps {
    title: string, 
    tasks: Task[],
    bgColor: string,
    emptyMsg : string,
    align : string
}

export default function GroupTaskSection ({ title, tasks, bgColor, emptyMsg, align } : TaskSectionProps) {
    return (
        <div className="flex flex-col h-full w-full">
            <div className={`${bgColor} px-3 py-1 rounded-md mb-4 text-center w-[120px] ${align}`}>
                <span className="font-medium">{title}</span>
            </div>
            <div 
                className="flex-1 overflow-y-auto px-10"
                style={{ maxHeight: 'calc(100vh - 300px)' }}
            >
                {tasks.length > 0 ? (
                tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                ))
                ) : (
                <div className="text-center text-gray-500 text-sm mt-8">
                    {emptyMsg}
                </div>
                )}
            </div>
        </div>
    )
}