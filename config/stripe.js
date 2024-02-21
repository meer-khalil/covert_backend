/*
  Caution:
  If you are changing the key.
  then you have also need to change the price_id
  in paymentController
*/

// const stripe = require('stripe')('sk_test_51ONgbWF5gKnU5g5lnGcdblzKJ1P4eTpj7O7uD7o9cmWZ8XwCwlIlPR46dOZmPBJfZAR384XGDYdIsaq7uBkF9Ape00v27kTsLQ')
const stripe = require('stripe')('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')


module.exports = stripe;