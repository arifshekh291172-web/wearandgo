const nodemailer = require('nodemailer');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const getBrevoKey = () => process.env.BREVO_API_KEY;

const STORE_PHONE = '+91 74002 45941';
const STORE_EMAIL = 'wear.and.go.official@gmail.com';
const STORE_ADDRESS = 'Shop No. 3, Yamuna Bai Chawl, Asalpha Village, Ghatkopar West, Mumbai - 400084';
const STORE_URL = process.env.CLIENT_URL || 'https://wearandgo.onrender.com';

/**
 * Core sendEmail function
 * Prioritizes Brevo REST API v3, falls back to SMTP if configured, or logs in dev.
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const brevoKey = process.env.BREVO_API_KEY;
  const fromName = process.env.FROM_NAME || 'Wear & Go';
  const fromEmail = process.env.FROM_EMAIL || STORE_EMAIL;

  // 1. Try Brevo REST API v3
  if (brevoKey) {
    try {
      const recipients = Array.isArray(to)
        ? to.map((t) => (typeof t === 'string' ? { email: t } : t))
        : [{ email: to }];

      const payload = {
        sender: {
          name: fromName,
          email: fromEmail,
        },
        to: recipients,
        subject,
        htmlContent: html,
        textContent: text || 'View this email in HTML browser',
      };

      const res = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json',
          'api-key': brevoKey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        console.log(`📧 [Brevo Email Sent] to: ${JSON.stringify(to)} | MessageId: ${data.messageId}`);
        return { success: true, messageId: data.messageId, provider: 'brevo' };
      } else {
        console.warn(`⚠️ [Brevo API Warning] ${res.status}: ${data.message || JSON.stringify(data)}`);
        if (data.message && data.message.includes('unrecognised IP address')) {
          console.warn(
            `👉 Action Required: Visit https://app.brevo.com/security/authorised_ips to disable Authorised IPs or whitelist the server IP.`
          );
        }
      }
    } catch (apiErr) {
      console.warn(`⚠️ [Brevo API Connection Error] ${apiErr.message}`);
    }
  }

  // 2. Fallback to Nodemailer SMTP if configured
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        text,
        html,
      });

      console.log(`📧 [SMTP Email Sent] to: ${JSON.stringify(to)} | MessageId: ${info.messageId}`);
      return { success: true, messageId: info.messageId, provider: 'smtp' };
    } catch (smtpErr) {
      console.warn(`⚠️ [SMTP Error] ${smtpErr.message}`);
    }
  }

  // 3. Fallback: Log email preview
  console.log(`✉️ [Email Service Simulation]`);
  console.log(`To: ${JSON.stringify(to)}`);
  console.log(`Subject: ${subject}`);
  return { success: true, simulated: true };
};

/**
 * 1. Welcome Email on User Registration
 */
