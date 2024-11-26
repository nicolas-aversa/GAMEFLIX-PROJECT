import React, { useState, useEffect } from 'react';

export default function MyGames() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    fetchPurchasedGames();
  }, []);

  const fetchPurchasedGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const customerId = localStorage.getItem('customerId');

      if (!customerId) {
        console.error('Customer ID is null');
        return;
      }

      const response = await fetch(`http://localhost:8000/customers/${customerId}/games/purchases`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.error) {
        console.error('Error fetching purchased games:', data.message);
        setGames([]);
      } else if (Array.isArray(data.purchases)) {
        setGames(data.purchases.map(purchase => purchase.gameId));
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching purchased games:', error);
      setGames([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#220447] text-white font-['Inter']">
      <main className="w-full max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl mt-14 mb-12 text-center">Mis Juegos</h2>
        {games.length === 0 ? (
          <p className="text-center text-gray-400">No tienes juegos comprados.</p>
        ) : (
          <div className="flex overflow-x-auto space-x-4 pb-6">
            {games.map((game) => (
              game && (
                <div key={game._id} className="flex-none w-36">
                  <div className="relative group">
                    <div className="w-36 h-48 overflow-hidden rounded-md shadow-lg">
                      <img
                        src={game.imageUrl}
                        alt={game.title}
                        className="w-full h-full object-cover rounded-md shadow-lg"
                      />
                    </div>
                  </div>
                  <h3 className="mt-2 text-lg truncate">{game.title}</h3>
                  <div className="text-xs text-gray-400">
                    <span>{game.category} - </span>
                    <span className="text-[#C93DEC]">${game.price}</span>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </main>
    </div>
  );
}