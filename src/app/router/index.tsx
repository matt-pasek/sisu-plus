import { createBrowserRouter } from 'react-router';
import { lazy } from 'react';
import { RootErrorBoundary } from '@/app/components/ui/ErrorBoundary';
import { AppLayout } from '@/app/layouts/App.layout';

export const router = createBrowserRouter([
  {
    path: '/student',
    Component: AppLayout,
    children: [{ path: 'frontpage', Component: lazy(() => import('@/app/views/dashboard/Dashboard.view')) }],
    ErrorBoundary: RootErrorBoundary,
  },
]);
