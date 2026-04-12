import express from 'express';
import multer from 'multer';

import {
  addFood,
  listFood,
  removeFood,
  updateFood,
  updateQuantity,
  toggleFoodStatus,
  fixQuantity // ⭐ TEMPORARY (REMOVE LATER)
} from '../controllers/foodController.js';

const foodRouter = express.Router();

// ================================
// IMAGE STORAGE
// ================================
const storage = multer.diskStorage({
  destination: 'uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// ================================
// ROUTES
// ================================

// 🔹 Get all foods
foodRouter.get("/list", listFood);

// 🔹 Add food
foodRouter.post("/add", upload.single('image'), addFood);

// 🔹 Remove food
foodRouter.post("/remove", removeFood);

// 🔹 Update full food
foodRouter.post("/update", upload.single('image'), updateFood);

// 🔹 Update ONLY quantity (inline edit)
foodRouter.post("/update-quantity", updateQuantity);

// 🔹 Pause / Resume food
foodRouter.post("/toggle", toggleFoodStatus);

// 🔥 TEMP FIX ROUTE (RUN ONCE THEN REMOVE)
foodRouter.get("/fix-quantity", fixQuantity);

export default foodRouter;
