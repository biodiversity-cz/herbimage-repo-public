import { Suspense } from 'react';
import { Link, Outlet } from 'react-router';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { LoadingState } from '@/components/states';
import { appConfig } from '@/config';
import { routes } from '@/routes';

/** Page chrome: navbar on top, routed content, footer at the bottom. */
export function AppLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AppNavbar />
      <main className="flex-grow-1 py-4">
        <Container as="section">
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </Container>
      </main>
      <AppFooter />
    </div>
  );
}

function AppNavbar() {
  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to={routes.home}>
          🌿 {appConfig.appName}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="app-navbar-nav" />
        <Navbar.Collapse id="app-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to={routes.home}>
              Domů
            </Nav.Link>
            <Nav.Link as={Link} to={routes.records}>
              Záznamy
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function AppFooter() {
  return (
    <footer className="bg-body-tertiary py-3 mt-auto">
      <Container>
        <span className="text-body-secondary">
          © {new Date().getFullYear()} {appConfig.appName} · biodiversity.cz
        </span>
      </Container>
    </footer>
  );
}
