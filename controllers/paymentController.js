require("dotenv").config();
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");

let Payment = require("../models/paymentModel");
let User = require("../models/user.model");

// const site = 'http://localhost:3000'
const site = "https://www.covertnest.com";
const sanitize = require("mongo-sanitize");

const stripe = require("../config/stripe");
const { validateRegisterInput } = require("../validations/user.validation");

const plans = new Map([
  [
    "Starter",
    {
      priceInCent: 999,
      requestlimit: 60,
      noOfFilesUploadedLimit: 10,
      name: "Starter",
    },
  ],
  [
    "Professional",
    {
      priceInCent: 1499,
      requestlimit: 120,
      noOfFilesUploadedLimit: 20,
      name: "Professional",
    },
  ],
]);

let test_price = "price_1ONstPF5gKnU5g5lkXpKSQmj";
let live_price = "price_1OnP7lF5gKnU5g5lDE0rekte";

exports.processPayment = asyncErrorHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  // Check if an existing subscription is already present for this user
  const existingSubscription = await Payment.findOne({ user: user._id });
  if (existingSubscription) {
    return res
      .status(409)
      .json({ message: "You already have an active subscription." });
  }

  // If no active subscription, proceed to create a new one
  const customer = await stripe.customers.create({
    email: req.body.email,
    metadata: { userId: user._id },
  });

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    line_items: [
      {
        price: test_price, // Replace with your actual price ID
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${site}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${site}/cancel`,
  });

  // Save the payment record if required
  await Payment.create({ payment: session, user: user._id });

  res.status(200).json({ success: true, url: session.url });
});

exports.cancelSubscription = asyncErrorHandler(async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ user: req.user.id });
    if (!payment)
      return res.status(404).json({ error: "No subscription found" });

    const deletedSubscription = await stripe.subscriptions.del(
      payment.subscriptionId
    );

    res.status(200).json({ subscription: deletedSubscription });
  } catch (error) {
    console.error("Error in cancelSubscription:", error);
    res
      .status(500)
      .json({ error: "An error occurred while canceling the subscription." });
  }
});

exports.createSubscription = asyncErrorHandler(async (req, res, next) => {
  try {
    const plan = plans.get(req.body.plan);

    const customer = await stripe.customers.create({
      email: req.user.email,
      metadata: {
        userId: req.user.id,
      },
    });

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: plan.priceInCent }],
      expand: ["latest_invoice.payment_intent"],
    });

    res.status(200).json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("Error in createSubscription:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the subscription." });
  }
});
