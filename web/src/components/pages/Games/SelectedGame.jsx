import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Bookmark, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';
import { CheckIcon } from '@radix-ui/react-icons';
import Mastercard from '../img/mastercard.svg';
import Visa from '../img/visa.svg';
import { AuthContext } from '../../../context/AuthContext';

const PurchaseModal = ({ showPurchaseModal, setShowPurchaseModal, game, onPurchase }) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');

  const handleCloseModal = () => {
    setShowPurchaseModal(false);
    setAcceptedTerms(false);
    setCardNumber('');
    setExpiryDate('');
    setCvc('');
  };

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCardNumber(value);
  };

  const handleExpiryDateChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 2) {
      setExpiryDate(value);
    } else if (value.length <= 4) {
      setExpiryDate(value.slice(0, 2) + '/' + value.slice(2));
    }
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setCvc(value);
  };

  const getCardType = () => {
    if (cardNumber.startsWith('4')) {
      return Visa;
    } else if (cardNumber.startsWith('5')) {
      return Mastercard;
    }
    return null;
  };

  const handlePurchase = () => {
    onPurchase({
      cardNumber,
      cardProvider: getCardType() === Visa ? 'Visa' : 'Mastercard',
      cardExpDate: expiryDate,
      cardCVC: cvc
    });
    handleCloseModal();
  };

  return (
    <Dialog.Root open={showPurchaseModal} onOpenChange={handleCloseModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[750px] bg-[#220447] rounded-2xl p-8 text-white border border-white">
          <div className="relative">
            <Dialog.Close className="absolute -top-4 -right-4 text-white hover:text-white/80 transition-colors rounded-full border-2 border-white p-1">
              <X className="h-7 w-7" />
            </Dialog.Close>
            <div className="flex justify-center mb-12">
              <Dialog.Title className="text-2xl font-bold">Un pasito más...</Dialog.Title>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <label className="block mb-2">Número de la tarjeta</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="5358-XXXX-XXXX-XXXX"
                    className="w-full bg-[#3A0453] text-white placeholder:text-gray-500 p-2 rounded-xl"
                    maxLength={16}
                  />
                  {getCardType() && (
                    <img
                      src={getCardType()}
                      alt={getCardType()}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 h-14 w-16"
                    />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block mb-2">Vencimiento de la tarjeta</label>
                  <input
                    type="text"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/AA"
                    className="w-full bg-[#3A0453] border-none text-white placeholder:text-gray-500 p-2 rounded-2xl"
                    maxLength={5}
                  />
                </div>
                <div>
                  <label className="block mb-2">Código de seguridad</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={handleCvcChange}
                    placeholder="CVC"
                    className="w-full bg-[#3A0453] border-none text-white placeholder:text-gray-500 p-2 rounded-2xl"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox.Root
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={setAcceptedTerms}
                className="w-5 h-5 bg-[#3A0453] rounded-lg flex items-center justify-center"
              >
                <Checkbox.Indicator>
                  <CheckIcon className="text-[#C93DEC] w-5 h-5" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label
                htmlFor="terms"
                className="text-lg text-gray-300"
              >
                Acepto los términos y condiciones
              </label>
            </div>

            <div className="flex justify-center mt-6">
              <button
                className="bg-[#C93DEC] hover:bg-[#C93DEC]/90 text-white py-3 px-12 rounded-xl font-medium text-xl disabled:opacity-50 transition-colors"
                disabled={!acceptedTerms}
                onClick={handlePurchase}
              >
                Finalizar
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const SuccessModal = ({ showSuccessModal, setShowSuccessModal, game }) => {
  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <Dialog.Root open={showSuccessModal} onOpenChange={handleCloseModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[300px] h-[400px] bg-[#220447] rounded-2xl p-8 text-white border border-white">
          <div className="relative">
            <Dialog.Close className="absolute -top-4 -right-4 text-white hover:text-white/80 transition-colors rounded-full border-2 border-white p-1">
              <X className="h-7 w-7" />
            </Dialog.Close>
            <div className="flex justify-center mb-12">
              <Dialog.Title className="text-2xl ">Juego comprado</Dialog.Title>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-6">
              <div className="flex justify-center">
                <img 
                  src={game.imageUrl} 
                  alt={game.title} 
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
              <div className="text-center">
                <h2 className="text-xl">{game.title}</h2>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const SelectedGame = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const { userType, user } = useContext(AuthContext);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    fetchGame();
    fetchReviews();
    incrementViewCount();
    if (userType === 'customer' && user) {
      incrementViewCount();
      checkWishlistStatus();
    }
  }, [id, userType, user]);

  const fetchGame = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/games/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (data.error) {
        setError(data.message);
        setGame(null);
      } else {
        setGame(data.game);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      setError('Error al cargar el juego');
      setGame(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:8000/games/${id}/reviews`);
      const data = await response.json();

      if (data.error) {
        setError(data.message);
        setReviews([]);
      } else {
        setReviews(data.reviews);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Error al cargar las reviews');
      setReviews([]);
    }
  };

  const incrementViewCount = async () => {
    if (userType === 'customer' && user) {
      try {
        await fetch(`http://localhost:8000/games/${id}/views`, {
          method: 'POST'
        });
      } catch (error) {
        console.error('Error incrementing view count:', error);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/games/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: reviewContent,
          rating: reviewRating
        })
      });

      const data = await response.json();

      if (data.error) {
        setError(data.message);
      } else {
        setReviewContent('');
        setReviewRating(0);
        fetchReviews();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Error al enviar la review');
    }
  };

  const checkWishlistStatus = async () => {
    if (userType === 'customer' && user && user.id) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:8000/customers/${user.id}/wishlist`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setIsInWishlist(data.wishlist.includes(id));
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    }
  };

  const handleBookmarkClick = async () => {
    if (userType !== 'customer' || !user || !user.id) {
      console.log('User must be logged in as a customer to use wishlist');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/customers/${user.id}/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ gameId: id })
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
  
      if (data.error) {
        setError(data.message);
      } else {
        setIsInWishlist(prevState => !prevState);
        console.log(isInWishlist ? 'Game removed from wishlist' : 'Game added to wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      setError('Error al actualizar la lista de deseos');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const handlePurchase = async (paymentDetails) => {
    if (userType !== 'customer' || !user || !user.id) {
      console.log('User must be logged in as a customer to purchase');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/customers/${user.id}/games/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gameId: id,
          ...paymentDetails
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      if (data.error) {
        setError(data.message);
      } else {
        console.log('Game purchased successfully');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error purchasing game:', error);
      setError('Error al comprar el juego');
    }
  };

  if (loading) {
    return (
      <div className="bg-[#1A0B2E] min-h-screen text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="bg-[#1A0B2E] min-h-screen text-white p-4 sm:p-8 flex items-center justify-center">
        <div className="text-xl">{error || 'Juego no encontrado'}</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen text-white p-4 sm:p-8 ${showPurchaseModal ? 'blur-sm' : ''}`}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="w-full lg:w-64 h-96 rounded-xl overflow-hidden border-4 border-purple-800 mb-4">
              <img 
                src={game.imageUrl} 
                alt={game.title} 
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  e.target.src = "/api/placeholder/400/320";
                }}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-between lg:w-64">
              <button 
                type="button"
                className={`p-2 rounded-lg flex-grow sm:flex-grow-0 ${
                  isInWishlist ? 'bg-[#C93DEC]' : 'bg-[#3A0453]'
                } hover:opacity-80 transition-all duration-200 ease-in-out`}
                onClick={handleBookmarkClick}
                disabled={userType !== 'customer' || !user || !user.id}
              >
                <Bookmark 
                  className={`w-6 h-6 mx-auto ${isInWishlist ? 'text-white' : 'text-[#C93DEC]'}`}
                />
              </button>
              <button 
                type="button"
                onClick={() => setShowPurchaseModal(true)}
                className="bg-[#C93DEC] hover:bg-[#C93DEC]/90 transition-colors text-white px-4 py-2 rounded-2xl whitespace-nowrap flex-grow"
                disabled={userType !== 'customer' || !user || !user.id}
              >
                Comprar ${game.price}
              </button>
            </div>
          </div>

          
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <h1 className="text-3xl">{game.title}</h1>
              <span className="text-[#C93DEC] mb-2 bg-[#3A0453] p-1 rounded-full inline-block px-2 flex items-center gap-2 text-xl whitespace-nowrap">
                {game.developer.companyName}
                {game.developer.logoImageUrl && (
                  <img
                    src={game.developer.logoImageUrl}
                    alt={`${game.developer.companyName} logo`}
                    className="h-8 w-8 rounded-full"
                  />
                )}
              </span>
            </div>

            <div className="mt-4 sm:mt-6">
              <h2 className="text-[#C93DEC] mb-2 bg-[#3A0453] p-1 rounded-full inline-block px-2">Descripción</h2>
              <p className="text-gray-300 text-sm">{game.description}</p>
            </div>

            <div className="mt-4 sm:mt-6">
              <h2 className="text-[#C93DEC] mb-2 bg-[#3A0453] p-1 rounded-full inline-block px-2">Empresa desarrolladora</h2>
              <p className="text-gray-300 text-sm">{game.developer.companyDescription}</p>
            </div>

            {game.minimumRequirements && (
              <div className="mt-4 sm:mt-6">
                <div className="flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/3">
                    <h2 className="text-[#C93DEC] mb-2 bg-[#3A0453] p-1 rounded-full inline-block px-2">
                      Requerimientos mínimos
                    </h2>
                    <ul className="text-gray-300 text-sm">
                      <li>• CPU: {game.minimumRequirements.cpu}</li>
                      <li>• Memoria: {game.minimumRequirements.memory}</li>
                      <li>• GPU: {game.minimumRequirements.gpu}</li>
                    </ul>
                  </div>
                  <div className="w-full sm:w-1/3 sm:ml-2">
                    <h2 className="text-[#C93DEC] mb-2 bg-[#3A0453] p-1 rounded-full inline-block px-2 whitespace-nowrap">
                      Requerimientos recomendados
                    </h2>
                    <ul className="text-gray-300 text-sm">
                      <li>• CPU: {game.recommendedRequirements.cpu}</li>
                      <li>• Memoria: {game.recommendedRequirements.memory}</li>
                      <li>• GPU: {game.recommendedRequirements.gpu}</li>
                    </ul>
                  </div>
                  <div className="w-full sm:w-1/3 sm:ml-8">
                    <h2 className="text-[#C93DEC] mb-2 bg-[#3A0453] p-1 rounded-full inline-block px-2">
                      Información adicional
                    </h2>
                    <ul className="text-gray-300 text-sm">
                      <li>• SO: {game.os}</li>
                      <li>• Idioma: {game.language}</li>
                      <li>• Jugadores: {game.playersQty}</li>
                      <li className="flex items-center">
                        • Calificación: {calculateAverageRating()}
                        <span className="text-[#AB4ABA] text-xl ml-1" style={{ textShadow: '1px 1px 0 #220447, -1px -1px 0 #220447, 1px -1px 0 #220447, -1px 1px 0 #220447' }}>
                          ★
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        
        <div className="mt-8 -mx-4 sm:-mx-8">
          <h2 className="text-xl mb-4 px-4 sm:px-8">Reviews de los usuarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4 sm:px-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-[#3A0453] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#C93DEC] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {`${review.firstName[0]}${review.lastName[0]}`}
                    </span>
                  </div>
                  <span className="text-sm">{review.firstName} {review.lastName}</span>
                  <div className="flex ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-[#AB4ABA] text-xl" style={{ textShadow: '1px 1px 0 #220447, -1px -1px 0 #220447, 1px -1px 0 #220447, -1px 1px 0 #220447' }}>
                        {i < review.rating ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-xs">{review.content}</p>
              </div>
            ))}

            {userType === 'customer' && user && (
              <div className="bg-[#3A0453] p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-[#C93DEC] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.firstName && user.lastName ? `${user.firstName[0]}${user.lastName[0]}` : 'U'}
                    </span>
                  </div>
                  <span className="text-sm">{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Usuario'}</span>
                  <div className="flex ml-auto">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        onClick={() => setReviewRating(i + 1)}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        className={`cursor-pointer text-xl ${i < (hoverRating || reviewRating) ? 'text-[#C93DEC]' : 'text-[#AB4ABA]'} hover:text-[#C93DEC]`}
                        style={{ textShadow: '1px 1px 0 #220447, -1px -1px 0 #220447, 1px -1px 0 #220447, -1px 1px 0 #220447' }}
                      >
                        {i < (hoverRating || reviewRating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                </div>
                <form onSubmit={handleReviewSubmit} className="space-y-4 text-sm">
                  <div>
                    <textarea
                      id="reviewContent"
                      name="reviewContent"
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
                      placeholder="Añade tu review..."
                      className="w-full bg-[#3A0453] text-white rounded-lg p-2 min-h-[225px]"
                      rows="6"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#C93DEC] text-white rounded-2xl py-2 px-4 hover:bg-[#a331c4] transition-colors"
                    >
                      Enviar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <SuccessModal showSuccessModal={showSuccessModal} setShowSuccessModal={setShowSuccessModal} game={game} />
      <PurchaseModal showPurchaseModal={showPurchaseModal} setShowPurchaseModal={setShowPurchaseModal} game={game} onPurchase={handlePurchase}/>
    </div>
  );
};

export default SelectedGame;