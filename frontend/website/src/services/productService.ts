import axios from 'axios';

const API_URL = 'https://ecommerce-fashion-app-som7.vercel.app/api/products';

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  salePrice?: number;
  sku?: string;
  category?: string;
  brand?: string;
  minLoyaltyTier?: 'bronze' | 'silver' | 'gold';
  sizes: Array<{
    size: string;
    stock: number;
    price: number;
  }>;
  colors: Array<{
    name: string;
    hexCode: string;
    images?: Array<{
      url: string;
      alt?: string;
    }>;
    stock: number;
  }>;
  images: Array<{
    url: string;
    alt?: string;
    isPrimary?: boolean;
  }>;
  material?: string;
  careInstructions?: string;
  fit?: 'slim' | 'regular' | 'loose' | 'oversized';
  tags?: string[];
  status?: 'active' | 'inactive' | 'draft';
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  ratings?: {
    average: number;
    count: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await axios.get(API_URL, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('API Response:', response.data);
    
    if (!response.data?.data) {
      throw new Error('Invalid API response structure');
    }

    // Handle both array and object responses
    const products = Array.isArray(response.data.data) ? response.data.data : response.data.data.products || [];
    
    return products.map((product: any) => ({
      _id: product._id || '',
      id: product._id || '', // Map _id to id for compatibility
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: Number(product.price) || 0,
      comparePrice: Number(product.comparePrice) || 0,
      salePrice: Number(product.salePrice) || 0,
      sku: product.sku || '',
      category: product.category || '',
      brand: product.brand || '',
      minLoyaltyTier: product.minLoyaltyTier || 'bronze',
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      colors: Array.isArray(product.colors) ? product.colors.map((color: any) => ({
        ...color,
        images: Array.isArray(color.images) ? color.images : []
      })) : [],
      images: Array.isArray(product.images) ? product.images : [],
      material: product.material || '',
      careInstructions: product.careInstructions || '',
      fit: product.fit || 'regular',
      tags: Array.isArray(product.tags) ? product.tags : [],
      status: product.status || 'active',
      isFeatured: Boolean(product.isFeatured),
      isNewArrival: Boolean(product.isNewArrival),
      isBestSeller: Boolean(product.isBestSeller),
      ratings: product.ratings || { average: 0, count: 0 },
      createdAt: product.createdAt || new Date().toISOString(),
      updatedAt: product.updatedAt || new Date().toISOString()
    }));
  } catch (error: any) {
    console.error('Error fetching products:', error);
    
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to server. Please make sure the backend is running.');
    }
    
    if (error.response?.status === 404) {
      throw new Error('Products endpoint not found. Please check the API configuration.');
    }
    
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to fetch products');
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    console.log('Product API Response:', response.data); // Debug log
    
    // Check different response structures
    const productData = response.data.data?.product || response.data.data || null;
    
    if (!productData) {
      throw new Error('Product not found in response');
    }
    
    // Ensure all required arrays are initialized with proper type handling
    return {
      _id: productData._id || '',
      id: productData._id || '',
      name: productData.name || '',
      description: productData.description || '',
      shortDescription: productData.shortDescription || '',
      price: Number(productData.price) || 0,
      comparePrice: Number(productData.comparePrice) || 0,
      salePrice: Number(productData.salePrice) || 0,
      sku: productData.sku || '',
      category: productData.category || '',
      brand: productData.brand || '',
      sizes: Array.isArray(productData.sizes) ? productData.sizes.map((size: any) => ({
        size: size.size || '',
        stock: Number(size.stock) || 0,
        price: Number(size.price) || 0
      })) : [],
      colors: Array.isArray(productData.colors) ? productData.colors.map((color: any) => ({
        name: color.name || '',
        hexCode: color.hexCode || '#000000',
        stock: Number(color.stock) || 0,
        images: Array.isArray(color.images) ? color.images.map((img: any) => ({
          url: img.url || '',
          alt: img.alt || ''
        })) : []
      })) : [],
      images: Array.isArray(productData.images) ? productData.images : [],
      material: productData.material || '',
      careInstructions: productData.careInstructions || '',
      fit: productData.fit || 'regular',
      tags: Array.isArray(productData.tags) ? productData.tags : [],
      status: productData.status || 'active',
      isFeatured: Boolean(productData.isFeatured),
      isNewArrival: Boolean(productData.isNewArrival),
      isBestSeller: Boolean(productData.isBestSeller),
      ratings: productData.ratings || { average: 0, count: 0 },
      createdAt: productData.createdAt || new Date().toISOString(),
      updatedAt: productData.updatedAt || new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Error fetching product:', error);
    throw new Error(error.message || 'Failed to fetch product');
  }
};
