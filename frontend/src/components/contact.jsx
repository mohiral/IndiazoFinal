"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import axios from "axios"
import {
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaArrowLeft,
  FaHeadset,
  FaUser,
  FaPaperPlane,
  FaSpinner,
  FaCheck,
} from "react-icons/fa"

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("contact") // "contact" or "message"

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const response = await axios.get("https://backend.indiazo.com/api/contacts/active")

      const contactsData = response.data.contacts.reduce(
        (acc, contact) => {
          acc[contact.type] = contact.value
          return acc
        },
        {
          phone: "",
          whatsapp: "",
          email: "",
          address: "",
        },
      )

      setContactInfo(contactsData)
    } catch (error) {
      console.error("Failed to fetch contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setFormData({
        name: "",
        email: "",
        message: "",
      })

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    }, 1500)
  }

  const handleCall = () => {
    if (contactInfo.phone) {
      window.location.href = `tel:${contactInfo.phone}`
    }
  }

  const handleWhatsApp = () => {
    if (contactInfo.whatsapp) {
      const message = encodeURIComponent("Hello, I need assistance with my MatkaPrince account.")
      window.location.href = `https://wa.me/${contactInfo.whatsapp}?text=${message}`
    }
  }

  const handleEmail = () => {
    if (contactInfo.email) {
      window.location.href = `mailto:${contactInfo.email}?subject=Support Request - MatkaPrince`
    }
  }

  const handleBack = () => {
    window.history.back()
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
    },
    tap: {
      scale: 0.95,
    },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pt-16 pb-20 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-blue-500 text-4xl mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading contact information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 pt-16 pb-20">
      <div className="container mx-auto ">
        

        

        {/* Tabs */}
        <div className="max-w-4xl mx-auto ">
          <div className="bg-white rounded-xl p-2 shadow-md flex mb-8">
            <button
              onClick={() => setActiveTab("contact")}
              className={`flex-1 py-3 rounded-lg font-medium text-center transition-all ${
                activeTab === "contact"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Contact Methods
            </button>
            <button
              onClick={() => setActiveTab("message")}
              className={`flex-1 py-3 rounded-lg font-medium text-center transition-all ${
                activeTab === "message"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Send Message
            </button>
          </div>

          {activeTab === "contact" ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1  gap-6"
            >
              {/* Call Card */}
              {contactInfo.phone && (
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  onClick={handleCall}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-6 mx-auto shadow-md">
                      <FaPhone className="text-white text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-3">Call Us</h3>
                    <p className="text-center text-blue-600 font-medium text-lg mb-6">{contactInfo.phone}</p>
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium shadow-md flex items-center justify-center mx-auto"
                    >
                      <FaPhone className="mr-2" /> Call Now
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* WhatsApp Card */}
              {contactInfo.whatsapp && (
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  onClick={handleWhatsApp}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-6 mx-auto shadow-md">
                      <FaWhatsapp className="text-white text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-3">WhatsApp</h3>
                    <p className="text-center text-blue-600 font-medium text-lg mb-6">+91 {contactInfo.whatsapp}</p>
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium shadow-md flex items-center justify-center mx-auto"
                    >
                      <FaWhatsapp className="mr-2" /> Chat Now
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Email Card */}
              {contactInfo.email && (
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  onClick={handleEmail}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div className="p-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6 mx-auto shadow-md">
                      <FaEnvelope className="text-white text-2xl" />
                    </div>
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-3">Email</h3>
                    <p className="text-center text-blue-600 font-medium text-lg mb-6">{contactInfo.email}</p>
                    <motion.button
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-md flex items-center justify-center mx-auto"
                    >
                      <FaEnvelope className="mr-2" /> Send Email
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-lg p-8"
            >
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheck className="text-green-600 text-2xl" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Message Sent!</h3>
                  <p className="text-gray-600 mb-6">Thank you for reaching out. We'll get back to you shortly.</p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-2 bg-blue-100 text-blue-600 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Send Us a Message</h3>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Your Name</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FaUser />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Your Email</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <FaEnvelope />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Your Message</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="How can we help you?"
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" /> Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2" /> Send Message
                      </>
                    )}
                  </motion.button>
                </form>
              )}
            </motion.div>
          )}
        </div>

        {/* Quick Contact Buttons (Mobile Friendly) */}
        <div className="fixed bottom-20 right-4 z-40 flex flex-col space-y-3">
          {contactInfo.phone && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleCall}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg"
              aria-label="Call us"
            >
              <FaPhone className="text-xl" />
            </motion.button>
          )}

          {contactInfo.whatsapp && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWhatsApp}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-green-700 text-white flex items-center justify-center shadow-lg"
              aria-label="WhatsApp us"
            >
              <FaWhatsapp className="text-xl" />
            </motion.button>
          )}

          {contactInfo.email && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEmail}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg"
              aria-label="Email us"
            >
              <FaEnvelope className="text-xl" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactPage

