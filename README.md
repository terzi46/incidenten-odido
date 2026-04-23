This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Database

### Seeding

A reusable CSV seed function is available at `prisma/seed-csv.ts`.

**Import and use in code:**
```ts
import { seedFromCsv } from "./prisma/seed-csv";
const result = await seedFromCsv("/path/to/file.csv");
// result: { added, skipped, errors, total }
```

**Run directly from CLI:**
```bash
npx tsx --env-file=.env prisma/seed-csv.ts path/to/file.csv
```

The CSV should be semicolon-delimited with these columns (header row is auto-skipped):
`INC-Ticket;Datum;Postcode huisnr;Klantnummer;Casenummer;Go care ticket;Onderwerp;Aangemaakt door;segment;Solved = Y;ST;Opmerkingen;Voorgaand/oud ticket nummer`

Duplicates (matching `incTicket`) are automatically ignored via upsert.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
