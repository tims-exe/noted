import { authOptions } from "@/lib/auth"
import { getGroupDetails, leaveGroup } from "@/lib/groups"
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
    console.log('params', id)
    const group = await getGroupDetails(id, session.user.id);
    
    return NextResponse.json(group)

  } catch (error) {
    console.error('GET /api/groups/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


// leave group
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }>}) {
    try {
        const session = await getServerSession(authOptions)
        const { id } = await params;
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        await leaveGroup(id, session.user.id)

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('DELETE /api/groups/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}