'use client'

import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Navbar from '../../components/Navbar'
import AddTaskButton from "../../components/AddTaskButton";
import DragWrapper from "../../components/DragWrapper";
import { Task } from '@/types/tasks'

export default function HomePage() {
  const { data: session, status } = useSession()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (session?.user) {
      try {
        const response = await fetch('/api/tasks', { cache: 'no-store' })
        if (response.ok) {
          const tasksData = await response.json()
          setTasks(tasksData as Task[])
        }
      } catch (error) {
        console.error('Error fetching tasks:', error)
      } finally {
        setLoading(false)
      }
    }
  }, [session])

  useEffect(() => {
    if (status !== 'loading' && !session) {
      redirect('/')
    }
  }, [session, status])

  useEffect(() => {
    if (session) {
      fetchTasks()
    }
  }, [session, fetchTasks])

  useEffect(() => {
    const handleFocus = () => {
      if (session) {
        fetchTasks()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [session, fetchTasks])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  console.log(session.user)

  return (
    <div className="relative flex flex-col h-screen">
      <Navbar user={session.user} />

      <div className="flex flex-col flex-1 items-center">
        <p className="my-10 font-semibold text-2xl">Your Tasks...</p>
        <DragWrapper initialTasks={tasks} />
      </div>
      <AddTaskButton />
    </div>
  )
}