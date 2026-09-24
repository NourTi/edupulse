import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc"; // Adjust to your actual client-side path wrapper

type Topic = "nonfiction" | "fiction" | "articles" | "magazines" | "comics" | "standards";

const TOPIC_LABELS: Record<Topic, string> = {
  nonfiction: "📚 Non-Fiction",
  fiction: "📖 Fiction",
  articles: "📄 Articles",
  magazines: "📰 Magazines",
  comics: "🎨 Comics",
  standards: "📐 Standards",
};

export function DocumentImporter() {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [selectedTopics, setSelectedTopics] = useState<Topic[]>(["nonfiction", "fiction", "articles"]);
  const [page, setPage] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  const searchQuery = trpc.library.search.useQuery(
    { query: submittedQuery, topics: selectedTopics, page },
    {
      enabled: submittedQuery.trim().length >= 2,
      staleTime: 60_000,
      keepPreviousData: true,
    }
  );

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setPage(1);
    setSubmittedQuery(q);
  }

  function toggleTopic(topic: Topic) {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.length > 1 ? prev.filter((t) => t !== topic) : prev
        : [...prev, topic]
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 max-w-3xl mx-auto mt-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">📚 Lesson Material Library</h2>
        <p className="text-xs text-gray-500 mt-1">
          Search and download research papers, textbooks, and resources instantly via federated open-access catalogs.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(setTargetValue(e))}
          placeholder="Search by title, author, topic, or ISBN..."
          className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(Object.entries(TOPIC_LABELS) as [Topic, string][]).map(([topic, label]) => (
          <button
            key={topic}
            onClick={() => toggleTopic(topic)}
            className={`rounded-full px-3 py-0.5 text-xs font-medium transition ${
              selectedTopics.includes(topic) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* RENDER LISTINGS AREA */}
      <div className="mt-6 space-y-4">
        {searchQuery.isLoading && <p className="text-sm text-gray-500 animate-pulse">Searching catalog pools...</p>}
        
        {searchQuery.data?.results?.map((book: any) => (
          <div key={book.md5} className="p-4 border border-gray-100 rounded-xl bg-gray-50 flex justify-between items-center">
            <div className="min-w-0 flex-1 pr-4">
              <h4 className="font-semibold text-sm text-gray-900 truncate">{book.title}</h4>
              <p className="text-xs text-gray-500 truncate">{book.author} {book.year ? `(${book.year})` : ''} · <span className="uppercase text-blue-600 font-bold">{book.extension}</span></p>
            </div>
            <DownloadActionTrigger md5={book.md5} title={book.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline Trigger Action component managing target window redirects
function DownloadActionTrigger({ md5, title }: { md5: string; title: string }) {
  const [loading, setLoading] = useState(false);
  const downloadMutation = trpc.library.downloadLink.useMutation({
    onSuccess(data) {
      setLoading(false);
      window.open(data.url, "_blank", "noopener,noreferrer");
    },
    onError() {
      setLoading(false);
    }
  });

  return (
    <button
      onClick={() => { setLoading(true); downloadMutation.mutate({ md5, title }); }}
      disabled={loading}
      className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 disabled:opacity-50 flex-shrink-0"
    >
      {loading ? 'Resolving...' : '⬇ Fetch File'}
    </button>
  );
}

function setTargetValue(e: React.ChangeEvent<HTMLInputElement>): string {
  return e.target.value;
}
