Prisma setup & migration

1. Ensure `DATABASE_URL` is set: for local SQLite you can use:

   ```bash
   export DATABASE_URL="file:./dev.db"
   ```

2. Install dependencies (if you haven't already):

   ```bash
   npm install
   ```

3. Generate the Prisma client:

   ```bash
   npx prisma generate
   ```

4. Create the first migration and apply it to the database:

   ```bash
   npx prisma migrate dev --name init
   ```

   This will create `prisma/migrations/*` and the `dev.db` SQLite file.

5. (Optional) Seed some sample data by using `npx prisma db seed` if you add a seed script.

Notes:
- If you prefer Postgres or another provider, update `prisma/schema.prisma` `datasource db` block and set `DATABASE_URL` accordingly.
- Ensure `@prisma/client` and `prisma` are installed (this repo's `package.json` includes them as devDependencies).
