import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT;
export const USER_SERVICE_URL = process.env.USER_SERVICE_URL;
export const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;
export const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;
export const API_GATEWAY_URL = process.env.API_GATEWAY_URL;