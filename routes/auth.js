const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { validateRegistration, validateLogin } = require("../middlewares/validation");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
  tls: {
    rejectUnauthorized: false, 
  },
});

// const path = require("path");

const sendWelcomeEmail = (email, name, memberId, profileImagePath) => {
  const doc = new PDFDocument({
  size: "A4",
  margins: { top: 0, left: 0, right: 0, bottom: 0 },
});

const pdfPath = `./membership-card-${memberId}.pdf`;
doc.pipe(fs.createWriteStream(pdfPath));

const pageWidth = doc.page.width;
const pageHeight = doc.page.height;

// 1. Background image
doc.image('public/images/Background.png', 0, 0, {
  width: pageWidth,
  height: pageHeight,
});

// 2. Transparent Card with Shadow
const cardX = 64;
const cardY = 150;
const cardWidth = pageWidth - 128;
const cardHeight = 420;
const borderRadius = 28;

// Shadow
doc.save();
doc.roundedRect(cardX + 6, cardY + 10, cardWidth, cardHeight, borderRadius)
  .fillOpacity(0.15)
  .fill('#000');
doc.restore();

// Glass Card Base
doc.save();
doc.roundedRect(cardX, cardY, cardWidth, cardHeight, borderRadius)
  .fillOpacity(0.85)
  .fill('#ffffff');
doc.restore();

// 3. Decorative Top Title
doc.font('Helvetica-Bold')
  .fontSize(30)
  .fillColor('#1A237E') // deep purple
  .text('NIGAI THEATRICALS', cardX, cardY + 25, {
    width: cardWidth,
    align: 'center',
    characterSpacing: 1.5,
  });

// 4. Profile Picture
const profileSize = 90;
const profileX = pageWidth / 2 - profileSize / 2;
const profileY = cardY + 65;

doc.save();
doc.circle(pageWidth / 2, profileY + profileSize / 2, profileSize / 2).clip();
doc.image('public/images/logo1.png', profileX, profileY, {
  width: profileSize,
  height: profileSize,
});
doc.restore();

// 5. Member Name
doc.font('Helvetica-Bold')
  .fontSize(18)
  .fillColor('#1A237E') // Indigo
  .text(name.toUpperCase(), cardX, cardY + 170, {
    width: cardWidth,
    align: 'center',
    characterSpacing: 1,
  });

// 6. MEMBER Badge - Enhanced Design
const badgeWidth = 150;
const badgeHeight = 42;
const badgeX = pageWidth / 2 - badgeWidth / 2;
const badgeY = cardY + 220;

doc.save();
doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 22)
  // .fill('#7B1FA2'); // rich purple

// Optional glow outline
doc.lineWidth(1.5)
  // .strokeColor('#f3f3f3ff') // lavender border
  .roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 22)
  .stroke();

doc.font('Helvetica-Bold')
  .fontSize(15)
  .fillColor('#1A237E')
  .text('MEMBER', badgeX, badgeY + 10, {
    width: badgeWidth,
    align: 'center',
    characterSpacing: 1,
  });
doc.restore();

// 7. Divider
doc.save();
doc.roundedRect(cardX + 40, badgeY + badgeHeight + 24, cardWidth - 80, 4, 2)
  .fill('#E0E0E0');
doc.restore();

// 8. Email and Membership ID
doc.font('Helvetica')
  .fontSize(14)
  .fillColor('#333333')
  .text(`${email}`, cardX, badgeY + badgeHeight + 45, {
    width: cardWidth,
    align: 'center',
  })
  .moveDown(0.3)
  .text(`Membership ID: ${memberId}`, {
    width: cardWidth,
    align: 'center',
  });

// 9. Footer Note
doc.font('Helvetica-Oblique')
  .fontSize(12)
  .fillColor('#6C757D')
  .text('Thank you for joining our creative family!', 0, cardY + cardHeight + 24, {
    width: pageWidth,
    align: 'center',
  });

doc.end();


  // Email with attachment
  // Email with attachment
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: `🎉 Welcome to NIGAI, ${name}!`,
    html: `
      <div style="text-align: center; font-family: 'Segoe UI', sans-serif; color: #333;">
        <img src="https://imgs.search.brave.com/y6nRUxqQ3Wtwu5rhtAqC0bN0pevSuXtsJwz1QSO4DNU/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA1LzYxLzU5Lzc5/LzM2MF9GXzU2MTU5/Nzk2NV90bkl0OFRn/Tnk5eVcxZXRVVVZJ/aGlsM0RabXFTbVA4/NS5qcGc" alt="NIGAI Logo" style="width: 150px; border-radius: 50px; margin-bottom: 15px;" />
        <h2>Welcome, ${name} 🎊</h2>
        <p>You're officially a member of <strong>NIGAI</strong>!</p>
        <p>We've attached your personalized membership card.</p>
      <p> 
    connect on Instagram: 
    <a href="https://www.instagram.com/nigai_theatricals" target="_blank" style="color: #E1306C; font-weight: bold;">
      @nigai_theatricals
    </a> 📷
  </p>
      </div>
    `,
    attachments: [{
      filename: `membership-card-${memberId}.pdf`,
      path: pdfPath,
    }],
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error sending email:", error);
    else console.log("Email sent:", info.response);
    fs.unlinkSync(pdfPath); // Delete PDF after sending
  });
};




  
  


router.post("/register", validateRegistration, async (req, res) => {
  const { name, mobile, email } = req.body;

  try {
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: "Email already exists" });

    const mobileExists = await User.findOne({ mobile });
    if (mobileExists)
      return res
        .status(400)
        .json({ message: "Mobile number already registered" });

    const newUser = new User({
      name,
      mobile,
      email,
    });

    await newUser.save();

    // Generate JWT Token after successful registration
    const token = jwt.sign(
      { userId: newUser._id, memberId: newUser.memberId },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    // Send welcome email with PDF
    sendWelcomeEmail(email, name, newUser.memberId);

    res.status(201).json({
      message: "User registered successfully",
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route with Validation
router.post("/login", validateLogin, async (req, res) => {
  const { mobile } = req.body;

  try {
    const user = await User.findOne({ mobile });

    if (!user)
      return res
        .status(400)
        .json({ message: "User not found, please register" });

    const token = jwt.sign(
      { userId: user._id, memberId: user.memberId },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get Logged-in User Info (GET)
router.get("/user-details", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(400).json({ message: "User not found" });

    res.status(200).json({
      name: user.name,
      mobile: user.mobile,
      email: user.email,
      memberId: user.memberId,
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;
