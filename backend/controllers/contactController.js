const ContactMessage = require('../models/ContactMessage');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');

// @desc    Submit a contact inquiry
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, subject, and message',
      });
    }

    const contact = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Our team will get back to you shortly.',
      contact,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages (Admin)
// @route   GET /api/contact/admin
// @access  Private/Admin
exports.getAllMessagesAdmin = async (req, res, next) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact message status / reply (Admin)
// @route   PUT /api/contact/:id/status
// @access  Private/Admin
exports.updateMessageStatus = async (req, res, next) => {
  try {
    const { status, adminReply } = req.body;
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (status) message.status = status;
    if (adminReply !== undefined) message.adminReply = adminReply;

    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message updated',
      contactMessage: message,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
exports.subscribeNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(200).json({
        success: true,
        message: 'You are already subscribed to the Wear & Go newsletter!',
      });
    }

    await NewsletterSubscriber.create({ email: email.toLowerCase() });

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing! Enjoy 10% off your first order.',
    });
  } catch (error) {
    next(error);
  }
};
