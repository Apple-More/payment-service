import prisma from '../config/prisma';
import { Request, Response } from 'express';
import { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET } from '../config';
const stripe = require("stripe")(STRIPE_SECRET_KEY);

export const createPayment = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { payment_type, amount, status, customer_Id } = req.body;

    // const payment = await prisma.payment.create({
    //   data: {
    //     payment_type,
    //     amount,
    //     status,
    //     customer_Id,

    //   },
    // });

    return res.status(201).json({
      status: 'success',
      message: 'Payment created successfully'
    });
  } catch (error) {
    return res.status(400).json({
      status: 'error',
      message: 'Error creating payment',
    });
  }
};

export const getPaymentsByCustomer = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const customer_Id = req.params.customer_Id;

    const payments = await prisma.payment.findMany({
      where: {
        customer_Id: customer_Id,
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Customer payments retrieved successfully',
      data: payments,
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error retrieving customer payments'
    });
  }
}

export const getPaymentById = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const payment_Id = req.params.payment_Id;

    const payment = await prisma.payment.findUnique({
      where: {
        payment_Id: payment_Id,
      },
    });

    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Payment retrieved successfully',
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error retrieving payment'
    });
  }
}

export const getAllPayments = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const payments = await prisma.payment.findMany();

    return res.status(200).json({
      status: 'success',
      message: 'Payments retrieved successfully',
      data: payments,
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      matchMedia: 'Error retrieving payments'
    });
  }
}

export const getPaymentStatistics = async (
  req: Request,
  res: Response,
): Promise<any> => {
  try {
    const totalPayments = await prisma.payment.count();

    const totalAmount = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
    });

    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1);

    const totalAmountPastYear = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        createdAt: {
          gte: pastYear,
        },
      },
    });

    const pastSixMonths = new Date();
    pastSixMonths.setMonth(pastSixMonths.getMonth() - 6);

    const totalAmountPastSixMonths = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        createdAt: {
          gte: pastSixMonths,
        },
      },
    });

    const pastMonth = new Date();
    pastMonth.setMonth(pastMonth.getMonth() - 1);

    const totalAmountPastMonth = await prisma.payment.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        createdAt: {
          gte: pastMonth,
        },
      },
    });

    return res.status(200).json({
      status: 'success',
      message: 'Payment statistics retrieved successfully',
      data: {
        totalPayments,
        totalAmount: totalAmount._sum.amount || 0,
        totalAmountPastYear: totalAmountPastYear._sum.amount || 0,
        totalAmountPastSixMonths: totalAmountPastSixMonths._sum.amount || 0,
        totalAmountPastMonth: totalAmountPastMonth._sum.amount || 0
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error retrieving payment statistics'
    });
  }
}

export const createPaymentIntent = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'usd',
    });

    console.log(paymentIntent);

    await prisma.payment.create({
      data: {
        payment_type: 'card',
        amount: amount/100,
        status: 'pending',
        payment_intent_id: paymentIntent.id,
        customer_Id: 'cust_id',
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Payment intent created successfully',
      data: {
        client_secret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      status: 'error',
      message: 'Error creating payment intent',
    });
  }
}

export const confirmPayment = async (
  req: Request,
  res: Response,
): Promise<any> => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.log(error);
    return res.status(400).send(`Webhook Error`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;

    const payment = await prisma.payment.findFirst({
      where: {
        payment_intent_id: paymentIntent.id,
      },
    });

    if (!payment) {
      console.log('Payment not found');

      return res.status(404).json({
        status: 'error',
        message: 'Payment not found',
      });
    }

    await prisma.payment.update({
      where: {
        payment_Id: payment.payment_Id,
      },
      data: {
        status: 'succeeded',
      },
    });

    // add logic to call order service
  }
  else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;

    const payment = await prisma.payment.findFirst({
      where: {
        payment_intent_id: paymentIntent.id,
      },
    });

    if (!payment) {
      console.log('Payment not found');

      return res.status(404).json({
        status: 'error',
        message: 'Payment not found',
      });
    }

    await prisma.payment.update({
      where: {
        payment_Id: payment.payment_Id,
      },
      data: {
        status: 'failed',
      },
    });
  }

  return res.status(200).json({ received: true });
}