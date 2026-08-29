# Rentora frontend

React (Vite) app for the Rentora rental marketplace — matches the backend in `rentora-backend.zip`.

## Setup

```bash
npm install
cp .env.example .env      # point VITE_API_URL at your running backend
npm run dev                # http://localhost:5173
```

Make sure the backend (`rentora-backend`) is running first — this app talks to
`http://localhost:5000/api` by default.

## How it's organized

```
src/
  api/axios.js            single axios instance — attaches the JWT to every request
  context/AuthContext.jsx login/register/logout state, shared via useAuth()
  constants/bookingStatus.js  labels/colors for every status — mirrors the backend enum
  components/              shared UI: Navbar, ProtectedRoute, StatusBadge, BookingStepper, etc.
  pages/
    LandingPage, Login, Register, ListingsBrowse, ListingDetail   — public
    consumer/               MyBookings, BookingDetail (pay, return, dispute, review)
    renter/                 MyListings, CreateEditListing, IncomingBookings
    admin/                  AdminDashboard, PendingListings, UserManagement, DisputeResolution
  App.jsx                   all routes, wrapped in ProtectedRoute where a role is required
```

## Design notes

The palette is deliberately "ledger/vault" themed since the whole product is about a
held security deposit: ink navy for structure, brass/gold for anything money-or-deposit
related (deposit amounts, in-progress states), teal for settled/success, rust for disputes.
`BookingStepper` is the signature element — a stamped-ledger-style progress trail that
reads the same six-stage status enum as the backend.

## Known gaps (left for you to extend)

- Payment is simulated client-side (`BookingDetail.jsx` calls `create-order` then
  immediately `verify` with a mock payment ID) since there's no real gateway wired up yet —
  see the backend README for where to plug in Razorpay/Stripe.
- No image upload UI — listings take raw image URLs for now.
- No pagination controls on the browse page yet (the API supports `page`/`limit`, just not
  surfaced in the UI).
- This project was scaffolded without network access, so `npm install` has not been run or
  verified end-to-end — run it locally and report back if anything doesn't compile.
