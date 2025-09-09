// Static methods (applied to the whole model)
export default {
  async findActive() {
    return this.find({ deletedAt: null });
  },

  async findByDate(date) {
    return this.findOne({ date, deletedAt: null });
  },
};
