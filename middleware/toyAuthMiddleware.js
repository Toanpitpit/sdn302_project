const Toy = require('../models/Toys');

exports.checkToyOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User ID not found'
      });
    }

    const toy = await Toy.findById(id);
    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    if (userRole !== 'ADMIN' && userRole !== 'EMPLOYEE') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this toy'
      });
    }

    req.toy = toy;
    next();
  } catch (error) {
    next(error);
  }
};

exports.checkToyOwnershipByToyId = async (req, res, next) => {
  try {
    const { toyId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User ID not found'
      });
    }

    const toy = await Toy.findById(toyId);
    if (!toy) {
      return res.status(404).json({
        success: false,
        message: 'Toy not found'
      });
    }

    if (userRole !== 'ADMIN' && userRole !== 'EMPLOYEE') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this toy'
      });
    }

    req.toy = toy;
    next();
  } catch (error) {
    next(error);
  }
};

exports.requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized - Authentication required'
    });
  }
  next();
};


