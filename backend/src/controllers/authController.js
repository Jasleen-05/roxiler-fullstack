const bcrypt = require("bcryptjs");
const { User } = require("../models"); // adjust path
const { isValidSyntax, hasMX, verifyWithProvider } = require("../utils/emailCheck");
const { sendWelcomeEmail } = require("../utils/mailer");

async function signup(req, res) {
  try {
    const { name, email, password, address, role } = req.body;

    // basic required checks
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    // 1) syntax
    if (!isValidSyntax(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // 2) MX record check
    const domain = email.split("@")[1];
    const mxOk = await hasMX(domain);
    if (!mxOk) {
      // optionally allow but warn – but it's safer to reject
      return res.status(400).json({ message: "Email domain does not accept emails" });
    }

    // 3) optional provider check
    if (process.env.MAILBOXLAYER_KEY) {
      const prov = await verifyWithProvider(email);
      if (prov && prov.deliverable === false) {
        return res.status(400).json({ message: "Email appears undeliverable" });
      }
    }

    // create user (check uniqueness etc)
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      address: address || null,
      role: role || "user",
    });

    // send welcome email (do not make user wait if you want; you can also fire-and-forget)
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (err) {
      // log send error but don't fail signup (optional)
      console.error("Error sending welcome email:", err);
    }

    // respond (do NOT include password)
    res.json({ message: "User created", user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = { signup };