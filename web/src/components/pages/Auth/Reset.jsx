import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail } from 'lucide-react';

export default function PasswordReset() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrorMessage('Por favor ingrese un email válido');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/users/password-reset-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setResetToken(data.resetToken);
        console.log('PIN para reset de password:', data.resetToken);
        setStep(2);
        setErrorMessage('');
      } else {
        setErrorMessage(data.message || 'Error al enviar el código');
      }
    } catch (error) {
      setErrorMessage('Error al conectar con el servidor');
    }
  };

  const handlePinChange = (index, value) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    
    setErrorMessage('');
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const enteredPin = pin.join('');
    if (enteredPin === resetToken) {
      setStep(3);
      setErrorMessage('');
    } else {
      setErrorMessage('PIN incorrecto. Por favor, intente nuevamente.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/users/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetToken, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setErrorMessage('');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setErrorMessage(data.message || 'Error al restablecer la contraseña');
      }
    } catch (error) {
      setErrorMessage('Error al conectar con el servidor');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <h2 className="text-2xl font-bold mb-14 text-center">
        Reset de contraseña
      </h2>
      {errorMessage && (
        <div className="bg-red-500/20 border-2 border-red-500 text-red-500 px-4 py-2 rounded-lg mb-6">
          {errorMessage}
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleEmailSubmit} className="w-full max-w-md space-y-6">
          <p className="text-center text-secondary mb-10">
          Ingrese su correo electrónico para continuar
          </p>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-[#C93DEC]" />
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#C93DEC] text-white rounded-2xl py-2 px-6 hover:bg-[#a331c4] font-medium mt-5"
            >
              Continuar
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handlePinSubmit} className="w-full max-w-md space-y-6">
          <p className="text-center text-secondary mb-6">
            Digite el PIN de 6 dígitos enviado a su correo electrónico
          </p>
          <div className="flex justify-center gap-2 mb-4">
            {pin.map((digit, index) => (
              <input
                key={index}
                id={`pin-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(index, e.target.value)}
                className="w-12 h-16 text-center text-2xl bg-transparent border-2 border-secondary rounded-lg focus:border-secondary focus:ring-0 text-white"
              />
            ))}
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#C93DEC] text-white rounded-2xl py-2 px-6 hover:bg-[#a331c4] font-medium mt-5"
            >
              Verificar PIN
            </button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordSubmit} className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <label className="block mb-2 text-sm font-medium text-white">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#3A0453] text-white rounded-full px-4 py-2 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? 
                  <Eye className="h-5 w-5 text-[#C93DEC]" /> : 
                  <EyeOff className="h-5 w-5 text-[#C93DEC]" />
                }
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block mb-2 text-sm font-medium text-white">
              Repita contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#3A0453] text-white rounded-full px-4 py-2 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? 
                  <Eye className="h-5 w-5 text-[#C93DEC]" /> : 
                  <EyeOff className="h-5 w-5 text-[#C93DEC]" />
                }
              </button>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="bg-[#C93DEC] text-white rounded-2xl py-2 px-6 hover:bg-[#a331c4] font-medium"
            >
              Restablecer contraseña
            </button>
          </div>
        </form>
      )}
    </div>
  );
}