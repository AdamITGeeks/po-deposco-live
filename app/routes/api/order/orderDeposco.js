import { json } from "@remix-run/node";
import PurchaseOrder from "../../../models/purchase"; // apne path ke hisaab se import karo
 
export async function action({ request }) {
 
  try {
    const payload = await request.json();
  console.log(payload," console.log(payload)")
  console.log(payload?.order?.[0]?.number,"paylodnumber")
  console.log(payload?.order?.[0]?.number?.replace("PO_", ""),"paylodnumber")
  const numberId = payload?.order?.[0]?.number?.replace("PO_", "") ;
    const response = await fetch(
      "https://api.deposco.com/integration/RLL/orders/updates",
      {
        method: "POST",
        headers: {
          Authorization: "Basic cmNhbWJpYXM6RmVxZDIwMjUh",
          "X-Tenant-Code": "RLL",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
 
    const data = await response.json();
 
    if (response.ok && data) {
      // ✅ Agar API response success aata hai
      if (payload?.order?.[0]?.number?.replace("PO_", "")) {
        await PurchaseOrder.findOneAndUpdate(
          { orderId: Number(numberId)},   // jo order bheja tha
          { status: "Ordered" },          // status update
          { new: true }
        );
      }
    }
 
    return json({ success: true, data });
  } catch (error) {
    return json({ success: false, error: error.message }, { status: 500 });
  }
}