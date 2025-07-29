import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const tasks = await prisma.task.findMany({
            where: {
                user_id: session.user.id 
            },
            orderBy: {
                created_at: 'desc'
            }
        })

        return NextResponse.json(tasks)
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, desc, status } = await request.json()

        if (!name || !status) {
            return NextResponse.json({ error: 'Name and status are required' }, { status: 400 })
        }

        const statusMap: Record<string, string> = {
            "Pending": "pending",
            "In Progress": "in_progress",
            "Completed": "completed"
        }

        const task = await prisma.task.create({
            data: {
                title: name,
                description: desc || "",
                status: statusMap[status] || "pending",
                user_id: session.user.id
            }
        })
        return NextResponse.json(task, { status: 201 })
    } catch (error) {
        console.error('Error creating task:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}