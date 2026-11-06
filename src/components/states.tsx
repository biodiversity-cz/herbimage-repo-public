import { Alert, Button, Spinner } from 'react-bootstrap';

/** Centered spinner used as a loading placeholder. */
export function LoadingState({ label = 'Načítám…' }: { label?: string }) {
  return (
    <div className="text-center text-secondary py-5" role="status" aria-live="polite">
      <Spinner size="sm" animation="border" className="me-2" />
      {label}
    </div>
  );
}

/** Error panel with an optional retry action, used around data fetching. */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : 'Neznámá chyba';
  return (
    <Alert variant="danger">
      <Alert.Heading>Nepodařilo se načíst data</Alert.Heading>
      <p className="mb-2">{message}</p>
      {onRetry !== undefined && (
        <Button variant="outline-danger" size="sm" onClick={onRetry}>
          Zkusit znovu
        </Button>
      )}
    </Alert>
  );
}

/** Friendly „nothing to show“ block used inside tables and pages. */
export function EmptyState({
  title = 'Žádné záznamy',
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="text-center text-secondary py-5">
      <p className="fs-3" aria-hidden="true">
        🔍
      </p>
      <p className="h5">{title}</p>
      {description !== undefined && <p className="mb-0">{description}</p>}
    </div>
  );
}