const sendWelcomeEmail = async (user) => {
  const userName = user.name || 'Fashion Connoisseur';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to WEAR & GO</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0A0B0E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0B0E; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #12141A; border: 1px solid #1E232E; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
              
              <!-- Header Brand Logo -->
              <tr>
                <td style="padding: 36px 30px; text-align: center; background: linear-gradient(180deg, #181C26 0%, #12141A 100%); border-bottom: 1px solid #1E232E;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 3px; color: #F59E0B; text-transform: uppercase;">
                    WEAR & GO
                  </h1>
                  <p style="margin: 6px 0 0 0; font-size: 11px; letter-spacing: 2px; color: #94A3B8; text-transform: uppercase;">
                    Style That Moves With You
                  </p>
                </td>
              </tr>

              <!-- Hero Greeting -->
              <tr>
                <td style="padding: 36px 30px 20px 30px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #FFFFFF;">
                    Welcome to the Circle, ${userName}! ✨
                  </h2>
                  <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #CBD5E1;">
                    Your account has been successfully created. You are now part of India's contemporary luxury fashion destination, where modern cuts meet effortless daily wear.
                  </p>

                  <!-- Exclusive Welcome Gift Box -->
                  <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.05) 100%); border: 1px dashed #F59E0B; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                    <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #FBBF24; display: block; margin-bottom: 6px;">
                      Your Welcome Gift Voucher
                    </span>
                    <div style="display: inline-block; background-color: #0A0B0E; border: 1px solid #F59E0B; border-radius: 8px; padding: 8px 24px; font-size: 20px; font-weight: 800; letter-spacing: 3px; color: #F59E0B;">
                      FIRST200
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #94A3B8;">
                      Enjoy flat ₹200 OFF on your first purchase above ₹999. Use at checkout!
                    </p>
                  </div>

                  <!-- Call To Action Button -->
                  <div style="text-align: center; margin: 32px 0 20px 0;">
                    <a href="${STORE_URL}/shop" style="display: inline-block; background-color: #F59E0B; color: #0A0B0E; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 14px 32px; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);">
                      Explore New Arrivals →
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Features Grid -->
              <tr>
                <td style="padding: 0 30px 30px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0E1015; border-radius: 12px; border: 1px solid #1E232E; padding: 16px;">
                    <tr>
                      <td width="33%" style="text-align: center; padding: 10px;">
                        <div style="font-size: 16px;">🚚</div>
                        <div style="font-size: 11px; font-weight: 700; color: #FFFFFF; margin-top: 4px;">Free Shipping</div>
                        <div style="font-size: 10px; color: #64748B;">On orders ₹999+</div>
                      </td>
                      <td width="33%" style="text-align: center; padding: 10px; border-left: 1px solid #1E232E; border-right: 1px solid #1E232E;">
                        <div style="font-size: 16px;">🔄</div>
                        <div style="font-size: 11px; font-weight: 700; color: #FFFFFF; margin-top: 4px;">7-Day Easy Returns</div>
                        <div style="font-size: 10px; color: #64748B;">Hassle-free pickups</div>
                      </td>
                      <td width="33%" style="text-align: center; padding: 10px;">
                        <div style="font-size: 16px;">🛡️</div>
                        <div style="font-size: 11px; font-weight: 700; color: #FFFFFF; margin-top: 4px;">100% Genuine</div>
                        <div style="font-size: 10px; color: #64748B;">Direct from studio</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Store Address & Contact Footer -->
              <tr>
                <td style="padding: 24px 30px; background-color: #0A0B0E; border-top: 1px solid #1E232E; text-align: center;">
                  <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #FFFFFF;">
                    WEAR & GO Flagship Atelier & Store
                  </p>
                  <p style="margin: 0 0 8px 0; font-size: 11px; color: #94A3B8; line-height: 1.5;">
                    ${STORE_ADDRESS}
                  </p>
                  <p style="margin: 0 0 16px 0; font-size: 11px; color: #F59E0B;">
                    📞 Support: <a href="tel:${STORE_PHONE.replace(/\s+/g, '')}" style="color: #F59E0B; text-decoration: none; font-weight: 700;">${STORE_PHONE}</a> | ✉️ <a href="mailto:${STORE_EMAIL}" style="color: #F59E0B; text-decoration: none;">${STORE_EMAIL}</a>
                  </p>
                  <p style="margin: 0; font-size: 10px; color: #475569;">
                    © 2026 WEAR & GO. All rights reserved. You received this email because you signed up on our store.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `Welcome to WEAR & GO! Enjoy ₹200 OFF on your first purchase`,
    html,
    text: `Welcome to WEAR & GO, ${userName}! Use coupon FIRST200 for ₹200 OFF your first order. Visit ${STORE_URL}/shop`,
  });
};

/**
 * 2. New Clothing Item / Product Drop Announcement Email
 */
