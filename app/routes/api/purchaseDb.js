import { json } from "@remix-run/node";
import mongoose from "mongoose";
import PurchaseOrders from "../../models/purchase";
// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function action({ request }) {
  try {
    await connectDB();

    const data = await request.json();
    // Validate cost object
    if (!data.cost || typeof data.cost !== "object") {
      throw new Error("cost must be an object");
    }

    const costFields = ["taxes_included", "subtotal", "shipping", "total"];
    costFields.forEach((field) => {
      if (!data.cost[field] || typeof data.cost[field] !== "string") {
        data.cost[field] = "$0.00";
      }
    });

    // Prepare products array
    const products = data.products.map((product) => {
      const qty = parseFloat(product.inventoryQuantity) || 0;
      const cost = parseFloat(product.cost) || 0;
      const taxPercent = parseFloat(product.tax) || 0;
      const taxAmount = (cost * taxPercent) / 100;
      const total = qty * (cost + taxAmount);
      return {
        id: product.id || "",
        title: product.displayName || product.title || "",
        quantity: qty,
        price: cost,
        sku: product.sku || "",
        total: total,
        tax: taxPercent,
        cost: cost,
      };
    });

    // Build validated data object
    // const validatedData = {
    //   supplier: {
    //     paymentTerms: data.supplier.paymentTerms || "",
    //     supplierCurrency: data.supplier.supplierCurrency || "",
    //     address: {
    //       company: data.supplier.address?.company || "",
    //       street: data.supplier.address?.street || "",
    //       apartment: data.supplier.address?.apartment || "",
    //       city: data.supplier.address?.city || "",
    //       state: data.supplier.address?.state || "",
    //       zipCode: data.supplier.address?.zipCode || "",
    //       country: data.supplier.address?.country || "",
    //     },
    //     contact: {
    //       name: data.supplier.contact?.name || "",
    //       email: data.supplier.contact?.email || "",
    //       phone: data.supplier.contact?.phone || "",
    //     },
    //     tax: data.supplier.tax || "0",
    //   },
    //   shipment: {
    //     estimatedArrival: data.shipment.estimatedArrival || "",
    //     shippingCarrier: data.shipment.shippingCarrier || "",
    //     trackingNumber: data.shipment.trackingNumber || "",
    //     trackingUrl: data.shipment.trackingUrl || "",
    //   },
    //   products: products,
    //   additional: {
    //     referenceNumber: data.additional.referenceNumber || "",
    //     noteToSupplier: data.additional.noteToSupplier || "",
    //     tag: data.additional.tag || "",
    //   },
    //   cost: {
    //     taxes_included: data.cost.taxes_included,
    //     subtotal: data.cost.subtotal,
    //     shipping: data.cost.shipping,
    //     total: data.cost.total,
    //   },
    // };

    const validatedData = {
      supplier: {
        paymentTerms: data?.supplier?.paymentTerms ?? "",
        supplierCurrency: data?.supplier?.supplierCurrency ?? "",
        address: {
          company: data?.supplier?.address?.company ?? "",
          street: data?.supplier?.address?.street ?? "",
          apartment: data?.supplier?.address?.apartment ?? "",
          city: data?.supplier?.address?.city ?? "",
          state: data?.supplier?.address?.state ?? "",
          zipCode: data?.supplier?.address?.zipCode ?? "",
          country: data?.supplier?.address?.country ?? "",
        },
        contact: {
          name: data?.supplier?.contact?.name ?? "",
          email: data?.supplier?.contact?.email ?? "",
          phone: data?.supplier?.contact?.phone ?? "",
        },
        tax: data?.supplier?.tax ?? "0",
      },
      destination: {
        optionName:data?.destination?.name,
        country: data.destination?.country || "United States", // Default country
        address: {
          phone: data.destination?.address?.phone || "",
          provinceCode: data.destination?.address?.provinceCode || "",
          province: data.destination?.address?.province || "",
          formatted: Array.isArray(data.destination?.address?.formatted)
            ? data.destination.address.formatted
            : data.destination?.address?.formatted ? [data.destination.address.formatted] : [],
          countryCode: data.destination?.address?.countryCode || "",
          company: data.destination?.address?.company || "",
          street: data.destination?.address?.street || "",
          apartment: data.destination?.address?.apartment || "",
          city: data.destination?.address?.city || "",
          state: data.destination?.address?.state || "",
          zipCode: data.destination?.address?.zipCode || "",
          country: data.destination?.address?.country || data.destination?.country || "United States",
        },
      },
      shipment: {
        estimatedArrival: data?.shipment?.estimatedArrival ?? "",
        shippingCarrier: data?.shipment?.shippingCarrier ?? "",
        trackingNumber: data?.shipment?.trackingNumber ?? "",
        trackingUrl: data?.shipment?.trackingUrl ?? "",
      },
      products: products ?? [],
      additional: {
        referenceNumber: data?.additional?.referenceNumber ?? "",
        noteToSupplier: data?.additional?.noteToSupplier ?? "",
        tag: data?.additional?.tag ?? "",
      },
      cost: {
        taxes_included: data?.cost?.taxes_included ?? 0,
        subtotal: data?.cost?.subtotal ?? 0,
        shipping: data?.cost?.shipping ?? 0,
        total: data?.cost?.total ?? 0,
      },
    };

    // Check if request is PUT (update) or POST (create)
    if (request.method === "PUT" && data.orderId) {
      // Update existing order
      const updatedPO = await PurchaseOrders.findOneAndUpdate(
        { orderId: data.orderId },
        { $set: validatedData },
        { new: true },
      );

      if (!updatedPO) {
        return json({ error: "Order not found" }, { status: 404 });
      }

      return json({
        success: true,
        id: updatedPO._id,
        orderId: updatedPO.orderId,
        orderNumber: updatedPO.orderNumber,
        message: "Order updated successfully",
      });
    } else {
      // Create new order
      // Get next orderId
      
      const lastPO = await PurchaseOrders.findOne()
        .sort({ orderId: -1 })
        .lean();
      const nextOrderId = lastPO ? lastPO.orderId + 1 : 1;
      validatedData.orderId = nextOrderId;
      validatedData.orderNumber = `PO${nextOrderId}`;

      const newPO = await PurchaseOrders.create(validatedData);

      return json({
        success: true,
        id: newPO._id,
        orderId: newPO.orderId,
        orderNumber: newPO.orderNumber,
        message: "Order created successfully",
      });
    }
  } catch (err) {
    return json(
      { error: "Failed to save PO", details: err.message },
      { status: 500 },
    );
  }
}

