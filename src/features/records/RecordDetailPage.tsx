import { useParams } from 'react-router';
import { Badge, Card, ListGroup } from 'react-bootstrap';
import { EmptyState, ErrorState, LoadingState } from '@/components/states';
import { LinkButton } from '@/components/LinkButton';
import { routes } from '@/routes';
import { useRecord } from './api';
import type { RecordRow } from './types';

const DATE_FORMAT = new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'medium' });

function formatDate(value: string): string {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : DATE_FORMAT.format(parsed);
}

function detailFields(record: RecordRow): Array<{ label: string; value: string }> {
  return [
    { label: 'Kód', value: record.code },
    { label: 'Název', value: record.title },
    { label: 'Kategorie', value: record.category },
    { label: 'Stav', value: record.status },
    {
      label: 'Datum sběru',
      value: record.collected_at !== null ? formatDate(record.collected_at) : '—',
    },
    { label: 'Vytvořeno', value: formatDate(record.created_at) },
  ];
}

/** Single record view – everything relevant about one catalog entry. */
export default function RecordDetailPage() {
  const { id } = useParams();
  const { data: record, isPending, error, refetch } = useRecord(id ?? '');

  if (isPending) {
    return <LoadingState />;
  }
  if (error !== null) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }
  if (record === null || record === undefined) {
    return (
      <>
        <BackToRecordsButton />
        <EmptyState
          title="Záznam nenalezen"
          description={`Záznam s identifikátorem ${id ?? ''} v katalogu neexistuje.`}
        />
      </>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <BackToRecordsButton />
        <h1 className="h3 mb-0">{record.title}</h1>
        <Badge bg="secondary">{record.code}</Badge>
      </div>
      <Card>
        <Card.Body className="p-0">
          <ListGroup variant="flush">
            {detailFields(record).map((field) => (
              <ListGroup.Item key={field.label} className="d-flex justify-content-between gap-3">
                <span className="text-body-secondary text-nowrap">{field.label}</span>
                <span className="text-break">{field.value}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </>
  );
}

function BackToRecordsButton() {
  return (
    <LinkButton to={routes.records} variant="outline-secondary" size="sm">
      ← Záznamy
    </LinkButton>
  );
}
