const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });
const mongoose = require('mongoose');


const connectionDb = async () => {
    try {
        const mongoUrL = process.env.MONGO_URI;
        await mongoose.connect(mongoUrL);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error in connectionDb:", error);
        throw new Error("Database connection failed");
    }
};
module.exports = { connectionDb };