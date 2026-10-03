const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const couponRoutes = require('./routes/couponRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Security Headers & Content Security Policy for Razorpay and Assets
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://checkout.razorpay.com',
        ],
        frameSrc: [
          "'self'",
          'https://api.razorpay.com',
          'https://checkout.razorpay.com',
        ],
        connectSrc: [
          "'self'",
          'https://api.razorpay.com',
          'https://lumberjack.razorpay.com',
          'https://*.razorpay.com',
        ],
        imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'http:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      },
    },
  })
);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev
    },
    credentials: true,
  })
);

// Rate Limiting (1000 requests per 15 mins)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', limiter);

// Body and Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static folder for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ONLINE',
    service: 'Wear & Go E-Commerce Backend',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Google Site Verification Route
app.get('/google30dd34e798d48329.html', (req, res) => {
  res.type('text/html');
  res.send('google-site-verification: google30dd34e798d48329.html');
});

// Robots.txt Route
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /orders
Disallow: /api/

Sitemap: https://wearandgo.onrender.com/sitemap.xml
`);
});

// Dynamic SEO Sitemap XML
app.get('/sitemap.xml', async (req, res) => {
  try {
    const baseUrl = 'https://wearandgo.onrender.com';
    const staticUrls = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/shop`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/shop?gender=men`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/shop?gender=women`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/shop?newArrival=true`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/shop?bestseller=true`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/shop?discountOnly=true`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/about`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/policies/shipping`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/policies/returns`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/policies/terms`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/policies/privacy`, priority: '0.5', changefreq: 'monthly' },
    ];

    let categoryUrls = [];
    try {
      const Category = require('./models/Category');
      const categories = await Category.find({ isActive: { $ne: false } }).select('slug updatedAt').lean();
      categoryUrls = categories.map((cat) => ({
        loc: `${baseUrl}/category/${cat.slug}`,
        priority: '0.85',
        changefreq: 'daily',
        lastmod: cat.updatedAt ? new Date(cat.updatedAt).toISOString().split('T')[0] : '2026-10-03',
      }));
    } catch (e) {
      console.warn('Category fetch for sitemap failed:', e.message);
    }

    let productUrls = [];
    try {
      const Product = require('./models/Product');
      const products = await Product.find({ status: { $ne: 'archived' } }).select('slug images name updatedAt').lean();
      productUrls = products.map((prod) => ({
        loc: `${baseUrl}/product/${prod.slug}`,
        priority: '0.75',
        changefreq: 'weekly',
        lastmod: prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : '2026-10-03',
        image: prod.images?.[0]?.url || null,
        title: prod.name || null,
      }));
    } catch (e) {
      console.warn('Product fetch for sitemap failed:', e.message);
    }

    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    for (const url of staticUrls) {
      xml += `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>\n`;
    }

    for (const url of categoryUrls) {
      xml += `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>\n`;
    }

    for (const url of productUrls) {
      xml += `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${url.lastmod}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n`;
      if (url.image) {
        xml += `    <image:image>\n      <image:loc>${encodeURI(url.image)}</image:loc>\n      <image:title>${(url.title || '').replace(/[<>&'"]/g, '')}</image:title>\n    </image:image>\n`;
      }
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.status(200).send(xml);
  } catch (err) {
    console.error('Sitemap generation error:', err);
    const staticSitemap = path.join(__dirname, '..', 'frontend', 'public', 'sitemap.xml');
    if (fs.existsSync(staticSitemap)) {
      res.setHeader('Content-Type', 'application/xml');
      return res.sendFile(staticSitemap);
    }
    return res.status(500).send('Error generating sitemap');
  }
});

// Serve frontend in production (Render single-service deployment)
const fs = require('fs');
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
}

const frontendPublic = path.join(__dirname, '..', 'frontend', 'public');
if (fs.existsSync(frontendPublic)) {
  app.use(express.static(frontendPublic));
}

app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  if (fs.existsSync(path.join(frontendDist, 'index.html'))) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  next();
});

// 404 Route Handler for undefined API endpoints
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.originalUrl}`,
  });
});

app.use('*', (req, res) => {
  if (fs.existsSync(frontendDist)) {
    return res.sendFile(path.join(frontendDist, 'index.html'));
  }
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
});

// Central Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect Database and Start Server
let server;
connectDB().then(async () => {
  try {
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('📦 Empty database detected. Auto-seeding initial store catalog...');
      const { seedData } = require('./utils/seedData');
      await seedData();
    }
  } catch (seedErr) {
    console.warn('⚠️ Auto-seed check notice:', seedErr.message);
  }

  server = app.listen(PORT, () => {
    console.log(`🚀 Wear & Go Server listening in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
  });
});

// Handle unhandled promise rejections gracefully
process.on('unhandledRejection', (err) => {
  console.error(`⚠️ Unhandled Rejection Warning: ${err.message}`);
});

process.on('uncaughtException', (err) => {
  console.error(`⚠️ Uncaught Exception Warning: ${err.message}`);
});
