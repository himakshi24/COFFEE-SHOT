const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const { protect, adminOnly } = require('../middleware/authMiddleware');

/**
 * @openapi
 * /api/menu:
 *   get:
 *     summary: Get all menu items
 *     responses:
 *       200:
 *         description: List of menu items
 *   post:
 *     summary: Create a menu item (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Menu item created
 */
router.get('/', async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, message: 'Menu item created.', data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    return res.status(200).json({ success: true, message: 'Menu item updated.', data: item });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Menu item not found.' });
    }

    return res.status(200).json({ success: true, message: 'Menu item deleted.' });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
