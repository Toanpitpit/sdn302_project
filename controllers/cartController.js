const Cart = require('../models/Cart');
const Toy = require('../models/Toys');

// GET /api/cart - Lấy giỏ hàng của user
exports.getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ userId }).populate({
      path: 'items.toyId',
      select: 'title thumbnail pricePerHour depositValue status'
    });

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/cart - Thêm đồ chơi vào giỏ
exports.addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { toyId, quantity = 1, startDate, endDate } = req.body;

    const toy = await Toy.findById(toyId);
    if (!toy) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đồ chơi.' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(item => item.toyId.toString() === toyId);
    
    if (existingItemIndex > -1) {
      // Nếu đã có trong giỏ, cập nhật số lượng
      cart.items[existingItemIndex].quantity += quantity;
      if (startDate) cart.items[existingItemIndex].startDate = startDate;
      if (endDate) cart.items[existingItemIndex].endDate = endDate;
    } else {
      // Nếu chưa có, thêm mới
      cart.items.push({ toyId, quantity, startDate, endDate });
    }

    await cart.save();
    
    // Lấy lại giỏ hàng có populate
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.toyId',
      select: 'title thumbnail pricePerHour depositValue status'
    });

    res.status(200).json({
      success: true,
      message: 'Đã thêm vào giỏ hàng.',
      data: updatedCart
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/:itemId - Cập nhật số lượng hoặc ngày của item trong giỏ
exports.updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity, startDate, endDate } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại.' });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy item trong giỏ.' });
    }

    if (quantity !== undefined) item.quantity = quantity;
    if (startDate) item.startDate = startDate;
    if (endDate) item.endDate = endDate;

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cập nhật giỏ hàng thành công.',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/:itemId - Xóa một đồ chơi khỏi giỏ
exports.removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Giỏ hàng không tồn tại.' });
    }

    cart.items.pull(itemId);
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Đã xóa đồ chơi khỏi giỏ.',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart - Xóa toàn bộ giỏ hàng
exports.clearCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({
      success: true,
      message: 'Đã xóa toàn bộ giỏ hàng.',
      data: cart
    });
  } catch (error) {
    next(error);
  }
};
