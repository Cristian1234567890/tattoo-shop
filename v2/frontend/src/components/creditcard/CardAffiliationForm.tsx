import React from 'react';
import { InteractiveCard, InteractiveCardProps } from './InteractiveCard';

export const CardAffiliationForm: React.FC<InteractiveCardProps> = (props) => {
  return <InteractiveCard {...props} />;
};

export default CardAffiliationForm;
export * from './InteractiveCard';
