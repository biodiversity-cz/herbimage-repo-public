/**
 * Database types exposed by PostgREST.
 *
 * This is a hand-written placeholder for the demo `records` table so the app
 * builds without a running API. Regenerate it from the live OpenAPI
 * description with `npm run types:api` (requires PostgREST to be reachable,
 * see `.env.example`) – openapi-typescript emits the same `components.schemas`
 * shape, so no other code has to change.
 */
export interface components {
  schemas: {
    records: {
      id: number;
      code: string;
      title: string;
      category: string;
      status: string;
      collected_at: string | null;
      created_at: string;
    };
  };
}
