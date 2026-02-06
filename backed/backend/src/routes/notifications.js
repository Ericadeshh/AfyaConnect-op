const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @route   POST /api/notifications
// @desc    Create notification
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const notification = new Notification({
      ...req.body,
      userId: req.body.userId || req.user._id
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    logger.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating notification'
    });
  }
});

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { isRead, type, page = 1, limit = 20 } = req.query;
    let query = { userId: req.user._id };

    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      userId: req.user._id, 
      isRead: false 
    });

    res.json({
      success: true,
      data: {
        notifications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
        unreadCount
      }
    });
  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    logger.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating notification'
    });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    logger.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating notifications'
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting notification'
    });
  }
});

module.exports = router;
