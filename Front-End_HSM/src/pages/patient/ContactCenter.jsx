import { Search } from "lucide-react"
import { useState } from "react"
import ContactForm from "../../components/CPatient/ContactForm"

import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ContactCenter() {
  const navigate = useNavigate();
  const [showContactForm, setShowContactForm] = useState(false)
  const [messages] = useState([
    {
      id: 1,
      sender: "Sam",
      date: "25 avril 12 : 04",
      title: "Schedule an appointment",
      content: "Hello Doctor,I would like to schedule an appointment with you at your earliest convenience. I've also attached my recent test results for your review before the consultation.Please let me know your available times.Thank you!"
    },
    {
      id: 2,
      sender: "Sam",
      date: "25 avril 12 : 04",
      title: "Request",
      content: "Hello Doctor,I would like to schedule an appointment with you at your earliest convenience. I've also attached my recent test results for your review before the consultation.Please let me know your available times.Thank you!"
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")

  const filteredMessages = messages.filter((message) =>
    message.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
      <>
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl text-left font-bold text-[#008080] mb-6">Contact center :</h1>

        <div className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
          <div className="relative">

            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="ml-4 h-5 w-5 text-gray-400" />
            </div>

            <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-16 pr-4 py-2 w-full md:w-90 rounded-lg bg-[#f7f9f9] shadow-[2px_2px_12px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-2 focus:ring-[#008080] focus:border-transparent"
           />

          </div>

          <button onClick={() => setShowContactForm(true)} 
          className="text-[#f7f9f9] bg-[#008080] font-semibold flex items-center gap-4 border-2 border-[#008080] rounded-lg px-13 py-2 hover:bg-[#006666] transition duration-150">
          Contact the doctor
          </button>

        </div>
      </div>

      <div className="text-left space-y-4">
      {filteredMessages.map((message) => (
          <div key={message.id} className="bg-[#f7f9f9] shadow-[2px_2px_12px_rgba(0,0,0,0.25)] rounded-lg p-10 space-y-1">
            <div className="mb-4">
              <div className="text-gray-600 text-[13px] mb-1">
                {message.sender} , {message.date}
              </div>
              <div className="font-medium text-[#1a1a1a] mb-2">Title : {message.title}</div>
            </div>
            <div className="whitespace-pre-line text-[#1a1a1a]">{message.content}</div>
          </div>
        ))}
      </div>
    </div>
   {showContactForm && <ContactForm onClose={() => setShowContactForm(false)} />}
</>
  )
}