export const formatPriceVirtual = (menuSchema) => {
  // Define a virtual field to append currency dynamically
  menuSchema.virtual("formattedPrice").get(function () {
    if (this.restaurantId && this.restaurantId.currency) {
      return `${this.price.amount} ${this.restaurantId.currency}`;
    }
    return this.price.amount; 
  });

  // Ensure virtuals are included when converting the document
  menuSchema.set("toJSON", { virtuals: true });
  menuSchema.set("toObject", { virtuals: true });
};

export const formatSalaryVirtual = (userSchema) => {
  // Define a virtual field to append currency dynamically
  userSchema.virtual("formattedSalary").get(function () {
    if (this.restaurantId && this.restaurantId.currency) {
      return `${this.salary} ${this.restaurantId.currency}`;
    }
    return this.salary; 
  });

  // Ensure virtuals are included when converting the document
  userSchema.set("toJSON", { virtuals: true });
  userSchema.set("toObject", { virtuals: true });
};
