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
//   Autocomplete,
//   Icon,
// } from "@shopify/polaris";
// import { SearchIcon } from "@shopify/polaris-icons";
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
//   const deselectedAddressOptions = useMemo(
//     () => [
//       {
//         value: "123 Main St, New York, NY",
//         label: "123 Main St, New York, NY",
//       },
//       {
//         value: "456 Elm St, Los Angeles, CA",
//         label: "456 Elm St, Los Angeles, CA",
//       },
//       { value: "789 Oak Ave, Chicago, IL", label: "789 Oak Ave, Chicago, IL" },
//     ],
//     [],
//   );
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

//   const [addressInputValue, setAddressInputValue] = useState(
//     tempAddress?.street || "",
//   );
//   const [addressOptions, setAddressOptions] = useState(
//     deselectedAddressOptions,
//   );
//   const [selectedAddressOptions, setSelectedAddressOptions] = useState(
//     tempAddress?.street ? [tempAddress.street] : [],
//   );

//   // Load countries on mount
//   useEffect(() => {
//     const countryList = Country.getAllCountries().map((country) => ({
//       label: country.name,
//       value: country.name,
//     }));
//     setCountries(countryList);
//   }, []);

//   // Load states when country changes
//   useEffect(() => {
//     if (tempAddress?.country) {
//       const country = Country.getAllCountries().find(
//         (c) => c.name === tempAddress.country,
//       );
//       if (country) {
//         const stateList = State.getStatesOfCountry(country.isoCode).map(
//           (state) => ({
//             label: state.name,
//             value: state.name,
//           }),
//         );
//         setStates(stateList);
//       } else {
//         setStates([]);
//       }
//     } else {
//       setStates([]);
//     }
//   }, [tempAddress?.country]);

//   useEffect(() => {
//     async function fetchSuppliers() {
//       try {
//         const res = await fetch("/routes/api/order/purchaseorder");
//         const result = await res.json();
//         if (result.success && Array.isArray(result.data)) {
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

//   const handleAddSupplier = useCallback(() => {
//     setSelectModalActive(false);
//     setModalActive(true);
//   }, []);

//   const handleSupplierCurrencyChange = useCallback(
//     (value) => {
//       setSupplierCurrency(value);
//       onUpdate({ ...data, supplierCurrency: value });
//     },
//     [data, onUpdate],
//   );

//   const locations = useMemo(() => {
//     return (
//       LocationAddress?.data?.locations?.edges?.map(({ node }) => node) ||
//       LocationAddress?.map(({ node }) => node) ||
//       []
//     );
//   }, [LocationAddress]);

//   const [selectedLocation, setSelectedLocation] = useState(() => {
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
//     if (mongodestination?.address?.formatted?.length > 0) {
//       return {
//         name: mongodestination?.address?.country || "Mongo Destination",
//         address: mongodestination.address,
//       };
//     }
//     return null;
//   });

//   const locationOptions = useMemo(() => {
//     const options = locations.map((loc) => ({
//       label: loc.name,
//       value: loc.name,
//     }));
//     if (options.length === 0) {
//       options.push({
//         label: "US Location",
//         value: "US Location",
//       });
//     }
//     return options;
//   }, [locations]);

//   const handleLocationChange = useCallback(
//     (value) => {
//       const selected = locations.find((loc) => loc.name === value) || {
//         name: value,
//         address: {
//           city: "",
//           country: "United States",
//           countryCode: "",
//           phone: "",
//           zip: "",
//           province: "",
//           provinceCode: "",
//           formatted: [],
//         },
//       };
//       setSelectedLocation(selected);
//       const updatedDestination = {
//         optionName: selected?.name,
//         country: selected?.address?.country || "United States",
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
//           state: selected?.address?.province || "",
//           zipCode: selected?.address?.zip || "",
//           country: selected?.address?.country || "",
//         },
//       };
//       console.log(updatedDestination);
//       onDestinationUpdate(updatedDestination);
//       console.log(selected?.name, "selcteeeded");
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

