import prisma from '../config/prisma';
import { Request, Response, NextFunction } from 'express';

export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { payment_type, amount, status, customer_Id } = req.body;

    await prisma.payment.create({
      data: {
        payment_type,
        amount,
        status,
        customer_Id,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Payment created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentsByCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const customer_Id = req.params.customer_Id;

    const payments = await prisma.payment.findMany({
      where: {
        customer_Id: customer_Id,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Customer payments retrieved successfully',
      data: payments,
    });

  } catch (error) {
    next(error);
  }
}

export const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payment_Id = req.params.payment_Id;

    const payment = await prisma.payment.findUnique({
      where: {
        payment_Id: payment_Id,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Payment retrieved successfully',
      data: payment,
    });

  } catch (error) {
    next(error);
  }
}

export const getAllPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payments = await prisma.payment.findMany();

    res.status(200).json({
      status: 'success',
      message: 'Payments retrieved successfully',
      data: payments,
    });

  } catch (error) {
    next(error);
  }
}

// Get payment statistics for the past year, past six months, and past month
export const getPaymentStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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

    res.status(200).json({
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
    next(error);
  }
}

export const test = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).json({
      status: 'success',
      message: 'Payment TEST',
    });
  } catch (error) {
    next(error);
  }
}