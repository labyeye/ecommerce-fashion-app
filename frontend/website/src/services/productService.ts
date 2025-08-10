import axios from 'axios';

const API_URL = 'https://ecommerce-fashion-app.onrender.com/api/products';

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
      _id: product._id,
      id: product._id, // Map _id to id for compatibility
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      comparePrice: product.comparePrice,
      salePrice: product.salePrice,
      sku: product.sku,
      category: product.category,
      brand: product.brand,
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || [],
      material: product.material,
      careInstructions: product.careInstructions,
      fit: product.fit,
      tags: product.tags,
      status: product.status,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      ratings: product.ratings,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
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
    
    // Backend returns { success: true, data: { product: {...}, relatedProducts: [...] } }
    const productData = response.data.data.product;
    
    if (!productData) {
      throw new Error('Product not found in response');
    }
    
    return {
      _id: productData._id,
      id: productData._id,
      name: productData.name,
      description: productData.description,
      shortDescription: productData.shortDescription,
      price: productData.price,
      comparePrice: productData.comparePrice,
      salePrice: productData.salePrice,
      sku: productData.sku,
      category: productData.category,
      brand: productData.brand,
      sizes: productData.sizes || [],
      colors: productData.colors || [],
      images: productData.images || [],
      material: productData.material,
      careInstructions: productData.careInstructions,
      fit: productData.fit,
      tags: productData.tags,
      status: productData.status,
      isFeatured: productData.isFeatured,
      isNewArrival: productData.isNewArrival,
      isBestSeller: productData.isBestSeller,
      ratings: productData.ratings,
      createdAt: productData.createdAt,
      updatedAt: productData.updatedAt
    };
  } catch (error: any) {
    console.error('Error fetching product:', error);
    throw new Error(error.message || 'Failed to fetch product');
  }
};
