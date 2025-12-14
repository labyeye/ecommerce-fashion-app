import { forwardRef, useEffect, useState, useCallback, useMemo } from "react";
import logo from "../assets/images/logoblack.png";

type InvoiceProps = {
  order: any;
};

const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ order }, ref) => {
  const o = order?.order || order
  try {
    console.debug(
      "Invoice component - resolved order:",
      o,
      "invoiceNo:",
      o?.invoiceNo
    );
  } catch (e) {
  }
  const company = {
    name: "NS Designs",
    email: "flauntbynishi@gmail.com",
    address: "W 12 Laxminarayan Estate, BRC compound, Udhna, Surat, 394210",
    gstno: "24BLAPT4549M1ZN",
    phone: "+91 86780 40000",
  };

  const fmt = (n: number) => `₹${(n || 0).toFixed(2)}`;
  const [fetchedProducts, setFetchedProducts] = useState<Record<string, any>>(
    {}
  );
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const productIds = useMemo(() => {
    if (!o?.items) return [];

    const ids = new Set<string>();
    o.items.forEach((it: any) => {
      const p = it.product;
      if (typeof p === "string" && p) {
        ids.add(p);
      } else if (p && typeof p === "object" && p._id) {
        ids.add(String(p._id));
      }
    });
    return Array.from(ids);
  }, [o?.items]);

  // Fetch product details
  useEffect(() => {
    if (productIds.length === 0) return;

    const fetchProducts = async () => {
      // Build map of any products already embedded in the order items
      const embeddedMap: Record<string, any> = {};
      try {
        (o?.items || []).forEach((it: any) => {
          if (it && it.product && typeof it.product === "object" && it.product._id) {
            embeddedMap[String(it.product._id)] = it.product;
          }
        });
      } catch (e) {}

      // Merge embedded products into fetchedProducts so UI can show names immediately
      if (Object.keys(embeddedMap).length > 0) {
        setFetchedProducts((prev) => ({ ...embeddedMap, ...prev }));
      }

      // Filter out already fetched products (including embedded ones)
      const idsToFetch = productIds.filter((id) => !fetchedProducts[id] && !embeddedMap[id]);

      // If nothing to fetch, avoid flipping loading state
      if (idsToFetch.length === 0) return;

      setLoadingProducts(true);

      try {
        const map: Record<string, any> = {};

        // Fetch products in parallel
        await Promise.allSettled(
          idsToFetch.map(async (id) => {
            try {
              const res = await fetch(
                `https://ecommerce-fashion-app-som7.vercel.app/api/products/${id}`
              );
              if (!res.ok) {
                console.warn(`Failed to fetch product ${id}: ${res.status}`);
                return;
              }

              const body = await res.json();
              if (body?.success && body.data) {
                // Handle both single product and array responses
                const prod = Array.isArray(body.data) ? body.data[0] : body.data;
                if (prod) {
                  map[id] = prod;
                }
              }
            } catch (e) {
              console.warn(`Error fetching product ${id}:`, e);
            }
          })
        );

        // Update state if we got any new products
        if (Object.keys(map).length > 0) {
          setFetchedProducts((prev) => ({ ...prev, ...map }));
        }
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [productIds, fetchedProducts]);

  const getItemName = useCallback(
    (it: any): string => {
      if (!it) return "Product";

      // If item already has a name/title use it
      if (it.name && String(it.name).trim() !== "") return String(it.name).trim();

      // If item.product is an object, prefer its readable fields
      if (it.product && typeof it.product === "object") {
        const prod = it.product;
        const candidate = prod.name || prod.title || prod.productName || prod.displayName;
        if (candidate && String(candidate).trim() !== "") return String(candidate).trim();
        // fallback to _id if present
        if (prod._id) return `Product (${String(prod._id).slice(0, 8)})`;
      }

      // If item.product is an id string, try fetchedProducts map
      if (it.product && typeof it.product === "string") {
        const p = fetchedProducts[it.product];
        if (p) {
          const candidate = p.name || p.title || p.productName || p.displayName;
          if (candidate && String(candidate).trim() !== "") return String(candidate).trim();
        }
        // fallback to short id
        return `Product (${String(it.product).slice(0, 8)})`;
      }

      // Final fallback: use item's id or generic label
      if (it._id) return `Product (${String(it._id).slice(0, 8)})`;
      return "Product";
    },
    [fetchedProducts]
  );

  const getItemDisplay = useCallback(
    (it: any) => {
      const base = getItemName(it);
      const variants: string[] = [];

      if (it.color && it.color.trim() !== "") variants.push(it.color);
      if (it.size && it.size.trim() !== "") variants.push(it.size);

      // Try to find HSN: first on the item, then on the product object, then fetched products

      if (variants.length > 0) {
        return `${base} — ${variants.join(" / ")}`;
      }

      return base;
    },
    [getItemName, fetchedProducts]
  );

  const getItemHSN = useCallback(
    (it: any): string => {
      try {
        // Prefer explicit HSN stored on the order item
        if (it && it.hsn && String(it.hsn).trim() !== "") {
          return String(it.hsn).trim();
        }

        // If item.product is an object with hsn
        if (
          it &&
          it.product &&
          typeof it.product === "object" &&
          it.product.hsn
        ) {
          return String(it.product.hsn).trim();
        }

        // If product ID string and we fetched product info
        if (
          it &&
          typeof it.product === "string" &&
          fetchedProducts[it.product] &&
          fetchedProducts[it.product].hsn
        ) {
          return String(fetchedProducts[it.product].hsn).trim();
        }

        // If product is object with _id and we fetched it
        if (
          it &&
          it.product &&
          it.product._id &&
          fetchedProducts[String(it.product._id)] &&
          fetchedProducts[String(it.product._id)].hsn
        ) {
          return String(fetchedProducts[String(it.product._id)].hsn).trim();
        }
      } catch (e) {
        // ignore
      }

      return "";
    },
    [fetchedProducts]
  );

  const formatPaymentMethod = (payment: any) => {
    if (!payment && payment !== 0) return "N/A";

    // Normalize raw value
    let raw: any = payment;
    if (typeof payment === "object") {
      raw =
        payment.provider ||
        payment.gateway ||
        payment.method ||
        payment.type ||
        payment.channel ||
        payment.payment_method ||
        payment.paymentMethod ||
        payment.mode ||
        payment.name ||
        payment.instrument ||
        raw;
    }

    // If Razorpay nested info exists, prefer that
    if (typeof payment === "object") {
      if (payment.razorpay && payment.razorpay.method) {
        raw = payment.razorpay.method;
      } else if (
        payment.razorpay &&
        payment.razorpay.card &&
        payment.razorpay.card.network
      ) {
        raw = payment.razorpay.card.network;
      }
    }

    const s = String(raw || "").toLowerCase();

    const provider = (() => {
      if (s.includes("razor")) return "Razorpay";
      if (s.includes("paytm")) return "Paytm";
      if (s.includes("paypal")) return "PayPal";
      if (s.includes("cod") || s.includes("cash")) return "Cash on Delivery";
      return null;
    })();

    const methodFromString = (() => {
      if (s.includes("card") || s.includes("credit") || s.includes("debit"))
        return "Card";
      if (s.includes("upi")) return "UPI";
      if (s.includes("net") || s.includes("bank") || s.includes("netbank"))
        return "Netbanking";
      if (s.includes("wallet")) return "Wallet";
      return null;
    })();

    // If payment is object, look for more detailed fields
    let detail = "";
    if (typeof payment === "object") {
      detail =
        payment.method ||
        payment.channel ||
        payment.payment_method ||
        payment.paymentMethod ||
        payment.mode ||
        payment.instrument ||
        payment.type ||
        "";
    }

    const detailLabel = String(detail || "").toLowerCase();
    const detailNice = detailLabel.includes("card")
      ? "Card"
      : detailLabel.includes("upi")
      ? "UPI"
      : detailLabel.includes("net") ||
        detailLabel.includes("bank") ||
        detailLabel.includes("netbank")
      ? "Netbanking"
      : detailLabel.includes("wallet")
      ? "Wallet"
      : detailLabel.includes("cod") || detailLabel.includes("cash")
      ? "Cash on Delivery"
      : "";

    if (provider && detailNice) return `${provider} — ${detailNice}`;
    if (provider)
      return provider + (methodFromString ? ` — ${methodFromString}` : "");
    if (detailNice) return detailNice;
    if (methodFromString) return methodFromString;

    // fallback: title-case raw
    return String(raw || "N/A").replace(/(^|\s)\S/g, (t) => t.toUpperCase());
  };

  const renderAddress = (addr: any, title: string) => {
    if (!addr || Object.keys(addr).length === 0) {
      return (
        <div style={{ fontSize: 12, fontFamily: "federo-numeric" }}>
          No {title} address provided
        </div>
      );
    }

    const name = addr.firstName || addr.firstname || addr.name || "";
    const lastName = addr.lastName || addr.lastname || "";
    const email = addr.email || "";
    const phone = addr.phone || "";
    const street = addr.street || addr.address || "";
    const city = addr.city || "";
    const state = addr.state || "";
    const zip =
      addr.zipCode || addr.postalCode || addr.zip || addr.pincode || "";
    const country = addr.country || "";

    return (
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 14,

            marginBottom: 4,
            fontFamily: "federo-numeric",
            fontWeight: 600,
          }}
        >
          {title}
        </div>
        {name && (
          <div
            style={{
              fontSize: 12,

              fontFamily: "federo-numeric",
            }}
          >
            {name} {lastName}
          </div>
        )}
        {email && (
          <div
            style={{
              fontSize: 12,

              fontFamily: "federo-numeric",
            }}
          >
            {email}
          </div>
        )}
        {phone && (
          <div
            style={{
              fontSize: 12,

              fontFamily: "federo-numeric",
            }}
          >
            {phone}
          </div>
        )}
        {street && (
          <div
            style={{
              fontSize: 12,

              fontFamily: "federo-numeric",
            }}
          >
            {street}
          </div>
        )}
        {(city || state || zip) && (
          <div
            style={{
              fontSize: 12,

              fontFamily: "federo-numeric",
            }}
          >
            {[city, state].filter(Boolean).join(", ")} {zip}
          </div>
        )}
        {country && (
          <div
            style={{
              fontSize: 12,

              fontFamily: "federo-numeric",
            }}
          >
            {country}
          </div>
        )}
      </div>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      const day = d.getDate().toString().padStart(2, "0");
      const month = (d.getMonth() + 1).toString().padStart(2, "0");
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return "Invalid date";
    }
  };

  // Calculate subtotal if not provided
  const subtotal = useMemo(() => {
    if (o?.subtotal || o?.subTotal) return o.subtotal || o.subTotal;

    if (Array.isArray(o?.items)) {
      return o.items.reduce((sum: number, item: any) => {
        return sum + (item.price || 0) * (item.quantity || 1);
      }, 0);
    }

    return 0;
  }, [o]);

  // Determine tax breakdown to display — use billing address state ONLY (do not use shipping address)
  const billingStateRaw = o?.billingAddress?.state || "";
  const billingState = String(billingStateRaw).trim().toLowerCase();
  const isGujrat = billingState === "gujrat" || billingState === "gujarat";

  const cgstAmount = Number(o?.cgst ?? 0);
  const sgstAmount = Number(o?.sgst ?? 0);
  const igstAmount = Number(o?.igst ?? 0);

  const taxTotalAmount = Number(
    o?.taxTotal ?? o?.tax ?? cgstAmount + sgstAmount + igstAmount
  );

  let shippingCost = 100;

  const taxFromOrder = typeof o?.tax === "number" ? o.tax : o?.taxAmount ?? 0;

  const igstDisplayed =
    typeof o?.igst === "number" && o.igst > 0
      ? o.igst
      : taxFromOrder > 0
      ? taxFromOrder
      : Math.round((subtotal * 0.05 ) * 100) / 100;

  const totalFromOrder =
    typeof o?.total === "number"
      ? o.total
      : Math.round(
          (subtotal + taxFromOrder + shippingCost ) * 100
        ) / 100;

  return (
    <div
      ref={ref}
      style={{
        width: 800,
        fontFamily: "Arial, Helvetica, sans-serif",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        minHeight: 1120,
      }}
      className="invoice-root bg-white"
    >
      {/* Top Brown Bar */}
      <div
        style={{
          background: "#8B4B2A",
          height: 26,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
        }}
      />

      {/* Main Content */}
      <div
        style={{
          paddingTop: 40,
          paddingBottom: 24,
          paddingLeft: 24,
          paddingRight: 24,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          {/* Left side - Logo and Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 140,
                height: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
              }}
            >
              <img
                src={logo}
                alt="Flaunt by Nishi"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </div>

            <div
              style={{
                marginLeft: 24,
                fontSize: 12,
                fontFamily: "federo-numeric",
              }}
            >
              <div
                style={{
                  fontSize: 16,
                  color: "#8B4B2A",
                  fontWeight: 700,
                  fontFamily: "federo-numeric",
                }}
              >
                {company.name}
              </div>
              <div
                style={{
                  marginBottom: 4,
                  fontFamily: "federo-numeric",
                }}
              >
                {company.address.split(",")[0]}
              </div>
              <div style={{ marginBottom: 4, fontFamily: "federo-numeric" }}>
                {company.address.split(",").slice(1).join(",").trim()}
              </div>
              <div style={{ fontFamily: "federo-numeric" }}>
                GST No: {company.gstno}
              </div>
              <div style={{ fontFamily: "federo-numeric" }}>
                {company.email}
              </div>
              <div style={{ fontFamily: "federo-numeric" }}>
                {company.phone}
              </div>
            </div>
          </div>

          {/* Right side - Invoice Details */}
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#8B4B2A",
                fontFamily: "federo-numeric",
              }}
            >
              Tax Invoice
            </div>
            <div
              style={{
                fontSize: 12,
                fontFamily: "federo-numeric",
              }}
            >
              Order Id: {o?.orderNumber || o?._id || "N/A"}
            </div>
            <div
              style={{
                fontSize: 12,
                fontFamily: "federo-numeric",
              }}
            >
              Invoice No: {o?.invoiceNo || "-"}
            </div>
            <div
              style={{
                fontSize: 12,
                fontFamily: "federo-numeric",
              }}
            >
              Date:{" "}
              {o?.createdAt
                ? formatDate(o.createdAt)
                : formatDate(new Date().toISOString())}
            </div>
          </div>
        </div>

        {/* Company Address - Moved UP as requested */}
        <div
          style={{
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom: "1px solid #eee",
          }}
        ></div>

        {/* Customer and Payment Details - Moved DOWN as requested */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 24,
          }}
        >
          {/* Customer Details - Left side */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                color: "#8B4B2A",
                fontWeight: 700,
                fontFamily: "federo-numeric",
                marginBottom: 8,
              }}
            >
              Customer Details
            </div>
            <div style={{ display: "flex", gap: 40 }}>
              <div style={{ flex: 1, color: "#8B4B2A" }}>
                {renderAddress(
                  o?.billingAddress || o?.shippingAddress,
                  "Billing"
                )}
              </div>
              <div style={{ flex: 1, color: "#8B4B2A" }}>
                {renderAddress(
                  o?.shippingAddress || o?.billingAddress,
                  "Shipping"
                )}
              </div>
              <div style={{ width: 240 }}>
                <div
                  style={{
                    color: "#8B4B2A",
                    fontFamily: "federo-numeric",
                    marginBottom: 8,
                  }}
                >
                  Payment
                </div>
                <div
                  style={{
                    fontSize: 12,

                    marginBottom: 4,
                    fontFamily: "federo-numeric",
                  }}
                >
                  <strong>Method:</strong>{" "}
                  {formatPaymentMethod(o?.payment || o?.payment?.method)}
                </div>
                <div
                  style={{
                    fontSize: 12,

                    marginBottom: 4,
                    fontFamily: "federo-numeric",
                  }}
                >
                  <strong>Status:</strong> {o?.payment?.status || "N/A"}
                </div>
                {/* Show transaction id when available (Razorpay or generic) */}
                {(
                  o?.payment?.transactionId ||
                  o?.payment?.paymentId ||
                  (o?.payment && o.payment.razorpay && (o.payment.razorpay.paymentId || o.payment.razorpay.payment_id))
                ) && (
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: "federo-numeric",
                      marginTop: 2,
                    }}
                  >
                    <strong>Transaction ID:</strong>{" "}
                    {o?.payment?.transactionId || o?.payment?.paymentId || o?.payment?.razorpay?.paymentId || o?.payment?.razorpay?.payment_id}
                  </div>
                )}
                <div
                  style={{
                    fontSize: 12,

                    fontFamily: "federo-numeric",
                  }}
                >
                  <strong>Order Status:</strong> {o?.status || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details - Right side */}
        </div>

        {/* Items Table */}
        <div style={{ marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: "12px 8px",
                    borderBottom: "2px solid #8B4B2A",
                    color: "#8B4B2A",
                    fontFamily: "federo-numeric",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Item
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "12px 8px",
                    borderBottom: "2px solid #8B4B2A",
                    color: "#8B4B2A",
                    fontFamily: "federo-numeric",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  HSN
                </th>
                <th
                  style={{
                    textAlign: "center",
                    padding: "12px 8px",
                    borderBottom: "2px solid #8B4B2A",
                    color: "#8B4B2A",
                    fontFamily: "federo-numeric",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "12px 8px",
                    borderBottom: "2px solid #8B4B2A",
                    color: "#8B4B2A",
                    fontFamily: "federo-numeric",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  MRP
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "12px 8px",
                    borderBottom: "2px solid #8B4B2A",
                    color: "#8B4B2A",
                    fontFamily: "federo-numeric",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(o?.items) && o.items.length > 0 ? (
                o.items.map((it: any, idx: number) => (
                  <tr key={idx}>
                    <td
                      style={{
                        padding: "12px 8px",
                        borderBottom: "1px solid #f3f3f3",
                        fontFamily: "federo-numeric",
                        fontSize: 14,
                        verticalAlign: "top",
                      }}
                    >
                      {loadingProducts ? (
                        <div style={{ fontStyle: "italic" }}>
                          Loading product details...
                        </div>
                      ) : (
                        getItemDisplay(it)
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        borderBottom: "1px solid #f3f3f3",
                        fontFamily: "federo-numeric",
                        fontSize: 14,
                        verticalAlign: "top",
                      }}
                    >
                      {getItemHSN(it) || "-"}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        borderBottom: "1px solid #f3f3f3",
                        fontFamily: "federo-numeric",
                        fontSize: 14,
                        verticalAlign: "top",
                      }}
                    >
                      {it.quantity || 1}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "right",
                        borderBottom: "1px solid #f3f3f3",
                        fontFamily: "federo-numeric",
                        fontSize: 14,
                        verticalAlign: "top",
                      }}
                    >
                      {fmt(it.price || 0)}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "right",
                        borderBottom: "1px solid #f3f3f3",
                        fontFamily: "federo-numeric",
                        fontSize: 14,
                        verticalAlign: "top",
                      }}
                    >
                      {fmt((it.price / 1.05 || 0) * (it.quantity || 1))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      padding: 16,
                      textAlign: "center",

                      fontFamily: "federo-numeric",
                    }}
                  >
                    No items in this order
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 40,
          }}
        >
          <div style={{ width: 300 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                fontFamily: "federo-numeric",
                fontSize: 14,
              }}
            >
              <div style={{ fontFamily: "federo-numeric" }}>Subtotal</div>
              <div style={{ fontWeight: 600, fontFamily: "federo-numeric" }}>
                {fmt(subtotal)}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                fontFamily: "federo-numeric",
                fontSize: 14,
              }}
            >
              <div style={{ fontFamily: "federo-numeric" }}>Shipping</div>
              <div style={{ fontWeight: 600, fontFamily: "federo-numeric" }}>
                {fmt(shippingCost)}
              </div>
            </div>
            {isGujrat ? (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    fontFamily: "federo-numeric",
                    fontSize: 14,
                  }}
                >
                  <div style={{ fontFamily: "federo-numeric" }}>
                    CGST (2.5%)
                  </div>
                  <div
                    style={{ fontWeight: 600, fontFamily: "federo-numeric" }}
                  >
                    {fmt(cgstAmount)}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    fontFamily: "federo-numeric",
                    fontSize: 14,
                  }}
                >
                  <div style={{ fontFamily: "federo-numeric" }}>
                    SGST (2.5%)
                  </div>
                  <div
                    style={{ fontWeight: 600, fontFamily: "federo-numeric" }}
                  >
                    {fmt(sgstAmount)}
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  fontFamily: "federo-numeric",
                  fontSize: 14,
                }}
              >
                <div style={{ fontFamily: "federo-numeric" }}>
                  IGST (5% of subtotal)
                </div>
                <div style={{ fontWeight: 600, fontFamily: "federo-numeric" }}>
                  {fmt(igstDisplayed)}
                </div>
              </div>
            )}

            {/* Invoice aligns with Order Details page: discount is not shown here */}

            <div
              style={{
                borderTop: "2px solid #8B4B2A",
                marginTop: 6,
                paddingTop: 6,
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "federo-numeric",
                fontSize: 16,
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  color: "#8B4B2A",
                  fontFamily: "federo-numeric",
                }}
              >
                Total
              </div>
              <div
                style={{
                  fontWeight: 800,
                  color: "#8B4B2A",
                  fontFamily: "federo-numeric",
                }}
              >
                {fmt(totalFromOrder)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - pushed to bottom so lines align at page end */}
      </div>
      <div
        style={{
          borderTop: "1px dashed ",
          textAlign: "center",
          marginTop: "auto",
          width: "100%",
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontFamily: "federo-numeric",
            marginBottom: 8,
          }}
        >
          Subject to Surat Jurisdiction
        </div>
        <div
          style={{
            fontSize: 14,
            fontFamily: "federo-numeric",
            marginBottom: 13,
          }}
        >
          Thank you for your purchase!
        </div>
        <div
          style={{
            background: "#8B4B2A",
            height: 16,
            width: "100%",
          }}
        />
      </div>
    </div>
  );
});

Invoice.displayName = "Invoice";

export default Invoice;
