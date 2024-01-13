const axios = require('axios');

async function getCityName(zipCode) {
  try {
    const response = await axios.get(`https://api.zippopotam.us/us/${zipCode}`);

    // Extract city name from the API response
    const cityName = response.data.places[0]['place name'];

    console.log(`The city for zip code ${zipCode} is: ${cityName}`);
    return cityName
  } catch (error) {
    console.error(`Error fetching city information: ${error.message}`);
  }
}

// Example usage
const zipCode = '44188'; // Replace with the actual zip code
getCityName(zipCode);


module.exports = getCityName