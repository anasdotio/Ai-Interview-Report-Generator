const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required to blacklist."],
    },
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: [true, "UserId is required to blacklist token."],
    // },
    // expiresAt: {
    //   type: Date,
    //   default: Date.now,
    //   expires: 60 * 60 * 24, // token will be removed from blacklist after 1 day
    // },
  },
  {
    timestamps: true,
  },
);

const blacklistModel = mongoose.model("Blacklist", blacklistTokenSchema);

module.exports = blacklistModel;
