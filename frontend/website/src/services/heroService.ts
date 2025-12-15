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

class HeroService {
  private baseURL = 'https://backend.flauntbynishi.com/api/heroes';

  async getActiveHeroes(): Promise<Hero[]> {
    try {
      const response = await fetch(this.baseURL);

      if (!response.ok) {
        throw new Error('Failed to fetch heroes');
      }

      const { success, data } = await response.json();
      
      if (!success || !Array.isArray(data)) {
        throw new Error('Invalid response format from server');
      }

      const heroes = data.map((hero: any) => {
        if (!hero || typeof hero !== 'object') {
          throw new Error('Invalid hero data in response');
        }

        // Ensure required fields exist and provide defaults
        return {
          _id: hero._id || '',
          title: hero.title || '',
          subtitle: hero.subtitle || '',
          description: hero.description || '',
          image: {
            desktop: {
              url: hero.image?.desktop?.url || '',
              alt: hero.image?.desktop?.alt || 'Desktop hero image'
            },
            mobile: {
              url: hero.image?.mobile?.url || '',
              alt: hero.image?.mobile?.alt || 'Mobile hero image'
            }
          },
          ctaButton: {
            text: hero.ctaButton?.text || 'Shop Now',
            link: hero.ctaButton?.link || '#',
            enabled: hero.ctaButton?.enabled ?? false
          },
          backgroundColor: hero.backgroundColor || 'rgba(0, 0, 0, 0.4)',
          textColor: hero.textColor || '#ffffff',
          animationDuration: hero.animationDuration || 4000,
          order: hero.order || 0,
          isActive: hero.isActive ?? true,
          createdAt: hero.createdAt || new Date().toISOString(),
          updatedAt: hero.updatedAt || new Date().toISOString()
        };
      });

      // Filter active heroes and sort by order
      return heroes
        .filter((hero: Hero) => hero.isActive && (hero.image.desktop.url || hero.image.mobile.url))
        .sort((a: Hero, b: Hero) => a.order - b.order);
    } catch (error) {
      console.error('Error fetching heroes:', error);
      throw error instanceof Error ? error : new Error('Failed to fetch heroes');
    }
  }
}

export default new HeroService();
