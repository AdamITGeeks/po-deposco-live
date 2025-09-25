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
// } from "@shopify/polaris";
// import { useCallback, useState } from "react";

// export default function SupplierDestinationCard({
//   data,
//   onUpdate,
//   currencies,
//   isEditing = true,
// }) {
//   console.log(data, "curew");
//   // Payment terms state
//   const [paymentTerms, setPaymentTerms] = useState(data.paymentTerms);

//   const handlePaymentTermsChange = useCallback(
//     (value) => {
//       setPaymentTerms(value);
//       onUpdate({ ...data, paymentTerms: value });
//     },
//     [data, onUpdate],
//   );

//   const paymentTermsOptions = [
//     { label: "None", value: "none" },
//     { label: "Payment in advance", value: "advance" },
//     { label: "Payment on advance", value: "receipt" },
//     { label: "Cash on Delivery", value: "dilivery" },
//   ];

//   // Supplier currency state
//   const [supplierCurrency, setSupplierCurrency] = useState(
//     data.supplierCurrency,
//   );
//   const handleSupplierCurrencyChange = useCallback(
//     (value) => {
//       setSupplierCurrency(value);
//       onUpdate({ ...data, supplierCurrency: value });
//     },
//     [data, onUpdate],
//   );

//   // Address and contact state
//   const [address, setAddress] = useState(data.address);
//   const [contact, setContact] = useState(data.contact);
//   const [tax, setTax] = useState(data.tax);

//   // Modal state
//   const [modalActive, setModalActive] = useState(false);
//   const [tempAddress, setTempAddress] = useState(data.address);
//   const [tempContact, setTempContact] = useState(data.contact);
//   const [tempTax, setTempTax] = useState(data.tax);

//   const toggleModal = useCallback(() => {
//     if (!modalActive) {
//       setTempAddress(address);
//       setTempContact(contact);
//       setTempTax(tax);
//     }
//     setModalActive((active) => !active);
//   }, [modalActive, address, contact, tax]);

//   const handleTempAddressChange = useCallback((field, value) => {
//     setTempAddress((prev) => ({ ...prev, [field]: value }));
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
//     toggleModal();
//   }, [tempAddress, tempContact, tempTax, data, onUpdate, toggleModal]);

//   const countryOptions = [
//     { label: "United States", value: "United States" },
//     { label: "Canada", value: "Canada" },
//     { label: "India", value: "India" },
//     // Add more countries as needed
//   ];

//   const stateOptions = [
//     { label: "South Carolina", value: "South Carolina" },
//     { label: "California", value: "California" },
//     { label: "New York", value: "New York" },
//     // Add more states as needed
//   ];

//   return (
//     <Card sectioned>
//       <BlockStack gap="400">
//         <InlineGrid columns={2} gap="400">
//           <Box
//             style={{
//               borderRight: "1px solid #dcdcdc",
//             }}
//           >
//             <BlockStack gap="200">
//               <Text variant="bodyMd" fontWeight="bold">
//                 Supplier
//               </Text>
//               <Text fontWeight="bold" variant="bodyLg" tone="subdued">
//                 {address.company}
//               </Text>
//               <Text tone="subdued">
//                 {address.street}, {address.city}, {address.state}{" "}
//                 {address.zipCode}, {address.country}
//               </Text>
//               <BlockStack inlineAlign="start">
//                 <Button variant="plain" onClick={toggleModal}>
//                   Edit supplier
//                 </Button>
//               </BlockStack>
//             </BlockStack>
//           </Box>

//           <BlockStack gap="200">
//             <Text variant="bodyMd" fontWeight="bold">
//               Destination
//             </Text>
//             <Text fontWeight="bold" variant="bodyLg">
//               US Location
//             </Text>
//             <Text tone="subdued">
//               933 Maple Avenue, Los Angeles, California
//             </Text>
//           </BlockStack>
//         </InlineGrid>

//         <Bleed marginInline="400">
//           <Divider />
//         </Bleed>
//         <InlineGrid columns={2} gap="400">
//           <Select
//             disabled={!isEditing}
//             label="Payment terms (optional)"
//             options={paymentTermsOptions}
//             value={paymentTerms}
//             onChange={handlePaymentTermsChange}
//           />
//           <Select
//             disabled={!isEditing}
//             label="Supplier currency"
//             options={currencies}
//             value={supplierCurrency?.toLowerCase() || ""}
//             onChange={handleSupplierCurrencyChange}
//           />
//         </InlineGrid>
//       </BlockStack>

//       {/* Edit Supplier Modal */}
//       <Modal
//         open={modalActive}
//         onClose={toggleModal}
//         title="Edit supplier"
//         primaryAction={{
//           content: "Save",
//           onAction: handleSave,
//           disabled: !isEditing,
//         }}
//         secondaryActions={[
//           { content: "Close", onAction: toggleModal },
//           {
//             content: "Delete supplier",
//             destructive: true,
//             onAction: () => {},
//             disabled: !isEditing,
//           },
//         ]}
//       >
//         <Modal.Section>
//           <BlockStack gap="400">
//             <TextField
//               disabled={!isEditing}
//               label="Company"
//               value={tempAddress.company}
//               onChange={(value) => handleTempAddressChange("company", value)}
//               autoComplete="off"
//             />
//             <Select
//               disabled={!isEditing}
//               label="Country/Region"
//               options={countryOptions}
//               value={tempAddress.country}
//               onChange={(value) => handleTempAddressChange("country", value)}
//             />
//             <TextField
//               disabled={!isEditing}
//               label="Address"
//               value={tempAddress.street}
//               onChange={(value) => handleTempAddressChange("street", value)}
//               autoComplete="off"
//               placeholder="Q. 1224 Burke Street"
//             />
//             <TextField
//               disabled={!isEditing}
//               label="Apartment, suite, etc."
//               value={tempAddress.apartment}
//               onChange={(value) => handleTempAddressChange("apartment", value)}
//               autoComplete="off"
//               placeholder="123232332312"
//             />
//             <InlineGrid columns={2} gap="200">
//               <TextField
//                 disabled={!isEditing}
//                 label="City"
//                 value={tempAddress.city}
//                 onChange={(value) => handleTempAddressChange("city", value)}
//                 autoComplete="off"
//               />
//               <Select
//                 disabled={!isEditing}
//                 label="State"
//                 options={stateOptions}
//                 value={tempAddress.state}
//                 onChange={(value) => handleTempAddressChange("state", value)}
//               />
//             </InlineGrid>
//             <TextField
//               disabled={!isEditing}
//               label="ZIP code"
//               value={tempAddress.zipCode}
//               onChange={(value) => handleTempAddressChange("zipCode", value)}
//               autoComplete="off"
//             />
//             <TextField
//               disabled={!isEditing}
//               label="Contact name"
//               value={tempContact.name}
//               onChange={(value) => handleTempContactChange("name", value)}
//               autoComplete="off"
//             />
//             <InlineGrid columns={2} gap="200">
//               <TextField
//                 disabled={!isEditing}
//                 label="Email address"
//                 value={tempContact.email}
//                 onChange={(value) => handleTempContactChange("email", value)}
//                 autoComplete="off"
//               />
//               <TextField
//                 disabled={!isEditing}
//                 label="Phone number"
//                 type="number"
//                 value={tempContact.phone.split(" ")[0]}
//                 onChange={(value) =>
//                   handleTempContactChange(
//                     "phone",
//                     `${value} ${tempContact.phone.split(" ")[1] || ""}`,
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
