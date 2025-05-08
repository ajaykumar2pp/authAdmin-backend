import Admin from "../models/Admin.js";

export const addAdmin = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const existing = await Admin.findOne({ email : email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const newAdmin = new Admin({ name, email, phone, address });
    await newAdmin.save();

    res.status(201).json({ message: "Admin added successfully", admin: newAdmin });
  } catch (error) {
    console.error("Add admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const getAdmins = async (req, res) => {
//   try {
//     const allAdmins = await Admin.find().sort({ createdAt: -1 });
//     res.status(200).json({admin: allAdmins });
//   } catch (error) {
//     console.error("Get admins error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getAdmins = async (req, res) => {
  const { page = 1, limit = 5, search = '' } = req.query;

  const query = {
    $or: [
      { name: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { address: new RegExp(search, 'i') },
    ],
  };

  
  try {
    const total = await Admin.countDocuments(query);
    const admins = await Admin.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      admins,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};
