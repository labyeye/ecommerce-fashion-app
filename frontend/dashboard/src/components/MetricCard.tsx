import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users,
  TrendingDown,
  Minus
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

const iconMap: { [key: string]: React.ElementType } = {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Target,
  BarChart3,
  Users
};

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon }) => {
  const IconComponent = iconMap[icon] || DollarSign;
  
  const getChangeIcon = () => {
    if (changeType === 'positive') return TrendingUp;
    if (changeType === 'negative') return TrendingDown;
    return Minus;
  };
  
  const ChangeIcon = getChangeIcon();
  
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <IconComponent className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
          <ChangeIcon className="w-4 h-4" />
          <span className="text-sm font-medium">
            {change > 0 ? '+' : ''}{change}%
          </span>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default MetricCard;