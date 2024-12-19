import React, { useState, useEffect } from 'react';
import { Eye, ShoppingCart, Percent, Heart } from "lucide-react";

const GamePerformance = () => {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const developerId = localStorage.getItem('developerId');

      if (!developerId) {
        console.error('Developer ID is null');
        return;
      }

      const response = await fetch(`http://localhost:8000/developers/${developerId}/games/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error fetching games stats:', data.message);
        setGames([]);
      } else if (Array.isArray(data.games)) {
        setGames(data.games);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching games stats:', error);
      setGames([]);
    }
  };

  const incrementViewCount = async (gameId) => {
    try {
      await fetch(`http://localhost:8000/games/${gameId}/views`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#220447] text-white font-['Inter']">
      <main className="w-full max-w-7xl mx-auto px-4 py-4 flex justify-center">
        <div className="w-full max-w-5xl">
          <h2 className="text-2xl mt-14 mb-12 text-center">Rendimiento de mis juegos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <div
                key={game._id}
                className="bg-gradient-to-r from-purple-900 to-purple-1000 p-6 rounded-lg shadow-lg transition-all duration-300 ease-out"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#3A0453] transition-all duration-300 group-hover:translate-y-[-4px]">
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-sm font-semibold line-clamp-1 text-white/90">{game.title}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-white/70">{game.category}</span>
                      <span className="text-xs font-semibold text-[#C93DEC]">${game.price}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5 mt-4">
                  <div className="group flex justify-between items-center text-sm bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-1 rounded-xl hover:scale-105 transition-all duration-300 ease-out">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-[#3A0453]" />
                      <span className="text-white text-sm">Visualizaciones:</span>
                    </div>
                    <span className="text-white font-semibold text-md bg-white/10 px-2 py-0.5 rounded-full">
                      {game.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="group flex justify-between items-center text-sm bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-1 rounded-xl hover:scale-105 transition-all duration-300 ease-out">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="w-4 h-4 text-[#3A0453]" />
                      <span className="text-white text-sm">Compras:</span>
                    </div>
                    <span className="text-white font-semibold text-md bg-white/10 px-2 py-0.5 rounded-full">
                      {game.purchases.toLocaleString()}
                    </span>
                  </div>
                  <div className="group flex justify-between items-center text-sm bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-1 rounded-xl hover:scale-105 transition-all duration-300 ease-out">
                    <div className="flex items-center space-x-2">
                      <Percent className="w-5 h-5 text-[#3A0453]" />
                      <span className="text-white text-sm">Tasa de conversión:</span>
                    </div>
                    <span className="text-white font-semibold text-md bg-white/10 px-2 py-0.5 rounded-full">
                      {game.conversionRate}%
                    </span>
                  </div>
                  <div className="group flex justify-between items-center text-sm bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-1 rounded-xl hover:scale-105 transition-all duration-300 ease-out">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-[#3A0453]" />
                      <span className="text-white text-sm">Lista de deseos:</span>
                    </div>
                    <span className="text-white font-semibold text-md bg-white/10 px-2 py-0.5 rounded-full">
                      {game.wishlistCount.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GamePerformance;