import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Star, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [allGames, setAllGames] = useState([]);
  const [mostViewedGames, setMostViewedGames] = useState([]);
  const [bestRatedGames, setBestRatedGames] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);

  useEffect(() => {
    fetchAllGames();
  }, []);

  const fetchAllGames = async () => {
    try {
      let allGames = [];
      let page = 1;
      let hasMoreGames = true;

      while (hasMoreGames) {
        const response = await fetch(`http://localhost:8000/games?page=${page}`);
        const data = await response.json();

        if (data.error) {
          console.error('Error fetching games:', data.message);
          break;
        }

        if (Array.isArray(data.games) && data.games.length > 0) {
          allGames = [...allGames, ...data.games];
          page++;
        } else {
          hasMoreGames = false;
        }
      }

      setAllGames(allGames);
      processGames(allGames);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const processGames = (games) => {
    const sortedByViews = [...games].sort((a, b) => b.views - a.views);
    setMostViewedGames(sortedByViews);

    const gamesWithRatings = games.map(game => ({
      ...game,
      averageRating: calculateAverageRating(game.reviews)
    }));

    const sortedByRating = [...gamesWithRatings].sort((a, b) => b.averageRating - a.averageRating);
    setBestRatedGames(sortedByRating);

    const sortedByPurchases = [...games].sort((a, b) => b.purchases - a.purchases);
    setBestSellers(sortedByPurchases);
  };

  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const handleGameClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  const GameCard = ({ game, hoverInfo }) => (
    <div
      onClick={() => handleGameClick(game._id)}
      className="group relative cursor-pointer w-28 sm:w-32 md:w-36 flex-shrink-0"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-[#C93DEC] to-[#95F9C3] opacity-0 group-hover:opacity-75 rounded-lg blur transition duration-300 group-hover:duration-200" />
      <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#3A0453] transition-all duration-300 group-hover:translate-y-[-4px]">
        <img
          src={game.imageUrl}
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-xs sm:text-sm font-semibold line-clamp-1 text-white/90">{game.title}</h3>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] sm:text-xs text-white/70">{game.category}</span>
            <span className="text-[10px] sm:text-xs font-semibold text-[#C93DEC]">${game.price}</span>
          </div>
        </div>
        {hoverInfo && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-[10px] sm:text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {hoverInfo}
          </div>
        )}
      </div>
    </div>
  );

  const CarouselSection = ({ title, icon: Icon, games, hoverInfoKey }) => {
    const carouselRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const updateArrows = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
      }
    };

    useEffect(() => {
      updateArrows();
      window.addEventListener('resize', updateArrows);
      return () => window.removeEventListener('resize', updateArrows);
    }, [games]);

    const scroll = (direction) => {
      if (carouselRef.current) {
        const scrollAmount = direction === 'left' ? -carouselRef.current.clientWidth : carouselRef.current.clientWidth;
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        setTimeout(updateArrows, 500);
      }
    };

    return (
      <div className="mb-8 sm:mb-12">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#C93DEC]" />
          <h2 className="text-xl sm:text-2xl">{title}</h2>
        </div>
        <div className="relative">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 p-1 sm:p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          )}
          <div
            ref={carouselRef}
            className="flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth p-5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onScroll={updateArrows}
          >
            {games.map((game) => (
              <GameCard 
                key={game._id} 
                game={game} 
                hoverInfo={
                  hoverInfoKey === 'purchases' ? `${game.purchases} compras` :
                  hoverInfoKey === 'views' ? `${game.views} vistas` :
                  `${calculateAverageRating(game.reviews)} ★`
                }
              />
            ))}
          </div>
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 p-1 sm:p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#220447] text-white font-['Inter']">
      
      <div className="relative py-8 sm:py-16">
        <div className="mx-auto px-4 sm:px-6 lg:px-14 max-w-6xl">
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed text-center">
            Tu portal al universo gaming. Descubre mundos infinitos, 
            vive aventuras épicas y únete a una comunidad apasionada. 
            Todos tus juegos favoritos, en un solo lugar.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Link to="/search" className="bg-[#C93DEC] px-6 py-2 sm:py-3 rounded-full hover:bg-opacity-80 transition-colors text-sm sm:text-base text-center">
              Explorar Catálogo
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto px-4 sm:px-6 lg:px-14 max-w-6xl">
        <CarouselSection 
          title="Best Sellers" 
          icon={Flame} 
          games={bestSellers}
          hoverInfoKey="purchases"
        />
        <CarouselSection 
          title="Más Vistos" 
          icon={Eye} 
          games={mostViewedGames}
          hoverInfoKey="views"
        />
        <CarouselSection 
          title="Mejor Valorados" 
          icon={Star} 
          games={bestRatedGames}
          hoverInfoKey="rating"
        />
      </main>
    </div>
  );
}