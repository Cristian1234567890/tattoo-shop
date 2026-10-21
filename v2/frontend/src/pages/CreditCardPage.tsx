import React from 'react';
import { InteractiveCard } from '../components/creditcard/InteractiveCard';

export const CreditCardPage: React.FC = () => {
  return (
    <div className="flex-1 flex justify-center items-center py-12 px-4">
      <InteractiveCard />
    </div>
  );
};
