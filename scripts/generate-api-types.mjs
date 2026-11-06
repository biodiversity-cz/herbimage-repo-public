// Regenerates src/types/api-schema.ts from the OpenAPI description that
// PostgREST serves at its root path. Requires a reachable PostgREST instance
// (e.g. `docker compose up -d db postgrest`), configured via POSTGREST_URL.
import { execSync } from 'node:child_process';

const baseUrl = process.env.POSTGREST_URL ?? 'http://localhost:3000';
const command = `openapi-typescript ${baseUrl}/ --output src/types/api-schema.ts`;

console.log(`Generating API types from ${baseUrl}/ …`);
execSync(command, { stdio: 'inherit' });
