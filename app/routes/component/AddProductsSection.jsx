import {
  Box,
  Card,
  Text,
  BlockStack,
  Button,
  TextField,
  Icon,
  InlineGrid,
  Bleed,
  Divider,
  ResourceList,
  ResourceItem,
  Thumbnail,
  InlineStack,
  Modal,
  FormLayout,
} from "@shopify/polaris";
import { useCallback, useEffect, useState } from "react";
import { ImageIcon, XIcon } from "@shopify/polaris-icons";

export default function AddProductsSection({
  shopify,
  products,
  onProductsUpdate,
  additional,
  onAdditionalUpdate,
  cost,
  onCostUpdate,
  isEditing = true,
  supperCurrency,
  currencies
}) {
  let currencySymbol = '';
  // Find the symbol from the label using RegEx
  const matchedCurrency = currencies?.find(c => c.value === supperCurrency);
  if (matchedCurrency) {
    // Extract symbol using regex from the label
    const match = matchedCurrency.label.match(/\((.*?)\)/);
    if (match && match[1]) {
      // Take the last part after space (e.g. "VND ₫" => "₫")
      const parts = match[1].split(' ');
      currencySymbol = parts[parts.length - 1];
    }
  }
  const [selectedProducts, setSelectedProducts] = useState(products);
  const [searchValue, setSearchValue] = useState("");
  const [referenceNumber, setReferenceNumber] = useState(
    additional.referenceNumber,
  );
  const [noteToSupplier, setNoteToSupplier] = useState(
    additional.noteToSupplier,
  );
  const [tag, setTag] = useState(additional.tag);
  const [shipping, setShipping] = useState(
    cost.shipping ? parseFloat(cost.shipping.replace(supperCurrency, "")) || 0 : 0
  );
  const [modalActive, setModalActive] = useState(false);
  const [tempShipping, setTempShipping] = useState(shipping);

  const handleTextFieldChange = useCallback(
    (value) => {
      setNoteToSupplier(value);
      onAdditionalUpdate({ ...additional, noteToSupplier: value });
    },
    [additional, onAdditionalUpdate],
  );

 const handleSelection = useCallback(
    ({ selection }) => {
      const newItems = selection.flatMap((product) => {
        const productImage =
          product.images && product.images.length > 0
            ? {
              originalSrc: product.images[0].originalSrc,
              altText: product.images[0].altText || product.title,
            }
            : null;
 
        if (product.variants && product.variants.length > 0) {
          return product.variants.map((variant) => {
            const variantValue =
              variant.selectedOptions && variant.selectedOptions.length > 0
                ? variant.selectedOptions[0].value
                : "";
            const displayName = variantValue
              ? `${product.title} - ${variantValue}`
              : product.title;
 
            return {
              ...variant,
              title: product.title,
              displayName,
              sku: variant.sku || "",
              inventoryQuantity: "",
              cost: "",
              tax: "0",
              total: "0",
              image: variant.image || productImage,
            };
          });
        } else {
          return [
            {
              ...product,
              displayName: product.title,
              sku: product.sku || "",
              inventoryQuantity: "",
              cost: "",
              tax: "0",
              total: "0",
              image: productImage,
            },
          ];
        }
      });
 
      const mongoVariants = selectedProducts.flatMap((product) => {
        if (product.variants) {
          return product.variants.map((variant) => ({
            ...variant,
            sku: variant.sku || "",
            inventoryQuantity: variant.inventoryQuantity || "",
            cost: variant.cost || "",
            tax: variant.tax || "0",
            total: variant.total || "0",
            image: variant.image || null,
            displayName: variant.displayName || product.title,
          }));
        }
        return [];
      });
 
      const combinedItems = [...newItems, ...mongoVariants];
 
      setSelectedProducts((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newUniqueItems = combinedItems.filter(
          (item) => !existingIds.has(item.id),
        );
        return [...prev, ...newUniqueItems];
      });
 
      onProductsUpdate((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newUniqueItems = combinedItems.filter(
          (item) => !existingIds.has(item.id),
        );
        return [...prev, ...newUniqueItems];
      });
    },
    [onProductsUpdate, selectedProducts],
  );

  const updateVariantField = useCallback(
    (id, field, value) => {
      setSelectedProducts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      );
      onProductsUpdate((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      );
    },
    [onProductsUpdate],
  );

  const handleOpenPicker = async (query = "") => {
    try {
      const picker = await shopify.resourcePicker({
        action: "select",
        type: "product",
        multiple: true,
        filter: { variants: true },
        query,
      });

      if (picker && picker.selection && picker.selection.length > 0) {
        handleSelection(picker);
      } else {
        setSearchValue("");
      }
    } catch (error) {
      setSearchValue("");
    }
  };

  const handleSearchChange = useCallback(
    (value) => {
      setSearchValue(value);
      if (value && value.length > 2) {
        handleOpenPicker(value);
      }
    },
    [handleOpenPicker],
  );

  const removeProduct = useCallback(
    (id) => {
      setSelectedProducts((prev) => prev.filter((item) => item.id !== id));
      onProductsUpdate((prev) => prev.filter((item) => item.id !== id));
    },
    [onProductsUpdate],
  );
useEffect(() => {
  const merged = [...selectedProducts];
  setSelectedProducts(merged);
  onProductsUpdate(merged);
}, []); 
  const calculateSubtotal = useCallback(() => {
    return selectedProducts.reduce((sum, item) => {
      const qty = parseFloat(item.inventoryQuantity ?? item.quantity) || 0;
      const cost = parseFloat(item.cost) || 0;
      const taxPercent = parseFloat(item.tax) || 0;
      const taxAmount = Number((cost * taxPercent) / 100);
      return sum + qty * (cost + taxAmount);
    }, 0);
  }, [selectedProducts]);
 
  const handleReferenceChange = useCallback(
    (value) => {
      setReferenceNumber(value);
      onAdditionalUpdate({ ...additional, referenceNumber: value });
    },
    [additional, onAdditionalUpdate],
  );

  const handleTagChange = useCallback(
    (value) => {
      setTag(value);
      onAdditionalUpdate({ ...additional, tag: value });
    },
    [additional, onAdditionalUpdate],
  );

  // Save button action
  const handleSave = () => {
    const numValue = parseFloat(tempShipping) || 0;
    setShipping(numValue);
    onCostUpdate({ ...cost, shipping: `${supperCurrency} ${numValue.toFixed(2)}` });
    setModalActive(false);
  };

  return (
    <BlockStack gap="400">
      <Card title="Add products" sectioned>
        <BlockStack gap={200}>
          <Text variant="bodyMd" fontWeight="bold">
            Add products
          </Text>
          <BlockStack gap={500}>
            <Box paddingBlockEnd={300}>
              <InlineStack wrap={false} gap={100} align="space-between">
                <Box width="100%">
                  <TextField
                    disabled={isEditing === false}
                    placeholder="Search products"
                    value={searchValue}
                    onChange={handleSearchChange}
                  />
                </Box>
                <Box maxWidth="100">
                  <Button
                    disabled={isEditing === false}
                    onClick={() => handleOpenPicker(searchValue)}
                  >
                    Browse
                  </Button>
                </Box>
              </InlineStack>
            </Box>

            {selectedProducts.length > 0 && (
              <BlockStack gap={500}>
                <InlineGrid columns={6} gap="200" align="start">
                  <Text variant="bodyMd" fontWeight="bold">
                    Products
                  </Text>
                  <BlockStack inlineAlign="center">
                    <Box width="10%">
                      <Text alignment="end" variant="bodyMd" fontWeight="bold">
                        SKU
                      </Text>
                    </Box>
                  </BlockStack>
                  <BlockStack inlineAlign="center">
                    <Box width="10%">
                      <Text
                        alignment="center"
                        variant="bodyMd"
                        fontWeight="bold"
                      >
                        Quantity
                      </Text>
                    </Box>
                  </BlockStack>
                  <BlockStack inlineAlign="center">
                    <Box width="15%">
                      <Text
                        alignment="center"
                        variant="bodyMd"
                        fontWeight="bold"
                      >
                        Cost
                      </Text>
                    </Box>
                  </BlockStack>
                  <BlockStack inlineAlign="center">
                    <Box width="15%">
                      <Text
                        alignment="center"
                        variant="bodyMd"
                        fontWeight="bold"
                      >
                        Tax
                      </Text>
                    </Box>
                  </BlockStack>
                  <Text alignment="center" variant="bodyMd" fontWeight="bold">
                    Total
                  </Text>
                </InlineGrid>
                <ResourceList
                  resourceName={{ singular: "product", plural: "products" }}
                  items={selectedProducts}
                  renderItem={(item) => {
                    const { id, title, displayName } = item;
                    const qty =
                      parseFloat(item.inventoryQuantity ?? item.quantity) || 0;
                    const cost = parseFloat(item.cost) || 0;
                    const taxPercent = parseFloat(item.tax) || 0;
                    const taxAmount = (cost * taxPercent) / 100;
                    const itemTotal = (qty * (cost + taxAmount)).toFixed(2);
                    return (
                      <>
                        <ResourceItem
                          id={id}
                          media={
                            <Thumbnail
                              source={item.image?.originalSrc || ImageIcon}
                              alt={item.image?.altText || title}
                            />
                          }
                          accessibilityLabel={`View details for ${title}`}
                        >
                          <InlineGrid columns="6" gap="400" alignItems="center">
                            <Text fontWeight="bold">
                              {displayName?.length > 30
                                ? displayName.slice(0, 30) + "..."
                                : displayName || item.title}
                            </Text>
                            <TextField
                              disabled={true}
                              type="text"
                              value={item.sku || ""}
                              // onChange={(value) =>
                              //   updateVariantField(id, "sku", value)
                              // }
                              labelHidden
                              label="Supplier SKU"
                            />
                            <BlockStack inlineAlign="end">
                              <Box width="100%">
                                <TextField
                                  disabled={isEditing === false}
                                  type="number"
                                  value={
                                    item?.inventoryQuantity ??
                                    item?.quantity ??
                                    ""
                                  }
                                  onChange={(value) => {
                                    updateVariantField(
                                      id,
                                      "inventoryQuantity",
                                      value === "" ? "" : parseFloat(value)
                                    );
                                  }}

                                  labelHidden
                                  label="quantity"
                                />
                              </Box>
                            </BlockStack>
                            <BlockStack inlineAlign="end">
                              <Box width="100%">
                                <TextField
                                  disabled={isEditing === false}
                                  type="text"
                                  value={item.cost || ""}
                                  onChange={(value) =>
                                    updateVariantField(id, "cost", value)
                                  }
                                  labelHidden
                                  label="Cost"
                                  prefix={currencySymbol}
                                />
                              </Box>
                            </BlockStack>
                            <BlockStack inlineAlign="end">
                              <Box width="100%">
                                <TextField
                                  disabled={isEditing === false}
                                  type="number"
                                  value={item.tax || ""}
                                  onChange={(value) =>
                                    updateVariantField(id, "tax", value)
                                  }
                                  labelHidden
                                  label="Tax"
                                  suffix="%"
                                />
                              </Box>
                            </BlockStack>
                            <InlineStack
                              blockAlign="center"
                              align="end"
                              gap="100"
                            >
                              <InlineStack align="center" gap="0">

                                <Text>{`${currencySymbol} `}</Text>
                                <Text> {itemTotal} {currencySymbol == supperCurrency ? "" : `${supperCurrency}`}</Text>
                              </InlineStack>
                              <Button
                                disabled={isEditing === false}
                                size="micro"
                                variant="tertiary"
                                onClick={() => removeProduct(id)}
                              >
                                <Icon source={XIcon} />
                              </Button>
                            </InlineStack>
                          </InlineGrid>
                        </ResourceItem>
                        <Divider />
                      </>
                    );
                  }}
                />
              </BlockStack>
            )}
          </BlockStack>
        </BlockStack>
        <Bleed marginInline="400">
          <Divider />
        </Bleed>
        <Box paddingBlockStart={400}>
          <Text variant="bodyMd">
            {selectedProducts.length} item on purchase order
          </Text>
        </Box>
      </Card>
      <InlineGrid columns={2} gap="300">
        <Card sectioned title="Additional details">
          <BlockStack gap="300">
            <Text variant="bodyMd" fontWeight="bold">
              Additional details
            </Text>
            <TextField
              disabled={!isEditing}
              label="Reference number"
              value={referenceNumber}
              onChange={handleReferenceChange}
              autoComplete="off"
            />
            <TextField
              disabled={!isEditing}
              label="Note to supplier"
              value={noteToSupplier}
              onChange={handleTextFieldChange}
              autoComplete="off"
              maxLength={5000}
              showCharacterCount
              multiline={2}
            />
            <TextField
              disabled={!isEditing}
              label="Tag"
              value={tag || ""}
              onChange={handleTagChange}
              autoComplete="off"
            />
          </BlockStack>
        </Card>
        <Card sectioned title="Cost summary">
          <BlockStack gap="400">
            <BlockStack gap="0">
              <Text variant="bodyMd" fontWeight="bold">
                Cost summary
              </Text>
              <Box>
                <Button variant="plain" onClick={() => { setTempShipping(shipping); setModalActive(true); }}>
                  Manage
                </Button>
              </Box>
            </BlockStack>
            <BlockStack gap="100">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="bodyMd">Shipping</Text>
                <Text>
                  {`${currencySymbol} `}
                  {shipping.toFixed(2)}
                  {` ${currencySymbol !== supperCurrency ? supperCurrency : ""}`}
                </Text>
              </InlineStack>
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="bodyMd" fontWeight="bold">
                  Subtotal
                </Text>
                <Text as="span">
                  <InlineStack align="center" gap="0">
                    <Text>{`${currencySymbol} `}</Text>
                    <Text>
                      {calculateSubtotal().toFixed(2)} {currencySymbol !== supperCurrency ? `${supperCurrency} ` : ""}
                    </Text>
                  </InlineStack>
                </Text>
              </InlineStack>
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="bodyMd">{selectedProducts.length} items</Text>
              </InlineStack>
            </BlockStack>
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="bodyMd" fontWeight="bold">
                Total
              </Text>{" "}
              <Text fontWeight="bold">
                {`${currencySymbol} `}
                {!cost.total === `${supperCurrency}0.00`
                  ? cost.total
                  : (calculateSubtotal() + shipping).toFixed(2)} {currencySymbol !== supperCurrency ? supperCurrency : ""}
              </Text>
            </InlineStack>
          </BlockStack>
        </Card>
      </InlineGrid>

      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title="Manage cost summary"
        primaryAction={{
          content: "Save",
          onAction: handleSave,
          disabled: !isEditing, // only update here
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => {
              setModalActive(false);
              setTempShipping(shipping);
            },
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <InlineGrid gap={500} columns={2} align="start" blockAlign="center">
              <Text variant="bodyMd" fontWeight="bold">
                Additional details
              </Text>
              <Text variant="bodyMd" fontWeight="bold">
                Amount
              </Text>
            </InlineGrid>
            <InlineGrid gap={500} columns={2} align="start" blockAlign="center">
              <Text>Shipping</Text>
              <InlineStack align="space-between" wrap={false}>
                <TextField
                  disabled={!isEditing}
                  type="number"
                  value={tempShipping}
                  onChange={setTempShipping}
                  prefix={supperCurrency}
                  width="100px"
                />
              </InlineStack>
            </InlineGrid>
          </FormLayout>
        </Modal.Section>
      </Modal>
    </BlockStack>
  );
}
