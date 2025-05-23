import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        default: ""
    },
    lastUsedOtp: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },

});

const User = mongoose.model('User', userSchema);
export default User;
