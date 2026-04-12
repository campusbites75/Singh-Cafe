import foodModel from "../models/foodModel.js";
import fs from "fs";

/* ================= ADD FOOD ================= */
const addFood = async (req, res) => {
  try {
    const { name, description, price, category, productType, quantity } = req.body;

    if (!req.file) {
      return res.json({
        success: false,
        message: "Image is required",
      });
    }

    if (!productType) {
      return res.json({
        success: false,
        message: "Product type is required",
      });
    }

    // ✅ NORMALIZE TYPE
    const normalizedType =
      String(productType || "")
        .trim()
        .toLowerCase() === "packed"
        ? "Packed"
        : "Unpacked";

    const newFood = new foodModel({
      name,
      description,
      price,
      category,
      productType: normalizedType,
      image: req.file.filename,
      isActive: true,
      quantity: quantity ? Number(quantity) : 0, // ⭐ NEW
    });

    await newFood.save();

    res.json({
      success: true,
      message: "Food added successfully",
    });

  } catch (error) {
    console.error("ADD FOOD ERROR:", error);
    res.json({
      success: false,
      message: "Error adding food",
    });
  }
};

/* ================= LIST FOOD ================= */
const listFood = async (req, res) => {
  try {
    const isAdmin = req.query.admin === "true";

    let foods;

    if (isAdmin) {
      foods = await foodModel
        .find({})
        .populate("category")
        .sort({ createdAt: -1 });
    } else {
      foods = await foodModel
        .find({ isActive: true, quantity: { $gt: 0 } }) // ⭐ prevent showing out of stock
        .populate("category")
        .sort({ createdAt: -1 });
    }

    res.json({
      success: true,
      data: foods,
    });

  } catch (error) {
    console.error("LIST FOOD ERROR:", error);
    res.json({
      success: false,
      message: "Error fetching food list",
    });
  }
};

/* ================= REMOVE FOOD ================= */
const removeFood = async (req, res) => {
  try {
    const { id } = req.body;

    const food = await foodModel.findById(id);

    if (!food) {
      return res.json({
        success: false,
        message: "Food not found",
      });
    }

    if (food.image) {
      fs.unlink(`uploads/${food.image}`, (err) => {
        if (err) console.log("Image delete error:", err);
      });
    }

    await foodModel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Food removed successfully",
    });

  } catch (error) {
    console.error("REMOVE FOOD ERROR:", error);
    res.json({
      success: false,
      message: "Error removing food",
    });
  }
};

/* ================= UPDATE FOOD ================= */
const updateFood = async (req, res) => {
  try {
    const { id, name, description, price, category, productType, quantity } = req.body;

    const food = await foodModel.findById(id);

    if (!food) {
      return res.json({
        success: false,
        message: "Food not found",
      });
    }

    if (req.file) {
      if (food.image) {
        fs.unlink(`uploads/${food.image}`, (err) => {
          if (err) console.log("Image delete error:", err);
        });
      }
      food.image = req.file.filename;
    }

    // ✅ NORMALIZE TYPE
    const normalizedType =
      String(productType || "")
        .trim()
        .toLowerCase() === "packed"
        ? "Packed"
        : "Unpacked";

    food.name = name;
    food.description = description;
    food.price = price;
    food.category = category;
    food.productType = normalizedType;

    // ⭐ NEW: update quantity if provided
    if (quantity !== undefined) {
      food.quantity = Number(quantity);
    }

    await food.save();

    res.json({
      success: true,
      message: "Food updated successfully",
    });

  } catch (error) {
    console.error("UPDATE FOOD ERROR:", error);
    res.json({
      success: false,
      message: "Error updating food",
    });
  }
};

/* ================= UPDATE ONLY QUANTITY (INLINE EDIT) ================= */
const updateQuantity = async (req, res) => {
  try {
    const { id, quantity } = req.body;

    const updatedFood = await foodModel.findByIdAndUpdate(
      id,
      { quantity: Number(quantity) },
      { new: true }
    );

    if (!updatedFood) {
      return res.json({
        success: false,
        message: "Food not found",
      });
    }

    res.json({
      success: true,
      message: "Quantity updated successfully",
      quantity: updatedFood.quantity,
    });

  } catch (error) {
    console.error("UPDATE QUANTITY ERROR:", error);
    res.json({
      success: false,
      message: "Error updating quantity",
    });
  }
};
/* ================= TOGGLE FOOD STATUS ================= */
const toggleFoodStatus = async (req, res) => {
  try {
    const { id } = req.body;

    const food = await foodModel.findById(id);

    if (!food) {
      return res.json({
        success: false,
        message: "Food not found",
      });
    }

    food.isActive = !food.isActive;
    await food.save();

    res.json({
      success: true,
      message: `Food ${food.isActive ? "resumed" : "paused"} successfully`,
      isActive: food.isActive,
    });

  } catch (error) {
    console.error("TOGGLE STATUS ERROR:", error);
    res.json({
      success: false,
      message: "Error updating food status",
    });
  }
};
const fixQuantity = async (req, res) => {
  try {
    await foodModel.updateMany({}, { $set: { quantity: 1 } });

    res.json({
      success: true,
      message: "All items updated with quantity = 1",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error fixing quantity",
    });
  }
};
export {
  addFood,
  listFood,
  removeFood,
  updateFood,
  updateQuantity,
  toggleFoodStatus,
  fixQuantity // 👈 ADD THIS
};
