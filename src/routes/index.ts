import { Router } from 'express';
import { createPayment, getPaymentsByCustomer, getPaymentById, getAllPayments, getPaymentStatistics, createPaymentIntent, confirmPayment } from '../controllers/payment-controller';
import allowRoles from '../middlewares/allow-roles';

const router = Router();

// customer routes
router.post('/customer/payment-intent', allowRoles('Customer'), createPaymentIntent);
router.post('/customer/payments', allowRoles('Customer'), createPayment);
router.get('/customer/:customer_Id/payments', allowRoles('Customer'), getPaymentsByCustomer);

// admin routes
router.get('/admin/payments', allowRoles('Admin', 'SuperAdmin'), getAllPayments);
router.get('/admin/payments/:payment_Id', allowRoles('Admin', 'SuperAdmin'), getPaymentById);
router.get('/admin/statistics/payments', allowRoles('Admin', 'SuperAdmin'), getPaymentStatistics);

// stripe webhook
router.post('/public/stripe-webhook', confirmPayment);

export default router;
