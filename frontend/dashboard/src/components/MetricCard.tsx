import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Users
} from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
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

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon }) => {
  const IconComponent = iconMap[icon] || DollarSign;
  
  
  

  return (
    <div className="bg-ds-100 p-6 rounded-xl shadow-sm border border-ds-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-ds-200 rounded-lg">
            <IconComponent className="w-6 h-6 text-ds-700" />
          </div>
        </div>
        
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium text-ds-700">{title}</h3>
        <p className="text-2xl font-bold text-ds-900 mt-1">{value}</p>
      </div>
    </div>
  );
};

export default MetricCard;