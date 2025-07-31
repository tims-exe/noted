import { prisma } from "./prisma";
import { nanoid } from 'nanoid'


// create new group
export async function createGroup(name: string, creatorId: string) {
    let code = nanoid(6)

    let existingGroup = await prisma.group.findUnique({
        where: { code }
    })
    
    while (existingGroup) {
        code = nanoid(6)
        existingGroup = await prisma.group.findUnique({
            where: { code }
        })
    }

    const group = await prisma.group.create({
        data: {
            name,
            code,
            creator_id: creatorId,
            members: {
                create: {
                    user_id: creatorId,
                    role: 'admin'
                }
            }
        },
        include: {
            creator: true,
            members: {
                include: {
                    user: true
                }
            }
        }
    });

    return group
}


// join a group
export async function joinGroup(code: string, userId: string) {
    // check if group exists
    const group = await prisma.group.findUnique({
        where: { code },
        include: {
            members: true,
        }
    })

    if (!group) {
        throw new Error('Group not found');
    }

    // check if member exists
    const existingMember = group.members.find(member => member.user_id === userId)

    if (existingMember) {
        throw new Error('Member already exisits')
    }

    await prisma.groupMember.create({
        data: {
            user_id: userId,
            group_id: group.id, 
            role: 'member'
        }
    });

    return group;
}


// leave a group
export async function leaveGroup(groupCode: string, userId: string) {
    const group_code = await prisma.group.findUnique({
        where : {code: groupCode},
        select: { id: true }
    })

    if (!group_code) {
        throw new Error("Group not found")
    }

    const groupId = group_code.id
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            members: true,
        }
    })

    if (!group) {
        throw new Error('Group not found');
    }

    // if user is an admin, change ownership 
    // (for now the next member but later ask user to choose next admin)

    //check if its one user (creator)
    if (group.creator_id === userId && group.members.length === 1) {
        await prisma.group.delete({
        where: { id: groupId }
        });
    }

    // promote next user
    if (group.creator_id === userId && group.members.length > 1) {
        const nextAdmin = group.members.find(m => m.user_id !== userId)
        if (nextAdmin) {
            await prisma.$transaction([
                prisma.group.update({
                    where: { id: groupId },
                    data: { creator_id: nextAdmin.user_id }
                }),
                prisma.groupMember.update({
                    where: { id: nextAdmin.id },
                    data: { role: 'admin' }
                }),
                prisma.groupMember.delete({
                    where: {
                    user_id_group_id: {
                        user_id: userId,
                        group_id: groupId
                    }
                    }
                })
            ])
        }
        return 
    }

    await prisma.groupMember.delete({
        where: {
            user_id_group_id: {
                user_id: userId,
                group_id: groupId 
            }
        }
    })

}

// get group details with member details and tasks
export async function getGroupDetails(groupCode: string, userId: string) {
    const group_code = await prisma.group.findUnique({
        where: { code: groupCode },
        select: { id: true }
    })
    if (!group_code) {
        throw new Error("Group not found")
    }
    const group_id = group_code.id

    const membership = await prisma.groupMember.findFirst({
        where: {
        user_id: userId,
        group_id: group_id
        }
    })
    if (!membership) {
        throw new Error("Access Denied")
    }

    const group = await prisma.group.findUnique({
        where: { id: group_id },
        include: {
        creator: true,
        members: {
            include: {
            user: true
            }
        },
        tasks: {
            include: {
            user: true
            },
            orderBy: {
            created_at: 'desc'
            }
        }
        }
    })
    if (!group) {
        throw new Error("Group not found")
    }

    return group
}


// get users groups
export async function getUserGroups(userId: string) {
    const groupMembers = await prisma.groupMember.findMany({
        where: {
            user_id: userId
        },
        include: {
            group: {
                include: {
                    creator: true, 
                    members: {
                        include: {
                            user: true 
                        }
                    },
                    _count: {
                        select: {
                            tasks: true, 
                            members: true
                        }
                    }
                }
            }
        },
        orderBy: {
            joined_at: 'desc'
        }
    });

    return groupMembers.map(m => m.group)
}