"use client";

import React from "react";
import Image from "next/image";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import DialogComponents from "../DialogComponents";

interface AddButtonProps {
  group: boolean,
  groupId? :string
}

const AddTaskButton = ({ group, groupId }: AddButtonProps) => {
  return (
    <div
      className="absolute bottom-6 right-6 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_2px_rgba(0,0,0,0.25)]
          hover:scale-105 transition-transform mb-3 mr-3 hover:cursor-pointer"
    >
      <Dialog>
        <DialogTrigger>
          <Image
            src="/add.png"
            alt=""
            width={30}
            height={30}
            className="hover:cursor-pointer"
          />
        </DialogTrigger>
        <DialogComponents _id="" _name="" _desc="" _status="" _edit={false} _group={group} _groupId={groupId}/>
      </Dialog>
    </div>
  );
};

export default AddTaskButton;
