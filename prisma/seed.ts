import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const incidents = [
  {
    incTicket: "INC0860559",
    datum: new Date("2026-02-04"),
    postcodeHuisnr: "6524 LM 7",
    klantnummer: "XAB64795",
    casenummer: "81944289",
    goCareTicket: "T2603847712",
    onderwerp: "TV - Happeren/wegvallend geluid mediabox",
    aangemaaktDoor: "Terence Girrel",
    segment: "TV",
    solved: false,
    st: null,
    opmerkingen: null,
    voorgaandTicket: null,
  },
  {
    incTicket: "INC0860560",
    datum: new Date("2026-02-04"),
    postcodeHuisnr: "3033 XG 1",
    klantnummer: "XAB64800",
    casenummer: "81944300",
    goCareTicket: "T2603847713",
    onderwerp: "Internet - Geen verbinding",
    aangemaaktDoor: "Fatima Al-Jamil",
    segment: "Internet",
    solved: true,
    st: "Opgelost na reset modem",
    opmerkingen: "Klant had modem 30 min losgekoppeld, daarna werkte het weer",
    voorgaandTicket: null,
  },
  {
    incTicket: "INC0860561",
    datum: new Date("2026-02-05"),
    postcodeHuisnr: "5611 AB 12",
    klantnummer: "XAB64801",
    casenummer: null,
    goCareTicket: null,
    onderwerp: "Bellen - Geen kiestoon",
    aangemaaktDoor: "Mark de Vries",
    segment: "Telefonie",
    solved: false,
    st: "Doorverwezen naar monteur",
    opmerkingen: "Monteur ingepland voor 07-02",
    voorgaandTicket: "INC0860540",
  },
  {
    incTicket: "INC0860562",
    datum: new Date("2026-02-05"),
    postcodeHuisnr: "1071 XX 5",
    klantnummer: "XAB64802",
    casenummer: "81944301",
    goCareTicket: "T2603847714",
    onderwerp: "TV - Geen beeld, wel geluid",
    aangemaaktDoor: "Lisa van den Berg",
    segment: "TV",
    solved: false,
    st: null,
    opmerkingen: "Signaalsterkte lijkt oké, mogelijk decoder defect",
    voorgaandTicket: null,
  },
  {
    incTicket: "INC0860563",
    datum: new Date("2026-02-06"),
    postcodeHuisnr: "9712 CD 3",
    klantnummer: "XAB64803",
    casenummer: "81944302",
    goCareTicket: "T2603847715",
    onderwerp: "Internet - Trage verbinding 's avonds",
    aangemaaktDoor: "Ahmed Othman",
    segment: "Internet",
    solved: true,
    st: "Kanaal gewijzigd naar 5GHz",
    opmerkingen: "Klant zat op 2.4GHz met veel interferentie, overgezet naar 5GHz",
    voorgaandTicket: "INC0860550",
  },
  {
    incTicket: "INC0860564",
    datum: new Date("2026-02-06"),
    postcodeHuisnr: "3521 ER 8",
    klantnummer: "XAB64804",
    casenummer: null,
    goCareTicket: null,
    onderwerp: "TV - Zenders ontbreken",
    aangemaaktDoor: "Sandra Jansen",
    segment: "TV",
    solved: false,
    st: "Zenderpakket gecontroleerd",
    opmerkingen: "Klant mist HD-zenders, abonnement blijkt alleen SD",
    voorgaandTicket: null,
  },
  {
    incTicket: "INC0860565",
    datum: new Date("2026-02-07"),
    postcodeHuisnr: "2511 JK 15",
    klantnummer: "XAB64805",
    casenummer: "81944303",
    goCareTicket: "T2603847716",
    onderwerp: "Bellen - Kwaliteit slecht",
    aangemaaktDoor: "Peter van der Linden",
    segment: "Telefonie",
    solved: false,
    st: null,
    opmerkingen: "Krakerig geluid, monteur ingepland",
    voorgaandTicket: "INC0860545",
  },
  {
    incTicket: "INC0860566",
    datum: new Date("2026-02-07"),
    postcodeHuisnr: "4811 AA 22",
    klantnummer: "XAB64806",
    casenummer: "81944304",
    goCareTicket: "T2603847717",
    onderwerp: "Internet - Wifi valt steeds weg",
    aangemaaktDoor: "Fatima Al-Jamil",
    segment: "Internet",
    solved: true,
    st: "Firmware update uitgevoerd",
    opmerkingen: "Modem firmware bijgewerkt naar v2.4.1, probleem verholpen",
    voorgaandTicket: null,
  },
  {
    incTicket: "INC0860567",
    datum: new Date("2026-02-08"),
    postcodeHuisnr: "6541 LM 9",
    klantnummer: "XAB64807",
    casenummer: null,
    goCareTicket: null,
    onderwerp: "TV - Mediabox reageert niet",
    aangemaaktDoor: "Terence Girrel",
    segment: "TV",
    solved: false,
    st: "Reset geprobeerd",
    opmerkingen: "Mediabox blijft hangen op opstartscherm, nieuwe box verstuurd",
    voorgaandTicket: "INC0860555",
  },
  {
    incTicket: "INC0860568",
    datum: new Date("2026-02-08"),
    postcodeHuisnr: "1012 WX 4",
    klantnummer: "XAB64808",
    casenummer: "81944305",
    goCareTicket: "T2603847718",
    onderwerp: "Internet - Geen internet na verhuizing",
    aangemaaktDoor: "Mark de Vries",
    segment: "Internet",
    solved: false,
    st: "Aansluiting gecontroleerd",
    opmerkingen: "Verhuizing niet doorgegeven aan Odido, aansluiting nog niet actief",
    voorgaandTicket: null,
  },
];

async function main() {
  console.log(`Seeding ${incidents.length} incidents...`);

  for (const incident of incidents) {
    await prisma.incident.upsert({
      where: { incTicket: incident.incTicket },
      update: incident,
      create: incident,
    });
  }

  const count = await prisma.incident.count();
  console.log(`Done! ${count} incidents in database.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
