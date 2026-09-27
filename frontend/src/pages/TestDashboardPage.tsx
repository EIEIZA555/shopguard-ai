import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { aiApi, testRunsApi } from "../lib/api";

export default function TestDashboardPage() {
  const { data: runs, isLoading } = useQuery({
    queryKey: ["test-runs"],
    queryFn: testRunsApi.list,
    refetchInterval: 30000,
  });
  const [analysis, setAnalysis] = useState<{ root_cause: string; suggested_fix: string; confidence: number } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleAnalyze = async (testName: string, errorMessage: string) => {
    setAnalyzing(true);
    try {
      const result = await aiApi.analyze(testName, errorMessage);
      setAnalysis(result);
    } catch {
      setAnalysis({ root_cause: "Analysis failed", suggested_fix: "Check API configuration", confidence: 0 });
    } finally {
      setAnalyzing(false);
    }
  };

  if (isLoading) return <div data-testid="dashboard-loading">Loading test runs...</div>;

  const latestRun = runs?.[0];

  return (
    <div data-testid="test-dashboard">
      <h1 className="text-2xl font-bold mb-2">QA Test Dashboard</h1>
      <p className="text-gray-500 mb-6">Playwright E2E results with AI failure analysis</p>

      {latestRun && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Tests" value={latestRun.total_tests} />
          <StatCard label="Passed" value={latestRun.passed} color="text-green-600" />
          <StatCard label="Failed" value={latestRun.failed} color="text-red-600" />
          <StatCard label="Flaky Score" value={`${(latestRun.flaky_score * 100).toFixed(0)}%`} color="text-yellow-600" />
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">Recent Test Runs</h2>
      <div className="space-y-3">
        {runs?.map((run) => (
          <div key={run.id} className="bg-white p-4 rounded-lg border" data-testid={`test-run-${run.id}`}>
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">{run.pipeline_id}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${run.status === "passed" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {run.status}
                </span>
              </div>
              <span className="text-sm text-gray-400">{new Date(run.created_at).toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {run.passed}/{run.total_tests} passed · {(run.duration_ms / 1000).toFixed(1)}s
            </p>

            {run.failures.map((f) => (
              <div key={f.id} className="mt-3 p-3 bg-red-50 rounded border border-red-100" data-testid={`failure-${f.id}`}>
                <p className="font-medium text-red-800 text-sm">{f.test_name}</p>
                <p className="text-xs text-red-600 mt-1 line-clamp-2">{f.error_message}</p>
                <button
                  onClick={() => handleAnalyze(f.test_name, f.error_message)}
                  disabled={analyzing}
                  className="mt-2 text-xs bg-brand-600 text-white px-3 py-1 rounded hover:bg-brand-700"
                  data-testid={`analyze-btn-${f.id}`}
                >
                  {analyzing ? "Analyzing..." : "AI Analyze"}
                </button>
              </div>
            ))}
          </div>
        ))}
        {!runs?.length && <p className="text-gray-400" data-testid="no-test-runs">No test runs recorded yet.</p>}
      </div>

      {analysis && (
        <div className="mt-6 bg-blue-50 border border-blue-200 p-4 rounded-lg" data-testid="ai-analysis-result">
          <h3 className="font-semibold text-blue-900 mb-2">AI Analysis Result</h3>
          <p className="text-sm"><strong>Root Cause:</strong> {analysis.root_cause}</p>
          <p className="text-sm mt-2"><strong>Suggested Fix:</strong> {analysis.suggested_fix}</p>
          <p className="text-xs text-gray-500 mt-2">Confidence: {(analysis.confidence * 100).toFixed(0)}%</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color = "text-gray-900" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-white p-4 rounded-lg border text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}
