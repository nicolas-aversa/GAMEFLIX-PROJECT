import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { AuthContext } from '../../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useContext(AuthContext);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        login(result.accessToken, result.user.userType);
        localStorage.setItem('token', result.accessToken);
        if (result.user.userType === 'developer') {
          localStorage.setItem('developerId', result.user.developerId);
        } else if (result.user.userType === 'customer') {
          localStorage.setItem('customerId', result.user.customerId);
        }
        const userData = {
          id: result.user.customerId || result.user.developerId,
          email: result.user.email,
          userType: result.user.userType,
        };
        
        login(result.accessToken, result.user.userType, userData);

        setSuccess('Login exitoso!');
        setTimeout(() => {
          setSuccess('');
          navigate('/');
        }, 1000);
      } else {
        setError(result.message);
        setTimeout(() => {
          setError('');
        }, 5000);
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      setError('Un error occurrió durante el login. Por favor intenta de nuevo.');
      setTimeout(() => {
        setError('');
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 font-['Inter']">
      <div className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mt-6 mb-14 text-center">Bienvenido de vuelta!</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-12">
            <label htmlFor="email" className="block mb-2 text-sm font-medium">
              Correo electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                tabIndex={1}
                className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-1"
                required
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-[#C93DEC]" />
              </div>
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                tabIndex={2}
                className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <Eye className="h-5 w-5 text-[#C93DEC]" />
                ) : (
                  <EyeOff className="h-5 w-5 text-[#C93DEC]" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <div className="mb-6 text-red-500 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 text-green-500 text-sm">
              {success}
            </div>
          )}
          <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start space-y-4 sm:space-y-0 mb-12 w-full">
            <Link
            to="/reset-password"
            tabIndex={3}
            className="text-sm text-[#C93DEC] hover:underline"
            >
            ¿Olvidaste tu contraseña?
          </Link>
          <Link
            to="/signup"
            tabIndex={3}
            className="text-sm text-[#C93DEC] hover:underline"
          >
          Crea una cuenta aquí
        </Link>
      
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              tabIndex={999}
              className="bg-[#C93DEC] text-white rounded-2xl py-2 px-6 hover:bg-[#a331c4] font-medium"
            >
              Continuar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;