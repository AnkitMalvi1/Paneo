'use client';
import { useState, useEffect } from 'react';

export default function Activities({ activities }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dates, setDates] = useState([]);
  const [destination, setDestination] = useState(null);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tripData = JSON.parse(localStorage.getItem('tripDetails') || '{}');
    setDestination(tripData.destination);
  }, []);

  // Update loadActivities function
  const loadActivities = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching activities for:', destination); // Add this debug log
      const allActivities = await fetchDestinationActivities(destination);
      console.log('Fetched activities:', allActivities); // Add this debug log

      // If no activities found, use fallback
      if (!allActivities || allActivities.length === 0) {
        setFilteredActivities([
          {
            id: `fallback-${selectedDate}-1`,
            title: 'City Exploration',
            category: 'SIGHTSEEING',
            time: '10:00 AM',
            duration: '2 hours',
            pickupPoint: 'Hotel Lobby',
            image: '/fallback-image.jpg'
          },
          {
            id: `fallback-${selectedDate}-2`,
            title: 'Local Experience',
            category: 'CULTURE',
            time: '2:00 PM',
            duration: '3 hours',
            pickupPoint: 'City Center',
            image: '/fallback-image.jpg'
          },
          {
            id: `fallback-${selectedDate}-3`,
            title: 'Evening Activity',
            category: 'ENTERTAINMENT',
            time: '7:00 PM',
            duration: '2 hours',
            pickupPoint: 'Hotel Lobby',
            image: '/fallback-image.jpg'
          }
        ]);
        return;
      }

      // Create a weekly schedule by rotating through all activities
      const activitiesPerDay = 3;
      const dayIndex = dates.findIndex(d => d.date === selectedDate);
      const startIndex = (dayIndex * activitiesPerDay) % allActivities.length;
      
      const dayActivities = Array.from({ length: activitiesPerDay }, (_, i) => {
        const index = (startIndex + i) % allActivities.length;
        return allActivities[index];
      });

      console.log('Setting filtered activities:', dayActivities); // Add this debug log
      setFilteredActivities(dayActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      // Fallback activities remain the same...
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Generate dates for the next 7 days
    const generateDates = () => {
      const startDate = new Date();
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return {
          day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
          date: date.getDate(),
          month: date.getMonth() + 1,
          fullDate: date
        };
      });
    };
    const newDates = generateDates();
    setDates(newDates);
    setSelectedDate(newDates[0]?.date);
  }, []);

  // Sample activities data based on destination and date
  const destinationActivities = {
    tokyo: {
      monday: [
        { id: 1, title: 'Tokyo Tower Visit', time: '10:00 AM', duration: '2 hours', pickupPoint: 'Hotel Lobby', image: '/tokyo-tower.jpg' },
        { id: 2, title: 'Sushi Making Class', time: '2:00 PM', duration: '3 hours', pickupPoint: 'Tsukiji Market', image: '/sushi.jpg' }
      ],
      tuesday: [
        { id: 3, title: 'Mt. Fuji Tour', time: '8:00 AM', duration: 'Full Day', pickupPoint: 'Hotel Lobby', image: '/mt-fuji.jpg' }
      ],
      // Add more days...
    },
    london: {
      monday: [
        { id: 1, title: 'Big Ben Tour', time: '9:00 AM', duration: '1.5 hours', pickupPoint: 'Westminster Station', image: '/big-ben.jpg' },
        { id: 2, title: 'Thames River Cruise', time: '2:00 PM', duration: '2 hours', pickupPoint: 'London Eye Pier', image: '/thames.jpg' }
      ],
      // Add more days...
    },
    // Add more destinations...
  };

  // Updated destination activities with dynamic data
  // Add this new function at the top level
  // Replace fetchTripAdvisorActivities with fetchGooglePlacesActivities
  const fetchGooglePlacesActivities = async (destination) => {
    try {
      // First, get coordinates using geocoding
      const geocodeUrl = `https://google-map-places.p.rapidapi.com/maps/api/geocode/json?address=${encodeURIComponent(destination)}&language=en`;
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-key': '18928fddc7msh24b984ecd0e6ef1p1ac2b9jsnd5361f0e1cdb',
          'x-rapidapi-host': 'google-map-places.p.rapidapi.com'
        }
      };

      const geocodeResponse = await fetch(geocodeUrl, options);
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.results?.[0]?.geometry?.location) {
        console.log('Could not find coordinates for:', destination);
        return [];
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;
      const location = `${lat},${lng}`;

      // Then fetch places using the obtained coordinates
      const placesUrl = `https://google-map-places.p.rapidapi.com/maps/api/place/textsearch/json?query=tourist+attractions+in+${encodeURIComponent(destination)}&location=${location}&radius=5000&language=en`;

      const placesResponse = await fetch(placesUrl, options);
      const data = await placesResponse.json();

      if (!data.results || data.results.length === 0) {
        console.log('No results found for:', destination);
        return [];
      }

      return data.results
        .filter(place => place.business_status === "OPERATIONAL" || !place.business_status)
        .map(place => ({
          id: place.place_id || Math.random().toString(36).substr(2, 9),
          title: place.name,
          category: (place.types?.[0] || 'tourist_attraction').replace(/_/g, ' ').toUpperCase(),
          time: '9:00 AM',
          duration: `${Math.floor(Math.random() * 3 + 1)} hours`,
          pickupPoint: place.formatted_address || 'Meeting Point',
          image: place.photos?.[0]?.photo_reference 
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=18928fddc7msh24b984ecd0e6ef1p1ac2b9jsnd5361f0e1cdb`
            : '/fallback-image.jpg',
          rating: place.rating || 4.0,
          reviews: place.user_ratings_total || 0
        }))
        .sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } catch (error) {
      console.error('Error fetching Google Places data:', error);
      return [];
    }
  };
  
  // Update fetchDestinationActivities
  const fetchDestinationActivities = async (destination) => {
    try {
      const googlePlacesActivities = await fetchGooglePlacesActivities(destination);
      
      if (googlePlacesActivities.length > 0) {
        return googlePlacesActivities;
      }
  
      // Fallback to existing static data if TripAdvisor fails
      const activities = {
        tokyo: {
          activities: [
            { title: 'Sensoji Temple Visit', category: 'Cultural' },
            { title: 'Tsukiji Fish Market Tour', category: 'Food' },
            { title: 'Tokyo Tower Experience', category: 'Landmark' },
            { title: 'Shibuya Crossing Walk', category: 'Urban' },
            { title: 'Meiji Shrine Tour', category: 'Cultural' },
            { title: 'Akihabara Electronics Tour', category: 'Shopping' },
            { title: 'Shinjuku Garden Visit', category: 'Nature' },
            { title: 'Robot Restaurant Show', category: 'Entertainment' },
            { title: 'Sumo Wrestling Match', category: 'Sports' }
          ]
        },
        london: {
          activities: [
            { title: 'Big Ben Tour', category: 'Landmark' },
            { title: 'British Museum Visit', category: 'Cultural' },
            { title: 'London Eye Experience', category: 'Entertainment' },
            { title: 'Tower Bridge Walk', category: 'Urban' },
            { title: 'Hyde Park Picnic', category: 'Nature' },
            { title: 'West End Show', category: 'Entertainment' },
            { title: 'Camden Market Tour', category: 'Shopping' },
            { title: 'Thames River Cruise', category: 'Urban' },
            { title: 'Buckingham Palace Visit', category: 'Landmark' }
          ]
        }
      };
  
      // Get images for activities using Unsplash
      const destinationData = activities[destination.toLowerCase()];
      if (!destinationData) return [];
  
      const enrichedActivities = await Promise.all(
        destinationData.activities.map(async (activity) => {
          try {
            const response = await fetch(
              `https://api.unsplash.com/search/photos?query=${activity.title}&client_id=${process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY}&per_page=1`
            );
            const data = await response.json();
            const image = data.results[0]?.urls?.regular || '/fallback-image.jpg';
            
            return {
              id: Math.random().toString(36).substr(2, 9),
              title: activity.title,
              time: `${Math.floor(Math.random() * 12 + 8)}:00 ${Math.random() < 0.5 ? 'AM' : 'PM'}`,
              duration: `${Math.floor(Math.random() * 3 + 1)} hours`,
              pickupPoint: 'Hotel Lobby',
              image
            };
          } catch (error) {
            console.error('Error fetching image:', error);
            return null;
          }
        })
      );
  
      return enrichedActivities.filter(Boolean);
    } catch (error) {
      console.error('Error in fetchDestinationActivities:', error);
      return [];
    }
  }; // Added missing closing brace and semicolon
  
  useEffect(() => {
    if (!selectedDate || !destination) return;
  
    const selectedDay = dates.find(d => d.date === selectedDate);
    if (!selectedDay) return;
  
    const loadActivities = async () => {
      try {
        setIsLoading(true);
        const allActivities = await fetchDestinationActivities(destination);
        
        // Create a weekly schedule by rotating through all activities
        const totalDays = 7;
        const activitiesPerDay = 3;
        const dayIndex = dates.findIndex(d => d.date === selectedDate);
        
        // Calculate starting position for this day's activities
        const startIndex = (dayIndex * activitiesPerDay) % allActivities.length;
        
        // Get activities for this day, wrapping around if needed
        const dayActivities = Array.from({ length: activitiesPerDay }, (_, i) => {
          const index = (startIndex + i) % allActivities.length;
          return allActivities[index];
        });
        
        setFilteredActivities(dayActivities);
      } catch (error) {
        console.error('Error loading activities:', error);
        // Provide fallback activities if fetch fails
        setFilteredActivities([
          {
            id: `fallback-${selectedDate}-1`,
            title: 'City Exploration',
            time: '10:00 AM',
            duration: '2 hours',
            pickupPoint: 'Hotel Lobby',
            image: '/fallback-image.jpg'
          },
          {
            id: `fallback-${selectedDate}-2`,
            title: 'Local Experience',
            time: '2:00 PM',
            duration: '3 hours',
            pickupPoint: 'City Center',
            image: '/fallback-image.jpg'
          },
          {
            id: `fallback-${selectedDate}-3`,
            title: 'Evening Activity',
            time: '7:00 PM',
            duration: '2 hours',
            pickupPoint: 'Hotel Lobby',
            image: '/fallback-image.jpg'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadActivities();
  }, [selectedDate, destination, dates]);

  return (
    <div className="w-full max-w-md">
      {/* Calendar Strip */}
      <div className="bg-gray-900 rounded-xl p-4 mb-4">
        <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar">
          {dates.map((day, i) => (
            <button
              key={i}
              onClick={() => setSelectedDate(day.date)}
              className={`flex-shrink-0 w-12 h-16 rounded-xl ${
                selectedDate === day.date ? 'bg-green-500' : 'bg-gray-800'
              } flex flex-col items-center justify-center transition-colors`}
            >
              <span className="text-xs">{day.day}</span>
              <span className="text-lg font-bold">{day.date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Activity Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-4">Loading activities...</div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-4">No activities found for this day</div>
        ) : (
          filteredActivities.map((activity) => (
            <div 
              key={activity?.id || Math.random()}
              className="bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex gap-3">
                <img 
                  src={activity?.image || "/window.svg"}
                  alt={''}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold">{activity?.title || 'Unknown Activity'}</h4>
                    {activity?.rating && (
                      <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg">
                        <span>⭐</span>
                        <span className="text-green-500">{activity.rating}</span>
                        {activity.reviews && (
                          <span className="text-xs text-gray-400">({activity.reviews})</span>
                        )}
                      </div>
                    )}
                  </div>
                  {activity?.category && (
                    <span className="inline-block bg-blue-500/10 text-blue-400 text-xs px-2 py-1 rounded-lg mt-1">
                      {activity.category}
                    </span>
                  )}
                  <div className="mt-2 space-y-1 text-sm text-gray-400">
                    <p className="flex items-center gap-2">
                      <span>⏰</span>
                      <span>{activity?.time || 'Time not specified'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>⌛</span>
                      <span>{activity?.duration || 'Duration not specified'}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span>📍</span>
                      <span>{activity?.pickupPoint || 'Pickup point not specified'}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}