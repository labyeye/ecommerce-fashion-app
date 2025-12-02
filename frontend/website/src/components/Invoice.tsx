import { forwardRef, useEffect, useState, useCallback, useMemo } from "react";
import logo from "../assets/images/logoblack.png";

type InvoiceProps = {
  order: any;
};

const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ order }, ref) => {
  const o = order?.order || order;

  const company = {
    name: "NS Designs",
    email: "flauntbynishi@gmail.com",
    address: "W 12 Laxminarayan Estate, BRC compound, Udhana, Surat, 394210",
    gstno: "24BLAPT4549M1ZN",
    phone: "+91 86780 40000",
  };

  const fmt = (n: number) => `₹${(n || 0).toFixed(2)}`;

  // Keep a map of productId -> product info fetched from server
  const [fetchedProducts, setFetchedProducts] = useState<Record<string, any>>(
    {}
  );
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  // Extract all product IDs from order items
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
      // Filter out already fetched products
      const idsToFetch = productIds.filter((id) => !fetchedProducts[id]);
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
                const prod = Array.isArray(body.data)
                  ? body.data[0]
                  : body.data;
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

      console.log("Item for name:", it); // Debug log
      console.log("Fetched products:", fetchedProducts); // Debug log

      const p = it.product;

      // Case 1: Product is a complete object with name
      if (p && typeof p === "object") {
        console.log("Product object found:", p); // Debug log

        // If product object has name, title or productName directly
        if (p.name || p.title || p.productName) {
          const name = p.name || p.title || p.productName;
          console.log("Found name in product object:", name); // Debug log
          return name;
        }

        // Case 2: Product object has only _id, try fetched products
        if (p._id) {
          const id = String(p._id);
          const fetched = fetchedProducts[id];
          if (fetched) {
            const name = fetched.name || fetched.title || fetched.productName;
            console.log("Found name in fetched products:", name); // Debug log
            return name;
          }
        }
      }

      // Case 3: Product is just an ID string
      if (typeof p === "string" && p) {
        console.log("Product ID string:", p); // Debug log
        const fetched = fetchedProducts[p];
        if (fetched) {
          const name = fetched.name || fetched.title || fetched.productName;
          console.log("Found name by ID:", name); // Debug log
          return name;
        }
      }

      // Case 4: Try item's name field
      if (it.name) {
        console.log("Using item name:", it.name); // Debug log
        return it.name;
      }

      console.log("No name found, returning 'Product'"); // Debug log
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

      if (variants.length > 0) {
        return `${base} — ${variants.join(" / ")}`;
      }

      return base;
    },
    [getItemName]
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
        <div
          style={{ fontSize: 12, color: "#666", fontFamily: "federo-numeric" }}
        >
          No {title} address provided
        </div>
      );
    }

    const name = addr.firstName || addr.firstname || addr.name || "";
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
            color: "#333",
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
              color: "#333",
              fontFamily: "federo-numeric",
            }}
          >
            {name}
          </div>
        )}
        {email && (
          <div
            style={{
              fontSize: 12,
              color: "#333",
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
              color: "#333",
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
              color: "#333",
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
              color: "#333",
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
              color: "#333",
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

  return (
    <div
      ref={ref}
      style={{
        width: 800,
        fontFamily: "Arial, Helvetica, sans-serif",
        position: "relative",
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
                width: 90,
                height: 60,
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
            <div>
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
                  fontSize: 11,
                  color: "#333",
                  fontFamily: "federo-numeric",
                  lineHeight: 1.6,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
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
                color: "#666",
                fontFamily: "federo-numeric",
              }}
            >
              Order Id: {o?.orderNumber || o?._id || "N/A"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#666",
                marginTop: 6,
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
              <div style={{ flex: 1 }}>
                {renderAddress(
                  o?.billingAddress || o?.shippingAddress,
                  "Billing"
                )}
              </div>
              <div style={{ flex: 1 }}>
                {renderAddress(
                  o?.shippingAddress || o?.billingAddress,
                  "Shipping"
                )}
              </div>
            </div>
          </div>

          {/* Payment Details - Right side */}
          <div style={{ width: 240 }}>
            <div
              style={{
                fontSize: 12,
                color: "#8B4B2A",
                fontWeight: 700,
                fontFamily: "federo-numeric",
                marginBottom: 8,
              }}
            >
              Payment
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#333",
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
                color: "#333",
                marginBottom: 4,
                fontFamily: "federo-numeric",
              }}
            >
              <strong>Status:</strong> {o?.payment?.status || "N/A"}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "#333",
                fontFamily: "federo-numeric",
              }}
            >
              <strong>Order Status:</strong> {o?.status || "N/A"}
            </div>
          </div>
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
                  Price
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
                        <div style={{ color: "#999", fontStyle: "italic" }}>
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
                      {fmt((it.price || 0) * (it.quantity || 1))}
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
                      color: "#666",
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
              <div style={{ color: "#666" }}>Subtotal</div>
              <div style={{ fontWeight: 600 }}>{fmt(subtotal)}</div>
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
              <div style={{ color: "#666" }}>Shipping</div>
              <div style={{ fontWeight: 600 }}>
                {fmt(o?.shipping?.cost || o?.shippingCost || 0)}
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
              <div style={{ color: "#666" }}>Tax</div>
              <div style={{ fontWeight: 600 }}>{fmt(o?.tax || 0)}</div>
            </div>

            {/* Discount if applicable */}
            {(o?.discount?.amount || o?.discountAmount || o?.discount) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  fontFamily: "federo-numeric",
                  fontSize: 14,
                  color: "#27ae60",
                }}
              >
                <div>Discount</div>
                <div style={{ fontWeight: 600 }}>
                  -
                  {fmt(
                    Math.abs(
                      o?.discount?.amount ||
                        o?.discountAmount ||
                        o?.discount ||
                        0
                    )
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                borderTop: "2px solid #8B4B2A",
                marginTop: 12,
                paddingTop: 16,
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
                }}
              >
                Total
              </div>
              <div
                style={{
                  fontWeight: 800,
                  color: "#8B4B2A",
                }}
              >
                {fmt(o?.total || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px dashed #ddd",
            paddingTop: 20,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#666",
              fontFamily: "federo-numeric",
              marginBottom: 8,
            }}
          >
            This is a computer-generated invoice. No signature required.
          </div>
          <div
            style={{
              fontSize: 14,
              color: "#333",
              fontFamily: "federo-numeric",
              marginBottom: 8,
            }}
          >
            Thank you for your purchase!
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#666",
              fontFamily: "federo-numeric",
            }}
          >
            For any queries, contact {company.email} or call {company.phone}
          </div>
        </div>
      </div>

      {/* Bottom Brown Bar */}
      <div
        style={{
          background: "#8B4B2A",
          height: 16,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
      />
    </div>
  );
});

Invoice.displayName = "Invoice";

export default Invoice;
