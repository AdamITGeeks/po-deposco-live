// import mongoose from "mongoose";

// const PurchaseOrderSchema = new mongoose.Schema(
//   {
//     orderId: {
//       type: Number,
//       required: true,
//       unique: true,
//     },
//     orderNumber: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     supplier: {
//       paymentTerms: String,
//       supplierCurrency: String,

//       address: {
//         company: String,
//         street: String,
//         apartment: String,
//         city: String,
//         state: String,
//         zipCode: String,
//         country: String,
//       },
//       contact: {
//         name: String,
//         email: String,
//         phone: String,
//       },
//       tax: String,
//     },
//     shipment: {
//       estimatedArrival: String,
//       shippingCarrier: String,
//       trackingNumber: String,
//       trackingUrl: String,
//     },
//     products: [
//       {
//         id: String,
//         title: String,
//         quantity: Number,
//         price: Number,
//         sku: String,
//         total: Number,
//         tax: Number,
//         cost: Number,
//       },
//     ],
//     additional: {
//       referenceNumber: String,
//       noteToSupplier: String,
//       tag: String,
//     },
//     cost: {
//       taxes_included: String,
//       subtotal: String,
//       shipping: String,
//       total: String,
//     },
//   },

//   { timestamps: true },
// );

// const PurchaseOrder =
//   mongoose.models.PurchaseOrder ||
//   mongoose.model("PurchaseOrder", PurchaseOrderSchema);

// export default PurchaseOrder;
