import mongoose from "mongoose";
import formatPriceVirtual from "../Helpers/formatHelper.js";

const menuSchema = mongoose.Schema({
  menuItemName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  ingredients: [
    {
      ingredientName: {
        type: String,
        required: true,
      },
      amountUsedPerItem: {
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
  },
  restaurantId: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  }
});


// Apply the virtual field logic from the helper
formatPriceVirtual(menuSchema);

const Menu = mongoose.model("Menu", menuSchema);
export default Menu;
