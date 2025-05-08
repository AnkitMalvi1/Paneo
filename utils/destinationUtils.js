export async function getDestinationDetails(destination) {
  const UNSPLASH_ACCESS_KEY = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
  
  try {
    // Get destination image
    const imageResponse = await fetch(
      `https://api.unsplash.com/search/photos?query=${destination}&client_id=${UNSPLASH_ACCESS_KEY}`
    );
    const imageData = await imageResponse.json();
    const destinationImage = imageData.results[0]?.urls?.regular;

    // Mock API for destination activities (replace with real API)
    const activities = await getDestinationActivities(destination);

    return {
      image: destinationImage,
      activities,
      location: {
        city: destination,
        country: await getCountryFromCity(destination)
      }
    };
  } catch (error) {
    console.error('Error fetching destination details:', error);
    return null;
  }
}

async function getDestinationActivities(city) {
  // Mock function - replace with real API
  const activities = {
    'tokyo': [
      {
        id: 1,
        title: 'Visit Famous Temples',
        time: '9:00 AM',
        duration: '3 hours',
        pickupPoint: 'Hotel Lobby',
        image: '/temple.jpg'
      },
      // ... more activities
    ]
  };
  return activities[city.toLowerCase()] || [];
}

async function getCountryFromCity(city) {
  // Mock function - replace with real API
  const cityToCountry = {
    'tokyo': 'Japan',
    'delhi': 'India'
  };
  return cityToCountry[city.toLowerCase()] || '';
}