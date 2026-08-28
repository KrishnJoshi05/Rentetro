# Rentora backend

Node/Express + MongoDB API for a three-role rental marketplace (admin, renter, consumer).

## Setup

```bash
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev            # requires nodemon (npm i -g nodemon), or use `npm start`
```

You'll need a running MongoDB instance — local (`mongod`) or a free Atlas cluster.

## Creating the first admin

There's no public "become admin" endpoint on purpose. After registering a normal
account, promote it manually in the Mongo shell / Compass:

```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

## Folder structure

```
models/       Mongoose schemas (User, Listing, Booking, Payment, Dispute, Review)
middleware/   auth.js — JWT verification + role-based authorize()
routes/       one file per resource, mounted in server.js
server.js     app entry point
```

## The booking state machine

`pending → confirmed → paid → active → returned → settled`
                                              ↘ `disputed` (if renter flags damage,
                                                 or either side escalates via /api/disputes)

This exact set of strings is exported from `models/Booking.js` as `BOOKING_STATUSES` —
reuse it (or copy the values) in your frontend constants file so the UI never drifts
out of sync with the backend.

## Payment integration

`routes/paymentRoutes.js` is deliberately mocked — it creates `Payment` documents and
moves them through `created → captured/held → refunded` without calling a real gateway.
The comments mark exactly where to drop in Razorpay or Stripe calls. Use each gateway's
**authorize-then-capture** flow for the deposit specifically, so it's held rather than
charged — that's what makes the "security deposit" behave like an actual deposit instead
of a second payment you have to manually refund later.

## Not included (left for you to build)

- Image upload handling (wire up `multer` + Cloudinary/S3, store the resulting URLs in
  `Listing.images`)
- Rate limiting / input validation library (e.g. `express-validator`)
- Email/SMS notifications on status changes
- Frontend (see the earlier `rentora-api-and-components.md` for the React breakdown)
