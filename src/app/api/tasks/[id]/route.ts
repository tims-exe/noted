import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, desc, status } = await request.json()
    const { id: taskId } = await params

    if (!name || !status) {
      return NextResponse.json({ error: 'Name and status are required' }, { status: 400 })
    }

    const statusMap: Record<string, string> = {
      "Pending": "pending",
      "In Progress": "in_progress",
      "Completed": "completed"
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        user_id: session.user.id
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updatedTask = await prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        title: name,
        description: desc || '',
        status: statusMap[status] || 'pending'
      },
      include: {
        user: true
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: taskId } = await params

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        user_id: session.user.id
      },
      include: {
        user: true
      }
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    await prisma.task.delete({
      where: {
        id: taskId
      }
    })

    return NextResponse.json(existingTask)
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}