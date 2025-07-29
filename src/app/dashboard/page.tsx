// src/app/dashboard/page.tsx
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Navbar from "../../components/Navbar";
import AddTaskButton from "../../components/buttons/AddTaskButton";
import DragWrapper from "../../components/DragWrapper";
import { Task } from "@/types/tasks";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  console.log(session);

  if (!session?.user) {
    redirect("/");
  }

  const rawTasks = await prisma.task.findMany({
    where: {
      user_id: session.user.id,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  const tasks: Task[] = rawTasks.map((task) => ({
    ...task,
    created_at: task.created_at.toISOString(),
    status: task.status as "pending" | "in_progress" | "completed",
  }));

  console.log(tasks);

  return (
    <div className="relative flex flex-col h-screen">
      <Navbar user={session.user} />

      <div className="flex flex-col flex-1 items-center">
        <p className="my-10 font-semibold text-2xl">Your Tasks...</p>
        <DragWrapper initialTasks={tasks} />
      </div>
      <AddTaskButton />
    </div>
  );
}
