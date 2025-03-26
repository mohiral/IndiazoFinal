"use client"

import React, { useState, useEffect } from "react"
import { Trophy, TrendingUp, Users, Clock, Rocket, Star, Zap, Flame, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

// Import your AviatorGame component
const AviatorGame = React.lazy(() => import("./AviatorGame"))

// List of Indian names for winners
const indianNames = [
  "Aarav",
"Arjun",
"Advait",
"Bhavesh",
"Chirag",
"Darshan",
"Eshan",
"Farhan",
"Gaurav",
"Harsh",
"Ishaan",
"Jai",
"Kabir",
"Lakshay",
"Mohit",
"Neeraj",
"Omkar",
"Pranav",
"Rahul",
"Siddharth",
"Tarun",
"Ujjwal",
"Vivek",
"Yash",
"Zain",
"Aakash",
"Abhinav",
"Aditya",
"Anand",
"Ankit",
"Arnav",
"Ayush",
"Bhuvan",
"Chetan",
"Deepak",
"Dhruv",
"Divyanshu",
"Gautam",
"Girish",
"Hemant",
"Himanshu",
"Ishan",
"Jatin",
"Karan",
"Kartik",
"Krishna",
"Kunal",
"Lalit",
"Madhav",
"Manish",
"Mayank",
"Nakul",
"Naveen",
"Nikhil",
"Nitesh",
"Ojas",
"Pankaj",
"Parth",
"Piyush",
"Prakash",
"Prateek",
"Raghav",
"Rajat",
"Rishi",
"Rohan",
"Sachin",
"Sahil",
"Sameer",
"Sanjay",
"Shantanu",
"Shaurya",
"Shivam",
"Shreyas",
"Suraj",
"Tanmay",
"Tejas",
"Uday",
"Umang",
"Vaibhav",
"Varun",
"Vedant",
"Vikram",
"Vinay",
"Vishal",
"Yuvraj",
"Abhay",
"Adarsh",
"Ajay",
"Akshay",
"Aman",
"Amrit",
"Anmol",
"Anoop",
"Ashish",
"Atharva",
"Avnish",
"Balraj",
"Basant",
"Chandan",
"Daksh",
"Dev",
"Dinesh",
"Faisal",
"Gagan",
"Gopal",
"Hardik",
"Harish",
"Hritik",
"Jagdish",
"Jaidev",
"Jayant",
"Jitesh",
"Kamal",
"Kapil",
"Keshav",
"Kishan",
"Krish",
"Lavish",
"Lokesh",
"Manan",
"Manohar",
"Mihir",
"Mitul",
"Mukesh",
"Naman",
"Naresh",
"Nishant",
"Nitin",
"Prabhat",
"Pramod",
"Prasad",
"Pratham",
"Praveen",
"Pulkit",
"Rajeev",
"Rajesh",
"Rakesh",
"Ramesh",
"Ranjit",
"Rishabh",
"Ritesh",
"Rohit",
"Rudra",
"Samarth",
"Sarthak",
"Saurabh",
"Shashank",
"Shekhar",
"Shubham",
"Soham",
"Sumit",
"Sunil",
"Surya",
"Swapnil",
"Tarun",
"Tushar",
"Utkarsh",
"Vihaan",
"Vikas",
"Vimal",
"Vineet",
"Vipul",
"Virat",
"Yatharth",
"Yogesh",
"Abhijeet",
"Abhishek",
"Adarsh",
"Adnan",
"Agastya",
"Akash",
"Alok",
"Ambar",
"Amish",
"Amol",
"Anant",
"Aniket",
"Animesh",
"Anirudh",
"Anish",
"Anuj",
"Anurag",
"Apoorv",
"Arihant",
"Arijit",
"Arpit",
"Aryan",
"Ashwin",
"Asim",
"Ayaan",
"Azad",
"Badal",
"Bhavin",
"Bhupinder",
"Brijesh",
"Chaitanya",
"Chandresh",
"Darpan",
"Darsh",
"Devansh",
"Devesh",
"Dheeraj",
"Dhruvil",
"Digvijay",
"Dilip",
"Dinkar",
"Dipak",
"Divyansh",
"Faiyaz",
"Gajendra",
"Gaurang",
"Gokul",
"Gunjan",
"Gunvant",
"Harshal",
"Harshit",
"Himmat",
"Hitesh",
"Hriday",
"Indrajit",
"Jagat",
"Jaideep",
"Jainesh",
"Jaipal",
"Janak",
"Jaswant",
"Jignesh",
"Jitin",
"Jyotirmay",
"Kalpit",
"Kamlesh",
"Kanishk",
"Kaushal",
"Ketan",
"Kiran",
"Kishor",
"Kshitij",
"Kuldeep",
"Kushal",
"Lakshit",
"Laxman",
"Lokendra",
"Madhur",
"Mahendra",
"Mahesh",
"Maitreya",
"Manav",
"Mangesh",
"Manik",
"Manvendra",
"Marut",
"Mayur",
"Mitesh",
"Mohan",
"Mrinal",
"Mukund",
"Nachiketa",
"Naitik",
"Nakshatra",
"Nandish",
"Narayan",
"Navdeep",
"Navin",
"Nayan",
"Neel",
"Nihal",
"Nikunj",
"Nilesh",
"Nimesh",
"Niranjan",
"Nirav",
"Nischal",
"Nishith",
"Nithin",
"Nityanand",
"Ojasvi",
"Onkar",
"Paras",
"Parimal",
"Paritosh",
"Parth",
"Parthan",
"Pavan",
"Pinank",
"Prabir",
"Pradeep",
"Pradyumna",
"Pranay",
"Prasanna",
"Prashant",
"Pratik",
"Pratyush",
"Prem",
"Pritam",
"Puneet",
"Purushottam",
"Pushkar",
"Raghavendra",
"Rahul",
"Rajdeep",
"Rajendra",
"Rajiv",
"Raju",
"Ramakant",
"Raman",
"Ramanuj",
"Ramchandra",
"Ranveer",
"Raunak",
"Ravindra",
"Rehan",
"Reyansh",
"Ripudaman",
"Rishab",
"Ronak",
"Ronit",
"Ruchir",
"Rupal",
"Rushabh",
"Rushil",
"Saahil",
"Sagar",
"Sahaj",
"Saket",
"Salil",
"Samar",
"Sanat",
"Sanchit",
"Sandeep",
"Sandesh",
"Sanjeet",
"Sankalp",
"Saransh",
"Satyam",
"Saurav",
"Savar",
"Sharad",
"Shashwat",
"Shikhar",
"Shivendra",
"Shivshankar",
"Shray",
"Shreyansh",
"Shreyash",
"Shrivatsa",
"Shubhankar",
"Shyam",
"Siddhanth",
"Siddhesh",
"Smit",
"Sohan",
"Sohum",
"Sourabh",
"Sourav",
"Srikant",
"Srinivas",
"Subhash",
"Sudhansu",
"Sudhir",
"Sujay",
"Sukant",
"Sumanth",
"Sumeet",
"Suresh",
"Surjeet",
"Suyash",
"Swastik",
"Tanish",
"Tanuj",
"Tapan",
"Tarang",
"Tathagat",
"Tejasvi",
"Tribhuvan",
"Trilok",
"Trivikram",
"Udayan",
"Ujjawal",
"Umesh",
"Upendra",
"Uttam",
"Vaidik",
"Vallabh",
"Vansh",
"Vardhan",
"Vasu",
"Venkat",
"Vibhav",
"Vibhor",
"Vidur",
"Vijay",
"Vimal",
"Vinod",
"Vipul",
"Viraj",
"Vishnu",
"Vishwajeet",
"Vishwas",
"Vithal",
"Vivaan",
"Vivan",
"Yajat",
"Yajveer",
"Yakshit",
"Yaman",
"Yashas",
"Yashasvi",
"Yatin",
"Yug",
"Yuvan",
"Aakrit",
"Aalam",
"Aamil",
"Aaran",
"Aarnav",
"Aatish",
"Abeer",
"Abhimanyu",
"Abhiroop",
"Abir",
"Achintya",
"Adarsh",
"Aditya",
"Advaita",
"Agrim",
"Ahaan",
"Ahlad",
"Aishik",
"Ajeet",
"Akshit",
"Alankrit",
"Amartya",
"Amay",
"Ameyatma",
"Amlan",
"Amogha",
"Amrish",
"Anagh",
"Anand",
"Ananmay",
"Anay",
"Anchit",
"Aneesh",
"Angad",
"Anindya",
"Aniruddha",
"Anshul",
"Anshuman",
"Anudeep",
"Anupam",
"Anvay",
"Apramey",
"Aradhya",
"Archit",
"Arham",
"Arhaan",
"Arihant",
"Aritra",
"Arjit",
"Arnesh",
"Arun",
"Arush",
"Aryaman",
"Aseem",
"Ashok",
"Ashutosh",
"Asvin",
"Atiksh",
"Atishay",
"Atul",
"Avaneesh",
"Avanish",
"Aviral",
"Ayushman",
"Azaan",
"Bahadur",
"Baladitya",
"Balbir",
"Baldev",
"Bankim",
"Bhadra",
"Bhagat",
"Bhagwan",
"Bhanu",
"Bharath",
"Bhargav",
"Bhaskar",
"Bhaumik",
"Bhavya",
"Bhisham",
"Bhushan",
"Bidhan",
"Bijoy",
"Bikram",
"Bilal",
"Binay",
"Bipin",
"Bishwajit",
"Bodhi",
"Brahma"
]

function HomePage({ setShowNavbar }) {
  const navigate = useNavigate()
  const [winners, setWinners] = useState([])
  const [liveUsers, setLiveUsers] = useState(0)
  const [totalWinnings, setTotalWinnings] = useState(0)
  const [rocketPosition, setRocketPosition] = useState(0)
  const [multiplier, setMultiplier] = useState(1.0)
  const [isRocketCrashed, setIsRocketCrashed] = useState(false)
  const [showCrashText, setShowCrashText] = useState(false)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    // Generate particles for the crash game card
    const newParticles = []
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.5 + 0.2,
      })
    }
    setParticles(newParticles)

    // Animate the rocket and multiplier - MODIFIED FOR CONTINUOUS ANIMATION
    const rocketInterval = setInterval(() => {
      setRocketPosition((prev) => {
        // When reaching the end, reset position without crashing
        if (prev >= 100) {
          // Reset position to start
          setMultiplier(1.0)
          return 0
        }

        // Increase multiplier as rocket moves
        if (prev > 0 && prev < 100) {
          setMultiplier((prev) => {
            const newValue = 1 + (prev - 1) + Math.random() * 0.05
            return Math.min(Number.parseFloat(newValue.toFixed(2)), 5.0)
          })
        }

        return prev + 1
      })
    }, 100)

    // Generate random winners with Indian names
    const generateWinners = () => {
      const newWinners = []
      for (let i = 0; i < 15; i++) {
        const randomName = indianNames[Math.floor(Math.random() * indianNames.length)]
        const winAmount = Math.floor(Math.random() * 990) + 10 // Between 10 and 1000
        const game = Math.random() > 0.7 ? "Lucky Slots" : "Cosmic Crash"
        const timeAgo = Math.floor(Math.random() * 59) + 1

        newWinners.push({
          id: i,
          name: randomName,
          amount: winAmount,
          game: game,
          timeAgo: timeAgo,
        })
      }
      setWinners(newWinners)
    }

    // Set random stats
    setLiveUsers(Math.floor(Math.random() * 500) + 1500)
    setTotalWinnings(Math.floor(Math.random() * 50000) + 100000)

    generateWinners()

    // Refresh winners every 30 seconds
    const winnersInterval = setInterval(() => {
      generateWinners()
    }, 30000)

    return () => {
      clearInterval(winnersInterval)
      clearInterval(rocketInterval)
    }
  }, [])

  const handleGameClick = (gameId) => {
    if (gameId === "aviator") {
      navigate("/CrashGame")
    }
  }

  // Featured games data - only two games as requested
  const featuredGames = [
    {
      id: "aviator",
      title: "Cosmic Crash",
      imageSrc: "/placeholder.jpg",
      status: "live",
      type: "crash",
      multiplier: multiplier.toFixed(2),
    },
    {
      id: "slots",
      title: "Treasure Hunt",
      imageSrc: "/placeholder.jpg",
      status: "coming-soon",
      type: "slots",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-950 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Games Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center">
              <Zap className="w-8 h-8 mr-2 text-yellow-400" />
              Featured Games
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cosmic Crash Game Card - Enhanced */}
            <motion.div
              key="aviator"
              className="relative group overflow-hidden rounded-2xl border-2 border-blue-500/50 shadow-lg transition-all duration-300 hover:-translate-y-2 crash-game-card h-[320px] sm:h-[380px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleGameClick("aviator")}
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-animated z-10"></div>

              {/* Space Background */}
              <div className="absolute inset-0 bg-[url('/placeholder.jpg')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500 opacity-30"></div>

              {/* Animated Stars */}
              <div className="absolute inset-0 z-5">
                <div className="stars-small"></div>
                <div className="stars-medium"></div>
                <div className="stars-large"></div>
                <div className="shooting-stars"></div>
              </div>

              {/* Particles */}
              {particles.map((particle) => (
                <div
                  key={`particle-${particle.id}`}
                  className="absolute rounded-full bg-white z-20 opacity-70"
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    animation: `floatParticle ${10 / particle.speed}s linear infinite`,
                  }}
                />
              ))}

              {/* Rocket Animation Path */}
              <div className="absolute inset-0 z-20 overflow-hidden">
                <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 10,90 Q 50,10 90,90"
                    fill="none"
                    stroke="url(#pathGradient)"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                    className="path-glow"
                  />
                </svg>

                {/* Animated Rocket */}
                <motion.div
                  className="absolute w-12 h-12 z-30 rocket-animation"
                  style={{
                    left: `${10 + rocketPosition * 0.8}%`,
                    top: `${90 - Math.sin(rocketPosition * 0.03) * 80}%`,
                    transform: "translate(-50%, -50%) rotate(-45deg)",
                  }}
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full filter blur-md opacity-50 animate-pulse"></div>
                    <Rocket className="w-12 h-12 text-white relative z-10" />
                    <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-6 h-8 z-0">
                      <div className="w-full h-full relative">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-6 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent rounded-full animate-flame"></div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-to-t from-red-500 via-orange-400 to-transparent rounded-full animate-flame-slow"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Game Badge */}
              <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-blue-600 to-cyan-600 px-3 py-1 rounded-full text-white font-bold text-sm flex items-center shadow-glow">
                <Flame className="w-4 h-4 mr-1 text-yellow-300" />
                CRASH GAME
              </div>

              {/* Multiplier Display */}
              <motion.div
                className={`absolute bottom-24 right-6 z-20 bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-lg text-white font-bold text-2xl ${isRocketCrashed ? "hidden" : "animate-pulse-fast"}`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
              >
                {multiplier.toFixed(2)}x
              </motion.div>

              {/* Crash Text */}
              {showCrashText && (
                <motion.div
                  className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-30"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3, type: "spring" }}
                >
                  <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 rounded-lg text-white font-bold text-3xl shadow-lg border-2 border-red-400 transform rotate-3">
                    CRASH!
                  </div>
                </motion.div>
              )}

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-20 pb-6 px-6">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-3xl font-bold mb-2 flex items-center">
                    Cosmic Crash
                    <Star className="w-5 h-5 ml-2 text-yellow-400 animate-pulse-slow" />
                  </h3>

                  <motion.button
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 mt-4 w-full sm:w-auto flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Play Now
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Treasure Hunt Game Card - Enhanced */}
            <motion.div
              key="slots"
              className="relative group overflow-hidden rounded-2xl border-2 border-indigo-500/30 shadow-lg transition-all duration-300 hover:-translate-y-2 h-[320px] sm:h-[380px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80 z-10"></div>

              {/* Treasure Background */}
              <div className="absolute inset-0 bg-[url('/placeholder.jpg')] bg-cover bg-center group-hover:scale-110 transition-transform duration-500 opacity-30"></div>

              {/* Animated Treasure Elements */}
              <div className="absolute inset-0 z-15 overflow-hidden">
                <div className="treasure-sparkle treasure-sparkle-1"></div>
                <div className="treasure-sparkle treasure-sparkle-2"></div>
                <div className="treasure-sparkle treasure-sparkle-3"></div>
                <div className="treasure-sparkle treasure-sparkle-4"></div>
                <div className="treasure-sparkle treasure-sparkle-5"></div>
              </div>

              {/* Coming Soon Badge */}
              <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-md">
                <Clock className="w-3 h-3 mr-1" />
                COMING SOON
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent pt-20 pb-6 px-6">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-3xl font-bold mb-2 flex items-center">
                    Treasure Hunt
                    <Star className="w-5 h-5 ml-2 text-yellow-400 animate-pulse-slow" />
                  </h3>

                  <motion.button
                    className="bg-gray-700 cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg mt-4 w-full sm:w-auto"
                    disabled
                  >
                    Coming Soon
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Enhanced Hero Section */}
        <section className="mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-900 opacity-20">
            <div className="stars"></div>
            <div className="twinkling"></div>
            <div className="shooting-stars"></div>
          </div>

          <motion.div
            className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-6 md:p-10 relative overflow-hidden border-2 border-indigo-500/30 shadow-[0_0_25px_rgba(79,70,229,0.4)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-[url('/placeholder.jpg')] bg-cover opacity-20 mix-blend-overlay"></div>
            <div className="relative z-10">
              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                Gaming Paradise
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl text-gray-300 mb-6 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                Experience the thrill of our premium games with amazing graphics and big rewards!
              </motion.p>
              <motion.button
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-purple-500/20 flex items-center"
                onClick={() => handleGameClick("aviator")}
                whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(147, 51, 234, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                Play Now
                <ChevronRight className="ml-2 w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Users,
              label: "Live Users",
              value: liveUsers.toLocaleString(),
              color: "blue",
              delay: 0.1,
            },
            {
              icon: TrendingUp,
              label: "Total Winnings",
              value: `₹${totalWinnings.toLocaleString()}`,
              color: "green",
              delay: 0.2,
            },
            {
              icon: Trophy,
              label: "Top Prize",
              value: "₹25,000",
              color: "purple",
              delay: 0.3,
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border-2 border-${stat.color}-500/30 shadow-lg flex items-center hover:shadow-${stat.color}-500/20 hover:-translate-y-1 transition-all duration-300`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: stat.delay }}
              whileHover={{ scale: 1.03 }}
            >
              <div className={`bg-${stat.color}-500/20 p-3 rounded-full mr-4`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Enhanced Recent Winners Section */}
        <section>
          <motion.h2
            className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Trophy className="w-8 h-8 mr-2 text-yellow-400" />
            Recent Winners
          </motion.h2>

          <motion.div
            className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border-2 border-indigo-500/30 shadow-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="overflow-hidden" style={{ height: "400px" }}>
              <div className="winners-scroll">
                {winners.map((winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center justify-between py-4 border-b border-gray-700/50 hover:bg-gray-800/50 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-4 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {winner.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-lg">{winner.name}</div>
                        <div className="text-sm text-gray-400 flex items-center">
                          {winner.game === "Cosmic Crash" ? (
                            <Rocket className="w-3 h-3 mr-1 text-blue-400" />
                          ) : (
                            <Star className="w-3 h-3 mr-1 text-yellow-400" />
                          )}
                          {winner.game} 
                        </div>
                      </div>
                    </div>
                    <div className="text-green-400 font-bold text-lg">₹{winner.amount.toLocaleString()}</div>
                  </div>
                ))}

                {/* Duplicate the winners for seamless scrolling */}
                {winners.map((winner) => (
                  <div
                    key={`dup-${winner.id}`}
                    className="flex items-center justify-between py-4 border-b border-gray-700/50 hover:bg-gray-800/50 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mr-4 flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {winner.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-lg">{winner.name}</div>
                        <div className="text-sm text-gray-400 flex items-center">
                          {winner.game === "Cosmic Crash" ? (
                            <Rocket className="w-3 h-3 mr-1 text-blue-400" />
                          ) : (
                            <Star className="w-3 h-3 mr-1 text-yellow-400" />
                          )}
                          {winner.game} • {winner.timeAgo} min ago
                        </div>
                      </div>
                    </div>
                    <div className="text-green-400 font-bold text-lg">₹{winner.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <style jsx="true">{`
            @keyframes scrollWinners {
              0% { transform: translateY(0); }
              100% { transform: translateY(-50%); }
            }
            
            .winners-scroll {
              animation: scrollWinners 30s linear infinite;
            }
            
            .stars {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              width: 100%;
              height: 100%;
              background: transparent;
              background-image: radial-gradient(white, rgba(255, 255, 255, 0.2) 2px, transparent 2px);
              background-size: 100px 100px;
            }
            
            .twinkling {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              width: 100%;
              height: 100%;
              animation: twinkle 8s linear infinite;
            }
            
            .shooting-stars::before, .shooting-stars::after {
              content: "";
              position: absolute;
              width: 100px;
              height: 2px;
              background: linear-gradient(to right, rgba(0,0,0,0), rgba(255,255,255,0.8), rgba(0,0,0,0));
              border-radius: 50%;
              animation: shooting-star 6s linear infinite;
              top: 0;
              transform: rotate(45deg);
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
              from { opacity: 0.5; }
              50% { opacity: 1; }
              to { opacity: 0.5; }
            }
            
            @keyframes flame {
              0%, 100% { height: 6px; opacity: 0.8; }
              50% { height: 10px; opacity: 1; }
            }
            
            @keyframes flame-slow {
              0%, 100% { height: 4px; opacity: 0.6; }
              50% { height: 8px; opacity: 0.8; }
            }
            
            .animate-flame {
              animation: flame 0.3s ease-in-out infinite;
            }
            
            .animate-flame-slow {
              animation: flame-slow 0.5s ease-in-out infinite;
            }
            
            .animate-pulse-fast {
              animation: pulse 0.8s ease-in-out infinite;
            }
            
            .animate-pulse-slow {
              animation: pulse 3s ease-in-out infinite;
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
            
            .crash-game-card {
              box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
            }
            
            .rocket-animation {
              transition: all 0.05s linear;
            }
            
            .rocket-crash {
              animation: explode 1s forwards;
            }
            
            @keyframes explode {
              0% { transform: translate(-50%, -50%) rotate(-45deg) scale(1); opacity: 1; }
              50% { transform: translate(-50%, -50%) rotate(20deg) scale(1.5); opacity: 0.8; }
              100% { transform: translate(-50%, -50%) rotate(45deg) scale(0.1); opacity: 0; }
            }
            
            .path-glow {
              filter: drop-shadow(0 0 3px #3b82f6);
            }
            
            .shadow-glow {
              box-shadow: 0 0 10px rgba(59, 130, 246, 0.7);
            }
            
            @keyframes floatParticle {
              0% { transform: translateY(0) scale(1); opacity: 0.7; }
              50% { transform: translateY(-20px) scale(1.2); opacity: 0.9; }
              100% { transform: translateY(-40px) scale(0.8); opacity: 0; }
            }
            
            .bg-gradient-animated {
              background: linear-gradient(-45deg, #1e3a8a, #1e40af, #0d4b6e, #0f172a);
              background-size: 400% 400%;
              animation: gradient 15s ease infinite;
            }
            
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            
            /* Treasure Hunt animations */
            .treasure-sparkle {
              position: absolute;
              width: 10px;
              height: 10px;
              background: radial-gradient(circle, #fff, rgba(255,255,255,0));
              border-radius: 50%;
              opacity: 0;
            }
            
            .treasure-sparkle-1 {
              top: 20%;
              left: 30%;
              animation: sparkle 3s ease-in-out infinite;
            }
            
            .treasure-sparkle-2 {
              top: 40%;
              left: 60%;
              animation: sparkle 4s ease-in-out 1s infinite;
            }
            
            .treasure-sparkle-3 {
              top: 70%;
              left: 20%;
              animation: sparkle 5s ease-in-out 0.5s infinite;
            }
            
            .treasure-sparkle-4 {
              top: 30%;
              left: 80%;
              animation: sparkle 3.5s ease-in-out 1.5s infinite;
            }
            
            .treasure-sparkle-5 {
              top: 60%;
              left: 50%;
              animation: sparkle 4.5s ease-in-out 0.7s infinite;
            }
            
            @keyframes sparkle {
              0%, 100% { transform: scale(0); opacity: 0; }
              50% { transform: scale(1); opacity: 0.8; }
            }
          `}</style>
        </section>
      </div>
    </div>
  )
}

export default HomePage

