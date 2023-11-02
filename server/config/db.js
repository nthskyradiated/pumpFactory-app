import mongoose from "mongoose";
import ansi from '../../node_modules/ansi-colors-es6/index.js'

const connectDB = async () => {
const db = await mongoose.connect(process.env.MONGO_URI)
console.log(ansi.cyan.underline.bold(`MongoDB Connected: ${db.connection.host}`))
}




export default connectDB