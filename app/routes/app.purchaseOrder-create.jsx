import { Page, BlockStack, Badge, Button, Banner } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import SupplierDestinationCard from "./component/SupplierDestinationCard.jsx";
import AddProductsSection from "./component/AddProductsSection.jsx";
import ShipmentDetailsCard from "./component/ShipmentDetailsCards.jsx";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server.js";
import { useLoaderData, useNavigate } from "@remix-run/react";

export async function loader({ request }) {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
  query {
    markets(first: 250) {
      nodes {
        currencySettings {
          baseCurrency {
            currencyCode
            currencyName
          }
        }
      }
    }
  }
`);

  const data = await response.json();

  const currencies = data.data.markets.nodes
    .map((market) => market.currencySettings?.baseCurrency)
    .filter(Boolean)
    .map((currency) => ({
      label: currency.currencyName,
      value: currency.currencyCode.toLowerCase(),
    }));

  // Remove duplicates based on currency code
  const uniqueCurrencies = Array.from(
    new Map(currencies.map((c) => [c.value, c])).values(),
  );

  const carriersResponse = await admin.graphql(`
  query {
    availableCarrierServices {
      carrierService {
        name
      }
    }
  }
`);

  const carriersData = await carriersResponse.json();

  // Map to { label, value } format
  const carrierOptions = carriersData.data.availableCarrierServices
    .map((item) => item.carrierService)
    .filter(Boolean) // in case any null
    .map((service) => ({
      label: service.name,
      value: service.name, // value same as name
    }));

  // Optional: remove duplicates if needed
  const uniqueCarrierOptions = Array.from(
    new Map(carrierOptions.map((c) => [c.value, c])).values(),
  );

  // Now pass to Select component

  return json({
    currencies: uniqueCurrencies,
    carrierOptions: uniqueCarrierOptions,
  });
}

export default function AdditionalPage() {
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const { currencies, carrierOptions } = useLoaderData();

  const [formData, setFormData] = useState({
    supplier: {
      paymentTerms: "advance",
      supplierCurrency: "usd",
      address: {
        company: "it gekss",
        street: "1224 Burke Street",
        apartment: "",
        city: "Hanahan",
        state: "South Carolina",
        zipCode: "29410",
        country: "United States",
      },
      contact: {
        name: "",
        email: "",
        phone: "",
      },
      tax: "0",
    },
    shipment: {
      estimatedArrival: new Date().toISOString().split("T")[0],
      shippingCarrier: " ",
      trackingNumber: "",
      trackingUrl: "",
    },
    products: [],
    additional: {
      referenceNumber: "",
      noteToSupplier: "",
      tag: "",
    },
    cost: {
      taxes_included: "$0.00",
      subtotal: "$0.00",
      shipping: "$0.00",
      total: "$0.00",
    },
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSave = useCallback(async () => {
    if (formData.products.length === 0) {
      setError("Please add at least one product.");
      setTimeout(() => {
        setError(null);
      }, 4000);
      return;
    }
    setError(null);
    navigate("/app");
    setSuccess(false);

    // Calculate subtotal and total for cost object
    const subtotal = formData.products.reduce((sum, item) => {
      const qty = parseFloat(item.inventoryQuantity) || 0;
      const cost = parseFloat(item.cost) || 0;
      const taxPercent = parseFloat(item.tax) || 0;
      const taxAmount = (cost * taxPercent) / 100;
      return sum + qty * (cost + taxAmount);
    }, 0);
    const total =
      subtotal + parseFloat(formData.cost.shipping.replace("$", "") || 0);
    // Prepare payload with updated product totals
    const payload = {
      ...formData,
      products: formData.products.map((product) => {
        const qty = parseFloat(product.inventoryQuantity) || 0;
        const cost = parseFloat(product.cost) || 0;
        const taxPercent = parseFloat(product.tax) || 0;
        const taxAmount = (cost * taxPercent) / 100;
        return {
          ...product,
          quantity: qty,
          total: qty * (cost + taxAmount),
        };
      }),
      cost: {
        ...formData.cost,
        subtotal: `$${subtotal.toFixed(2)}`,
        total: `$${total.toFixed(2)}`,
      },
    };
    try {
      const response = await fetch("/routes/api/purchaseDb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.details || "Failed to save purchase order");
      }
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    }
  }, [formData]);

  // Helper to update form data
  const updateFormData = useCallback((path, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      const parts = path.split(".");
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  }, []);

  // Helper to update products array
  const updateProducts = useCallback((updater) => {
    setFormData((prev) => ({
      ...prev,
      products: updater(prev.products),
    }));
  }, []);
  
  return (
    <Page
      backAction={{ url: "/app" }}
      title={"New Purchase Order"}
      titleMetadata={<Badge tone="info">Ordered</Badge>}
      primaryAction={
        <Button variant="primary" onClick={handleSave}>
          Create Purchase Order
        </Button>
      }
    >
      <BlockStack gap={300}>
        {error && (
          <Banner tone="critical" title="Error">
            {error}
          </Banner>
        )}
        {success && (
          <Banner tone="success" title="Success">
            Purchase order saved successfully!
          </Banner>
        )}
        <SupplierDestinationCard
          data={formData.supplier}
          currencies={currencies}
          onUpdate={(value) => updateFormData("supplier", value)}
        />
        <ShipmentDetailsCard
          carrierOptions={carrierOptions}
          data={formData.shipment}
          onUpdate={(value) => updateFormData("shipment", value)}
        />
        <AddProductsSection
          shopify={shopify}
          products={formData.products}
          onProductsUpdate={updateProducts}
          additional={formData.additional}
          onAdditionalUpdate={(value) => updateFormData("additional", value)}
          cost={formData.cost}
          onCostUpdate={(value) => updateFormData("cost", value)}
        />
      </BlockStack>
    </Page>
  );
}
