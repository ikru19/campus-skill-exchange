// ============================================
// seed/seedData.js - Populates the database with sample data,
// including the exact "demo student" the login page's
// "Use Demo Student Account" button logs into.
//
// Run:            npm run seed
// Undo/clear:     npm run seed:destroy
// ============================================
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Skill = require("../models/Skill");
const Request = require("../models/Request");

const DEMO_PASSWORD = "demo12345";

const seedUsers = [
  { fullName: "Ayesha Rahman", studentId: "2023-CSE-118", department: "Computer Science & Engineering", email: "demo@university.edu", password: DEMO_PASSWORD, bio: "Front-end enthusiast who loves teaching design tools and picking up new languages." },
  { fullName: "Sadia Noor", studentId: "2022-CSE-045", department: "Computer Science & Engineering", email: "sadia@university.edu", password: "password123", bio: "Data analysis and Python." },
  { fullName: "Rifat Tanvir", studentId: "2021-EEE-090", department: "Electrical & Electronic Engineering", email: "rifat@university.edu", password: "password123", bio: "Guitar player, self-taught." },
  { fullName: "Raisa Anjum", studentId: "2022-CSE-071", department: "Computer Science & Engineering", email: "raisa@university.edu", password: "password123", bio: "UI/UX and Figma." },
];

const seedSkillTemplates = [
  {
    name: "Python for Data Analysis", category: "Programming", level: "Intermediate",
    desc: "Pandas, NumPy and real dataset walkthroughs, taught week by week.",
    learningMode: "Online", meetingLink: "https://meet.google.com/python-sessions",
    availableSchedule: "Saturday 7 PM",
    resources: [{ title: "Pandas Crash Course", type: "YouTube", url: "https://youtube.com/watch?v=example1" }],
  },
  {
    name: "Beginner Guitar Chords", category: "Music", level: "Beginner",
    desc: "Open chords, strumming patterns, and your first three songs.",
    learningMode: "Offline", availableSchedule: "Sunday 4 PM, campus music room",
    resources: [],
  },
  {
    name: "Figma for Beginners", category: "Design", level: "Expert",
    desc: "Frames, components and prototyping basics for your first app design.",
    learningMode: "Hybrid", meetingLink: "https://zoom.us/j/figma-sessions",
    availableSchedule: "Monday & Wednesday 5 PM",
    resources: [{ title: "Figma Starter File", type: "Google Drive", url: "https://drive.google.com/example1" }],
  },
];

const seedDatabase = async () => {
  await connectDB();
  console.log("🌱 Clearing existing data...");
  await User.deleteMany();
  await Skill.deleteMany();
  await Request.deleteMany();

  console.log("🌱 Creating users...");
  const createdUsers = [];
  for (const u of seedUsers) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    const user = await User.create({ ...u, password: hashedPassword });
    createdUsers.push(user);
  }

  console.log("🌱 Creating skills...");
  const createdSkills = [];
  for (let i = 0; i < seedSkillTemplates.length; i++) {
    const owner = createdUsers[(i + 1) % createdUsers.length]; // spread across non-demo users first
    const skill = await Skill.create({
      ...seedSkillTemplates[i],
      contactEmail: seedSkillTemplates[i].contactEmail || owner.email,
      user: owner._id,
    });
    createdSkills.push(skill);
  }

  console.log("🌱 Creating sample requests...");
  const demoUser = createdUsers[0];
  await Request.create({
    skill: createdSkills[0]._id,
    fromUser: demoUser._id,
    toUser: createdSkills[0].user,
    message: "Hi! I'd love to learn Python, are you free this week?",
    status: "accepted",
  });
  await Request.create({
    skill: createdSkills[2]._id,
    fromUser: demoUser._id,
    toUser: createdSkills[2].user,
    message: "Could you teach me Figma basics?",
    status: "pending",
  });

  console.log("✅ Seed data created!");
  console.log("-----------------------------------------");
  console.log(`Demo login (matches the "Use Demo Student Account" button):`);
  console.log(`  ${demoUser.email} / ${DEMO_PASSWORD}`);
  console.log("-----------------------------------------");
  process.exit();
};

const destroyDatabase = async () => {
  await connectDB();
  await User.deleteMany();
  await Skill.deleteMany();
  await Request.deleteMany();
  console.log("🗑️  All data removed");
  process.exit();
};

if (process.argv.includes("--destroy")) destroyDatabase();
else seedDatabase();
