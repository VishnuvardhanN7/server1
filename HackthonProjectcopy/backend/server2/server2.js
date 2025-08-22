// ================== Load environment variables ==================
import dotenv from "dotenv";
dotenv.config({ path: "./server2/.env" }); // Ensure server2 uses its own .env file

// ================== Import dependencies ==================
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import nodemailer from "nodemailer";
import cron from "node-cron";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================== Import User model ==================
import User from "../models/User.js"; // ✅ Fixed path

// ================== MongoDB Connection ==================
mongoose
  .connect("mongodb://127.0.0.1:27017/medapp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ================== Nodemailer Setup ==================
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const scheduledEmails = [];

// ================== AUTH ROUTES ==================

// Signup route
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "✅ User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1h" }
    );

    res.json({ message: "✅ Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== EMAIL SCHEDULING ==================
app.post("/schedule-email", (req, res) => {
  const { subject, message, time, email } = req.body;

  if (!subject || !message || !time || !email) {
    return res
      .status(400)
      .json({ error: "Subject, message, time, and email are required" });
  }

  const [hour, minute] = time.split(":");

  // Cron expression for daily email schedule
  const cronExpression = `${minute} ${hour} * * *`;

  const job = cron.schedule(
    cronExpression,
    () => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text: message,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("❌ Email error:", err);
        } else {
          console.log(`📧 Email sent to ${email}:`, info.response);
        }
      });
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );

  scheduledEmails.push(job);

  res.json({ success: true, scheduledFor: time, to: email });
});

// ================== SERVER START ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server2 running on http://localhost:${PORT}`);
});
