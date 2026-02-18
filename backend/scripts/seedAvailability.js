require("dotenv").config();
const mongoose = require("mongoose");

const User = require("../src/models/User");
const Availability = require("../src/models/Availability");

// ===== Helpers =====
function getNextMonday(base = new Date()) {
  const d = new Date(base);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun,1=Mon...
  const diff = (8 - day) % 7; // days until next Monday (0 if today is Monday -> next week)
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d;
}

function setTime(date, hour) {
  const d = new Date(date);
  d.setHours(hour, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected (availability seed)");
}

// ===== Your weekly "busy" schedule (from the table) =====
// Times are 24h start-hour for 1-hour blocks.
const BUSY = {
  Monday: [
    { advisor: "David Kim", startHour: 9 },
    { advisor: "Dr. Maria Perez", startHour: 10 },
    { advisor: "Lisa Chen", startHour: 14 }
  ],
  Tuesday: [
    { advisor: "John Anderson", startHour: 9 },
    { advisor: "Emily Johnson", startHour: 13 },
    { advisor: "Robert Martinez", startHour: 15 }
  ],
  Wednesday: [
    { advisor: "Lisa Chen", startHour: 11 },
    { advisor: "Dr. Maria Perez", startHour: 13 }
  ],
  Thursday: [
    { advisor: "Emily Johnson", startHour: 9 },
    { advisor: "David Kim", startHour: 13 },
    { advisor: "John Anderson", startHour: 15 }
  ],
  Friday: [
    { advisor: "Lisa Chen", startHour: 9 },
    { advisor: "Robert Martinez", startHour: 13 }
  ]
};

// We will generate slots for all advisors for:
// 9-10, 10-11, 11-12, (skip 12-1), 1-2, 2-3, 3-4, 4-5
const WORK_HOURS = [9, 10, 11, 13, 14, 15, 16];

const DAYS = [
  { name: "Monday", offset: 0 },
  { name: "Tuesday", offset: 1 },
  { name: "Wednesday", offset: 2 },
  { name: "Thursday", offset: 3 },
  { name: "Friday", offset: 4 }
];

async function seedAvailability() {
  await connectDB();

  // 1) Load advisors by name
  const advisorNames = [
    "David Kim",
    "John Anderson",
    "Emily Johnson",
    "Lisa Chen",
    "Dr. Maria Perez",
    "Robert Martinez"
  ];

  const advisors = await User.find({ role: "advisor", name: { $in: advisorNames } })
    .select("_id name");

  const byName = new Map(advisors.map(a => [a.name, a._id]));

  // Check missing
  const missing = advisorNames.filter(n => !byName.has(n));
  if (missing.length) {
    console.log("❌ Missing advisors in DB (check name spelling):", missing);
    console.log("Seed aborted to avoid partial data.");
    process.exit(1);
  }

  // 2) Choose the week to seed: next Monday -> Friday
  const weekStart = getNextMonday(new Date());
  console.log("Seeding week starting (next Monday):", weekStart.toISOString().slice(0, 10));

  // 3) Build all slots
  const allSlots = [];

  for (const day of DAYS) {
    const date = addDays(weekStart, day.offset);

    for (const advisorName of advisorNames) {
      const advisorId = byName.get(advisorName);

      for (const hour of WORK_HOURS) {
        const startTime = setTime(date, hour);
        const endTime = new Date(startTime.getTime() + 60 * 60000);

        allSlots.push({
          advisorId,
          startTime,
          endTime,
          isBooked: false
        });
      }
    }
  }

  // 4) Insert slots (ignore duplicates on rerun)
  let insertedCount = 0;
  try {
    const inserted = await Availability.insertMany(allSlots, { ordered: false });
    insertedCount = inserted.length;
  } catch (err) {
    // Normal if rerun with unique index; duplicates will be rejected
    console.log("ℹ️ Some slots already existed (normal on rerun).");
  }
  console.log(`✅ Seed attempted. New slots inserted: ${insertedCount}`);

  // 5) Mark BUSY hours as booked (your table)
  // We'll update by advisorId + exact startTime.
  let busyUpdates = 0;

  for (const day of DAYS) {
    const date = addDays(weekStart, day.offset);
    const busyList = BUSY[day.name] || [];

    for (const b of busyList) {
      const advisorId = byName.get(b.advisor);
      const startTime = setTime(date, b.startHour);

      const result = await Availability.updateOne(
        { advisorId, startTime },
        { $set: { isBooked: true } }
      );

      // matchedCount is 1 if slot exists
      if (result.matchedCount === 1) busyUpdates += 1;
    }
  }

  console.log(`✅ Busy blocks marked as booked: ${busyUpdates}`);
  console.log("✅ Lunch hour (12-1) is not created, so it will always be unavailable.");

  await mongoose.disconnect();
  console.log("Done.");
}

seedAvailability().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});