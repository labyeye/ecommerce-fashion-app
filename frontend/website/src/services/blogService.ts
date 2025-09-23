export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: {
    url: string;
    alt: string;
  };
  author: {
    name: string;
    email: string;
  };
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  readTime: number;
  views: number;
  isFeatured: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  blogs: Blog[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  featured?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-fashion-app-som7.vercel.app/api';

export const blogService = {
  // Get all published blogs with filters
  async getBlogs(filters: BlogFilters = {}): Promise<BlogListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.featured) params.append('featured', 'true');
    
    const response = await fetch(`${API_BASE_URL}/blogs/public?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }
    
    return response.json();
  },

  // Get single blog by slug
  async getBlogBySlug(slug: string): Promise<Blog> {
    const response = await fetch(`${API_BASE_URL}/blogs/public/${slug}`);
    
    if (!response.ok) {
      throw new Error('Blog not found');
    }
    
    return response.json();
  },

  // Get blog categories
  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/blogs/categories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    
    return response.json();
  },

  // Get featured blogs
  async getFeaturedBlogs(): Promise<Blog[]> {
    const response = await fetch(`${API_BASE_URL}/blogs/featured`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch featured blogs');
    }
    
    return response.json();
  },

  // Search blogs
  async searchBlogs(query: string, page: number = 1, limit: number = 10): Promise<BlogListResponse> {
    return this.getBlogs({
      search: query,
      page,
      limit
    });
  },

  // Get blogs by category
  async getBlogsByCategory(category: string, page: number = 1, limit: number = 10): Promise<BlogListResponse> {
    return this.getBlogs({
      category,
      page,
      limit
    });
  }
};
