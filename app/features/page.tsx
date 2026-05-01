"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../layout";

type FeatureRequest = {
  id: number;
  title: string;
  description: string;
  status: string;
  upvotes: number;
  createdBy: string;
  _count: { comments: number };
  createdAt: string;
};

export default function FeaturesPage() {
  const { user } = useUser();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeatures();
  }, []);

  async function fetchFeatures() {
    try {
      const res = await fetch("/api/features");
      const data = await res.json();
      if (Array.isArray(data)) {
        setFeatures(data);
      } else {
        setFeatures([]);
        console.error("API did not return an array:", data);
      }
    } catch (error) {
      console.error("Error fetching features:", error);
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          createdBy: user || "Anoniem" 
        }),
      });
      if (res.ok) {
        setTitle("");
        setDescription("");
        setShowForm(false);
        fetchFeatures();
      }
    } catch (error) {
      console.error("Error creating feature:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpvote(id: number, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch(`/api/features/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upvotes: 1 }),
      });
      if (res.ok) {
        setFeatures(features.map(f => f.id === id ? { ...f, upvotes: f.upvotes + 1 } : f));
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400";
      case "in_progress": return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400";
      case "planned": return "bg-[#EEF7F6] text-[#2F9A92] border-[#2F9A92]/20 dark:bg-zinc-800/50 dark:text-zinc-300";
      default: return "bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-400";
    }
  };

  return (
    <div className="min-h-full bg-[#EEF3FF] dark:bg-zinc-950 p-8 space-y-8 text-zinc-950 dark:text-zinc-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Feature Requests</h1>
          <p className="text-sm font-bold text-[#2C72FF] uppercase tracking-wide mt-1">Help ons het dashboard te verbeteren</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 text-sm font-black bg-[#2C72FF] text-white rounded-xl hover:bg-[#245ccc] transition-all shadow-lg shadow-[#2C72FF]/20"
        >
          {showForm ? "Annuleren" : "Nieuw Verzoek"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-8 shadow-sm border border-zinc-100 dark:border-zinc-800 max-w-2xl mx-auto">
          <h2 className="text-xl font-black mb-6">Wat heb je nodig?</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Titel</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Bijv. Mobiele app support"
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#2C72FF]"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Beschrijving</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Leg uit waarom deze feature handig is..."
                rows={4}
                className="w-full px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-[#2C72FF]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 text-sm font-black bg-[#2F9A92] text-zinc-950 rounded-xl hover:bg-[#23756f] transition-all shadow-lg shadow-[#2F9A92]/20 disabled:opacity-50"
            >
              {submitting ? "Bezig met indienen..." : "Verzoek indienen"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-[#2C72FF]" />
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Laden...</p>
        </div>
      ) : features.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[28px] p-16 text-center shadow-sm border border-zinc-100 dark:border-zinc-800">
          <div className="text-4xl mb-4">💡</div>
          <h3 className="text-lg font-black tracking-tight mb-1">Geen verzoeken</h3>
          <p className="text-zinc-500 text-sm">Wees de eerste die een idee indient!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link 
              key={feature.id} 
              href={`/features/${feature.id}`}
              className="group bg-white dark:bg-zinc-900 rounded-[28px] p-6 shadow-sm border border-zinc-100 dark:border-zinc-800 hover:border-[#2C72FF] transition-all flex flex-col"
            >
              <div className="flex justify-between items-start gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(feature.status)}`}>
                  {feature.status.replace("_", " ")}
                </span>
                <button
                  onClick={(e) => handleUpvote(feature.id, e)}
                  className="flex flex-col items-center p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 group-hover:bg-[#EEF3FF] dark:group-hover:bg-[#2C72FF]/10 transition-colors border border-zinc-100 dark:border-zinc-700 group-hover:border-[#2C72FF]/20"
                >
                  <span className="text-xs">🔼</span>
                  <span className="text-xs font-black text-[#2C72FF]">{feature.upvotes}</span>
                </button>
              </div>
              <h3 className="text-lg font-black tracking-tight mb-2 group-hover:text-[#2C72FF] transition-colors">{feature.title}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-6 flex-1 italic">
                "{feature.description}"
              </p>
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2C72FF] to-[#2F9A92] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {feature.createdBy.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-zinc-400">{feature.createdBy}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <span className="text-xs">💬</span>
                  <span className="text-xs font-bold">{feature._count.comments}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
