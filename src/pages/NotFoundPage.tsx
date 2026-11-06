import { LinkButton } from '@/components/LinkButton';
import { routes } from '@/routes';

/** Shown for URLs that do not match any route. */
export default function NotFoundPage() {
  return (
    <div className="text-center py-5">
      <p className="display-4">404</p>
      <p className="lead">Stránka nebyla nalezena.</p>
      <LinkButton to={routes.home} variant="primary">
        Zpět na úvodní stránku
      </LinkButton>
    </div>
  );
}
