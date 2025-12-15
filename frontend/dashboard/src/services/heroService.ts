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
  private baseURL = 'http://localhost:3500/api/heroes';

  async getAllHeroes(token: string): Promise<Hero[]> {
    try {
      const response = await fetch(`${this.baseURL}/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const contentType = response.headers.get('content-type') || '';

      // Try to parse JSON, but provide a helpful error when the body is HTML
      if (!response.ok) {
        let bodyText = '';
        try {
          bodyText = await response.text();
        } catch (e) {
          /* ignore */
        }
        throw new Error(`Failed to fetch heroes (status ${response.status}). ${bodyText.slice(0, 200)}`);
      }

      // If response isn't JSON, surface a clearer error instead of letting JSON.parse throw
      if (!contentType.includes('application/json')) {
        const txt = await response.text();
        throw new Error(`Expected JSON but received ${contentType || 'unknown'}: ${txt.slice(0, 200)}`);
      }

      const data = await response.json();
      return data.data?.heroes || [];
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
        const txt = await response.text().catch(() => '');
        throw new Error(`Failed to fetch hero (status ${response.status}). ${txt.slice(0,200)}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const txt = await response.text().catch(() => '');
        throw new Error(`Expected JSON but got ${contentType}: ${txt.slice(0,200)}`);
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
        const txt = await response.text().catch(() => '');
        let errMsg = txt;
        try {
          const parsed = JSON.parse(txt);
          errMsg = parsed.message || JSON.stringify(parsed);
        } catch (e) {
          // keep txt
        }
        throw new Error(errMsg || `Failed to create hero (status ${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const txt = await response.text().catch(() => '');
        throw new Error(`Expected JSON but got ${contentType}: ${txt.slice(0,200)}`);
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
        const txt = await response.text().catch(() => '');
        let errMsg = txt;
        try {
          const parsed = JSON.parse(txt);
          errMsg = parsed.message || JSON.stringify(parsed);
        } catch (e) {}
        throw new Error(errMsg || `Failed to update hero (status ${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const txt = await response.text().catch(() => '');
        throw new Error(`Expected JSON but got ${contentType}: ${txt.slice(0,200)}`);
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
        const txt = await response.text().catch(() => '');
        let errMsg = txt;
        try {
          const parsed = JSON.parse(txt);
          errMsg = parsed.message || JSON.stringify(parsed);
        } catch (e) {}
        throw new Error(errMsg || `Failed to delete hero (status ${response.status})`);
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
        const txt = await response.text().catch(() => '');
        let errMsg = txt;
        try {
          const parsed = JSON.parse(txt);
          errMsg = parsed.message || JSON.stringify(parsed);
        } catch (e) {}
        throw new Error(errMsg || `Failed to toggle hero status (status ${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const txt = await response.text().catch(() => '');
        throw new Error(`Expected JSON but got ${contentType}: ${txt.slice(0,200)}`);
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
        const txt = await response.text().catch(() => '');
        let errMsg = txt;
        try {
          const parsed = JSON.parse(txt);
          errMsg = parsed.message || JSON.stringify(parsed);
        } catch (e) {}
        throw new Error(errMsg || `Failed to reorder heroes (status ${response.status})`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const txt = await response.text().catch(() => '');
        throw new Error(`Expected JSON but got ${contentType}: ${txt.slice(0,200)}`);
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
