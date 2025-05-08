'use client';
import { useUnsplashImage } from '@/hooks/useUnsplashImage';
import { useMemo } from 'react';

export default function TripCard({ tripDetails }) {
  const destinationImage = useUnsplashImage(tripDetails?.destination);

  const { formattedStartDate, formattedEndDate } = useMemo(() => {
    if (!tripDetails?.duration) {
      return {
        formattedStartDate: tripDetails?.startDate,
        formattedEndDate: tripDetails?.endDate
      };
    }

    const startDate = new Date();
    const [minDays] = tripDetails.duration.split('-').map(d => parseInt(d));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + minDays);

    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    };

    return {
      formattedStartDate: formatDate(startDate),
      formattedEndDate: formatDate(endDate)
    };
  }, [tripDetails?.duration]);

  return (
    <div className="relative rounded-3xl overflow-hidden mb-6">
      <img 
        src={destinationImage || "/tokyo-tower.jpg"}
        alt={tripDetails?.destination}
        className="w-full h-48 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6">
        <div className="absolute bottom-6">
          <h2 className="text-4xl font-bold mb-2">{tripDetails?.destination}</h2>
          <p className="text-sm mb-4">
            {formattedStartDate} - {formattedEndDate}
          </p>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-black/30 rounded-full">⏱️</span>
              <div>
                <p className="font-bold">{tripDetails.duration || '8 Days'}</p>
                <p className="text-xs text-gray-300">Duration</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-black/30 rounded-full">👥</span>
              <div>
                <p className="font-bold">{tripDetails.groupSize || '4 (2M,2F)'}</p>
                <p className="text-xs text-gray-300">Group Size</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-black/30 rounded-full">📍</span>
              <div>
                <p className="font-bold">{tripDetails.activities?.length || '14'}</p>
                <p className="text-xs text-gray-300">Activities</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}