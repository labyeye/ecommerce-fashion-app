import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  Package, 
  Megaphone, 
  Settings,
  Home,
  Shield,
  AlertTriangle,
  LogOut,
  User,
  Percent,
  Image,
  Navigation,
  FileText,
  Folder
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  const { user, logout } = useAuth();
  
  const menuItems = [
    { id: 'overview', icon: Home, label: 'Overview' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'orders', icon: ShoppingCart, label: 'Orders' },
    { id: 'products', icon: Package, label: 'Products' },
    { id: 'categories', icon: Folder, label: 'Categories' },
  { id: 'newsletter', icon: Megaphone, label: 'Newsletter' },
    { id: 'heroes', icon: Image, label: 'Hero Slider' },
    { id: 'blogs', icon: FileText, label: 'Blogs' },
    { id: 'promo-codes', icon: Percent, label: 'Promo Codes' },
    { id: 'navigation', icon: Navigation, label: 'Navigation' },
    { id: 'alerts', icon: AlertTriangle, label: 'Alerts' },
    { id: 'security', icon: Shield, label: 'Security' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="bg-ds-800 text-ds-100 w-64 min-h-screen flex flex-col shadow-lg">
      <div className="p-6 border-b border-ds-700">
        <h1 className="text-xl font-bold text-ds-100">Commerce Hub</h1>
        <p className="text-sm text-ds-200 mt-1">Admin Dashboard</p>
      </div>
      
      <nav className="mt-6 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-all duration-200 hover:bg-ds-700 ${
                isActive 
                  ? 'bg-ds-100 text-ds-900 border-r-2 border-ds-300' 
                  : 'text-ds-200 hover:text-ds-100'
              }`}
            >
              <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-ds-300' : 'text-ds-500'}`} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* User Info and Logout */}
      <div className="p-6 border-t border-ds-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-ds-100/20 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-ds-100" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-ds-100">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-ds-200">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-sm text-ds-300 hover:bg-ds-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;