//components/DialogCompoenets.tsx
"use client";

import React, { useState } from "react";
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TextareaAutosize from "react-textarea-autosize";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DialogComponentProps {
  _id: string;
  _name: string;
  _desc: string;
  _status: string;
  _edit: boolean;
  _group: boolean;
  _groupId? : string;
}

const DialogComponents = ({
  _name,
  _desc,
  _status,
  _edit,
  _id,
  _group,
  _groupId
}: DialogComponentProps) => {
  const [name, setName] = useState(_name);
  const [desc, setDesc] = useState(_desc);
  const [loading, setLoading] = useState(false);

  const statusMap: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  };

  const [status, setStatus] = useState(_edit ? statusMap[_status] : "");

  const canSave = name.trim() !== "" && status !== "";
  const updateString = _edit ? "Updated" : "Added"; 
  const router = useRouter();

  const handleSave = async () => {
    if (!canSave) return;

    setLoading(true);

    try {
      if (_edit) {
        const res = await fetch(`/api/tasks/${_id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify({
                name: name.trim(),
                desc: desc.trim(),
                status,
            })
        })
        if (res.ok) {
            toast(`Task ${updateString}`);
            router.refresh();
        } else {
            const errorData = await res.json();
            toast(`Failed to ${updateString.toLowerCase()} task: ${errorData.error || 'Unknown error'}`);
        }
      }
      else {
        const endpoint = _group && _groupId 
          ? `/api/groups/${_groupId}/tasks` 
          : "/api/tasks";
          
        const res = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name.trim(),
                desc: desc.trim(),
                status,
            }),
        });
        if (res.ok) {
            setName("");
            setDesc("");
            setStatus("");
            toast(`Task ${updateString}`);
            router.refresh();
        } else {
            const errorData = await res.json();
            toast(`Failed to ${updateString.toLowerCase()} task: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error(`Error ${updateString} task:`, error);
      toast(`Failed to ${updateString.toLowerCase()} task. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
        const res = await fetch(`/api/tasks/${_id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            toast(`Task Deleted`);
            router.refresh();
        }
        else {
            const errorData = await res.json();
            toast(`Failed to Delete Task: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        toast('Error deleting task');
    } finally {
        setLoading(false);
    }
  }
  return (
    <DialogContent autoFocus={false} onOpenAutoFocus={(e) => e.preventDefault()}>
      <DialogHeader>
        <DialogTitle>{_edit ? "Update Task" : "Add New Task"}</DialogTitle>
        <div className="grid gap-4">
          <div className="grid mt-4">
            <p className="text-black/60">Task*</p>
            <input
                name="name"
                className="border-2 border-black/30 rounded-sm px-2 py-3"
                value={name}
                onChange={(e) => {
                    setName(e.target.value);
                }}
                autoComplete="off"
                spellCheck="false"
                autoFocus={false}
                />
          </div>
          <div className="grid">
            <p className="text-black/60">Description</p>
            <TextareaAutosize
              minRows={1}
              className="border-2 border-black/30 rounded-sm px-2 py-3 resize-none"
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
              }}
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        </div>
        <DialogFooter>
          <div className="w-full flex justify-between mt-5">
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger className="w-[130px] border-2 border-black/30">
                <SelectValue placeholder="Status*" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex">
                {_edit && 
                <DialogClose asChild>
                    <button
                        onClick={handleDelete}
                        disabled={loading}
                        className={`border-2 border-black/30 px-4 rounded-lg transition-colors duration-300 mr-4
                                    hover:bg-black/5 cursor-pointer
                                    ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                    >
                        {loading ? "Loading..." : "Delete"}
                    </button>
                </DialogClose>
                }
                <DialogClose asChild>
                    <button
                        onClick={handleSave}
                        disabled={loading || !canSave}
                        className={`border-2 border-black/30 px-4 rounded-lg transition-colors duration-300 
                                    ${
                                    canSave && !loading
                                        ? "hover:bg-black/5 cursor-pointer"
                                        : "opacity-50 cursor-not-allowed"
                                    }
                                    `}
                    >
                        {loading ? "Loading..." : "Save"}
                    </button>
                </DialogClose>
            </div>
          </div>
        </DialogFooter>
      </DialogHeader>
    </DialogContent>
  );
};

export default DialogComponents;