//   const handleTempAddressChange = useCallback((field, value) => {
//     setTempAddress((prev) => {
//       let updated = { ...prev, [field]: value };
//       if (field === "country") {
//         updated.state = "";
//         updated.zipCode = "";
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
//     console.log(tempAddress);
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
//       return null;
//     }
//     const mongoFormattedStr =
//       mongodestination?.address?.formatted?.join(",")?.toLowerCase() || "";
//     for (const option of LocationAddress) {
//       const formatted = option?.node?.address?.formatted;
//       if (formatted) {
//         const optionFormattedStr = formatted.join(",")?.toLowerCase();
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

//   const selectedCountry = tempAddress?.country || "United States";
//   const selectedState = tempAddress?.state || "";

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

//   const updateAddressText = useCallback(
//     (value) => {
//       setAddressInputValue(value);
//       handleTempAddressChange("street", value);

//       if (value === "") {
//         setAddressOptions(deselectedAddressOptions);
//         return;
//       }

//       const filterRegex = new RegExp(value, "i");
//       const resultOptions = deselectedAddressOptions.filter((option) =>
//         option.label.match(filterRegex),
//       );
//       setAddressOptions(resultOptions);
//     },
//     [deselectedAddressOptions, handleTempAddressChange],
//   );

//   const updateAddressSelection = useCallback(
//     (selected) => {
//       const selectedValue = selected.map((selectedItem) => {
//         const matchedOption = addressOptions.find((option) => {
//           return option.value.match(selectedItem);
//         });
//         return matchedOption && matchedOption.label;
//       });

//       setSelectedAddressOptions(selected);
//       setAddressInputValue(selectedValue[0] || "");
//       handleTempAddressChange("street", selectedValue[0] || "");
//     },
//     [addressOptions, handleTempAddressChange],
//   );

