# Closetkeeper — Personal Wardrobe App

A private wardrobe app: upload clothes, organize by category, search/filter, mark favorites, and build outfits.

## Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** Mocked locally with a JSON file (via `lowdb`) — see `backend/src/db.js` for the swap-in path to **MongoDB Atlas**
- **Image storage:** Mocked locally with disk storage (via `multer`) — see `backend/src/storage.js` for the swap-in path to **Cloudinary**

Both mocks keep the exact function signatures the rest of the app expects, so switching to the real services later is a contained change in those two files — no route or frontend changes needed.

## Running it

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Runs on `http://localhost:4000`. A `data/db.json` file and `uploads/` folder are created automatically on first run.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` and proxies `/api` and `/uploads` to the backend.

Open `http://localhost:5173`, create an account, and start adding clothes.

## What's implemented
- Email/password auth (JWT)
- Upload outfit photos
- All 11 categories from the brief (Tops, T-Shirts, Shirts, Pants, Bottoms, Skirts, Dresses, Accessories, Shoes, Bags, Jewelry)
- Clothing fields: image, name, category, color, brand, season (Summer/Winter), occasion (Casual/Formal), favorite
- Search (name/brand/color) and filters (category, season, occasion, favorites)
- Favorite toggling
- Outfit Builder (select multiple pieces, save and name a look)

## Swapping in real services later

**MongoDB Atlas:** install `mongodb`, set `MONGODB_URI` in `.env`, and reimplement the functions in `backend/src/db.js` using `MongoClient` — keep the same exported function names/signatures.

**Cloudinary:** install `cloudinary` + `multer-storage-cloudinary`, set the three `CLOUDINARY_*` vars in `.env`, and replace the `multer.diskStorage` engine in `backend/src/storage.js` with `CloudinaryStorage`.

## Future features (not yet built, per the brief)
AI Stylist, calendar planner, weather recommendations, packing assistant, shared closet, statistics dashboard.
