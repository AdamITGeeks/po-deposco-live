import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function generatePurchaseOrderPDF(orderData, billingAddressData) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const company = billingAddressData?.name;
  const supplier = orderData.supplier.address || {};
  const destination = orderData.destination?.address || { formatted: [] };

  // Calculate total tax
  const totalTax = orderData?.products
    .reduce((sum, product) => {
      const price = Number(product.price || 0);
      const qty = Number(product.quantity || 0);
      const taxPercent = Number(product.tax || 0);
      return sum + (price * qty * taxPercent) / 100;
    }, 0)
    .toFixed(2);

  const currencySymbol = orderData?.supplier?.supplierCurrency || "USD";
  const billTo = {
    address: billingAddressData?.billingAddress?.formatted,
  };

  // Create complete HTML content
  const completeHtml = `
    <div style="font-family: Arial, sans-serif; width: 794px; background: white; padding: 0;">
      <!-- Header Section -->
      <div style="padding: 20px 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h2 style="font-size: 18px; font-weight: bold;">${company}</h2>
          <div style="text-align: right;">
            <p style="font-size: 14px;">#${orderData.orderNumber || "PO8"}</p>
            <p style="font-size: 14px;">${new Date(orderData.createdAt || "2025-09-26").toLocaleDateString("en-US")}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 25px; gap: 30px;">
          <div style="flex: 1;">
            <p style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">SUPPLIER</p>
            <p style="font-size: 14px; margin: 2px 0;">${supplier.company || " "}</p>
            <p style="font-size: 14px; margin: 2px 0;">${supplier.street || "1224 Burke Street"}</p>
            <p style="font-size: 14px; margin: 2px 0;">${supplier.city || "Hanahan"} ${supplier.state || "SC"} ${supplier.zipCode || "29410"}</p>
            <p style="font-size: 14px; margin: 2px 0;">${supplier.country || "United States"}</p>
          </div>
          <div style="flex: 1;">
            <p style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">SHIP TO</p>
            ${
              destination.formatted?.length
                ? destination.formatted
                    .map(
                      (line) =>
                        `<p style="font-size: 14px; margin: 2px 0;">${line}</p>`,
                    )
                    .join("")
                : "<p style='font-size: 14px; margin: 2px 0;'>-</p>"
            }
          </div>
          <div style="flex: 1;">
            <p style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">BILL TO</p>
            ${
              billTo.address
                ? billTo.address
                    .flatMap((line) => line.split(","))
                    .map(
                      (part) =>
                        `<p style="font-size: 14px; margin: 2px 0;">${part.trim()}</p>`,
                    )
                    .join("")
                : "<p style='font-size: 14px; margin: 2px 0;'>-</p>"
            }
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 25px;">
          <div>
            <p style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">SUPPLIER CURRENCY</p>
            <p style="font-size: 14px;">${currencySymbol}</p>
          </div>
          <div>
            <p style="font-size: 14px; font-weight: bold; margin-bottom: 5px;">ESTIMATED ARRIVAL</p>
            <p style="font-size: 14px;">${orderData.shipment?.estimatedArrival || " -"}</p>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div style="padding: 0 30px;">
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="color: #000; border-bottom: 2px solid #000;">
              <th style="padding: 12px 8px; font-size: 14px; text-align: left; font-weight: bold;">PRODUCTS</th>
              <th style="padding: 12px 8px; font-size: 14px; text-align: center; font-weight: bold;">SUPPLIER SKU</th>
              <th style="padding: 12px 8px; font-size: 14px; text-align: center; font-weight: bold;">QTY</th>
              <th style="padding: 12px 8px; font-size: 14px; text-align: right; font-weight: bold;">COST</th>
              <th style="padding: 12px 8px; font-size: 14px; text-align: center; font-weight: bold;">TAX</th>
              <th style="padding: 12px 8px; font-size: 14px; text-align: right; font-weight: bold;">TOTAL (${currencySymbol|| "USD"})</th>
            </tr>
          </thead>
          <tbody>
            ${(orderData.products || [])
              .map((product) => {
                const price = Number(product.price || 0).toFixed(2);
                const total = Number(product.total || 0).toFixed(2);
                const qty = product.quantity || 0;
                const title =
                  product.title?.replace(/ - Default Title$/, "") ||
                  "[No Title]";
                const shortTitle =
                  title.split(" ").slice(0, 3).join(" ") +
                  (title.split(" ").length > 3 ? " ..." : "");

                return `
                  <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 10px 8px; font-size: 14px; vertical-align: middle;">
                      ${
                        product.image?.originalSrc
                          ? `<img src="${product.image.originalSrc}" crossOrigin="anonymous" width="30" height="30" style="vertical-align: middle; margin-right: 8px; border: 1px solid #eee;" />`
                          : ""
                      }
                      ${shortTitle}
                    </td>
                    <td style="padding: 10px 8px; font-size: 14px; text-align: center; vertical-align: middle;">${product.sku || "-"}</td>
                    <td style="padding: 10px 8px; font-size: 14px; text-align: center; vertical-align: middle;">${qty}</td>
                    <td style="padding: 10px 8px; font-size: 14px; text-align: right; vertical-align: middle;">${currencySymbol}${price}</td>
                    <td style="padding: 10px 8px; font-size: 14px; text-align: center; vertical-align: middle;">${product.tax || 0}%</td>
                    <td style="padding: 10px 8px; font-size: 14px; text-align: right; vertical-align: middle;">${currencySymbol}${total}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>

      <!-- Footer Section -->
      <div style="padding: 30px; margin-top: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div style="flex: 1;">
            <p style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">REFERENCE NUMBER</p>
            <p style="font-size: 14px;">${
              orderData?.additional?.referenceNumber
                ? orderData.additional.referenceNumber
                : "-"
            }</p>
          </div>
          <div style="min-width: 200px; margin-left: 40px;">
            <p style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">COST SUMMARY</p>
            <table style="border-collapse: collapse; width: 100%;">
              <tr>
                <td style="padding: 6px 8px; font-size: 14px; border-bottom: 1px solid #eee;">Taxes (included)</td>
                <td style="padding: 6px 8px; font-size: 14px; text-align: right; border-bottom: 1px solid #eee;">${currencySymbol}${totalTax || "0.00"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 8px; font-size: 14px; border-bottom: 1px solid #eee;">Subtotal (${orderData.products?.length || 0} item${
                  orderData.products?.length !== 1 ? "s" : ""
                })</td>
                <td style="padding: 6px 8px; font-size: 14px; text-align: right; border-bottom: 1px solid #eee;">${orderData.cost?.subtotal || `${currencySymbol}0.00`}</td>
              </tr>
              <tr>
                <td style="padding: 6px 8px; font-size: 14px; border-bottom: 1px solid #eee;">Shipping</td>
                <td style="padding: 6px 8px; font-size: 14px; text-align: right; border-bottom: 1px solid #eee;">${orderData.cost?.shipping || `${currencySymbol}0.00`}</td>
              </tr>
              <tr>
                <td style="padding: 6px 8px; font-size: 14px; font-weight: bold;">Total</td>
                <td style="padding: 6px 8px; font-size: 14px; font-weight: bold; text-align: right;">${orderData.cost?.total || `${currencySymbol}0.00`}</td>
              </tr>
            </table>
          </div>
        </div>

        <div style="margin-top: 25px;">
          <p style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">NOTES TO SUPPLIER</p>
          <p style="font-size: 14px; line-height: 1.4;">${orderData.additional?.noteToSupplier || "-"}</p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 60px;">
          <p style="font-size: 12px; color: #666;">Powered by Shopify</p>
        </div>
      </div>
    </div>
  `;

  // Create wrapper and capture entire content
  const wrapper = document.createElement("div");
  wrapper.style.position = "absolute";
  wrapper.style.left = "-9999px";
  wrapper.style.width = "794px";
  wrapper.style.backgroundColor = "white";
  wrapper.innerHTML = completeHtml;
  document.body.appendChild(wrapper);

  try {
    // Capture entire content as one canvas
    const canvas = await html2canvas(wrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      removeContainer: true,
    });

    const scaleFactor = canvas.width / pageWidth; // px per mm
    const marginPx = 30;
    const marginMm = marginPx * (25.4 / 96); // Convert 30px to mm assuming 96 dpi
    const topMarginMm = marginMm;
    const bottomMarginMm = marginMm;
    const usableHeightMm = pageHeight - topMarginMm - bottomMarginMm;
    const topMarginPx = topMarginMm * scaleFactor;
    const bottomMarginPx = bottomMarginMm * scaleFactor;
    const usableHeightPx = usableHeightMm * scaleFactor;
    const pageHeightPx = pageHeight * scaleFactor;

    let srcY = 0;
    let pageNumber = 1;
    const totalPages = Math.ceil(canvas.height / usableHeightPx);

    while (srcY < canvas.height) {
      if (pageNumber > 1) {
        pdf.addPage();
      }

      const drawHeightPx = Math.min(canvas.height - srcY, usableHeightPx);

      // Create temp canvas for this page
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = pageHeightPx;
      const ctx = tempCanvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

      // Draw the portion of the content
      ctx.drawImage(
        canvas,
        0,
        srcY,
        canvas.width,
        drawHeightPx,
        0,
        topMarginPx,
        canvas.width,
        drawHeightPx,
      );

      // Add the temp canvas to PDF
      pdf.addImage(
        tempCanvas,
        "PNG",
        0,
        0,
        pageWidth,
        pageHeight,
        undefined,
        "FAST",
      );

      // Add page number at bottom
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Page ${pageNumber} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - bottomMarginMm / 2,
        { align: "center" },
      );

      srcY += drawHeightPx;
      pageNumber++;
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    // Clean up
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
  }

  return pdf;
}
