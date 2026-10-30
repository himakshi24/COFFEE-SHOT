/**
 * @openapi
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     responses:
 *       200:
 *         description: List of orders
 *   post:
 *     summary: Create or place a food order
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               customerName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [cart, placed, preparing, completed]
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - itemId
 *                     - name
 *                     - price
 *                     - quantity
 *                   properties:
 *                     itemId:
 *                       type: string
 *                     name:
 *                       type: string
 *                     price:
 *                       type: number
 *                     quantity:
 *                       type: number
 *                     image:
 *                       type: string
 *     responses:
 *       201:
 *         description: Order created successfully
 * /api/orders/{id}:
 *   put:
 *     summary: Update an existing order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [cart, placed, preparing, completed]
 *               customerName:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Order updated successfully
 */
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const normalizeOrderItems = (items = []) => {
  return items.map((item) => {
    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || item.itemPrice || 0);

    return {
      itemId: String(item.itemId || item.id || item._id || ''),
      name: String(item.name || 'Food item'),
      price: Number.isFinite(price) ? price : 0,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      image: item.image || '',
    };
  });
};

router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { items = [], customerName = 'Guest', status = 'cart' } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one menu item is required to create an order.',
      });
    }

    const normalizedItems = normalizeOrderItems(items);
    const totalAmount = normalizedItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      customerName: String(customerName || 'Guest').trim() || 'Guest',
      items: normalizedItems,
      totalAmount,
      status,
    });

    return res.status(201).json({
      success: true,
      message: status === 'placed' ? 'Order placed successfully.' : 'Item added to cart.',
      data: order,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { status, items = [], customerName } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (Array.isArray(items) && items.length > 0) {
      const normalizedItems = normalizeOrderItems(items);
      order.items = normalizedItems;
      order.totalAmount = normalizedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
    }

    if (customerName) {
      order.customerName = String(customerName).trim() || 'Guest';
    }

    if (status) {
      order.status = status;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully.',
      data: order,
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
