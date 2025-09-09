// Static methods (for model-level operations)
export default {
  async findByMeal(mealId) {
    return this.find({ mealId, deletedAt: null }).populate("userId");
  },

  async findByUser(userId) {
    return this.find({ userId, deletedAt: null }).populate("mealId");
  },

  async findActive() {
    return this.find({ deletedAt: null });
  },
};
