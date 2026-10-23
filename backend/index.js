const express = require("express")
const app = express()
require("dotenv").config()
const mongoose = require("mongoose")
const cors = require("cors")

const userRoutes =require("./routes/userRoutes")
const categoryRoutes = require("./routes/categoryRoutes")
const charityRoutes = require("./routes/charityRoutes")
const productRoutes = require("./routes/productRoutes")
const addressRoutes = require("./routes/addressRoutes")
const orderRoutes = require("./routes/orderRoutes")

const mongo_url= process.env.MONGO_URL
const port= process.env.PORT || 8080

// Comma-separated list of allowed frontend origins, e.g.
// CLIENT_URL=http://localhost:5173,https://my-shop.vercel.app
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))

app.use(express.json())
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
})

app.use("/api/v1/users",userRoutes)
app.use("/api/v1/category",categoryRoutes)
app.use("/api/v1/charity",charityRoutes)
app.use("/api/v1/product",productRoutes)
app.use("/api/v1/address",addressRoutes)
app.use("/api/v1/order",orderRoutes)

app.use((req, res) => {
    res.status(404).json({ status: "Failed", message: `Route ${req.method} ${req.originalUrl} not found` })
})

app.use((err, req, res, next) => {
    console.error(err);
    const status = err.type === "entity.parse.failed" ? 400 : 500
    res.status(status).json({ status: "Failed", message: status === 400 ? "Invalid JSON body" : "Something went wrong" })
})

async function start(){
    if (!mongo_url || !process.env.JWT_SECRETE_KEY) {
        console.error("MONGO_URL and JWT_SECRETE_KEY must be set (see .env.example)");
        process.exit(1);
    }
    try{
        await mongoose.connect(mongo_url);
        console.log("Connected to DB");
    }catch(err){
        console.log("Error in connecting mongo db",err.message);
        process.exit(1);
    }
    app.listen(port,()=>{
        console.log(`Server is running on ${port} port`);
    })
}

start()
