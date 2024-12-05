import { Router } from 'express';
import { createPayment, getPaymentsByCustomer, getPaymentById, getAllPayments, getPaymentStatistics, createPaymentIntent, confirmPayment } from '../controllers/payment-controller';

const router = Router();

// customer routes
router.post('/customer/payment-intent', createPaymentIntent);
router.post('/customer/payments', createPayment);
router.get('/customer/:customer_Id/payments', getPaymentsByCustomer);

// admin routes
router.get('/admin/payments', getAllPayments);
router.get('/admin/payments/:payment_Id', getPaymentById);
router.get('/admin/statistics/payments', getPaymentStatistics);

// stripe webhook
router.post('/public/stripe-webhook', confirmPayment);

export default router;
