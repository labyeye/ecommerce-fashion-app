import React from 'react';
import { ArrowLeft, TrendingUp, Users, DollarSign, Target, Calendar, Edit, Trash2 } from 'lucide-react';
import { Campaign } from '../types/dashboard';

interface CampaignDetailsProps {
  campaign: Campaign;
  onBack: () => void;
}

const CampaignDetails: React.FC<CampaignDetailsProps> = ({ campaign, onBack }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      case 'Ended': return 'bg-ds-100 text-ds-800';
      default: return 'bg-ds-100 text-ds-800';
    }
  };

  const performanceData = [
    { metric: 'Total Impressions', value: '45,230', change: '+12.3%', positive: true },
    { metric: 'Click-through Rate', value: '3.2%', change: '+0.8%', positive: true },
    { metric: 'Cost per Acquisition', value: '$12.50', change: '-5.2%', positive: true },
    { metric: 'Return on Ad Spend', value: '4.2x', change: '+1.1x', positive: true }
  ];

  const topPerformingProducts = [
    { name: 'Wireless Bluetooth Headphones', sales: 45, revenue: 5850 },
    { name: 'Smart Fitness Tracker', sales: 32, revenue: 2880 },
    { name: 'USB-C Power Bank', sales: 28, revenue: 1120 }
  ];

  const audienceBreakdown = [
    { segment: 'New Customers', percentage: 45, count: 1230 },
    { segment: 'Returning Customers', percentage: 35, count: 956 },
    { segment: 'VIP Customers', percentage: 20, count: 546 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 bg-ds-200 text-ds-900 rounded-lg hover:bg-ds-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-ds-900">{campaign.name}</h1>
            <p className="text-ds-700 mt-1">{campaign.type} Campaign</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </span>
          <button className="flex items-center space-x-2 px-4 py-2 bg-ds-200 text-ds-900 rounded-lg hover:bg-ds-300 transition-colors">
            <Edit className="w-4 h-4" />
            <span>Edit Campaign</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
          {/* Campaign Overview */}
          <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
            <h3 className="text-lg font-semibold text-ds-900 mb-6">Campaign Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Usage</p>
                    <p className="text-2xl font-bold text-blue-900">{campaign.usage.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Revenue Generated</p>
                    <p className="text-2xl font-bold text-green-900">${campaign.revenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Target className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Conversion Rate</p>
                    <p className="text-2xl font-bold text-purple-900">{campaign.conversionRate}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
            <h3 className="text-lg font-semibold text-ds-900 mb-6">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {performanceData.map((metric, index) => (
                <div key={index} className="p-4 bg-ds-100 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-ds-700">{metric.metric}</p>
                      <p className="text-xl font-bold text-ds-900">{metric.value}</p>
                    </div>
                    <div className={`flex items-center space-x-1 ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{metric.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Products */}
          <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
            <h3 className="text-lg font-semibold text-ds-900 mb-6">Top Performing Products</h3>
            <div className="space-y-4">
              {topPerformingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-ds-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-ds-900">{product.name}</p>
                      <p className="text-sm text-ds-700">{product.sales} sales from campaign</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-ds-900">${product.revenue.toLocaleString()}</p>
                    <p className="text-sm text-green-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Campaign Timeline */}
          <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
            <h3 className="text-lg font-semibold text-ds-900 mb-6">Campaign Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Campaign Launched</p>
                  <p className="text-sm text-gray-500">January 1, 2024 at 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">First 1000 Uses Reached</p>
                  <p className="text-sm text-gray-500">January 5, 2024 at 2:30 PM</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Peak Performance Day</p>
                  <p className="text-sm text-gray-500">January 10, 2024 - 234 uses in one day</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Campaign Settings */}
          <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
            <h4 className="font-semibold text-ds-900 mb-4">Campaign Settings</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-ds-700">Campaign Type</label>
                <p className="text-ds-900">{campaign.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-ds-700">Status</label>
                <p className="text-ds-900">{campaign.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-ds-700">Start Date</label>
                <p className="text-ds-900">January 1, 2024</p>
              </div>
              <div>
                <label className="text-sm font-medium text-ds-700">End Date</label>
                <p className="text-ds-900">March 31, 2024</p>
              </div>
              {campaign.type === 'Discount Code' && (
                <div>
                  <label className="text-sm font-medium text-ds-700">Discount Amount</label>
                  <p className="text-ds-900">20% off</p>
                </div>
              )}
            </div>
          </div>

          {/* Audience Breakdown */}
          <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
            <h4 className="font-semibold text-ds-900 mb-4">Audience Breakdown</h4>
            <div className="space-y-4">
              {audienceBreakdown.map((segment, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-ds-700">{segment.segment}</span>
                    <span className="text-sm text-ds-700">{segment.percentage}%</span>
                  </div>
                  <div className="w-full bg-ds-200 rounded-full h-2">
                    <div className="bg-ds-700 h-2 rounded-full" style={{ width: `${segment.percentage}%` }} />
                  </div>
                  <p className="text-xs text-ds-700 mt-1">{segment.count.toLocaleString()} customers</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
            <h4 className="font-semibold text-ds-900 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              {campaign.status === 'Active' ? (
                <button className="w-full text-left px-4 py-2 bg-ds-200 text-ds-900 rounded-lg hover:bg-ds-300 transition-colors">
                  Pause Campaign
                </button>
              ) : (
                <button className="w-full text-left px-4 py-2 bg-ds-200 text-ds-900 rounded-lg hover:bg-ds-300 transition-colors">
                  Resume Campaign
                </button>
              )}
              <button className="w-full text-left px-4 py-2 bg-ds-200 text-ds-900 rounded-lg hover:bg-ds-300 transition-colors">Duplicate Campaign</button>
              <button className="w-full text-left px-4 py-2 bg-ds-200 text-ds-900 rounded-lg hover:bg-ds-300 transition-colors">Export Report</button>
              <button className="w-full text-left px-4 py-2 bg-ds-200 text-ds-900 rounded-lg hover:bg-ds-300 transition-colors">View Full Analytics</button>
            </div>
          </div>

          {/* Budget Information */}
          <div className="bg-ds-100 rounded-xl shadow-sm border border-ds-200 p-6">
            <h4 className="font-semibold text-ds-900 mb-4">Budget & Spend</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-ds-700">Total Budget</span>
                <span className="text-sm font-medium text-ds-900">$5,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ds-700">Spent</span>
                <span className="text-sm font-medium text-ds-900">$3,250</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-ds-700">Remaining</span>
                <span className="text-sm font-medium text-green-600">$1,750</span>
              </div>
              <div className="w-full bg-ds-200 rounded-full h-2 mt-3">
                <div className="bg-ds-700 h-2 rounded-full" style={{ width: '65%' }} />
              </div>
              <p className="text-xs text-ds-700">65% of budget used</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;