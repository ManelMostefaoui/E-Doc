import { ArrowLeft } from "lucide-react"
import { useState } from "react"

export default function DNotification() {
  const [showBox, setShowBox] = useState(true)
  const [activeTab, setActiveTab] = useState("appointments")

  const notifications = [
    {
      id: 1,
      type: "declined",
      person: "Nasser",
      action: "have declined",
      description: "the appointment you scheduled",
      date: "sunday 28 april",
      time: "09 : 45",
      timeAgo: "5 hours ago",
      hasButton: true,
      buttonText: "New appointment",
    },
    {
      id: 2,
      type: "accepted",
      person: "Manel",
      action: "have accepted",
      description: "the appointment you scheduled",
      date: "sunday 28 april",
      time: "08 : 30",
      timeAgo: "20 hours ago",
      hasButton: false,
    },
    {
      id: 3,
      type: "accepted",
      person: "Asama",
      action: "have accepted",
      description: "the appointment you scheduled",
      date: "sunday 25 april",
      time: "09 : 00",
      timeAgo: "2 days ago",
      hasButton: false,
    },
    {
      id: 4,
      type: "request",
      person: "malek",
      action: "New request have recieved from",
      description: "titled Health concern",
      timeAgo: "2 days ago",
      hasButton: false,
    },
    {
      id: 5,
      type: "request",
      person: "karim",
      action: "New request have recieved from",
      description: "titled Follow-up on previous visit",
      timeAgo: "3 days ago",
      hasButton: false,
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
          <div key={notification.id} className="px-8 p-6">
            <div className="flex">
              <div className="mr-4">
                <img
                  src="/placeholder.svg?height=60&width=60"
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                />
              </div>

              <div className="flex-1 text-left items-start">
                {notification.type === "request" ? (
                  <p className="text-[#1a1a1a] text-base">
                    <span className="text-[#008080] font-medium">{notification.action}</span>{" "}
                    <span className="font-medium">{notification.person}</span> <span>{notification.description}</span>
                  </p>
                ) : (
                  <p className="text-[#1a1a1a] text-base">
                    <span className="font-medium">{notification.person}</span>{" "}
                    <span
                     className={`font-medium ${notification.type === "declined" ? "text-[#c5283d]" : "text-[#008080]"}`}
                    >
                      {notification.action}
                    </span>{" "}
                    {notification.description} on <span className="font-bold">{notification.date}</span> at{" "}
                    <span className="font-bold">{notification.time}</span>
                  </p>
                )}
                <p className="text-[#495057] text-sm mt-1">{notification.timeAgo}</p>

                {notification.hasButton && (
                  <div className="mt-4">
                    <button className="bg-[#008080] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#006666] transition duration-150">
                      {notification.buttonText}
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
