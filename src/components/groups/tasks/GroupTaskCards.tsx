// components/TaskCard.tsx
"use client";

import { Task } from "@/types/tasks";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import DialogComponents from "../../DialogComponents";
import Image from "next/image";
import { Socket } from "socket.io-client";

interface TaskCardProps {
  task: Task
  socket: Socket | null
}

export default function GroupTaskCard({ task, socket }: TaskCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div 
          className="bg-white w-full block my-5 px-5 py-4 rounded-2xl shadow-[0_0_10px_2px_rgba(0,0,0,0.20)] hover:cursor-pointer hover:shadow-[0_0_20px_2px_rgba(0,0,0,0.30)] transition-shadow duration-300"
        >
          <div className="w-full flex justify-between mb-4">
            <p className="font-semibold">{task.title}</p>
            <Image 
              src={`/${task.status}.png`}
              alt=""
              width={25}
              height={25}
            />
          </div>
          <p>{task.description}</p>
        </div>
      </DialogTrigger>
      <DialogComponents
        _id = {task.id}
        _name={task.title}
        _desc={task.description}
        _status={task.status}
        _edit={true}
        _group={true}
        _socket={socket}
      />
    </Dialog>
  );
}