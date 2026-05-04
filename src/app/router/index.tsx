import { createBrowserRouter, Navigate } from 'react-router';
import { lazy } from 'react';
import { RootErrorBoundary } from '@/app/components/ui/ErrorBoundary';
import { AppLayout } from '@/app/layouts/App.layout';

export const router = createBrowserRouter([
  {
    path: '/student',
    Component: AppLayout,
    children: [
      { index: true, element: <Navigate to="/student/frontpage" replace /> },
      { path: 'frontpage', Component: lazy(() => import('@/app/views/dashboard/Dashboard.view')) },
      { path: 'plan', Component: lazy(() => import('@/app/views/timeline/Timeline.view')) },
      { path: 'plan/:planId/timing', Component: lazy(() => import('@/app/views/timeline/Timeline.view')) },
      { path: 'enrolments', Component: lazy(() => import('@/app/views/registration/Registration.view')) },
      { path: '*', element: <Navigate to="/student/frontpage" replace /> },
    ],
    ErrorBoundary: RootErrorBoundary,
  },
]);
