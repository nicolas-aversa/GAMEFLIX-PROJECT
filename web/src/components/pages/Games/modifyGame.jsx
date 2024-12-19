import React, { useState } from 'react';
import { storage } from '../../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ModifyGame({ games, onSuccess, onError }) {
  const [editingGameId, setEditingGameId] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    os: '',
    language: '',
    playersQty: '',
    minimumRequirements: {
      cpu: '',
      memory: '',
      gpu: ''
    },
    recommendedRequirements: {
      cpu: '',
      memory: '',
      gpu: ''
    },
    status: '',
    imageUrl: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('minimumRequirements') || name.includes('recommendedRequirements')) {
      const [type, key] = name.split('.');
      setFormData(prevData => ({
        ...prevData,
        [type]: {
          ...prevData[type],
          [key]: value
        }
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const storageRef = ref(storage, `imageUrl/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setFormData(prevData => ({ ...prevData, imageUrl: downloadURL }));
    }
  };

  const handleEditClick = (game) => {
    if (editingGameId === game._id) {
      setEditingGameId('');
      setFormData({
        title: '',
        description: '',
        category: '',
        price: '',
        os: '',
        language: '',
        playersQty: '',
        minimumRequirements: {
          cpu: '',
          memory: '',
          gpu: ''
        },
        recommendedRequirements: {
          cpu: '',
          memory: '',
          gpu: ''
        },
        status: '',
        imageUrl: ''
      });
    } else {
      setEditingGameId(game._id);
      setFormData({
        title: game.title,
        description: game.description,
        category: game.category,
        price: game.price,
        os: game.os,
        language: game.language,
        playersQty: game.playersQty,
        minimumRequirements: game.minimumRequirements,
        recommendedRequirements: game.recommendedRequirements,
        status: game.status,
        imageUrl: game.imageUrl
      });
    }
  };

  const handleModify = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/games/${editingGameId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Error en la solicitud';

        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = await response.text();
        }

        throw new Error(errorMessage);
      }

      await response.json();
        onSuccess('Juego modificado exitosamente');
        setTimeout(() => {
          onSuccess('');
        }, 5000);
        setEditingGameId('');
    } catch (error) {
      console.error('Error al modificar el juego:', error);
      onError(`Hubo un error al modificar el juego: ${error.message}`);
    }
  };

  return (
    <div>
      <ul>
        {games.map((game) => (
          <li key={game._id} className="mb-4">
            <div className="flex justify-between items-center bg-gradient-to-r from-purple-900 to-purple-1000 px-8 py-2 rounded-full transition-all duration-300 ease-out p-6 rounded-lg shadow-lg">
              <div className="flex items-center space-x-4">
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="w-28 h-36 object-cover rounded-lg hover:scale-95 transition-transform duration-200"
                />
                <div>
                  <h4 className="text-lg">{game.title}</h4>
                  <div className="text-xs text-gray-400">
                    <span>{game.category} - </span>
                    <span className="text-[#C93DEC]">${game.price}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="bg-blue-600 text-white rounded-2xl py-1.5 px-3 hover:bg-blue-800 font-medium shadow-lg hover:scale-105 transition-transform duration-200"
                onClick={() => handleEditClick(game)}
              >
                {editingGameId === game._id ? 'Cerrar' : 'Modificar'}
              </button>
            </div>
            {editingGameId === game._id && (
              <form onSubmit={handleModify} className="mt-4 w-full">
                <div className="flex justify-between">
                  <div className="w-1/2 pr-4">
                    <div className="mb-4">
                      <label htmlFor="title" className="block mb-2 text-sm font-medium">Título</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        tabIndex={1}
                        className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="category" className="block mb-2 text-sm font-medium">Categoría</label>
                      <div className="relative">
                        <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          tabIndex={2}
                          className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10 appearance-none"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <option value="">Categoría</option>
                          <option value="Aventura">Aventura</option>
                          <option value="Acción">Acción</option>
                          <option value="RPG">RPG</option>
                          <option value="MOBA">MOBA</option>
                          <option value="Deportes">Deportes</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-3 h-3 ml-0.5 text-[#C93DEC]" fill="none" stroke="currentColor" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 flex space-x-4">
                      <div className="w-1/2">
                        <label htmlFor="playersQty" className="block mb-2 text-sm font-medium">Jugadores</label>
                        <div className="relative">
                          <select
                            id="playersQty"
                            name="playersQty"
                            value={formData.playersQty}
                            onChange={handleChange}
                            tabIndex={3}
                            className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10 appearance-none"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            <option value="">Cantidad de jugadores</option>
                            <option value="Single-player">Single-player</option>
                            <option value="Multi-player">Multi-player</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-3 h-3 ml-0.5 text-[#C93DEC]" fill="none" stroke="currentColor" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2">
                        <label htmlFor="language" className="block mb-2 text-sm font-medium">Idioma</label>
                        <div className="relative">
                          <select
                            id="language"
                            name="language"
                            value={formData.language}
                            onChange={handleChange}
                            tabIndex={4}
                            className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10 appearance-none"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            <option value="">Idioma</option>
                            <option value="Español">Español</option>
                            <option value="Inglés">Inglés</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-3 h-3 ml-0.5 text-[#C93DEC]" fill="none" stroke="currentColor" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 flex space-x-4">
                      <div className="w-1/2">
                        <label htmlFor="os" className="block mb-2 text-sm font-medium">SO</label>
                        <div className="relative">
                          <select
                            id="os"
                            name="os"
                            value={formData.os}
                            onChange={handleChange}
                            tabIndex={5}
                            className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10 appearance-none"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            <option value="">Sistema Operativo</option>
                            <option value="Windows">Windows</option>
                            <option value="Mac">Mac</option>
                            <option value="Linux">Linux</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-3 h-3 ml-0.5 text-[#C93DEC]" fill="none" stroke="currentColor" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="w-1/2">
                        <label htmlFor="status" className="block mb-2 text-sm font-medium">Status</label>
                        <div className="relative">
                          <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            tabIndex={6}
                            className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10 appearance-none"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            <option value="">Status</option>
                            <option value="Publicado">Publicado</option>
                            <option value="Despublicado">Despublicado</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg className="w-3 h-3 ml-0.5 text-[#C93DEC]" fill="none" stroke="currentColor" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="imageUrl" className="block mb-2 text-sm font-medium">Portada</label>
                      <input
                        type="file"
                        id="imageUrl"
                        name="imageUrl"
                        onChange={handleFileChange}
                        tabIndex={7}
                        accept="image/*"
                        className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full text-sm file:mr-4 file:py-2 file:px-3 file:rounded-2xl file:border-0 file:text-sm file:bg-[#C93DEC] file:text-white hover:file:bg-[#a331c4] file:font-['Inter'] file:h-full"
                      />
                    </div>
                  </div>
                  
                  <div className="w-1/2 pl-4 flex flex-col justify-between">
                    <div className="mt-2.5">
                      <div className="mb-5">
                        <label htmlFor="description" className="block mb-2 text-sm font-medium">Descripción</label>
                        <textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          tabIndex={8}
                          className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-lg px-4 py-2 text-sm min-h-[100px]"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Requisitos Mínimos</label>
                        <div className="flex space-x-4">
                          <input
                            type="text"
                            id="minimumRequirements.cpu"
                            name="minimumRequirements.cpu"
                            placeholder="CPU"
                            value={formData.minimumRequirements.cpu}
                            onChange={handleChange}
                            tabIndex={9}
                            className="w-1/3 bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10"
                          />
                          <input
                            type="text"
                            id="minimumRequirements.memory"
                            name="minimumRequirements.memory"
                            placeholder="Memoria"
                            value={formData.minimumRequirements.memory}
                            onChange={handleChange}
                            tabIndex={10}
                            className="w-1/3 bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10"
                          />
                          <input
                            type="text"
                            id="minimumRequirements.gpu"
                            name="minimumRequirements.gpu"
                            placeholder="GPU"
                            value={formData.minimumRequirements.gpu}
                            onChange={handleChange}
                            tabIndex={11}
                            className="w-1/3 bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Requisitos Recomendados</label>
                        <div className="flex space-x-4">
                          <input
                            type="text"
                            id="recommendedRequirements.cpu"
                            name="recommendedRequirements.cpu"
                            placeholder="CPU"
                            value={formData.recommendedRequirements.cpu}
                            onChange={handleChange}
                            tabIndex={12}
                            className="w-1/3 bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10"
                          />
                          <input
                            type="text"
                            id="recommendedRequirements.memory"
                            name="recommendedRequirements.memory"
                            placeholder="Memoria"
                            value={formData.recommendedRequirements.memory}
                            onChange={handleChange}
                            tabIndex={13}
                            className="w-1/3 bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10"
                          />
                          <input
                            type="text"
                            id="recommendedRequirements.gpu"
                            name="recommendedRequirements.gpu"
                            placeholder="GPU"
                            value={formData.recommendedRequirements.gpu}
                            onChange={handleChange}
                            tabIndex={14}
                            className="w-1/3 bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="price" className="block mb-2 text-sm font-medium">Precio</label>
                        <input
                          type="text"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          tabIndex={15}
                          className="w-full bg-[#3A0453] text-[#B1AEAE] rounded-full px-4 py-2 text-sm pr-10"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 mb-14">
                      <button
                        type="submit"
                        tabIndex={16}
                        className="bg-[#C93DEC] text-white rounded-2xl py-2 px-6 hover:bg-[#a331c4] font-medium"
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}