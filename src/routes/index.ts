import { Router } from 'express';
import { createPayment, getPaymentsByCustomer, getPaymentById, getAllPayments, getPaymentStatistics  } from '../controllers/payment-controller';

const router = Router();

// customer routes
router.post('/customer/payments', createPayment);
router.get('/customer/payments/:payment_Id', getPaymentById);
router.get('/customer/:customer_Id/payments/', getPaymentsByCustomer);

// admin routes
router.get('/admin/payments', getAllPayments);
router.get('/admin/payments/statistics', getPaymentStatistics);

export default router;
