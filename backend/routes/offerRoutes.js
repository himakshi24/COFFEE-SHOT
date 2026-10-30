const express = require('express');
const router = express.Router();
const Offer = require('../models/Offer');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/offers:
 *   get:
 *     summary: Get all offers
 *     responses:
 *       200:
 *         description: List of offers
 *   post:
 *     summary: Create an offer (admin only)
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
 *               - discountPercent
 *               - validUntil
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               discountPercent:
 *                 type: number
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Offer created
 */
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: offers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.status(201).json({ success: true, message: 'Offer created.', data: offer });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    return res.status(200).json({ success: true, message: 'Offer updated.', data: offer });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    return res.status(200).json({ success: true, message: 'Offer deleted.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
