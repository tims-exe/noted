import { authOptions } from "@/lib/auth"
import { getGroupDetails, leaveGroup, deleteGroup } from "@/lib/groups"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

// get group details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const group = await getGroupDetails(id, session.user.id);
    
    return NextResponse.json(group)

  } catch (error) {
    console.error('GET /api/groups/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// leave/delete group
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
  console.log("entered delete route")
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params;
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL(request.url)
        const action = url.searchParams.get('action')

        if (action === 'delete') {
            await deleteGroup(id, session.user.id)
        } else {
            await leaveGroup(id, session.user.id)
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('DELETE /api/groups/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}