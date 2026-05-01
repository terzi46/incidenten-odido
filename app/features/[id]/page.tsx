"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "../../layout";

type Comment = {
  id: number;
  content: string;
  createdBy: string;
  createdAt: string;
};

type FeatureRequest = {
  id: number;
  title: string;
  description: string;
  status: string;
  upvotes: number;
  createdBy: string;
  comments: Comment[];
  createdAt: string;
};

export default function FeatureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const router = useRouter();
  const [feature, setFeature] = useState<FeatureRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeature();
  }, [id]);

  async function fetchFeature() {
    try {
      const res = await fetch(`/api/features/${id}`);
      if (!res.ok) throw new Error("Feature not found");
      const data = await res.json();
      setFeature(data);
    } catch (error) {
      console.error("Error fetching feature:", error);
      router.push("/features");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpvote() {
    if (!feature) return;
    try {
      const res = await fetch(`/api/features/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ upvotes: 1 }),
      });
      if (res.ok) {
        setFeature({ ...feature, upvotes: feature.upvotes + 1 });
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentContent) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/features/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content: commentContent, 
          createdBy: user || "Anoniem" 
        }),
      });
      if (res.ok) {
        setCommentContent("");
        fetchFeature();
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center bg-[#EEF3FF] dark:bg-zinc-950 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-zinc-200 border-t-[#2C72FF]" />
        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Laden...</p>
      </div>
    );
  }

  if (!feature) return null;

  return (
    <div className="min-h-full bg-[#EEF3FF] dark:bg-zinc-950 p-8 text-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-3xl space-y-8">
        <button 
          onClick={() => router.push("/features")} 
          className="group flex items-center gap-2 text-sm font-bold text-[#2C72FF] hover:text-[#245ccc] mb-8 transition-colors"
        >
          <span className="text-lg transition-transform group-hover:-translate-x-1">←</span> 
          Terug naar overzicht
        </button>

        <div className="bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-sm border border-zinc-100 dark:border-zinc-800">
          <header className="relative bg-zinc-950 p-8 text-white overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[#2C72FF] via-[#2F9A92] to-[#FFAC24]" />
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFAC24] mb-1">Feature Request</p>
                <h1 className="text-3xl font-black tracking-tight">{feature.title}</h1>
              </div>
              <button
                onClick={handleUpvote}
                className="flex flex-col items-center px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10"
              >
                <span className="text-sm">🔼</span>
                <span className="text-sm font-black text-[#FFAC24]">{feature.upvotes}</span>
              </button>
            </div>
          </header>

          <div className="p-8 space-y-8">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 italic text-zinc-700 dark:text-zinc-300">
              "{feature.description}"
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">
              <span>Door {feature.createdBy}</span>
              <span>•</span>
              <span>{new Date(feature.createdAt).toLocaleDateString("nl-NL")}</span>
              <span>•</span>
              <span className={`px-2 py-0.5 rounded-full border ${
                feature.status === 'completed' ? 'border-green-500/20 text-green-500' : 'border-[#2C72FF]/20 text-[#2C72FF]'
              }`}>{feature.status.replace("_", " ")}</span>
            </div>

            <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black tracking-tight">Discussie ({feature.comments.length})</h2>
                {user && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-[#EEF3FF] dark:bg-[#2C72FF]/10 rounded-full border border-[#2C72FF]/20">
                    <div className="w-2 h-2 rounded-full bg-[#2C72FF] animate-pulse" />
                    <span className="text-[10px] font-black text-[#2C72FF] uppercase tracking-wider">Je reageert als {user}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-8 mb-12">
                {feature.comments.map((comment) => {
                  const isMe = user === comment.createdBy;
                  return (
                    <div key={comment.id} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white uppercase shrink-0 shadow-lg ${
                        isMe ? 'bg-gradient-to-br from-[#2C72FF] to-[#578FFF]' : 'bg-gradient-to-br from-zinc-400 to-zinc-600'
                      }`}>
                        {comment.createdBy.charAt(0)}
                      </div>
                      <div className={`max-w-[80%] space-y-1 ${isMe ? 'items-end' : ''}`}>
                        <div className={`flex items-center gap-2 px-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <span className="text-xs font-black text-zinc-900 dark:text-white">{comment.createdBy}</span>
                          <span className="text-[10px] font-bold text-zinc-400">{new Date(comment.createdAt).toLocaleDateString("nl-NL")}</span>
                        </div>
                        <div className={`p-4 rounded-3xl border shadow-sm ${
                          isMe 
                            ? 'bg-[#2C72FF] text-white border-[#2C72FF] rounded-tr-none' 
                            : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-100 dark:border-zinc-700 rounded-tl-none'
                        }`}>
                          <p className="text-sm leading-relaxed">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSubmitComment} className="relative">
                <div className="absolute -top-3 left-6 px-2 bg-white dark:bg-zinc-900 text-[10px] font-black text-[#2C72FF] uppercase tracking-widest z-10">
                  Nieuwe reactie
                </div>
                <div className="bg-white dark:bg-zinc-800/50 p-6 rounded-[32px] border-2 border-[#2C72FF]/20 focus-within:border-[#2C72FF]/50 transition-all space-y-4 shadow-inner">
                  <div className="flex gap-4">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Deel je gedachten over dit voorstel..."
                      className="flex-1 px-4 py-3 text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2C72FF]/10 transition-all min-h-[100px] resize-none"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-8 py-3 text-sm font-black bg-[#2C72FF] text-white rounded-2xl hover:bg-[#245ccc] transition-all shadow-lg shadow-[#2C72FF]/20 disabled:opacity-50 flex items-center gap-2"
                    >
                      {submitting ? "Bezig..." : "Reactie plaatsen"}
                      <span>🚀</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
