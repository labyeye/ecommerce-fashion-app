import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Ruler,
  X,
} from "lucide-react";
import { useCartContext } from "../../context/CartContext";
import { getProductById, Product } from "../../services/productService";
import { useLoyaltyTier } from "../../hooks/useLoyaltyTier";
import { canAccessProduct } from "../../hooks/useProductAccess";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import sizechart from "../../assets/images/sizechart.jpg";
import ProductCard from "../Home/ProductCard";

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartContext();
  const userTier = useLoyaltyTier();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const hasAccess = product ? canAccessProduct(product, userTier) : true;
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const { user } = useAuth() || {};

  // Product reviews state
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  // Delivery check state
  const [pincode, setPincode] = useState("");
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<null | { deliverable: boolean; estDays?: number; message?: string }>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedProduct = await getProductById(id);

        if (!fetchedProduct) {
          throw new Error("Product not found");
        }

        setProduct(fetchedProduct);

        // Set initial color if available
        if (
          Array.isArray(fetchedProduct.colors) &&
          fetchedProduct.colors.length > 0
        ) {
          setSelectedColor(fetchedProduct.colors[0].name);
        }

        // Reset size selection
        setSelectedSize("");

        // Reset error state
        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "Failed to load product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    // Load product reviews when the product changes
    if (id) fetchProductReviews();
    // Load related products when product changes
    if (id) fetchOtherProducts();
    // Check purchase status if user is logged in
    if (id && user) checkPurchase();
  }, [id]);

  // Other products (recommendations)
  const [otherProducts, setOtherProducts] = useState<any[]>([]);
  const fetchOtherProducts = async () => {
    try {
      // Try a simple products endpoint; backend can provide better related-product API
      const res = await axios.get(`https://ecommerce-fashion-app-som7.vercel.app/api/products?limit=6`);
      const data = res?.data?.data || res?.data || [];
      // Filter out current product
      const filtered = Array.isArray(data)
        ? data.filter((p: any) => p._id !== id).slice(0, 6)
        : [];
      setOtherProducts(filtered);
    } catch (err) {
      console.warn("Failed to fetch other products", err);
      setOtherProducts([]);
    }
  };

  const checkDelivery = async () => {
    if (!pincode || pincode.trim().length < 3) {
      setDeliveryInfo({ deliverable: false, message: "Enter a valid pincode" });
      return;
    }

    try {
      setCheckingDelivery(true);
      setDeliveryInfo(null);
      // Backend endpoint expectation: GET /api/shipping/check?pincode=XXXXX
      const res = await axios.get(`https://ecommerce-fashion-app-som7.vercel.app/api/shipping/check?pincode=${encodeURIComponent(
        pincode
      )}`);
      // Expect response { deliverable: boolean, estDays?: number, message?: string }
      const info = res?.data || null;
      if (info) setDeliveryInfo(info);
      else setDeliveryInfo({ deliverable: false, message: "No delivery info" });
    } catch (err: any) {
      console.warn("Delivery check failed", err?.response?.data || err.message || err);
      // Graceful fallback message if endpoint not implemented
      setDeliveryInfo({ deliverable: false, message: "Delivery info unavailable" });
    } finally {
      setCheckingDelivery(false);
    }
  };

  const fetchProductReviews = async () => {
    try {
      const res = await axios.get(
        `https://ecommerce-fashion-app-som7.vercel.app/api/reviews?productId=${id}&limit=50`
      );
      const data = res.data && res.data.data ? res.data.data : [];
      setProductReviews(data);
    } catch (err) {
      console.error("Failed to load product reviews", err);
    }
  };

  const checkPurchase = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `https://ecommerce-fashion-app-som7.vercel.app/api/orders/has-purchased/${id}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      setHasPurchased(Boolean(res.data?.hasPurchased));
    } catch (err) {
      console.error("Purchase check failed", err);
      setHasPurchased(false);
    }
  };

  // Compute derived state with proper null checks
  const currentColor = product?.colors?.find(
    (color) => color.name === selectedColor
  );
  const selectedColorData = product?.colors?.find(
    (c) => c.name === selectedColor
  );
  const selectedSizeData =
    (selectedColorData as any)?.sizes?.find(
      (s: any) => s.size === selectedSize
    ) || product?.sizes?.find((s) => s.size === selectedSize);
  const currentImages = React.useMemo(() => {
    // Priority: Color-specific images > General product images > Fallback
    if (currentColor?.images?.length) {
      return currentColor.images.filter(
        (img) => img.url && img.url.trim() !== ""
      );
    }
    if (product?.images?.length) {
      return product.images.filter((img) => img.url && img.url.trim() !== "");
    }
    return [];
  }, [currentColor, product]);

  const currentPrice = product?.salePrice || product?.price || 0;
  const hasDiscount = Boolean(
    product?.comparePrice && product.comparePrice > currentPrice
  );
  const discountPercentage =
    hasDiscount && product?.comparePrice
      ? Math.round(
          ((product.comparePrice - currentPrice) / product.comparePrice) * 100
        )
      : 0;

  // Debug logging
  console.log("Product:", product);
  console.log("Selected Color:", selectedColor);
  console.log("Current Color Object:", currentColor);
  console.log("Current Images:", currentImages);
  console.log("Product Images:", product?.images);
  console.log("Color Images:", currentColor?.images);

  // Build a merged image list (color-specific first, then product-level images)
  // and ensure we always have an absolute URL or a placeholder
  const PLACEHOLDER_IMAGE = "/assets/img-placeholder-800x1000.png";

  const mergedImages = React.useMemo(() => {
    const productImages = (product?.images || []).filter(
      (img) => img && img.url && img.url.trim() !== ""
    );

    const combined = [...currentImages, ...productImages];

    // Remove duplicates by url
    const seen = new Set<string>();
    const uniq = combined.filter((img) => {
      const url = (img.url || "").trim();
      if (!url) return false;
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });

    return uniq.map((img) => ({
      url: img.url || PLACEHOLDER_IMAGE,
      alt: img.alt || product?.name || "Product Image",
    }));
  }, [currentImages, product]);

  const displayImages =
    mergedImages.length > 0
      ? mergedImages
      : [{ url: PLACEHOLDER_IMAGE, alt: product?.name || "Product Image" }];

  const handleAddToCart = () => {
    if (!product || !selectedSize || !hasAccess) {
      if (!hasAccess) {
        alert(
          `This product is only available for ${product?.minLoyaltyTier?.toUpperCase()} members and above`
        );
      }
      return;
    }

    const selectedColorData = product.colors?.find(
      (c) => c.name === selectedColor
    );
    const selectedSizeData =
      (selectedColorData as any)?.sizes?.find(
        (s: any) => s.size === selectedSize
      ) || product.sizes?.find((s) => s.size === selectedSize);

    if (selectedSizeData && selectedSizeData.stock < quantity) {
      alert(
        `Requested quantity not available. Only ${selectedSizeData.stock} left in stock for ${selectedColor} / ${selectedSize}`
      );
      return;
    }

    const cartItem = {
      id: product._id || product.id || "",
      name: product.name,
      size: selectedSize,
      color: selectedColor,
      quantity: quantity,
      price: selectedSizeData?.price || currentPrice,
      image:
        selectedColorData?.images?.[0]?.url || product.images?.[0]?.url || "",
    };

    addToCart(cartItem);
    setAddedToCart(true);

    // Reset the success message after 2 seconds
    setTimeout(() => setAddedToCart(false), 2000);
  };

  

  const SizeChartModal = () => {
    if (!showSizeChart) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">Size Guide</h3>
              <button
                onClick={() => setShowSizeChart(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Size Chart Image (replace the old table) */}
            <div className="mb-6">
              <div className="w-full flex items-center justify-center">
                {/*
                  Place your size chart image at `/assets/size-chart.png` (public folder)
                  or update the src below to the correct path where you store assets.
                */}
                <a
                  href={sizechart}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full max-w-4xl"
                >
                  <img
                    src={sizechart}
                    alt="Size chart"
                    className="w-full h-auto object-contain rounded-lg shadow-sm"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      // fallback to placeholder if not found
                      if (t.src.indexOf("img-placeholder-800x1000.png") === -1) {
                        t.src = "/assets/img-placeholder-800x1000.png";
                      }
                    }}
                  />
                </a>

              </div>
            </div>

            {/* Measurement Instructions */}
            
          </div>
        </div>
      </div>
    );
  };

  const nextImage = () => {
    setSelectedImageIndex((prev) =>
      prev === displayImages.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) =>
      prev === 0 ? displayImages.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fashion-cream/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fashion-accent-brown mx-auto mb-4"></div>
          <p className="text-fashion-charcoal">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fashion-cream/50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Product not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="bg-fashion-accent-brown text-white px-6 py-2 hover:bg-fashion-charcoal transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="product-detail-page min-h-screen pt-20"
      style={{ backgroundColor: "#FFF2E1" }}
    >
      <style>{`
        /* Page-level enforcement: only two colors allowed */
        /* Set page background only on the container so child elements can keep their own backgrounds (e.g. color swatches) */
        .product-detail-page {
          background-color: #FFF2E1 !important;
        }
        .product-detail-page, .product-detail-page * {
          color: #95522C !important;
          border-color: #95522C !important;
          box-shadow: none !important;
        }

        /* Keep images visually correct */
        .product-detail-page img {
          background-color: transparent !important;
        }

        /* Ensure SVG icons use the primary color */
        .product-detail-page svg, .product-detail-page svg * {
          color: #95522C !important;
          fill: #FFF2E1 !important;
          stroke: #95522C !important;
        }

        /* Buttons: background -> primary, text -> bg color for contrast, but keep only two colors */
        .product-detail-page button, .product-detail-page .btn-primary {
          color: #95522C !important;
          border-color: #95522C !important;
        }

        /* Links */
        .product-detail-page a {
          color: #95522C !important;
        }

        /* Make inputs readable */
        .product-detail-page input, .product-detail-page textarea, .product-detail-page select {
          background-color: #FFF2E1 !important;
          color: #95522C !important;
          border-color: #95522C !important;
        }
      `}</style>
      {/* Size Chart Modal */}
      <SizeChartModal />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-fashion-charcoal/70 mb-6">
          <button
            onClick={() => navigate("/")}
            className="hover:text-fashion-accent-brown"
          >
            <span className="text-xl">
              Home
            </span>
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/products")}
            className="hover:text-fashion-accent-brown"
          >
            <span className="text-xl">Products</span>
          </button>
          <span>/</span>
          <span className="text-fashion-charcoal text-xl">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[4/5] bg-white shadow-soft overflow-hidden group">
              <img
                src={displayImages[selectedImageIndex]?.url || ""}
                alt={displayImages[selectedImageIndex]?.alt || product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  if (t.src !== "/assets/img-placeholder-800x1000.png") {
                    t.src = "/assets/img-placeholder-800x1000.png";
                  }
                }}
              />

              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm text-fashion-charcoal hover:bg-white transition-all duration-300 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm text-fashion-charcoal hover:bg-white transition-all duration-300 flex items-center justify-center rounded-full shadow-lg opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm text-fashion-charcoal hover:bg-white transition-all duration-300 flex items-center justify-center rounded-full shadow-lg"
              >
                <Heart
                  className={`w-6 h-6 ${
                    isWishlisted ? "fill-red-500 text-red-500" : ""
                  }`}
                />
              </button>
              {displayImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {displayImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        selectedImageIndex === index
                          ? "bg-white scale-125"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {displayImages.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {displayImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-24 border-2 transition-all duration-300 rounded-lg overflow-hidden ${
                      selectedImageIndex === index
                        ? "border-fashion-accent-brown shadow-lg scale-105"
                        : "border-transparent hover:border-fashion-charcoal/20"
                    }`}
                  >
                    <img
                      src={image.url || "/assets/img-placeholder-120x160.png"}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (
                          target.src !== "/assets/img-placeholder-120x160.png"
                        ) {
                          target.src = "/assets/img-placeholder-120x160.png";
                        }
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand & Name */}
            <div>
              <h1 className="text-2xl md:text-3xl font-light text-fashion-charcoal leading-tight">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            {product.ratings && product.ratings.count > 0 && (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.ratings?.average || 0)
                          ? "fill-fashion-accent-brown text-fashion-accent-brown"
                          : "text-fashion-charcoal/20"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-fashion-charcoal/70">
                  {product.ratings.average.toFixed(1)} ({product.ratings.count}{" "}
                  reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-medium text-fashion-charcoal poppins-numeric">
                ₹{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && product.comparePrice && (
                <>
                  <span className="text-lg text-fashion-charcoal/50 line-through poppins-numeric">
                    ₹{product.comparePrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-red-600 font-medium">
                    ({discountPercentage}% OFF)
                  </span>
                </>
              )}
              
            </div>
            {/* Compact rating summary next to price */}
              {product.ratings && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${
                          i < Math.round(product.ratings?.average || 0)
                            ? "fill-fashion-accent-brown text-fashion-accent-brown"
                            : "text-fashion-charcoal/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xl text-fashion-charcoal/70">
                    {product.ratings.average?.toFixed(1) || "0.0"} (
                    {product.ratings.count || 0})
                  </span>
                </div>
              )}

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-fashion-charcoal/80 leading-relaxed text-2xl">
                {product.shortDescription}
              </p>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-fashion-charcoal text-xl">
                    Color: <span className="font-normal">{selectedColor}</span>
                  </span>
                </div>
                <div className="flex space-x-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        setSelectedColor(color.name);
                        setSelectedImageIndex(0);
                      }}
                      className={`w-8 h-8 border-2 transition-all duration-300 ${
                        selectedColor === color.name
                          ? "border-fashion-accent-brown scale-110"
                          : "border-fashion-charcoal/20 hover:border-fashion-charcoal/40"
                      }`}
                      style={{ backgroundColor: color.hexCode }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {((currentColor &&
              currentColor.sizes &&
              currentColor.sizes.length > 0) ||
              (product.sizes && product.sizes.length > 0)) && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-fashion-charcoal text-xl">
                    Size:{" "}
                    {selectedSize && (
                      <span className="font-normal">{selectedSize}</span>
                    )}
                    {!selectedSize && (
                      <span className="text-fashion-accent-brown text-xl font-normal">
                        {" "}
                        - Please select a size
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-sm text-fashion-accent-brown hover:underline flex items-center space-x-1"
                  >
                    <Ruler className="w-7 h-7" />
                    <span className="text-xl">Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {(currentColor?.sizes || product.sizes).map((size) => (
                    <button
                      key={size.size}
                      onClick={() => size.stock > 0 && setSelectedSize(size.size)}
                      aria-disabled={size.stock === 0}
                      className={`py-3 text-xl font-medium border transition-all duration-300 relative group ${
                        selectedSize === size.size
                          ? "border-fashion-accent-brown bg-[#E4A95D] text-white shadow-md scale-105"
                          : size.stock > 0
                          ? "border-fashion-charcoal/20 hover:border-fashion-accent-brown hover:shadow-sm text-[#E4A95D]"
                          : "border-fashion-charcoal/10 text-[#E4A95D] cursor-not-allowed"
                      }`}
                    >
                      {/* Size label (fades out on hover when out of stock) */}
                      <span className={`relative z-10 transition-opacity ${
                        size.stock === 0 ? 'group-hover:opacity-0' : ''
                      }`}>{size.size}</span>

                      {/* Replace label with 'Out of Stock' on hover for OOS sizes */}
                      {size.stock === 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-[#E4A95D] text-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          Out of Stock
                        </span>
                      )}

                      {size.stock <= 5 && size.stock > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#C17237] rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-2xl text-fashion-charcoal/70 rounded-lg">
                   Please select your size to continue
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <span className="font-medium text-fashion-charcoal text-xl">
                Quantity
              </span>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-fashion-charcoal/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 hover:bg-fashion-cream transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-3 border-x border-fashion-charcoal/20 min-w-[60px] text-center poppins-numeric">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 hover:bg-fashion-cream transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-4">
              {/* Delivery check widget */}
              <div className="flex items-center space-x-3">
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter pincode"
                  className="border px-3 py-2 rounded w-40 text-xl"
                />
                <button
                  onClick={checkDelivery}
                  disabled={checkingDelivery}
                  className="px-4 py-2 bg-[#E4A95D] text-white rounded text-xl"
                >
                  {checkingDelivery ? "Checking..." : "Check Delivery"}
                </button>
                {deliveryInfo && (
                  <div className="text-xl text-fashion-charcoal/80">
                    {deliveryInfo.deliverable ? (
                      <span className="text-green-600">
                        Deliverable{deliveryInfo.estDays ? ` · ${deliveryInfo.estDays} day(s)` : ""}
                      </span>
                    ) : (
                      <span className="text-red-600">{deliveryInfo.message || "Not deliverable"}</span>
                    )}
                  </div>
                )}
              </div>
              {(() => {
                const isOutOfStock = selectedSizeData?.stock === 0;
                return (
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedSize || isOutOfStock}
                    className={`w-full py-4 text-lg font-medium tracking-wide transition-all duration-300 relative overflow-hidden border-2 ${
                      !selectedSize
                        ? "border-fashion-charcoal/10 text-fashion-charcoal/30 cursor-not-allowed bg-transparent"
                        : isOutOfStock
                        ? "border-red-600 text-red-600 cursor-not-allowed bg-transparent"
                        : "border-fashion-accent-brown text-fashion-accent-brown hover:bg-fashion-accent-brown hover:text-white transform hover:scale-[1.02]"
                    }`}
                  >
                    {!selectedSize ? (
                      <span className="flex items-center justify-center space-x-2 text-xl">
                        <span>SELECT SIZE TO ADD TO BAG</span>
                      </span>
                    ) : isOutOfStock ? (
                      <span className="flex items-center justify-center space-x-2 text-xl">
                        <span>OUT OF STOCK</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center space-x-2 text-xl">
                        <span>ADD TO BAG</span>
                        <span className="text-xl opacity-80 poppins-numeric">
                          ₹{currentPrice.toLocaleString()}
                        </span>
                      </span>
                    )}
                  </button>
                );
              })()}

              {addedToCart && (
                <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 py-3 px-4 rounded-lg border border-green-200 animate-pulse">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    Successfully added to bag!
                  </span>
                </div>
              )}

              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-full py-4 border-2 font-medium tracking-wide transition-all duration-300 text-xl ${
                  isWishlisted
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-fashion-accent-brown text-fashion-accent-brown hover:bg-fashion-accent-brown hover:text-white"
                }`}
              >
                {isWishlisted ? "♥ ADDED TO WISHLIST" : "♡ ADD TO WISHLIST"}
              </button>
            </div>

            {/* Features */}
            {/* <div className="grid grid-cols-3 gap-4 py-6 border-t border-fashion-charcoal/10">
              <div className="text-center">
                <Truck className="w-10 h-10 text-fashion-accent-brown mx-auto mb-2" />
                <p className="text-xl text-fashion-charcoal/70">
                  Free Shipping
                </p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-10 h-10 text-fashion-accent-brown mx-auto mb-2" />
                <p className="text-xl text-fashion-charcoal/70">Easy Returns</p>
              </div>
              <div className="text-center">
                <ShieldCheck className="w-10 h-10 text-fashion-accent-brown mx-auto mb-2" />
                <p className="text-xl text-fashion-charcoal/70">
                  Secure Payment
                </p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Sequential product sections: Description -> Key Features -> Care -> Reviews */}
        <div className="mt-16 space-y-10">
          {/* Description */}
          <section>
            <span className="text-5xl font-semibold mb-4">Description</span>
            <div className="prose prose-fashion max-w-none mt-10">
              <p className="text-fashion-charcoal/80 leading-relaxed text-2xl">
                {product.description || "No description available."}
              </p>
            </div>
          </section>

          {/* Key Features */}
          {product.keyFeatures && product.keyFeatures.length > 0 && (
            <section>
              <span className="text-5xl font-semibold mb-4">Key Features</span>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-3 mt-10">
                {product.keyFeatures.map((kf, i) => (
                  <div key={i} className="  rounded shadow-sm">
                    <p className="text-2xl text-fashion-charcoal">• {kf}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Care Instructions */}
          <section>
            <span className="text-5xl font-semibold mb-4">
              Care Instructions
            </span>
            <div className="prose prose-fashion max-w-none mt-10">
              <p className="text-fashion-charcoal/80 leading-relaxed text-2xl">
                {product.careInstructions || "Care instructions not available."}
              </p>
            </div>
          </section>

          {/* Reviews */}
          <section>
            <span className="text-5xl font-semibold mb-4">Reviews</span>
            <div className="py-6">
              {productReviews.length === 0 ? (
                <p className="text-fashion-charcoal/60 text-center text-2xl">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                <div className="space-y-4">
                  {productReviews.map((r: any) => (
                    <div key={r._id} className="p-4 bg-white rounded shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">
                            {r.userName || r.user?.name || r.name || "Customer"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">
                            {r.rating}
                          </span>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < r.rating
                                  ? "fill-fashion-accent-brown text-fashion-accent-brown"
                                  : "text-fashion-charcoal/20"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{r.message}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8">
                {!user ? (
                  <p className="text-center text-sm">
                    Please{" "}
                    <a
                      href="/login"
                      className="text-fashion-accent-brown underline"
                    >
                      log in
                    </a>{" "}
                    to leave a review.
                  </p>
                ) : !hasPurchased ? (
                  <p className="text-center text-sm">
                    Only customers who purchased this product can leave a
                    review.
                  </p>
                ) : (
                  <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold mb-3">
                      Write a review
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <label className="text-sm">Your rating:</label>
                        <select
                          value={reviewRating}
                          onChange={(e) =>
                            setReviewRating(Number(e.target.value))
                          }
                          className="border px-2 py-1 rounded"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n} star{n > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        value={reviewMessage}
                        onChange={(e) => setReviewMessage(e.target.value)}
                        className="w-full border px-3 py-2 rounded h-28"
                        placeholder="Share your experience..."
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={async () => {
                            if (!reviewMessage)
                              return alert("Please add a message");
                            setSubmittingReview(true);
                            try {
                              const token = localStorage.getItem("token");
                              await axios.post(
                                "https://ecommerce-fashion-app-som7.vercel.app/api/reviews",
                                {
                                  productId: id,
                                  rating: reviewRating,
                                  message: reviewMessage,
                                },
                                {
                                  headers: token
                                    ? { Authorization: `Bearer ${token}` }
                                    : {},
                                }
                              );
                              setReviewMessage("");
                              setReviewRating(5);
                              await fetchProductReviews();
                            } catch (err: any) {
                              console.error("Failed to submit review", err);
                              const msg =
                                err?.response?.data?.message ||
                                "Failed to submit review";
                              alert(msg);
                            } finally {
                              setSubmittingReview(false);
                            }
                          }}
                          disabled={submittingReview}
                          className="px-4 py-2 bg-fashion-accent-brown text-white rounded"
                        >
                          {submittingReview ? "Submitting..." : "Submit review"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Related / recommended products */}
        <div className="mt-12">
          <span className="text-6xl font-semibold mb-6">You might also like</span>
          {otherProducts.length === 0 ? (
            <p className="">No recommendations available.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {otherProducts.map((p: any) => (
                <div key={p._id} className="">
                  <ProductCard product={p} hidePromoBadge={true} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
