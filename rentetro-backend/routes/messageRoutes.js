const router = require('express').Router();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Listing = require('../models/Listing');
const { authenticate, authorize } = require('../middleware/auth');

// Only renters and consumers chat with each other (admins are not part of these threads)
router.use(authenticate, authorize('renter', 'consumer'));

const isParticipant = (conv, userId) =>
  String(conv.renter._id || conv.renter) === String(userId) ||
  String(conv.consumer._id || conv.consumer) === String(userId);

const unreadFor = (conv, user) =>
  user.role === 'renter' ? conv.renterUnread : conv.consumerUnread;

// POST /api/messages/conversations   { listingId }
// Consumer starts (or reopens) a chat with the renter of a listing.
router.post('/conversations', authorize('consumer'), async (req, res) => {
  try {
    const { listingId } = req.body;
    if (!mongoose.isValidObjectId(listingId)) {
      return res.status(400).json({ message: 'A valid listingId is required.' });
    }
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ message: 'Listing not found.' });

    const conversation = await Conversation.findOneAndUpdate(
      { listing: listing._id, consumer: req.user._id },
      { $setOnInsert: { renter: listing.renter } },
      { new: true, upsert: true }
    );
    res.status(201).json({ id: conversation._id });
  } catch (err) {
    res.status(500).json({ message: 'Could not start the conversation.', error: err.message });
  }
});

// GET /api/messages/conversations — my inbox, newest activity first
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find({
      $or: [{ renter: req.user._id }, { consumer: req.user._id }],
    })
      .sort('-lastMessageAt')
      .populate('listing', 'title images')
      .populate('renter', 'name')
      .populate('consumer', 'name');

    res.json(
      conversations.map((c) => ({
        id: c._id,
        listing: c.listing,
        otherName: req.user.role === 'renter' ? c.consumer?.name : c.renter?.name,
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt,
        unread: unreadFor(c, req.user),
      }))
    );
  } catch (err) {
    res.status(500).json({ message: 'Could not load conversations.', error: err.message });
  }
});

// GET /api/messages/unread-count — for the navbar badge
router.get('/unread-count', async (req, res) => {
  try {
    const field = req.user.role === 'renter' ? 'renterUnread' : 'consumerUnread';
    const mine = req.user.role === 'renter' ? { renter: req.user._id } : { consumer: req.user._id };
    const [row] = await Conversation.aggregate([
      { $match: mine },
      { $group: { _id: null, total: { $sum: `$${field}` } } },
    ]);
    res.json({ unread: row?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Could not load unread count.', error: err.message });
  }
});

// GET /api/messages/conversations/:id — thread + messages (also marks my side as read)
router.get('/conversations/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    const conversation = await Conversation.findById(req.params.id)
      .populate('listing', 'title images')
      .populate('renter', 'name')
      .populate('consumer', 'name');

    // 404 (not 403) so people can't probe which conversation ids exist
    if (!conversation || !isParticipant(conversation, req.user._id)) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    if (unreadFor(conversation, req.user) > 0) {
      const field = req.user.role === 'renter' ? 'renterUnread' : 'consumerUnread';
      await Conversation.updateOne({ _id: conversation._id }, { [field]: 0 });
    }

    // Latest 200 messages, oldest first
    const latest = await Message.find({ conversation: conversation._id })
      .sort('-createdAt')
      .limit(200);
    const messages = latest.reverse();

    res.json({
      id: conversation._id,
      listing: conversation.listing,
      otherName: req.user.role === 'renter' ? conversation.consumer?.name : conversation.renter?.name,
      messages: messages.map((m) => ({
        _id: m._id,
        text: m.text,
        createdAt: m.createdAt,
        mine: String(m.sender) === String(req.user._id),
      })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Could not load messages.', error: err.message });
  }
});

// POST /api/messages/conversations/:id/messages   { text }
router.post('/conversations/:id/messages', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }
    const text = String(req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Message cannot be empty.' });
    if (text.length > 2000) {
      return res.status(400).json({ message: 'Message is too long (max 2000 characters).' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation || !isParticipant(conversation, req.user._id)) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text,
    });

    // The other person gets +1 unread
    const otherUnreadField = req.user.role === 'renter' ? 'consumerUnread' : 'renterUnread';
    await Conversation.updateOne(
      { _id: conversation._id },
      {
        lastMessage: text.slice(0, 120),
        lastMessageAt: message.createdAt,
        $inc: { [otherUnreadField]: 1 },
      }
    );

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Could not send the message.', error: err.message });
  }
});

module.exports = router;