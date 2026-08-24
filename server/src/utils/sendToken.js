const env = require('../config/env');

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  };

  if (env.isProd) {
    options.secure = true;
    options.sameSite = 'strict';
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        profileImage: user.profileImage,
        skills: user.skills,
        bio: user.bio,
      },
    });
};

module.exports = sendTokenResponse;
