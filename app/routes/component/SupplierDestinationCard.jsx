// import {
//   Box,
//   Card,
//   Text,
//   BlockStack,
//   Button,
//   TextField,
//   Select,
//   InlineGrid,
//   Bleed,
//   Divider,
//   Modal,
//   List,
//   InlineStack,
// } from "@shopify/polaris";
// import { useCallback, useState, useMemo, useEffect } from "react";
// import { Country, State } from "country-state-city";

// export default function SupplierDestinationCard({
//   data,
//   onUpdate,
//   currencies,
//   isEditing = true,
//   LocationAddress,
//   destination,
//   mongodestination,
//   onDestinationUpdate,
// }) {
//   // Supplier currency state

//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [supplierCurrency, setSupplierCurrency] = useState(
//     data.supplierCurrency,
//   );
//   const [suppliers, setSuppliers] = useState([]);
//   const [selectModalActive, setSelectModalActive] = useState(false);
//   // Address and contact state
//   const [address, setAddress] = useState(data.address);
//   const [contact, setContact] = useState(data.contact);
//   const [tax, setTax] = useState(data.tax);

//   // Modal state
//   const [modalActive, setModalActive] = useState(false);
//   const [tempAddress, setTempAddress] = useState(data.address);
//   const [tempContact, setTempContact] = useState(data.contact);
//   const [tempTax, setTempTax] = useState(data.tax);

//   useEffect(() => {
//     setCountries(Country.getAllCountries());
//   }, []);

//   useEffect(() => {
//     async function fetchSuppliers() {
//       try {
//         const res = await fetch("/routes/api/order/purchaseorder"); // Adjust API path if needed
//         const result = await res.json();
//         if (result.success && Array.isArray(result.data)) {
//           // Extract supplier details from all orders
//           const supplierList = result.data
//             .map((order) => ({
//               ...order.supplier?.address,
//               contact: order.supplier?.contact,
//               tax: order.supplier?.tax,
//               supplierCurrency: order.supplier?.supplierCurrency,
//               id: order._id,
//             }))
//             .filter((s) => s.company);
//           setSuppliers(supplierList);
//         }
//       } catch (err) {}
//     }
//     fetchSuppliers();
//   }, []);

//   const handleSelectSupplier = useCallback(
//     (supplier) => {
//       setAddress(supplier);
//       setContact(supplier.contact);
//       setTax(supplier.tax);
//       setSupplierCurrency(supplier.supplierCurrency);
//       onUpdate({
//         ...data,
//         address: supplier,
//         contact: supplier.contact,
//         tax: supplier.tax,
//         supplierCurrency: supplier.supplierCurrency,
//       });
//       setSelectModalActive(false);
//     },
//     [onUpdate, data],
//   );

//   // Add supplier handler (from modal)
//   const handleAddSupplier = useCallback(() => {
//     setSelectModalActive(false);
//     setModalActive(true); // Open add/edit modal
//   }, []);

//   const handleSupplierCurrencyChange = useCallback(
//     (value) => {
//       setSupplierCurrency(value);
//       onUpdate({ ...data, supplierCurrency: value });
//     },
//     [data, onUpdate],
//   );

//   // Location state from LocationAddress
//   const locations = useMemo(() => {
//     return (
//       LocationAddress?.data?.locations?.edges?.map(({ node }) => node) ||
//       LocationAddress?.map(({ node }) => node) ||
//       []
//     );
//   }, [LocationAddress]);

//   const [selectedLocation, setSelectedLocation] = useState(() => {
//     // If destination has address data, try to match to a location for edit mode
//     if (
//       destination?.address?.formatted &&
//       destination.address.formatted.length > 0
//     ) {
//       const destFormatted = Array.isArray(destination.address.formatted)
//         ? destination.address.formatted.join(", ")
//         : destination.address.formatted;
//       const matchingLocation = locations.find((loc) => {
//         const locFormatted = Array.isArray(loc.address.formatted)
//           ? loc.address.formatted.join(", ")
//           : loc.address.formatted;
//         return locFormatted === destFormatted;
//       });
//       if (matchingLocation) return matchingLocation;
//     }
//     // No default selection for create mode
//     // Fall back to mongodestination if destination doesn't match any location

