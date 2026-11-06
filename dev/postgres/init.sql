-- Demo schema, seed data and read-only roles for the local PostgREST stack.
-- Executed automatically on the first `docker compose up` (empty volume).

CREATE TABLE records (
    id           integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code         text        NOT NULL UNIQUE,
    title        text        NOT NULL,
    category     text        NOT NULL,
    status       text        NOT NULL DEFAULT 'published',
    collected_at date,
    created_at   timestamptz NOT NULL DEFAULT now()
);

-- 137 demo rows – enough to exercise pagination, sorting and search.
INSERT INTO records (code, title, category, status, collected_at)
SELECT
    'HIB-' || lpad(g::text, 5, '0'),
    (ARRAY[
        'Quercus robur', 'Picea abies', 'Fagus sylvatica', 'Pinus sylvestris',
        'Betula pendula', 'Carpinus betulus', 'Abies alba', 'Larix decidua',
        'Tilia cordata', 'Acer platanoides', 'Fraxinus excelsior', 'Salix caprea'
    ])[1 + (g % 12)],
    (ARRAY['Herbář', 'Fotografie', 'Preparát'])[1 + (g % 3)],
    (ARRAY['published', 'review'])[1 + (g % 5 = 0)::int],
    CURRENT_DATE - (g * 17)
FROM generate_series(1, 137) AS g;

-- Read-only API role assumed by PostgREST for anonymous requests.
-- The catalog is read-only by design – this is enforced at the database level.
CREATE ROLE web_anon NOLOGIN;
GRANT USAGE ON SCHEMA public TO web_anon;
GRANT SELECT ON public.records TO web_anon;

-- Role PostgREST authenticates as; it can only switch to `web_anon`.
CREATE ROLE authenticator LOGIN PASSWORD 'authenticator' NOINHERIT;
GRANT web_anon TO authenticator;
