import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import heroService, { Hero, CreateHeroData } from '../services/heroService';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Move, 
  Image as ImageIcon,
  ExternalLink,
  Save,
  X,
  AlertCircle,
  Monitor,
  Smartphone
} from 'lucide-react';

interface HeroFormData extends Omit<CreateHeroData, 'order'> {
  order?: number;
}

const HeroManagement: React.FC = () => {
  const { token } = useAuth();
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingHero, setEditingHero] = useState<Hero | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);

  const [formData, setFormData] = useState<HeroFormData>({
    title: '',
    subtitle: '',
    description: '',
    image: {
      desktop: {
        url: '',
        alt: ''
      },
      mobile: {
        url: '',
        alt: ''
      }
    },
    ctaButton: {
      text: 'Shop Now',
      link: '/products',
      enabled: false
    },
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    textColor: '#ffffff',
    animationDuration: 4000,
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('HeroManagement: useEffect triggered, token:', !!token);
    fetchHeroes();
  }, [token]);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught in HeroManagement:', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        message: event.message,
        stack: event.error?.stack,
      });

      const details = [
        event.message,
        event.filename ? `at ${event.filename}:${event.lineno}:${event.colno}` : null,
        event.error?.stack ? `stack: ${event.error.stack.split('\n').slice(0,3).join(' | ')}` : null,
      ]
        .filter(Boolean)
        .join(' — ');

      setComponentError(details || 'An unexpected error occurred');
    };

    window.addEventListener('error', handleError);
    // capture unhandled promise rejections as well
    const handleRejection = (ev: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection in HeroManagement:', ev.reason);
      const reason = ev.reason;
      const msg = reason && reason.message ? reason.message : String(reason);
      setComponentError(`Unhandled Rejection: ${msg}`);
    };
    window.addEventListener('unhandledrejection', handleRejection as any);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Debug form and modal state
  useEffect(() => {
    console.log('HeroManagement: Form state changed - showForm:', showForm, 'editingHero:', editingHero);
    if (showForm) {
      console.log('HeroManagement: Modal is open, formData:', formData);
    }
  }, [showForm, editingHero, formData]);

  const fetchHeroes = async () => {
    if (!token) {
      console.log('HeroManagement: No token available');
      return;
    }
    
    try {
      console.log('HeroManagement: Fetching heroes...');
      setLoading(true);
      setError('');
      const heroData = await heroService.getAllHeroes(token);
      console.log('HeroManagement: Raw hero data received:', heroData);
      
      // Check data structure and log any issues
      if (heroData && Array.isArray(heroData)) {
        heroData.forEach((hero, index) => {
          console.log(`Hero ${index}:`, {
            id: hero._id,
            title: hero.title,
            image: hero.image,
            hasDesktopImage: !!hero.image?.desktop?.url,
            hasMobileImage: !!hero.image?.mobile?.url,
            hasLegacyImage: !!hero.image?.url
          });
          
          // Validate and fix data structure if needed
          if (hero.image && !hero.image.desktop && !hero.image.mobile && hero.image.url) {
            console.log(`Hero ${index} has legacy image structure, will need migration`);
          }
        });
      } else {
        console.log('Hero data is not an array:', heroData);
      }
      
      setHeroes(heroData || []);
    } catch (err: any) {
      console.error('Error fetching heroes:', err);
      // If response body contains unexpected HTML, include a snippet for debugging
      const msg = err?.message || String(err);
      setError(msg.includes('<') ? `Failed to fetch heroes: received HTML response. ${msg.slice(0,200)}` : msg || 'Failed to fetch heroes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSubmitting(true);
      setError('');
      setComponentError(null);

      const submitData: CreateHeroData = {
        ...formData,
        title: formData.title,
        subtitle: formData.subtitle,
        image: {
          desktop: {
            url: formData.image.desktop.url,
            alt: formData.image.desktop.alt || 'Desktop hero image'
          },
          mobile: {
            url: formData.image.mobile.url,
            alt: formData.image.mobile.alt || 'Mobile hero image'
          }
        },
        order: editingHero ? editingHero.order : (Math.max(...heroes.map(h => h.order), 0) + 1)
      };

      if (editingHero) {
        await heroService.updateHero(editingHero._id, submitData, token);
      } else {
        await heroService.createHero(submitData, token);
      }

      await fetchHeroes();
      resetForm();
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      setError(err.message || 'Failed to save hero');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (hero: Hero) => {
    setEditingHero(hero);
    setFormData({
      title: hero.title,
      subtitle: hero.subtitle,
      description: hero.description || '',
      image: hero.image,
      ctaButton: hero.ctaButton,
      backgroundColor: hero.backgroundColor || 'rgba(0, 0, 0, 0.4)',
      textColor: hero.textColor || '#ffffff',
      animationDuration: hero.animationDuration || 4000,
      isActive: hero.isActive,
      order: hero.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Are you sure you want to delete this hero slide?')) return;

    try {
      await heroService.deleteHero(id, token);
      await fetchHeroes();
    } catch (err: any) {
      setError(err.message || 'Failed to delete hero');
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!token) return;

    try {
      await heroService.toggleHeroStatus(id, token);
      await fetchHeroes();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle hero status');
    }
  };

  const resetForm = () => {
    setEditingHero(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      image: {
        desktop: {
          url: '',
          alt: ''
        },
        mobile: {
          url: '',
          alt: ''
        }
      },
      ctaButton: {
        text: 'Shop Now',
        link: '/products',
        enabled: false
      },
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      textColor: '#ffffff',
      animationDuration: 4000,
      isActive: true
    });
    setShowForm(false);
    setError('');
  };

  const handleInputChange = (field: string, value: any) => {
    try {
      if (field.includes('.')) {
        const [parent, child, subChild] = field.split('.');
        if (subChild) {
          // Handle nested fields like 'image.desktop.url'
          setFormData(prev => ({
            ...prev,
            [parent]: {
              ...(prev as any)[parent] || {},
              [child]: {
                ...(prev as any)[parent]?.[child] || {},
                [subChild]: value
              }
            }
          }));
        } else {
          // Handle fields like 'ctaButton.text'
          setFormData(prev => ({
            ...prev,
            [parent]: {
              ...(prev as any)[parent] || {},
              [child]: value
            }
          }));
        }
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    } catch (err) {
      console.error('Error in handleInputChange:', err);
      setComponentError(`Failed to update field ${field}: ${err}`);
    }
  };

  // Debug logging
  console.log('HeroManagement: Rendering with state:', { 
    loading, 
    error, 
    heroesCount: heroes.length, 
    hasToken: !!token 
  });

  // Component-level error boundary
  if (componentError) {
    console.log('HeroManagement: Component error detected:', componentError);
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <strong>Component Error:</strong> {componentError}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Error boundary for rendering
  if (renderError) {
    console.log('HeroManagement: Render error detected:', renderError);
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <strong>Rendering Error:</strong> {renderError}
          </div>
          <button 
            onClick={() => setRenderError(null)}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('HeroManagement: Loading state');
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Add error boundary for rendering
  if (error && !heroes.length) {
    console.log('HeroManagement: Error state with no heroes:', error);
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <strong>Error:</strong> {error}
          </div>
          <button 
            onClick={fetchHeroes}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  console.log('HeroManagement: Rendering main component, heroes count:', heroes.length, 'showForm:', showForm);

  return (
    <div className="p-6">
      
      <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-ds-900">Hero Slider Management</h1>
            <p className="text-ds-700 mt-1">Manage your website's hero slider images and content</p>
          </div>
          <button
            onClick={() => {
              console.log('Add Hero button clicked, setting showForm to true');
              setShowForm(true);
            }}
            className="px-4 py-2 bg-ds-200 text-ds-900 rounded-lg hover:bg-ds-300 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Hero Slide
          </button>
        </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {/* Hero Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="dash-card bg-ds-100 rounded-lg shadow-xl w-full max-w-4xl m-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingHero ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                </h2>
                <button
                  onClick={() => {
                    console.log('Close button clicked, setting showForm to false');
                    setShowForm(false);
                    setEditingHero(null);
                    resetForm();
                  }}
                  className="text-ds-500 hover:text-ds-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ds-700 mb-1">
                      Title 
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                      
                      placeholder="Enter hero title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ds-700 mb-1">
                      Subtitle 
                    </label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                      
                      placeholder="Enter hero subtitle"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ds-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                    placeholder="Enter hero description (optional)"
                  />
                </div>

                {/* Desktop Image Section */}
                <div className="dash-card border border-ds-200 rounded-lg p-4 bg-ds-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Monitor className="w-5 h-4 text-ds-700" />
                    <h3 className="text-lg font-medium text-ds-900">Desktop Image</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ds-700 mb-1">
                        Desktop Image URL *
                      </label>
                      <input
                        type="url"
                        value={formData.image.desktop.url}
                        onChange={(e) => handleInputChange('image.desktop.url', e.target.value)}
                        className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ds-700 mb-1">
                        Desktop Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={formData.image.desktop.alt}
                        onChange={(e) => handleInputChange('image.desktop.alt', e.target.value)}
                        className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                        placeholder="Desktop hero image"
                      />
                    </div>
                  </div>
                </div>

                {/* Mobile Image Section */}
                <div className="dash-card border border-ds-200 rounded-lg p-4 bg-ds-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="w-5 h-4 text-ds-700" />
                    <h3 className="text-lg font-medium text-ds-900">Mobile Image</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-ds-700 mb-1">
                        Mobile Image URL *
                      </label>
                      <input
                        type="url"
                        value={formData.image.mobile.url}
                        onChange={(e) => handleInputChange('image.mobile.url', e.target.value)}
                        className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ds-700 mb-1">
                        Mobile Image Alt Text
                      </label>
                      <input
                        type="text"
                        value={formData.image.mobile.alt}
                        onChange={(e) => handleInputChange('image.mobile.alt', e.target.value)}
                        className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                        placeholder="Mobile hero image"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ds-700 mb-1">
                      CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={formData.ctaButton.text}
                      onChange={(e) => handleInputChange('ctaButton.text', e.target.value)}
                      className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                      placeholder="Shop Now"
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ds-700 mb-1">
                      CTA Button Link
                    </label>
                    <input
                      type="text"
                      value={formData.ctaButton.link}
                      onChange={(e) => handleInputChange('ctaButton.link', e.target.value)}
                      className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                      placeholder="/products"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ds-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                      className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                      placeholder="rgba(0, 0, 0, 0.4)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ds-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => handleInputChange('textColor', e.target.value)}
                      className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ds-700 mb-1">
                      Animation Duration (ms)
                    </label>
                    <input
                      type="number"
                      value={formData.animationDuration}
                      onChange={(e) => handleInputChange('animationDuration', Number(e.target.value))}
                      placeholder="4000"
                      className="w-full border border-ds-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ds-600"
                      min={1000}
                      max={10000}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.ctaButton.enabled}
                      onChange={(e) => handleInputChange('ctaButton.enabled', e.target.checked)}
                      className="rounded border-ds-200 text-ds-700 focus:ring-ds-600"
                    />
                    <span className="text-sm text-ds-700">Enable CTA Button</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => handleInputChange('isActive', e.target.checked)}
                      className="rounded border-ds-200 text-ds-700 focus:ring-ds-600"
                    />
                    <span className="text-sm text-ds-700">Active</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-ds-700 border border-ds-200 rounded-md hover:bg-ds-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-ds-200 text-ds-900 rounded-md hover:bg-ds-300 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? 'Saving...' : 'Save Hero'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Heroes List */}
  <div className="dash-card bg-ds-100 rounded-lg shadow">
        {heroes.length === 0 ? (
          <div className="p-8 text-center">
            <ImageIcon className="w-16 h-16 text-ds-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-ds-900 mb-2">No Hero Slides</h3>
            <p className="text-ds-700 mb-4">Get started by creating your first hero slide</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-ds-200 text-ds-900 rounded-lg hover:bg-ds-300"
            >
              Add Hero Slide
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ds-300">
              <thead className="bg-ds-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ds-700 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ds-700 uppercase tracking-wider">
                    Preview
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ds-700 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ds-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ds-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-ds-100 divide-y divide-ds-300">
                {heroes.map((hero) => (
                  <tr key={hero._id} className="hover:bg-ds-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Move className="w-4 h-4 text-ds-500" />
                        <span className="text-sm font-medium text-ds-900">
                          {hero.order}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {/* Desktop Preview */}
                        <div className="w-20 h-12 bg-ds-200 rounded overflow-hidden">
                          <img
                            src={hero.image?.desktop?.url || hero.image?.url || ''}
                            alt={hero.image?.desktop?.alt || hero.image?.alt || 'Desktop image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkM5LjggMTYgOCAxNC4yIDggMTJTOS44IDggMTIgOFMxNiA5LjggMTYgMTJTMTQuMiAxNiAxMiAxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                            }}
                          />
                          <div className="text-xs text-center text-ds-700 bg-ds-100 py-1">
                            <Monitor className="w-3 h-3 mx-auto" />
                          </div>
                        </div>
                        {/* Mobile Preview */}
                        <div className="w-20 h-12 bg-ds-200 rounded overflow-hidden">
                          <img
                            src={hero.image?.mobile?.url || hero.image?.url || ''}
                            alt={hero.image?.mobile?.alt || hero.image?.alt || 'Mobile image'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiOiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgZmlsbD0iI0YzRjRGNiIvPgo8cGF0aCBkPSJNMTIgMTZDOS44IDE2IDggMTQuMiA4IDEyUzkuOCA4IDEyIDhTMTYgOS44IDE2IDEyUzE0LjIgMTYgMTIgMTZaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPg==';
                            }}
                          />
                          <div className="text-xs text-center text-ds-700 bg-ds-100 py-1">
                            <Smartphone className="w-3 h-3 mx-auto" />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm font-medium text-ds-900 truncate">
                          {hero.title}
                        </div>
                        <div className="text-sm text-ds-700 truncate">
                          {hero.subtitle}
                        </div>
                        {hero.ctaButton.enabled && (
                          <div className="text-xs text-ds-700 flex items-center gap-1 mt-1">
                            <ExternalLink className="w-3 h-3" />
                            {hero.ctaButton.text}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        hero.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {hero.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(hero._id)}
                          className="text-gray-600 hover:text-gray-900"
                          title={hero.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {hero.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(hero)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(hero._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroManagement;