//     if (mongodestination?.address?.formatted?.length > 0) {
//       return {
//         name: mongodestination?.address?.country || "Mongo Destination",

//         address: mongodestination.address,
//       };
//     }

//     // If nothing matches, return null
//     return null;
//   });

//   const locationOptions = useMemo(() => {
//     const options = locations.map((loc) => ({
//       label: loc.name,
//       value: loc.name,
//     }));
//     // Add default option if no locations are available
//     if (options.length === 0) {
//       options.push({
//         label: "US Location",
//         value: "US Location",
//       });
//     }
//     return options;
//   }, [locations]);

//   // Handle location selection
//   const handleLocationChange = useCallback(
//     (value) => {
//       const selected = locations.find((loc) => loc.name === value) || {
//         name: value,
//         address: {
//           city: "",
//           country: "United States", // Default country agar location nahi mili
//           countryCode: "",
//           phone: "",
//           zip: "",
//           province: "",
//           provinceCode: "",
//           formatted: [],
//         },
//       };
//       setSelectedLocation(selected);

//       // Update complete destination object
//       const updatedDestination = {
//         optionName: selected?.name,

//         country: selected?.address?.country || "United States", // Ensure country is set
//         address: {
//           phone: selected?.address?.phone || "",
//           provinceCode: selected?.address?.provinceCode || "",
//           province: selected?.address?.province || "",
//           formatted: Array.isArray(selected?.address?.formatted)
//             ? selected?.address.formatted
//             : selected?.address?.formatted
//               ? [selected?.address.formatted]
//               : [],
//           countryCode: selected?.address?.countryCode || "",
//           company: selected?.address?.company || "",
//           street: selected?.address?.street || "",
//           apartment: selected.address?.apartment || "",
//           city: selected?.address?.city || "",
//           state: selected?.address?.province || "", // Map province to state if needed
//           zipCode: selected?.address?.zip || "",
//           country: selected?.address?.country || "",
//         },
//       };
//       console.log(updatedDestination, "u[datenlkflka");

//       onDestinationUpdate(updatedDestination);
//     },
//     [locations, onDestinationUpdate],
//   );

//   const toggleModal = useCallback(() => {
//     if (!modalActive) {
//       setTempAddress(address);
//       setTempContact(contact);
//       setTempTax(tax);
//     }
//     setModalActive((active) => !active);
//   }, [modalActive, address, contact, tax]);

//   // const handleTempAddressChange = useCallback((field, value) => {
//   //   setTempAddress((prev) => ({ ...prev, [field]: value }));
//   // }, []);

//   const handleTempAddressChange = useCallback((field, value) => {
//     setTempAddress((prev) => {
//       let updated = { ...prev, [field]: value };
//       // If country changes, reset state and zipCode
//       if (field === "country") {
//         updated.state = "";
//         updated.zipCode = "";
//       }
//       // If state changes, update zipCode from mapping
//       if (field === "state") {
//         const zip =
//           countryStateZip[updated.country]?.states.find(
//             (s) => s.value === value,
//           )?.zip || "";
//         updated.zipCode = zip;
//       }
//       return updated;
//     });
//   }, []);

//   const handleTempContactChange = useCallback((field, value) => {
//     setTempContact((prev) => ({ ...prev, [field]: value }));
//   }, []);

//   const handleSave = useCallback(() => {
//     setAddress(tempAddress);
//     setContact(tempContact);
//     setTax(tempTax);
//     onUpdate({
//       ...data,
//       address: tempAddress,
//       contact: tempContact,
//       tax: tempTax,
//     });
//     if (!suppliers.some((s) => s.company === tempAddress.company)) {
//       setSuppliers((prev) => [
//         ...prev,
//         {
//           ...tempAddress,
//           contact: tempContact,
//           tax: tempTax,
//           supplierCurrency,
//         },
//       ]);
//     }
//     console.log("tempassress", tempAddress);
//     toggleModal();
//   }, [
//     tempAddress,
//     tempContact,
//     tempTax,
//     suppliers,
//     data,
//     onUpdate,
//     toggleModal,
//   ]);

