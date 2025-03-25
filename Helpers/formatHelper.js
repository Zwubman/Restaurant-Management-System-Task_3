export const formatPriceVirtual = (menuSchema) => {
  // Define a virtual field to append currency dynamically
  menuSchema.virtual("formattedPrice").get(function () {
    // Ensure restaurantId is populated before trying to access currency
    if (this.restaurantId && this.restaurantId.currency) {
      return `${this.price}${this.restaurantId.currency}`;
    }
    return this.price; // Return price without currency if restaurant is not populated
  });

  // Ensure virtuals are included when converting the document
  menuSchema.set("toJSON", { virtuals: true });
  menuSchema.set("toObject", { virtuals: true });
};

export const formatSalaryVirtual = (userSchema) => {
  // Define a virtual field to append currency dynamically
  menuSchema.virtual("formattedPrice").get(function () {
    // Ensure restaurantId is populated before trying to access currency
    if (this.restaurantId && this.restaurantId.currency) {
      return `${this.salary}${this.restaurantId.currency}`;
    }
    return this.salary; // Return price without currency if restaurant is not populated
  });

  // Ensure virtuals are included when converting the document
  menuSchema.set("toJSON", { virtuals: true });
  menuSchema.set("toObject", { virtuals: true });
};
