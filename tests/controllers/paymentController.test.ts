import { createPayment, getPaymentsByCustomer, getPaymentById, getAllPayments, getPaymentStatistics } from '../../src/controllers/payment-controller';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  const mockPayment = {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      payment: mockPayment,
    })),
  };
});

const mockResponse = (): Partial<Response> => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (body: any = {}, params: any = {}): Partial<Request> => {
  const req = {} as Partial<Request>;
  req.body = body;
  req.params = params;
  return req;
};

describe('Payment Controller Tests', () => {
  let prismaClient: any;

  beforeAll(() => {
    prismaClient = new PrismaClient(); // Mocked Prisma client
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  // Test: createPayment
  describe('createPayment', () => {
    it('should create a new payment successfully', async () => {
      const req = mockRequest({ payment_type: 'Credit Card', amount: 100, status: 'Success', customer_Id: '123' });
      const res = mockResponse();

      prismaClient.payment.create.mockResolvedValue({
        payment_type: 'Credit Card',
        amount: 100,
        status: 'Success',
        customer_Id: '123',
      });

      await createPayment(req as Request, res as Response, jest.fn());

      expect(prismaClient.payment.create).toHaveBeenCalledWith({
        data: {
          payment_type: 'Credit Card',
          amount: 100,
          status: 'Success',
          customer_Id: '123',
        },
      });
      expect(res.status).toHaveBeenCalledWith(201); 
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Payment created successfully',
      });
    });
  });

  // Test: getPaymentsByCustomer
  describe('getPaymentsByCustomer', () => {
    it('should return payments for a specific customer', async () => {
      const req = mockRequest({}, { customer_Id: '123' });
      const res = mockResponse();

      prismaClient.payment.findMany.mockResolvedValue([
        { payment_type: 'Credit Card', amount: 100, status: 'Success', customer_Id: '123' },
      ]);

      await getPaymentsByCustomer(req as Request, res as Response, jest.fn());

      expect(prismaClient.payment.findMany).toHaveBeenCalledWith({
        where: { customer_Id: '123' },
      });
      expect(res.status).toHaveBeenCalledWith(200); 
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Customer payments retrieved successfully',
        data: [
          { payment_type: 'Credit Card', amount: 100, status: 'Success', customer_Id: '123' },
        ],
      });
    });
  });

  // Test: getPaymentById
  describe('getPaymentById', () => {
    it('should return a payment by ID', async () => {
      const req = mockRequest({}, { payment_Id: '1' });
      const res = mockResponse();

      prismaClient.payment.findUnique.mockResolvedValue({
        payment_type: 'Credit Card',
        amount: 100,
        status: 'Success',
        customer_Id: '123',
      });

      await getPaymentById(req as Request, res as Response, jest.fn());

      expect(prismaClient.payment.findUnique).toHaveBeenCalledWith({
        where: { payment_Id: '1' },
      });
      expect(res.status).toHaveBeenCalledWith(200); 
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Payment retrieved successfully',
        data: {
          payment_type: 'Credit Card',
          amount: 100,
          status: 'Success',
          customer_Id: '123',
        },
      });
    });
  });

  // Test: getAllPayments
  describe('getAllPayments', () => {
    it('should return all payments', async () => {
      const req = mockRequest();
      const res = mockResponse();

      prismaClient.payment.findMany.mockResolvedValue([
        { payment_type: 'Credit Card', amount: 100, status: 'Success', customer_Id: '123' },
      ]);

      await getAllPayments(req as Request, res as Response, jest.fn());

      expect(prismaClient.payment.findMany).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Payments retrieved successfully',
        data: [
          { payment_type: 'Credit Card', amount: 100, status: 'Success', customer_Id: '123' },
        ],
      });
    });
  });

  // Test: getPaymentStatistics
  describe('getPaymentStatistics', () => {
    it('should return payment statistics', async () => {
      const req = mockRequest();
      const res = mockResponse();

      prismaClient.payment.count.mockResolvedValue(5);
      prismaClient.payment.aggregate
      .mockResolvedValueOnce({ _sum: { amount: 500 } }) 
      .mockResolvedValueOnce({ _sum: { amount: 300 } }) 
      .mockResolvedValueOnce({ _sum: { amount: 200 } }) 
      .mockResolvedValueOnce({ _sum: { amount: 100 } }); 


      await getPaymentStatistics(req as Request, res as Response, jest.fn());

      expect(prismaClient.payment.count).toHaveBeenCalled();
      expect(prismaClient.payment.aggregate).toHaveBeenCalledTimes(4);
      expect(res.status).toHaveBeenCalledWith(200); 
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Payment statistics retrieved successfully',
        data: {
        totalPayments: 5,
        totalAmount: 500,
        totalAmountPastYear: 300,
        totalAmountPastSixMonths: 200,
        totalAmountPastMonth: 100,
        },
      });
    });
  });
});
