const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/contact:
 *   get:
 *     summary: Get all contact messages (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of contact messages
 *   post:
 *     summary: Submit a contact form message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Contact message submitted
 */
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
    }

    const contact = await ContactMessage.create({ name, email, phone, message });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully.',
      data: contact,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    return res.status(200).json({ success: true, message: 'Message updated.', data: message });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    return res.status(200).json({ success: true, message: 'Message deleted.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
