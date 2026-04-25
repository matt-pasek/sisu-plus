import { Outlet, useNavigation } from 'react-router';
import { SpinnerLoader } from '@/app/components/ui/SpinnerLoader.comp';
import React from 'react';
import { Navbar } from '@/app/components/ui/Navbar.comp';

export const AppLayout: React.FC = () => {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <div>
      {isNavigating && <SpinnerLoader />}
      <Navbar />
      <div className="mx-auto w-8/12 pt-6">
        <Outlet />
      </div>
    </div>
  );
};
