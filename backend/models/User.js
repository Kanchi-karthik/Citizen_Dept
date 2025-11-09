const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  location: String,
  work: String,
  gender: String,
  age: Number,
  volunteering: String,
  volunteeringTypes: [String],
  volunteeringDays: String,
  role: { type: String, enum: ["user", "admin"], default: "user" },
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
  if (this.userId) return next();
  const prefix = this.role === "admin" ? "ADM" : "USR";
  const lastUser = await mongoose.model("User").findOne({ role: this.role }, {}, { sort: { createdAt: -1 } });
  const newNumber = lastUser && lastUser.userId ? parseInt(lastUser.userId.replace(prefix, "")) + 1 : 1;
  this.userId = `${prefix}${String(newNumber).padStart(3, "0")}`;
  next();
});

UserSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", UserSchema);
