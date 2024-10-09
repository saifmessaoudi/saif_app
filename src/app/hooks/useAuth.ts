import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import {jwtDecode }from 'jwt-decode';

interface DecodedToken {
  exp: number;
}

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
   
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          router.push('/');
        }
      } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('token');
        router.push('/');
      }
    
  }, [router]);
};

export default useAuth;

