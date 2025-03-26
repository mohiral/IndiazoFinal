"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

function GameCard({ title, description, imageSrc, gameId }) {
  const [isHovered, setIsHovered] = useState(false)
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/CrashGame`)
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden shadow-lg cursor-pointer bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700"
      style={{
        transform: isHovered ? "scale(1.03) translateY(-5px)" : "scale(1) translateY(0)",
        transition: "transform 0.2s ease-in-out",
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={imageSrc || "/placeholder.jpg"}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500"
          style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70"></div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-gray-300 text-sm">{description}</p>

        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-400">Popular Game</span>
          <button
            className="px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-full"
            style={{
              transform: isHovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.2s ease-in-out",
            }}
          >
            Play Now
          </button>
        </div>
      </div>

      {isHovered && (
        <div
          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
          style={{
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
        >
          <div
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full font-bold"
            style={{
              transform: isHovered ? "scale(1)" : "scale(0.8)",
              opacity: isHovered ? 1 : 0,
              transition: "transform 0.2s ease-in-out, opacity 0.2s ease-in-out",
              transitionDelay: "0.1s",
            }}
          >
            PLAY NOW
          </div>
        </div>
      )}
    </div>
  )
}

export default GameCard

