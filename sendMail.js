// sendMail.js
// Run this file directly with:  node sendMail.js

import nodemailer from "nodemailer";

// --------- CONFIG ----------
const GMAIL_USER = "radif.tajwar@pathao.com";
const GMAIL_APP_PASSWORD = "vcxqrbnquizgqevl"; // ⚠️ App password
// ----------------------------

// Hardcoded email details
const to = "fahim.shoumik@pathao.com";
const subject = "🍱 Welcome to Lunch Expense — Your Meal Management Portal";
const htmlBody = `
  <p>Dear Team Member,</p>

  <p>Welcome to the <strong>Lunch Expense</strong> system — a simple, organized way to track and manage your daily meal expenses.</p>

  <p>
    This platform helps you:
    <ul>
      <li>Record and review daily meal costs</li>
      <li>Monitor total spending across the team</li>
      <li>Ensure transparent and accurate expense tracking</li>
    </ul>
  </p>

  <p>To get started, please log in to your account here:</p>

  <p>
    <a href="https://lunch-expense.vercel.app/" style="color:#2563eb;font-weight:bold;text-decoration:none;">
      👉 Login to Lunch Expense
    </a>
  </p>

  <br/>

  <p>
    If you encounter any issues or have questions, feel free to reach out directly.
  </p>

  <p>
    Best regards,<br/>
    <strong>Radif Tajwar</strong><br/>
    Lunch Expense Team
  </p>
`;

if (!GMAIL_APP_PASSWORD || GMAIL_APP_PASSWORD === "YOUR_APP_PASSWORD_HERE") {
  console.error("\n❌ Gmail app password missing! Please set it in this file.\n");
  process.exit(1);
}

async function sendMail({ to, subject, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: `"Lunch Expense" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending mail:", err);
  }
}

sendMail({ to, subject, html: htmlBody })
  .then(() => {
    console.log("🎉 Done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("💥 Failed:", err);
    process.exit(2);
  });