//   function findLocationNameByFormatted(LocationAddress, mongodestination) {
//     if (!LocationAddress || !Array.isArray(LocationAddress)) {
//       return null; // Ya koi default value
//     }

//     const mongoFormattedStr =
//       mongodestination?.address?.formatted?.join(",").toLowerCase() || "";

//     for (const option of LocationAddress) {
//       const formatted = option?.node?.address?.formatted;

//       if (formatted) {
//         const optionFormattedStr = formatted.join(",").toLowerCase();

//         if (optionFormattedStr === mongoFormattedStr) {
//           return option.node.name;
//         }
//       }
//     }

//     return null;
//   }

//   const name = LocationAddress
//     ? findLocationNameByFormatted(LocationAddress, mongodestination)
//     : null;

//   const countryStateZip = {
//     "United States": {
//       states: [
//         { label: "California", value: "California", zip: "90001" },
//         { label: "New York", value: "New York", zip: "10001" },
//         { label: "South Carolina", value: "South Carolina", zip: "29020" },
//       ],
//     },
//     Canada: {
//       states: [
//         { label: "Ontario", value: "Ontario", zip: "K1A 0B1" },
//         { label: "Quebec", value: "Quebec", zip: "G1A 0A2" },
//       ],
//     },
//     India: {
//       states: [
//         { label: "Maharashtra", value: "Maharashtra", zip: "400001" },
//         { label: "Delhi", value: "Delhi", zip: "110001" },
//       ],
//     },
//   };

//   const selectedCountry = tempAddress?.country || "United States";
//   const stateOptions =
//     countryStateZip[selectedCountry]?.states.map((s) => ({
//       label: s.label,
//       value: s.value,
//     })) || [];

//   const selectedState = tempAddress?.state;
//   const zipCode =
//     countryStateZip[selectedCountry]?.states.find(
//       (s) => s.value === selectedState,
//     )?.zip || "";

//   const uniqueSuppliers = suppliers.filter((supplier, index, self) => {
//     return (
//       self.findIndex(
//         (s) =>
//           s.contact?.name === supplier.contact?.name &&
//           s.address?.street === supplier.address?.street &&
//           s.address?.apartment === supplier.address?.apartment &&
//           s.address?.city === supplier.address?.city &&
//           s.address?.state === supplier.address?.state &&
//           s.address?.zipCode === supplier.address?.zipCode &&
//           s.address?.country === supplier.address?.country,
//       ) === index
//     );
//   });

//   useEffect(() => {
//     if (LocationAddress && mongodestination) {
//       const matchedName = findLocationNameByFormatted(
//         LocationAddress,
//         mongodestination,
//       );
//       if (matchedName) {
//         const matchedLocation = locations.find(
//           (loc) => loc.name === matchedName,
//         );
//         if (matchedLocation) {
//           setSelectedLocation(matchedLocation);
//         }
//       }
//     }
//   }, [LocationAddress, mongodestination, locations]);

//   return (
//     <Card sectioned>
//       <BlockStack gap="400">
//         <InlineGrid columns={2} gap="400">
//           <Box style={{ borderRight: "1px solid #dcdcdc" }}>
//             <Text variant="bodyMd" fontWeight="bold">
//               Supplier
//             </Text>
//             {address && (
//               <BlockStack gap="200">
//                 <Text fontWeight="bold" variant="bodyLg" tone="subdued">
//                   {address.company}
//                 </Text>
//                 <Text tone="subdued">
//                   {address.street} {address.city} {address.state}{" "}
//                   {address.zipCode} {address.country}
//                 </Text>
//               </BlockStack>
//             )}
//             <BlockStack inlineAlign="start">
//               <Button
//                 disabled={!isEditing}
//                 variant="plain"
//                 onClick={() => setSelectModalActive(true)}
//               >
//                 {address ? "Select Supplier" : "Add Supplier"}
//               </Button>
//             </BlockStack>
//           </Box>
//           <BlockStack gap="200">
//             <Text variant="bodyMd" fontWeight="bold">
//               Destination
//             </Text>
//             <Select
//               options={locationOptions}
//               value={selectedLocation?.name || ""}
//               onChange={handleLocationChange}
//               disabled={!isEditing}
//               placeholder="Select a location"
//             />

