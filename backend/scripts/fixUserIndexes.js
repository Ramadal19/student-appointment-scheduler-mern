require("dotenv").config();
const mongoose = require("mongoose");

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected (fix indexes)");

  const users = mongoose.connection.db.collection("users");

  // 1) Remove githubId when it's null (critical)
  const unsetResult = await users.updateMany(
    { githubId: null },
    { $unset: { githubId: "" } }
  );
  console.log(`Unset githubId:null on ${unsetResult.modifiedCount} users`);

  // 2) Drop githubId index if exists
  const idx = await users.indexes();
  const hasGithub = idx.some((i) => i.name === "githubId_1");
  if (hasGithub) {
    console.log("Dropping index githubId_1 ...");
    await users.dropIndex("githubId_1");
    console.log("Dropped githubId_1");
  }

  // 3) Recreate as UNIQUE + PARTIAL (ignores missing + null)
  console.log("Creating partial unique index on githubId (string only) ...");
  await users.createIndex(
    { githubId: 1 },
    {
      name: "githubId_1",
      unique: true,
      partialFilterExpression: { githubId: { $type: "string" } }
    }
  );
  console.log("Created githubId_1 (unique + partial)");

  await mongoose.disconnect();
  console.log("Done.");
}

run().catch((e) => {
  console.error("Fix failed:", e);
  process.exit(1);
});