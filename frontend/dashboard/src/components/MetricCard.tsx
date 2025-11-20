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
    <div className="bg-neutral-card p-6 shadow-sm border border-neutral-border hover:shadow-md transition-shadow duration-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-primary-50 rounded-lg">
            <IconComponent className="w-6 h-6 text-primary-500" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-body">{title}</h3>
        <p className="text-3xl font-extrabold text-heading mt-1">{value}</p>
      </div>
    </div>
  );
};

export default MetricCard;