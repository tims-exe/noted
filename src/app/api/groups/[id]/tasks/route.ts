// add all crud operations in crud

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// create group tasks
export async function POST(req: NextRequest, { params } : { params : Promise<{ id: string }>}) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const member = await prisma.groupMember.findFirst({
            where: {
                user_id: session.user.id,
                group_id : id
            }
        })

        if (!member) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const body = await req.json()
        const { name, desc, status } = body

        if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: 'Name required' }, { status: 400 })
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
                user_id: session.user.id,
                group_id: id 
            }, 
            include: {
                user: true
            }
        })

        return NextResponse.json(task)
    } catch (error) {
        console.error('POST /api/groups/[id]/tasks error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 