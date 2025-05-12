import Admin from "../models/Admin.js";

export const addAdmin = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;

    const existing = await Admin.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const newAdmin = new Admin({ name, email: email.toLowerCase(), phone, address });
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

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search?.trim() || '';

    const query = {
      $or: [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
      ],
    };


    const total = await Admin.countDocuments(query);
    const admins = await Admin.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      admins,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalCount: total,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
};

// updateAdmin 
export const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    // Check if admin exists
    const existingAdmin = await Admin.findById(id);
    if (!existingAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // check if email is being changed and already used
    if (email && email !== existingAdmin.email) {
      const emailTaken = await Admin.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return res.status(400).json({ message: "Email already in use by another admin" });
      }
    }

    // Update fields
    existingAdmin.name = name || existingAdmin.name;
    existingAdmin.email = email || existingAdmin.email;
    existingAdmin.phone = phone || existingAdmin.phone;
    existingAdmin.address = address || existingAdmin.address;

    await existingAdmin.save();

    res.status(200).json({ message: "Admin updated successfully", admin: existingAdmin });

  } catch (error) {
    console.error("Update admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
}


// deleteAdmin
export const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const admin = await Admin.findById(id);
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    await Admin.findByIdAndDelete(id);

    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({ message: "Server error" });
  }
}