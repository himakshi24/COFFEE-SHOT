/**
 * @openapi
 * /api/event-launch-requests:
 *   get:
 *     summary: Get all event launch requests (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Event launch requests list
 *   post:
 *     summary: Submit an event launch request
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hostName
 *               - email
 *               - phone
 *               - title
 *               - description
 *               - date
 *               - time
 *               - location
 *             properties:
 *               hostName:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *               time:
 *                 type: string
 *               location:
 *                 type: string
 *               expectedGuests:
 *                 type: number
 *     responses:
 *       201:
 *         description: Launch request created
 */
const express = require('express');
const router = express.Router();
const EventLaunchRequest = require('../models/EventLaunchRequest');
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const requests = await EventLaunchRequest.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const requests = await EventLaunchRequest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const {
      hostName,
      email,
      phone,
      title,
      description,
      date,
      time,
      location,
      expectedGuests,
    } = req.body;

    if (!hostName || !email || !phone || !title || !description || !date || !time || !location) {
      return res.status(400).json({
        success: false,
        message: 'All required event launch fields are required.',
      });
    }

    const request = await EventLaunchRequest.create({
      userId: req.user._id,
      hostName,
      email,
      phone,
      title,
      description,
      date,
      time,
      location,
      expectedGuests: expectedGuests || 0,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Event launch request sent to admin for approval.',
      data: request,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:id/approve', protect, adminOnly, async (req, res) => {
  try {
    const request = await EventLaunchRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Launch request not found.' });
    }

    if (request.status === 'approved') {
      return res.status(400).json({ success: false, message: 'This launch request is already approved.' });
    }

    const newEvent = await Event.create({
      title: request.title,
      description: request.description,
      date: new Date(`${request.date}T${request.time || '00:00:00'}`),
      location: request.location,
      image: '',
      isFeatured: true,
    });

    request.status = 'approved';
    request.adminNotes = req.body.adminNotes || 'Approved by admin';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Launch request approved and event created.',
      data: {
        request,
        event: newEvent,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch('/:id/reject', protect, adminOnly, async (req, res) => {
  try {
    const request = await EventLaunchRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'rejected',
        adminNotes: req.body.adminNotes || 'Rejected by admin',
      },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ success: false, message: 'Launch request not found.' });
    }

    res.status(200).json({ success: true, message: 'Launch request rejected.', data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
