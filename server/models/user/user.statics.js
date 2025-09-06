// Static method: available on User model
export function findByEmail(email) {
  return this.findOne({ email });
}
