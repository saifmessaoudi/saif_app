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
  if (!user) return <div>Loading...</div>;

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveClick = async () => {
    if (!user) return;

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

  return (
    <div className="h-full ">
            <ToastContainer />
      <div className="border-b-2 block md:flex">
        <div className="w-full md:w-2/5 p-4 sm:p-6 lg:p-8 bg-white shadow-md">
          <div className="flex justify-between">
            <span className="text-xl font-semibold block">Your Profile {user?.nom}</span>
            <button 
              onClick={handleEditClick} 
              className="-mt-2 text-md font-bold text-white bg-green-700 rounded-full px-5 py-2 hover:bg-gray-800"
            >
              {isEditing ? 'Cancel' : 'Edit'}
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
                disabled={!isEditing} 
              />
            </div>
            
            <div className="pb-4">
              <label htmlFor="dateDeNaissance" className="font-semibold text-gray-700 block pb-1">Date de naissance</label>
              <input 
                id="dateDeNaissance" 
                className="border-1 rounded-r px-4 py-2 w-full" 
                type="date"
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
