import { authOptions } from "@/lib/auth"
import { createGroup, getUserGroups, joinGroup } from "@/lib/groups";
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

// get users groups
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
    
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const groups = await getUserGroups(session.user.id)
        return NextResponse.json(groups)

    } catch (error) {
        console.error('GET /api/groups error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// create/join a group
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
    
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json() 

        const { type, name, code } = body; 

        if (type === "create") {
            if (!name || name.trim().length === 0) {
                return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
            }

            const group = await createGroup(name.trim(), session.user.id)

            return NextResponse.json(group)
        }

        if (type === "join") {
            if (!code || code.trim().length !== 6) {
                return NextResponse.json({ error: 'Invalid Code' }, { status: 400 });
            }
            
            const group = await joinGroup(code.trim(), session.user.id)

            return NextResponse.json(group)
        }

    } catch (error) {
        console.error('POST /api/groups error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}






// try {
//         const session = await getServerSession(authOptions);
    
//         if (!session?.user) {
//             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//         }
//     } catch (error) {
//         console.error('GET /api/groups error:', error);
//         return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//     }