import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw/http';
import { setupServer } from 'msw/node';
import { MemoryRouter } from 'react-router';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import RecordsPage from './RecordsPage';

const demoRecord = {
  id: 1,
  code: 'HIB-00001',
  title: 'Quercus robur',
  category: 'Herbář',
  status: 'published',
  collected_at: '2024-05-01',
  created_at: '2024-05-01T10:00:00Z',
};

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <RecordsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('RecordsPage', () => {
  it('loads a page of records from PostgREST and renders it', async () => {
    const requests: string[] = [];
    server.use(
      http.get('*/api/records', ({ request }) => {
        requests.push(new URL(request.url).search);
        return HttpResponse.json([demoRecord], {
          headers: { 'content-range': '0-0/1' },
        });
      }),
    );

    renderPage();

    expect(await screen.findByText('Quercus robur')).toBeInTheDocument();
    expect(screen.getByText('HIB-00001')).toBeInTheDocument();
    // The table asks PostgREST for server-side sorting, pagination and count.
    expect(requests[0]).toContain('order=code.asc.nullslast');
    expect(requests[0]).toContain('limit=25');
    expect(requests[0]).toContain('offset=0');
  });

  it('shows an empty state when no records match', async () => {
    server.use(
      http.get('*/api/records', () =>
        HttpResponse.json([], { headers: { 'content-range': '*/0' } }),
      ),
    );

    renderPage();

    expect(await screen.findByText('Žádné záznamy nenalezeny')).toBeInTheDocument();
  });

  it('shows an error state with a retry button when the API fails', async () => {
    let requestCount = 0;
    server.use(
      http.get('*/api/records', () => {
        requestCount += 1;
        return HttpResponse.json({ message: 'API je nedostupné' }, { status: 500 });
      }),
    );

    renderPage();

    expect(await screen.findByText('API je nedostupné')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Zkusit znovu' }));
    await waitFor(() => {
      expect(requestCount).toBe(2);
    });
  });
});
