import { prisma } from "./lib/prisma";

async function getData() {
  const total = await prisma.incident.count();
  const solved = await prisma.incident.count({ where: { solved: true } });
  const unsolved = await prisma.incident.count({ where: { solved: false } });

  const segmentCounts = await prisma.incident.groupBy({
    by: ["segment"],
    _count: true,
    orderBy: { _count: { segment: "desc" } },
  });

  const recent = await prisma.incident.findMany({
    orderBy: { datum: "desc" },
    take: 10,
  });

  return { total, solved, unsolved, segmentCounts, recent };
}

export default async function Home() {
  const data = await getData();

  return (
    <div className="p-6 bg-zinc-50 min-h-full">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
        <p className="text-sm text-zinc-500">Overzicht van alle incidenten</p>
      </header>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Totaal</p>
          <p className="text-3xl font-bold text-zinc-900 mt-1">{data.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Opgelost</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{data.solved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Open</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{data.unsolved}</p>
        </div>
      </div>

      {/* Segment breakdown */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-zinc-200 mb-6">
        <h2 className="text-sm font-semibold text-zinc-700 mb-3">Per Segment</h2>
        <div className="flex gap-2 flex-wrap">
          {data.segmentCounts.map((s) => (
            <span
              key={s.segment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 text-sm text-zinc-700"
            >
              {s.segment || "Onbekend"}
              <span className="font-semibold">{s._count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Recent incidents table */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-zinc-700 p-4 border-b border-zinc-100">
          Recente Incidenten
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 text-left text-xs text-zinc-500 uppercase tracking-wide">
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">Datum</th>
                <th className="px-4 py-3 font-medium">Postcode</th>
                <th className="px-4 py-3 font-medium">Klantnr</th>
                <th className="px-4 py-3 font-medium">Casenummer</th>
                <th className="px-4 py-3 font-medium">GoCare</th>
                <th className="px-4 py-3 font-medium">Onderwerp</th>
                <th className="px-4 py-3 font-medium">Segment</th>
                <th className="px-4 py-3 font-medium">Door</th>
                <th className="px-4 py-3 font-medium">ST</th>
                <th className="px-4 py-3 font-medium">Opmerkingen</th>
                <th className="px-4 py-3 font-medium">Voorgaand</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((inc) => (
                <tr key={inc.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600 whitespace-nowrap">
                    {inc.incTicket}
                  </td>
                  <td className="px-4 py-3 text-zinc-700 whitespace-nowrap">
                    {inc.datum.toLocaleDateString("nl-NL")}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{inc.postcodeHuisnr}</td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{inc.klantnummer}</td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{inc.casenummer || "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{inc.goCareTicket || "—"}</td>
                  <td className="px-4 py-3 text-zinc-700 max-w-xs whitespace-normal">
                    {inc.onderwerp}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 text-zinc-600">
                      {inc.segment || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{inc.aangemaaktDoor}</td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{inc.st || "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 max-w-[120px] truncate" title={inc.opmerkingen || ""}>
                    {inc.opmerkingen || "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{inc.voorgaandTicket || "—"}</td>
                  <td className="px-4 py-3">
                    {inc.solved ? (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        Opgelost
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        Open
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
