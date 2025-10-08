import { Page, BlockStack, Badge, Button, Banner } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import SupplierDestinationCard from "./component/SupplierDestinationCard.jsx";
import AddProductsSection from "./component/AddProductsSection.jsx";
import ShipmentDetailsCard from "./component/ShipmentDetailsCards.jsx";
import { authenticate } from "../shopify.server.js";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { json } from "@remix-run/react";
import PurchaseOrder from "../models/purchase.js";

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
  let formattedOrders = []; // declare outside

  // Now pass to Select component
  const addressData = await admin.graphql(`
      query LocationsList {
        locations(first: 10) {
          edges {
            node {
              id
              name
              address {
                city
                country
                countryCode
                phone
                zip
                provinceCode
                province
                formatted
                latitude
                longitude
              }
              isActive
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `);

  const LocationAddress = await addressData.json();
  try {
    const orders = await PurchaseOrder.find({}).sort({ orderId: 1 }).lean();

    formattedOrders = orders.map((order) => ({
      supplier: {
        address: {
          street: order.supplier?.address?.street || "",
          city: order.supplier?.address?.city || "",
          state: order.supplier?.address?.state || "",
          zipCode: order.supplier?.address?.zipCode || "",
          country: order.supplier?.address?.country || "",
        },
        contact: {
          name: order.supplier?.contact?.name || "",
          email: order.supplier?.contact?.email || "",
          phone: order.supplier?.contact?.phone || "",
        },
      },
    }));
  } catch (err) {
    console.log(err);
  }

  // Now this works
  return json({
    LocationAddress,
    currencies: uniqueCurrencies,
    carrierOptions: uniqueCarrierOptions,
    formattedOrders,
  });
}

