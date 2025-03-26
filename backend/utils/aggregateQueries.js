const Bet = require("../models/bet")
const Game = require("../models/game")
const mongoose = require("mongoose")

// This file contains example MongoDB aggregate queries for game statistics

// Example 1: Get statistics for a specific game
const getGameStats = async (gameId) => {
  const result = await Bet.aggregate([
    // Match bets for this game
    { $match: { gameId } },

    // Group by game and calculate statistics
    {
      $group: {
        _id: "$gameId",
        totalBets: { $sum: 1 },
        totalPlayers: { $addToSet: "$userId" },
        totalBetAmount: { $sum: "$amount" },
        totalWinAmount: {
          $sum: {
            $cond: [{ $eq: ["$status", "won"] }, "$winAmount", 0],
          },
        },
        wonBets: {
          $sum: {
            $cond: [{ $eq: ["$status", "won"] }, 1, 0],
          },
        },
        lostBets: {
          $sum: {
            $cond: [{ $eq: ["$status", "lost"] }, 1, 0],
          },
        },
      },
    },

    // Add calculated fields
    {
      $addFields: {
        totalPlayerCount: { $size: "$totalPlayers" },
        houseProfit: { $subtract: ["$totalBetAmount", "$totalWinAmount"] },
      },
    },

    // Project the fields we want
    {
      $project: {
        _id: 0,
        gameId: "$_id",
        totalBets: 1,
        totalPlayerCount: 1,
        totalBetAmount: 1,
        totalWinAmount: 1,
        wonBets: 1,
        lostBets: 1,
        houseProfit: 1,
      },
    },
  ])

  return result[0]
}

// Example 2: Get daily statistics
const getDailyStats = async (startDate, endDate) => {
  // Convert dates to ObjectId timestamps
  const result = await Game.aggregate([
    // Match games in the date range
    {
      $match: {
        status: "completed",
        startTime: { $gte: startDate, $lte: endDate },
      },
    },

    // Group by day
    {
      $group: {
        _id: {
          year: { $year: "$startTime" },
          month: { $month: "$startTime" },
          day: { $dayOfMonth: "$startTime" },
        },
        games: { $push: "$$ROOT" },
        gameIds: { $push: "$gameId" },
        gameCount: { $sum: 1 },
        avgCrashPoint: { $avg: "$crashPoint" },
      },
    },

    // Sort by date
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
        "_id.day": 1,
      },
    },
  ])

  // For each day, get bet statistics
  for (const day of result) {
    const betStats = await Bet.aggregate([
      // Match bets for games on this day
      {
        $match: {
          gameId: { $in: day.gameIds },
        },
      },

      // Group and calculate statistics
      {
        $group: {
          _id: null,
          totalBets: { $sum: 1 },
          uniquePlayers: { $addToSet: "$userId" },
          totalBetAmount: { $sum: "$amount" },
          totalWinAmount: {
            $sum: {
              $cond: [{ $eq: ["$status", "won"] }, "$winAmount", 0],
            },
          },
        },
      },

      // Add calculated fields
      {
        $addFields: {
          playerCount: { $size: "$uniquePlayers" },
          houseProfit: { $subtract: ["$totalBetAmount", "$totalWinAmount"] },
        },
      },
    ])

    // Add bet statistics to the day's result
    day.betStats = betStats[0] || {
      totalBets: 0,
      playerCount: 0,
      totalBetAmount: 0,
      totalWinAmount: 0,
      houseProfit: 0,
    }

    // Format the date
    day.date = new Date(day._id.year, day._id.month - 1, day._id.day)

    // Remove unnecessary fields
    delete day.games
    delete day.gameIds
  }

  return result
}

// Example 3: Get player performance statistics
const getPlayerStats = async (userId, timeFrame = "all") => {
  let startDate = new Date(0)

  // Set the appropriate start date based on the time frame
  if (timeFrame !== "all") {
    const now = new Date()
    switch (timeFrame) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case "week":
        startDate = new Date(now.setDate(now.getDate() - now.getDay()))
        startDate.setHours(0, 0, 0, 0)
        break
      case "month":
        startDate = new Date(now.setDate(1))
        startDate.setHours(0, 0, 0, 0)
        break
    }
  }

  const result = await Bet.aggregate([
    // Match bets for this user in the time frame
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate },
      },
    },

    // Group and calculate statistics
    {
      $group: {
        _id: "$userId",
        totalBets: { $sum: 1 },
        totalBetAmount: { $sum: "$amount" },
        totalWinAmount: {
          $sum: {
            $cond: [{ $eq: ["$status", "won"] }, "$winAmount", 0],
          },
        },
        wonBets: {
          $sum: {
            $cond: [{ $eq: ["$status", "won"] }, 1, 0],
          },
        },
        lostBets: {
          $sum: {
            $cond: [{ $eq: ["$status", "lost"] }, 1, 0],
          },
        },
        highestWin: {
          $max: {
            $cond: [{ $eq: ["$status", "won"] }, "$winAmount", 0],
          },
        },
        highestMultiplier: {
          $max: {
            $cond: [{ $eq: ["$status", "won"] }, "$cashoutMultiplier", 0],
          },
        },
      },
    },

    // Add calculated fields
    {
      $addFields: {
        netProfit: { $subtract: ["$totalWinAmount", "$totalBetAmount"] },
        winRate: {
          $cond: [{ $eq: ["$totalBets", 0] }, 0, { $divide: ["$wonBets", "$totalBets"] }],
        },
      },
    },

    // Project the fields we want
    {
      $project: {
        _id: 0,
        userId: "$_id",
        totalBets: 1,
        totalBetAmount: 1,
        totalWinAmount: 1,
        wonBets: 1,
        lostBets: 1,
        highestWin: 1,
        highestMultiplier: 1,
        netProfit: 1,
        winRate: 1,
        timeFrame: { $literal: timeFrame },
      },
    },
  ])

  return (
    result[0] || {
      userId,
      totalBets: 0,
      totalBetAmount: 0,
      totalWinAmount: 0,
      wonBets: 0,
      lostBets: 0,
      highestWin: 0,
      highestMultiplier: 0,
      netProfit: 0,
      winRate: 0,
      timeFrame,
    }
  )
}

module.exports = {
  getGameStats,
  getDailyStats,
  getPlayerStats,
}

