const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Order = require('../models/Order');

const seedAll = async () => {
  try {
    console.log('🌱 Starting Wear & Go Database Seeder...');
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Clear existing records
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Banner.deleteMany(),
      Coupon.deleteMany(),
      Review.deleteMany(),
      Order.deleteMany(),
    ]);

    console.log('🧹 Cleaned existing database collections.');

    // 1. Create Users
    console.log('👤 Creating Admin and Sample Customer accounts...');
    const adminUser = await User.create({
      name: 'Wear & Go Admin',
      email: 'admin@wearandgo.com',
      password: 'Admin@123456',
      role: 'admin',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      addresses: [
        {
          fullName: 'Wear & Go Headquarters',
          phone: '+91 98765 43210',
          email: 'admin@wearandgo.com',
          houseBuilding: 'Unit 402, Fashion Tower',
          street: 'Linking Road',
          area: 'Santacruz West',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400054',
          landmark: 'Opposite Fashion Square',
          isDefault: true,
        },
      ],
    });

    const customerUser = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      password: 'User@123456',
      role: 'user',
      phone: '+91 98123 45678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      addresses: [
        {
          fullName: 'Rahul Sharma',
          phone: '+91 98123 45678',
          email: 'rahul@example.com',
          houseBuilding: 'Flat 304, Green Heights',
          street: '14th Cross, Indiranagar',
          area: 'Indiranagar 1st Stage',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560038',
          landmark: 'Near Metro Station',
          isDefault: true,
        },
      ],
    });

    // 2. Create Categories
    console.log('🏷️ Creating Fashion Categories...');
    const categoriesData = [
      {
        name: "Men's Fashion",
        slug: 'mens-fashion',
        description: 'Premium casuals, streetwear, formal shirts, and tailored essentials for men.',
        image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
        icon: 'Shirt',
        featured: true,
      },
      {
        name: "Women's Fashion",
        slug: 'womens-fashion',
        description: 'Contemporary western wear, co-ords, elegant dresses, and chic ethnic fusion.',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
        icon: 'Sparkles',
        featured: true,
      },
      {
        name: 'Kids Wear',
        slug: 'kids-wear',
        description: 'Vibrant, ultra-comfortable, and durable fashion apparel for young trendsetters.',
        image: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=800&q=80',
        icon: 'Smile',
        featured: true,
      },
      {
        name: 'Premium Footwear',
        slug: 'footwear',
        description: 'Handcrafted leather sneakers, slip-ons, and athletic shoes engineered for comfort.',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
        icon: 'Footprints',
        featured: true,
      },
      {
        name: 'Fashion Accessories',
        slug: 'accessories',
        description: 'Minimalist leather bags, sunglasses, premium belts, and urban caps.',
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
        icon: 'Watch',
        featured: true,
      },
      {
        name: 'Winter & Outerwear',
        slug: 'winterwear',
        description: 'Heavyweight hoodies, bomber jackets, trench coats, and cozy thermal wear.',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        icon: 'CloudSnow',
        featured: true,
      },
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((cat) => {
      catMap[cat.slug] = cat._id;
    });

    // 3. Create Products
    console.log('👗 Creating Real Fashion Products with Variants...');
    const productsData = [
      {
        name: 'Oversized Heavyweight Cotton Graphic Tee',
        slug: 'oversized-heavyweight-cotton-graphic-tee',
        description: 'Crafted from 240 GSM French Terry 100% combed cotton. Features dropped shoulders, a ribbed crew neckline, and a minimalist typography graphic inspired by urban Tokyo streetwear.',
        brand: 'Wear & Go Luxe',
        category: catMap['mens-fashion'],
        categorySlug: 'mens-fashion',
        subcategory: 'T-Shirts',
        gender: 'men',
        price: 1799,
        discountPrice: 999,
        discountPercentage: 44,
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Onyx Black', hex: '#111827' },
          { name: 'Chalk White', hex: '#F9FAFB' },
          { name: 'Sage Green', hex: '#4B5563' },
        ],
        SKU: 'WG-MEN-TEE-001',
        stock: 45,
        soldCount: 128,
        rating: 4.8,
        reviewCount: 34,
        tags: ['oversized', 'tshirt', 'streetwear', 'cotton', 'summer'],
        specifications: [
          { name: 'Fabric', value: '100% Combed Cotton, 240 GSM' },
          { name: 'Fit', value: 'Relaxed Oversized Fit' },
          { name: 'Wash Care', value: 'Machine wash cold, inside out' },
          { name: 'Country of Origin', value: 'India' },
        ],
        featured: true,
        bestseller: true,
        newArrival: true,
        status: 'active',
      },
      {
        name: 'Structured Linen Blend Relaxed Resort Shirt',
        slug: 'structured-linen-blend-relaxed-resort-shirt',
        description: 'Breezy Cuban collar linen shirt tailored for balmy tropical evenings and weekend getaways. Breathable blend ensures wrinkle-resistance while maintaining an effortless drape.',
        brand: 'Wear & Go Casuals',
        category: catMap['mens-fashion'],
        categorySlug: 'mens-fashion',
        subcategory: 'Shirts',
        gender: 'men',
        price: 2499,
        discountPrice: 1499,
        discountPercentage: 40,
        images: [
          'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['M', 'L', 'XL'],
        colors: [
          { name: 'Sand Beige', hex: '#D2B48C' },
          { name: 'Navy Blue', hex: '#1E3A8A' },
          { name: 'Olive Green', hex: '#556B2F' },
        ],
        SKU: 'WG-MEN-SHIRT-002',
        stock: 28,
        soldCount: 92,
        rating: 4.7,
        reviewCount: 19,
        tags: ['shirt', 'linen', 'resort', 'vacation', 'summer'],
        specifications: [
          { name: 'Fabric', value: '60% French Linen, 40% Cotton' },
          { name: 'Collar', value: 'Cuban / Camp Collar' },
          { name: 'Origin', value: 'India' },
        ],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
      },
      {
        name: 'Relaxed Tapered Pleated Chino Trousers',
        slug: 'relaxed-tapered-pleated-chino-trousers',
        description: 'A modern silhouette with single front pleats, mid-rise waist, and clean tapered ankles. Made from cotton twill with 2% elastane for seamless all-day movement.',
        brand: 'Wear & Go Tailored',
        category: catMap['mens-fashion'],
        categorySlug: 'mens-fashion',
        subcategory: 'Trousers',
        gender: 'men',
        price: 2999,
        discountPrice: 1899,
        discountPercentage: 36,
        images: [
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Charcoal Grey', hex: '#374151' },
          { name: 'Classic Khaki', hex: '#C2B280' },
        ],
        SKU: 'WG-MEN-TROU-003',
        stock: 18,
        soldCount: 65,
        rating: 4.6,
        reviewCount: 14,
        tags: ['trousers', 'chinos', 'smart casual', 'pleated'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
      },
      {
        name: 'Tiered Meadow Floral Wrap Midi Dress',
        slug: 'tiered-meadow-floral-wrap-midi-dress',
        description: 'Ethereal silhouette with delicate flutter sleeves, a self-tie waist sash, and a flowing tiered hemline. Made from ultra-soft viscose chiffon with breathable cotton lining.',
        brand: 'Wear & Go Femme',
        category: catMap['womens-fashion'],
        categorySlug: 'womens-fashion',
        subcategory: 'Dresses',
        gender: 'women',
        price: 3299,
        discountPrice: 1999,
        discountPercentage: 39,
        images: [
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Blush Pink', hex: '#FBCFE8' },
          { name: 'Sage Floral', hex: '#D1FAE5' },
        ],
        SKU: 'WG-WOM-DRESS-001',
        stock: 30,
        soldCount: 142,
        rating: 4.9,
        reviewCount: 48,
        tags: ['dress', 'floral', 'midi', 'summer', 'wrap dress'],
        specifications: [
          { name: 'Material', value: '100% Breathable Rayon Viscose' },
          { name: 'Length', value: 'Midi (46 inches)' },
          { name: 'Occasion', value: 'Brunch, Casual, Vacation' },
        ],
        featured: true,
        bestseller: true,
        newArrival: true,
        status: 'active',
      },
      {
        name: 'Ribbed Knit Cropped Cardigan & Camisole Set',
        slug: 'ribbed-knit-cropped-cardigan-camisole-set',
        description: 'Two-piece matching ensemble featuring a sculpted square-neck cami and an ultra-soft buttoned cropped cardigan. Versatile essential for contemporary layering.',
        brand: 'Wear & Go Femme',
        category: catMap['womens-fashion'],
        categorySlug: 'womens-fashion',
        subcategory: 'Knitwear',
        gender: 'women',
        price: 2499,
        discountPrice: 1399,
        discountPercentage: 44,
        images: [
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['XS', 'S', 'M', 'L'],
        colors: [
          { name: 'Oatmeal Heather', hex: '#E5E7EB' },
          { name: 'Lavender Mist', hex: '#E9D5FF' },
          { name: 'Midnight Black', hex: '#111827' },
        ],
        SKU: 'WG-WOM-KNIT-002',
        stock: 22,
        soldCount: 88,
        rating: 4.8,
        reviewCount: 22,
        tags: ['co-ord', 'knitwear', 'cardigan', 'trendy'],
        featured: true,
        bestseller: false,
        newArrival: true,
        status: 'active',
      },
      {
        name: 'High-Waist Wide-Leg Fluid Cargo Trousers',
        slug: 'high-waist-wide-leg-fluid-cargo-trousers',
        description: 'Utilitarian chic meets tailored perfection. Crafted with deep gusseted flap pockets, an elasticated back waistband, and an elongated fluid drape.',
        brand: 'Wear & Go Femme',
        category: catMap['womens-fashion'],
        categorySlug: 'womens-fashion',
        subcategory: 'Trousers',
        gender: 'women',
        price: 2799,
        discountPrice: 1699,
        discountPercentage: 39,
        images: [
          'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Olive Army', hex: '#4B5320' },
          { name: 'Warm Taupe', hex: '#B38B6D' },
        ],
        SKU: 'WG-WOM-CARGO-003',
        stock: 15,
        soldCount: 76,
        rating: 4.7,
        reviewCount: 17,
        tags: ['cargo', 'wide leg', 'streetwear', 'high waist'],
        featured: false,
        bestseller: true,
        newArrival: false,
        status: 'active',
      },
      {
        name: 'Kids 100% Organic Cotton Playtime Dungaree Set',
        slug: 'kids-100-organic-cotton-playtime-dungaree-set',
        description: 'Supremely soft GOTS-certified organic cotton dungarees paired with a breathable striped inner tee. Adjustable shoulder straps accommodate growing kids.',
        brand: 'Wear & Go Kids',
        category: catMap['kids-wear'],
        categorySlug: 'kids-wear',
        subcategory: 'Sets',
        gender: 'kids',
        price: 1899,
        discountPrice: 1099,
        discountPercentage: 42,
        images: [
          'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['S', 'M', 'L'],
        colors: [
          { name: 'Mustard Yellow', hex: '#F59E0B' },
          { name: 'Denim Indigo', hex: '#3B82F6' },
        ],
        SKU: 'WG-KID-DUN-001',
        stock: 35,
        soldCount: 95,
        rating: 4.9,
        reviewCount: 29,
        tags: ['kids', 'dungarees', 'organic', 'comfortable'],
        featured: true,
        bestseller: true,
        newArrival: true,
        status: 'active',
      },
      {
        name: 'Kids Colorblock Windbreaker Hooded Jacket',
        slug: 'kids-colorblock-windbreaker-hooded-jacket',
        description: 'Lightweight water-repellent jacket featuring bright retro colorblocking, elasticated storm cuffs, and breathable mesh lining for outdoor playground adventures.',
        brand: 'Wear & Go Kids',
        category: catMap['kids-wear'],
        categorySlug: 'kids-wear',
        subcategory: 'Jackets',
        gender: 'kids',
        price: 2199,
        discountPrice: 1299,
        discountPercentage: 40,
        images: [
          'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Cobalt Multi', hex: '#2563EB' },
        ],
        SKU: 'WG-KID-JACK-002',
        stock: 25,
        soldCount: 54,
        rating: 4.8,
        reviewCount: 11,
        tags: ['kids', 'jacket', 'windbreaker', 'waterproof'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
      },
      {
        name: 'Minimalist Handcrafted Nappa Leather Sneakers',
        slug: 'minimalist-handcrafted-nappa-leather-sneakers',
        description: 'Pared-back luxury low-top sneakers fashioned from full-grain supple leather. Features an ultra-cushioned memory foam footbed and durable vulcanized rubber soles.',
        brand: 'Wear & Go Footwear',
        category: catMap['footwear'],
        categorySlug: 'footwear',
        subcategory: 'Sneakers',
        gender: 'unisex',
        price: 4999,
        discountPrice: 2999,
        discountPercentage: 40,
        images: [
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Triple White', hex: '#FFFFFF' },
          { name: 'Matte Black', hex: '#18181B' },
        ],
        SKU: 'WG-FOOT-SNEAK-001',
        stock: 20,
        soldCount: 110,
        rating: 4.9,
        reviewCount: 42,
        tags: ['sneakers', 'leather', 'shoes', 'minimalist', 'white sneakers'],
        specifications: [
          { name: 'Upper', value: '100% Genuine Nappa Leather' },
          { name: 'Sole', value: 'High-Density Anti-Slip Rubber' },
          { name: 'Insole', value: 'Orthopedic Memory Cushion' },
        ],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
      },
      {
        name: 'Suede Penny Loafers with Blake Stitching',
        slug: 'suede-penny-loafers-with-blake-stitching',
        description: 'Refined Italian suede loafers with traditional hand-stitched apron detailing. Perfect for business meetings, weddings, and upscale evening gatherings.',
        brand: 'Wear & Go Footwear',
        category: catMap['footwear'],
        categorySlug: 'footwear',
        subcategory: 'Loafers',
        gender: 'men',
        price: 4499,
        discountPrice: 2799,
        discountPercentage: 37,
        images: [
          'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['M', 'L', 'XL'],
        colors: [
          { name: 'Snuff Brown', hex: '#78350F' },
          { name: 'Midnight Navy', hex: '#1E293B' },
        ],
        SKU: 'WG-FOOT-LOAF-002',
        stock: 12,
        soldCount: 48,
        rating: 4.7,
        reviewCount: 16,
        tags: ['loafers', 'suede', 'formal', 'shoes'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
      },
      {
        name: 'Full-Grain Leather Crossbody Messenger Sling',
        slug: 'full-grain-leather-crossbody-messenger-sling',
        description: 'Compact everyday carry bag with dedicated iPad compartment, magnetic quick-release buckle, and water-resistant YKK zippers.',
        brand: 'Wear & Go Goods',
        category: catMap['accessories'],
        categorySlug: 'accessories',
        subcategory: 'Bags',
        gender: 'unisex',
        price: 2999,
        discountPrice: 1799,
        discountPercentage: 40,
        images: [
          'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['FREE'],
        colors: [
          { name: 'Cognac Brown', hex: '#92400E' },
          { name: 'Stealth Black', hex: '#0F172A' },
        ],
        SKU: 'WG-ACC-BAG-001',
        stock: 25,
        soldCount: 82,
        rating: 4.8,
        reviewCount: 30,
        tags: ['bag', 'crossbody', 'leather', 'accessories', 'everyday carry'],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
      },
      {
        name: 'Vintage Acetate Polarized Sunglasses',
        slug: 'vintage-acetate-polarized-sunglasses',
        description: 'Handcrafted cellulose acetate frame with UV400 polarized mineral glass lenses. Delivers crystal-clear vision with 100% harmful UVA/UVB protection.',
        brand: 'Wear & Go Eyewear',
        category: catMap['accessories'],
        categorySlug: 'accessories',
        subcategory: 'Eyewear',
        gender: 'unisex',
        price: 2199,
        discountPrice: 1299,
        discountPercentage: 40,
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['FREE'],
        colors: [
          { name: 'Tortoiseshell', hex: '#78350F' },
          { name: 'Gloss Black', hex: '#000000' },
        ],
        SKU: 'WG-ACC-SUN-002',
        stock: 40,
        soldCount: 140,
        rating: 4.9,
        reviewCount: 37,
        tags: ['sunglasses', 'polarized', 'vintage', 'accessories'],
        featured: false,
        bestseller: true,
        newArrival: true,
        status: 'active',
      },
      {
        name: 'Ultra-Warm 450 GSM Heavy French Terry Hoodie',
        slug: 'ultra-warm-450-gsm-heavy-french-terry-hoodie',
        description: 'Engineered for chilly winters and cozy layering. Double-layered hood without drawstrings for a streamlined clean look, deep kangaroo pouch, and reinforced ribbed cuffs.',
        brand: 'Wear & Go Luxe',
        category: catMap['winterwear'],
        categorySlug: 'winterwear',
        subcategory: 'Hoodies',
        gender: 'unisex',
        price: 3499,
        discountPrice: 2199,
        discountPercentage: 37,
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: [
          { name: 'Slate Grey', hex: '#64748B' },
          { name: 'Deep Forest', hex: '#14532D' },
          { name: 'Pitch Black', hex: '#0F172A' },
        ],
        SKU: 'WG-WIN-HOOD-001',
        stock: 30,
        soldCount: 185,
        rating: 4.9,
        reviewCount: 63,
        tags: ['hoodie', 'winter', 'heavyweight', 'streetwear', 'fleece'],
        specifications: [
          { name: 'Weight', value: '450 GSM Heavy French Terry' },
          { name: 'Fit', value: 'Boxy Relaxed' },
          { name: 'Origin', value: 'Ludhiana, India' },
        ],
        featured: true,
        bestseller: true,
        newArrival: true,
        status: 'active',
      },
      {
        name: 'Quilted Lightweight Packable Puffer Jacket',
        slug: 'quilted-lightweight-packable-puffer-jacket',
        description: 'Thermal insulation down jacket compressible into its own pocket pouch. Wind-proof nylon shell with storm collar and water-resistant finish.',
        brand: 'Wear & Go Outerwear',
        category: catMap['winterwear'],
        categorySlug: 'winterwear',
        subcategory: 'Jackets',
        gender: 'men',
        price: 4999,
        discountPrice: 2999,
        discountPercentage: 40,
        images: [
          'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['M', 'L', 'XL'],
        colors: [
          { name: 'Matte Navy', hex: '#1E3A8A' },
          { name: 'Jet Black', hex: '#111827' },
        ],
        SKU: 'WG-WIN-PUFF-002',
        stock: 16,
        soldCount: 72,
        rating: 4.8,
        reviewCount: 20,
        tags: ['puffer', 'jacket', 'winter', 'packable', 'thermal'],
        featured: false,
        bestseller: false,
        newArrival: true,
        status: 'active',
      },
      {
        name: 'Classic Cable Knit Wool Blend Crewneck Sweater',
        slug: 'classic-cable-knit-wool-blend-crewneck-sweater',
        description: 'Traditional heritage cable patterning crafted from a cozy merino wool and cashmere blend. Warm, breathable, and exceptionally soft against the skin.',
        brand: 'Wear & Go Outerwear',
        category: catMap['winterwear'],
        categorySlug: 'winterwear',
        subcategory: 'Sweaters',
        gender: 'women',
        price: 3799,
        discountPrice: 2399,
        discountPercentage: 36,
        images: [
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['XS', 'S', 'M', 'L'],
        colors: [
          { name: 'Cream Ivory', hex: '#FEF3C7' },
          { name: 'Burgundy Wine', hex: '#881337' },
        ],
        SKU: 'WG-WIN-SWEAT-003',
        stock: 4, // Intentionally low stock to test low-stock badge
        soldCount: 94,
        rating: 4.7,
        reviewCount: 28,
        tags: ['sweater', 'cable knit', 'wool', 'winter'],
        featured: true,
        bestseller: false,
        newArrival: false,
        status: 'active',
      },
      {
        name: 'Tailored Single-Breasted Camel Wool Overcoat',
        slug: 'tailored-single-breasted-camel-wool-overcoat',
        description: 'Impeccably tailored longline overcoat with notched lapels, horn button closures, and silky cupro interior lining. The pinnacle of timeless winter sophistication.',
        brand: 'Wear & Go Luxe',
        category: catMap['mens-fashion'],
        categorySlug: 'mens-fashion',
        subcategory: 'Coats',
        gender: 'men',
        price: 6999,
        discountPrice: 4499,
        discountPercentage: 35,
        images: [
          'https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=800&q=80',
        ],
        sizes: ['M', 'L', 'XL'],
        colors: [
          { name: 'Royal Camel', hex: '#C19A6B' },
          { name: 'Charcoal Black', hex: '#1F2937' },
        ],
        SKU: 'WG-MEN-COAT-004',
        stock: 8,
        soldCount: 41,
        rating: 4.9,
        reviewCount: 15,
        tags: ['overcoat', 'coat', 'winter', 'wool', 'tailored'],
        featured: true,
        bestseller: true,
        newArrival: false,
        status: 'active',
      },
    ];

    const insertedProducts = await Product.insertMany(productsData);

    // 4. Create Homepage Banners
    console.log('🖼️ Creating Dynamic Homepage Banners...');
    const bannersData = [
      {
        title: 'ELEVATE YOUR EVERYDAY',
        subtitle: 'Style That Moves With You. Discover the all-new 2026 Season Collection.',
        badge: 'NEW ARRIVALS 2026',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=85',
        buttonText: 'SHOP MEN',
        buttonLink: '/shop?gender=men',
        priority: 1,
        active: true,
      },
      {
        title: 'CONTEMPORARY LUXURY EDIT',
        subtitle: 'Minimalist tailoring, organic fabrics, and versatile silhouettes crafted to perfection.',
        badge: 'CURATED WOMEN',
        image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=85',
        buttonText: 'SHOP WOMEN',
        buttonLink: '/shop?gender=women',
        priority: 2,
        active: true,
      },
      {
        title: 'FESTIVE SALE — UP TO 50% OFF',
        subtitle: 'Celebrate in unmatched elegance with exclusive discounts across trending fashion.',
        badge: 'LIMITED TIME DEAL',
        image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=85',
        buttonText: 'EXPLORE OFFERS',
        buttonLink: '/shop?discountOnly=true',
        priority: 3,
        active: true,
      },
    ];

    await Banner.insertMany(bannersData);

    // 5. Create Promotional Coupons
    console.log('🎟️ Creating Promotional Coupons...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 90);

    const couponsData = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minimumOrderValue: 999,
        maximumDiscount: 500,
        expiryDate: futureDate,
        usageLimit: 5000,
        perUserLimit: 1,
        active: true,
      },
      {
        code: 'STYLE20',
        discountType: 'percentage',
        discountValue: 20,
        minimumOrderValue: 1999,
        maximumDiscount: 800,
        expiryDate: futureDate,
        usageLimit: 2000,
        perUserLimit: 1,
        active: true,
      },
      {
        code: 'FLAT500',
        discountType: 'fixed',
        discountValue: 500,
        minimumOrderValue: 2999,
        maximumDiscount: 500,
        expiryDate: futureDate,
        usageLimit: 1000,
        perUserLimit: 1,
        active: true,
      },
    ];

    await Coupon.insertMany(couponsData);

    // 6. Create Verified Reviews
    console.log('⭐ Creating Customer Reviews...');
    const firstProduct = insertedProducts[0];
    const secondProduct = insertedProducts[3];

    const reviewsData = [
      {
        product: firstProduct._id,
        user: customerUser._id,
        userName: customerUser.name,
        rating: 5,
        title: 'Exceptional 240 GSM Fabric Quality!',
        comment: 'The oversized fit is perfect. The fabric feels heavy and luxurious, exactly as promised. Washed twice with zero shrinkage.',
        verifiedPurchase: true,
        isApproved: true,
      },
      {
        product: secondProduct._id,
        user: customerUser._id,
        userName: customerUser.name,
        rating: 5,
        title: 'Stunning Floral Dress!',
        comment: 'Wore this for an outdoor brunch and received so many compliments. Beautiful wrap drape and comfortable lining.',
        verifiedPurchase: true,
        isApproved: true,
      },
    ];

    await Review.insertMany(reviewsData);

    // 7. Create a Sample Past Order for testing
    console.log('📦 Creating Sample Delivered Order...');
    const sampleOrder = await Order.create({
      orderId: 'WG982410',
      user: customerUser._id,
      items: [
        {
          product: firstProduct._id,
          name: firstProduct.name,
          image: firstProduct.images[0],
          size: 'L',
          color: 'Onyx Black',
          price: firstProduct.discountPrice,
          quantity: 1,
        },
        {
          product: secondProduct._id,
          name: secondProduct.name,
          image: secondProduct.images[0],
          size: 'M',
          color: 'Blush Pink',
          price: secondProduct.discountPrice,
          quantity: 1,
        },
      ],
      shippingAddress: customerUser.addresses[0],
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      subtotal: firstProduct.discountPrice + secondProduct.discountPrice,
      discount: 0,
      shipping: 0,
      tax: Math.round((firstProduct.discountPrice + secondProduct.discountPrice) * 0.05),
      total: Math.round((firstProduct.discountPrice + secondProduct.discountPrice) * 1.05),
      trackingNumber: 'DEL-IND-987654321',
      courierName: 'Delhivery Express',
      isPaid: true,
      paidAt: new Date(),
      isDelivered: true,
      deliveredAt: new Date(),
      timeline: [
        { status: 'PLACED', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), note: 'Order placed' },
        { status: 'CONFIRMED', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Order confirmed by store' },
        { status: 'PACKED', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Item packaged with care' },
        { status: 'SHIPPED', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Dispatched via Delhivery Express' },
        { status: 'OUT_FOR_DELIVERY', date: new Date(Date.now() - 6 * 60 * 60 * 1000), note: 'Out with delivery agent' },
        { status: 'DELIVERED', date: new Date(), note: 'Package delivered to recipient' },
      ],
    });

    console.log('🎉 Wear & Go Database Seeded Successfully!');
    console.log('----------------------------------------------------');
    console.log('👑 Admin Credentials:');
    console.log('   Email:    admin@wearandgo.com');
    console.log('   Password: Admin@123456');
    console.log('👤 Customer Credentials:');
    console.log('   Email:    rahul@example.com');
    console.log('   Password: User@123456');
    console.log('🎟️ Active Coupons: WELCOME10, STYLE20, FLAT500');
    console.log('----------------------------------------------------');

    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedAll();
}

module.exports = { seedData: seedAll };
