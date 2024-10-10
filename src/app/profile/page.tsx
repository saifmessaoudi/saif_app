'use client'

import React from 'react';
import useAuth from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { IUser } from '@/app/models/user'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile: React.FC = () => {
  useAuth(); 
  const [user, setUser] = useState<IUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false); 
  const [isSaving, setIsSaving] = useState<boolean>(false); 
  const [addressError, setAddressError] = useState<string | null>(null); 

  
  
  const [formData, setFormData] = useState<Partial<IUser>>({}); 

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return; 

      try {
        const response = await fetch(`/api/user`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData: IUser = await response.json();
        setUser(userData);
        setFormData({
          nom: userData.nom,
          prenom: userData.prenom,
          adresse: userData.adresse,
          numeroDeTelephone: userData.numeroDeTelephone,
          dateDeNaissance: userData.dateDeNaissance,
        }); 
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      }
    };

    fetchUserData();
  }, []);

  if (error) return <div>{error}</div>;
  
  if (!user) return (
    <div 
      aria-label="Loading..." 
      role="status" 
      className="flex items-center justify-center h-screen"
    >
      <svg className="h-12 w-12 animate-spin stroke-gray-500" viewBox="0 0 256 256">
        <line x1="128" y1="32" x2="128" y2="64" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
        <line x1="195.9" y1="60.1" x2="173.3" y2="82.7" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
        <line x1="224" y1="128" x2="192" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
        <line x1="195.9" y1="195.9" x2="173.3" y2="173.3" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
        <line x1="128" y1="224" x2="128" y2="192" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
        <line x1="60.1" y1="195.9" x2="82.7" y2="173.3" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
        <line x1="32" y1="128" x2="64" y2="128" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
        <line x1="60.1" y1="60.1" x2="82.7" y2="82.7" stroke-linecap="round" stroke-linejoin="round" stroke-width="24"></line>
      </svg>
    </div>
  );

  const validateAddress = async (address: string) => {
    const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(address)}&limit=1`);
    const data = await response.json();
    
    // If no features are returned, address is not valid
    if (!data.features.length) {
      setAddressError('Invalid address.');
      return false;
    }

    // Check if the address is within 50km of Paris (48.8566, 2.3522)
    const parisCoords = { lat: 48.8566, lon: 2.3522 };
    const addressCoords = data.features[0].geometry.coordinates;

    const distance = getDistance(parisCoords.lat, parisCoords.lon, addressCoords[1], addressCoords[0]);
    if (distance > 50000) { 
      setAddressError('The address must be within 50 km of Paris.');
      return false;
    }

    setAddressError(null); 
    return true;
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180; // φ in radians
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; 
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveClick = async () => {
    if (!user) return;

     const isAddressValid = await validateAddress(formData.adresse || '');
      if (!isAddressValid) {
        setAddressError("L'adresse de l'utilisateur doit être située à moins de 50 km de Paris");
        return;
      }

    setIsSaving(true); 

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`/api/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData), 
      });

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setIsEditing(false); 

      toast.success('Profile updated successfully!');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsSaving(false); 
    }
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    window.location.href = '/'; 
  };

  return (
    <div className="h-full ">
            <ToastContainer />
      <div className="border-b-2 block md:flex">
        <div className="w-full md:w-2/5 p-4 sm:p-6 lg:p-8 bg-white shadow-md">
          <div className="flex ">
            <span className="text-xl font-semibold block">Your Profile {user?.nom}</span>
            <button 
              onClick={handleEditClick} 
              className="-mt-2 text-md ml-44 font-bold text-white bg-green-700 rounded-full px-5 py-2 hover:bg-gray-800"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>

            <button 
              onClick={handleLogoutClick} 
              className="-mt-2 text-md font-bold text-white bg-red-700 rounded-full px-5 py-2 hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
          <span className="text-gray-600 pt-4 block opacity-70">Email : {user?.email}</span>
          <div className="w-full p-8 mx-2 flex justify-center">
            <img id="showImage" className="max-w-xs w-32 items-center border" src="https://mir-s3-cdn-cf.behance.net/user/276/180d9c144450013.5cde903578dd7.jpg" alt=""/>                          
          </div>
        </div>
        
        <div className="w-full md:w-3/5 p-8 bg-white lg:ml-4 shadow-md">
          <div className="rounded shadow p-6">
            <div className="pb-6">
              <label htmlFor="nom" className="font-semibold text-gray-700 block pb-1">Nom</label>
              <div className="flex">
                <input 
                  id="nom" 
                  className="border-1 rounded-r px-4 py-2 w-full" 
                  type="text" 
                  value={formData.nom || ''} 
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  disabled={!isEditing} 
                />
              </div>
              <label htmlFor="prenom" className="font-semibold text-gray-700 block pb-1">Prenom</label>
              <div className="flex">
                <input  
                  id="prenom" 
                  className="border-1 rounded-r px-4 py-2 w-full" 
                  type="text" 
                  value={formData.prenom || ''} 
                  onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                  disabled={!isEditing} 
                />
              </div>
            </div>

            <div className="pb-4">
              <label htmlFor="adresse" className="font-semibold text-gray-700 block pb-1">Adresse</label>
              <input 
                id="adresse" 
                className="border-1 rounded-r px-4 py-2 w-full" 
                type="text"
                value={formData.adresse || ''} 
                onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                disabled={!isEditing} /> 
                {addressError && <span className="text-red-500">{addressError}</span>}
            </div>
            
            <div className="pb-4">
              <label  className="font-semibold text-gray-700 block pb-1">Date de naissance</label>
              <input 
                className="edit-date-input border-1 rounded-r px-4 py-2 w-full" 
                type="date"
                name = "dateDeNaissance"
                value={formData.dateDeNaissance ? new Date(formData.dateDeNaissance).toISOString().split('T')[0] : ''} 
                onChange={(e) => setFormData({...formData, dateDeNaissance: e.target.value as unknown as Date})} 
                disabled={!isEditing} 
              />
            </div>

            <div className="pb-4">
              <label htmlFor="numeroDeTelephone" className="font-semibold text-gray-700 block pb-1">Numéro de téléphone</label>
              <input 
                id="numeroDeTelephone" 
                className="border-1 rounded-r px-4 py-2 w-full" 
                type="text" 
                value={formData.numeroDeTelephone || ''} 
                onChange={(e) => setFormData({...formData, numeroDeTelephone: e.target.value})}
                disabled={!isEditing} 
              />
            </div>

            {isEditing && (
              <div className="flex justify-start">
                <button
                  className="bg-green-700 text-white px-4 py-2 rounded-md"
                  onClick={handleSaveClick}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'} 
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
