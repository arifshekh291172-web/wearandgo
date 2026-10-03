const Cart = require('../models/Cart');
const Product = require('../models/Product');

// @desc    Get current user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercentage images stock SKU status',
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    // Filter out items where product may have been deleted or deactivated
    const validItems = cart.items.filter(
      (item) => item.product && item.product.status === 'active'
    );

    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body;

    if (!productId || !size) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and Size are required',
      });
    }

    const product = await Product.findById(productId);
    if (!product || product.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unavailable',
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items in stock`,
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if variant already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.size === size &&
        (item.color || 'Default') === (color || 'Default')
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity);
      if (newQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Maximum available stock is ${product.stock}`,
        });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        product: productId,
        size,
        color: color || 'Default',
        quantity: Number(quantity),
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercentage images stock SKU status',
    });

    res.status(200).json({
      success: true,
      message: 'Product added to cart',
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity or variant
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity, size, color } = req.body;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const product = await Product.findById(item.product);
    if (!product) {
      cart.items.pull(itemId);
      await cart.save();
      return res.status(404).json({ success: false, message: 'Product no longer exists' });
    }

    if (quantity !== undefined) {
      const parsedQty = parseInt(quantity, 10);
      if (parsedQty <= 0) {
        cart.items.pull(itemId);
      } else {
        if (parsedQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} items available in stock`,
          });
        }
        item.quantity = parsedQty;
      }
    }

    if (size) item.size = size;
    if (color) item.color = color;

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercentage images stock SKU status',
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated',
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items.pull(req.params.itemId);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercentage images stock SKU status',
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items in cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      cart: { items: [] },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Merge guest cart items into user cart on login
// @route   POST /api/cart/sync
// @access  Private
exports.syncCart = async (req, res, next) => {
  try {
    const { items = [] } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    for (const guestItem of items) {
      const prodId = guestItem.product?._id || guestItem.product || guestItem.productId;
      if (!prodId) continue;

      const product = await Product.findById(prodId);
      if (!product || product.stock <= 0) continue;

      const existingIndex = cart.items.findIndex(
        (i) =>
          i.product.toString() === prodId.toString() &&
          i.size === guestItem.size &&
          (i.color || 'Default') === (guestItem.color || 'Default')
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity = Math.min(
          product.stock,
          cart.items[existingIndex].quantity + (guestItem.quantity || 1)
        );
      } else {
        cart.items.push({
          product: prodId,
          size: guestItem.size || 'M',
          color: guestItem.color || 'Default',
          quantity: Math.min(product.stock, guestItem.quantity || 1),
        });
      }
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      select: 'name slug price discountPrice discountPercentage images stock SKU status',
    });

    res.status(200).json({
      success: true,
      message: 'Cart synchronized',
      cart: populatedCart,
    });
  } catch (error) {
    next(error);
  }
};
