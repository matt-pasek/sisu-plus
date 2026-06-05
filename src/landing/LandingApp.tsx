import { LandingRoute } from '@/landing/landingSeo';
import React from 'react';
import { PrivacyPolicyPage } from '@/landing/views/PrivacyPolicyPage';
import { LandingPage } from '@/landing/views/LandingPage';

interface Props {
  route: LandingRoute;
}

export const LandingApp: React.FC<Props> = ({ route }) => {
  return route.kind === 'privacy' ? <PrivacyPolicyPage route={route} /> : <LandingPage route={route} />;
};
