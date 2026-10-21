import React from 'react';
import { InteractiveCard } from '../components/creditcard/InteractiveCard';

export const CreditCardPage: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col justify-center items-center py-12 px-4 bg-slate-50 dark:bg-zinc-950 transition-colors">
      <InteractiveCard />
    </div>
  );
};

export default CreditCardPage;
