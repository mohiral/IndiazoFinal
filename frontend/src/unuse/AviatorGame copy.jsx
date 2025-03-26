
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Rocket from "../assets/Rocket.gif"
import BetSection from "../components/bet-section"

const CrashGame = () => {
  const [multiplier, setMultiplier] = useState(1.0)
  const [crashed, setCrashed] = useState(false)
  const [isCashOutActive, setIsCashOutActive] = useState(false)
  const [customCrashValue, setCustomCrashValue] = useState(200.0)
  const [dotPosition, setDotPosition] = useState(0)
  const [rocketAtCorner, setRocketAtCorner] = useState(false)
  const [gameActive, setGameActive] = useState(false)
  const [currentBet, setCurrentBet] = useState(0)
  const [gameState, setGameState] = useState("idle") // "idle" | "active" | "crashed" | "cashed"
  const [countdown, setCountdown] = useState(5)
  const [isAutoPlay, setIsAutoPlay] = useState(true)

  useEffect(() => {
    if (!gameActive || gameState !== "active") return

    const interval = setInterval(() => {
      setMultiplier((prev) => {
        const newValue = Number.parseFloat((prev * 1.07).toFixed(2))
        if (newValue >= customCrashValue) {
          setCrashed(true)
          setGameState("crashed")
          setGameActive(false)
          setCountdown(5) // Start countdown after crash
          return prev
        }
        return newValue
      })
    }, 100)

    return () => clearInterval(interval)
  }, [gameActive, customCrashValue, gameState])

  useEffect(() => {
    if (!rocketAtCorner || crashed) return
    const moveInterval = setInterval(() => {
      setDotPosition((prev) => (prev + 2) % 40)
    }, 150)
    return () => clearInterval(moveInterval)
  }, [rocketAtCorner, crashed])

  useEffect(() => {
    if (!isAutoPlay) return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Reset countdown and start new game
          if (gameState === "crashed" || gameState === "idle") {
            handlePlaceBet(currentBet || 100) // Use current bet or default to 100
          }
          return 5
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isAutoPlay, currentBet, gameState])

  const handleCashOut = () => {
    if (gameState !== "active") return

    setIsCashOutActive(false)
    setCrashed(true)
    setGameState("cashed")
    setGameActive(false)
    // Here you would calculate winnings: currentBet * multiplier
  }

  const handlePlaceBet = (amount) => {
    if (gameActive) return

    // Reset game state
    setMultiplier(1.0)
    setCrashed(false)
    setRocketAtCorner(false)
    setIsCashOutActive(true)
    setCurrentBet(amount)
    setGameState("active")
    setGameActive(true)
    setCountdown(5) // Reset countdown when game starts
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-900 flex flex-col items-center justify-center text-white p-4 relative">
      {/* Navigation Bar */}
      <div className="w-full max-w-3xl bg-yellow-500 text-black text-center p-2 rounded-t-lg font-bold text-lg">
        FUN MODE
      </div>

      {/* Graph Container */}
      <div className="w-full max-w-3xl bg-[#0a192f] p-4 rounded-b-lg flex flex-col items-center relative border border-gray-700 overflow-hidden max-h-[500px]">
        {/* Enhanced Stars Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars-small"></div>
          <div className="stars-medium"></div>
          <div className="stars-large"></div>

          {/* Enhanced Solar System */}
          <div className="sun"></div>
          <div className="mercury-orbit">
            <div className="mercury">
              <div className="planet-glow mercury-glow"></div>
            </div>
          </div>
          <div className="venus-orbit">
            <div className="venus">
              <div className="planet-glow venus-glow"></div>
            </div>
          </div>
          <div className="earth-orbit">
            <div className="earth">
              <div className="planet-glow earth-glow"></div>
            </div>
          </div>
          <div className="mars-orbit">
            <div className="mars">
              <div className="planet-glow mars-glow"></div>
            </div>
          </div>
          <div className="jupiter-orbit">
            <div className="jupiter">
              <div className="planet-glow jupiter-glow"></div>
            </div>
          </div>
          <div className="saturn-orbit">
            <div className="saturn">
              <div className="saturn-rings"></div>
              <div className="planet-glow saturn-glow"></div>
            </div>
          </div>
        </div>

        <style jsx>{`
          /* Enhanced Stars */
          .stars-small, .stars-medium, .stars-large {
            position: absolute;
            width: 100%;
            height: 100%;
            background-repeat: repeat;
            pointer-events: none;
          }

          .stars-small {
            background-image: radial-gradient(1px 1px at 10px 10px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 20px 50px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 30px 30px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 40px 70px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 50px 90px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 60px 40px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 70px 30px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 80px 60px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 90px 10px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1px 1px at 100px 80px, #fff, rgba(0,0,0,0));
            background-size: 100px 100px;
            animation: twinkle 4s ease-in-out infinite;
          }

          .stars-medium {
            background-image: radial-gradient(1.5px 1.5px at 150px 150px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 200px 220px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 250px 180px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 300px 250px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 350px 200px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 400px 150px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 450px 220px, #fff, rgba(0,0,0,0)),
                              radial-gradient(1.5px 1.5px at 500px 180px, #fff, rgba(0,0,0,0));
            background-size: 200px 200px;
            animation: twinkle 6s ease-in-out infinite;
            animation-delay: 1s;
          }

          .stars-large {
            background-image: radial-gradient(2px 2px at 120px 120px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 170px 250px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 220px 200px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 270px 300px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2px 2px at 320px 180px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2.5px 2.5px at 370px 280px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2.5px 2.5px at 420px 220px, #fff, rgba(0,0,0,0)),
                              radial-gradient(2.5px 2.5px at 470px 150px, #fff, rgba(0,0,0,0)),
                              radial-gradient(3px 3px at 520px 275px, #fff, rgba(0,0,0,0));
            background-size: 300px 300px;
            animation: twinkle 8s ease-in-out infinite;
            animation-delay: 2s;
          }

          @keyframes twinkle {
            0% { opacity: 0.3; }
            50% { opacity: 1; }
            100% { opacity: 0.3; }
          }

          /* Enhanced Sun */
          .sun {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 50px;
            height: 50px;
            background: radial-gradient(circle, #fff 0%, #ffff00 20%, #ffa500 40%, #ff4500 100%);
            border-radius: 50%;
            box-shadow: 0 0 80px #ff4500, 0 0 30px #ff8c00;
            transform: translate(-50%, -50%);
            z-index: 10;
          }

          /* Enhanced Orbit Animations */
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg); }
            to { transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg); }
          }

          .mercury-orbit, .venus-orbit, .earth-orbit, .mars-orbit, .jupiter-orbit, .saturn-orbit {
            position: absolute;
            top: 50%;
            left: 50%;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            transform: translate(-50%, -50%);
          }

          .mercury-orbit {
            width: 100px;
            height: 100px;
            --orbit-radius: 50px;
          }

          .venus-orbit {
            width: 160px;
            height: 160px;
            --orbit-radius: 80px;
          }

          .earth-orbit {
            width: 220px;
            height: 220px;
            --orbit-radius: 110px;
          }

          .mars-orbit {
            width: 280px;
            height: 280px;
            --orbit-radius: 140px;
          }

          .jupiter-orbit {
            width: 340px;
            height: 340px;
            --orbit-radius: 170px;
          }

          .saturn-orbit {
            width: 400px;
            height: 400px;
            --orbit-radius: 200px;
          }

          /* Enhanced Planets */
          .mercury, .venus, .earth, .mars, .jupiter, .saturn {
            position: absolute;
            top: 50%;
            left: 0;
            transform: translate(-50%, -50%);
            border-radius: 50%;
          }

          .mercury {
            width: 8px;
            height: 8px;
            background: radial-gradient(circle, #e6e6e6, #bdc3c7);
            animation: orbit 5s linear infinite;
          }

          .venus {
            width: 12px;
            height: 12px;
            background: radial-gradient(circle, #ffd700, #e67e22);
            animation: orbit 8s linear infinite;
          }

          .earth {
            width: 14px;
            height: 14px;
            background: radial-gradient(circle, #3498db, #2980b9);
            animation: orbit 12s linear infinite;
          }

          .mars {
            width: 10px;
            height: 10px;
            background: radial-gradient(circle, #ff6b6b, #e74c3c);
            animation: orbit 15s linear infinite;
          }

          .jupiter {
            width: 22px;
            height: 22px;
            background: radial-gradient(circle, #f39c12, #d35400);
            animation: orbit 20s linear infinite;
          }

          .saturn {
            width: 18px;
            height: 18px;
            background: radial-gradient(circle, #f1c40f, #e67e22);
            animation: orbit 25s linear infinite;
          }

          /* Saturn Rings */
          .saturn-rings {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 36px;
            height: 8px;
            background: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
            transform: translate(-50%, -50%) rotate(30deg);
          }

          /* Planet Glows */
          .planet-glow {
            position: absolute;
            top: 50%;
            left: 50%;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            filter: blur(2px);
            opacity: 0.6;
          }

          .mercury-glow {
            width: 12px;
            height: 12px;
            background: rgba(189, 195, 199, 0.3);
          }

          .venus-glow {
            width: 18px;
            height: 18px;
            background: rgba(230, 126, 34, 0.3);
          }

          .earth-glow {
            width: 20px;
            height: 20px;
            background: rgba(52, 152, 219, 0.3);
          }

          .mars-glow {
            width: 16px;
            height: 16px;
            background: rgba(231, 76, 60, 0.3);
          }

          .jupiter-glow {
            width: 30px;
            height: 30px;
            background: rgba(211, 84, 0, 0.3);
          }

          .saturn-glow {
            width: 26px;
            height: 26px;
            background: rgba(241, 196, 15, 0.3);
          }
        `}</style>

        {/* Custom Crash Value Input */}
        <div className="absolute top-2 right-4 z-10">
          <input
            type="number"
            value={customCrashValue}
            onChange={(e) => setCustomCrashValue(Math.max(1.0, Number.parseFloat(e.target.value) || 1.0))}
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-600"
            placeholder="Crash at..."
            min="1.0"
            step="0.1"
          />
        </div>

        {/* Game Status Display */}
        <div className="absolute top-2 left-4 z-10">
          <span
            className={`px-3 py-1 rounded text-sm font-bold ${gameState === "idle"
                ? "bg-gray-600"
                : gameState === "active"
                  ? "bg-green-600"
                  : gameState === "crashed"
                    ? "bg-red-600"
                    : "bg-yellow-600"
              }`}
          >
            {gameState === "idle"
              ? "PLACE BET"
              : gameState === "active"
                ? "IN PROGRESS"
                : gameState === "crashed"
                  ? "CRASHED"
                  : "CASHED OUT"}
          </span>
        </div>

        {/* Multiplier or Countdown Display */}
        {gameState === "active" ? (
          <motion.div
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
            className="text-7xl font-bold text-white z-10 mt-8"
          >
            {multiplier.toFixed(2)}x
          </motion.div>
        ) : (
          <div className="z-10 mt-8 flex flex-col items-center">
            <div className="text-7xl font-bold text-white mb-2">{gameState === "crashed" ? "GETTING THE BETS" : "GETTING THE BETS"}</div>
            <div className="text-4xl font-bold text-yellow-500 mb-4">{countdown}s</div>
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="relative w-full max-w-3xl h-72 mt-8">
          {/* Corner Labels */}
          <div className="absolute bottom-0 left-0 text-white z-10">A</div>
          <div className="absolute bottom-0 right-0 text-white z-10">B</div>
          <div className="absolute top-0 right-0 text-white z-10">C</div>
          <div className="absolute top-0 left-0 text-white z-10">D</div>

          {/* Curved Path Background */}
          <svg className="absolute w-full h-full" style={{ zIndex: 0 }}>
            <motion.path
              d="M 0 270 Q 300 190 600 0 L 600 270 L 120 270 Z"
              fill="rgba(255, 69, 0, 0.1)"
              initial={{ scale: 0, originX: 0, originY: 1 }}
              animate={{ scale: gameActive ? 1 : 0 }}
              transition={{ duration: 3.5, ease: "linear" }}
            />
          </svg>

          {/* Path Lines */}
          <svg className="absolute w-full h-full" style={{ zIndex: 1 }}>
            <motion.path
              d="M 0 270 Q 300 190 600 0"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: gameActive ? 1 : 0 }}
              transition={{ duration: 3.5, ease: "linear" }}
            />

            {gameActive && !crashed && (
              <>
                <path
                  d={`M 0 0 L 0 270`}
                  stroke={rocketAtCorner ? "rgba(255,165,0,0.4)" : "rgba(255,255,255,0.4)"}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${dotPosition},4,4,4,4,4,4,4,4,4`}
                  style={{ strokeDashoffset: -dotPosition }}
                />

                <path
                  d={`M 0 270 L 840 270`}
                  stroke={rocketAtCorner ? "rgba(255,165,0,0.4)" : "rgba(255,255,255,0.4)"}
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${dotPosition},4,4,4,4,4,4,4,4,4`}
                  style={{ strokeDashoffset: -dotPosition }}
                />
              </>
            )}
          </svg>

          {/* Enhanced Rocket with Glow */}
          {gameActive && (
            <motion.div
              className="absolute w-32 h-32"
              initial={{ offsetDistance: "0%" }}
              animate={crashed ? { x: "100vw" } : { offsetDistance: "100%" }}
              transition={{ duration: crashed ? 1 : 3.5, ease: "linear" }}
              style={{
                offsetPath: "path('M 0 270 Q 300 190 600 0')",
                offsetRotate: "auto",
                filter: "drop-shadow(0 0 15px rgba(255,165,0,0.8))",
                zIndex: 20,
              }}
              onAnimationComplete={() => !crashed && setRocketAtCorner(true)}
            >
              <div className="relative">
                <div
                  className="absolute w-full h-full rounded-full bg-orange-500 opacity-20 animate-pulse"
                  style={{ filter: "blur(10px)" }}
                ></div>
                <img
                  src={Rocket || "/placeholder.svg"}
                  alt="Rocket"
                  className="w-full h-full object-contain relative z-10"
                  style={{ transform: "rotate(45deg)" }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Crash Effect */}
        {crashed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div
              className="w-28 h-28 bg-red-600 rounded-full opacity-75"
              animate={{ scale: [1, 1.7, 1], opacity: [1, 0.5, 0] }}
              transition={{ duration: 1, repeat: 3 }}
            />
          </motion.div>
        )}
      </div>

      {/* Bet Section */}
      <BetSection onPlaceBet={handlePlaceBet} isGameActive={gameActive || gameState === "active" || countdown < 5} />

    </div>
  )
}

export default CrashGame

