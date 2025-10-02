import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Ruler,
  X,
} from "lucide-react";
import { useCartContext } from "../../context/CartContext";
import { getProductById, Product } from "../../services/productService";
import { useLoyaltyTier } from "../../hooks/useLoyaltyTier";
import { canAccessProduct } from "../../hooks/useProductAccess";

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
  const [activeTab, setActiveTab] = useState<
    "description" | "care" | "reviews"
  >("description");
  const [addedToCart, setAddedToCart] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

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
  }, [id]);

  // Compute derived state with proper null checks
  const currentColor = product?.colors?.find(
    (color) => color.name === selectedColor
  );
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
      const url = (img.url || '').trim();
      if (!url) return false;
      if (seen.has(url)) return false;
      seen.add(url);
      return true;
    });

    return uniq.map((img) => ({
      url: img.url || PLACEHOLDER_IMAGE,
      alt: img.alt || product?.name || 'Product Image',
    }));
  }, [currentImages, product]);

  const displayImages = mergedImages.length > 0 ? mergedImages : [{ url: PLACEHOLDER_IMAGE, alt: product?.name || 'Product Image' }];

  const handleAddToCart = () => {
    if (!product || !selectedSize || !hasAccess) {
      if (!hasAccess) {
        alert(
          `This product is only available for ${product?.minLoyaltyTier?.toUpperCase()} members and above`
        );
      }
      return;
    }

    const selectedSizeData = product.sizes?.find(
      (s) => s.size === selectedSize
    );
    const selectedColorData = product.colors?.find(
      (c) => c.name === selectedColor
    );

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

  // Size Chart Data
  const sizeChartData = [
    { size: "XS", shoulder: "14", chest: "32", waist: "24-25", hip: "35-36" },
    { size: "S", shoulder: "14.5", chest: "34", waist: "26-27", hip: "37-38" },
    { size: "M", shoulder: "15", chest: "36", waist: "28-29", hip: "39-40" },
    { size: "L", shoulder: "15.5", chest: "38", waist: "30-31", hip: "41-42" },
    { size: "XL", shoulder: "16", chest: "40", waist: "32-33", hip: "43-44" },
    {
      size: "XXL",
      shoulder: "16.5",
      chest: "42",
      waist: "34-35",
      hip: "45-46",
    },
  ];

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

            {/* Size Chart Table */}
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-black text-white">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      SIZE
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      SHOULDER
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      CHEST
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      WAIST
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">
                      HIP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sizeChartData.map((row, index) => (
                    <tr
                      key={row.size}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="border border-gray-300 px-4 py-3 font-semibold text-black">
                        {row.size}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        {row.shoulder}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        {row.chest}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        {row.waist}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-gray-700">
                        {row.hip}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Measurement Instructions */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-black">
                How to Measure
              </h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-black min-w-[80px]">
                      Chest:
                    </span>
                    <span>
                      Measure around the fullest part of your chest, keeping the
                      tape parallel to the floor.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-black min-w-[80px]">
                      Waist:
                    </span>
                    <span>
                      Measure around the narrowest part of your waist, typically
                      just above your hip bones.
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-black min-w-[80px]">
                      Hip:
                    </span>
                    <span>
                      Measure around the fullest part of your hips, typically
                      7-9 inches below your waist.
                    </span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-black min-w-[80px]">
                      Shoulder:
                    </span>
                    <span>
                      Measure from the edge of one shoulder to the edge of the
                      other shoulder across your back.
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong className="text-black">Note:</strong> All measurements
                  are in inches. For the best fit, we recommend measuring
                  yourself while wearing well-fitting undergarments. If you're
                  between sizes, we suggest sizing up for a more comfortable
                  fit.
                </p>
              </div>
            </div>
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
    <div className="min-h-screen bg-fashion-cream/50 pt-20">
      {/* Size Chart Modal */}
      <SizeChartModal />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-fashion-charcoal/70 mb-6">
          <button
            onClick={() => navigate("/")}
            className="hover:text-fashion-accent-brown"
          >
            Home
          </button>
          <span>/</span>
          <button
            onClick={() => navigate("/products")}
            className="hover:text-fashion-accent-brown"
          >
            Products
          </button>
          <span>/</span>
          <span className="text-fashion-charcoal">{product.name}</span>
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
                  if (t.src !== '/assets/img-placeholder-800x1000.png') {
                      t.src = '/assets/img-placeholder-800x1000.png';
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
                        if (target.src !== '/assets/img-placeholder-120x160.png') {
                          target.src = '/assets/img-placeholder-120x160.png';
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
              <p className="text-sm text-fashion-charcoal/70 font-medium tracking-wide mb-1">
                {product.brand}
              </p>
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
              <span className="text-2xl font-medium text-fashion-charcoal">
                ₹{currentPrice.toLocaleString()}
              </span>
              {hasDiscount && product.comparePrice && (
                <>
                  <span className="text-lg text-fashion-charcoal/50 line-through">
                    ₹{product.comparePrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-red-600 font-medium">
                    ({discountPercentage}% OFF)
                  </span>
                </>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-fashion-charcoal/80 leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-fashion-charcoal">
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
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-fashion-charcoal">
                    Size:{" "}
                    {selectedSize && (
                      <span className="font-normal">{selectedSize}</span>
                    )}
                    {!selectedSize && (
                      <span className="text-fashion-accent-brown text-sm font-normal">
                        {" "}
                        - Please select a size
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => setShowSizeChart(true)}
                    className="text-sm text-fashion-accent-brown hover:underline flex items-center space-x-1"
                  >
                    <Ruler className="w-4 h-4" />
                    <span>Size Guide</span>
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size.size}
                      onClick={() => setSelectedSize(size.size)}
                      disabled={size.stock === 0}
                      className={`py-3 text-sm font-medium border transition-all duration-300 relative ${
                        selectedSize === size.size
                          ? "border-fashion-accent-brown bg-fashion-accent-brown text-white shadow-md scale-105"
                          : size.stock > 0
                          ? "border-fashion-charcoal/20 hover:border-fashion-accent-brown hover:shadow-sm text-fashion-charcoal"
                          : "border-fashion-charcoal/10 text-fashion-charcoal/30 cursor-not-allowed line-through"
                      }`}
                    >
                      {size.size}
                      {size.stock <= 5 && size.stock > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="text-sm text-fashion-charcoal/70 bg-fashion-cream/50 p-3 rounded-lg">
                    👆 Please select your size to continue
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <span className="font-medium text-fashion-charcoal">
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
                  <span className="px-4 py-3 border-x border-fashion-charcoal/20 min-w-[60px] text-center">
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
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`w-full py-4 text-lg font-medium tracking-wide transition-all duration-300 relative overflow-hidden ${
                  selectedSize
                    ? "bg-fashion-accent-brown hover:bg-fashion-charcoal text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    : "bg-fashion-charcoal/20 text-fashion-charcoal/50 cursor-not-allowed"
                }`}
              >
                {!selectedSize ? (
                  <span className="flex items-center justify-center space-x-2">
                    <span>SELECT SIZE TO ADD TO BAG</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>ADD TO BAG</span>
                    <span className="text-sm opacity-80">
                      ₹{currentPrice.toLocaleString()}
                    </span>
                  </span>
                )}
              </button>

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
                className={`w-full py-4 border-2 font-medium tracking-wide transition-all duration-300 ${
                  isWishlisted
                    ? "border-red-500 bg-red-50 text-red-600"
                    : "border-fashion-accent-brown text-fashion-accent-brown hover:bg-fashion-accent-brown hover:text-white"
                }`}
              >
                {isWishlisted ? "♥ ADDED TO WISHLIST" : "♡ ADD TO WISHLIST"}
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-fashion-charcoal/10">
              <div className="text-center">
                <Truck className="w-6 h-6 text-fashion-accent-brown mx-auto mb-2" />
                <p className="text-xs text-fashion-charcoal/70">
                  Free Shipping
                </p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 text-fashion-accent-brown mx-auto mb-2" />
                <p className="text-xs text-fashion-charcoal/70">Easy Returns</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 text-fashion-accent-brown mx-auto mb-2" />
                <p className="text-xs text-fashion-charcoal/70">
                  Secure Payment
                </p>
              </div>
            </div>

            {/* Material & Fit */}
            <div className="space-y-2 text-sm">
              {product.material && (
                <p>
                  <span className="font-medium">Material:</span>{" "}
                  {product.material}
                </p>
              )}
              {product.fit && (
                <p>
                  <span className="font-medium">Fit:</span> {product.fit}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b border-fashion-charcoal/10">
            <nav className="flex space-x-8">
              {(["description", "care", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-sm font-medium tracking-wide transition-colors duration-300 relative ${
                    activeTab === tab
                      ? "text-fashion-accent-brown border-b-2 border-fashion-accent-brown"
                      : "text-fashion-charcoal/70 hover:text-fashion-accent-brown"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <div className="prose prose-fashion max-w-none">
                <p className="text-fashion-charcoal/80 leading-relaxed">
                  {product.description || "No description available."}
                </p>
              </div>
            )}

            {activeTab === "care" && (
              <div className="prose prose-fashion max-w-none">
                <p className="text-fashion-charcoal/80 leading-relaxed">
                  {product.careInstructions ||
                    "Care instructions not available."}
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="text-center py-12">
                <p className="text-fashion-charcoal/60">
                  No reviews yet. Be the first to review this product!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
