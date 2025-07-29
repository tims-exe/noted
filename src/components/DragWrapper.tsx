// components/DragWrapper.tsx
'use client'

import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useState, useEffect } from 'react'
import TaskSection from './tasks/TaskSection'
import { Task } from '@/types/tasks'

interface DragWrapperProps {
  initialTasks: Task[]
}

export default function DragWrapper({ initialTasks }: DragWrapperProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 500,
        tolerance: 5,
      },
    })
  )

  const pendingTasks = tasks.filter(task => task.status === "pending")
  const inProgressTasks = tasks.filter(task => task.status === "in_progress")
  const completedTasks = tasks.filter(task => task.status === "completed")

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id as string
    const newStatus = over.id as 'pending' | 'in_progress' | 'completed'
    
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.status === newStatus) {
      setActiveTask(null)
      return
    }

    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ))

    try {
      console.log("testing refresh....")
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: task.title,
          desc: task.description,
          status: newStatus === 'pending' ? 'Pending' : 
                 newStatus === 'in_progress' ? 'In Progress' : 'Completed'
        }),
      })

      if (!response.ok) throw new Error('Failed to update task')
    } catch (error) {
      console.error('Error:', error)
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: task.status } : t
      ))
    }

    setActiveTask(null)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex justify-between items-start px-10 w-full flex-1 pb-10">
        <div className="flex flex-1 justify-start items-start h-full w-full">
          <TaskSection
            title="Pending"
            tasks={pendingTasks}
            bgColor="bg-[#FEDFDF]"
            emptyMsg="No pending tasks"
            align="self-start ml-10"
            droppableId="pending"
          />
        </div>
        <div className="flex flex-1 justify-center items-start border-l-2 border-r-2 border-black/35 h-full w-full">
          <TaskSection
            title="In Progress"
            tasks={inProgressTasks}
            bgColor="bg-[#FEF8DF]"
            emptyMsg="No tasks in progress"
            align="self-center"
            droppableId="in_progress"
          />
        </div>
        <div className="flex flex-1 justify-end items-start h-full min-w-0">
          <TaskSection
            title="Completed"
            tasks={completedTasks}
            bgColor="bg-[#DFFEE0]"
            emptyMsg="No completed tasks"
            align="self-end mr-10"
            droppableId="completed"
          />
        </div>
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="bg-white w-full px-5 py-4 rounded-2xl shadow-[0_0_20px_2px_rgba(0,0,0,0.30)] opacity-90 h-full">
            <p className="font-semibold">{activeTask.title}</p>
            <p>{activeTask.description}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}