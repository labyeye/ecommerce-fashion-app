import React, { useEffect } from 'react';
import { Check, Gift } from 'lucide-react';
import Lottie from 'lottie-react';
import animationData from './success-animation.json';

const OrderSuccessAnimation = ({ orderData, onContinue }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-32 h-32 mx-auto mb-6">
          <Lottie animationData={animationData} loop={false} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
        
        {orderData && (
          <div className="mb-6 p-4 bg-[#688F4E]/10 rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Gift className="w-5 h-5 text-[#688F4E]" />
              <span className="font-medium text-[#2B463C]">Points Earned!</span>
            </div>
            <p className="text-sm text-[#688F4E] font-bold">
              +{orderData.pointsEarned.tierPoints} Tier Points & +{orderData.pointsEarned.evolvPoints} Evolv Points
            </p>
            {orderData.newTier && (
              <p className="text-xs text-gray-600 mt-1">
                Current Tier: {orderData.newTier.charAt(0).toUpperCase() + orderData.newTier.slice(1)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessAnimation;