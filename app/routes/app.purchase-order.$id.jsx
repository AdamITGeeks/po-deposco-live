

// import { Page, BlockStack, Badge, Button, Banner } from "@shopify/polaris";
// import { useCallback, useState } from "react";
// import { useAppBridge } from "@shopify/app-bridge-react";
// import { useLoaderData, useNavigate } from "@remix-run/react";
// import PurchaseOrder from "../models/purchase";
// import SupplierDestinationCard from "./component/SupplierDestinationCard.jsx";
// import AddProductsSection from "./component/AddProductsSection.jsx";
// import ShipmentDetailsCard from "./component/ShipmentDetailsCards.jsx";
// import { authenticate } from "../shopify.server.js";

// // Loader fetches order by orderId
// export const loader = async ({ params, request }) => {
//   const { id } = params;
//   const { admin } = await authenticate.admin(request);

//   try {
//     const order = await PurchaseOrder.findOne({ orderId: parseInt(id) }).lean();
//     if (!order) throw new Response("Order not found", { status: 404 });

//     const response = await admin.graphql(`
//       query {
//         markets(first: 250) {
//           nodes {
//             currencySettings {
//               baseCurrency {
//                 currencyCode
//                 currencyName
//               }
//             }
//           }
//         }
//       }
//     `);

//     const data = await response.json();

//     const currencies = data.data.markets.nodes
//       .map((market) => market.currencySettings?.baseCurrency)
//       .filter(Boolean)
//       .map((currency) => ({
//         label: currency.currencyName,
//         value: currency.currencyCode.toLowerCase(),
//       }));

//     // Remove duplicates based on currency code
//     const uniqueCurrencies = Array.from(
//       new Map(currencies.map((c) => [c.value, c])).values(),
//     );

//     const carriersResponse = await admin.graphql(`
//       query {
//         availableCarrierServices {
//           carrierService {
//             name
//           }
//         }
//       }
//     `);

//     const carriersData = await carriersResponse.json();

//     // Map to { label, value } format
//     const carrierOptions = carriersData.data.availableCarrierServices
//       .map((item) => item.carrierService)
//       .filter(Boolean) // in case any null
//       .map((service) => ({
//         label: service.name,
//         value: service.name, // value same as name
//       }));

//     // Optional: remove duplicates if needed
//     const uniqueCarrierOptions = Array.from(
//       new Map(carrierOptions.map((c) => [c.value, c])).values(),
//     );

//     return {
//       order,
//       currencies: uniqueCurrencies,
//       carrierOptions: uniqueCarrierOptions,
//     };
//   } catch (err) {
//     throw new Response("Internal Server Error", { status: 500 });
//   }
// };

// export default function EditPurchaseOrderPage() {
//   const navigate = useNavigate();
//   const shopify = useAppBridge();
//   const { order, currencies, carrierOptions } = useLoaderData();
//   // State for form
//   const [formData, setFormData] = useState({
//     supplier: order.supplier,
//     shipment: order.shipment,
//     products: order.products,
//     additional: order.additional,
//     cost: order.cost,
//   });

//   const [isEditing, setIsEditing] = useState(false); // initially read-only
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);

//   // Update helpers
//   const updateFormData = useCallback((path, value) => {
//     setFormData((prev) => {
//       const newData = { ...prev };
//       let current = newData;
//       const parts = path.split(".");
//       for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]];
//       current[parts[parts.length - 1]] = value;
//       return newData;
//     });
//   }, []);

//   const updateProducts = useCallback((updater) => {
//     setFormData((prev) => ({
//       ...prev,
//       products: updater(prev.products),
//     }));
//   }, []);

//   // Save updated order
//   const handleSave = async () => {
//     if (formData.products.length === 0) {
//       setError("Please add at least one product.");
//       setTimeout(() => setError(null), 4000);
//       return;
//     }

//     try {
//       const res = await fetch("/routes/api/purchaseDb", {
//         method: "PUT", // use PUT for update
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ ...formData, orderId: order.orderId }),
//       });

//       const result = await res.json();
//       if (!res.ok) throw new Error(result.details || "Failed to update order");

//       setSuccess(true);
//       setTimeout(() => {
//         setSuccess(null);
//       }, 4000);
//       setIsEditing(false);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsEditing(false);
//     }
//   };

//   return (
//     <Page
//       title={`Purchase Order - ${order.orderNumber}`}
//       backAction={{ url: "/app" }}
//       titleMetadata={
//         <Badge tone={isEditing ? "attention" : "info"}>
//           {isEditing ? "Editing" : "Ordered"}
//         </Badge>
//       }
//       secondaryActions={
//         isEditing && <Button onClick={() => setIsEditing(false)}>Cancel</Button>
//       }
//       primaryAction={
//         isEditing ? (
//           <Button variant="primary" onClick={handleSave}>
//             Save Changes
//           </Button>
//         ) : (
//           <Button variant="primary" onClick={() => setIsEditing(true)}>
//             Edit Order
//           </Button>
//         )
//       }
//     >
//       <BlockStack gap={300}>
//         {error && <Banner tone="critical">{error}</Banner>}
//         {success && <Banner tone="success">Order updated successfully!</Banner>}

//         {/* Supplier Info */}
//         <SupplierDestinationCard
//           isEditing={isEditing}
//           currencies={currencies}
//           data={formData.supplier}
//           onUpdate={(value) => updateFormData("supplier", value)}
//           disabled={!isEditing} // initially read-only
//         />

//         {/* Shipment Info */}
//         <ShipmentDetailsCard
//           isEditing={isEditing}
//           carrierOptions={carrierOptions}
//           data={formData.shipment}
//           onUpdate={(value) => updateFormData("shipment", value)}
//           disabled={!isEditing}
//         />

//         {/* Products Section */}
//         <AddProductsSection
//           isEditing={isEditing}
//           shopify={shopify}
//           products={formData.products}
//           onProductsUpdate={updateProducts}
//           additional={formData.additional}
//           onAdditionalUpdate={(value) => updateFormData("additional", value)}
//           cost={formData.cost}
//           onCostUpdate={(value) => updateFormData("cost", value)}
//           disabled={!isEditing}
//         />
//       </BlockStack>
//     </Page>
//   );
// }
