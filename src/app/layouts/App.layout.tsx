import { Outlet, useNavigation } from 'react-router';
import { SpinnerLoader } from '@/app/components/ui/SpinnerLoader.comp';
import React from 'react';

export const AppLayout: React.FC = () => {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <div>
      {isNavigating && <SpinnerLoader />}
      <Outlet />
    </div>
  );
};
