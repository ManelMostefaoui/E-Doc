import { ArrowLeft } from "lucide-react"
import React, { useState } from "react";

export default function PNotification() {
  const [showBox, setShowBox] = useState(true)
  const notifications = [
    {
      id: 1,
      doctor: "Docter ahlem",
      date: "sunday 26 april",
      time: "10 : 00",
      timeAgo: "5 hours ago",
      needsAction: true,
    },
    {
      id: 2,
      doctor: "Docter ahlem",
      date: "sunday 25 april",
      time: "09 : 00",
      timeAgo: "20 hours ago",
      needsAction: false,
    },
    {
      id: 3,
      doctor: "Docter ahlem",
      date: "sunday 06 april",
      time: "11 : 00",
      timeAgo: "20 days ago",
      needsAction: false,
    },
  ]

  return (
    <>
    {showBox && (
    <div className="absolute top-0 right-0 max-w-md bg-[#f7f9f9] min-h-screen bg-[#f7f9f9] shadow-[2px_2px_12px_rgba(0,0,0,0.25)] font-nunito">
      <div className="sticky top-0 bg-[#f7f9f9] z-10 p-8  border-b border-gray-200 flex items-center">
        
       <ArrowLeft
              className="absolute top-1/2 transform -translate-y-1/2 text-[#008080] cursor-pointer"
              onClick={() => setShowBox(false)}/>
      
              <h1 className="text-[#008080] ml-10 text-2xl font-bold">Notifications :</h1>

      </div>

      <div className="divide-y divide-gray-200">
        {notifications.map((notification) => (
          <div key={notification.id} className="text-left px-8 p-6">
            <div className="flex">
              <div className="mr-4">
                <img
                  src="/placeholder.svg?height=60&width=60"
                  alt="Doctor profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                />
              </div>
              <div className="flex-1">
                <p className="text-[#1a1a1a] text-base">
                  <span className="font-medium">{notification.doctor}</span> has scheduled an appointment for you on{" "}
                  <span className="font-bold">{notification.date}</span> at{" "}
                  <span className="font-bold">{notification.time}</span>
                </p>
                <p className="text-[#495057] text-sm mt-1">{notification.timeAgo}</p>

                {notification.needsAction && (
                  <div className="flex mt-4 space-x-4">
                    <button className="bg-[#008080] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#006666] transition duration-150">Approve</button>
                    <button className="text-[#C5283D] bg-[#F7F9F9] border-2 font-semibold flex items-center gap-4 border-[#C5283D] rounded-lg px-6 py-2 hover:text-[#F7F9F9]  hover:bg-[#C5283D] transition duration-150">
                      Deny
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    )}
    </>
  )
}
