'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IUser } from "../models/user";

export default function Home() {
    const router = useRouter();
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push('/profile');
        }
    }, [router]);

    const [formData, setFormData] = useState<Partial<IUser>>({}); 

    const [message, setMessage] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addressError, setAddressError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

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


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(false);
        setMessage("");
        
     const isAddressValid = await validateAddress(formData.adresse || '');
     


     if (!isAddressValid) {
       setAddressError("L'adresse de l'utilisateur doit être située à moins de 50 km de Paris");
       setLoading(false);
       return;
     }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message);
                setError(false);
                // Optionally, redirect to login or profile page
                router.push('/profile');
            } else {
                setMessage(data.message);
                setError(true);
            }
        } catch (error) {
            console.error('An unexpected error occurred:', error);
            setMessage("An error occurred. Please try again.");
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-black text-white flex min-h-screen flex-col items-center pt-16 sm:justify-center sm:pt-0">
            <div className="font-semibold text-2xl tracking-tighter mx-auto flex items-center gap-2">
                <div>Welcome Back!</div>
            </div>
            <div className="relative mt-12 w-full max-w-lg sm:mt-10">
                <div className="relative -mb-px h-px w-full bg-gradient-to-r from-transparent via-sky-300 to-transparent"></div>
                <div className="mx-5 border dark:border-b-white/50 dark:border-t-white/50 border-b-white/20 sm:border-t-white/20 shadow-[20px_0_20px_20px] shadow-slate-500/10 dark:shadow-white/20 rounded-lg border-white/20 border-l-white/20 border-r-white/20 sm:shadow-sm lg:rounded-xl lg:shadow-none">
                    <div className="flex flex-col p-6">
                        <h3 className="text-xl font-semibold leading-6 tracking-tighter">Registration</h3>
                        <p className="mt-1.5 text-sm font-medium text-white/50">
                            Ready to get started? Please Register
                        </p>
                    </div>
                    <div className="p-6 pt-0">
                        <form onSubmit={handleSubmit}>
                            <div className="mt-4">
                                <div className={`group relative rounded-lg border ${error ? "border-red-500" : "focus-within:border-sky-200"} px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30`}>
                                    <div className="flex justify-between">
                                        <label className={`text-xs font-medium ${error ? "text-red-500" : "text-muted-foreground group-focus-within:text-white text-gray-400"}`}>
                                            Nom
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom || ""}
                                        onChange={handleChange}
                                        required
                                        className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 ${error ? "border-red-500" : ""}`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className={`group relative rounded-lg border ${error ? "border-red-500" : "focus-within:border-sky-200"} px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30`}>
                                    <div className="flex justify-between">
                                        <label className={`text-xs font-medium ${error ? "text-red-500" : "text-muted-foreground group-focus-within:text-white text-gray-400"}`}>
                                            Prenom
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        name="prenom"
                                        value={formData.prenom || ""}
                                        onChange={handleChange}
                                        required
                                        className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 ${error ? "border-red-500" : ""}`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className={`group relative rounded-lg border ${error ? "border-red-500" : "focus-within:border-sky-200"} px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30`}>
                                    <div className="flex justify-between">
                                        <label className={`text-xs font-medium ${error ? "text-red-500" : "text-muted-foreground group-focus-within:text-white text-gray-400"}`}>
                                            Email
                                        </label>
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email || ""}
                                        onChange={handleChange}
                                        required
                                        className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 ${error ? "border-red-500" : ""}`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className={`group relative rounded-lg border ${error ? "border-red-500" : "focus-within:border-sky-200"} px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30`}>
                                    <div className="flex justify-between">
                                        <label className={`text-xs font-medium ${error ? "text-red-500" : "text-muted-foreground group-focus-within:text-white text-gray-400"}`}>
                                            Password
                                        </label>
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password || ""}
                                        onChange={handleChange}
                                        required
                                        className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 ${error ? "border-red-500" : ""}`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className={`group relative rounded-lg border ${error ? "border-red-500" : "focus-within:border-sky-200"} px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30`}>
                                    <div className="flex justify-between">
                                        <label className={`text-xs font-medium ${error ? "text-red-500" : "text-muted-foreground group-focus-within:text-white text-gray-400"}`}>
                                            Date de naissance
                                        </label>
                                    </div>
                                    <input
                                        type="date"
                                        name="dateDeNaissance"
                                        value={formData.dateDeNaissance ? new Date(formData.dateDeNaissance).toISOString().split('T')[0] : ''} 
                                        onChange={handleChange}
                                        required
                                        className={`signup-date-input block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 ${error ? "border-red-500" : ""}`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className={`group relative rounded-lg border ${error ? "border-red-500" : "focus-within:border-sky-200"} px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30`}>
                                    <div className="flex justify-between">
                                        <label className={`text-xs font-medium ${error ? "text-red-500" : "text-muted-foreground group-focus-within:text-white text-gray-400"}`}>
                                            Numéro de téléphone
                                        </label>
                                    </div>
                                    <input
                                        type="number"
                                        name="numeroDeTelephone"
                                        value={formData.numeroDeTelephone || ""}
                                        onChange={handleChange}
                                        required
                                        className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 ${error ? "border-red-500" : ""}`}
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className={`group relative rounded-lg border ${error ? "border-red-500" : "focus-within:border-sky-200"} px-3 pb-1.5 pt-2.5 duration-200 focus-within:ring focus-within:ring-sky-300/30`}>
                                    <div className="flex justify-between">
                                        <label className={`text-xs font-medium ${error ? "text-red-500" : "text-muted-foreground group-focus-within:text-white text-gray-400"}`}>
                                            Adresse
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        name="adresse"
                                        value={formData.adresse || ""}
                                        onChange={handleChange}
                                        required
                                        className={`block w-full border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground/90 focus:outline-none focus:ring-0 sm:leading-7 ${error ? "border-red-500" : ""}`}
                                    />
                                {addressError && <span className="text-red-500">{addressError}</span>}

                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-end gap-x-2">
                                <a className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:ring hover:ring-white h-10 px-4 py-2 duration-200" href="/">
                                    Login
                                </a>
                                <button className="font-semibold hover:bg-black hover:text-white hover:ring hover:ring-white transition duration-300 inline-flex items-center justify-center rounded-md text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-black h-10 px-4 py-2" type="submit" disabled={loading}>
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.5v2m0 11v2m7.09-12.09l-1.414 1.414M4.5 12H7m10.09 7.09l1.414-1.414M4.5 12H7m2.09-7.09L7.09 6.5m7.5 10.09l-1.414-1.414" />
                                        </svg>
                                    ) : (
                                        "Register"
                                    )}
                                </button>
                            </div>
                        </form>
                        {message && (
                            <p className={`mt-4 text-center ${error ? "text-red-500" : "text-green-500"}`}>
                                {message}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}