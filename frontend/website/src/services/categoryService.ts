const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3500/api';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: {
    url: string;
    alt: string;
  };
  parentCategory?: Category;
  isActive: boolean;
  sortOrder: number;
  showInNavigation: boolean;
  showInDropdown: boolean;
  color: string;
  icon?: string;
  subcategories?: Category[];
}

export const getNavigationCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/navigation`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch categories');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching navigation categories:', error);
    throw error;
  }
};

export const getHomepageCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/categories/homepage`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch homepage categories');
    }
    
    return data.data;
  } catch (error) {
    console.error('Error fetching homepage categories:', error);
    throw error;
  }
};
