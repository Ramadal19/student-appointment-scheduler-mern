require("dotenv").config();
const mongoose = require("mongoose");
const Topic = require("../src/models/Topics");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected (seed topics)");

  const topics = [
    { title: "Course Planning", description: "Plan next semester courses" },
    { title: "Registration Issues", description: "Problems registering classes" },
    { title: "Career Guidance", description: "Discuss career path and internships" },
    { title: "Graduation Requirements", description: "Check graduation eligibility" }
  ];

  await Topic.deleteMany({});
  const inserted = await Topic.insertMany(topics);

  console.log("Topics created:");
  inserted.forEach(t => console.log(t._id.toString(), "-", t.title));

  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});