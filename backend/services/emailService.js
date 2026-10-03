const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  // If SMTP is not configured, log email for testing
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`✉️ [Email Service Simulation]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Preview: ${text || 'Check HTML content'}`);
    return { success: true, simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'Wear & Go'}" <${process.env.FROM_EMAIL || 'support@wearandgo.com'}>`,
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.warn(`⚠️ Email could not be sent to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const sendOrderConfirmationEmail = async (order, user) => {
  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} (${item.size}, ${item.color})</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a; margin-bottom: 4px;">WEAR & GO</h2>
      <p style="color: #64748b; font-size: 14px; margin-top: 0;">Style That Moves With You.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
      
      <h3 style="color: #059669;">Thank you for your order, ${order.shippingAddress.fullName}!</h3>
      <p>Your order <strong>#${order.orderId}</strong> has been successfully placed.</p>
      
      <h4>Order Summary:</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right; font-size: 15px;">
        <p style="margin: 4px 0;">Subtotal: <strong>₹${order.subtotal}</strong></p>
        <p style="margin: 4px 0; color: #16a34a;">Discount: <strong>-₹${order.discount}</strong></p>
        <p style="margin: 4px 0;">Shipping: <strong>${order.shipping === 0 ? 'FREE' : '₹' + order.shipping}</strong></p>
        <p style="margin: 4px 0;">GST / Tax: <strong>₹${order.tax}</strong></p>
        <h3 style="margin: 8px 0; color: #0f172a;">Grand Total: ₹${order.total}</h3>
      </div>

      <div style="background-color: #f8fafc; padding: 12px; border-radius: 6px; margin-top: 20px;">
        <h5 style="margin: 0 0 6px 0;">Delivery Address:</h5>
        <p style="margin: 0; font-size: 13px; color: #475569;">
          ${order.shippingAddress.fullName}<br/>
          ${order.shippingAddress.houseBuilding}, ${order.shippingAddress.street}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
          Phone: ${order.shippingAddress.phone}
        </p>
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 30px;">
        Need help? Contact support@wearandgo.com | © 2026 Wear & Go.
      </p>
    </div>
  `;

  return sendEmail({
    to: order.shippingAddress.email || user.email,
    subject: `Order Confirmation #${order.orderId} - Wear & Go`,
    html,
    text: `Your Wear & Go order #${order.orderId} for ₹${order.total} has been confirmed.`,
  });
};

const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px;">
      <h2>WEAR & GO - Password Reset</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Please click the button below to set a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 13px; color: #64748b;">This link will expire in 30 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request - Wear & Go',
    html,
    text: `Reset your Wear & Go password: ${resetUrl}`,
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
};
