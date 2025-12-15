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
  images?: { url: string; alt?: string }[];
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

export interface CreateBlogData {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: {
    url: string;
    alt: string;
  };
  images?: { url: string; alt?: string }[];
  tags: string[];
  category: string;
  status: 'draft' | 'published' | 'archived';
  readTime: number;
  isFeatured: boolean;
}

export type UpdateBlogData = Partial<CreateBlogData>;

export interface BlogListResponse {
  blogs: Blog[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface BlogFilters {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend.flauntbynishi.com/api';

export const blogService = {
  // Get all blogs with filters (admin only)
  async getBlogs(filters: BlogFilters = {}, token: string): Promise<BlogListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    
    const response = await fetch(`${API_BASE_URL}/blogs?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch blogs');
    }
    
    return response.json();
  },

  // Get single blog by ID (admin only)
  async getBlogById(id: string, token: string): Promise<Blog> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Blog not found');
    }
    
    return response.json();
  },

  // Create new blog (admin only)
  async createBlog(blogData: CreateBlogData, token: string): Promise<Blog> {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(blogData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create blog');
    }
    
    return response.json();
  },

  // Update blog (admin only)
  async updateBlog(id: string, blogData: UpdateBlogData, token: string): Promise<Blog> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(blogData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update blog');
    }
    
    return response.json();
  },

  // Delete blog (admin only)
  async deleteBlog(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete blog');
    }
    
    return response.json();
  },

  // Update blog status (admin only)
  async updateBlogStatus(id: string, status: 'draft' | 'published' | 'archived', token: string): Promise<Blog> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update blog status');
    }
    
    return response.json();
  },

  // Toggle featured status (admin only)
  async toggleFeatured(id: string, token: string): Promise<Blog> {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}/featured`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to toggle featured status');
    }
    
    return response.json();
  }
};
