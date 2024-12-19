import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import gameflixLogo from '../img/gameflix-logo.png';

export default function Header() {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isAuthenticated, logout, userType } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileAccountOpen, setIsMobileAccountOpen] = useState(false);

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchValue(value);
    
    if (value.trim()) {
      try {
        const response = await fetch(`http://localhost:8000/games/search?q=${encodeURIComponent(value)}`);
        const data = await response.json();
        setSearchResults(data.games || []);
        setShowDropdown(true);
      } catch (error) {
        console.error('Error searching games:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleGameSelect = (gameId) => {
    setShowDropdown(false);
    setSearchValue('');
    setIsMobileMenuOpen(false);
    navigate(`/game/${gameId}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setShowDropdown(false);
      }
      if (!event.target.closest('.dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log('Search:', searchValue);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
    setIsMobileAccountOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsMobileAccountOpen(false);
  };

  const toggleMobileAccount = () => {
    setIsMobileAccountOpen(!isMobileAccountOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <header className="text-white py-4 bg-background">
      <div className="mx-auto px-4 sm:px-6 lg:px-14 max-w-6xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 sm:space-x-8 lg:space-x-14">
            <Link to="/" className="flex items-center">
              <img src={gameflixLogo} alt="GameFlix Logo" className="h-8 sm:h-10 lg:h-12" />
            </Link>
            <Link to="/search" className="hidden sm:block hover:text-secondary transition-colors duration-300 font-medium text-sm lg:text-base">
              Buscar videojuegos
            </Link>
          </div>
          
          {/* Barra de búsqueda para mobile */}
          <div className="sm:hidden flex-grow mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Buscar..."
                className="w-full bg-primary text-white rounded-full py-1 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-secondary"
                aria-label="Search"
              >
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-2 bg-primary rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                {searchResults.map((game) => (
                  <div
                    key={game._id}
                    onClick={() => handleGameSelect(game._id)}
                    className="flex items-center p-3 hover:bg-secondary/20 cursor-pointer transition-colors"
                  >
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium">{game.title}</p>
                      <p className="text-xs text-gray-400">{game.category}</p>
                      <p className="text-xs text-secondary font-medium">${game.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Barra de busqueda para desktop */}
          <div className="hidden sm:block flex-grow mx-4 search-container relative">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[250px] mx-auto">
              <input
                type="text"
                value={searchValue}
                onChange={handleSearchChange}
                placeholder="Estoy buscando..."
                className="w-full bg-primary text-white rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary"
                aria-label="Search"
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </form>
            {showDropdown && searchResults.length > 0 && (
              <div className=" absolute z-50 w-full mt-2 bg-primary rounded-lg shadow-lg max-h-[400px] overflow-y-auto ">
                {searchResults.map((game) => (
                  <div
                    key={game._id}
                    onClick={() => handleGameSelect(game._id)}
                    className="flex items-center p-3 hover:bg-secondary/20 cursor-pointer transition-colors"
                  >
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="ml-4">
                      <p className="text-base font-medium">{game.title}</p>
                      <p className="text-sm text-gray-400">{game.category}</p>
                      <p className="text-sm text-secondary font-medium">${game.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center space-x-4 lg:space-x-14">
            {isAuthenticated ? (
              <>
                <div className="relative group dropdown">
                  <button 
                    onClick={toggleDropdown}
                    className="bg-secondary text-background rounded-full px-4 py-2 hover:bg-opacity-80 transition-colors duration-300 text-sm font-medium flex items-center"
                  >
                    <span>Mi cuenta</span>
                    <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </button>
                  <div className={`absolute top-8 left-0 right-0 mt-2 w-80 bg-secondary rounded-2xl shadow-lg py-1 z-10 ${isDropdownOpen ? 'block' : 'hidden'}`}>
                    {userType === 'developer' ? (
                      <>
                        <Link
                          to="/manage-games"
                          className="flex items-center px-4 py-2 text-sm text-background rounded-2xl hover:bg-[#A829C3] transition-colors duration-300 font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-2 text-background" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'translateX(-1.8px)' }}>
                            <path fillRule="evenodd" clipRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" fill="currentColor"/>
                          </svg>
                          Gestionar mis videojuegos
                        </Link>
                        <div className="border-t-2 border-background my-1"></div>
                        <Link
                          to="/game-performance"
                          className="flex items-center px-4 py-2 text-sm text-background rounded-2xl hover:bg-[#A829C3] transition-colors duration-300 font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-2 text-background" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M3 2C3.55228 2 4 2.44772 4 3V17C4 17.5523 4.44772 18 5 18H21C21.5523 18 22 18.4477 22 19C22 19.5523 21.5523 20 21 20H5C3.34315 20 2 18.6569 2 17V3C2 2.44772 2 2 3 2Z" fill="currentColor" stroke="currentColor" strokeWidth="1.2"/>
                            <path d="M6 14L12 8L15 11L20 6" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Rendimiento de mis videojuegos
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/my-wishlist"
                          className="flex items-center px-4 py-2 text-sm text-background rounded-2xl hover:bg-[#A829C3] transition-colors duration-300 font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-2 text-background" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17 3H7C5.89543 3 5 3.89543 5 5V21L12 17.5L19 21V5C19 3.89543 18.1046 3 17 3Z" fill="currentColor"/>
                            <path d="M12 7.5C12 7.5 12 9.5 12 10C12 10.5 12 12.5 12 12.5M9.5 10C9.5 10 10.5 10 11 10C11.5 10 14.5 10 14.5 10" stroke="#C93DEC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Mi wishlist
                        </Link>
                        <div className="border-t-2 border-background my-1"></div>
                        <Link
                          to="/my-games"
                          className="flex items-center px-4 py-2 text-sm text-background rounded-2xl hover:bg-[#A829C3] transition-colors duration-300 font-medium"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5 mr-2 text-background" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
                          </svg>
                          Mis juegos
                        </Link>
                      </>
                    )}
                  </div>
                </div>
                <button onClick={handleLogout} className="flex items-center space-x-2 text-white hover:text-secondary transition-colors duration-300 font-medium text-sm lg:text-base">
                  <span>Cerrar sesión</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-secondary"
                  >
                    <path
                      d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="bg-secondary text-background rounded-full px-4 py-2 hover:bg-opacity-80 transition-colors duration-300 text-sm font-medium">
                  Registrarse
                </Link>
                <Link to="/login" className="flex items-center space-x-2 text-white hover:text-secondary transition-colors duration-300 font-medium text-sm lg:text-base">
                  <span>Iniciar sesión</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-secondary"
                  >
                    <path
                      d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Link>
              </>
            )}
          </div>

          {/* Menú dropdown para mobile */}
          <div className="sm:hidden">
            <button onClick={toggleMobileMenu} className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Menú mobile */}
        
        {isMobileMenuOpen && (
          <div className="sm:hidden mt-4">
            <Link to="/search" className="block py-2 hover:text-secondary transition-colors duration-300">
              Buscar videojuegos
            </Link>
            
            {isAuthenticated ? (
              <>
                <button 
                  onClick={toggleMobileAccount}
                  className="w-full text-left py-2 hover:text-secondary transition-colors duration-300 flex items-center justify-between"
                >
                  <span>Mi cuenta</span>
                  <svg className={`w-3 h-3 ml-0.5 transform transition-transform ${isMobileAccountOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isMobileAccountOpen && (
                  <div className="pl-4 bg-primary rounded-lg mt-2 mb-2">
                    {userType === 'developer' ? (
                      <>
                        <Link to="/manage-games" className="block py-2 hover:text-secondary transition-colors duration-300">
                          Gestionar mis videojuegos
                        </Link>
                        <Link to="/game-performance" className="block py-2 hover:text-secondary transition-colors duration-300">
                          Rendimiento de mis videojuegos
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/my-wishlist" className="block py-2 hover:text-secondary transition-colors duration-300">
                          Mi wishlist
                        </Link>
                        <Link to="/my-games" className="block py-2 hover:text-secondary transition-colors duration-300">
                          Mis juegos
                      </Link>
                    </>
                    )}
                  </div>
                )}
                <button onClick={handleLogout} className="w-full text-left py-2 hover:text-secondary transition-colors duration-300">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/signup" className="block py-2 hover:text-secondary transition-colors duration-300">
                  Registrarse
                </Link>
                <Link to="/login" className="block py-2 hover:text-secondary transition-colors duration-300">
                  Iniciar sesión
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}