import { prisma } from "../lib/prisma";
import { redirect } from "next/navigation";

async function createIncident(formData: FormData) {
  "use server";

  const raw = Object.fromEntries(formData);

  const datumStr = raw.datum as string;
  const [day, month, year] = datumStr.split(".");
  const datum = new Date(`${year}-${month}-${day}T00:00:00Z`);

  await prisma.incident.create({
    data: {
      incTicket: raw.incTicket as string,
      datum,
      postcodeHuisnr: raw.postcodeHuisnr as string,
      klantnummer: raw.klantnummer as string,
      casenummer: (raw.casenummer as string) || null,
      goCareTicket: (raw.goCareTicket as string) || null,
      onderwerp: raw.onderwerp as string,
      aangemaaktDoor: raw.aangemaaktDoor as string,
      segment: (raw.segment as string) || null,
      solved: raw.solved === "true",
      st: (raw.st as string) || null,
      opmerkingen: (raw.opmerkingen as string) || null,
      voorgaandTicket: (raw.voorgaandTicket as string) || null,
    },
  });

  redirect("/");
}

export default function AddIncidentPage() {
  return (
    <div className="p-6 bg-zinc-50 min-h-full">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Incident toevoegen</h1>
        <p className="text-sm text-zinc-500">Vul de gegevens in om een nieuw incident aan te maken</p>
      </header>

      <form action={createIncident} className="max-w-2xl space-y-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-700 border-b border-zinc-100 pb-2">
            Basisgegevens
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">INC-Ticket *</label>
              <input name="incTicket" required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Datum (DD.MM.YY) *</label>
              <input name="datum" required placeholder="23.04.26" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Postcode huisnr *</label>
              <input name="postcodeHuisnr" required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Klantnummer *</label>
              <input name="klantnummer" required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Onderwerp *</label>
            <input name="onderwerp" required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Aangemaakt door *</label>
              <input name="aangemaaktDoor" required className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Segment</label>
              <select name="segment" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">—</option>
                <option value="TV">TV</option>
                <option value="Internet">Internet</option>
                <option value="Telefonie">Telefonie</option>
                <option value="NT">NT</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-700 border-b border-zinc-100 pb-2">
            Extra gegevens
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Casenummer</label>
              <input name="casenummer" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">GoCare ticket</label>
              <input name="goCareTicket" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">ST</label>
              <input name="st" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-600 mb-1">Voorgaand ticket</label>
              <input name="voorgaandTicket" className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-600 mb-1">Opmerkingen</label>
            <textarea name="opmerkingen" rows={3} className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="solved" value="true" id="solved" className="rounded border-zinc-300" />
            <label htmlFor="solved" className="text-sm text-zinc-700">Opgelost</label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Incident aanmaken
          </button>
          <a href="/" className="px-5 py-2.5 bg-zinc-100 text-zinc-700 text-sm font-medium rounded-lg hover:bg-zinc-200 transition-colors">
            Annuleren
          </a>
        </div>
      </form>
    </div>
  );
}
