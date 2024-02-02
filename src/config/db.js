import mongoose from "mongoose";

const connectDB = () => {
    const uri = process.env.MONGODB_CONNECTION_URI;
    console.log(uri)
    mongoose.connect(uri,{
        autoCreate: true,
        autoIndex: true
    }).then((res)=>{
        console.log("DB Connected Successfully")
    }).catch((err)=>{
        console.log("Alas! DB Connection Error");
    })
}

export default connectDB;