import mongoose from "mongoose";

const PurchaseOrderSchema = new mongoose.Schema(
  {
    orderId: {
      type: Number,
      required: true,
      unique: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    supplier: {
      paymentTerms: String,
      supplierCurrency: String,
      address: {
        company: String,
        street: String,
        apartment: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
      contact: {
        name: String,
        email: String,
        phone: String,
      },
      tax: String,
    },
    shipment: {
      estimatedArrival: String,
      shippingCarrier: String,
      trackingNumber: String,
      trackingUrl: String,
    },
    destination: {
      country: {
        type: String,
        required: true,
      },
      address: {
        phone: String, // Changed from Number to String
        provinceCode: String,
        province: String,
        formatted: [String], // Array of strings for formatted address
        countryCode: String,
        company: String,
        street: String,
        apartment: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
      },
    },
    products: [
      {
        id: String,
        title: String,
        quantity: Number,
        price: Number,
        sku: String,
        total: Number,
        tax: Number,
        cost: Number,
      },
    ],
    additional: {
      referenceNumber: String,
      noteToSupplier: String,
      tag: String,
    },
    cost: {
      taxes_included: String,
      subtotal: String,
      shipping: String,
      total: String,
    },
  },
  { timestamps: true },
);

const PurchaseOrder =
  mongoose.models.PurchaseOrder ||
  mongoose.model("PurchaseOrder", PurchaseOrderSchema);

export default PurchaseOrder;