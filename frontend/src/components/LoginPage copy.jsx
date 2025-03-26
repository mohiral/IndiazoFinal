"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { UserCircle, Lock, Smartphone } from "lucide-react"

const LoginPage = ({ onLoginSuccess }) => {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [user, setUser] = useState(null)
  const [isSignup, setIsSignup] = useState(true) // Default to Sign In (false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    name: "",
  })
  const [error, setError] = useState("")

  // Check authentication status
  useEffect(() => {
    checkAuthStatus()
  }, [onLoginSuccess])

  const checkAuthStatus = () => {
    setIsCheckingAuth(true)
    const storedUser = localStorage.getItem("user")

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        onLoginSuccess(parsedUser)

        // Use setTimeout to ensure navigation happens after component is fully mounted
        setTimeout(() => {
          window.location.href = "/"
        }, 100)
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user") // Clear invalid data
      }
    }

    setIsCheckingAuth(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
  }

  const saveUserToDB = async (userData) => {
    try {
      const response = await fetch("https://backend.indiazo.com/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      const data = await response.json()
      console.log("User saved to DB:", data)
      return data
    } catch (error) {
      console.error("Error saving user to DB:", error)
      setError("Failed to save user data. Please try again.")
      throw error
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.mobile || !formData.password) {
      setError("Please enter both mobile number and password")
      setIsLoading(false)
      return
    }

    try {
      // Check if user exists in database
      const response = await fetch(`https://backend.indiazo.com/api/users?mobile=${formData.mobile}`)
      const users = await response.json()
      const existingUser = users.find((u) => u.userId === formData.mobile)

      if (existingUser) {
        // Verify the password
        if (existingUser.password !== formData.password) {
          setError("Incorrect password. Please try again.")
          setIsLoading(false)
          return
        }

        const userData = {
          userId: formData.mobile,
          name: existingUser.name,
          email: existingUser.email || "al@gmail.com",
          password: formData.password,
          isLoggedIn: true,
        }

        // Update login status in DB
        await saveUserToDB(userData)

        // Store in localStorage (without password)
        const userForStorage = {
          userId: formData.mobile,
          name: existingUser.name,
          email: existingUser.email || "al@gmail.com",
        }

        localStorage.setItem("user", JSON.stringify(userForStorage))
        setUser(userForStorage)

        // Call the onLoginSuccess callback
        onLoginSuccess(userForStorage)

        // Redirect to home page after successful login - with a slight delay to ensure state is updated
        setTimeout(() => {
          window.location.href = "/" // Use direct URL navigation
        }, 300)
      } else {
        setError("User not found. Please sign up first.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Login failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.mobile || !formData.password || !formData.name) {
      setError("Please fill all fields")
      setIsLoading(false)
      return
    }

    try {
      // Check if user already exists
      const response = await fetch(`https://backend.indiazo.com/api/users?mobile=${formData.mobile}`)
      const users = await response.json()
      const existingUser = users.find((u) => u.userId === formData.mobile)

      if (existingUser) {
        setError("User with this mobile number already exists. Please sign in.")
        setIsLoading(false)
        return
      }

      const userData = {
        userId: formData.mobile,
        name: formData.name,
        email: "al@gmail.com",
        password: formData.password, // Include password in the request
        isLoggedIn: true,
      }

      // Save to database
      const result = await saveUserToDB(userData)

      if (result.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }

      // Save to local storage (without password)
      const userForStorage = {
        userId: formData.mobile,
        name: formData.name,
        email: "al@gmail.com",
      }

      localStorage.setItem("user", JSON.stringify(userForStorage))
      setUser(userForStorage)

      // Call the onLoginSuccess callback
      onLoginSuccess(userForStorage)

      // Redirect to home page after successful signup - with a slight delay to ensure state is updated
      setTimeout(() => {
        window.location.href = "/" // Use direct URL navigation
      }, 300)
    } catch (error) {
      console.error("Signup error:", error)
      setError("Signup failed. Please try again.")
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    setIsLoading(true)
    const userId = user?.userId
    if (userId) {
      try {
        // Make sure the endpoint matches exactly what's in your Express router
        await fetch("https://backend.indiazo.com/api/users/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        })
      } catch (error) {
        console.error("Error logging out from DB:", error)
      }
    }
    localStorage.removeItem("user")
    setUser(null)
    setIsLoading(false)
  }

  const toggleMode = () => {
    setIsSignup(!isSignup)
    setError("")
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-indigo-950 to-black">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-500/30 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-b from-gray-900 via-indigo-950 to-black"
    >
      <div className="text-center w-full max-w-md">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8">
          Welcome to Indiazo
        </h1>
        <div className="p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl shadow-xl border-2 border-indigo-500/30">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCircle className="w-12 h-12 text-white" />
          </div>

          {user ? (
            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Hello, {user.name}</h2>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className={`bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed flex items-center justify-center w-full`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-white mb-4">{isSignup ? "Sign Up" : "Sign In"}</h2>

              {error && <div className="mb-4 p-2 bg-red-900/50 text-red-200 rounded-md">{error}</div>}

              <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
                {isSignup && (
                  <div className="flex items-center border-2 border-indigo-500/30 rounded-md px-3 py-2 bg-gray-800">
                    <UserCircle className="text-gray-400 mr-2" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      className="flex-1 outline-none bg-transparent text-white"
                    />
                  </div>
                )}

                <div className="flex items-center border-2 border-indigo-500/30 rounded-md px-3 py-2 bg-gray-800">
                  <Smartphone className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    name="mobile"
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="flex-1 outline-none bg-transparent text-white"
                  />
                </div>

                <div className="flex items-center border-2 border-indigo-500/30 rounded-md px-3 py-2 bg-gray-800">
                  <Lock className="text-gray-400 mr-2" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="flex-1 outline-none bg-transparent text-white"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-md hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Button shine effect */}
                  <div className="absolute inset-0 w-1/3 h-full bg-white/20 skew-x-12 transform -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000 ease-in-out"></div>

                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </>
                  ) : isSignup ? (
                    "Sign Up"
                  ) : (
                    "Sign In"
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-sm text-gray-300">
                {isSignup ? (
                  <p>
                    Already have an account?{" "}
                    <button onClick={toggleMode} className="text-blue-400 hover:underline">
                      Sign In
                    </button>
                  </p>
                ) : (
                  <p>
                    Don't have an account?{" "}
                    <button onClick={toggleMode} className="text-blue-400 hover:underline">
                      Sign Up
                    </button>
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Animated elements */}
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
        <div className="shooting-stars"></div>

        <style jsx>{`
          .stars-small, .stars-medium, .stars-large {
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            background-repeat: repeat;
            pointer-events: none;
            z-index: -1;
          }

          .stars-small {
            background-image: radial-gradient(1px 1px at 10px 10px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 20px 50px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 30px 30px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0));
            background-size: 100px 100px;
            animation: twinkle 4s ease-in-out infinite;
          }

          .stars-medium {
            background-image: radial-gradient(1.5px 1.5px at 150px 150px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 200px 220px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 250px 180px, #fff, rgba(0,0,0,0));
            background-size: 200px 200px;
            animation: twinkle 6s ease-in-out infinite;
            animation-delay: 1s;
          }

          .stars-large {
            background-image: radial-gradient(2px 2px at 120px 120px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 170px 250px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 220px 200px, #fff, rgba(0,0,0,0));
            background-size: 300px 300px;
            animation: twinkle 8s ease-in-out infinite;
            animation-delay: 2s;
          }

          .shooting-stars::before, .shooting-stars::after {
            content: "";
            position: fixed;
            width: 100px;
            height: 2px;
            background: linear-gradient(to right, rgba(0,0,0,0), rgba(255,255,255,0.8), rgba(0,0,0,0));
            border-radius: 50%;
            animation: shooting-star 6s linear infinite;
            top: 0;
            transform: rotate(45deg);
            z-index: -1;
          }

          .shooting-stars::after {
            animation-delay: 3s;
            top: 30%;
            width: 80px;
          }

          @keyframes shooting-star {
            0% {
              transform: translateX(-100%) translateY(0) rotate(45deg);
              opacity: 1;
            }
            70% {
              opacity: 1;
            }
            100% {
              transform: translateX(200%) translateY(300%) rotate(45deg);
              opacity: 0;
            }
          }

          @keyframes twinkle {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }
        `}</style>
      </div>
    </motion.div>
  )
}

export default LoginPage

