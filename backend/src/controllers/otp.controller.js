const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/jwt');
const { sendOtpEmail } = require('../utils/mailer');
const { sendOtpSms } = require('../utils/sms');

const prisma = new PrismaClient();

function generateOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtp(req, res, next) {
  try {
    const { email, phone } = req.body;
    if (!email && !phone) return res.status(400).json({ message: 'Email or phone number is required.' });

    const where = email ? { email } : { phone };
    const user = await prisma.user.findFirst({ where });
    if (!user) return res.status(404).json({ message: 'No account found with that email or phone.' });

    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.otp.create({
      data: { userId: user.id, code, expiresAt, type: 'LOGIN' },
    });

    const deliveries = [];
    if (email) deliveries.push(sendOtpEmail(email, code, user.username));
    if (phone) deliveries.push(sendOtpSms(phone, code, user.username));

    await Promise.all(deliveries);

    const channels = email && phone ? 'email and mobile' : email ? 'email' : 'mobile';
    res.json({ message: `OTP sent to your ${channels}.`, userId: user.id });
  } catch (err) {
    next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { userId, code } = req.body;
    if (!userId || !code) return res.status(400).json({ message: 'userId and code are required.' });

    const otp = await prisma.otp.findFirst({
      where: { userId, code, used: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) return res.status(401).json({ message: 'Invalid or expired OTP.' });

    await prisma.otp.update({ where: { id: otp.id }, data: { used: true } });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const token = generateToken(user);
    const { password: _, ...userData } = user;

    res.json({ token, user: userData });
  } catch (err) {
    next(err);
  }
}

async function guestLogin(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    const username = `guest_${Date.now()}`;
    const guestEmail = email || `${username}@guest.pos`;

    const user = await prisma.user.create({
      data: {
        username,
        email: guestEmail,
        password: '',
        role: 'CUSTOMER',
        phone: phone || null,
        isSuperadmin: false,
      },
    });

    const token = generateToken(user);
    const { password: _, ...userData } = user;

    res.json({ token, user: userData, isGuest: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendOtp, verifyOtp, guestLogin };