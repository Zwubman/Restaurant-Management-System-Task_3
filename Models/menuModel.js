import mongoose from "mongoose";

const menuSchema = mongoose.Schema({
  menuItemName: {
    type: String,
    required: true,
  },
  catagory: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  ingredient: [
    {
      ingredientName: {
        type: String,
        required: true,
      },
      amountUsedPerItems: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["g", "ml", "pieces"],
        required: true,
      },
    },
  ],
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inventory"
  }
});

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