const sendNewProductAnnouncementEmail = async ({ product, recipients }) => {
  if (!recipients || recipients.length === 0) return { success: false, message: 'No recipients' };

  const productName = product.name || 'New Exclusive Apparel';
  const productPrice = product.price || 0;
  const productDiscountPrice = product.discountPrice || productPrice;
  const productCategory = product.categorySlug ? product.categorySlug.replace('-', ' ').toUpperCase() : 'NEW DROP';
  const productImage = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800';
  const productUrl = `${STORE_URL}/product/${product.slug}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Drop at WEAR & GO</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0A0B0E; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #FFFFFF;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0A0B0E; padding: 40px 10px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #12141A; border: 1px solid #1E232E; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
              
              <!-- Header Brand Logo -->
              <tr>
                <td style="padding: 30px; text-align: center; background: linear-gradient(180deg, #181C26 0%, #12141A 100%); border-bottom: 1px solid #1E232E;">
                  <span style="display: inline-block; background-color: rgba(245, 158, 11, 0.15); color: #F59E0B; font-size: 10px; font-weight: 800; letter-spacing: 2px; padding: 4px 12px; border-radius: 20px; text-transform: uppercase; margin-bottom: 8px;">
                    ✨ Just Dropped • New Collection
                  </span>
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 3px; color: #FFFFFF; text-transform: uppercase;">
                    WEAR & GO
                  </h1>
                </td>
              </tr>

              <!-- Product Hero Card -->
              <tr>
                <td style="padding: 0; text-align: center;">
                  <a href="${productUrl}" style="text-decoration: none; display: block;">
                    <img src="${productImage}" alt="${productName}" style="width: 100%; max-height: 400px; object-fit: cover; display: block; border-bottom: 1px solid #1E232E;" />
                  </a>
                </td>
              </tr>

              <!-- Product Details -->
              <tr>
                <td style="padding: 30px;">
                  <span style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #F59E0B; display: block; margin-bottom: 6px;">
                    ${productCategory}
                  </span>
                  <h2 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 800; color: #FFFFFF;">
                    ${productName}
                  </h2>
                  <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.6; color: #94A3B8;">
                    ${product.description ? product.description.slice(0, 160) + '...' : 'Crafted with premium fabrics, tailored fit, and metropolitan aesthetic. Now available online.'}
                  </p>

                  <div style="display: flex; align-items: baseline; gap: 12px; margin-bottom: 24px;">
                    <span style="font-size: 24px; font-weight: 900; color: #FFFFFF;">
                      ₹${productDiscountPrice}
                    </span>
                    ${productPrice > productDiscountPrice ? `<span style="font-size: 16px; color: #64748B; text-decoration: line-through; margin-left: 10px;">₹${productPrice}</span>` : ''}
                    <span style="margin-left: 12px; font-size: 11px; font-weight: 700; color: #10B981; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 4px;">
                      In Stock
                    </span>
                  </div>

                  <div style="text-align: center;">
                    <a href="${productUrl}" style="display: inline-block; width: 85%; background-color: #F59E0B; color: #0A0B0E; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; padding: 14px 24px; border-radius: 8px; text-decoration: none; text-align: center; box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);">
                      Shop Now — Limited Edition →
                    </a>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 30px; background-color: #0A0B0E; border-top: 1px solid #1E232E; text-align: center;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; color: #CBD5E1;">
                    WEAR & GO — Mumbai Store
                  </p>
                  <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748B;">
                    ${STORE_ADDRESS} | 📞 ${STORE_PHONE}
                  </p>
                  <p style="margin: 0; font-size: 10px; color: #475569;">
                    © 2026 WEAR & GO. You are receiving this because you subscribed to new arrival alerts.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Brevo allows batch sending or individual sends
  const emailList = recipients.map((r) => (typeof r === 'string' ? r : r.email)).filter(Boolean);

  let successCount = 0;
  for (const email of emailList) {
    try {
      await sendEmail({
        to: email,
        subject: `New Arrival Alert: ${productName} just dropped at WEAR & GO! 🔥`,
        html,
        text: `New clothing item added: ${productName} for ₹${productDiscountPrice}. Check it out at ${productUrl}`,
      });
      successCount++;
    } catch (e) {
      console.warn(`Failed to notify ${email}:`, e.message);
    }
  }

  return { success: true, count: successCount };
};

/**
 * 3. Newsletter Subscription Confirmation Email
 */
const sendNewsletterWelcomeEmail = async (email) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 20px; background-color: #0A0B0E; font-family: Arial, sans-serif; color: #FFFFFF;">
      <div style="max-width: 500px; margin: auto; background-color: #12141A; border: 1px solid #1E232E; border-radius: 12px; padding: 24px; text-align: center;">
        <h2 style="color: #F59E0B; margin: 0 0 10px 0;">WEAR & GO</h2>
        <h3 style="margin: 0 0 14px 0;">You're On The VIP List! 🎉</h3>
        <p style="font-size: 13px; color: #CBD5E1; line-height: 1.6;">
          Thank you for subscribing to the Wear & Go newsletter. You will be the very first to know when new fashion drops, limited editions, and seasonal sales launch.
        </p>
        <div style="background-color: #0A0B0E; border: 1px dashed #F59E0B; padding: 12px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 4px 0; font-size: 11px; color: #94A3B8;">YOUR EXCLUSIVE CODE:</p>
          <span style="font-size: 18px; font-weight: 800; color: #F59E0B; letter-spacing: 2px;">FIRST200</span>
          <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748B;">Flat ₹200 off on your next purchase</p>
        </div>
        <a href="${STORE_URL}/shop" style="display: inline-block; background-color: #F59E0B; color: #0A0B0E; font-weight: bold; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
          Start Shopping →
        </a>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `You're in! Welcome to the Wear & Go Newsletter (₹200 OFF inside)`,
    html,
    text: `You have successfully subscribed to the Wear & Go newsletter! Use code FIRST200 for ₹200 off.`,
  });
};

