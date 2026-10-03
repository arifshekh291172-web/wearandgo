const Razorpay = require('razorpay');

let razorpayInstance = null;

const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_wearandgo_demo';
  const key_secret = process.env.RAZORPAY_KEY_SECRET || 'demo_secret_key_wearandgo_2026';

  if (!razorpayInstance) {
    try {
      razorpayInstance = new Razorpay({
        key_id,
        key_secret,
      });
    } catch (err) {
      console.warn('⚠️ Razorpay initialization warning:', err.message);
    }
  }
  return razorpayInstance;
};

module.exports = { getRazorpayInstance };
