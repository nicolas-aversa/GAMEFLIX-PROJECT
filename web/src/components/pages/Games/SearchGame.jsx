import React, { useState, useEffect } from 'react';
import { ChevronDown, FilterX, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function GameFilter() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [filters, setFilters] = useState({
    category: [],
    price: [],
    os: [],
    language: [],
    playersQty: [],
    rating: [],
    orderBy: '',
    order: '',
    page: 1,
    limit: 24,
  });
  const [openFilter, setOpenFilter] = useState('');

  useEffect(() => {
    fetchGames();
  }, [filters]);

  const fetchGames = async () => {
    try {
      const query = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (Array.isArray(filters[key])) {
          filters[key].forEach(value => query.append(key, value));
        } else {
          query.append(key, filters[key]);
        }
      });
      const response = await fetch(`http://localhost:8000/games?${query.toString()}`);
      const data = await response.json();

      if (data.error) {
        console.error('Error fetching games:', data.message);
        setGames([]);
      } else if (Array.isArray(data.games)) {
        setGames(data.games);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setGames([]);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prevFilters) => {
      const newValues = prevFilters[name].includes(value)
        ? prevFilters[name].filter((v) => v !== value)
        : [...prevFilters[name], value];
      return {
        ...prevFilters,
        [name]: newValues,
      };
    });
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: [],
      price: [],
      os: [],
      language: [],
      playersQty: [],
      rating: [],
      orderBy: '',
      order: '',
      page: 1,
      limit: 24,
    });
  };

  const handleGameClick = (gameId) => {
    navigate(`/game/${gameId}`);
  };

  const FilterButton = ({ name, label, options, isSecondary = false }) => (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setOpenFilter(openFilter === name ? '' : name)}
        className={`appearance-none ${
          isSecondary ? 'bg-background text-secondary' : 'bg-[#3A0453]/50 text-white'
        } rounded-full py-2.5 px-4 focus:outline-none text-sm font-medium cursor-pointer hover:bg-opacity-90 transition-colors flex items-center justify-between inline-flex group hover:text-[#C93DEC]`}
      >
        <span className="mr-2">{filters[name].length > 0 ? `${label} (${filters[name].length})` : label}</span>
        <ChevronDown className={`w-4 h-4 ${isSecondary ? 'text-secondary' : 'text-white'} flex-shrink-0 group-hover:text-[#C93DEC] transition-colors`} />
      </button>
      {openFilter === name && (
        <div className="absolute z-10 mt-1 bg-[#3A0453] rounded-md shadow-lg min-w-[200px]">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center px-4 py-2 cursor-pointer hover:bg-[#4B0869] hover:text-[#C93DEC] transition-colors duration-300"
              onClick={() => handleFilterChange(name, option.value)}
            >
              <div className={`w-4 h-4 border rounded mr-2 ${filters[name].includes(option.value) ? 'bg-purple-600 border-purple-600' : 'border-gray-300'} flex items-center justify-center`}>
                {filters[name].includes(option.value) && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm text-white">{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const PageSelector = () => (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium">Página</span>
      <div className="relative">
        <select
          name="page"
          value={filters.page}
          onChange={handleSelectChange}
          className="appearance-none bg-transparent text-white pr-4 focus:outline-none text-sm font-medium cursor-pointer"
        >
          {[1, 2, 3, 4, 5].map((page) => (
            <option key={page} value={page}>
              {page}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
      </div>
    </div>
  );

  const DisplaySelector = () => (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <select
          name="limit"
          value={filters.limit}
          onChange={handleSelectChange}
          className="appearance-none bg-transparent text-white pr-3 focus:outline-none text-sm font-medium cursor-pointer"
        >
          {[8, 12, 24, 36].map((limit) => (
            <option key={limit} value={limit}>
              {limit}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#220447] text-white font-['Inter']">
      <div className="w-full max-w-7xl mx-auto px-4 py-5 mt-4">
        <div className="bg-[#3A0453]/50 rounded-xl p-4">
          <div className="flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={clearFilters}
              className="bg-[#C93DEC] rounded-full p-2 hover:bg-opacity-30 transition-colors flex items-center space-x-2 w-full sm:w-auto"
            >
              <FilterX className="w-5 h-5 text-white" />
            </button>
            <FilterButton
              name="category"
              label="Categoría"
              options={[
                { value: 'Acción', label: 'Acción' },
                { value: 'Aventura', label: 'Aventura' },
                { value: 'RPG', label: 'RPG' },
              ]}
            />
            <FilterButton
              name="price"
              label="Precio"
              options={[
                { value: '0-20', label: '$0 - $20' },
                { value: '20-40', label: '$20 - $40' },
                { value: '40+', label: '$40+' },
              ]}
            />
            <FilterButton
              name="os"
              label="Sistema operativo"
              options={[
                { value: 'Windows', label: 'Windows' },
                { value: 'Mac', label: 'Mac' },
                { value: 'Linux', label: 'Linux' },
              ]}
            />
            <FilterButton
              name="language"
              label="Idioma"
              options={[
                { value: 'Español', label: 'Español' },
                { value: 'Inglés', label: 'Inglés' },
              ]}
            />
            <FilterButton
              name="playersQty"
              label="Jugadores"
              options={[
                { value: 'Single-player', label: 'Single-player' },
                { value: 'Multi-player', label: 'Multi-player' },
              ]}
            />
            <FilterButton
              name="rating"
              label="Calificación"
              options={[
                { value: '5', label: '5 estrellas' },
                { value: '4', label: '4+ estrellas' },
                { value: '3', label: '3+ estrellas' },
              ]}
            />
            <FilterButton
              name="orderBy"
              label="Ordenar por"
              options={[
                { value: 'price', label: 'Precio' },
                { value: 'rating', label: 'Calificación' },
                { value: 'title', label: 'Nombre' },
              ]}
              isSecondary={true}
            />
            <FilterButton
              name="order"
              label="Órden"
              options={[
                { value: 'asc', label: 'ASC' },
                { value: 'desc', label: 'DESC' },
              ]}
              isSecondary={true}
            />
          </div>
        </div>
        <div className="flex justify-end items-center mt-4 mb-6">
          <div className="flex items-center space-x-4">
            <PageSelector />
            <DisplaySelector />
          </div>
        </div>
      </div>
      <main className="w-full max-w-7xl mx-auto px-4 py-4 flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-5xl">
          {games.map((game) => (
            <div
              key={game._id}
              onClick={() => handleGameClick(game._id)}
              className="group relative cursor-pointer w-36"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-[#C93DEC] to-[#95F9C3] opacity-0 group-hover:opacity-75 rounded-lg blur transition duration-300 group-hover:duration-200" />
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#3A0453] transition-all duration-300 group-hover:translate-y-[-4px]">
              <img
                src={game.imageUrl}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-[#FFDF00] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {parseFloat(game.averageRating).toFixed(1)} ★
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-sm font-semibold line-clamp-1 text-white/90">{game.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-white/70">{game.category}</span>
                  <span className="text-xs font-semibold text-[#C93DEC]">${game.price}</span>
                </div>
              </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}