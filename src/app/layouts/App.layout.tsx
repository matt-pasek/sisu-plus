import { Outlet, useLocation, useNavigation } from 'react-router';
import { SpinnerLoader } from '@/app/components/ui/SpinnerLoader.comp';
import React from 'react';
import { Navbar } from '@/app/components/ui/Navbar.comp';

export const AppLayout: React.FC = () => {
  const navigation = useNavigation();
  const location = useLocation();
  const isNavigating = Boolean(navigation.location);
  const isTimeline = location.pathname.startsWith('/student/plan');

  return (
    <div>
      {isNavigating && <SpinnerLoader />}
      <Navbar />
      <div className={`mx-auto w-full px-6 pt-6 ${isTimeline ? 'max-w-none' : 'max-w-6xl'}`}>
        <Outlet />
      </div>
    </div>
  );
};
