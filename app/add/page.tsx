"use client";

import Link from "next/link";
import { useUser } from "../layout";
import { createIncident } from "./actions";
import { SubjectSimilarity } from "./subject-similarity";
import { useState, useEffect } from "react";

export default function AddIncidentPage() {
  const { user } = useUser();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (user) setUserName(user);
  }, [user]);

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-950 shadow-sm outline-none transition focus:border-[#578FFF] focus:ring-4 focus:ring-[#578FFF]/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white";
  const labelClass =
    "mb-2 block text-sm font-semibold text-zinc-800 dark:text-zinc-200";
  const sectionClass =
    "border-b border-zinc-200 px-6 py-7 dark:border-zinc-800 md:px-8";

  return (
    <div className="min-h-full bg-[#EEF3FF] p-6 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <header className="relative overflow-hidden bg-black px-6 py-8 text-white md:px-8">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-[#2C72FF] via-[#2F9A92] to-[#FFAC24]" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-wide text-[#FFAC24]">
              Nieuw Incident
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Registreren
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-300">
              Vul alle details in om het incident vast te leggen. We zoeken
              automatisch naar gelijkaardige meldingen om dubbel werk te
              voorkomen.
            </p>
          </div>
        </header>

        <form action={createIncident}>
          <div className={sectionClass}>
            <p className="text-sm font-bold uppercase tracking-wide text-[#2C72FF]">
              Basis informatie
            </p>
            <h2 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">
              Ticket Details
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass}>INC Ticket</label>
                <input
                  name="incTicket"
                  className={inputClass}
                  placeholder="Bijv. INC0000123"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Datum (DD.MM.YY)</label>
                <input
                  name="datum"
                  className={inputClass}
                  defaultValue={new Date().toLocaleDateString("nl-NL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Aangemaakt door</label>
                <input
                  name="aangemaaktDoor"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <p className="text-sm font-bold uppercase tracking-wide text-[#2F9A92]">
              Klant informatie
            </p>
            <h2 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">
              Identificatie
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass}>Postcode + huisnr</label>
                <input
                  name="postcodeHuisnr"
                  className={inputClass}
                  placeholder="Bijv. 1234AB 12"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Klantnummer</label>
                <input
                  name="klantnummer"
                  className={inputClass}
                  placeholder="Klantnummer"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Segment</label>
                <select name="segment" className={inputClass}>
                  <option value="">Kies segment...</option>
                  <option value="TV">TV</option>
                  <option value="Internet">Internet</option>
                  <option value="NT">NT</option>
                  <option value="Telefonie">Telefonie</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <SubjectSimilarity />
            </div>
          </div>

          <div className={sectionClass}>
            <p className="text-sm font-bold uppercase tracking-wide text-[#FFAC24]">
              Interne systemen
            </p>
            <h2 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">
              Referenties
            </h2>

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass}>Casenummer</label>
                <input
                  name="casenummer"
                  className={inputClass}
                  placeholder="Casenummer"
                />
              </div>
              <div>
                <label className={labelClass}>GoCare Ticket</label>
                <input
                  name="goCareTicket"
                  className={inputClass}
                  placeholder="GoCare"
                />
              </div>
              <div>
                <label className={labelClass}>ST</label>
                <input name="st" className={inputClass} placeholder="ST" />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <p className="text-sm font-bold uppercase tracking-wide text-[#FF7621]">
              Inhoudelijk
            </p>
            <h2 className="mt-1 text-2xl font-black text-zinc-950 dark:text-white">
              Toelichting
            </h2>

            <div className="mt-8 space-y-6">
              <div>
                <label className={labelClass}>Voorgaand ticket</label>
                <input
                  name="voorgaandTicket"
                  className={inputClass}
                  placeholder="Eventueel vorig ticketnummer"
                />
              </div>
              <div>
                <label className={labelClass}>Opmerkingen</label>
                <textarea
                  name="opmerkingen"
                  className={`${inputClass} min-h-[120px]`}
                  placeholder="Aanvullende details..."
                />
              </div>
            </div>
          </div>

          <section className="border-t border-[#ADC8FF] bg-[#EEF3FF] px-6 py-6 text-zinc-950 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white md:px-8">
            <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[#AED8D5] bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-950 xl:min-w-96">
                <div className="flex-1">
                  <span className="block text-base font-bold">Opgelost</span>
                  <span className="mt-1 block text-sm text-zinc-600 dark:text-zinc-300">
                    Is dit incident direct afgehandeld?
                  </span>
                </div>
                <input
                  type="checkbox"
                  name="solved"
                  value="true"
                  className="h-5 w-5 rounded border-white/30 accent-[#2F9A92]"
                />
              </label>

              <div className="flex w-full items-center gap-4 md:w-auto">
                <button
                  type="submit"
                  className="rounded-xl bg-[#578FFF] px-6 py-3 text-base font-black text-zinc-950 transition-colors hover:bg-[#82ACFF] focus:outline-none focus:ring-4 focus:ring-[#578FFF]/30"
                >
                  Incident Opslaan
                </button>
                <Link
                  href="/"
                  className="rounded-xl border border-zinc-300 bg-white px-6 py-3 text-center text-base font-bold text-zinc-800 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
                >
                  Annuleren
                </Link>
              </div>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
