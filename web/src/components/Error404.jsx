import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import wastedImage from '../img/wasted.png';
import xButton from '../img/playstation-x-button.png';

const ErrorPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const errorCode = location.state?.errorCode || 404;
  const errorMessage = location.state?.errorMessage || 'page not found';

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="w-full bg-black bg-opacity-20 flex flex-col items-center justify-center py-14">
        <div className="text-center">
          <img src={wastedImage} alt="Wasted" className="w-80 h-20"/>
          <p className="text-secondary text-xl md:text-md w-80 md:w-88 mx-auto mt-4">
            error {errorCode} {errorMessage}
          </p>
        </div>
      </div>
      <div className="mt-14">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 bg-white font-medium text-primary px-3 py-3 rounded-full hover:bg-opacity-90 transition-colors"
        >
          <img src={xButton} alt="X" className="w-6 h-7" />
          Reaparecer en el inicio
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;