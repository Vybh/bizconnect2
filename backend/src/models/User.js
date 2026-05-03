import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    fullName: { type: String, required: true },
    industry: { type: String, default: "" },
    location: { type: String, default: "" },
    experienceYears: { type: Number, default: 0 },
    description: { type: String, default: "" },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    pricing: { type: Number, default: 0 },
    nativeLanguage: { type: String, default: "" },
    learningLanguage: { type: String, default: "" },
    profilePic: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this._id}`;
      },
    },
    isOnBoarded: { type: Boolean, default: false },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
