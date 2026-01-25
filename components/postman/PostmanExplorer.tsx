"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const BASE_URL = "https://personal-site-ten-delta-48.vercel.app";

type BlogSummary = {
  slug: string;
  title?: string;
};

type ProjectSummary = {
  id: string;
  name?: string;
};

type EndpointConfig = {
  key: string;
  label: string;
  description: string;
  path: string;
  paramKey?: "slug" | "id";
};

const ENDPOINTS: EndpointConfig[] = [
  {
    key: "health",
    label: "Health",
    description: "Basic uptime check.",
    path: "/api/health",
  },
  {
    key: "blogs",
    label: "Blogs",
    description: "List all blog metadata.",
    path: "/api/blogs",
  },
  {
    key: "blogBySlug",
    label: "Blog by Slug",
    description: "Fetch a single blog post by slug.",
    path: "/api/blogs/{slug}",
    paramKey: "slug",
  },
  {
    key: "projects",
    label: "Projects",
    description: "List all project summaries.",
    path: "/api/projects",
  },
  {
    key: "projectById",
    label: "Project by ID",
    description: "Fetch a single project by id.",
    path: "/api/projects/{id}",
    paramKey: "id",
  },
];

type ExplorerResponse = {
  status?: number;
  durationMs?: number;
  body?: string;
  error?: string;
};