export default function AdditionalPage() {
  const shopify = useAppBridge();
  const navigate = useNavigate();
  const { carrierOptions, LocationAddress, formattedOrders } = useLoaderData();

  const currencies = [
    { label: "US Dollar (USD $)", value: "USD" },
    { label: "Euro (EUR €)", value: "EUR" },
    { label: "British Pound (GBP £)", value: "GBP" },
    { label: "Canadian Dollar (CAD $)", value: "CAD" },
    { label: "Afghan Afghani (AFN ؋)", value: "AFN" },
    { label: "Albanian Lek (ALL)", value: "ALL" },
    { label: "Algerian Dinar (DZD)", value: "DZD" },
    { label: "Angolan Kwanza (AOA Kz)", value: "AOA" },
    { label: "Argentine Peso (ARS $)", value: "ARS" },
    { label: "Armenian Dram (AMD ֏)", value: "AMD" },
    { label: "Aruban Florin (AWG)", value: "AWG" },
    { label: "Australian Dollar (AUD $)", value: "AUD" },
    { label: "Barbadian Dollar (BBD $)", value: "BBD" },
    { label: "Azerbaijani Manat (AZN ₼)", value: "AZN" },
    { label: "Bangladeshi Taka (BDT ৳)", value: "BDT" },
    { label: "Bahamian Dollar (BSD $)", value: "BSD" },
    { label: "Bahraini Dinar (BHD)", value: "BHD" },
    { label: "Burundian Franc (BIF)", value: "BIF" },
    { label: "Belarusian Ruble (BYN)", value: "BYN" },
    { label: "Belize Dollar (BZD $)", value: "BZD" },
    { label: "Bermudan Dollar (BMD $)", value: "BMD" },
    { label: "Bhutanese Ngultrum (BTN)", value: "BTN" },
    { label: "Bosnia-Herzegovina Convertible Mark (BAM KM)", value: "BAM" },
    { label: "Brazilian Real (BRL R$)", value: "BRL" },
    { label: "Bolivian Boliviano (BOB Bs)", value: "BOB" },
    { label: "Botswanan Pula (BWP P)", value: "BWP" },
    { label: "Brunei Dollar (BND $)", value: "BND" },
    { label: "Bulgarian Lev (BGN)", value: "BGN" },
    { label: "Myanmar Kyat (MMK K)", value: "MMK" },
    { label: "Cambodian Riel (KHR ៛)", value: "KHR" },
    { label: "Cape Verdean Escudo (CVE)", value: "CVE" },
    { label: "Cayman Islands Dollar (KYD $)", value: "KYD" },
    { label: "Central African CFA Franc (XAF FCFA)", value: "XAF" },
    { label: "Chilean Peso (CLP $)", value: "CLP" },
    { label: "Chinese Yuan (CNY ¥)", value: "CNY" },
    { label: "Colombian Peso (COP $)", value: "COP" },
    { label: "Comorian Franc (KMF CF)", value: "KMF" },
    { label: "Congolese Franc (CDF)", value: "CDF" },
    { label: "Costa Rican Colón (CRC ₡)", value: "CRC" },
    { label: "Croatian Kuna (HRK kn)", value: "HRK" },
    { label: "Czech Koruna (CZK Kč)", value: "CZK" },
    { label: "Danish Krone (DKK kr)", value: "DKK" },
    { label: "Djiboutian Franc (DJF)", value: "DJF" },
    { label: "Dominican Peso (DOP $)", value: "DOP" },
    { label: "East Caribbean Dollar (XCD $)", value: "XCD" },
    { label: "Egyptian Pound (EGP E£)", value: "EGP" },
    { label: "Eritrean Nakfa (ERN)", value: "ERN" },
    { label: "Ethiopian Birr (ETB)", value: "ETB" },
    { label: "Falkland Islands Pound (FKP £)", value: "FKP" },
    { label: "CFP Franc (XPF CFPF)", value: "XPF" },
    { label: "Fijian Dollar (FJD $)", value: "FJD" },
    { label: "Gibraltar Pound (GIP £)", value: "GIP" },
    { label: "Gambian Dalasi (GMD)", value: "GMD" },
    { label: "Ghanaian Cedi (GHS ₵)", value: "GHS" },
    { label: "Guatemalan Quetzal (GTQ Q)", value: "GTQ" },
    { label: "Guyanaese Dollar (GYD $)", value: "GYD" },
    { label: "Georgian Lari (GEL ₾)", value: "GEL" },
    { label: "Guinean Franc (GNF FG)", value: "GNF" },
    { label: "Haitian Gourde (HTG)", value: "HTG" },
    { label: "Honduran Lempira (HNL L)", value: "HNL" },
    { label: "Hong Kong Dollar (HKD HK$)", value: "HKD" },
    { label: "Hungarian Forint (HUF Ft)", value: "HUF" },
    { label: "Icelandic Króna (ISK kr)", value: "ISK" },
    { label: "Indian Rupee (INR ₹)", value: "INR" },
    { label: "Indonesian Rupiah (IDR Rp)", value: "IDR" },
    { label: "Israeli New Shekel (ILS ₪)", value: "ILS" },
    { label: "Iranian Rial (IRR)", value: "IRR" },
    { label: "Iraqi Dinar (IQD)", value: "IQD" },
    { label: "Jamaican Dollar (JMD $)", value: "JMD" },
    { label: "Japanese Yen (JPY ¥)", value: "JPY" },
    { label: "Jersey Pound (JEP)", value: "JEP" },
    { label: "Jordanian Dinar (JOD)", value: "JOD" },
    { label: "Kazakhstani Tenge (KZT ₸)", value: "KZT" },
    { label: "Kenyan Shilling (KES)", value: "KES" },
    { label: "Kiribati Dollar (KID)", value: "KID" },
    { label: "Kuwaiti Dinar (KWD)", value: "KWD" },
    { label: "Kyrgystani Som (KGS ⃀)", value: "KGS" },
    { label: "Laotian Kip (LAK ₭)", value: "LAK" },
    { label: "Latvian Lats (LVL)", value: "LVL" },
    { label: "Lebanese Pound (LBP L£)", value: "LBP" },
    { label: "Lesotho Loti (LSL)", value: "LSL" },
    { label: "Liberian Dollar (LRD $)", value: "LRD" },
    { label: "Libyan Dinar (LYD)", value: "LYD" },
    { label: "Lithuanian Litas (LTL)", value: "LTL" },
    { label: "Malagasy Ariary (MGA Ar)", value: "MGA" },
    { label: "Macedonian Denar (MKD)", value: "MKD" },
    { label: "Macanese Pataca (MOP)", value: "MOP" },
    { label: "Malawian Kwacha (MWK)", value: "MWK" },
    { label: "Maldivian Rufiyaa (MVR)", value: "MVR" },
    { label: "Mauritanian Ouguiya (MRU)", value: "MRU" },
    { label: "Mexican Peso (MXN $)", value: "MXN" },
    { label: "Malaysian Ringgit (MYR RM)", value: "MYR" },
    { label: "Mauritian Rupee (MUR Rs)", value: "MUR" },
    { label: "Moldovan Leu (MDL)", value: "MDL" },
    { label: "Moroccan Dirham (MAD)", value: "MAD" },
    { label: "Mongolian Tugrik (MNT ₮)", value: "MNT" },
    { label: "Mozambican Metical (MZN)", value: "MZN" },
    { label: "Namibian Dollar (NAD $)", value: "NAD" },
    { label: "Nepalese Rupee (NPR Rs)", value: "NPR" },
    { label: "Netherlands Antillean Guilder (ANG)", value: "ANG" },
    { label: "New Zealand Dollar (NZD $)", value: "NZD" },
    { label: "Nicaraguan Córdoba (NIO C$)", value: "NIO" },
    { label: "Nigerian Naira (NGN ₦)", value: "NGN" },
    { label: "Norwegian Krone (NOK kr)", value: "NOK" },
    { label: "Omani Rial (OMR)", value: "OMR" },
    { label: "Panamanian Balboa (PAB)", value: "PAB" },
    { label: "Pakistani Rupee (PKR Rs)", value: "PKR" },
    { label: "Papua New Guinean Kina (PGK)", value: "PGK" },
    { label: "Paraguayan Guarani (PYG ₲)", value: "PYG" },
    { label: "Peruvian Sol (PEN)", value: "PEN" },
    { label: "Philippine Piso (PHP ₱)", value: "PHP" },
    { label: "Polish Zloty (PLN zł)", value: "PLN" },
    { label: "Qatari Rial (QAR)", value: "QAR" },
    { label: "Romanian Leu (RON lei)", value: "RON" },
    { label: "Russian Ruble (RUB ₽)", value: "RUB" },
    { label: "Rwandan Franc (RWF RF)", value: "RWF" },
    { label: "Samoan Tala (WST)", value: "WST" },
    { label: "St. Helena Pound (SHP £)", value: "SHP" },
    { label: "Saudi Riyal (SAR)", value: "SAR" },
    { label: "Serbian Dinar (RSD)", value: "RSD" },
    { label: "Seychellois Rupee (SCR)", value: "SCR" },
    { label: "Sierra Leonean Leone (SLL)", value: "SLL" },
    { label: "Singapore Dollar (SGD $)", value: "SGD" },
    { label: "Sudanese Pound (SDG)", value: "SDG" },
    { label: "Somali Shilling (SOS)", value: "SOS" },
    { label: "Syrian Pound (SYP £)", value: "SYP" },
    { label: "South African Rand (ZAR R)", value: "ZAR" },
    { label: "South Korean Won (KRW ₩)", value: "KRW" },
    { label: "South Sudanese Pound (SSP £)", value: "SSP" },
    { label: "Solomon Islands Dollar (SBD $)", value: "SBD" },
    { label: "Sri Lankan Rupee (LKR Rs)", value: "LKR" },
    { label: "Surinamese Dollar (SRD $)", value: "SRD" },
    { label: "Swazi Lilangeni (SZL)", value: "SZL" },
    { label: "Swedish Krona (SEK kr)", value: "SEK" },
    { label: "Swiss Franc (CHF)", value: "CHF" },
    { label: "New Taiwan Dollar (TWD $)", value: "TWD" },
    { label: "Thai Baht (THB ฿)", value: "THB" },
    { label: "Tajikistani Somoni (TJS)", value: "TJS" },
    { label: "Tanzanian Shilling (TZS)", value: "TZS" },
    { label: "Tongan Paʻanga (TOP T$)", value: "TOP" },
    { label: "Trinidad & Tobago Dollar (TTD $)", value: "TTD" },
    { label: "Tunisian Dinar (TND)", value: "TND" },
    { label: "Turkish Lira (TRY ₺)", value: "TRY" },
    { label: "Turkmenistani Manat (TMT)", value: "TMT" },
    { label: "Ugandan Shilling (UGX)", value: "UGX" },
    { label: "Ukrainian Hryvnia (UAH ₴)", value: "UAH" },
    { label: "United Arab Emirates Dirham (AED)", value: "AED" },
    { label: "Uruguayan Peso (UYU $)", value: "UYU" },
    { label: "Uzbekistani Som (UZS)", value: "UZS" },
    { label: "Vanuatu Vatu (VUV)", value: "VUV" },
    { label: "Venezuelan Bolívar (VES)", value: "VES" },
    { label: "Vietnamese Dong (VND ₫)", value: "VND" },
    { label: "West African CFA Franc (XOF F CFA)", value: "XOF" },
    { label: "Yemeni Rial (YER)", value: "YER" },
    { label: "Zambian Kwacha (ZMW ZK)", value: "ZMW" },
    { label: "Belarusian Ruble (2000–2016) (BYR)", value: "BYR" },
    { label: "São Tomé & Príncipe Dobra (1977–2017) (STD)", value: "STD" },
    { label: "São Tomé & Príncipe Dobra (STN Db)", value: "STN" },
    { label: "Bolívar Soberano (VED)", value: "VED" },
    { label: "Venezuelan Bolívar (2008–2018) (VEF)", value: "VEF" },
    { label: "Unknown Currency (XXX)", value: "XXX" },
    { label: "USDC (USDC USD)", value: "USDC" },
  ];

  const [formData, setFormData] = useState({
    supplier: {
      paymentTerms: "",
      supplierCurrency: "",
      address: {
        company: "",
        street: "",
        apartment: "",
        city: "",
        state: " ",
        zipCode: "",
        country: "",
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
    destination: {
      optionName: "US Location",
      country: "United States",
      address: {
        phone: "",
        provinceCode: "",
        province: "",
        formatted: [],
        countryCode: "",
        company: "",
        street: "",
        apartment: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
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
    setSuccess(false);

    // Calculate subtotal and total for cost object
    const subtotal = formData.products.reduce((sum, item) => {
      const qty = item.inventoryQuantity || item.quantity || 0;
      const cost = parseFloat(item.cost) || 0;
      const taxPercent = parseFloat(item.tax) || 0;
      const taxAmount = Number((cost * taxPercent) / 100);
      return sum + qty * (cost + taxAmount);
    }, 0);
    const total =
      subtotal + parseFloat(formData.cost.shipping.replace("$", "") || 0);
    // Prepare payload with updated product totals
    const payload = {
      ...formData,
      products: formData.products.map((product) => {
        const qty = product.inventoryQuantity|| product.quantity || 0;
        const cost = parseFloat(product.cost) || 0;
        const taxPercent = parseFloat(product.tax) || 0;
        const taxAmount = Number((cost * taxPercent) / 100);
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
      navigate("/app");
    }
    navigate("/app");
  }, [formData]);



  // Helper to update form data
  const updateFormData = useCallback((path, value) => {
    setFormData((prev) => {
      const newData = { ...prev };

      if (!path.includes(".")) {
        newData[path] = value;
        return newData;
      }

      // Agar nested path hai (jaise "supplier.address.city")
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
      products: typeof updater === "function" ? updater(prev.products) : prev.products,
    }));
  }, []);
  return (
    <Page
      backAction={{ url: "/app" }}
      title={"New Purchase Order"}
      // titleMetadata={<Badge tone="info">Ordered</Badge>}
      primaryAction={
        <Button
          variant="primary"
          onClick={() => {
            handleSave(); // Your existing logic
          }}
        >
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
      
        <SupplierDestinationCard
          LocationAddress={LocationAddress}
          formattedOrders={formattedOrders}
          data={formData.supplier}
          currencies={currencies}
          mongodestination={formData.destination}
          onUpdate={(updatedSupplier) =>
            updateFormData("supplier", updatedSupplier)
          }
          destination={formData.destination}
          onDestinationUpdate={(updatedDestination) =>
            updateFormData("destination", updatedDestination)
          }
        />
        <ShipmentDetailsCard
          carrierOptions={carrierOptions}
          data={formData.shipment}
          onUpdate={(value) => updateFormData("shipment", value)}
        />
        <AddProductsSection
          supperCurrency={formData.supplier.supplierCurrency}
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
