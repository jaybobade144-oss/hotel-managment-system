const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { protect, admin } = require('../middleware/auth');

// @desc    Get all rooms (supports filter / search query)
// @route   GET /api/rooms
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, maxGuests, minPrice, maxPrice } = req.query;
    let query = {};

    if (type && type !== 'All') {
      query.type = type;
    }
    if (maxGuests) {
      query.maxGuests = { $gte: Number(maxGuests) };
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const rooms = await Room.find(query);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get room by ID
// @route   GET /api/rooms/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (room) {
      res.json(room);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { name, type, price, description, amenities, maxGuests, imageUrls } = req.body;

  try {
    const room = new Room({
      name,
      type,
      price,
      description,
      amenities: amenities || [],
      maxGuests,
      imageUrls: imageUrls || []
    });

    const createdRoom = await room.save();
    res.status(201).json(createdRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Update a room
// @route   PUT /api/rooms/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { name, type, price, description, amenities, maxGuests, imageUrls } = req.body;

  try {
    const room = await Room.findById(req.params.id);

    if (room) {
      room.name = name || room.name;
      room.type = type || room.type;
      room.price = price !== undefined ? price : room.price;
      room.description = description || room.description;
      room.amenities = amenities || room.amenities;
      room.maxGuests = maxGuests !== undefined ? maxGuests : room.maxGuests;
      room.imageUrls = imageUrls || room.imageUrls;

      const updatedRoom = await room.save();
      res.json(updatedRoom);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (room) {
      await Room.deleteOne({ _id: req.params.id });
      res.json({ message: 'Room removed successfully' });
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
