// ================== Load environment variables ==================
import dotenv from "dotenv";
dotenv.config(); // automatically loads from .env at project root

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import nodemailer from "nodemailer";
import cron from "node-cron";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

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
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Debug: check env variables (mask password)
console.log("📧 Email config:", {
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS ? "****" : "MISSING",
});

const scheduledEmails = [];

// ================== AUTH ROUTES ==================
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ message: "✅ User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "✅ Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ================== EMAIL SCHEDULING ==================
app.post("/schedule-email", (req, res) => {
  const { tabletName, time, email, duration } = req.body;

  if (!tabletName || !time || !email) {
    return res
      .status(400)
      .json({ error: "Tablet name, time, and email are required" });
  }

  const [hour, minute] = time.split(":");
  const cronExpression = `${minute} ${hour} * * *`;

  let daysLeft = duration || 1;

  const job = cron.schedule(
    cronExpression,
    () => {
      if (daysLeft <= 0) {
        job.stop();
        return;
      }

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `💊 Tablet Reminder: ${tabletName}`,
        text: `Hello!\n\nThis is a reminder to take your tablet: ${tabletName}.\nScheduled Time: ${time}\n\nStay healthy!\n\n- Your Med Reminder App`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("❌ Email error:", err);
        } else {
          console.log(`📧 Reminder email sent to ${email}:`, info.response);
        }
      });

      daysLeft--;
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );

  scheduledEmails.push(job);

  res.json({
    success: true,
    scheduledFor: time,
    to: email,
    tablet: tabletName,
    duration,
  });
});

// ================== SERVER START ==================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server2 running on http://localhost:${PORT}`);
});

