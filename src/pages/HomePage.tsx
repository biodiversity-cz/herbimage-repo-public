import { useQuery } from '@tanstack/react-query';
import { Card } from 'react-bootstrap';
import { list } from '@/api/postgrest';
import { appConfig } from '@/config';
import { LinkButton } from '@/components/LinkButton';
import { recordsKeys } from '@/features/records/api';
import { routes } from '@/routes';

/** Landing page – short intro plus the total record count from the API. */
export default function HomePage() {
  const { data } = useQuery({
    queryKey: [...recordsKeys.all, 'count'],
    queryFn: () => list('records', { select: 'id', range: { offset: 0, limit: 1 } }),
  });

  return (
    <>
      <h1 className="h3 mb-3">{appConfig.appName}</h1>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <p className="lead">
            Veřejný katalog záznamů herbáře. Data jsou poskytována přes PostgREST rozhraní a slouží
            pouze pro čtení.
          </p>
          {typeof data?.total === 'number' && (
            <p className="text-secondary">
              Katalog aktuálně obsahuje <strong>{data.total.toLocaleString('cs-CZ')}</strong>{' '}
              záznamů.
            </p>
          )}
          <LinkButton to={routes.records} variant="success">
            Přejít na katalog
          </LinkButton>
        </Card.Body>
      </Card>
    </>
  );
}