//   const addressTextField = (
//     <Autocomplete.TextField
//       onChange={updateAddressText}
//       label="Address"
//       value={addressInputValue}
//       prefix={<Icon source={SearchIcon} tone="base" />}
//       placeholder="Type address"
//       autoComplete="off"
//       disabled={!isEditing}
//     />
//   );

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
//                     onClick={() => handleSelectSupplier(supplier)}
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
//             <Select
//               disabled={!isEditing}
//               label="Country/Region"
//               options={countries}
//               value={selectedCountry}
//               onChange={(value) => handleTempAddressChange("country", value)}
//               placeholder="Select a country"
//             />
//             {/* <TextField
//               disabled={!isEditing}
//               label="Address"
//               value={tempAddress?.street || ""}
//               onChange={(value) => handleTempAddressChange("street", value)}
//               autoComplete="off"
//               placeholder=""
//             /> */}
//             <Autocomplete
//               options={addressOptions}
//               selected={selectedAddressOptions}
//               onSelect={updateAddressSelection}
//               textField={addressTextField}
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
//                 options={states}
//                 value={selectedState || ""}
//                 onChange={(value) => handleTempAddressChange("state", value)}
//                 placeholder="Select a state"
//               />
//             </InlineGrid>
//             <TextField
//               disabled={!isEditing}
//               label="ZIP code"
//               value={tempAddress?.zipCode || ""}
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
  Autocomplete,
  Icon,
} from "@shopify/polaris";
import { SearchIcon } from "@shopify/polaris-icons";
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

  const [addressInputValue, setAddressInputValue] = useState(
    tempAddress?.street || "",
  );
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedAddressOptions, setSelectedAddressOptions] = useState([]);

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

  const uniqueSuppliers = useMemo(() => {
    return suppliers.filter((supplier, index, self) => {
      return (
        index ===
        self.findIndex(
          (s) =>
            s.street === supplier.street &&
            (s.apartment || "") === (supplier.apartment || "") &&
            s.city === supplier.city &&
            s.state === supplier.state &&
            s.zipCode === supplier.zipCode &&
            s.country === supplier.country,
        )
      );
    });
  }, [suppliers]);

  const addressOptionsMemo = useMemo(
    () =>
      uniqueSuppliers.map((supplier) => ({
        label:
          `${supplier.street || ""}, ${supplier.city || ""}, ${supplier.state || ""} ${supplier.zipCode || ""}, ${supplier.country || ""}`.trim(),
        value: supplier.id,
      })),
    [uniqueSuppliers],
  );

  const findSupplierByAddress = useCallback(
    (addr) => {
      if (!addr) return null;
      return uniqueSuppliers.find(
        (s) =>
          s.street === addr.street &&
          (s.apartment || "") === (addr.apartment || "") &&
          s.city === addr.city &&
          s.state === addr.state &&
          s.zipCode === addr.zipCode &&
          s.country === addr.country,
      );
    },
    [uniqueSuppliers],
  );

  const handleSelectSupplier = useCallback(
    (supplier) => {
      setAddress({
        company: supplier.company || "",
        street: supplier.street || "",
        apartment: supplier.apartment || "",
        city: supplier.city || "",
        state: supplier.state || "",
        zipCode: supplier.zipCode || "",
        country: supplier.country || "",
      });
      setContact(supplier.contact);
      setTax(supplier.tax);
      setSupplierCurrency(supplier.supplierCurrency);
      onUpdate({
        ...data,
        address: {
          company: supplier.company || "",
          street: supplier.street || "",
          apartment: supplier.apartment || "",
          city: supplier.city || "",
          state: supplier.state || "",
          zipCode: supplier.zipCode || "",
          country: supplier.country || "",
        },
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
      setAddressInputValue(address?.street || "");
      const matchingSupplier = findSupplierByAddress(address);
      setSelectedAddressOptions(matchingSupplier ? [matchingSupplier.id] : []);
    }
    setModalActive((active) => !active);
  }, [modalActive, address, contact, tax, findSupplierByAddress]);

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
    const newId = `new-${Date.now()}`;
    if (!suppliers.some((s) => s.company === tempAddress.company)) {
      setSuppliers((prev) => [
        ...prev,
        {
          ...tempAddress,
          contact: tempContact,
          tax: tempTax,
          supplierCurrency,
          id: newId,
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
    supplierCurrency,
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

  const updateAddressText = useCallback(
    (value) => {
      setAddressInputValue(value);
      handleTempAddressChange("street", value);

      if (value === "") {
        setAddressOptions([]);
        return;
      }

      const filterRegex = new RegExp(value, "i");
      const resultOptions = addressOptionsMemo.filter((option) =>
        option.label.match(filterRegex),
      );
      setAddressOptions(resultOptions);
    },
    [addressOptionsMemo, handleTempAddressChange],
  );

  const updateAddressSelection = useCallback(
    (selected) => {
      if (selected.length > 0) {
        const selectedId = selected[0];
        const matchingSupplier = uniqueSuppliers.find(
          (s) => s.id === selectedId,
        );
        if (matchingSupplier) {
          setSelectedAddressOptions([selectedId]);
          setAddressInputValue(matchingSupplier.street || "");
          setTempAddress((prev) => ({
            ...prev,
            company: matchingSupplier?.company || prev.company || "",
            street: matchingSupplier?.street || "",
            apartment: matchingSupplier?.apartment || prev?.apartment || "",
            city: matchingSupplier?.city || "",
            state: matchingSupplier?.state || "",
            zipCode: matchingSupplier?.zipCode || "",
            country: matchingSupplier?.country || "",
          }));
        }
      } else {
        setSelectedAddressOptions([]);
        setAddressInputValue("");
        handleTempAddressChange("street", "");
      }
    },
    [uniqueSuppliers, handleTempAddressChange],
  );

  useEffect(() => {
    setAddressOptions(addressOptionsMemo);
  }, [addressOptionsMemo]);

  const addressTextField = (
    <Autocomplete.TextField
      onChange={updateAddressText}
      label="Address"
      value={addressInputValue}
      prefix={<Icon source={SearchIcon} tone="base" />}
      placeholder="Type address"
      autoComplete="off"
      disabled={!isEditing}
    />
  );

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
              uniqueSuppliers.map((supplier) => (
                <InlineStack key={supplier.id} align="space-between">
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
            <Autocomplete
              options={addressOptions}
              selected={selectedAddressOptions}
              onSelect={updateAddressSelection}
              textField={addressTextField}
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
