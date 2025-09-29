import {
  Card,
  TextField,
  Select,
  DatePicker,
  Popover,
  Icon,
  InlineGrid,
} from "@shopify/polaris";
import { useCallback, useState } from "react";

import { CalendarIcon } from "@shopify/polaris-icons";

export default function ShipmentDetailsCard({
  data,
  onUpdate,
  carrierOptions,
  isEditing = true,
}) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [{ month, year }, setDate] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date(data.estimatedArrival),
  );
  const [inputValue, setInputValue] = useState(data.estimatedArrival);
  const [popoverActive, setPopoverActive] = useState(false);

  // validation state
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  const openPopover = useCallback(() => setPopoverActive(true), []);
  const closePopover = useCallback(() => setPopoverActive(false), []);

  const handleMonthChange = useCallback(
    (m, y) => setDate({ month: m, year: y }),
    [],
  );

  // simple validator: format + valid Date
  const validate = useCallback((value) => {
    if (!value || value.length === 0) {
      return "Estimated arrival is required";
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return "Invalid format — use YYYY-MM-DD";
    }
    const parsed = new Date(value);
    if (isNaN(parsed)) {
      return "Invalid date";
    }
    return ""; // no error
  }, []);

  // called while typing
  const handleTextFieldChange = useCallback(
    (value) => {
      const sanitized = value.replace(/[^0-9-]/g, "").slice(0, 10);
      setInputValue(sanitized);

      if (sanitized.length === 10) {
        const v = validate(sanitized);
        setError(v);
        if (!v) {
          const parsed = new Date(sanitized);
          setSelectedDate(parsed);
          setDate({ month: parsed.getMonth(), year: parsed.getFullYear() });
          onUpdate({ ...data, estimatedArrival: sanitized });
        }
      } else {
        if (touched) {
          setError("Invalid format — use YYYY-MM-DD");
        } else {
          setError("");
        }
      }
    },
    [validate, touched, setDate, data, onUpdate],
  );

  const handleTextFieldBlur = useCallback(() => {
    setTouched(true);
    const v = validate(inputValue);
    setError(v);
    if (!v && inputValue) {
      onUpdate({ ...data, estimatedArrival: inputValue });
    }
  }, [inputValue, validate, data, onUpdate]);

  const handleDateChange = useCallback(
    (dateRange) => {
      const d = dateRange.start;

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0"); // month 0-indexed
      const day = String(d.getDate()).padStart(2, "0");

      const iso = `${year}-${month}-${day}`; // YYYY-MM-DD in local timezone

      setSelectedDate(d);
      setInputValue(iso);
      setDate({ month: d.getMonth(), year: d.getFullYear() });
      setError("");
      setTouched(true);
      closePopover();
      onUpdate({ ...data, estimatedArrival: iso });
    },
    [closePopover, setDate, data, onUpdate],
  );

  const [shippingCarrier, setShippingCarrier] = useState(data.shippingCarrier);
  const handleCarrierChange = useCallback(
    (value) => {
      setShippingCarrier(value);
      onUpdate({ ...data, shippingCarrier: value });
    },
    [data, onUpdate],
  );
  const [trackingNumber, setTrackingNumber] = useState(data.trackingNumber);
  const handleTrackingNumberChange = useCallback(
    (value) => {
      setTrackingNumber(value);
      onUpdate({ ...data, trackingNumber: value });
    },
    [data, onUpdate],
  );

  const [trackingUrl, setTrackingUrl] = useState(data.trackingUrl);
  const handleTrackingUrlChange = useCallback(
    (value) => {
      setTrackingUrl(value);
      onUpdate({ ...data, trackingUrl: value });
    },
    [data, onUpdate],
  );

  return (
    <Card sectioned title="Shipment details">
      <InlineGrid columns={4} gap="400">
        <Popover
          active={popoverActive}
          activator={
            <TextField
              disabled={!isEditing}
              label="Estimated arrival"
              value={inputValue}
              onChange={handleTextFieldChange}
              onFocus={openPopover}
              onBlur={handleTextFieldBlur}
              suffix={<Icon source={CalendarIcon} />}
              autoComplete="off"
              placeholder="YYYY-MM-DD"
              error={error || undefined}
            />
          }
          onClose={closePopover}
        >
          <DatePicker
            disabled={!isEditing}
            month={month}
            year={year}
            onChange={handleDateChange}
            onMonthChange={handleMonthChange}
            selected={{ start: selectedDate, end: selectedDate }}
            allowRange={false}
            disableDatesBefore={today}
          />
        </Popover>
        {/* <Select
          disabled={!isEditing}
          label="Shipping carrier"
          options={carrierOptions}
          onChange={handleCarrierChange}
          value={shippingCarrier.toLowerCase() || ""}
        /> */}
        <TextField
          disabled={!isEditing}
          label="Shipping carrier"
          value={shippingCarrier}
          onChange={(value) => {
            setShippingCarrier(value);
            onUpdate({ ...data, shippingCarrier: value });
          }}
          placeholder="Enter carrier name"
        />

        <TextField
          label="Tracking number"
          disabled={!isEditing}
          value={trackingNumber}
          onChange={handleTrackingNumberChange}
          autoComplete="off"
        />
        <TextField
          disabled={!isEditing}
          label="Tracking URL"
          value={trackingUrl}
          onChange={handleTrackingUrlChange}
          autoComplete="off"
          placeholder="Include http:// or https://"
        />
      </InlineGrid>
    </Card>
  );
}
