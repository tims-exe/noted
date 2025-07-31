//components/DialogComponents.tsx
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
import { useWebSocket } from "@/hooks/useWebSocket";

interface DialogComponentProps {
  _id: string;
  _name: string;
  _desc: string;
  _status: string;
  _edit: boolean;
  _group: boolean;
  _groupId? : string;
  _groupCode?: string;
  _onTaskChange: () => void
}

const DialogComponents = ({
  _name,
  _desc,
  _status,
  _edit,
  _id,
  _group,
  _groupId,
  _groupCode,
  _onTaskChange
}: DialogComponentProps) => {
  console.log('📝 DialogComponents: Rendered with props:', { 
    _name, _desc, _status, _edit, _id, _group, _groupId, _groupCode 
  });

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

  const { emit } = useWebSocket();

  const handleSave = async () => {
    if (!canSave) {
      console.log('❌ DialogComponents: Cannot save - validation failed');
      return;
    }

    console.log('💾 DialogComponents: Starting save operation', { name: name.trim(), desc: desc.trim(), status });
    setLoading(true);

    try {
      if (_edit) {
        console.log('✏️ DialogComponents: Updating existing task with id:', _id);
        
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
        
        console.log('📡 DialogComponents: Update API response status:', res.status);
        
        if (res.ok) {
            if (_group && _groupCode) {
              console.log('📤 DialogComponents: Emitting task_updated event via WebSocket');
              emit('task_updated', {
                id: _id,
                title: name.trim(),
                description: desc.trim(),
                status: status.toLowerCase().replace(' ', '_')
              });
            }
            toast(`Task ${updateString}`);
        } else {
            const errorData = await res.json();
            console.error('❌ DialogComponents: Update failed:', errorData);
            toast(`Failed to ${updateString.toLowerCase()} task: ${errorData.error || 'Unknown error'}`);
        }
      }
      else {
        console.log('➕ DialogComponents: Creating new task');
        
        const endpoint = _group && _groupId 
          ? `/api/groups/${_groupId}/tasks` 
          : "/api/tasks";
        
        console.log('📡 DialogComponents: Creating task at endpoint:', endpoint);
          
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
        
        console.log('📡 DialogComponents: Create API response status:', res.status);
        
        if (res.ok) {
          const newTask = await res.json();
          console.log('📝 DialogComponents: Created new task:', newTask);
          
            if (_group && _groupCode) {
              console.log('📤 DialogComponents: Emitting task_created event via WebSocket');
              emit('task_created', {
                id: newTask.id,
                title: name.trim(),
                description: desc.trim(),
                status: status.toLowerCase().replace(' ', '_')
              });
            }
            setName("");
            setDesc("");
            setStatus("");
            toast(`Task ${updateString}`);
            _onTaskChange();
        } else {
            const errorData = await res.json();
            console.error('❌ DialogComponents: Create failed:', errorData);
            toast(`Failed to ${updateString.toLowerCase()} task: ${errorData.error || 'Unknown error'}`);
        }
      }
    } catch (error) {
      console.error(`❌ DialogComponents: Error ${updateString} task:`, error);
      toast(`Failed to ${updateString.toLowerCase()} task. Please try again.`);
    } finally {
      console.log('🏁 DialogComponents: Save operation completed');
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    console.log('🗑️ DialogComponents: Starting delete operation for task id:', _id);
    setLoading(true);
    
    try {
        const res = await fetch(`/api/tasks/${_id}`, {
            method: "DELETE",
        });

        console.log('📡 DialogComponents: Delete API response status:', res.status);

        if (res.ok) {
            if (_group && _groupCode) {
              console.log('📤 DialogComponents: Emitting task_deleted event via WebSocket');
              emit('task_deleted', { id: _id });
            }
            toast(`Task Deleted`);
        }
        else {
            const errorData = await res.json();
            console.error('❌ DialogComponents: Delete failed:', errorData);
            toast(`Failed to Delete Task: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('❌ DialogComponents: Error deleting task:', error);
        toast('Error deleting task');
    } finally {
        console.log('🏁 DialogComponents: Delete operation completed');
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