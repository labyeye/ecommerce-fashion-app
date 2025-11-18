export interface Hero {
  _id: string;
  title: string;
  subtitle: string;
  description?: string;
  image: {
    desktop: {
      url: string;
      alt: string;
    };
    mobile: {
      url: string;
      alt: string;
    };
    // Legacy support for old data structure
    url?: string;
    alt?: string;
  };
  ctaButton: {
    text: string;
    link: string;
    enabled: boolean;
  };
  backgroundColor?: string;
  textColor?: string;
  animationDuration?: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHeroData {
  title: string;
  subtitle: string;
  description?: string;
  image: {
    desktop: {
      url: string;
      alt: string;
    };
    mobile: {
      url: string;
      alt: string;
    };
    // Legacy support for old data structure
    url?: string;
    alt?: string;
  };
  ctaButton: {
    text: string;
    link: string;
    enabled: boolean;
  };
  backgroundColor?: string;
  textColor?: string;
  animationDuration?: number;
  order: number;
  isActive?: boolean;
}

class HeroService {
  private baseURL = 'https://ecommerce-fashion-app-som7.vercel.app/api/heroes';

  async getAllHeroes(token: string): Promise<Hero[]> {
    try {
      const response = await fetch(`${this.baseURL}/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch heroes');
      }

      const data = await response.json();
      return data.data.heroes;
    } catch (error) {
      console.error('Error fetching heroes:', error);
      throw error;
    }
  }

  async getHero(id: string, token: string): Promise<Hero> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hero');
      }

      const data = await response.json();
      return data.data.hero;
    } catch (error) {
      console.error('Error fetching hero:', error);
      throw error;
    }
  }

  async createHero(heroData: CreateHeroData, token: string): Promise<Hero> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(heroData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create hero');
      }

      const data = await response.json();
      return data.data.hero;
    } catch (error) {
      console.error('Error creating hero:', error);
      throw error;
    }
  }

  async updateHero(id: string, heroData: Partial<CreateHeroData>, token: string): Promise<Hero> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(heroData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update hero');
      }

      const data = await response.json();
      return data.data.hero;
    } catch (error) {
      console.error('Error updating hero:', error);
      throw error;
    }
  }

  async deleteHero(id: string, token: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete hero');
      }
    } catch (error) {
      console.error('Error deleting hero:', error);
      throw error;
    }
  }

  async toggleHeroStatus(id: string, token: string): Promise<Hero> {
    try {
      const response = await fetch(`${this.baseURL}/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to toggle hero status');
      }

      const data = await response.json();
      return data.data.hero;
    } catch (error) {
      console.error('Error toggling hero status:', error);
      throw error;
    }
  }

  async reorderHeroes(heroIds: string[], token: string): Promise<Hero[]> {
    try {
      const response = await fetch(`${this.baseURL}/reorder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ heroIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reorder heroes');
      }

      const data = await response.json();
      return data.data.heroes;
    } catch (error) {
      console.error('Error reordering heroes:', error);
      throw error;
    }
  }
}

export default new HeroService();
