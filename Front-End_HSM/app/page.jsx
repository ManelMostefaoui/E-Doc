import { useState } from "react"
import { Bell, Eye, EyeOff, LogOut, ChevronDown, LayoutDashboard, Users, Settings } from "lucide-react"

export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f9f9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-2xl font-bold flex items-center">
            <span className="text-black">E</span>
            <span className="text-[#008080]">-</span>
            <div className="relative w-8 h-8">
              <img src="/stethoscope-icon.svg" alt="E-Doc Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-black">oc</span>
          </div>
          <button className="ml-4 md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-[#eef5f5]">
            <Bell size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <img src="/avatar-placeholder.png" alt="User Avatar" className="w-8 h-8 object-cover rounded-full" />
            </div>
            <div className="hidden md:block">
              <div className="font-medium text-sm">Omar Boudelia</div>
              <div className="text-xs text-[#495057]">Admin</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - hidden on mobile unless toggled */}
        <aside
          className={`${isMobileMenuOpen ? "block" : "hidden"} md:block bg-white w-64 border-r border-gray-200 flex-shrink-0`}
        >
          <nav className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-3 p-2 hover:bg-[#eef5f5] rounded-md cursor-pointer">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-[#eef5f5] rounded-md cursor-pointer">
              <Users size={20} />
              <span>Users management</span>
            </div>
            <div>
              <div
                className="flex items-center justify-between p-2 hover:bg-[#eef5f5] rounded-md cursor-pointer"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-[#008080]" />
                  <span className="text-[#008080]">Settings</span>
                </div>
                <ChevronDown size={16} className={`transition-transform ${isSettingsOpen ? "rotate-180" : ""}`} />
              </div>
              {isSettingsOpen && (
                <div className="ml-8 mt-2 flex flex-col gap-2">
                  <div className="p-2 hover:bg-[#eef5f5] rounded-md cursor-pointer">Personal informations</div>
                  <div className="p-2 bg-[#008080] text-white rounded-md cursor-pointer">Security</div>
                  <div className="p-2 hover:bg-[#eef5f5] rounded-md cursor-pointer">Notifications</div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 p-2 hover:bg-[#eef5f5] rounded-md cursor-pointer mt-auto">
              <LogOut size={20} />
              <span>Log out</span>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-[#008080] mb-6">Settings :</h1>

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Change password :</h2>
              <p className="text-[#495057] mb-6">
                For security reasons, please update your password. Enter your current password, then choose a new one.
                Make sure your new password is strong and unique.
              </p>

              <div className="space-y-6">
                <div>
                  <label className="block mb-2">Current password :</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] pr-10"
                      placeholder="Current password"
                    />
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#008080]"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">New password :</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] pr-10"
                      placeholder="New password"
                    />
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#008080]"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-2">Confirm password :</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#008080] pr-10"
                      placeholder="Confirm password"
                    />
                    <button
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#008080]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <button className="bg-[#008080] hover:bg-[#004d4d] text-white py-3 px-6 rounded-md transition-colors">
                    Change password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

