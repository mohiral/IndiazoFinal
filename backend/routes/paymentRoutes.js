const express = require("express")
const router = express.Router()
const Payment = require("../models/Payment")

router.post("/submit-payment", async (req, res) => {
  try {
    const { userId, userName, userEmail, className, amount, utr, upiId } = req.body

    // Create new payment
    const newPayment = new Payment({
      userId,
      userName,
      userEmail,
      className,
      amount,
      utr,
      upiId,
    })

    // Save the payment
    await newPayment.save()

    res.status(201).json({ message: "Payment submitted successfully", payment: newPayment })
  } catch (error) {
    console.error("Error submitting payment:", error)
    res.status(500).json({ message: "Error submitting payment", error: error.message })
  }
})

// Modified route to submit withdrawal request - amount IS deducted immediately
router.post("/submit-withdrawal", async (req, res) => {
  try {
    const { userId, userName, userEmail, amount, upiId, accountHolderName } = req.body

    // Validate amount
    if (amount < 500) {
      return res.status(400).json({ message: "Minimum withdrawal amount is ₹500" })
    }

    // First, check if the user has enough balance for this withdrawal
    const userPayments = await Payment.find({ userId })

    let currentBalance = 0
    userPayments.forEach((payment) => {
      if (
        payment.transactionType === "deposit" ||
        payment.transactionType === "game_win" ||
        payment.transactionType === "withdrawal_refund"
      ) {
        if (payment.status === "confirmed") {
          currentBalance += payment.amount
        }
      } else if (payment.transactionType === "withdrawal" || payment.transactionType === "game_loss") {
        if (payment.status === "confirmed") {
          // Only count confirmed withdrawals in balance calculation
          currentBalance -= Math.abs(payment.amount) // Ensure we're subtracting the absolute value
        }
      }
    })

    // Check if user has enough balance
    if (currentBalance < amount) {
      return res.status(400).json({
        message: "Insufficient balance for withdrawal",
        currentBalance,
        requestedAmount: amount,
      })
    }

    // Create new payment with withdrawal transaction type
    // This will be used to track the withdrawal request status (pending/confirmed/rejected)
    console.log("Creating withdrawal with data:", {
      userId,
      userName,
      userEmail,
      amount: -amount, // Store as negative value
      upiId,
      accountHolderName,
      transactionType: "withdrawal",
      status: "confirmed", // Set status to confirmed to immediately deduct from balance
    })

    const newWithdrawal = new Payment({
      userId,
      userName,
      userEmail,
      amount: -amount, // Store as negative value
      upiId,
      accountHolderName,
      transactionType: "withdrawal",
      status: "confirmed", // Set status to confirmed to immediately deduct from balance
      adminApproval: "pending", // Add a flag to indicate admin still needs to approve
    })

    // Save the withdrawal request
    await newWithdrawal.save()

    console.log("Withdrawal request saved successfully:", {
      id: newWithdrawal._id,
      userId: newWithdrawal.userId,
      amount: newWithdrawal.amount,
      transactionType: newWithdrawal.transactionType,
      status: newWithdrawal.status,
      adminApproval: newWithdrawal.adminApproval,
    })

    res.status(201).json({
      message: "Withdrawal request submitted successfully",
      withdrawal: newWithdrawal,
    })
  } catch (error) {
    console.error("Error submitting withdrawal:", error)
    res.status(500).json({ message: "Error submitting withdrawal", error: error.message })
  }
})

// New route to get user's transaction history
router.get("/user-transactions/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const transactions = await Payment.find({ userId }).sort({ createdAt: -1 })
    res.status(200).json(transactions)
  } catch (error) {
    console.error("Error fetching user transactions:", error)
    res.status(500).json({ message: "Error fetching user transactions", error: error.message })
  }
})

