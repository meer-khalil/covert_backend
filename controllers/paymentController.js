require('dotenv').config()
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');

let Payment = require('../models/paymentModel');
let User = require('../models/user.model');

// const site = 'http://localhost:3000'
const site = 'https://www.covertnest.com'
const sanitize = require('mongo-sanitize');

const stripe = require('../config/stripe');
const { validateRegisterInput } = require('../validations/user.validation');

const plans = new Map([
    ['Starter', { priceInCent: 999, requestlimit: 60, noOfFilesUploadedLimit: 10, name: 'Starter' }],
    ['Professional', { priceInCent: 1499, requestlimit: 120, noOfFilesUploadedLimit: 20, name: 'Professional' }
    ],
]);


let test_price = 'price_1ONstPF5gKnU5g5lkXpKSQmj'
let live_price = 'price_1OnP7lF5gKnU5g5lDE0rekte'

exports.processPayment = asyncErrorHandler(async (req, res, next) => {


    const { error } = validateRegisterInput(req.body);
    if (error) return res.status(422).json({ message: error.details[0].message });

    let sanitizedInput = sanitize(req.body);


    let user = await User.findOne({ email: sanitizedInput.email.toLowerCase() });

    if (user) {
        return res.status(409).json({ message: "Email already registered. Take an another email" });
    }

    const customer = await stripe.customers.create({
        email: sanitizedInput.email.toLowerCase(),
        metadata: {
            ...sanitizedInput
        }
    });

    try {

        const session = await stripe.checkout.sessions.create({
            customer: customer.id,
            payment_method_types: ['card'],
            line_items: [{
                /*
                    If you are using the live key then you have also need to
                    change the price to live_price
                */
                price: live_price,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${site}/login`,
            cancel_url: `${site}/signup`
        })

        res.status(200).json({
            success: true,
            url: session.url
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while creating the payment intent.' });
    }
});


exports.cancelSubscription = asyncErrorHandler(async (req, res, next) => {

    let entry = null;
    console.log('Going to delete subscription');

    try {
        // Fetch the payment entry
        entry = await Payment.findOne({ user: req.user.id });
        console.log('Deleted: ', entry);
    } catch (error) {
        console.error('Error fetching payment entry:', error);
        return res.status(404).send({ error: { message: 'Error fetching payment entry.' } });
    }
    // Cancel the subscription
    try {
        const deletedSubscription = await stripe.subscriptions.del(
            entry.payment.subscription
        );
        // let usage = await Usage.findOne({ user: req.user.id });
        // usage.payment = false;
        // usage.usageLimit = 10;
        // usage.plan = 'Free';
        // await usage.save();

        // await Payment.deleteOne({ _id: entry._id });
        // console.log('Deleted Payment: ', entry);
        res.send({ subscription: deletedSubscription });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        return res.status(400).send({ error: { message: error.message } });
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
            plan: JSON.stringify(plan)
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
                    request_three_d_secure: 'any',
                },
            },
            payment_method_types: ['card'],
            save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
    });

    // return the client secret and subscription id
    return {
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        subscriptionId: subscription.id,
    };

})