import GroupPageComponent from "@/components/groups/GroupPageComponent";
import Navbar from "@/components/Navbar";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
        redirect("/");
    }
    return (
        <div className="h-screen flex flex-col">
            <Navbar user={session.user} />
            <GroupPageComponent id={id} user={session.user}/>
        </div>
    )
}