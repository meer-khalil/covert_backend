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
  console.log("Attempting to cancel subscription for user:", req.user.id);

  try {
    // Fetch the payment entry
    const paymentEntry = await Payment.deleteOne({ user: req.user.id });
    // if (!paymentEntry) {
    //   return res
    //     .status(404)
    //     .json({ message: "No active subscription found for the user." });
    // }
    // console.log("paymentEntry: ", paymentEntry);
    // Cancel the subscription on Stripe
    // const subscriptionId = paymentEntry.payment.subscriptionId; // Ensure this is stored during creation
    // const deletedSubscription = await stripe.subscriptions.del(subscriptionId);

    // Optional: Update usage or limits
    // Update any usage or plan data here if necessary

    // Delete the payment entry or mark it as inactive
    // await Payment.deleteOne({ _id: paymentEntry._id });

    console.log("Subscription canceled successfully:", paymentEntry);
    return res.status(200).json({
      success: true,
      message: "Subscription canceled successfully",
      subscription: paymentEntry,
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return res.status(500).json({
      message: "Failed to cancel subscription. Please try again later.",
    });
  }
});

exports.createSubscription = asyncErrorHandler(async (req, res, next) => {
  // const user_Id = req.user.id

  let plan = plans.get(req.body.plan);
  // create a stripe customer
  const customer = await this.stripe.customers.create({
    name: req.name,
    email: req.email,
    metadata: {
      userId: req.user.id,
      plan: JSON.stringify(plan),
    },
    payment_method: req.paymentMethod,
    invoice_settings: {
      default_payment_method: req.paymentMethod,
    },
  });

  // get the price id from the front-end
  const priceId = req.priceId;

  // create a stripe subscription
  const subscription = await this.stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
    payment_settings: {
      payment_method_options: {
        card: {
          request_three_d_secure: "any",
        },
      },
      payment_method_types: ["card"],
      save_default_payment_method: "on_subscription",
    },
    expand: ["latest_invoice.payment_intent"],
  });

  // return the client secret and subscription id
  return {
    clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    subscriptionId: subscription.id,
  };
});
