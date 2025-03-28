"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(true) // Default to true to skip login
  const [crashValue, setCrashValue] = useState(2.0)
  const [crashSequence, setCrashSequence] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Default to true to skip login
  const [crashHistory, setCrashHistory] = useState([])
  const [activeSequence, setActiveSequence] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [userBets, setUserBets] = useState([])
  const [betStats, setBetStats] = useState({
    totalUsers: 0,
    totalBets: 0,
    winUsers: 0,
    winAmount: 0,
    lossUsers: 0,
    lossAmount: 0,
    adminProfit: 0,
    isProfit: true,
  })
  const [timeFrame, setTimeFrame] = useState("all")
  const [activeTab, setActiveTab] = useState("dashboard")
  const [games, setGames] = useState([])
  const [gamesPagination, setGamesPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [betsPagination, setBetsPagination] = useState({ page: 1, limit: 50, total: 0, pages: 0 })
  const [selectedGame, setSelectedGame] = useState(null)
  const [gameDetails, setGameDetails] = useState(null)
  // Add a new state to store the overall bet statistics
  const [overallBetStats, setOverallBetStats] = useState({
    totalPlayers: 0,
    totalBets: 0,
    totalBetAmount: 0,
    totalWinAmount: 0,
    adminProfit: 0,
    winCount: 0,
    lossCount: 0,
  })

  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}")
      if (!user || !user.userId) {
        setIsAdmin(false)
        return
      }

      try {
        const response = await fetch(`https://backend.indiazo.com/api/admin/check/${user.userId}`)
        const data = await response.json()
        setIsAdmin(data.isAdmin)
        if (data.isAdmin) {
          setIsAuthenticated(true)
          fetchCrashHistory()
          fetchCrashSequence()
          fetchUserBets()
          fetchBetStats()
          fetchGames()
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      }
    }

    checkAdmin()

    // Initialize data loading regardless of admin status (for demo purposes)
    fetchCrashHistory()
    fetchCrashSequence()
    fetchUserBets()
    fetchBetStats()
    fetchGames()
  }, [])

  // Fetch data when time frame changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchBetStats()
      fetchUserBets()
      fetchGames()

      // Automatically fetch game details when the Games tab is active
      if (activeTab === "games") {
        setTimeout(() => fetchAllBetsData(), 500)
      }
    }
  }, [timeFrame, isAuthenticated, activeTab])

  const fetchCrashHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://backend.indiazo.com/api/admin/crash-history")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCrashHistory(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching crash history:", error)
      setLoading(false)
      // Don't set error state to avoid UI disruption
    }
  }

  const fetchCrashSequence = async () => {
    try {
      const response = await fetch("https://backend.indiazo.com/api/admin/crash-sequence")

      if (response.ok) {
        const data = await response.json()
        setActiveSequence(data)
      } else {
        setActiveSequence(null)
      }
    } catch (error) {
      console.error("Error fetching crash sequence:", error)
      setActiveSequence(null)
    }
  }

  const fetchBetStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://backend.indiazo.com/api/admin/bet-stats?timeFrame=${timeFrame}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Bet stats data:", data) // Debug log
      setBetStats(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching bet statistics:", error)
      setLoading(false)
      // Keep default stats to avoid UI errors
    }
  }

  const fetchUserBets = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://backend.indiazo.com/api/admin/user-bets?timeFrame=${timeFrame}&page=${betsPagination.page}&limit=${betsPagination.limit}`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("User bets data:", data) // Debug log
      setUserBets(data.bets || [])
      setBetsPagination(data.pagination || { page: 1, limit: 50, total: 0, pages: 0 })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching user bets:", error)
      // Set empty array to avoid UI errors
      setUserBets([])
      setLoading(false)
    }
  }

  const fetchGames = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `https://backend.indiazo.com/api/admin/games?timeFrame=${timeFrame}&page=${gamesPagination.page}&limit=${gamesPagination.limit}`,
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Games data received:", data) // Enhanced debug log

      // Check if we have games data
      if (data.games && data.games.length > 0) {
        // Make sure each game has the required properties, set defaults if missing
        const processedGames = data.games.map((game) => ({
          ...game,
          playerCount: game.playerCount || 0,
          totalBetAmount: game.totalBetAmount || 0,
          totalWinAmount: game.totalWinAmount || 0,
          adminProfit: game.adminProfit || 0,
        }))
        setGames(processedGames)
      } else {
        setGames([])
      }

      setGamesPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 })
      setLoading(false)
    } catch (error) {
      console.error("Error fetching games:", error)
      setGames([])
      setLoading(false)
    }
  }

  // New function to fetch all bets data and calculate overall statistics
  const fetchAllBetsData = async () => {
    try {
      setLoading(true)
      console.log("Fetching all bets data...")

      // Get all user bets to calculate overall statistics
      const betsResponse = await fetch(
        `https://backend.indiazo.com/api/admin/user-bets?timeFrame=${timeFrame}&page=1&limit=1000`,
      )

      if (!betsResponse.ok) {
        throw new Error(`HTTP error fetching bets! status: ${betsResponse.status}`)
      }

      const betsData = await betsResponse.json()
      console.log("All user bets data:", betsData)

      if (betsData.bets && betsData.bets.length > 0) {
        // Calculate overall statistics
        const uniqueUsers = new Set(betsData.bets.map((bet) => bet.userId)).size
        const totalBets = betsData.bets.length
        let totalBetAmount = 0
        let totalAdminLoss = 0
        let winCount = 0
        let lossCount = 0

        betsData.bets.forEach((bet) => {
          totalBetAmount += Number(bet.amount) || 0

          if (bet.status === "won") {
            // FIXED: Calculate total win amount as original bet amount + profit
            // For a bet of 10 with 2x multiplier, total win is 20 (original bet + profit)
            const totalWinAmount = Number(bet.amount) * Number(bet.cashoutMultiplier || 1)
            totalAdminLoss += totalWinAmount - Number(bet.amount) // Admin loses only the profit part
            winCount++
          } else {
            lossCount++
          }
        })

        // FIXED: Calculate admin profit correctly
        // Admin profit = total bet amount - total losses to winners
        const adminProfit = totalBetAmount - totalAdminLoss

        // Store the overall statistics
        const stats = {
          totalPlayers: uniqueUsers,
          totalBets: totalBets,
          totalBetAmount: totalBetAmount,
          totalWinAmount: totalAdminLoss,
          adminProfit: adminProfit,
          winCount: winCount,
          lossCount: lossCount,
        }

        console.log("Calculated overall bet statistics:", stats)
        setOverallBetStats(stats)

        // Update the first game in the list to show the overall statistics
        if (games.length > 0) {
          const updatedGames = [...games]
          updatedGames[0] = {
            ...updatedGames[0],
            playerCount: uniqueUsers,
            totalBetAmount: totalBetAmount,
            totalWinAmount: totalAdminLoss,
            adminProfit: adminProfit,
            // Add additional statistics
            isOverallStats: true,
            winCount: winCount,
            lossCount: lossCount,
          }

          setGames(updatedGames)
        }

        setSuccess("Bet statistics loaded successfully")
        setTimeout(() => setSuccess(""), 3000)
      }

      setLoading(false)
    } catch (error) {
      console.error("Error fetching all bets data:", error)
      setError("Failed to load bet statistics. Please try again.")
      setLoading(false)
    }
  }

  const fetchGameDetails = async (gameId) => {
    try {
      setLoading(true)
      const response = await fetch(`https://backend.indiazo.com/api/admin/game-stats/${gameId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log("Game details:", data) // Debug log

      // FIXED: Recalculate profit/loss for each bet
      if (data.bets && data.bets.length > 0) {
        data.bets = data.bets.map((bet) => {
          if (bet.status === "won") {
            // For winning bets, calculate the total win amount (original + profit)
            const totalWinAmount = bet.betAmount * bet.cashoutMultiplier
            const userProfit = bet.betAmount * (bet.cashoutMultiplier - 1)
            return {
              ...bet,
              winAmount: totalWinAmount, // Total amount the user gets back
              profit: userProfit, // This is what the admin lost (player's profit)
            }
          }
          return bet
        })

        // Recalculate total win amount and admin profit
        let totalBetAmount = 0
        let totalWinAmount = 0 // Total amount users received
        let totalAdminLoss = 0 // Amount admin lost (user profits)

        data.bets.forEach((bet) => {
          totalBetAmount += bet.betAmount
          if (bet.status === "won") {
            totalWinAmount += bet.winAmount // Total payout with original bet
            totalAdminLoss += bet.profit // Just the profit part
          }
        })

        data.totalBetAmount = totalBetAmount
        data.totalWinAmount = totalWinAmount
        data.adminProfit = totalBetAmount - totalAdminLoss
      }

      setGameDetails(data)
      setSelectedGame(gameId)
    } catch (error) {
      console.error("Error fetching game details:", error)
      setError("Failed to load game details")
    } finally {
      setLoading(false)
    }
  }

  const handleSetCrashValue = async () => {
    if (crashValue < 1.01) {
      setError("Crash value must be at least 1.01")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("https://backend.indiazo.com/api/admin/set-crash", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ crashValue }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Crash value set to ${crashValue}x for the next game`)
        fetchCrashHistory() // Refresh history
        fetchCrashSequence() // Check if this affects any sequence
      } else {
        setError(data.message || "Failed to set crash value")
      }
    } catch (error) {
      setError("Server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSetCrashSequence = async () => {
    // Parse the comma-separated string into an array of numbers
    const values = crashSequence
      .split(",")
      .map((val) => Number.parseFloat(val.trim()))
      .filter((val) => !isNaN(val))

    if (values.length === 0) {
      setError("Please enter valid crash values separated by commas")
      return
    }

    if (values.some((val) => val < 1.01)) {
      setError("All crash values must be at least 1.01")
      return
    }

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("https://backend.indiazo.com/api/admin/set-crash-sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ crashValues: values }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(`Crash sequence set: ${values.join(", ")}x`)
        fetchCrashHistory() // Refresh history
        fetchCrashSequence() // Refresh sequence data
      } else {
        setError(data.message || "Failed to set crash sequence")
      }
    } catch (error) {
      setError("Server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateSequence = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("https://backend.indiazo.com/api/admin/deactivate-crash-sequence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Crash sequence deactivated")
        setActiveSequence(null)
      } else {
        setError(data.message || "Failed to deactivate crash sequence")
      }
    } catch (error) {
      setError("Server error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    fetchCrashHistory()
    fetchUserBets()
    fetchBetStats()
    fetchGames()
    if (activeTab === "games") {
      setTimeout(() => fetchAllBetsData(), 500)
    }
    if (selectedGame) {
      fetchGameDetails(selectedGame)
    }
  }

  const handleTimeFrameChange = (newTimeFrame) => {
    setTimeFrame(newTimeFrame)
    // Reset pagination when changing time frame
    setBetsPagination((prev) => ({ ...prev, page: 1 }))
    setGamesPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleBetsPageChange = (newPage) => {
    setBetsPagination((prev) => ({ ...prev, page: newPage }))
    fetchUserBets()
  }

  const handleGamesPageChange = (newPage) => {
    setGamesPagination((prev) => ({ ...prev, page: newPage }))
    fetchGames()
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown"
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatCurrency = (amount) => {
    return `₹${Number.parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-2 md:p-4">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-0">Crash Game Admin Panel</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={refreshData} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm">
              Refresh Data
            </button>
            <button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
              Back to Game
            </button>
          </div>
        </div>

        {/* Admin Help Card */}
        <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 mb-4">
          <h3 className="text-blue-300 font-medium mb-2">Admin Quick Guide</h3>
          <div className="text-sm text-blue-100 space-y-1">
            <p>
              • <strong>Dashboard</strong>: View overall game statistics and recent activity
            </p>
            <p>
              • <strong>Games History</strong>: See detailed game results and player bets
            </p>
            <p>
              • <strong>User Bets</strong>: Track all player betting activity
            </p>
            <p>
              • <strong>Game Settings</strong>: Control crash values and sequences
            </p>
            <p className="text-blue-300 mt-2">
              💡 Tip: Use the time period filters to analyze data from different timeframes
            </p>
          </div>
        </div>

        {success && (
          <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-2 rounded mb-4">{success}</div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded mb-4">{error}</div>
        )}

        {/* Time Frame Selector */}
        <div className="mb-4 md:mb-6 bg-gray-800 p-3 md:p-4 rounded-lg shadow-lg">
          <h2 className="text-base md:text-lg font-semibold mb-2 md:mb-3">Time Period</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleTimeFrameChange("hour")}
              className={`px-3 py-1 rounded-md text-sm ${timeFrame === "hour" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              Last Hour
            </button>
            <button
              onClick={() => handleTimeFrameChange("today")}
              className={`px-3 py-1 rounded-md text-sm ${timeFrame === "today" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              Today
            </button>
            <button
              onClick={() => handleTimeFrameChange("week")}
              className={`px-3 py-1 rounded-md text-sm ${timeFrame === "week" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              This Week
            </button>
            <button
              onClick={() => handleTimeFrameChange("month")}
              className={`px-3 py-1 rounded-md text-sm ${timeFrame === "month" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              This Month
            </button>
            <button
              onClick={() => handleTimeFrameChange("all")}
              className={`px-3 py-1 rounded-md text-sm ${timeFrame === "all" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
            >
              All Time
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4 md:mb-6 overflow-x-auto">
          <div className="border-b border-gray-700 min-w-max">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`py-2 px-3 md:px-4 text-center border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === "dashboard"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("games")}
                className={`py-2 px-3 md:px-4 text-center border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === "games"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                Games History
              </button>
              <button
                onClick={() => setActiveTab("bets")}
                className={`py-2 px-3 md:px-4 text-center border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === "bets"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                User Bets
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-2 px-3 md:px-4 text-center border-b-2 font-medium text-xs md:text-sm ${
                  activeTab === "settings"
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                Game Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && <div className="fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <>
            {/* Game Statistics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow-lg">
                <h3 className="text-gray-400 text-xs md:text-sm mb-1">Total Users</h3>
                <p className="text-xl md:text-2xl font-bold">{betStats.totalUsers}</p>
                <p className="text-xs md:text-sm text-gray-400">Total Bets: {betStats.totalBets}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow-lg">
                <h3 className="text-gray-400 text-xs md:text-sm mb-1">Winning Users</h3>
                <p className="text-xl md:text-2xl font-bold text-green-400">{betStats.winUsers}</p>
                <p className="text-xs md:text-sm text-green-400">{formatCurrency(betStats.winAmount)}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 md:p-4 shadow-lg">
                <h3 className="text-gray-400 text-xs md:text-sm mb-1">Losing Users</h3>
                <p className="text-xl md:text-2xl font-bold text-red-400">{betStats.lossUsers}</p>
                <p className="text-xs md:text-sm text-red-400">{formatCurrency(betStats.lossAmount)}</p>
              </div>

              <div
                className={`bg-gray-800 rounded-lg p-3 md:p-4 shadow-lg ${betStats.isProfit ? "border-green-500" : "border-red-500"} border`}
              >
                <h3 className="text-gray-400 text-xs md:text-sm mb-1">Admin Status</h3>
                <p className={`text-xl md:text-2xl font-bold ${betStats.isProfit ? "text-green-400" : "text-red-400"}`}>
                  {betStats.isProfit ? "Profit" : "Loss"}
                </p>
                <p className={`text-xs md:text-sm ${betStats.isProfit ? "text-green-400" : "text-red-400"}`}>
                  {formatCurrency(Math.abs(betStats.adminProfit))}
                </p>
              </div>
            </div>

            {/* Recent Games and Bets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Recent Games */}
              <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg md:text-xl font-semibold">Recent Games</h2>
                  <button
                    onClick={refreshData}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs md:text-sm"
                  >
                    Refresh
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <div className="min-w-full">
                    {/* Mobile-friendly game cards */}
                    <div className="lg:hidden space-y-3">
                      {games.slice(0, 5).map((game, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 rounded-lg p-3 cursor-pointer"
                          onClick={() => fetchGameDetails(game.gameId)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-xs text-gray-400">Time:</p>
                              <p className="text-sm">{formatDate(game.timestamp)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Crash Point:</p>
                              <p
                                className={`text-sm font-medium ${game.crashPoint < 2 ? "text-red-400" : "text-green-400"}`}
                              >
                                {game.crashPoint.toFixed(2)}x
                                {game.isAdminSet && <span className="ml-1 text-xs text-yellow-400">(Admin)</span>}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-gray-400">Players:</p>
                              <p className="text-sm">{game.playerCount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Profit/Loss:</p>
                              <p className={`text-sm ${game.adminProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                                {game.adminProfit >= 0 ? "+" : "-"}
                                {formatCurrency(Math.abs(game.adminProfit))}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {games.length === 0 && (
                        <div className="py-4 text-center text-gray-400">
                          <p>No games found</p>
                        </div>
                      )}
                    </div>

                    {/* Desktop table view */}
                    <table className="hidden lg:table min-w-full divide-y divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Time
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Crash Point
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Players
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                            Profit/Loss
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-700">
                        {games.slice(0, 5).map((game, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-700 cursor-pointer"
                            onClick={() => fetchGameDetails(game.gameId)}
                          >
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(game.timestamp)}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span
                                className={`font-medium ${game.crashPoint < 2 ? "text-red-400" : "text-green-400"}`}
                              >
                                {game.crashPoint.toFixed(2)}x
                              </span>
                              {game.isAdminSet && <span className="ml-2 text-xs text-yellow-400">(Admin)</span>}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap text-sm">{game.playerCount}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <span className={game.adminProfit >= 0 ? "text-green-400" : "text-red-400"}>
                                {game.adminProfit >= 0 ? "+" : "-"}
                                {formatCurrency(Math.abs(game.adminProfit))}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {games.length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-4 py-4 text-center text-gray-400">
                              No games found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button onClick={() => setActiveTab("games")} className="text-blue-400 hover:text-blue-300 text-sm">
                    View All Games
                  </button>
                </div>
              </div>

              {/* Recent Bets */}
              <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg md:text-xl font-semibold">Recent Bets</h2>
                  <button
                    onClick={fetchUserBets}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs md:text-sm"
                  >
                    Refresh Bets
                  </button>
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {userBets.slice(0, 5).map((bet, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${bet.status === "won" ? "bg-green-900/30 border border-green-800" : "bg-red-900/30 border border-red-800"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{bet.userId || "Anonymous"}</p>
                          <p className="text-xs text-gray-400">{formatDate(bet.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-sm ${bet.status === "won" ? "text-green-400" : "text-red-400"}`}
                          >
                            {bet.status === "won"
                              ? `+${formatCurrency(bet.profit || 0)}`
                              : `-${formatCurrency(bet.amount || 0)}`}
                          </p>
                          {bet.status === "won" && (
                            <p className="text-xs text-gray-400">
                              Cashed out at {bet.cashoutMultiplier?.toFixed(2) || "0.00"}x
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-1 flex justify-between text-xs text-gray-400">
                        <span>Bet: {formatCurrency(bet.amount || 0)}</span>
                        <span>Game ID: {bet.gameId?.substring(0, 8) || "Unknown"}...</span>
                      </div>
                    </div>
                  ))}
                  {userBets.length === 0 && (
                    <div className="py-8 text-center text-gray-400">
                      <p>No bet data available</p>
                      <p className="mt-2 text-sm">Try refreshing or changing the time period</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <button onClick={() => setActiveTab("bets")} className="text-blue-400 hover:text-blue-300 text-sm">
                    View All Bets
                  </button>
                </div>
              </div>
            </div>

            {/* Game Details Modal */}
            {selectedGame && gameDetails && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
                <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  <div className="p-4 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg md:text-xl font-semibold">Game Details</h2>
                      <button
                        onClick={() => {
                          setSelectedGame(null)
                          setGameDetails(null)
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <p className="text-gray-400 text-xs md:text-sm">Game ID:</p>
                        <p className="font-medium text-sm md:text-base">{gameDetails.gameId}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs md:text-sm">Time:</p>
                        <p className="font-medium text-sm md:text-base">{formatDate(gameDetails.timestamp)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs md:text-sm">Crash Point:</p>
                        <p
                          className={`font-medium text-sm md:text-base ${gameDetails.crashPoint < 2 ? "text-red-400" : "text-green-400"}`}
                        >
                          {gameDetails.crashPoint}x
                          {gameDetails.isAdminSet && <span className="ml-2 text-xs text-yellow-400">(Admin Set)</span>}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs md:text-sm">Admin Profit/Loss:</p>
                        <p
                          className={`font-medium text-sm md:text-base ${gameDetails.adminProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                        >
                          {gameDetails.adminProfit >= 0 ? "+" : "-"}
                          {formatCurrency(Math.abs(gameDetails.adminProfit))}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs md:text-sm">Total Bets:</p>
                        <p className="font-medium text-sm md:text-base">{gameDetails.totalBets}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs md:text-sm">Total Bet Amount:</p>
                        <p className="font-medium text-sm md:text-base">{formatCurrency(gameDetails.totalBetAmount)}</p>
                      </div>
                    </div>

                    <h3 className="text-base md:text-lg font-medium mb-3">Player Bets</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                      <div className="bg-gray-700 rounded-lg p-3">
                        <h4 className="text-xs md:text-sm text-gray-400">Total Players</h4>
                        <p className="text-lg md:text-xl font-bold">{gameDetails.bets.length}</p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <h4 className="text-xs md:text-sm text-gray-400">Winners</h4>
                        <p className="text-lg md:text-xl font-bold text-green-400">
                          {gameDetails.bets.filter((bet) => bet.status === "won").length}
                        </p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <h4 className="text-xs md:text-sm text-gray-400">Losers</h4>
                        <p className="text-lg md:text-xl font-bold text-red-400">
                          {gameDetails.bets.filter((bet) => bet.status === "lost").length}
                        </p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-3">
                        <h4 className="text-xs md:text-sm text-gray-400">Win Rate</h4>
                        <p className="text-lg md:text-xl font-bold">
                          {gameDetails.bets.length > 0
                            ? `${Math.round((gameDetails.bets.filter((bet) => bet.status === "won").length / gameDetails.bets.length) * 100)}%`
                            : "0%"}
                        </p>
                      </div>
                    </div>

                    {/* Mobile-friendly bet list */}
                    <div className="lg:hidden space-y-3 mb-4">
                      {gameDetails.bets.map((bet, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${bet.status === "won" ? "bg-green-900/30 border border-green-800" : "bg-red-900/30 border border-red-800"}`}
                        >
                          <div className="flex justify-between">
                            <div>
                              <p className="text-sm font-medium">{bet.userId}</p>
                              <p className="text-xs text-gray-400">Bet: {formatCurrency(bet.betAmount)}</p>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-sm font-medium ${bet.status === "won" ? "text-green-400" : "text-red-400"}`}
                              >
                                {bet.status === "won" ? "Won" : "Lost"}
                              </p>
                              <p className="text-xs text-gray-400">
                                {bet.status === "won" ? `Cashout: ${bet.cashoutMultiplier.toFixed(2)}x` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 text-right">
                            <span className={`text-sm ${bet.status === "won" ? "text-green-400" : "text-red-400"}`}>
                              {bet.status === "won" ? "+" : "-"}
                              {formatCurrency(bet.status === "won" ? bet.profit : bet.betAmount)}
                            </span>
                          </div>
                        </div>
                      ))}
                      {gameDetails.bets.length === 0 && (
                        <div className="py-4 text-center text-gray-400">
                          <p>No bets for this game</p>
                        </div>
                      )}
                    </div>

                    {/* Desktop table view */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Player
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Bet Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Result
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Cashout
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                              Profit/Loss
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {gameDetails.bets.map((bet, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{bet.userId}</td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(bet.betAmount)}</td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    bet.status === "won"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                  }`}
                                >
                                  {bet.status === "won" ? "Won" : "Lost"}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap text-sm">
                                {bet.status === "won" ? `${bet.cashoutMultiplier.toFixed(2)}x` : "-"}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={bet.status === "won" ? "text-green-400" : "text-red-400"}>
                                  {bet.status === "won" ? "+" : "-"}
                                  {formatCurrency(bet.status === "won" ? bet.profit : bet.betAmount)}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {gameDetails.bets.length === 0 && (
                            <tr>
                              <td colSpan="5" className="px-4 py-4 text-center text-gray-400">
                                No bets for this game
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <h3 className="text-base md:text-lg font-medium mb-3">Game Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-700 rounded-lg p-4">
                          <h4 className="text-xs md:text-sm text-gray-400 mb-2">Betting Summary</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-300 text-sm">Total Bets:</span>
                              <span className="font-medium text-sm">{formatCurrency(gameDetails.totalBetAmount)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300 text-sm">Total Wins:</span>
                              <span className="font-medium text-sm text-green-400">
                                {formatCurrency(gameDetails.totalWinAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300 text-sm">House Edge:</span>
                              <span
                                className={`font-medium text-sm ${gameDetails.adminProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                              >
                                {formatCurrency(Math.abs(gameDetails.adminProfit))}(
                                {gameDetails.adminProfit >= 0 ? "Profit" : "Loss"})
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-4">
                          <h4 className="text-xs md:text-sm text-gray-400 mb-2">Player Statistics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-300 text-sm">Unique Players:</span>
                              <span className="font-medium text-sm">
                                {new Set(gameDetails.bets.map((bet) => bet.userId)).size}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300 text-sm">Average Bet:</span>
                              <span className="font-medium text-sm">
                                {gameDetails.bets.length > 0
                                  ? formatCurrency(gameDetails.totalBetAmount / gameDetails.bets.length)
                                  : formatCurrency(0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300 text-sm">Highest Cashout:</span>
                              <span className="font-medium text-sm text-green-400">
                                {gameDetails.bets.filter((bet) => bet.status === "won").length > 0
                                  ? `${Math.max(...gameDetails.bets.filter((bet) => bet.status === "won").map((bet) => bet.cashoutMultiplier)).toFixed(2)}x`
                                  : "-"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Games History Tab */}
        {activeTab === "games" && (
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold mb-2 md:mb-0">Games History</h2>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    refreshData()
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs md:text-sm"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Refresh Data"}
                </button>
                <button
                  onClick={fetchAllBetsData}
                  className="bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded text-xs md:text-sm"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Load Bet Statistics"}
                </button>
              </div>
            </div>

            {loading && (
              <div className="text-center py-4 bg-gray-700/50 rounded-lg mb-4">
                <p className="text-gray-300 font-medium">Loading game data...</p>
                <p className="text-gray-400 text-xs md:text-sm mt-1">
                  This may take a moment to process all game information
                </p>
              </div>
            )}

            {/* Overall Betting Statistics Card */}
            {overallBetStats.totalBets > 0 && (
              <div className="bg-gray-700/50 rounded-lg p-3 md:p-4 mb-4 md:mb-6 border border-blue-500/30">
                <h3 className="text-base md:text-lg font-medium mb-2 md:mb-3 text-blue-400">
                  Overall Betting Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-xs md:text-sm text-gray-400">Total Players</h4>
                    <p className="text-lg md:text-xl font-bold">{overallBetStats.totalPlayers}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-xs md:text-sm text-gray-400">Total Bets</h4>
                    <p className="text-lg md:text-xl font-bold">{overallBetStats.totalBets}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(overallBetStats.totalBetAmount)}</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-xs md:text-sm text-gray-400">Win/Loss</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 font-bold">{overallBetStats.winCount}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-400 font-bold">{overallBetStats.lossCount}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {Math.round((overallBetStats.winCount / overallBetStats.totalBets) * 100)}% win rate
                    </p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-3">
                    <h4 className="text-xs md:text-sm text-gray-400">Profit/Loss</h4>
                    <p
                      className={`text-lg md:text-xl font-bold ${overallBetStats.adminProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                    >
                      {overallBetStats.adminProfit >= 0 ? "+" : "-"}
                      {formatCurrency(Math.abs(overallBetStats.adminProfit))}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile-friendly game cards */}
            <div className="lg:hidden space-y-3 mb-4">
              {games.map((game, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg cursor-pointer ${game.isOverallStats ? "bg-blue-900/20" : "bg-gray-700 hover:bg-gray-600"}`}
                  onClick={() => (game.isOverallStats ? null : fetchGameDetails(game.gameId))}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-400">Time:</p>
                      <p className="text-sm">
                        {game.isOverallStats ? (
                          <span className="font-medium text-blue-400">Overall Stats</span>
                        ) : (
                          formatDate(game.timestamp)
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Crash Point:</p>
                      <p className="text-sm">
                        {game.isOverallStats ? (
                          "-"
                        ) : (
                          <span className={`font-medium ${game.crashPoint < 2 ? "text-red-400" : "text-green-400"}`}>
                            {game.crashPoint.toFixed(2)}x
                            {game.isAdminSet && <span className="ml-1 text-xs text-yellow-400">(Admin)</span>}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-400">Players:</p>
                      <p className="text-sm">
                        {game.isOverallStats ? (
                          <span className="font-medium">{overallBetStats.totalPlayers}</span>
                        ) : game.playerCount !== undefined ? (
                          game.playerCount
                        ) : (
                          "-"
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Bets:</p>
                      <p className="text-sm">
                        {game.isOverallStats
                          ? formatCurrency(overallBetStats.totalBetAmount)
                          : game.totalBetAmount !== undefined
                            ? formatCurrency(game.totalBetAmount)
                            : "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-400">Total Wins:</p>
                      <p className="text-sm">
                        {game.isOverallStats
                          ? formatCurrency(overallBetStats.totalWinAmount)
                          : game.totalWinAmount !== undefined
                            ? formatCurrency(game.totalWinAmount)
                            : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Profit/Loss:</p>
                      <p className="text-sm">
                        {game.isOverallStats ? (
                          <span className={overallBetStats.adminProfit >= 0 ? "text-green-400" : "text-red-400"}>
                            {overallBetStats.adminProfit >= 0 ? "+" : "-"}
                            {formatCurrency(Math.abs(overallBetStats.adminProfit))}
                          </span>
                        ) : game.adminProfit !== undefined ? (
                          <span className={game.adminProfit >= 0 ? "text-green-400" : "text-red-400"}>
                            {game.adminProfit >= 0 ? "+" : "-"}
                            {formatCurrency(Math.abs(game.adminProfit))}
                          </span>
                        ) : (
                          "-"
                        )}
                      </p>
                    </div>
                  </div>
                  {!game.isOverallStats && (
                    <div className="mt-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          fetchGameDetails(game.gameId)
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {games.length === 0 && (
                <div className="py-4 text-center text-gray-400">
                  <p>No games found</p>
                </div>
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Game ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Crash Point
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Players
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total Bets
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total Wins
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Profit/Loss
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {games.map((game, index) => (
                    <tr key={index} className={`hover:bg-gray-700 ${game.isOverallStats ? "bg-blue-900/20" : ""}`}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {game.isOverallStats ? (
                          <span className="font-medium text-blue-400">Overall Stats</span>
                        ) : (
                          formatDate(game.timestamp)
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {game.isOverallStats ? "-" : game.gameId.substring(0, 8) + "..."}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {game.isOverallStats ? (
                          "-"
                        ) : (
                          <>
                            <span className={`font-medium ${game.crashPoint < 2 ? "text-red-400" : "text-green-400"}`}>
                              {game.crashPoint.toFixed(2)}x
                            </span>
                            {game.isAdminSet && <span className="ml-2 text-xs text-yellow-400">(Admin)</span>}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {game.isOverallStats ? (
                          <span className="font-medium">{overallBetStats.totalPlayers}</span>
                        ) : game.playerCount !== undefined ? (
                          game.playerCount
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {game.isOverallStats
                          ? formatCurrency(overallBetStats.totalBetAmount)
                          : game.totalBetAmount !== undefined
                            ? formatCurrency(game.totalBetAmount)
                            : "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {game.isOverallStats
                          ? formatCurrency(overallBetStats.totalWinAmount)
                          : game.totalWinAmount !== undefined
                            ? formatCurrency(game.totalWinAmount)
                            : "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {game.isOverallStats ? (
                          <span className={overallBetStats.adminProfit >= 0 ? "text-green-400" : "text-red-400"}>
                            {overallBetStats.adminProfit >= 0 ? "+" : "-"}
                            {formatCurrency(Math.abs(overallBetStats.adminProfit))}
                          </span>
                        ) : game.adminProfit !== undefined ? (
                          <span className={game.adminProfit >= 0 ? "text-green-400" : "text-red-400"}>
                            {game.adminProfit >= 0 ? "+" : "-"}
                            {formatCurrency(Math.abs(game.adminProfit))}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {game.isOverallStats ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <button
                            onClick={() => fetchGameDetails(game.gameId)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {games.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-4 py-4 text-center text-gray-400">
                        No games found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {gamesPagination.pages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleGamesPageChange(Math.max(1, gamesPagination.page - 1))}
                    disabled={gamesPagination.page === 1}
                    className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 disabled:opacity-50 text-sm"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex flex-wrap gap-1">
                    {[...Array(Math.min(5, gamesPagination.pages))].map((_, i) => {
                      // Calculate page numbers to show
                      let pageNum
                      if (gamesPagination.pages <= 5) {
                        pageNum = i + 1
                      } else if (gamesPagination.page <= 3) {
                        pageNum = i + 1
                      } else if (gamesPagination.page >= gamesPagination.pages - 2) {
                        pageNum = gamesPagination.pages - 4 + i
                      } else {
                        pageNum = gamesPagination.page - 2 + i
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleGamesPageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                            gamesPagination.page === pageNum
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handleGamesPageChange(Math.min(gamesPagination.pages, gamesPagination.page + 1))}
                    disabled={gamesPagination.page === gamesPagination.pages}
                    className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}

        {/* User Bets Tab */}
        {activeTab === "bets" && (
          <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold">User Bets</h2>
              <button
                onClick={refreshData}
                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                Refresh Data
              </button>
            </div>

            {/* Mobile-friendly bet cards */}
            <div className="lg:hidden space-y-3 mb-4">
              {userBets.map((bet, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${bet.status === "won" ? "bg-green-900/30 border border-green-800" : "bg-red-900/30 border border-red-800"}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-400">Time:</p>
                      <p className="text-sm">{formatDate(bet.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Player:</p>
                      <p className="text-sm">{bet.userId}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-gray-400">Game ID:</p>
                      <p className="text-sm">{bet.gameId ? bet.gameId.substring(0, 8) + "..." : "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Bet Amount:</p>
                      <p className="text-sm">{formatCurrency(bet.amount)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-gray-400">Result:</p>
                      <p className={`text-sm font-medium ${bet.status === "won" ? "text-green-400" : "text-red-400"}`}>
                        {bet.status === "won"
                          ? `Cashed out at ${bet.cashoutMultiplier?.toFixed(2) || "0.00"}x`
                          : "Lost"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Profit/Loss:</p>
                      <p className={`text-sm font-medium ${bet.status === "won" ? "text-green-400" : "text-red-400"}`}>
                        {bet.status === "won" ? "+" : "-"}
                        {formatCurrency(bet.status === "won" ? bet.profit : bet.amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {userBets.length === 0 && (
                <div className="py-4 text-center text-gray-400">
                  <p>No bets found</p>
                </div>
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Game ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Bet Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Profit/Loss
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {userBets.map((bet, index) => (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{formatDate(bet.createdAt)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{bet.userId}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        {bet.gameId ? bet.gameId.substring(0, 8) + "..." : "Unknown"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{formatCurrency(bet.amount)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`font-medium ${bet.status === "won" ? "text-green-400" : "text-red-400"}`}>
                          {bet.status === "won"
                            ? `Cashed out at ${bet.cashoutMultiplier?.toFixed(2) || "0.00"}x`
                            : "Lost"}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={bet.status === "won" ? "text-green-400" : "text-red-400"}>
                          {bet.status === "won" ? "+" : "-"}
                          {formatCurrency(bet.status === "won" ? bet.profit : bet.amount)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {userBets.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-4 text-center text-gray-400">
                        No bets found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {betsPagination.pages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleBetsPageChange(Math.max(1, betsPagination.page - 1))}
                    disabled={betsPagination.page === 1}
                    className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 disabled:opacity-50 text-sm"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  <div className="flex flex-wrap gap-1">
                    {[...Array(Math.min(5, betsPagination.pages))].map((_, i) => {
                      // Calculate page numbers to show
                      let pageNum
                      if (betsPagination.pages <= 5) {
                        pageNum = i + 1
                      } else if (betsPagination.page <= 3) {
                        pageNum = i + 1
                      } else if (betsPagination.page >= betsPagination.pages - 2) {
                        pageNum = betsPagination.pages - 4 + i
                      } else {
                        pageNum = betsPagination.page - 2 + i
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleBetsPageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${
                            betsPagination.page === pageNum
                              ? "bg-blue-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handleBetsPageChange(Math.min(betsPagination.pages, betsPagination.page + 1))}
                    disabled={betsPagination.page === betsPagination.pages}
                    className="px-3 py-1 rounded-md bg-gray-700 text-gray-300 disabled:opacity-50 text-sm"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}

        {/* Game Settings Tab */}
        {activeTab === "settings" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Set Crash Value */}
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Set Next Crash Value</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="crashValue" className="block text-sm font-medium mb-1">
                    Crash Value (Multiplier)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="crashValue"
                      value={crashValue}
                      onChange={(e) => setCrashValue(Number(e.target.value))}
                      min="1.01"
                      step="0.01"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="bg-gray-600 px-3 py-2 rounded-r">x</span>
                  </div>
                </div>

                <button
                  onClick={handleSetCrashValue}
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {loading ? "Setting..." : "Set Single Crash Value"}
                </button>

                <div className="bg-yellow-900/30 border border-yellow-800 rounded-lg p-3 text-sm text-yellow-200">
                  <p className="font-medium mb-1">⚠️ Admin Profit Calculation</p>
                  <p>When a player bets ₹10 and cashes out at 2x:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Player receives ₹20 total (original ₹10 + ₹10 profit)</li>
                    <li>Admin loses ₹10 (the player's profit amount)</li>
                    <li>If player doesn't cash out and plane crashes, admin gains ₹10</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-400">
                  This will force the next game to crash at exactly this multiplier value.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-700">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Set Crash Sequence</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="crashSequence" className="block text-sm font-medium mb-1">
                      Crash Values (comma separated)
                    </label>
                    <input
                      type="text"
                      id="crashSequence"
                      value={crashSequence}
                      onChange={(e) => setCrashSequence(e.target.value)}
                      placeholder="2.0, 5.0, 7.0"
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleSetCrashSequence}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  >
                    {loading ? "Setting..." : "Set Crash Sequence"}
                  </button>

                  {activeSequence && (
                    <div className="mt-4 p-3 bg-gray-700/50 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm text-gray-300">Active sequence: </span>
                          <span className="text-yellow-400 font-medium">{activeSequence.crashValues.join(", ")}x</span>
                          <div className="text-xs text-gray-400 mt-1">
                            Next crash: {activeSequence.crashValues[activeSequence.currentIndex]}x (#
                            {activeSequence.currentIndex + 1}/{activeSequence.crashValues.length})
                          </div>
                        </div>
                        <button
                          onClick={handleDeactivateSequence}
                          className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                        >
                          Deactivate
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-gray-400">
                    This will set a repeating sequence of crash values. The game will crash at these values in order,
                    then loop back to the first value.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Crash History */}
            <div className="bg-gray-800 rounded-lg p-4 md:p-6 shadow-lg">
              <h2 className="text-lg md:text-xl font-semibold mb-4">Recent Crash Points</h2>
              <div className="flex flex-wrap gap-2">
                {crashHistory.length > 0 ? (
                  crashHistory.map((crash, index) => (
                    <div
                      key={index}
                      className={`px-3 py-2 rounded-lg ${crash.crashPoint < 2 ? "bg-red-900/30 border border-red-800" : "bg-green-900/30 border border-green-800"}`}
                    >
                      <div className="flex flex-col items-center">
                        <span className={`font-bold ${crash.crashPoint < 2 ? "text-red-400" : "text-green-400"}`}>
                          {crash.crashPoint.toFixed(2)}x
                        </span>
                        <span className="text-xs text-gray-400">{new Date(crash.timestamp).toLocaleTimeString()}</span>
                        {crash.isAdminSet && <span className="text-xs text-yellow-400 mt-1">Admin Set</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-gray-400 w-full">
                    <p>No crash history available</p>
                  </div>
                )}
              </div>

              {/* Admin Tips */}
              <div className="mt-6 bg-blue-900/30 border border-blue-800 rounded-lg p-4">
                <h3 className="text-blue-300 font-medium mb-2">Admin Tips</h3>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li>
                    <span className="font-medium">House Edge:</span> The game has a built-in 5% house edge on random
                    crashes
                  </li>
                  <li>
                    <span className="font-medium">Profit Calculation:</span> When a player wins, the admin loses the
                    original bet amount
                  </li>
                  <li>
                    <span className="font-medium">Crash Sequences:</span> Use sequences to create patterns that keep
                    players engaged
                  </li>
                  <li>
                    <span className="font-medium">Monitoring:</span> Regularly check the dashboard to track overall
                    performance
                  </li>
                </ul>
              </div>

              {/* Game Statistics */}
              <div className="mt-6 bg-gray-700 rounded-lg p-4">
                <h3 className="text-gray-300 font-medium mb-3">Game Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Average Crash Point:</p>
                    <p className="text-lg font-bold">
                      {crashHistory.length > 0
                        ? (
                            crashHistory.reduce((sum, crash) => sum + crash.crashPoint, 0) / crashHistory.length
                          ).toFixed(2) + "x"
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Admin-Set Crashes:</p>
                    <p className="text-lg font-bold">
                      {crashHistory.filter((crash) => crash.isAdminSet).length} / {crashHistory.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Crashes Below 2x:</p>
                    <p className="text-lg font-bold text-red-400">
                      {crashHistory.filter((crash) => crash.crashPoint < 2).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Crashes Above 2x:</p>
                    <p className="text-lg font-bold text-green-400">
                      {crashHistory.filter((crash) => crash.crashPoint >= 2).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