export default function PostmanExplorer() {
  const [blogs, setBlogs] = useState<BlogSummary[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [selectedEndpointKey, setSelectedEndpointKey] = useState(ENDPOINTS[0].key);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  const [response, setResponse] = useState<ExplorerResponse>({});
  const [isRunning, setIsRunning] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoadingData(true);
      setDataError(null);
      try {
        const [blogsRes, projectsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/blogs`),
          fetch(`${BASE_URL}/api/projects`),
        ]);

        if (!blogsRes.ok || !projectsRes.ok) {
          throw new Error("Unable to load sample data.");
        }

        const blogsJson = await blogsRes.json();
        const projectsJson = await projectsRes.json();

        if (!isMounted) return;

        const blogData = Array.isArray(blogsJson?.data) ? blogsJson.data : [];
        const projectData = Array.isArray(projectsJson?.data) ? projectsJson.data : [];

        setBlogs(blogData);
        setProjects(projectData);
        setSelectedSlug(blogData[0]?.slug ?? "");
        setSelectedProjectId(projectData[0]?.id ?? "");
      } catch (error) {
        if (!isMounted) return;
        setDataError("Sample data could not be loaded. Try refreshing the page.");
      } finally {
        if (!isMounted) return;
        setIsLoadingData(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedEndpoint = ENDPOINTS.find((endpoint) => endpoint.key === selectedEndpointKey) ?? ENDPOINTS[0];

  const sampleSlug = blogs[0]?.slug ?? "sample-slug";
  const sampleProjectId = projects[0]?.id ?? "sample-id";

  const curlExamples = useMemo(
    () => [
      {
        key: "health",
        label: "Health",
        command: `curl -s ${BASE_URL}/api/health`,
      },
      {
        key: "blogs",
        label: "Blogs",
        command: `curl -s ${BASE_URL}/api/blogs`,
      },
      {
        key: "projects",
        label: "Projects",
        command: `curl -s ${BASE_URL}/api/projects`,
      },
      {
        key: "blogBySlug",
        label: "Blog by Slug",
        command: `curl -s ${BASE_URL}/api/blogs/${sampleSlug}`,
      },
      {
        key: "projectById",
        label: "Project by ID",
        command: `curl -s ${BASE_URL}/api/projects/${sampleProjectId}`,
      },
    ],
    [sampleSlug, sampleProjectId]
  );

  const buildUrl = () => {
    if (selectedEndpoint.paramKey === "slug") {
      return `${BASE_URL}/api/blogs/${selectedSlug || sampleSlug}`;
    }
    if (selectedEndpoint.paramKey === "id") {
      return `${BASE_URL}/api/projects/${selectedProjectId || sampleProjectId}`;
    }
    return `${BASE_URL}${selectedEndpoint.path}`;
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      setCopiedKey(null);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResponse({});

    const url = buildUrl();

    try {
      const start = performance.now();
      const res = await fetch(url);
      const durationMs = Math.round(performance.now() - start);
      const text = await res.text();
      let body = text;
      try {
        const parsed = JSON.parse(text);
        body = JSON.stringify(parsed, null, 2);
      } catch (error) {
        body = text || "(empty response)";
      }

      setResponse({
        status: res.status,
        durationMs,
        body,
      });
    } catch (error) {
      setResponse({
        error: "Request failed. Please check your connection and try again.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">cURL Examples</h2>
            <p className="text-sm text-slate-600">
              Copy/paste-friendly commands using the live API.
            </p>
          </div>
          {isLoadingData ? (
            <span className="text-xs text-slate-400">Loading sample data…</span>
          ) : dataError ? (
            <span className="text-xs text-rose-500">{dataError}</span>
          ) : (
            <span className="text-xs text-emerald-600">Samples loaded</span>
          )}
        </div>
        <div className="space-y-4">
          {curlExamples.map((example) => (
            <div
              key={example.key}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700">{example.label}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => handleCopy(example.command, `curl-${example.key}`)}
                >
                  {copiedKey === `curl-${example.key}` ? "Copied" : "Copy"}
                </Button>
              </div>
              <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 px-4 py-3 text-xs text-slate-100">
                <code>{example.command}</code>
              </pre>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">API Explorer</h2>
            <p className="text-sm text-slate-600">
              Select an endpoint, run the request, and inspect the live response.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => handleCopy(`curl -s ${buildUrl()}`, "explorer-curl")}
          >
            {copiedKey === "explorer-curl" ? "Copied" : "Copy curl"}
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700">Endpoint</label>
            <div className="grid gap-2">
              {ENDPOINTS.map((endpoint) => (
                <button
                  key={endpoint.key}
                  type="button"
                  onClick={() => setSelectedEndpointKey(endpoint.key)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    endpoint.key === selectedEndpointKey
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold">{endpoint.label}</p>
                  <p className={`text-xs ${endpoint.key === selectedEndpointKey ? "text-slate-200" : "text-slate-500"}`}>
                    {endpoint.path}
                  </p>
                  <p className={`text-xs mt-1 ${endpoint.key === selectedEndpointKey ? "text-slate-200" : "text-slate-400"}`}>
                    {endpoint.description}
                  </p>
                </button>
              ))}
            </div>

            {selectedEndpoint.paramKey === "slug" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Slug</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  value={selectedSlug || sampleSlug}
                  onChange={(event) => setSelectedSlug(event.target.value)}
                >
                  {blogs.length === 0 ? (
                    <option value={sampleSlug}>{sampleSlug}</option>
                  ) : (
                    blogs.map((blog) => (
                      <option key={blog.slug} value={blog.slug}>
                        {blog.slug}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            {selectedEndpoint.paramKey === "id" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Project ID</label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  value={selectedProjectId || sampleProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                >
                  {projects.length === 0 ? (
                    <option value={sampleProjectId}>{sampleProjectId}</option>
                  ) : (
                    projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.id}
                      </option>
                    ))
                  )}
                </select>
              </div>
            )}

            <Button
              type="button"
              className="rounded-full"
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? "Running…" : "Run Request"}
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950/95 px-4 py-4 text-slate-100">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
              <span>GET {buildUrl()}</span>
              {response.status ? (
                <span>
                  Status {response.status} · {response.durationMs}ms
                </span>
              ) : (
                <span>Awaiting request</span>
              )}
            </div>
            <div className="mt-4 text-xs whitespace-pre-wrap">
              {response.error ? (
                <p className="text-rose-300">{response.error}</p>
              ) : response.body ? (
                <pre className="whitespace-pre-wrap break-words">{response.body}</pre>
              ) : (
                <p className="text-slate-400">Run a request to see the response here.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
