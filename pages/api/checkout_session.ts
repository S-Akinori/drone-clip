import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_API_KEY as string, {
  apiVersion: "2020-08-27"
});

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {price} = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: price,
    currency: "jpy",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  res.send({
    clientSecret: paymentIntent.client_secret
  })
}