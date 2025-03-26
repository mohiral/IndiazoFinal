"use client"

import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import { useEffect, useState } from "react"

const Layout = () => {
  const location = useLocation()
  const [showNavbar, setShowNavbar] = useState(true)

  useEffect(() => {
    // Hide navbar on specific routes
    if (location.pathname === "/CrashGame") {
      setShowNavbar(false)
    } else {
      setShowNavbar(true)
    }
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen w-full mb-16">
      <div className="w-full flex flex-col flex-grow">
        {showNavbar && <Navbar />}
        <main className="flex-grow overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

