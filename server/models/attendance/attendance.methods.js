// Instance methods (for single attendance document)
export default {
  softDelete() {
    this.deletedAt = new Date();
    return this.save();
  },

  isDeleted() {
    return this.deletedAt !== null;
  },
};
