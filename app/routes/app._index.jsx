import {
  IndexTable,
  LegacyCard,
  IndexFilters,
  useSetIndexFiltersMode,
  Text,
  Badge,
  useBreakpoints,
  Box,
  Button,
  Page,
  Spinner,
  Icon,
  EmptyState,
} from "@shopify/polaris";
import { OrderIcon } from "@shopify/polaris-icons";
import { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import orderStatus from "./app.purchase-order.$id";

function OrderManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [itemStrings] = useState(["All"]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [queryValue, setQueryValue] = useState("");
  const [selectedResources, setSelectedResources] = useState([]);
  const { mode, setMode } = useSetIndexFiltersMode();
  const pageSize = 40;
  const [orders, setOrders] = useState([]);

  // Fetch orders from API
  useEffect(() => {
    if (location.pathname === "/app") {
      setLoading(true);
      setError(null);

      fetch(`/routes/api/order/purchaseorder`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            const transformedOrders = data.data.map((order) => ({
              id: order.orderId, 
              orderNumber: order.orderNumber,
              supplier: order.supplier?.address?.company || "Unknown Supplier",
              destination: order?.destination?.address.country,
              status: "Draft",
              received: "0%",
              total: order.cost?.total || "$0.00",
              expectedArrival: order.shipment?.estimatedArrival
                ? new Date(order.shipment.estimatedArrival).toLocaleDateString()
                : "N/A",
            }));
            setOrders(transformedOrders);
          } else {
            setError(data.error || "Failed to fetch orders");
          }
        })
        .catch((err) => setError("Error fetching orders: " + err.message))
        .finally(() => setLoading(false));
    }
  }, [location.pathname]);

  const viewTabs = useMemo(
    () =>
      itemStrings.map((item, index) => ({
        content: item,
        index,
        id: `${item}-${index}`,
        isLocked: index === 0,
      })),
    [itemStrings],
  );

  const filteredOrders = useMemo(() => {
    let result = Array.isArray(orders) ? [...orders] : [];
    if (queryValue) {
      const lowerQuery = queryValue.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(lowerQuery) ||
          o.supplier.toLowerCase().includes(lowerQuery) ||
          o.destination.toLowerCase().includes(lowerQuery),
      );
    }
    return result;
  }, [orders, queryValue]);

  const paginatedOrders = useMemo(
    () =>
      filteredOrders.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [filteredOrders, currentPage],
  );

  const handleSelectionChange = useCallback(
    (selectionType, toggleType, selection) => {
      if (selectionType === "single") {
        setSelectedResources((prev) =>
          toggleType
            ? [...new Set([...prev, selection])]
            : prev.filter((id) => id !== selection),
        );
      }
    },
    [],
  );

  const allResourcesSelected =
    paginatedOrders.length > 0 &&
    paginatedOrders.every((o) => selectedResources.includes(o.id));

  const startIdx =
    filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, filteredOrders.length);
  const paginationLabel = `${startIdx} - ${endIdx} of ${filteredOrders.length}`;

  const breakpoints = useBreakpoints();
  const condensed = breakpoints.smDown;

  const handleRowClick = useCallback(
    (id) => {
      navigate(`/app/purchase-order/${id}`, {
        state: { order: orders.find((o) => o.id === id) },
      });
    },
    [navigate, orders],
  );

  const rowMarkup = paginatedOrders.map(
    (
      {
        id,
        orderNumber,
        supplier,
        destination,
        status,
        received,
        total,
        expectedArrival,
      },
      index,
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        // selected={selectedResources.includes(id)}
        position={index}
        onClick={() => {
          (setLoading(true), handleRowClick(id));
        }}
        style={{ cursor: "pointer" }}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="semibold" as="span">
            {orderNumber}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text>{supplier}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text>{destination}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge
            tone={orderStatus === "Ordered" ? "success" : "warning"}
            progress="incomplete"
          >
            <Text variant="headingXs" as="h5">
              {orderStatus === "Ordered" ? orderStatus : status}
            </Text>
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text>{received}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text numeric>{total}</Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text>{expectedArrival}</Text>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <>
      {/* Loader */}
      {loading && (
        <EmptyState
          inlineAlign="center"
          verticalAlign="center"
          maxHeight="500px"
        >
          <Spinner accessibilityLabel="Loading files" size="large" />
        </EmptyState>
      )}
      {/* Empty State */}
      {!loading && !error && (!orders || orders.length === 0) && (
        <EmptyState
          heading="No purchase orders"
          action={{
            content: "Create purchase order",
            url: "/app/purchaseOrder-create",
            onAction: () => setLoading(true),
          }}
          image="https://cdn.shopify.com/s/files/1/0909/0206/9619/files/emptystate-files.avif?width=500&v=1750777601"
        >
          <p>Looks like your library is empty.</p>
        </EmptyState>
      )}

      {/* Main Page */}
      {!loading && !error && orders && orders.length > 0 && (
        <Page
          fullWidth
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon source={OrderIcon} />
              <Text variant="headingLg" as="h5">
                Purchase Orders
              </Text>
            </div>
          }
          primaryAction={
            <Button
              loading={loading}
              variant="primary"
              onClick={() => {
                (navigate("/app/purchaseOrder-create"), setLoading(true));
              }}
            >
              Create purchase order
            </Button>
          }
        >
          <LegacyCard>
            <Box paddingBlockEnd="400">
              <IndexFilters
                queryValue={queryValue}
                onQueryChange={setQueryValue}
                onQueryClear={() => setQueryValue("")}
                queryPlaceholder="Search by order, supplier, or destination"
                mode={mode}
                setMode={setMode}
                tabs={viewTabs}
                cancelAction={{
                  onAction: () => setQueryValue(""),
                  disabled: false,
                  loading: false,
                }}
                filters={[]}
              />
              <IndexTable
                condensed={condensed}
                resourceName={{
                  singular: "purchase order",
                  plural: "purchase orders",
                }}
                itemCount={paginatedOrders.length}
                selectedItemsCount={
                  selectedResources.filter((id) =>
                    paginatedOrders.some((o) => o.id === id),
                  ).length
                }
                allResourcesSelected={allResourcesSelected}
                onSelectionChange={handleSelectionChange}
                headings={[
                  { title: "Purchase order" },
                  { title: "Supplier" },
                  { title: "Destination" },
                  { title: "Status" },
                  { title: "Received" },
                  { title: "Total" },
                  { title: "Expected arrival" },
                ]}
                pagination={{
                  hasPrevious: currentPage > 1,
                  hasNext: currentPage * pageSize < filteredOrders.length,
                  onPrevious: () =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1)),
                  onNext: () => setCurrentPage((prev) => prev + 1),
                  label: paginationLabel,
                }}
              >
                {rowMarkup}
              </IndexTable>
            </Box>
          </LegacyCard>
        </Page>
      )}
    </>
  );
}
export default OrderManagement;
