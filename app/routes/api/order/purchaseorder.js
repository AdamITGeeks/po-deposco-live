// import { json } from "@remix-run/node";
// import mongoose from "mongoose";
// import PurchaseOrders from "../../../models/purchase";

// // Connect to MongoDB
// const connectDB = async () => {
//   if (mongoose.connection.readyState === 1) return;
//   await mongoose.connect(process.env.MONGODB_URI);
// };

// export async function loader() {
//   try {
//     await connectDB();

//     // Mongo se saare purchase orders fetch karo
//     const allPOs = await PurchaseOrders.find().sort({ orderId: 1 }).lean();

//     return json({ success: true, data: allPOs });
//   } catch (err) {
//     return json({ error: "Failed to fetch POs", details: err.message }, { status: 500 });
//   }
// }
