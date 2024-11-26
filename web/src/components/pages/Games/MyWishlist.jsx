import React, { useState, useEffect } from 'react'
import { Trash2 } from "lucide-react"

export default function MyWishlist() {
  const [games, setGames] = useState([])

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token')
      const customerId = localStorage.getItem('customerId')

      if (!customerId) {
        console.error('Customer ID is null')
        return
      }

      const response = await fetch(`http://localhost:8000/customers/${customerId}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.error) {
        console.error('Error fetching wishlist games:', data.message)
        setGames([])
      } else if (Array.isArray(data.games)) {
        setGames(data.games)
      } else {
        setGames([])
      }
    } catch (error) {
      console.error('Error fetching wishlist games:', error)
      setGames([])
    }
  }

  const removeFromWishlist = async (gameId) => {
    try {
      const token = localStorage.getItem('token')
      const customerId = localStorage.getItem('customerId')

      const response = await fetch(`http://localhost:8000/customers/${customerId}/wishlist/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (data.error) {
        console.error('Error removing game from wishlist:', data.message)
      } else {
        fetchWishlist()
      }
    } catch (error) {
      console.error('Error removing game from wishlist:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#220447] text-white font-['Inter']">
      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl mt-14 mb-12 text-center">Mi wishlist</h2>
        <div className="flex overflow-x-auto space-x-4 pb-6">
          {games.map((game) => (
            <div key={game._id} className="flex-none w-36">
              <div className="relative group">
                <div className="w-36 h-48 overflow-hidden rounded-md shadow-lg">
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="w-full h-full object-cover rounded-md shadow-lg"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md flex items-center justify-center">
                  <button
                    onClick={() => removeFromWishlist(game._id)}
                    className="text-white hover:text-red-500 transition-colors duration-200"
                    aria-label={`Eliminar ${game.title} de la lista de deseos`}
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <h3 className="mt-2 text-lg truncate">{game.title}</h3>
              <div className="text-xs text-gray-400">
                <span>{game.category} - </span>
                <span className="text-[#C93DEC]">${game.price}</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