//             <Text fontWeight="bold" variant="bodyLg">
//               {selectedLocation?.name || "No location selected"}
//             </Text>

//             <Text tone="subdued">
//               {selectedLocation?.address?.formatted?.join(", ") || ""}
//             </Text>
//           </BlockStack>
//         </InlineGrid>

//         <Bleed marginInline="400">
//           <Divider />
//         </Bleed>
//         <InlineGrid columns={1} gap="400">
//           <Select
//             disabled={!isEditing}
//             label="Supplier currency"
//             options={currencies}
//             value={supplierCurrency?.toUpperCase() || ""}
//             onChange={handleSupplierCurrencyChange}
//           />
//         </InlineGrid>
//       </BlockStack>

//       <Modal
//         open={selectModalActive}
//         onClose={() => setSelectModalActive(false)}
//         title="Select Supplier"
//         secondaryActions={[
//           {
//             content: "Add Supplier",
//             onAction: () => {
//               handleAddSupplier();
//               setTempAddress(null);
//             },
//           },
//         ]}
//       >
//         <Modal.Section>
//           <BlockStack gap="200">
//             {uniqueSuppliers.length === 0 ? (
//               <Text>No suppliers found.</Text>
//             ) : (
//               uniqueSuppliers.map((supplier, index) => (
//                 <InlineStack
//                   key={`${supplier.id}-${index}`}
//                   align="space-between"
//                 >
//                   <Button
//                     onClick={() => handleSelectSupplier(supplier)}
//                     variant="tertiary"
//                   >
//                     <List type="bullet">
//                       <List.Item>
//                         {supplier?.contact?.name} {supplier.street}{" "}
//                         {supplier.state} ({supplier.country})
//                       </List.Item>
//                     </List>
//                   </Button>
//                   <Button
//                     onClick={() => {
//                       handleSelectSupplier(supplier);
//                     }}
//                     variant="primary"
//                   >
//                     Add
//                   </Button>
//                 </InlineStack>
//               ))
//             )}
//           </BlockStack>
//         </Modal.Section>
//       </Modal>

//       {/* Edit Supplier Modal */}
//       <Modal
//         open={modalActive}
//         onClose={toggleModal}
//         title="Edit supplier"
//         primaryAction={{
//           content: "Save",
//           onAction: handleSave,
//           disabled: !isEditing || !tempAddress,
//         }}
//         secondaryActions={[
//           { content: "Close", onAction: toggleModal },
//           {
//             content: "Delete supplier",
//             destructive: true,
//             onAction: () => {
//               toggleModal();
//               setAddress(null);
//             },
//             disabled: !isEditing || !address,
//           },
//         ]}
//       >
//         <Modal.Section>
//           <BlockStack gap="400">
//             <TextField
//               disabled={!isEditing}
//               label="Company"
//               value={tempAddress?.company || ""}
//               onChange={(value) => handleTempAddressChange("company", value)}
//               autoComplete="off"
//             />
//             {/* <TextField
//               disabled={!isEditing}
//               label="Country/Region"
//               value={tempAddress?.country || ""}
//               onChange={(value) => handleTempAddressChange("country", value)}
//               autoComplete="off"
//             /> */}

//             <Select
//               disabled={!isEditing}
//               label="Country/Region"
//               options={Object.keys(countryStateZip).map((c) => ({
//                 label: c,
//                 value: c,
//               }))}
//               value={selectedCountry}
//               onChange={(value) => handleTempAddressChange("country", value)}
//             />

//             <TextField
//               disabled={!isEditing}
//               label="Address"
//               value={tempAddress?.street || ""}
//               onChange={(value) => handleTempAddressChange("street", value)}
//               autoComplete="off"
//               placeholder=""
//             />

