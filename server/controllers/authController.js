const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // All users register as standard 'user'
    const finalRole = 'user';

    // Create user (password hashing is done via Mongoose pre-save hook in User model)
    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      phone
    });


    if (user) {
      res.status(201).json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          responseRate: user.responseRate,
          pastDealsCount: user.pastDealsCount,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user by normalized email (trim & lowercase)
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Verify credentials
    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          responseRate: user.responseRate,
          pastDealsCount: user.pastDealsCount,
          createdAt: user.createdAt
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const user = await User.findOne({ email });

    // Security: Always return the exact same success response to prevent email enumeration
    const genericSuccessResponse = {
      message: 'If that email is registered, a reset link has been sent.'
    };

    if (!user) {
      return res.status(200).json(genericSuccessResponse);
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save();

    // Create reset url (dynamically target the frontend port 5173 instead of backend 5000)
    const host = req.get('host') || 'localhost:5000';
    const clientHost = host.replace('5000', '5173');
    const resetUrl = `${req.protocol}://${clientHost}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please open the link below to reset your password:\n\n${resetUrl}\n\nThis link is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Rentica - Password Reset Request',
        text: message
      });

      res.status(200).json(genericSuccessResponse);
    } catch (err) {
      console.error('Mail Error: Failed to send reset email:', err.message);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    // Hash token from params to match stored hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    // Security: return identical generic message for invalid OR expired token cases
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link.' });
    }

    // Set new password (the User model pre-save hook handles hashing)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// @desc    Subscribe to price drop & verified listing email alerts
// @route   POST /api/auth/subscribe-alerts
// @access  Public
const subscribeAlerts = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const sendEmailFn = typeof sendEmail === 'function' ? sendEmail : sendEmail.sendEmail;
    if (sendEmailFn) {
      await sendEmailFn({
        to: email,
        subject: '[Rentica] New Rental Alerts Activated',
        text: `Hi,\n\nThank you for subscribing to Rentica rental alerts! You will now receive instant email notifications whenever new rental vehicles are listed near you.\n\nBest regards,\nRentica Team`
      });
    }

    res.json({ message: 'Subscribed! You will now receive price drop alerts via email.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  subscribeAlerts
};

