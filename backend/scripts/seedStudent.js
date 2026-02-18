require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected (seed student)");

  const studentEmail = "student.test@university.edu";

  const result = await User.findOneAndUpdate(
    { email: studentEmail },
    {
      $setOnInsert: {
        name: "Test Student",
        email: studentEmail,
        role: "student",
        provider: "local",
        profileComplete: true
      }
    },
    { upsert: true, new: true }
  );

  console.log("✅ Student:", { _id: result._id.toString(), name: result.name, email: result.email });

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});