//             <InlineGrid columns={2} gap="200">
//               <TextField
//                 disabled={!isEditing}
//                 label="City"
//                 value={tempAddress?.city || ""}
//                 onChange={(value) => handleTempAddressChange("city", value)}
//                 autoComplete="off"
//               />
//               <Select
//                 disabled={!isEditing || !selectedCountry}
//                 label="State"
//                 options={stateOptions}
//                 value={selectedState || ""}
//                 onChange={(value) => handleTempAddressChange("state", value)}
//               />
//             </InlineGrid>

//             <TextField
//               disabled={!isEditing}
//               label="ZIP code"
//               value={tempAddress?.zipCode || zipCode || ""}
//               onChange={(value) => handleTempAddressChange("zipCode", value)}
//               autoComplete="off"
//             />
//             <TextField
//               disabled={!isEditing}
//               label="Contact name"
//               value={tempContact?.name || ""}
//               onChange={(value) => handleTempContactChange("name", value)}
//               autoComplete="off"
//             />
//             <InlineGrid columns={2} gap="200">
//               <TextField
//                 disabled={!isEditing}
//                 label="Email address"
//                 value={tempContact?.email || ""}
//                 onChange={(value) => handleTempContactChange("email", value)}
//                 autoComplete="off"
//               />
//               <TextField
//                 disabled={!isEditing}
//                 label="Phone number"
//                 type="number"
//                 value={tempContact?.phone?.split(" ")[0] || ""}
//                 onChange={(value) =>
//                   handleTempContactChange(
//                     "phone",
//                     `${value} ${tempContact?.phone?.split(" ")[1] || ""}`,
//                   )
//                 }
//               />
//             </InlineGrid>
//           </BlockStack>
//         </Modal.Section>
//       </Modal>
//     </Card>
//   );
// }

import {
  Box,
  Card,
  Text,
  BlockStack,
  Button,
  TextField,
  Select,
  InlineGrid,
  Bleed,
  Divider,
  Modal,
  List,
  InlineStack,
} from "@shopify/polaris";
import { useCallback, useState, useMemo, useEffect } from "react";
import { Country, State } from "country-state-city";

