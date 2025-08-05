import React from 'react';
import { mockData } from '../data/mockData';
import { Plus, TrendingUp, Mail, Instagram, Percent } from 'lucide-react';

interface MarketingProps {
  onViewDetails: (campaignId: string) => void;
}

const Marketing: React.FC<MarketingProps> = ({ onViewDetails }) => {
  const getCampaignIcon = (type: string) => {
    switch (type) {
      case 'Email': return Mail;
      case 'Social': return Instagram;
      case 'Discount Code': return Percent;
      default: return TrendingUp;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      case 'Ended': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing & Promotions</h1>
          <p className="text-gray-600 mt-1">Manage campaigns, track performance, and boost sales</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <TrendingUp className="w-4 h-4" />
            <span>Analytics</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Marketing Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">24</div>
          <div className="text-sm text-gray-600">Active Campaigns</div>
          <div className="text-xs text-green-600 mt-1">3 new this week</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">$127K</div>
          <div className="text-sm text-gray-600">Campaign Revenue</div>
          <div className="text-xs text-green-600 mt-1">+18% this month</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">8.5%</div>
          <div className="text-sm text-gray-600">Avg. Conversion Rate</div>
          <div className="text-xs text-green-600 mt-1">+2.1% vs last month</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">42%</div>
          <div className="text-sm text-gray-600">Email Open Rate</div>
          <div className="text-xs text-blue-600 mt-1">Above industry avg</div>
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Campaigns</h3>
        <div className="space-y-4">
          {mockData.campaigns.slice(0, 3).map((campaign) => {
            const Icon = getCampaignIcon(campaign.type);
            return (
              <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                    <p className="text-sm text-gray-500">{campaign.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">{campaign.usage}</div>
                    <div className="text-gray-500">Uses</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">${campaign.revenue.toLocaleString()}</div>
                    <div className="text-gray-500">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-green-600">{campaign.conversionRate}%</div>
                    <div className="text-gray-500">Conv. Rate</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">All Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockData.campaigns.map((campaign) => {
                const Icon = getCampaignIcon(campaign.type);
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-400" />
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {campaign.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.usage.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${campaign.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                      {campaign.conversionRate}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                      <button 
                        onClick={() => onViewDetails(campaign.id)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">View</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <Mail className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-blue-900 mb-2">Email Marketing</h3>
          <p className="text-sm text-blue-700 mb-4">Create and send targeted email campaigns to your customers.</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
            Create Email Campaign
          </button>
        </div>
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <Percent className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-green-900 mb-2">Discount Codes</h3>
          <p className="text-sm text-green-700 mb-4">Set up promotional codes to drive sales and customer acquisition.</p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
            Create Discount Code
          </button>
        </div>
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-purple-900 mb-2">Analytics</h3>
          <p className="text-sm text-purple-700 mb-4">Deep dive into campaign performance and customer behavior.</p>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default Marketing;