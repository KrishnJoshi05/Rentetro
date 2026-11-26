const router = require('express').Router();
const Listing = require('../models/Listing');
const { authenticate, authorize, requireKyc } = require('../middleware/auth');
// GET /api/listings — public browse, search, filter
router.get('/', async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    const filter = { status: 'approved', isAvailable: true };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const listings = await Listing.find(filter)
      .populate('renter', 'name rating')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Listing.countDocuments(filter);
    res.json({ listings, total, page: Number(page) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch listings.', error: err.message });
  }
});

// GET /api/listings/mine — renter's own listings (any status)
router.get('/mine', authenticate, authorize('renter'), async (req, res) => {
  const listings = await Listing.find({ renter: req.user._id }).sort('-createdAt');
  res.json(listings);
});

// GET /api/listings/:id — public detail view
router.get('/:id', async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate('renter', 'name rating ratingCount');
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });
  res.json(listing);
});

// POST /api/listings — renter creates a new listing (goes to pending)
router.post('/', authenticate, authorize('renter'), requireKyc, async (req, res) => {
  try {
    const { title, description, category, images, pricePerDay, depositAmount } = req.body;

    const listing = await Listing.create({
      renter: req.user._id,
      title,
      description,
      category,
      images,
      pricePerDay,
      depositAmount,
      status: 'pending',
    });

    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create listing.', error: err.message });
  }
});

// PUT /api/listings/:id — renter edits own listing
router.put('/:id', authenticate, authorize('renter'), async (req, res) => {
  const listing = await Listing.findOne({ _id: req.params.id, renter: req.user._id });
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });

  const editable = ['title', 'description', 'category', 'images', 'pricePerDay', 'depositAmount', 'isAvailable'];
  editable.forEach((field) => {
    if (req.body[field] !== undefined) listing[field] = req.body[field];
  });

  // Edits to an existing listing send it back for admin review.
  if (listing.status !== 'pending') {
    listing.status = 'pending';
    listing.rejectionReason = undefined;
  }

  await listing.save();
  res.json(listing);
});

// DELETE /api/listings/:id — renter removes own listing
router.delete('/:id', authenticate, authorize('renter'), async (req, res) => {
  const listing = await Listing.findOneAndDelete({ _id: req.params.id, renter: req.user._id });
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });
  res.json({ message: 'Listing deleted.' });
});

module.exports = router;
