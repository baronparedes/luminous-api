-- Reseed identity/serial sequences for core tables to the next available id.
--
-- Usage (PostgreSQL):
--   psql "$DATABASE_URL" -f scripts/reseed-identities.sql
--
-- Notes:
-- - Assumes primary key column is named "id".
-- - Uses pg_get_serial_sequence so it works even if sequence names differ
--   from the default <table>_id_seq pattern.

BEGIN;

    DO $$
    DECLARE
  target_schema text := 'public';
tbl text;
  seq_name text;
  next_id bigint;
  tables text[] := ARRAY[
    'profiles',
    'properties',
    'charges',
    'transactions',
    'categories',
    'property_assignments',
    'settings',
    'vouchers'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    seq_name := pg_get_serial_sequence
(format
('%I.%I', target_schema, tbl), 'id');

IF seq_name IS NULL THEN
      RAISE WARNING 'Skipping %.%: no serial/identity sequence found for column id', target_schema, tbl;
CONTINUE;
END
IF;

    EXECUTE format
(
      'SELECT COALESCE(MAX(id), 0) + 1 FROM %I.%I',
      target_schema,
      tbl
    ) INTO next_id;

EXECUTE format
(
      'SELECT setval(%L::regclass, %s, false)',
      seq_name,
      next_id
    );

    RAISE NOTICE 'Reseeded %.% using % to next id %', target_schema, tbl, seq_name, next_id;
END LOOP;
END $$;

COMMIT;
