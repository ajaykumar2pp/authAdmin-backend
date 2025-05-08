import mongoose from "mongoose";

const connectDB = async () => {
  try {
    
    const res = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");
    // console.log(`mongodb connected with server ${res.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1); 
  }
};

export default connectDB;