import { Page, BlockStack, Badge, Button, Banner } from "@shopify/polaris";
import { useCallback, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useLoaderData, useNavigate } from "@remix-run/react";
import PurchaseOrder from "../models/purchase";
import SupplierDestinationCard from "./component/SupplierDestinationCard.jsx";
import AddProductsSection from "./component/AddProductsSection.jsx";
import ShipmentDetailsCard from "./component/ShipmentDetailsCards.jsx";
import { authenticate } from "../shopify.server.js";

// Loader fetches order by orderId
export const loader = async ({ params, request }) => {
  const { id } = params;
  const { admin } = await authenticate.admin(request);

  try {
    const order = await PurchaseOrder.findOne({ orderId: parseInt(id) }).lean();
    if (!order) throw new Response("Order not found", { status: 404 });

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

    return {
      order,
      currencies: uniqueCurrencies,
      carrierOptions: uniqueCarrierOptions,
        LocationAddress: LocationAddress?.data?.locations?.edges || [],
    };
  } catch (err) {
    throw new Response("Internal Server Error", { status: 500 });
  }
};

export default function EditPurchaseOrderPage() {
  const navigate = useNavigate();
  const shopify = useAppBridge();
  const { order, carrierOptions, LocationAddress  } = useLoaderData();

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

  const totalTax = order.products.reduce((sum, product) => {
    const tax =
      typeof product.tax === "string"
        ? parseFloat(product.tax.replace(/[^0-9.]/g, ""))
        : product.tax;
    return sum + (tax || 0);
  }, 0);

  const grandTotal = order.products.reduce((sum, product) => {
    const total =
      typeof product.total === "string"
        ? parseFloat(product.total.replace(/[^0-9.]/g, ""))
        : product.total;
    return sum + (total || 0);
  }, 0);

  // State for form
  const [formData, setFormData] = useState({
    supplier: order.supplier,
    shipment: order.shipment,
    products: order.products,
    additional: order.additional,
    cost: order.cost,
    destination: order.destination
  });

  const [isEditing, setIsEditing] = useState(false); // initially read-only
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Update helpers
  const updateFormData = useCallback((path, value) => {
    setFormData((prev) => {
      const newData = { ...prev };
      let current = newData;
      const parts = path.split(".");
      for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]];
      current[parts[parts.length - 1]] = value;
      return newData;
    });
  }, []);

  const updateProducts = useCallback((updater) => {
    setFormData((prev) => ({
      ...prev,
      products: updater(prev.products),
    }));
  }, []);

  // Save updated order
  const handleSave = async () => {
    if (formData.products.length === 0) {
      setError("Please add at least one product.");
      setTimeout(() => setError(null), 4000);
      return;
    }

    try {
      const res = await fetch("/routes/api/purchaseDb", {
        method: "PUT", // use PUT for update
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, orderId: order.orderId }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.details || "Failed to update order");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(null);
      }, 4000);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsEditing(false);
    }
  };

  const orderNumber = order.orderNumber;
  const cleanOrder = orderNumber.replace(/^_/, "");
  const prefix = cleanOrder.match(/[A-Za-z]+/)[0]; // "PO"
  const number = cleanOrder.match(/\d+/)[0]; // "1"

  const parseCost = (val) => {
    if (!val) return 0.0;
    if (typeof val === "number") return val;
    return parseFloat(val.replace(/[^0-9.-]+/g, "")) || 0.0;
  };

  // Normalized cost object
  const normalizedCost = {
    subtotal: parseCost(order?.cost?.subtotal),
    shipping: parseCost(order?.cost?.shipping),
    taxes: parseCost(order?.cost?.taxes_included),
    total: parseCost(order?.cost?.total),
  };

  const createdAt = new Date(order?.createdAt);

  const year = createdAt.getFullYear();
  const month = String(createdAt.getMonth() + 1).padStart(2, "0"); // 0-indexed, isliye +1
  const day = String(createdAt.getDate()).padStart(2, "0");

  const formattedDateCreateDate = `${year}-${month}-${day}`;

  const updateAt = new Date(order?.updatedAt);
  const formattedDateUpdateDate = updateAt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  const formatOrderLines = (order) => {
    return {
      orderLine: order.products.map((item, index) => ({
        businessUnit: "FIREQUOCF_OCF",
        lineNumber: item?.sku,
        customerLineNumber: `#${item?.sku}--${index + 1}`,
        importReference: `${prefix}_${number}--${index + 1}`,
        lineStatus: "New",
        orderPackQuantity: item.quantity || 0,
        receivedPackQuantity: 0.0,
        receivedDamagedPackQuantity: 0.0,
        itemNumber: item?.sku || index + 1,
        itemDetails: {
          type: "Each",
          quantity: item.quantity || 0,
          weight: 0.0,
          dimension: {
            length: 0.0,
            width: 0.0,
            height: 0.0,
            units: "Inch",
          },
        },
        // taxCost: 0.0,
        // unitCost: item.price || 0.0,
        productCode: item?.sku,
        createdDateTime: formattedDateCreateDate,
        updatedDateTime: formattedDateUpdateDate,
        placedDate: formattedDateCreateDate,
        plannedShipDate: formattedDateCreateDate,
        plannedArrivalDate: formattedDateCreateDate,
        actualArrivalDate: formattedDateCreateDate,
        customFields: {
          customField: [
            { name: "field1Name", value: "field1Value", type: "String" },
            { name: "field2Name", value: "field2Value", type: "Integer" },
            { name: "field3Name", value: "field3Value", type: "Double" },
          ],
        },
        notes: null,
        customMappings: null,
        orderDiscountSubtotal: 0.0,
      })),
    };
  };

  // ✅ Main Payload
  const deposcoPayload = {
    order: [
      {
        businessUnit: "FIREQUOCF_OCF",
        number: `${prefix}_${number}0000`,
        type: "Purchase Order",
        status: "New",
        customerOrderNumber: `#${number}`,
        orderSource: "shopify",
        // ✅ use normalized cost values
        cost: {
          subtotal: `$${normalizedCost.subtotal || "100"}`,
          untaxableTotal: `$${0.0 || "100"}`,
          shipTotal: `$${normalizedCost.shipping || "100"}`,
          shippingTotal: `$${normalizedCost.shipping || "100"}`,
          taxTotal: `$${normalizedCost.taxes || "100"}`,
          total: `$${normalizedCost.total || "100"}`,
        },

        shipVendor: order?.supplier?.contact?.name || "Default Name",
        shipVia: order?.shipment?.shippingCarrier || "Shipping Standard",
        freight: {
          termsType: "Prepaid",
          billToAddress: null,
        },
        facility: "OCF",
        shipToAddress: {
          attention: order?.supplier?.contact?.name || "Unknown",
          addressLine1:
            order?.destination?.address?.formatted?.[2] || "Unknown Street",
          city: order?.destination?.address?.city || "Unknown City",
          stateProvinceCode: order?.destination?.address?.state || "XX",
          postalCode: order?.destination?.address?.zipCode || "00000",
          countryCode: order?.destination?.address?.countryCode || "US",
          phone: order?.supplier?.contact?.phone || "0000000000",
          email: order?.supplier?.contact?.email || "unknown@example.com",
          name: order?.supplier?.contact?.name || "Default Name",
        },
        billToAddress: {
          attention: order?.supplier?.contact?.name || "Unknown",
          addressLine1:
            order?.destination?.address?.formatted?.[2] || "Unknown Street",
          city: order?.destination?.address?.city || "Unknown City",
          stateProvinceCode: order?.destination?.address?.state || "XX",
          postalCode: order?.destination?.address?.zipCode || "00000",
          countryCode: order?.destination?.address?.countryCode || "US",
          phone: order?.supplier?.contact?.phone || "0000000000",
          email: order?.supplier?.contact?.email || "unknown@example.com",
          name: order?.supplier?.contact?.name || "Default Name",
        },
        notes: {
          note: [order?.additional?.noteToSupplier || "No notes"],
        },
        customFields: {
          customField: [
            { name: "field1Name", value: "field1Value", type: "String" },
            { name: "field2Name", value: "field2Value", type: "Integer" },
            { name: "field3Name", value: "field3Value", type: "Double" },
          ],
        },
        placedDate: formattedDateCreateDate,
        plannedArrivalDate: order?.shipment?.estimatedArrival,
        actualArrivalDate: order?.shipment?.estimatedArrival,
        orderLines: formatOrderLines(order),
      },
    ],
  };

  const handlepayload = async () => {
    try {
      const res = await fetch("/routes/api/order/orderDeposco", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deposcoPayload),
      });

      const data = await res.json();
    } catch (error) {
      console.error("Unexpected error in webhook:", error.message);
    }
  };
  return (
    <Page
      title={`Purchase Order - ${order.orderNumber}`}
      backAction={{ url: "/app" }}
      titleMetadata={
        <Badge tone={isEditing ? "attention" : "warning"}>
          {isEditing ? "Editing" : "Draft"}
        </Badge>
      }
      secondaryActions={
        isEditing ? (
          <Button onClick={() => setIsEditing(false)}>Cancel</Button>
        ) : (
          <Button variant="secondary" onClick={handlepayload}>
            Mark as ordered
          </Button>
        )
      }
      primaryAction={
        isEditing ? (
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        ) : (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            Edit Order
          </Button>
        )
      }
    >
      <BlockStack gap={300}>
        {error && <Banner tone="critical">{error}</Banner>}
        {success && <Banner tone="success">Order updated successfully!</Banner>}

        {/* Supplier Info */}
        <SupplierDestinationCard
          isEditing={isEditing}
          currencies={currencies}
            mongodestination={formData.destination}
          data={formData.supplier}
          onUpdate={(value) => updateFormData("supplier", value)}
          disabled={!isEditing} // initially read-only
          LocationAddress={LocationAddress} 
        />

        {/* Shipment Info */}
        <ShipmentDetailsCard
          isEditing={isEditing}
          carrierOptions={carrierOptions}
          data={formData.shipment}
          onUpdate={(value) => updateFormData("shipment", value)}
          disabled={!isEditing}
        />

        {/* Products Section */}
        <AddProductsSection
          isEditing={isEditing}
          shopify={shopify}
          products={formData.products}
          onProductsUpdate={updateProducts}
          additional={formData.additional}
          onAdditionalUpdate={(value) => updateFormData("additional", value)}
          cost={formData.cost}
          onCostUpdate={(value) => updateFormData("cost", value)}
          disabled={!isEditing}
        />
      </BlockStack>
    </Page>
  );
}