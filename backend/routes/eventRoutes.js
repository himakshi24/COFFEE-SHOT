const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const EventReview = require('../models/EventReview');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/events:
 *   get:
 *     summary: Get all events
 *     responses:
 *       200:
 *         description: List of events
 *   post:
 *     summary: Create an event (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - date
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created
 */
router.get('/', async (req, res) => {
  try {
    const [events, reviewStats] = await Promise.all([
      Event.find().sort({ date: 1 }),
      EventReview.aggregate([
        {
          $group: {
            _id: '$eventId',
            averageRating: { $avg: '$rating' },
            reviewCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const reviewMap = reviewStats.reduce((acc, stat) => {
      acc[String(stat._id)] = {
        rating: Number(stat.averageRating.toFixed(1)),
        reviewCount: stat.reviewCount,
      };
      return acc;
    }, {});

    const eventData = events.map((event) => {
      const eventObject = event.toObject();
      const stats = reviewMap[String(event._id)] || { rating: null, reviewCount: 0 };

      return {
        ...eventObject,
        rating: stats.rating,
        reviewCount: stats.reviewCount,
      };
    });

    res.status(200).json({ success: true, data: eventData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json({ success: true, message: 'Event created.', data: event });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    return res.status(200).json({ success: true, message: 'Event updated.', data: event });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    return res.status(200).json({ success: true, message: 'Event deleted.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
