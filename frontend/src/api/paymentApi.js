import API from './axios';

export const createPaymentOrder = () => API.post('/payment/create-order');
export const verifyPayment = (data) => API.post('/payment/verify', data);
