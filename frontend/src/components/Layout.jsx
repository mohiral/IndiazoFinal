"use client"

import { Outlet, useLocation } from "react-router-dom"
import Navbar from "./Navbar"
import { useEffect, useState } from "react"

const Layout = () => {
  const location = useLocation()
  const [showNavbar, setShowNavbar] = useState(true)
  const [showBottomNav, setShowBottomNav] = useState(true)

  useEffect(() => {
    // For CrashGame route, show top navbar but hide bottom navbar
    if (location.pathname === "/CrashGame") {
      setShowNavbar(true)
      setShowBottomNav(false)
    } else {
      setShowNavbar(true)
      setShowBottomNav(true)
    }
  }, [location.pathname])

  return (
    <div className="flex flex-col min-h-screen w-full mb-16">
      <div className="w-full flex flex-col flex-grow">
        {showNavbar && <Navbar showBottomNav={showBottomNav} />}
        <main className="flex-grow overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout

