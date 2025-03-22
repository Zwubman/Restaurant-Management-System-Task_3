import mongoose from "mongoose";

const inventorySchema = mongoose.Schema({
    ingredientName: {
        type: String,
        required: true
    },
    ingredientCategory: {  
        type: String,
        enum: ["Vegetables", "Dairy", "Meat", "Grains", "Spices"],  
        required: true
    },
    availableQuantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ["g", "ml", "pieces"],
        required: true
    },

});

const Inventory = mongoose.model("Inventory", inventorySchema);
export default Inventory;