/**
 * 4. Order Confirmation Email
 */
const sendOrderConfirmationEmail = async (order, user) => {
  const itemsList = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #1E232E; color: #FFFFFF;">${item.name} (${item.size || 'Free Size'}, ${item.color || 'Standard'})</td>
          <td style="padding: 10px; border-bottom: 1px solid #1E232E; text-align: center; color: #CBD5E1;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #1E232E; text-align: right; color: #F59E0B; font-weight: bold;">₹${item.price}</td>
        </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 20px; background-color: #0A0B0E; font-family: Arial, sans-serif; color: #FFFFFF;">
      <div style="max-width: 600px; margin: auto; background-color: #12141A; border: 1px solid #1E232E; border-radius: 16px; padding: 30px;">
        <h2 style="color: #F59E0B; margin: 0 0 4px 0; letter-spacing: 2px;">WEAR & GO</h2>
        <p style="color: #64748B; font-size: 12px; margin: 0 0 20px 0;">Official Order Invoice & Confirmation</p>
        
        <h3 style="color: #10B981; margin: 0 0 10px 0;">Thank you for your order, ${order.shippingAddress.fullName}! 🎉</h3>
        <p style="font-size: 13px; color: #CBD5E1;">
          Your order <strong>#${order.orderId}</strong> has been confirmed and is being prepped for express dispatch.
        </p>
        
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 20px 0;">
          <thead>
            <tr style="background-color: #0E1015; color: #94A3B8;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div style="text-align: right; font-size: 14px; border-top: 1px solid #1E232E; padding-top: 16px;">
          <p style="margin: 4px 0; color: #94A3B8;">Subtotal: <strong style="color: #FFFFFF;">₹${order.subtotal}</strong></p>
          <p style="margin: 4px 0; color: #10B981;">Discount: <strong>-₹${order.discount}</strong></p>
          <p style="margin: 4px 0; color: #94A3B8;">Shipping: <strong style="color: #FFFFFF;">${order.shipping === 0 ? 'FREE' : '₹' + order.shipping}</strong></p>
          <h3 style="margin: 12px 0 0 0; color: #F59E0B; font-size: 18px;">Grand Total: ₹${order.total}</h3>
        </div>

        <div style="background-color: #0E1015; padding: 16px; border-radius: 8px; margin-top: 24px; border: 1px solid #1E232E;">
          <h5 style="margin: 0 0 8px 0; font-size: 12px; color: #F59E0B; text-transform: uppercase;">Shipping To:</h5>
          <p style="margin: 0; font-size: 12px; color: #CBD5E1; line-height: 1.5;">
            ${order.shippingAddress.fullName}<br/>
            ${order.shippingAddress.houseBuilding}, ${order.shippingAddress.street}<br/>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br/>
            Phone: ${order.shippingAddress.phone}
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${STORE_URL}/orders" style="display: inline-block; background-color: #F59E0B; color: #0A0B0E; font-size: 12px; font-weight: 800; padding: 12px 24px; border-radius: 6px; text-decoration: none;">
            Track Your Order Live →
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: order.shippingAddress.email || user.email,
    subject: `Order Confirmed #${order.orderId} - WEAR & GO`,
    html,
    text: `Your Wear & Go order #${order.orderId} for ₹${order.total} has been confirmed.`,
  });
};

/**
 * 5. Password Reset Email
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 20px; background-color: #0A0B0E; font-family: Arial, sans-serif; color: #FFFFFF;">
      <div style="max-width: 500px; margin: auto; background-color: #12141A; border: 1px solid #1E232E; border-radius: 12px; padding: 24px;">
        <h2 style="color: #F59E0B; margin: 0 0 10px 0;">WEAR & GO</h2>
        <h3 style="margin: 0 0 12px 0;">Reset Your Password</h3>
        <p style="font-size: 13px; color: #CBD5E1; line-height: 1.6;">
          Hello ${user.name}, you recently requested to reset your password for your Wear & Go account. Click below to proceed:
        </p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetUrl}" style="background-color: #F59E0B; color: #0A0B0E; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 12px; color: #64748B;">This link is valid for 30 minutes. If you did not request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: 'Password Reset Request - WEAR & GO',
    html,
    text: `Reset your Wear & Go password: ${resetUrl}`,
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendNewProductAnnouncementEmail,
  sendNewsletterWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
};
