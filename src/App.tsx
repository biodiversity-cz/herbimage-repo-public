import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { AppLayout } from '@/components/layout';

// Route-level code splitting keeps the initial bundle small.
const HomePage = lazy(() => import('@/pages/HomePage'));
const RecordsPage = lazy(() => import('@/features/records/RecordsPage'));
const RecordDetailPage = lazy(() => import('@/features/records/RecordDetailPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route path="records/:id" element={<RecordDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
