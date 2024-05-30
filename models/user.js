const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("node:crypto"); //Built in package //randomBytes to generate secret

const userSchema = new Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String, //When signing in this salt can be used to hash user password and match with stored hash
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/public/images/default.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true }
);

//This function would run before saving the model
userSchema.pre("save", function (next) {
  const user = this;
  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

    this.salt=salt;
    this.password=hashedPassword;

    next();
});

//Virtual Function in MongoDB
userSchema.static("matchPassword", async function(email,password){
    const user = await this.findOne({ email });
    if(!user) throw Error('User not found');

    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");

    if(hashedPassword !== userProvidedHash) throw new Error("Incorrect Password");
    
    return { ...user._doc, password: undefined, salt: undefined }; //So password is not shared
    //return user;
});

const User = model("user", userSchema);

module.exports = User;