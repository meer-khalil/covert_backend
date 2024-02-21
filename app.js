require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const stripe = require("./config/stripe");
const Payment = require("./models/paymentModel");
const User = require('./models/user.model');
const { initRoutes } = require("./routes/index");
const app = express();


app.use(cors());


// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_2b4c95f516fe1aa231d8c5ced31df621808926627a8f02f5c05ceab9e1ce3bb6";

// Match the raw body to content type application/json
// If you are using Express v4 - v4.16 you need to use body-parser, not express, to retrieve the request body
app.post(
  "/api/v1/stripe/webhook",
  express.json({ type: "application/json" }),
  async (request, response) => {
    // console.log('Here is your WebhooKL: ', request.body);

    console.error("Here is your Webhook Request: ");

    const event = request.body;

    // Handle the event
    switch (event.type) {
      case 'invoice.payment_succeeded': {
        const dataObject = event.data.object;
        if (dataObject['billing_reason'] == 'subscription_create') {
          // The subscription automatically activates after successful payment
          // Set the payment method used to pay the first invoice
          // as the default payment method for that subscription
          const subscription_id = dataObject['subscription']
          const payment_intent_id = dataObject['payment_intent']

          // Retrieve the payment intent used to pay the subscription
          const payment_intent = await stripe.paymentIntents.retrieve(payment_intent_id);

          try {
            const subscription = await stripe.subscriptions.update(
              subscription_id,
              {
                default_payment_method: payment_intent.payment_method,
              },
            );

            let payment = await Payment.findOne({ "payment.subscription": subscription_id })
            console.error('Before retreiving the User: ', payment);
            let user = await User.findOne({ _id: payment.user });
            user.role = 'buyer';
            user = await user.save();
            console.error('User after update: ', user);
            console.error("Default payment method set for subscription:" + payment_intent.payment_method);
          } catch (err) {
            console.error(err);
            console.error(`⚠️  Falied to update the default payment method for subscription: ${subscription_id}`);
          }
        };
      }
        break;
      case 'invoice.finalized':
        console.error('Event: invoice.finalized');
        // If you want to manually send out invoices to your customers
        // or store them locally to reference to avoid hitting Stripe rate limits.
        break;
      case 'invoice.payment_failed':

        const subscription_id = dataObject['subscription']
        const payment_intent_id = dataObject['payment_intent']

        let entry = null;

        // try {
        //   // Fetch the payment entry
        //   entry = await Payment.findOne({ user: req.user.id });
        //   console.error('Deleted: ', entry);
        // } catch (error) {
        //   console.error('Error fetching payment entry:', error);
        //   // return res.status(400).send({ error: { message: 'Error fetching payment entry.' } });
        // }
        // Cancel the subscription
        // try {
        //   const deletedSubscription = await stripe.subscriptions.del(
        //     entry.payment.subscription
        //   );
        //   // let usage = await Usage.findOne({ user: req.user.id });
        //   // usage.payment = false;
        //   // usage.usageLimit = 10;
        //   // usage.plan = 'Free';
        //   // await usage.save();

        //   await Payment.deleteOne({ _id: entry._id });
        //   console.error('Deleted Payment: ', entry);
        //   // res.send({ subscription: deletedSubscription });
        // } catch (error) {
        //   console.error('Error canceling subscription:', error);
        //   // return res.status(400).send({ error: { message: error.message } });
        // }
        // Handle the payment failure, e.g., notify the customer, update payment information, etc.
        console.error('Payment failed for invoice:', event.data.object.id);
        break;
      case 'customer.subscription.deleted':
        if (event.request != null) {
          // handle a subscription cancelled by your request
          // from above.
          console.error('Event: customer.subscription.deleted: (event.request != null)');
        } else {
          console.error('Event: customer.subscription.deleted: (event.request == null)');
          // handle subscription cancelled automatically based
          // upon your subscription settings.
        }
        break;
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      case "checkout.session.completed":
        const checkoutSessionCompleted = event.data.object;
        console.error("Completed: ", checkoutSessionCompleted);

        stripe.customers
          .retrieve(checkoutSessionCompleted.customer)
          .then(async (customer) => {
            console.error("Customer: ", customer);
            let userId = customer.metadata.userId;
            // let plan = customer.metadata.plan;
            // plan = JSON.parse(plan);
            let payment = await Payment.create({
              payment: checkoutSessionCompleted,
              user: userId,
            });

            console.error("Entry Added: ", payment);

            const user = await User.findOne({ _id: userId });

            if (user) {
              try {
                const updatedUser = await User.findByIdAndUpdate(user._id, {
                  role: 'buyer'
                }, { new: true });

                if (updatedUser) {
                  console.error("User Subscribed:", updatedUser);


                  // let mailOptions = {
                  //   from: "info@teachassistai.com",
                  //   to: user.email,
                  //   subject: "Purchased Plan Information",
                  //   html: `
                  //   <h1>Congratulations!</h1>
                  //   <h4>You have successfully purchased the ${plan["name"]} Plan</h4>
                  //   <h6>You now have the following benefits</h6>
                  //   ${emailBody[plan["name"]]}
                  //   <p>Thank You!</p>
                  //   `,
                  // };
                  // await sendEmail(mailOptions);
                } else {
                  console.error("User not found or no updates were made.");
                }
              } catch (err) {
                console.error("Error updating user plan:", err);
              }
            } else {
              console.error("User Not Found ");
            }
          })
          .catch((err) => {
            console.error("Error: ", err.message);
          });
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      // ... handle other event types
      default:
        console.error(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
  }
);

app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));

app.use(express.json());
app.use(cookieParser());

// app.use(passport.initialize());
// app.use(passport.session());

const property = require("./routes/propertyRoute");
const pages = require("./routes/pagesRoute");
const blog = require("./routes/blog.routes");
const category = require('./routes/category.routes');
const contact = require('./routes/contactRoute');
const email = require('./routes/emailRoute');
const payment = require("./routes/paymentRoute");
const data = require('./routes/dataRoute');



app.use(express.static(path.join(__dirname, "public")))

initRoutes(app)
app.use("/api/v1", property);
app.use("/api/v1", pages);
app.use("/api/v1", blog);
app.use('/api/v1', category);
app.use('/api/v1', contact);
app.use('/api/v1', email);
app.use('/api/v1', data);
app.use("/api/v1", payment);


app.get("/", (req, res) => {
  res.json({
    message: "Server is Running! reflected?",
  });
});

module.exports = app;