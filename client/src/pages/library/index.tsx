/**
 * EduPulse — Library Page
 * Works with the existing libgen.ts (searchLibgen + getDownloadLink)
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";

type Topic = "nonfiction" | "fiction" | "articles" | "magazines" | "comics" | "standards";

const TOPIC_LABELS: Record<Topic, string> = {
  nonfiction: "📚 Non-Fiction",
  fiction: "📖 Fiction",
  articles: "📄 Articles",
  magazines: "📰 Magazines",
  comics: "🎨 Comics",
  standards: "📐 Standards",
};

const EXT_COLORS: Record<string, string> = {
  pdf:  "bg-red-100 text-red-700",
  epub: "bg-green-100 text-green-700",
  djvu: "bg-yellow-100 text-yellow-700",
  mobi: "bg-blue-100 text-blue-700",
};

function ExtBadge({ ext }: { ext: string }) {
  const cls = EXT_COLORS[ext?.toLowerCase()] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}>
      {ext || "?"}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 h-3 w-3/4 rounded bg-gray-200" />
      <div className="mb-2 h-3 w-1/2 rounded bg-gray-200" />
      <div className="h-3 w-1/3 rounded bg-gray-200" />
    </div>
  );
}

function DownloadButton({ md5, title }: { md5: string; title: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const downloadMutation = trpc.library.downloadLink.useMutation({
    onSuccess(data) {
      setState("done");
      window.open(data.url, "_blank", "noopener,noreferrer");
    },
    onError(err) {
      setState("error");
      setErrorMsg(err.message);
    },
  });

  if (state === "error") {
    return (
      <div className="text-xs text-red-500">
        {errorMsg || "Download failed."}{" "}
        <button className="underline" onClick={() => setState("idle")}>Retry</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => { setState("loading"); downloadMutation.mutate({ md5, title }); }}
      disabled={state === "loading"}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition
        ${state === "done"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
        }`}
    >
      {state === "loading" && (
        <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      {state === "done" ? "✓ Opened" : state === "loading" ? "Resolving…" : "⬇ Download"}
    </button>
  );
}

function BookCard({ book }: { book: { md5: string; title: string; author: string; year: string; publisher: string; language: string; extension: string; size: string; topic: string; coverUrl?: string } }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex gap-3 p-4">
        <div className="flex-shrink-0">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="h-20 w-14 rounded object-cover shadow"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          ) : (
            <div className="flex h-20 w-14 items-center justify-center rounded bg-indigo-50 text-2xl shadow">📘</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-semibold text-gray-900 leading-snug">{book.title}</h3>
          <p className="mt-0.5 text-sm text-gray-500 truncate">
            {book.author}{book.year ? ` · ${book.year}` : ""}
          </p>
          {book.publisher && (
            <p className="text-xs text-gray-400 truncate">{book.publisher}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <ExtBadge ext={book.extension} />
            {book.size && <span className="text-xs text-gray-400">{book.size}</span>}
            {book.language && book.language.toLowerCase() !== "english" && (
              <span className="rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-medium text-purple-600">
                {book.language}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end border-t border-gray-50 px-4 py-2.5">
        <DownloadButton md5={book.md5} title={book.title} />
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(["nonfiction", "fiction", "articles"]);
  const [page, setPage] = useState(1);

  const searchQuery = trpc.library.search.useQuery(
    { query: submittedQuery, topics: selectedTopics, page },
    { enabled: submittedQuery.trim().length >= 2, staleTime: 60_000, keepPreviousData: true }
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setPage(1);
    setSubmittedQuery(q);
  }

  function toggleTopic(topic: Topic) {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.length > 1 ? prev.filter(t => t !== topic) : prev
        : [...prev, topic]
    );
  }

  const hasResults = (searchQuery.data?.results?.length ?? 0) > 0;
  const isSearching = searchQuery.isFetching;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white px-4 py-6 shadow-sm">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900">📚 Library</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search and download books, papers and articles from Library Genesis.
          </p>
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, author, ISBN…"
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
            <button
              type="submit"
              disabled={query.trim().length < 2 || isSearching}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {isSearching ? "Searching…" : "Search"}
            </button>
          </form>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {(Object.entries(TOPIC_LABELS) as [Topic, string][]).map(([topic, label]) => (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition
                  ${selectedTopics.includes(topic)
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-500 border border-gray-200 hover:border-indigo-300"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6">
        {!submittedQuery && (
          <div className="py-16 text-center">
            <div className="text-5xl">🔍</div>
            <p className="mt-4 text-gray-500">Search for textbooks, research papers, novels, and more.</p>
            <p className="mt-1 text-sm text-gray-400">Powered by Library Genesis open-access catalog.</p>
          </div>
        )}

        {isSearching && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {searchQuery.isError && !isSearching && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {searchQuery.error.message}
          </div>
        )}

        {!isSearching && submittedQuery && !hasResults && !searchQuery.isError && (
          <div className="py-16 text-center">
            <div className="text-4xl">📭</div>
            <p className="mt-4 font-medium text-gray-700">No results for "{submittedQuery}"</p>
            <p className="mt-1 text-sm text-gray-400">Try different keywords or add more topic filters.</p>
          </div>
        )}

        {!isSearching && hasResults && (
          <>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {searchQuery.data!.totalFiles.toLocaleString()} results · page {page}
              </p>
            </div>
            <div className="space-y-3">
              {searchQuery.data!.results.map(book => (
                <BookCard key={book.md5} book={book} />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-500">Page {page}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!searchQuery.data?.hasMore}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
