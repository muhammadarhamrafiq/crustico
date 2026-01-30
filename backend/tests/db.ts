import prisma from '../src/lib/prisma'

export async function resetDatabase() {
    await prisma.$executeRawUnsafe(`
        DO $$ DECLARE
            r RECORD;
        BEGIN
            -- truncate all tables in public schema (except Prisma migrations table if you want)
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE;';
        END LOOP;
        END $$;
    `)
}
