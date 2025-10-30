// sendMail.js
// Usage:
//   node sendMail.js recipient@example.com "Subject here" "<p>HTML body</p>"
// Example:
//   node sendMail.js you@domain.com "Test" "<p>Hello from Node</p>"

import nodemailer from "nodemailer";

// --------- CONFIG: replace these with your values locally ----------
const GMAIL_USER = "radif.tajwar@pathao.com";
// ⚠️ Replace the placeholder below with your actual app password on your machine ONLY.
const GMAIL_APP_PASSWORD = "vcxqrbnquizgqevl";
// ------------------------------------------------------------------

// Simple CLI args
const args = process.argv.slice(2);
const to = args[0] || "tajwarradif@gmail.com";
const subject = args[1] || "Test email from sendMail.js";
const htmlBody = args[2] || "<p>This is a test email sent from <strong>sendMail.js</strong>.</p>";

if (!GMAIL_APP_PASSWORD || GMAIL_APP_PASSWORD === "YOUR_APP_PASSWORD_HERE") {
  console.error(
    "\nERROR: You must set your Gmail app password in the script before running.\n" +
    "Edit sendMail.js and replace GMAIL_APP_PASSWORD with your app password.\n" +
    "DO NOT commit the password to version control.\n"
  );
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

    console.log("✅ Email sent:", info.messageId);
    console.log("Preview URL (if available):", nodemailer.getTestMessageUrl(info) || "n/a");
    return info;
  } catch (err) {
    console.error("❌ Error sending mail:", err);
    throw err;
  }
}

sendMail({ to, subject, html: htmlBody })
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch(() => process.exit(2));
