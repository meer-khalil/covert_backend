const axios = require('axios');

async function getCityNameByZipcode(zipCode) {
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


module.exports = getCityNameByZipcode