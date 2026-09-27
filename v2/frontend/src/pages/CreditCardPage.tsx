import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { InteractiveCard } from '../components/creditcard/InteractiveCard';

export const CreditCardPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex justify-center items-center">
        <InteractiveCard />
      </div>
      <Footer />
    </div>
  );
};
