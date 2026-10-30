/**
 * @openapi
 * /api/event-reviews:
 *   get:
 *     summary: Get all event reviews or reviews for one event
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filter reviews by event id
 *     responses:
 *       200:
 *         description: Reviews list
 *   post:
 *     summary: Add an event review
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - customer
 *               - rating
 *               - message
 *             properties:
 *               eventId:
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
const Event = require('../models/Event');
const EventReview = require('../models/EventReview');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { eventId } : {};

    const reviews = await EventReview.find(filter)
      .populate('eventId', 'title date location')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { eventId, customer, rating, message } = req.body;

    if (!eventId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Event and review message are required.',
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

    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const review = await EventReview.create({
      userId: req.user._id,
      eventId,
      customer: reviewCustomer,
      rating: parsedRating,
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Review added successfully.',
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

    const review = await EventReview.findById(req.params.id);
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
      message: 'Review updated successfully.',
      data: review,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await EventReview.findById(req.params.id);

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
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
