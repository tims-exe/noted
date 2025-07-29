'use client'

import { useState } from "react";

export default function NewGroupComponent() {
    const [join, setJoin] = useState(false);

    return (
    <div className="flex-1 flex flex-col justify-start items-center w-full">
      <div className="flex flex-col items-start gap-4 mt-8 w-2/3 h-full">
        <div className="flex gap-4 px-3">
        <button
            onClick={() => setJoin(false)}
            className={`${join ? 'text-neutral-500' : 'text-black'} font-semibold hover:cursor-pointer`}
        >
            New
        </button>
        <button
            onClick={() => setJoin(true)}
            className={`${join ? 'text-black' : 'text-neutral-500'} font-semibold hover:cursor-pointer`}
        >
            Join
        </button>
        </div>

        <div className="border-2 border-neutral-400 rounded-2xl w-full h-2/3 flex flex-col justify-center items-center py-3 font-semibold" >
          <p className="text-xl"> {
                join ? "Join a Group" : "Create a Group"
            }
            </p>
          <div className={`${join ? 'w-1/2' : 'w-2/3'} mt-4`}>
            <p className="font-normal text-neutral-500 text-sm">
                {join ? "Code" : "Name"}
            </p>
            <input type="text" className="w-full py-3 px-3 border-2 border-neutral-400 rounded-md font-normal"/>
          </div>
          <button className="mt-10 border-2 border-neutral-400 px-5 py-2 rounded-2xl hover:cursor-pointer hover:shadow-[0_0_10px_2px_rgba(0,0,0,0.20)] transition-shadow duration-200">
            {join ? "Join" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
