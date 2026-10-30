/**
 * @openapi
 * /api/menu-reviews:
 *   get:
 *     summary: Get all menu reviews or reviews for one menu item
 *     parameters:
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *         description: Filter reviews by menu item id
 *     responses:
 *       200:
 *         description: Menu reviews list
 *   post:
 *     summary: Add a menu review
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - customer
 *               - rating
 *               - message
 *             properties:
 *               itemId:
 *                 type: string
 *               customer:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               message:
 *                 type: string
 */
const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const MenuReview = require('../models/MenuReview');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const { itemId } = req.query;
    const filter = itemId ? { itemId } : {};

    const reviews = await MenuReview.find(filter)
      .populate('itemId', 'name category')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @openapi
 * /api/menu-reviews/{id}:
 *   put:
 *     summary: Update a menu review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu review id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *               - message
 *             properties:
 *               customer:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Menu review updated successfully
 *   delete:
 *     summary: Delete a menu review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Menu review id
 *     responses:
 *       200:
 *         description: Menu review deleted successfully
 */
router.post('/', protect, async (req, res) => {
  try {
    const { itemId, customer, rating, message } = req.body;

    if (!itemId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Menu item and review message are required.',
      });
    }

    const reviewCustomer = (customer || req.user.name || '').trim();
    if (!reviewCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required.',
      });
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5.',
      });
    }

    const menuItemExists = await MenuItem.findById(itemId);
    if (!menuItemExists) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    const review = await MenuReview.create({
      userId: req.user._id,
      itemId,
      customer: reviewCustomer,
      rating: parsedRating,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Menu review added successfully.',
      data: review,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const { customer, rating, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Review message is required.',
      });
    }

    const review = await MenuReview.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own review.',
      });
    }

    const parsedRating = Number(rating);
    if (!Number.isFinite(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5.',
      });
    }

    review.customer = (customer || req.user.name || '').trim() || review.customer;
    review.rating = parsedRating;
    review.message = message.trim();
    await review.save();

    return res.status(200).json({
      success: true,
      message: 'Menu review updated successfully.',
      data: review,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await MenuReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own review.',
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Menu review deleted successfully.',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
