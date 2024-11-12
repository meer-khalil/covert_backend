/*
  Caution:
  If you are changing the key.
  then you have also need to change the price_id
  in paymentController
*/

// const stripe = require('stripe')('sk_test_51ONgbWF5gKnU5g5lnGcdblzKJ1P4eTpj7O7uD7o9cmWZ8XwCwlIlPR46dOZmPBJfZAR384XGDYdIsaq7uBkF9Ape00v27kTsLQ')

// TODO replace with new key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
module.exports = stripe;