export default function SupplierDestinationCard({
  data,
  onUpdate,
  currencies,
  isEditing = true,
  LocationAddress,
  destination,
  mongodestination,
  onDestinationUpdate,
}) {
  // Supplier currency state
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [supplierCurrency, setSupplierCurrency] = useState(
    data.supplierCurrency,
  );
  const [suppliers, setSuppliers] = useState([]);
  const [selectModalActive, setSelectModalActive] = useState(false);
  // Address and contact state
  const [address, setAddress] = useState(data.address);
  const [contact, setContact] = useState(data.contact);
  const [tax, setTax] = useState(data.tax);

  // Modal state
  const [modalActive, setModalActive] = useState(false);
  const [tempAddress, setTempAddress] = useState(data.address);
  const [tempContact, setTempContact] = useState(data.contact);
  const [tempTax, setTempTax] = useState(data.tax);

  // Load countries on mount
  useEffect(() => {
    const countryList = Country.getAllCountries().map((country) => ({
      label: country.name,
      value: country.name,
    }));
    setCountries(countryList);
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (tempAddress?.country) {
      const country = Country.getAllCountries().find(
        (c) => c.name === tempAddress.country,
      );
      if (country) {
        const stateList = State.getStatesOfCountry(country.isoCode).map(
          (state) => ({
            label: state.name,
            value: state.name,
          }),
        );
        setStates(stateList);
      } else {
        setStates([]);
      }
    } else {
      setStates([]);
    }
  }, [tempAddress?.country]);

  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const res = await fetch("/routes/api/order/purchaseorder");
        const result = await res.json();
        if (result.success && Array.isArray(result.data)) {
          const supplierList = result.data
            .map((order) => ({
              ...order.supplier?.address,
              contact: order.supplier?.contact,
              tax: order.supplier?.tax,
              supplierCurrency: order.supplier?.supplierCurrency,
              id: order._id,
            }))
            .filter((s) => s.company);
          setSuppliers(supplierList);
        }
      } catch (err) {}
    }
    fetchSuppliers();
  }, []);

  const handleSelectSupplier = useCallback(
    (supplier) => {
      setAddress(supplier);
      setContact(supplier.contact);
      setTax(supplier.tax);
      setSupplierCurrency(supplier.supplierCurrency);
      onUpdate({
        ...data,
        address: supplier,
        contact: supplier.contact,
        tax: supplier.tax,
        supplierCurrency: supplier.supplierCurrency,
      });
      setSelectModalActive(false);
    },
    [onUpdate, data],
  );

  const handleAddSupplier = useCallback(() => {
    setSelectModalActive(false);
    setModalActive(true);
  }, []);

  const handleSupplierCurrencyChange = useCallback(
    (value) => {
      setSupplierCurrency(value);
      onUpdate({ ...data, supplierCurrency: value });
    },
    [data, onUpdate],
  );

  const locations = useMemo(() => {
    return (
      LocationAddress?.data?.locations?.edges?.map(({ node }) => node) ||
      LocationAddress?.map(({ node }) => node) ||
      []
    );
  }, [LocationAddress]);

  const [selectedLocation, setSelectedLocation] = useState(() => {
    if (
      destination?.address?.formatted &&
      destination.address.formatted.length > 0
    ) {
      const destFormatted = Array.isArray(destination.address.formatted)
        ? destination.address.formatted.join(", ")
        : destination.address.formatted;
      const matchingLocation = locations.find((loc) => {
        const locFormatted = Array.isArray(loc.address.formatted)
          ? loc.address.formatted.join(", ")
          : loc.address.formatted;
        return locFormatted === destFormatted;
      });
      if (matchingLocation) return matchingLocation;
    }
    if (mongodestination?.address?.formatted?.length > 0) {
      return {
        name: mongodestination?.address?.country || "Mongo Destination",
        address: mongodestination.address,
      };
    }
    return null;
  });

  const locationOptions = useMemo(() => {
    const options = locations.map((loc) => ({
      label: loc.name,
      value: loc.name,
    }));
    if (options.length === 0) {
      options.push({
        label: "US Location",
        value: "US Location",
      });
    }
    return options;
  }, [locations]);

  const handleLocationChange = useCallback(
    (value) => {
      const selected = locations.find((loc) => loc.name === value) || {
        name: value,
        address: {
          city: "",
          country: "United States",
          countryCode: "",
          phone: "",
          zip: "",
          province: "",
          provinceCode: "",
          formatted: [],
        },
      };
      setSelectedLocation(selected);
      const updatedDestination = {
        optionName: selected?.name,
        country: selected?.address?.country || "United States",
        address: {
          phone: selected?.address?.phone || "",
          provinceCode: selected?.address?.provinceCode || "",
          province: selected?.address?.province || "",
          formatted: Array.isArray(selected?.address?.formatted)
            ? selected?.address.formatted
            : selected?.address?.formatted
              ? [selected?.address.formatted]
              : [],
          countryCode: selected?.address?.countryCode || "",
          company: selected?.address?.company || "",
          street: selected?.address?.street || "",
          apartment: selected.address?.apartment || "",
          city: selected?.address?.city || "",
          state: selected?.address?.province || "",
          zipCode: selected?.address?.zip || "",
          country: selected?.address?.country || "",
        },
      };
      console.log(updatedDestination);
      onDestinationUpdate(updatedDestination);
      console.log(selected?.name, "selcteeeded");
    },
    [locations, onDestinationUpdate],
  );

  const toggleModal = useCallback(() => {
    if (!modalActive) {
      setTempAddress(address);
      setTempContact(contact);
      setTempTax(tax);
    }
    setModalActive((active) => !active);
  }, [modalActive, address, contact, tax]);

  const handleTempAddressChange = useCallback((field, value) => {
    setTempAddress((prev) => {
      let updated = { ...prev, [field]: value };
      if (field === "country") {
        updated.state = "";
        updated.zipCode = "";
      }
      return updated;
    });
  }, []);

  const handleTempContactChange = useCallback((field, value) => {
    setTempContact((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    setAddress(tempAddress);
    setContact(tempContact);
    setTax(tempTax);
    onUpdate({
      ...data,
      address: tempAddress,
      contact: tempContact,
      tax: tempTax,
    });
    if (!suppliers.some((s) => s.company === tempAddress.company)) {
      setSuppliers((prev) => [
        ...prev,
        {
          ...tempAddress,
          contact: tempContact,
          tax: tempTax,
          supplierCurrency,
        },
      ]);
    }
    console.log(tempAddress);
    toggleModal();
  }, [
    tempAddress,
    tempContact,
    tempTax,
    suppliers,
    data,
    onUpdate,
    toggleModal,
  ]);

  function findLocationNameByFormatted(LocationAddress, mongodestination) {
    if (!LocationAddress || !Array.isArray(LocationAddress)) {
      return null;
    }
    const mongoFormattedStr =
      mongodestination?.address?.formatted?.join(",")?.toLowerCase() || "";
    for (const option of LocationAddress) {
      const formatted = option?.node?.address?.formatted;
      if (formatted) {
        const optionFormattedStr = formatted.join(",")?.toLowerCase();
        if (optionFormattedStr === mongoFormattedStr) {
          return option.node.name;
        }
      }
    }
    return null;
  }

  const name = LocationAddress
    ? findLocationNameByFormatted(LocationAddress, mongodestination)
    : null;

  const selectedCountry = tempAddress?.country || "United States";
  const selectedState = tempAddress?.state || "";

  const uniqueSuppliers = suppliers.filter((supplier, index, self) => {
    return (
      self.findIndex(
        (s) =>
          s.contact?.name === supplier.contact?.name &&
          s.address?.street === supplier.address?.street &&
          s.address?.apartment === supplier.address?.apartment &&
          s.address?.city === supplier.address?.city &&
          s.address?.state === supplier.address?.state &&
          s.address?.zipCode === supplier.address?.zipCode &&
          s.address?.country === supplier.address?.country,
      ) === index
    );
  });

  useEffect(() => {
    if (LocationAddress && mongodestination) {
      const matchedName = findLocationNameByFormatted(
        LocationAddress,
        mongodestination,
      );
      if (matchedName) {
        const matchedLocation = locations.find(
          (loc) => loc.name === matchedName,
        );
        if (matchedLocation) {
          setSelectedLocation(matchedLocation);
        }
      }
    }
  }, [LocationAddress, mongodestination, locations]);

  return (
    <Card sectioned>
      <BlockStack gap="400">
        <InlineGrid columns={2} gap="400">
          <Box style={{ borderRight: "1px solid #dcdcdc" }}>
            <Text variant="bodyMd" fontWeight="bold">
              Supplier
            </Text>
            {address && (
              <BlockStack gap="200">
                <Text fontWeight="bold" variant="bodyLg" tone="subdued">
                  {address.company}
                </Text>
                <Text tone="subdued">
                  {address.street} {address.city} {address.state}{" "}
                  {address.zipCode} {address.country}
                </Text>
              </BlockStack>
            )}
            <BlockStack inlineAlign="start">
              <Button
                disabled={!isEditing}
                variant="plain"
                onClick={() => setSelectModalActive(true)}
              >
                {address ? "Select Supplier" : "Add Supplier"}
              </Button>
            </BlockStack>
          </Box>
          <BlockStack gap="200">
            <Text variant="bodyMd" fontWeight="bold">
              Destination
            </Text>
            <Select
              options={locationOptions}
              value={selectedLocation?.name || ""}
              onChange={handleLocationChange}
              disabled={!isEditing}
              placeholder="Select a location"
            />
            <Text fontWeight="bold" variant="bodyLg">
              {selectedLocation?.name || "No location selected"}
            </Text>
            <Text tone="subdued">
              {selectedLocation?.address?.formatted?.join(", ") || ""}
            </Text>
          </BlockStack>
        </InlineGrid>
        <Bleed marginInline="400">
          <Divider />
        </Bleed>
        <InlineGrid columns={1} gap="400">
          <Select
            disabled={!isEditing}
            label="Supplier currency"
            options={currencies}
            value={supplierCurrency?.toUpperCase() || ""}
            onChange={handleSupplierCurrencyChange}
          />
        </InlineGrid>
      </BlockStack>

      <Modal
        open={selectModalActive}
        onClose={() => setSelectModalActive(false)}
        title="Select Supplier"
        secondaryActions={[
          {
            content: "Add Supplier",
            onAction: () => {
              handleAddSupplier();
              setTempAddress(null);
            },
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="200">
            {uniqueSuppliers.length === 0 ? (
              <Text>No suppliers found.</Text>
            ) : (
              uniqueSuppliers.map((supplier, index) => (
                <InlineStack
                  key={`${supplier.id}-${index}`}
                  align="space-between"
                >
                  <Button
                    onClick={() => handleSelectSupplier(supplier)}
                    variant="tertiary"
                  >
                    <List type="bullet">
                      <List.Item>
                        {supplier?.contact?.name} {supplier.street}{" "}
                        {supplier.state} ({supplier.country})
                      </List.Item>
                    </List>
                  </Button>
                  <Button
                    onClick={() => handleSelectSupplier(supplier)}
                    variant="primary"
                  >
                    Add
                  </Button>
                </InlineStack>
              ))
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>

      <Modal
        open={modalActive}
        onClose={toggleModal}
        title="Edit supplier"
        primaryAction={{
          content: "Save",
          onAction: handleSave,
          disabled: !isEditing || !tempAddress,
        }}
        secondaryActions={[
          { content: "Close", onAction: toggleModal },
          {
            content: "Delete supplier",
            destructive: true,
            onAction: () => {
              toggleModal();
              setAddress(null);
            },
            disabled: !isEditing || !address,
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <TextField
              disabled={!isEditing}
              label="Company"
              value={tempAddress?.company || ""}
              onChange={(value) => handleTempAddressChange("company", value)}
              autoComplete="off"
            />
            <Select
              disabled={!isEditing}
              label="Country/Region"
              options={countries}
              value={selectedCountry}
              onChange={(value) => handleTempAddressChange("country", value)}
              placeholder="Select a country"
            />
            <TextField
              disabled={!isEditing}
              label="Address"
              value={tempAddress?.street || ""}
              onChange={(value) => handleTempAddressChange("street", value)}
              autoComplete="off"
              placeholder=""
            />
            <InlineGrid columns={2} gap="200">
              <TextField
                disabled={!isEditing}
                label="City"
                value={tempAddress?.city || ""}
                onChange={(value) => handleTempAddressChange("city", value)}
                autoComplete="off"
              />
              <Select
                disabled={!isEditing || !selectedCountry}
                label="State"
                options={states}
                value={selectedState || ""}
                onChange={(value) => handleTempAddressChange("state", value)}
                placeholder="Select a state"
              />
            </InlineGrid>
            <TextField
              disabled={!isEditing}
              label="ZIP code"
              value={tempAddress?.zipCode || ""}
              onChange={(value) => handleTempAddressChange("zipCode", value)}
              autoComplete="off"
            />
            <TextField
              disabled={!isEditing}
              label="Contact name"
              value={tempContact?.name || ""}
              onChange={(value) => handleTempContactChange("name", value)}
              autoComplete="off"
            />
            <InlineGrid columns={2} gap="200">
              <TextField
                disabled={!isEditing}
                label="Email address"
                value={tempContact?.email || ""}
                onChange={(value) => handleTempContactChange("email", value)}
                autoComplete="off"
              />
              <TextField
                disabled={!isEditing}
                label="Phone number"
                type="number"
                value={tempContact?.phone?.split(" ")[0] || ""}
                onChange={(value) =>
                  handleTempContactChange(
                    "phone",
                    `${value} ${tempContact?.phone?.split(" ")[1] || ""}`,
                  )
                }
              />
            </InlineGrid>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Card>
  );
}
