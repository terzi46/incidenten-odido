import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import * as fs from "fs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

function parseDate(ddMmYy: string): Date {
  const [day, month, year] = ddMmYy.split(".");
  return new Date(2000 + parseInt(year), parseInt(month) - 1, parseInt(day));
}

function parseSolved(val: string): boolean {
  const v = val.trim().toUpperCase();
  return v === "Y" || v === "YES" || v === "TRUE" || v === "1";
}

/**
 * Seed incidents from a CSV file (semicolon-delimited).
 * Skips duplicates via upsert (no-op on conflict).
 *
 * CSV columns (header row skipped automatically):
 *   INC-Ticket;Datum;Postcode huisnr;Klantnummer;Casenummer;Go care ticket;
 *   Onderwerp;Aangemaakt door;segment;Solved = Y;ST;Opmerkingen;Voorgaand/oud ticket nummer
 */
export async function seedFromCsv(csvPath: string): Promise<{
  added: number;
  skipped: number;
  errors: number;
  total: number;
}> {
  const raw = fs.readFileSync(csvPath, "utf-8");

  const lines = raw
    .split("\n")
    .map((l) => l.replace("\r", "").trim())
    .filter((l) => l && !l.startsWith("INC-Ticket") && !l.startsWith(";"));

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const line of lines) {
    const cols = line.split(";").map((c) => c.trim());

    const incTicket = cols[0]?.replace(/^\uFEFF/, "").trim();
    if (!incTicket || !incTicket.startsWith("INC")) {
      console.log(`Skipping invalid line: ${line.substring(0, 60)}`);
      errors++;
      continue;
    }

    const datumStr = cols[1]?.trim();
    const postcodeHuisnr = cols[2]?.trim() || "";
    const klantnummer = cols[3]?.trim() || "";
    const casenummer = cols[4]?.trim() || null;
    const goCareTicket = cols[5]?.trim() || null;
    const onderwerp = cols[6]?.trim() || "";
    const aangemaaktDoor = cols[7]?.trim() || "";
    const segment = cols[8]?.trim() || null;
    const solvedStr = cols[9]?.trim() || "";
    const st = cols[10]?.trim() || null;
    const opmerkingen = cols[11]?.trim() || null;
    const voorgaandTicket = cols[12]?.trim() || null;

    if (!datumStr || !postcodeHuisnr || !klantnummer || !onderwerp) {
      console.log(`Skipping ${incTicket}: missing required fields`);
      errors++;
      continue;
    }

    try {
      await prisma.incident.upsert({
        where: { incTicket },
        update: {},
        create: {
          incTicket,
          datum: parseDate(datumStr),
          postcodeHuisnr,
          klantnummer,
          casenummer: casenummer || null,
          goCareTicket: goCareTicket || null,
          onderwerp,
          aangemaaktDoor,
          segment: segment || null,
          solved: solvedStr ? parseSolved(solvedStr) : false,
          st: st || null,
          opmerkingen: opmerkingen || null,
          voorgaandTicket: voorgaandTicket || null,
        },
      });
      added++;
    } catch (e: any) {
      console.error(`Error on ${incTicket}: ${e.message}`);
      errors++;
    }
  }

  const total = await prisma.incident.count();
  return { added, skipped, errors, total };
}

// Run directly: npx tsx --env-file=.env prisma/seed-csv.ts [path-to-csv]
async function main() {
  const csvPath = process.argv[2] || "/home/hilmi/.nanobot/media/BQACAgQAAxkBAAIH";
  const result = await seedFromCsv(csvPath);
  console.log(`\nSummary: ${result.added} added, ${result.skipped} skipped, ${result.errors} errors`);
  console.log(`Total incidents in DB: ${result.total}`);
}

if (require.main === module || import.meta.url === `file://${process.argv[1]}`) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
