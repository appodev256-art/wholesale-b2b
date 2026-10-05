# Wholesale B2B — Progress

## Status: V1 complete ✅

Live at: https://wholesale-b2b-brown.vercel.app
Repo: https://github.com/appodev256-art/wholesale-b2b

---

## What's built (V1)

### Authentication & roles
- Email/password sign-in via Firebase Auth
- Self-registration for two roles: wholesaler and retailer
- Role stored in `users/{uid}`; routing after sign-in depends on it
- `lastActiveAt` recorded on every sign-in (for future inactivity checks)

### Wholesaler flow
- Registers with email, password, shop name, owner name, WhatsApp number
- WhatsApp number is stripped to digits only (required for wa.me links)
- New wholesalers land on a **Pending approval** screen
- Once approved by admin, they get the full dashboard
- Rejected wholesalers see a distinct **Rejected** screen
- Can add products: name, price (UGX), unit, category, optional image URL
- Can see their own product list

### Retailer flow
- Registers with email + password
- No approval needed
- Lands on `/shop`, can browse and order

### Public shop (no sign-in required)
- Lists products from **approved** wholesalers only
- Search bar filters by product name
- Category chips filter by category (`All`, plus 8 categories)
- Each product card: category label, name, shop name, price, unit, image, order button
- Welcome banner explains the platform at the top

### Ordering
- Tap "Order on WhatsApp" → if not signed in, redirected to login and back
- If signed in: opens WhatsApp (wa.me) with a prefilled message
  - Includes retailer name, product, price, unit
  - Sent to the wholesaler's own WhatsApp number

### Admin panel (`/platform`)
- Pending wholesalers: shop info + Approve / Reject buttons
- Approved wholesalers: read-only list
- Rejected wholesalers: read-only list
- Retailers: list with joined date and last active date
- Reject requires a confirm prompt

### Design system
- Shared `<Header />` component: logo, wordmark, search (shop only), user chip
  - `minimal` prop hides search + user chip for auth pages
- Shared `<Footer />` component: brand, quick links, sign out when logged in
- Consistent cards, buttons, spacing across all pages
- Footer sticks to the bottom on short pages

---

## Data model (Firestore)

### `users/{uid}`
| Field | Type | Notes |
|---|---|---|
| email | string | |
| role | string | `platform` \| `wholesaler` \| `retailer` |
| createdAt | timestamp | |
| lastActiveAt | timestamp | updated on each sign-in |

### `wholesalers/{uid}` (uid = the Auth UID)
| Field | Type | Notes |
|---|---|---|
| shopName | string | |
| ownerName | string | |
| whatsappNumber | string | digits only, e.g. `256772123456` |
| email | string | |
| approved | boolean | set by admin |
| rejected | boolean | set by admin |
| createdAt | timestamp | |

### `products/{autoId}`
| Field | Type | Notes |
|---|---|---|
| wholesalerId | string | uid of owning wholesaler |
| wholesalerShopName | string | duplicated for shop display |
| wholesalerWhatsapp | string | duplicated to avoid a second read |
| productName | string | |
| price | number | whole number, UGX |
| unit | string | e.g. Bale, Piece, Carton |
| category | string | one of the fixed category list |
| imageUrl | string | optional, must start with http(s):// |
| createdAt | timestamp | |

### Categories (fixed list — `src/lib/categories.js`)
- Food & Beverages
- Clothing & Textiles
- Household & Cleaning
- Electronics
- Stationery & Office
- Hardware & Building
- Health & Beauty
- Other

Products without a valid category fall back to **Other**.

---

## Security rules (Firestore)

Current rules enforce:
- `users`: read own, or any if platform admin. Create own. Update own.
- `wholesalers`: **public read**. Owner creates own. Owner updates own, OR platform admin updates only `approved` + `rejected`.
- `products`: **public read**. Owner (matching `wholesalerId`) creates/updates/deletes their own.
- Default deny on everything else.

---

## Key files

```

src/
components/
Header.jsx         shared header (logo, search, user chip)
Footer.jsx         shared footer (brand, quick links, sign out)
lib/
firebase.js        Firebase init (auth, db)
useRole.js         reads users/{uid}, exposes { user, role, loading }
registerUser.js    creates Auth user + users doc + wholesalers doc
categories.js      fixed category list + getProductCategory()
pages/
Login.jsx
Register.jsx
Shop.jsx               public shop, search, category chips
WholesalerDashboard.jsx pending / approved / rejected states + add product
PlatformDashboard.jsx   admin approve / reject / lists
App.jsx              routes + RequireRole guard
main.jsx             entry, wraps App in <BrowserRouter>

```

---

## Firestore indexes (created)

- `products`: `wholesalerId` (Asc) + `createdAt` (Desc) — for early product queries.
  *Not strictly needed now — current queries sort client-side to avoid composite index requirements.*

---

## Deferred to Phase 2+

- Profile pictures and cover photos (needs Firebase Storage)
- Real image uploads (currently URL paste only)
- Payment integration (Pesapal)
- Invoices and receipts
- Order history for both retailers and wholesalers
- Admin: edit / deactivate existing wholesalers and retailers
- Admin: auto-deactivate retailers inactive 6+ months
- Onboarding flow, tutorials, welcome emails
- Delivery addresses + GPS
- Reports
- Uploaded order forms (bulk ordering)
- Cart with multi-item orders
- Native mobile app
- Custom domain + Cloudflare
- App Check (anti-abuse)

---

## Known limitations / notes

- Product images are external URLs; broken URLs show a fallback.
- Products without a category show under "Other".
- `stock` field not implemented — orders happen on WhatsApp, so stock counts would drift.
- No cart — ordering is per-product to keep WhatsApp messages simple.
- Sign-out is in the footer, not the header (header shows a user chip instead).
- `lastActiveAt` is best-effort; a failed update does not block sign-in.

---

## Deploying

Auto-deploys to Vercel on every commit to `main`.
Firebase Console: https://console.firebase.google.com/project/wholesale-b2b-enterprise-3d974

Env vars required in Vercel (Project → Settings → Environment Variables):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

---

## Test accounts

| Role | Email | Notes |
|---|---|---|
| Platform admin | sserunjojiappolicy@gmail.com | Manually created in Firebase Console |
| Wholesaler (approved) | appodev256@gmail.com | "Appo dev" |
| Wholesaler (rejected) | (test account used to verify the rejected screen) | |
| Retailer | (register a new one) | |

*(Update this list as test accounts change.)*

---

## Version history

- **V1** — 2026-10-04/05 — Foundation complete: roles, registration, approval workflow, products, public shop, WhatsApp ordering, admin panel, design system.
```