const express = require('express');
const router = express.Router();
const EventBooking = require('../models/EventBooking');
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/event-bookings:
 *   get:
 *     summary: Get all event booking requests (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event bookings list
 *   post:
 *     summary: Submit an event booking request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - name
 *               - email
 *             properties:
 *               eventId:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               guestCount:
 *                 type: number
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking request created
 */
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await EventBooking.find().populate('eventId', 'title date location').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const bookings = await EventBooking.find({ userId: req.user._id })
      .populate('eventId', 'title date location')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { eventId, name, email, phone, guestCount, message } = req.body;

    if (!eventId || !name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Event, name and email are required.',
      });
    }

    const eventExists = await Event.findById(eventId);
    if (!eventExists) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const booking = await EventBooking.create({
      userId: req.user._id,
      eventId,
      name,
      email,
      phone,
      guestCount: guestCount || 1,
      message,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Event booking request sent to admin.',
      data: booking,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const booking = await EventBooking.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found.' });
    }

    res.status(200).json({ success: true, message: 'Booking approved.', data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const booking = await EventBooking.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking request not found.' });
    }

    res.status(200).json({ success: true, message: 'Booking rejected.', data: booking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
