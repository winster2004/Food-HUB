// mongopassword=jgUYh0afhTqzd9dC
// asurendrakumarpatel
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI!);
        console.log('mongoDB connected.');
    } catch (error: any) {
        console.error('MongoDB Connection Error:', error.message);
        console.error('Connection URI:', process.env.MONGO_URI);
        process.exit(1);
    }
}
export default connectDB;