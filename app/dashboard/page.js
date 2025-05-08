'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TripCard from '@/components/dashboard/TripCard';
import FlightCard from '@/components/dashboard/FlightCard';
import Activities from '@/components/dashboard/Activities';

export default function Dashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [tripDetails, setTripDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const savedTrip = localStorage.getItem('tripDetails');
    
    if (!savedTrip) {
      // Set default values if no trip details exist
      const defaultTripDetails = {
        destination: 'Tokyo',
        duration: '7-10',
        travelGroup: 'solo',
        startDate: new Date().toLocaleDateString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        userName: 'Guest',
        flight: {
          departure: {
            time: '10:00 AM',
            date: new Date().toLocaleDateString(),
          },
          arrival: {
            time: '8:00 PM',
            date: new Date().toLocaleDateString(),
          }
        }
      };
      localStorage.setItem('tripDetails', JSON.stringify(defaultTripDetails));
      setTripDetails(defaultTripDetails);
    } else {
      setTripDetails(JSON.parse(savedTrip));
    }
    setLoading(false);
  }, []);

  if (!mounted || loading) {
    return <div className="min-h-screen max-w-[430px] mx-auto bg-black text-white flex items-center justify-center">
      Loading...
    </div>;
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="max-w-[430px] mx-auto px-5 pb-24">
        {/* Header */}
        <header className="flex justify-between items-center py-6">
          <div>
            <h1 className="text-2xl font-bold">Hello {tripDetails?.userName || 'Traveler'}!</h1>
            <p className="text-gray-400">Ready for the trip?</p>
          </div>
          <button
            className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center"
          >
            <span className="text-xl">{tripDetails?.userName?.[0] || 'T'}</span>
          </button>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          <TripCard tripDetails={tripDetails} />
          
          <FlightCard 
            flightDetails={{
              ...tripDetails?.flight,
              onViewAll: () => handleNavigation('/flights')
            }} 
          />

          <Activities activities={tripDetails?.activities || []} />
        </main>

        {/* Navigation */}
        <nav className="fixed bottom-0 left-0 right-0">
          <div className="max-w-[430px] mx-auto px-5 pb-6">
            <div className="bg-gray-900 rounded-full p-4 flex justify-around">
              {[
                { icon: '🏠', path: '/dashboard' },
                { icon: '🔍', path: '/search' },
                { icon: '➕', path: '/add' },
                { icon: '❤️', path: '/favorites' },
                { icon: '👤', path: '/profile' }
              ].map((item) => (
                <button
                  key={item.path}
                  // onClick={() => handleNavigation(item.path)}
                  className={`p-2 ${
                    item.path === '/dashboard' ? 'bg-blue-600/20 rounded-full' : ''
                  }`}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}