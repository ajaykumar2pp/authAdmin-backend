import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

// Register user
export const register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user exists
        const userExist = await User.findOne({ email: email.toLowerCase() });
        if (userExist) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email: email.toLowerCase(),
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Login user
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // 2FA Check
        if (user.twoFactorEnabled) {
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: "base32",
                token,
                email: user.email,
            });
            if (!verified) return res.status(401).json({ message: "Invalid 2FA token" });
        }


        // if (user.twoFactorEnabled) {
        //     return res.status(200).json({
        //         message: "2FA_REQUIRED",
        //         twoFactor: true,
        //         email: user.email,
        //     });
        // }

        const payload = { id: user._id };
        const tokenJWT = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", tokenJWT, {
            httpOnly: true,
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000  // 1 day
        });

        res.status(200).json({ message: "Login successful", user: { name: user.name, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


// Setup 2FA (Generate QR code and secret)
export const generate2FA = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const secret = speakeasy.generateSecret({ name: `MERNApp (${user.email})` });
        user.twoFactorSecret = secret.base32;
        user.twoFactorEnabled = true;
        await user.save();

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                console.error("QR generation error:", err);
                return res.status(500).json({ message: "QR generation failed" });
            }
            res.json({ qrCode: data_url, secret: secret.base32, userId: user._id });
        });
    }
    catch (error) {
        res.status(500).json({ message: "Internal server error", error });
    }
};


// Verify 2FA
export const verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ message: "Token is required" });
        // console.log(token);

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Prevent OTP reuse
        if (user.lastUsedOtp === token) {
            return res.status(401).json({ message: "OTP already used. Please try again." });
        }

        // validate current time-based OTP
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token,
            window:0,
        });

        if (!verified) return res.status(401).json({ message: "Invalid 2FA token" });

        // Save last used OTP
        user.lastUsedOtp = token;
        await user.save();

        // normal login if 2FA is not enabled
        const tokenJWT = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.cookie("token", tokenJWT, {
            httpOnly: true,
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000  // 1 day
        });
        res.status(200).json({ message: "2FA verified successfully", userId: user._id });
    }

    catch (error) {
        console.error("verify2FA error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};



// Profile 
export const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password -twoFactorSecret");
    res.status(200).json(user);
};


// Logout User
export const logout = (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });


}

export const login2 = async (req, res) => {
    const { email, password, token } = req.body;

    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        // If 2FA is enabled, require OTP token
        if (user.twoFactorEnabled) {
            if (!token) {
                return res.status(200).json({
                    message: "2FA_REQUIRED",
                    twoFactor: true,
                    email: user.email,
                });
            }

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: "base32",
                token,
            });

            if (!verified) return res.status(401).json({ message: "Invalid 2FA token" });
        }

        const payload = { id: user._id };
        const tokenJWT = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

        res.cookie("token", tokenJWT, {
            httpOnly: true,
            sameSite: "Lax",
            maxAge: 24 * 60 * 60 * 1000, // ✅ Fixed: 1 day in ms
        });

        res.status(200).json({
            message: "Login successful",
            user: { name: user.name, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};


// Login user
export const login3 = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // 🧠 Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        message: "2FA required",
        twoFactor: true,
        userId: user._id,
        twoFactorEnabled: true,
      });
    }

    // Normal login
    const tokenJWT = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", tokenJWT, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: { name: user.name, email: user.email },
      twoFactorEnabled: false,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