// New route for admin to get all pending payments
router.get("/admin/pending-payments", async (req, res) => {
  try {
    const pendingPayments = await Payment.find({ status: "pending" }).sort({ createdAt: -1 })
    res.status(200).json(pendingPayments)
  } catch (error) {
    console.error("Error fetching pending payments:", error)
    res.status(500).json({ message: "Error fetching pending payments", error: error.message })
  }
})

// Updated route for admin to get all payments
router.get("/admin/all-payments", async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 })
    res.status(200).json(payments)
  } catch (error) {
    console.error("Error fetching payments:", error)
    res.status(500).json({ message: "Error fetching payments", error: error.message })
  }
})

// New route for admin to get all withdrawals
router.get("/admin/all-withdrawals", async (req, res) => {
  try {
    const withdrawals = await Payment.find({ transactionType: "withdrawal" }).sort({ createdAt: -1 })
    res.status(200).json(withdrawals)
  } catch (error) {
    console.error("Error fetching withdrawals:", error)
    res.status(500).json({ message: "Error fetching withdrawals", error: error.message })
  }
})

// Modified route for admin to update withdrawal status - NO REFUND on rejection
router.put("/admin/update-withdrawal-status/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params
    const { adminApproval, transactionId, rejectionReason } = req.body

    // Validate adminApproval
    if (!["pending", "approved", "rejected"].includes(adminApproval)) {
      return res.status(400).json({ message: "Invalid admin approval status" })
    }

    // Find the withdrawal
    const withdrawal = await Payment.findById(paymentId)

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" })
    }

    // If the withdrawal is already in the requested status, no need to update
    if (withdrawal.adminApproval === adminApproval) {
      return res.status(200).json({
        message: "Withdrawal admin approval status already set to " + adminApproval,
        withdrawal: withdrawal,
      })
    }

    // Create update object
    const updateData = { adminApproval }
    if (transactionId) updateData.transactionId = transactionId
    if (rejectionReason) updateData.rejectionReason = rejectionReason

    // Update the withdrawal status
    const updatedWithdrawal = await Payment.findByIdAndUpdate(paymentId, updateData, { new: true })

    // No refund is created for rejected withdrawals - amount stays deducted

    res.status(200).json({
      message: "Withdrawal admin approval status updated successfully",
      withdrawal: updatedWithdrawal,
    })
  } catch (error) {
    console.error("Error updating withdrawal status:", error)
    res.status(500).json({ message: "Error updating withdrawal status", error: error.message })
  }
})

// Updated route for admin to update payment status
router.put("/admin/update-payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params
    const { userId, userName, userEmail, className, amount, utr, upiId, status, transactionType } = req.body

    // Validate status if provided
    if (status && !["pending", "confirmed", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    // Create update object with all provided fields
    const updateData = {}
    if (userId !== undefined) updateData.userId = userId
    if (userName !== undefined) updateData.userName = userName
    if (userEmail !== undefined) updateData.userEmail = userEmail
    if (className !== undefined) updateData.className = className
    if (amount !== undefined) updateData.amount = amount
    if (utr !== undefined) updateData.utr = utr
    if (upiId !== undefined) updateData.upiId = upiId
    if (status !== undefined) updateData.status = status
    if (transactionType !== undefined) updateData.transactionType = transactionType

    const updatedPayment = await Payment.findByIdAndUpdate(paymentId, updateData, { new: true })

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    res.status(200).json({
      message: "Payment updated successfully",
      payment: updatedPayment,
    })
  } catch (error) {
    console.error("Error updating payment:", error)
    res.status(500).json({ message: "Error updating payment", error: error.message })
  }
})

