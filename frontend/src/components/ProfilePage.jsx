"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  FaSignOutAlt,
  FaUser,
  FaEnvelope,
  FaIdCard,
  FaEdit,
  FaWallet,
  FaHistory,
  FaCog,
  FaShieldAlt,
  FaBell,
  FaMedal,
} from "react-icons/fa"

const ProfilePage = () => {
  const [userData, setUserData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true)
      try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUserData(JSON.parse(storedUser))
        } else if (location.state?.user) {
          setUserData(location.state.user)
        } else {
          navigate("/login", { replace: true })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [navigate, location])

  const handleLogout = () => {
    localStorage.removeItem("user")
    navigate("/login", { replace: true })
  }

  const handleEditProfile = () => {
    // Navigate to edit profile page
    navigate("/edit-profile")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  if (!userData) return null

  // Random stats for demo purposes
  const stats = {
    totalGames: Math.floor(Math.random() * 100) + 20,
    wins: Math.floor(Math.random() * 50) + 10,
    balance: (Math.random() * 10000).toFixed(2),
    joinDate: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pt-10 pb-20 px-4">
      {/* Background decorative elements */}
      <div className="fixed top-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -translate-x-1/3 -translate-y-1/3 blur-3xl"></div>
      <div className="fixed bottom-0 right-0 w-64 h-64 bg-indigo-400/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

      <div className=" mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden transform transition-all duration-500 hover:shadow-2xl relative mb-6">
          <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

          <div className="relative px-6 pb-6">
            <div className="flex justify-between">
              <div className="absolute -top-14 left-6 bg-white rounded-full p-1 shadow-lg">
                {userData.picture ? (
                  <img
                    src={userData.picture || "/placeholder.svg"}
                    alt={userData.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-white">
                    {userData.name ? userData.name[0].toUpperCase() : <FaUser />}
                  </div>
                )}
              </div>

              <button
                onClick={handleEditProfile}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all duration-300"
              >
                <FaEdit size={18} />
              </button>
            </div>

            <div className="mt-14">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                {userData.name}
                {userData.verified && (
                  <span className="ml-2 bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">Verified</span>
                )}
              </h1>

              <div className="flex items-center mt-1 text-gray-600">
                <FaEnvelope className="mr-2 text-blue-500" />
                <p>{userData.email}</p>
              </div>

              <div className="flex items-center mt-1 text-gray-600">
                <FaIdCard className="mr-2 text-blue-500" />
                <p>ID: {userData.userId || "USR" + Math.floor(Math.random() * 100000)}</p>
              </div>

              <div className="flex items-center mt-1 text-gray-600">
                <FaMedal className="mr-2 text-blue-500" />
                <p>Member since {stats.joinDate}</p>
              </div>

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  onClick={() => navigate("/PaymentPage")}
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors duration-300"
                >
                  <FaWallet className="mr-2" />
                  Wallet
                </button>

                <button
                  onClick={() => navigate("/WalletHistoryPage")}
                  className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors duration-300"
                >
                  <FaHistory className="mr-2" />
                  History
                </button>

                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-300"
                >
                  <FaCog className="mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl flex items-center justify-center font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  )
}

// Action Card Component


export default ProfilePage

