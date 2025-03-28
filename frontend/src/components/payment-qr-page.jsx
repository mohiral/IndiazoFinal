"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import {
  FaArrowLeft,
  FaWallet,
  FaCopy,
  FaCheck,
  FaQrcode,
  FaMobileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRupeeSign,
  FaShieldAlt,
  FaInfoCircle,
} from "react-icons/fa"

const PaymentQRPage = () => {
  const [amount, setAmount] = useState("")
  const [utr, setUtr] = useState("")
  const [upi, setUpi] = useState("")
  const [userId, setUserId] = useState("")
  const [userName, setUserName] = useState("")
  const [userEmail, setUserEmail] = useState("")
  const [activeTab, setActiveTab] = useState("upi")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [upiSettings, setUpiSettings] = useState({ upiId: "7568008581@ybl", name: "LocalMart" })
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [error, setError] = useState("")
  const [amountError, setAmountError] = useState("")
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [showForm, setShowForm] = useState(true)

  useEffect(() => {
    // Load user data from localStorage
    try {
      const storedUser = localStorage.getItem("user")

      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUserId(userData.userId)
        setUserName(userData.name)
        setUserEmail(userData.email)
      } else {
        setError("User data not found. Please login again to continue.")
      }
    } catch (e) {
      console.error("Error parsing user data from localStorage", e)
      setError("Error loading user data. Please login again.")
    }

    // Fetch UPI settings from backend
    fetchUpiSettings()
  }, [])

  // Update QR code when amount or UPI settings change
  useEffect(() => {
    updateQrCode()
  }, [amount, upiSettings])

  const fetchUpiSettings = async () => {
    try {
      const response = await axios.get("https://backend.indiazo.com/api/upi-settings/active")
      if (response.data && response.data.upiId) {
        setUpiSettings(response.data)
      }
    } catch (error) {
      console.error("Error fetching UPI settings:", error)
    }
  }

  const generateUpiLink = () => {
    const transactionNote = "Adding money to wallet"
    return `upi://pay?pa=${upiSettings.upiId}&pn=${upiSettings.name}&tn=${encodeURIComponent(transactionNote)}&am=${amount}&cu=INR`
  }

  const updateQrCode = () => {
    if (amount && !amountError && Number.parseFloat(amount) >= 200) {
      const upiLink = generateUpiLink()
      const encodedLink = encodeURIComponent(upiLink)
      // Use QR Server API
      setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodedLink}`)
    }
  }

  const handlePayWithUPI = () => {
    if (validateAmount()) {
      window.location.href = generateUpiLink()
    }
  }

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiSettings.upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const validateAmount = () => {
    if (!amount || amount === "") {
      setAmountError("Please enter an amount")
      return false
    }

    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount)) {
      setAmountError("Please enter a valid amount")
      return false
    }

    if (numAmount < 200) {
      setAmountError("Minimum amount is ₹200")
      return false
    }

    setAmountError("")
    return true
  }

  const handleAmountChange = (e) => {
    const value = e.target.value
    setAmount(value)

    if (value === "") {
      setAmountError("")
      return
    }

    const numValue = Number.parseFloat(value)
    if (isNaN(numValue)) {
      setAmountError("Please enter a valid amount")
    } else if (numValue < 200) {
      setAmountError("Minimum amount is ₹200")
    } else {
      setAmountError("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateAmount()) {
      return
    }

    // Make sure upiId is set
    if (!upi) {
      setUpi(userId) // Use userId as default upiId if not provided
    }

    setIsSubmitting(true)

    try {
      const response = await axios.post("https://backend.indiazo.com/api/submit-payment", {
        userId,
        userName,
        userEmail,
        amount,
        utr,
        upiId: upi || userId, // Ensure upiId is never empty
        merchantUpiId: upiSettings.upiId,
      })

      // alert("Payment submitted successfully! Your wallet will be updated shortly.")
      window.location.href = "/wallet-history"
    } catch (error) {
      console.error("Error submitting payment:", error.response ? error.response.data : error.message)
      setError(error.response?.data?.message || "Payment submission failed. Please try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 ">
      <div className="max-w-2xl mx-auto">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg  shadow-md"
            role="alert"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="text-red-500 mr-2" />
              <span className="font-medium">Error!</span>
            </div>
            <p className="mt-1">{error}</p>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white  shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 ">
            <div className="flex items-center justify-between mb-2">
              <button onClick={handleBack} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors">
                <FaArrowLeft className="text-white" />
              </button>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FaWallet className="text-white text-xl" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Add Money to Wallet</h2>
            <p className="text-blue-100 mt-1">Quick and secure payments via UPI</p>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {paymentSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex flex-col items-center justify-center py-8"
                >
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <FaCheckCircle className="text-green-600 text-4xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Submitted!</h3>
                  <p className="text-gray-600 text-center mb-6">
                    Your payment of ₹{amount} is being processed. Your wallet will be updated shortly.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Home
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="mb-6">
                    <label htmlFor="amount" className="block text-lg font-semibold mb-2 text-gray-800">
                      Enter Amount
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                        <FaRupeeSign className="text-blue-600" />
                      </div>
                      <input
                        id="amount"
                        type="text"
                        inputMode="numeric"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="Enter amount (min ₹200)"
                        className={`w-full p-4 pl-14 border-2 rounded-xl text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                          amountError ? "border-red-300 bg-red-50" : "border-gray-200"
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {amountError && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2 text-red-600 flex items-center"
                        >
                          <FaExclamationTriangle className="mr-1" /> {amountError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* UPI ID with Copy Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 flex items-center justify-between"
                  >
                    <div className="overflow-hidden max-w-[70%]">
                      <p className="text-sm text-gray-500">Pay to UPI ID:</p>
                      <p className="font-medium truncate text-blue-800" title={upiSettings.upiId}>
                        {upiSettings.upiId}
                      </p>
                    </div>
                    <button
                      onClick={copyUpiId}
                      className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                        copied ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      }`}
                      type="button"
                    >
                      {copied ? <FaCheck className="h-5 w-5" /> : <FaCopy className="h-5 w-5" />}
                    </button>
                  </motion.div>

                  {/* Tabs */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                  >
                    <div className="flex rounded-xl overflow-hidden shadow-sm border border-gray-200">
                      <button
                        onClick={() => setActiveTab("upi")}
                        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                          activeTab === "upi"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                        type="button"
                      >
                        <FaQrcode className="h-4 w-4" />
                        UPI Payment
                      </button>
                      <button
                        onClick={() => setActiveTab("scanner")}
                        className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 transition-colors ${
                          activeTab === "scanner"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium"
                            : "bg-white text-gray-600 hover:bg-gray-50"
                        }`}
                        type="button"
                      >
                        <FaMobileAlt className="h-4 w-4" />
                        QR Scanner
                      </button>
                    </div>

                    {/* UPI Tab Content */}
                    <AnimatePresence mode="wait">
                      {activeTab === "upi" && (
                        <motion.div
                          key="upi"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-6 flex flex-col items-center"
                        >
                          <div className="bg-white p-6 rounded-xl shadow-md mb-4 border-2 border-gray-100">
                            {amount && !amountError && Number.parseFloat(amount) >= 200 ? (
                              qrCodeUrl ? (
                                <img
                                  src={qrCodeUrl || "/placeholder.svg"}
                                  alt="Payment QR Code"
                                  width="220"
                                  height="220"
                                  className="mx-auto rounded-lg"
                                  onError={(e) => {
                                    console.error("QR Code image failed to load")
                                    e.target.src =
                                      "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Crect fill='%23f0f0f0' width='220' height='220'/%3E%3Ctext fill='%23999999' fontFamily='Arial' fontSize='14' x='50%25' y='50%25' textAnchor='middle'%3EQR Code%3C/text%3E%3C/svg%3E"
                                  }}
                                />
                              ) : (
                                <div className="w-[220px] h-[220px] bg-gray-100 rounded-lg flex items-center justify-center">
                                  <div className="text-center">
                                    <FaQrcode className="text-gray-400 text-5xl mx-auto mb-2" />
                                    <p className="text-gray-500">Loading QR Code...</p>
                                  </div>
                                </div>
                              )
                            ) : (
                              <div className="w-[220px] h-[220px] bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="text-center p-4">
                                  <FaInfoCircle className="text-blue-500 text-4xl mx-auto mb-3" />
                                  <p className="text-gray-600">
                                    {amount
                                      ? "Please enter a valid amount (min ₹200)"
                                      : "Enter an amount to generate QR code"}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-center text-sm text-gray-600 mb-4">
                            Scan this QR code with any UPI app to pay
                          </p>
                          {/* <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handlePayWithUPI}
                            disabled={!amount || amountError || Number.parseFloat(amount) < 200}
                            className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-2 font-medium shadow-sm transition-all ${
                              !amount || amountError || Number.parseFloat(amount) < 200
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-md"
                            }`}
                            type="button"
                          >
                            Pay with UPI App
                            <FaMobileAlt className="h-4 w-4" />
                          </motion.button> */}
                        </motion.div>
                      )}

                      {/* Scanner Tab Content */}
                      {activeTab === "scanner" && (
                        <motion.div
                          key="scanner"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-6 flex flex-col items-center"
                        >
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 w-full mb-4 aspect-square flex items-center justify-center">
                            <div className="text-center">
                              <FaQrcode className="h-20 w-20 text-blue-400 mx-auto mb-4" />
                              <p className="text-blue-800 font-medium">QR Scanner</p>
                              <p className="text-gray-600 text-sm mt-2">Scan your UPI QR code to make payment</p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-sm hover:shadow-md transition-all"
                            type="button"
                          >
                            Open Scanner
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <form
                      onSubmit={handleSubmit}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 mt-6"
                    >
                      <h3 className="font-semibold text-lg mb-4 text-blue-800">Payment Confirmation</h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="utr" className="block font-medium mb-1 text-gray-700">
                            UTR Number (Transaction Reference)
                          </label>
                          <input
                            id="utr"
                            type="text"
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            placeholder="Enter 12-digit UTR number"
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            You can find this in your UPI app payment history
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className={`w-full py-3 px-4 rounded-xl font-medium shadow-sm hover:shadow-md transition-all flex items-center justify-center ${
                            !amount || amountError || Number.parseFloat(amount) < 200
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                          }`}
                          disabled={isSubmitting || !amount || amountError || Number.parseFloat(amount) < 200}
                        >
                          {isSubmitting ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                            "Submit Payment"
                          )}
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="border-t p-4 bg-gray-50">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <FaShieldAlt className="text-green-600 mr-2" />
              <p>Secure payments powered by LocalMart</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PaymentQRPage