// New route for admin to update withdrawal details
router.put("/admin/update-withdrawal/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params
    const { userName, userEmail, amount, upiId, accountHolderName, status, rejectionReason, transactionId } = req.body

    // Create update object
    const updateData = {}
    if (userName !== undefined) updateData.userName = userName
    if (userEmail !== undefined) updateData.userEmail = userEmail
    if (amount !== undefined) updateData.amount = amount
    if (upiId !== undefined) updateData.upiId = upiId
    if (accountHolderName !== undefined) updateData.accountHolderName = accountHolderName
    if (status !== undefined) updateData.status = status
    if (rejectionReason !== undefined) updateData.rejectionReason = rejectionReason
    if (transactionId !== undefined) updateData.transactionId = transactionId

    const updatedWithdrawal = await Payment.findByIdAndUpdate(paymentId, updateData, { new: true })

    if (!updatedWithdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" })
    }

    res.status(200).json({
      message: "Withdrawal updated successfully",
      withdrawal: updatedWithdrawal,
    })
  } catch (error) {
    console.error("Error updating withdrawal:", error)
    res.status(500).json({ message: "Error updating withdrawal", error: error.message })
  }
})

// New route for admin to delete a payment
router.delete("/admin/delete-payment/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params

    const deletedPayment = await Payment.findByIdAndDelete(paymentId)

    if (!deletedPayment) {
      return res.status(404).json({ message: "Payment not found" })
    }

    res.status(200).json({
      message: "Payment deleted successfully",
      payment: deletedPayment,
    })
  } catch (error) {
    console.error("Error deleting payment:", error)
    res.status(500).json({ message: "Error deleting payment", error: error.message })
  }
})

// New route for admin to delete a withdrawal
router.delete("/admin/delete-withdrawal/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params

    const deletedWithdrawal = await Payment.findByIdAndDelete(paymentId)

    if (!deletedWithdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" })
    }

    res.status(200).json({
      message: "Withdrawal deleted successfully",
      withdrawal: deletedWithdrawal,
    })
  } catch (error) {
    console.error("Error deleting withdrawal:", error)
    res.status(500).json({ message: "Error deleting withdrawal", error: error.message })
  }
})

// Modified route to get wallet balance for a user
router.get("/wallet-balance/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const payments = await Payment.find({ userId })

    let balance = 0
    payments.forEach((payment) => {
      if (
        payment.transactionType === "deposit" ||
        payment.transactionType === "game_win" ||
        payment.transactionType === "withdrawal_refund"
      ) {
        if (payment.status === "confirmed") {
          balance += payment.amount
        }
      } else if (payment.transactionType === "withdrawal" || payment.transactionType === "game_loss") {
        if (payment.status === "confirmed") {
          // All confirmed withdrawals are deducted from balance
          balance -= Math.abs(payment.amount) // Ensure we're subtracting the absolute value
        }
      }
    })

    res.status(200).json({ balance, payments })
  } catch (error) {
    console.error("Error fetching wallet balances:", error)
    res.status(500).json({ message: "Error fetching wallet balances" })
  }
})

// New route to update user balance after game win/loss
router.post("/update-balance", async (req, res) => {
  try {
    const { userId, newBalance, gameResult, betAmount, winAmount, gameId } = req.body

    // Log the received data
    console.log("Received update-balance request:", {
      userId,
      newBalance,
      gameResult,
      betAmount,
      winAmount,
      gameId,
    })

    // Create a new payment record to track the game transaction
    const gameTransaction = new Payment({
      userId,
      amount: gameResult === "win" ? winAmount : -betAmount, // Positive for win, negative for loss
      status: "confirmed", // Auto-confirm game transactions
      transactionType: gameResult === "win" ? "game_win" : "game_loss",
      gameDetails: {
        betAmount,
        multiplier: gameResult === "win" ? winAmount / betAmount : 0,
        result: gameResult,
        gameId: gameId || "unknown", // Provide a default if gameId is undefined
      },
    })

    // Log the transaction object before saving
    console.log("Game transaction to save:", gameTransaction)

    // Save the game transaction
    await gameTransaction.save()

    // Log the saved transaction
    console.log("Game transaction saved successfully")

    res.status(200).json({
      message: `Balance updated successfully after game ${gameResult}`,
      newBalance,
      transaction: gameTransaction,
    })
  } catch (error) {
    console.error("Error updating balance after game:", error)
    res.status(500).json({ message: "Error updating balance", error: error.message })
  }
})

module.exports = router

