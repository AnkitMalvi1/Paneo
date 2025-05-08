'use client';
import { useMemo, useEffect, useState } from 'react';

export default function FlightCard({ flightDetails }) {
  const [destination, setDestination] = useState(null);
  const [destinationInfo, setDestinationInfo] = useState({ code: '', city: '' });

  useEffect(() => {
    const tripData = JSON.parse(localStorage.getItem('tripDetails') || '{}');
    setDestination(tripData.destination);
  }, []);

  useEffect(() => {
    const fetchDestinationInfo = async () => {
      if (!destination) return;
      
      try {
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destination)}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const location = data.results[0];
          const city = location.components.city || location.components.town || location.components.state;
          const country = location.components.country;
          
          setDestinationInfo({
            code: destination.slice(0, 3).toUpperCase(),
            city: `${city}, ${country}`
          });
        } else {
          setDestinationInfo({
            code: destination.slice(0, 3).toUpperCase(),
            city: destination.charAt(0).toUpperCase() + destination.slice(1)
          });
        }
      } catch (error) {
        console.error('Error fetching location data:', error);
        setDestinationInfo({
          code: destination.slice(0, 3).toUpperCase(),
          city: destination.charAt(0).toUpperCase() + destination.slice(1)
        });
      }
    };

    fetchDestinationInfo();
  }, [destination]);

  const formattedDateTime = useMemo(() => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  }, []);

  return (
    <div className="bg-blue-600 rounded-2xl p-4 mb-6">
      <div className="mb-2">
        <h3 className="font-semibold">Flight Details</h3>
      </div>
      <p className="text-sm mb-2">{formattedDateTime}</p>
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="font-bold">Current</p>
          <p className="text-xs text-blue-300">Location</p>
        </div>
        <div className="flex-1 h-[2px] bg-blue-400 relative">
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            ✈️
          </div>
        </div>
        <div className="text-center">
          <p className="font-bold">{destinationInfo.code}</p>
          <p className="text-xs text-blue-300">{destinationInfo.city}</p>
        </div>
      </div>
    </div>
  );
}