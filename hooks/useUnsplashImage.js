'use client';
import { useState, useEffect } from 'react';

export function useUnsplashImage(destination) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!destination) return;
      
      try {
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${destination}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}&orientation=landscape`
        );
        const data = await response.json();
        setImageUrl(data.results[0]?.urls?.regular || '/tokyo-tower.jpg');
      } catch (error) {
        console.error('Error fetching image:', error);
        setImageUrl('/tokyo-tower.jpg');
      }
    };

    fetchImage();
  }, [destination]);

  return imageUrl;
}