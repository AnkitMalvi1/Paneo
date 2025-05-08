'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDestinationDetails } from '@/utils/destinationUtils';

export default function Onboarding() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showDurationDropdown, setShowDurationDropdown] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize form data after component mounts
  const [formData, setFormData] = useState({
    destination: '',
    duration: '',
    travelGroup: '',
    startDate: '27.01.2025',
    endDate: '02.02.2025',
    userName: 'Guest',
    flight: {
      departure: {
        code: 'DEL',
        city: 'Delhi, India',
        date: '26.01.2025',
        time: '10:50 am'
      },
      arrival: {
        code: 'NRT',
        city: 'Narita, Tokyo'
      }
    },
    activities: [
      {
        id: 1,
        title: 'Senso-ji Temple & Nakamise Shopping Street',
        time: '8:15 am Morning',
        duration: '3 hours',
        pickupPoint: 'From Hotel',
        image: '/sensoji.jpg',
        date: 27
      },
      {
        id: 2,
        title: 'Tokyo Sky Tree',
        time: '1:00 pm Afternoon',
        duration: '2 hours',
        pickupPoint: 'From Nakamise Street',
        image: '/skytree.jpg',
        date: 27
      },
      {
        id: 3,
        title: 'Kimono Wearing',
        time: 'Anytime before 8:00pm',
        duration: '1 hour',
        pickupPoint: 'From Hotel',
        image: '/kimono.jpg',
        date: 27
      }
    ]
  });

  const handleDestinationChange = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, destination: value }));
    
    if (value.toLowerCase() === 'tokyo') {
      setFormData(prev => ({
        ...prev,
        destination: 'Tokyo',
        image: '/tokyo-tower.jpg',
        activities: [
          {
            id: 1,
            title: 'Senso-ji Temple & Nakamise Shopping Street',
            time: '8:15 am Morning',
            duration: '3 hours',
            pickupPoint: 'From Hotel',
            image: '/sensoji.jpg',
            date: 27
          },
          {
            id: 2,
            title: 'Tokyo Sky Tree',
            time: '1:00 pm Afternoon',
            duration: '2 hours',
            pickupPoint: 'From Nakamise Street',
            image: '/skytree.jpg',
            date: 27
          },
          {
            id: 3,
            title: 'Kimono Wearing',
            time: 'Anytime before 8:00pm',
            duration: '1 hour',
            pickupPoint: 'From Hotel',
            image: '/kimono.jpg',
            date: 27
          }
        ]
      }));
    }
  };

  const handleDurationSelect = (duration) => {
    const [minDays] = duration.split('-').map(d => parseInt(d));
    const startDate = new Date('2025-01-27');
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + minDays);

    setFormData(prev => ({
      ...prev,
      duration,
      startDate: startDate.toLocaleDateString('en-GB').replace(/\//g, '.'),
      endDate: endDate.toLocaleDateString('en-GB').replace(/\//g, '.')
    }));
    setShowDurationDropdown(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.destination || !formData.duration || !formData.travelGroup) {
      alert('Please fill in all fields');
      return;
    }
    
    // Calculate group size based on travelGroup selection
    const groupSizeMap = {
      'solo': '1 (1M)',
      'couple': '2 (1M,1F)',
      'family': '4 (2M,2F)',
      'friends': '4 (2M,2F)'
    };
    
    const tripData = {
      ...formData,
      groupSize: groupSizeMap[formData.travelGroup],
      image: '/tokyo-tower.jpg'
    };

    localStorage.setItem('tripDetails', JSON.stringify(tripData));
    router.push('/dashboard');
  };


  const durations = [
    '2-3 days', '4-7 days', '8-14 days', '15+ days'
  ];

  const travelGroups = [
    { id: 'solo', label: 'Solo', icon: '👤' },
    { id: 'couple', label: 'Couple', icon: '👫' },
    { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
    { id: 'friends', label: 'Friends', icon: '👥' }
  ];

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="max-w-[430px] mx-auto px-5">
        <div className="py-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Plan Your Journey, Your Way!
            </h1>
            <p className="text-gray-400">
              Let's create your personalised travel experience
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Destination Input */}
            <div className="space-y-3">
              <label className="text-lg font-medium block">
                Where would you like to go?
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2">🌎</span>
                <input
                  type="text"
                  placeholder="Enter Destination"
                  value={formData.destination}
                  onChange={handleDestinationChange}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-800 border-transparent focus:border-gray-500 focus:ring-0 text-base"
                />
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-3">
              <label className="text-lg font-medium block">
                How long will you stay?
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                  className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-gray-800 text-left"
                >
                  <span className="text-gray-300 text-base">
                    {formData.duration || 'Select Duration'}
                  </span>
                  <span>⌄</span>
                </button>
                {showDurationDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl overflow-hidden z-10 shadow-lg">
                    {durations.map((duration) => (
                      <button
                        key={duration}
                        type="button"
                        onClick={() => handleDurationSelect(duration)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-700 text-base"
                      >
                        {duration}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Travel Group Selection */}
            <div className="space-y-3">
              <label className="text-lg font-medium block">
                Who are you traveling with?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {travelGroups.map(({ id, label, icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormData({...formData, travelGroup: id})}
                    className={`flex items-center justify-center gap-2 px-4 py-4 rounded-xl transition-colors ${
                      formData.travelGroup === id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="text-base">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors text-base mt-8"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}