// src/repositories/otp.repository.js
import OTP from "../models/otp.model.js";

class OtpRepository {
  async findValidOtp({ email, otp }) {
    return OTP.findOne({ email, otp, isVerified: false });
  }

  async incrementOtpAttempts(otpId) {
    return OTP.findByIdAndUpdate(otpId, { $inc: { verificationAttempts: 1 } }, { new: true });
  }

  async markOtpVerified(otpId) {
    return OTP.findByIdAndUpdate(otpId, { verifiedAt: new Date() }, { new: true });
  }

  async deleteOtpsByEmail(email) {
    return OTP.deleteMany({ email });
  }

  async findLatestUnverifiedByEmail(email) {
    return OTP.findOne({ email, isVerified: false }).sort({ createdAt: -1 });
  }

  async create(payload) {
    return (await OTP.create(payload)).toObject();
  }

  async deleteExpiredOtps() {
    return OTP.deleteMany({
      expiresAt: { $lt: new Date() },
    });
  }

  async getStatistics() {
    const now = new Date();

    const [totalOTPs, expiredOTPs, verifiedOTPs, activeOTPs, otpsByEmail] = await Promise.all([
      OTP.countDocuments(),
      OTP.countDocuments({ expiresAt: { $lt: now } }),
      OTP.countDocuments({ isVerified: true }),
      OTP.countDocuments({
        isVerified: false,
        expiresAt: { $gte: now },
      }),
      OTP.aggregate([
        {
          $group: {
            _id: "$email",
            totalOTPs: { $sum: 1 },
            verifiedOTPs: {
              $sum: { $cond: ["$isVerified", 1, 0] },
            },
          },
        },
        {
          $project: {
            email: "$_id",
            totalOTPs: 1,
            verifiedOTPs: 1,
            _id: 0,
          },
        },
        { $sort: { totalOTPs: -1 } },
      ]),
    ]);

    return {
      totalOTPs,
      activeOTPs,
      expiredOTPs,
      verifiedOTPs,
      otpsByEmail,
    };
  }
}

export default new OtpRepository();
