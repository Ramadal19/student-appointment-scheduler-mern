require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected (advisor seed)");

  const advisors = [
    { name: "David Kim", email: "david.kim@university.edu" },
    { name: "John Anderson", email: "john.anderson@university.edu" },
    { name: "Emily Johnson", email: "emily.johnson@university.edu" },
    { name: "Lisa Chen", email: "lisa.chen@university.edu" },
    { name: "Dr. Maria Perez", email: "maria.perez@university.edu" },
    { name: "Robert Martinez", email: "robert.martinez@university.edu" }
  ];

  for (const a of advisors) {
    await User.updateOne(
      { email: a.email },
      {
        $setOnInsert: {
          name: a.name,
          email: a.email,
          role: "advisor",
          provider: "manual",
          profileComplete: true
        }
      },
      { upsert: true }
    );
  }

  console.log("✅ Advisors created/verified.");
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});