"""AI-powered test failure analyzer using RAG + Gemini."""

import json
from pathlib import Path

from app.config import settings


def _get_chroma_client():
    try:
        import chromadb

        return chromadb.HttpClient(host=settings.chroma_host, port=settings.chroma_port)
    except Exception:
        return None


def _get_gemini_llm():
    if not settings.gemini_api_key:
        return None
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        return ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=settings.gemini_api_key)
    except Exception:
        return None


def index_failure(test_name: str, error_message: str, stack_trace: str = "", fix_applied: str = "") -> bool:
    """Store a test failure in ChromaDB for future RAG retrieval."""
    client = _get_chroma_client()
    if not client:
        return False

    collection = client.get_or_create_collection("test_failures")
    doc_id = f"{test_name}_{hash(error_message) % 10**8}"
    document = f"Test: {test_name}\nError: {error_message}\nStack: {stack_trace}\nFix: {fix_applied}"

    collection.upsert(
        ids=[doc_id],
        documents=[document],
        metadatas=[{"test_name": test_name, "has_fix": bool(fix_applied)}],
    )
    return True


def analyze_failure(test_name: str, error_message: str, stack_trace: str = "") -> dict:
    """Analyze a test failure using RAG context + Gemini."""
    similar = _find_similar_failures(error_message)
    llm = _get_gemini_llm()

    if not llm:
        return _fallback_analysis(test_name, error_message, similar)

    context = "\n---\n".join(similar) if similar else "No similar failures found."

    prompt = f"""You are a senior QA engineer analyzing a Playwright E2E test failure.

Test Name: {test_name}
Error Message: {error_message}
Stack Trace: {stack_trace[:2000]}

Similar Past Failures:
{context}

Respond in JSON with keys: root_cause, suggested_fix, confidence (0-1).
Be specific and actionable."""

    try:
        response = llm.invoke(prompt)
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("```", 1)[0]
        result = json.loads(content)
        result["similar_failures"] = [s[:200] for s in similar[:3]]
        return result
    except Exception:
        return _fallback_analysis(test_name, error_message, similar)


def _find_similar_failures(error_message: str, n: int = 5) -> list[str]:
    client = _get_chroma_client()
    if not client:
        return []

    try:
        collection = client.get_collection("test_failures")
        results = collection.query(query_texts=[error_message], n_results=n)
        return results.get("documents", [[]])[0]
    except Exception:
        return []


def _fallback_analysis(test_name: str, error_message: str, similar: list[str]) -> dict:
    """Rule-based fallback when AI services are unavailable."""
    root_cause = "Unknown — AI services not configured"
    suggested_fix = "Check test logs and screenshots manually"

    if "timeout" in error_message.lower():
        root_cause = "Element or navigation timeout — likely flaky selector or slow page load"
        suggested_fix = "Increase timeout, use data-testid selectors, add waitForLoadState('networkidle')"
    elif "401" in error_message or "unauthorized" in error_message.lower():
        root_cause = "Authentication token expired or missing"
        suggested_fix = "Ensure login fixture runs before test; check JWT expiry in test setup"
    elif "stock" in error_message.lower() or "insufficient" in error_message.lower():
        root_cause = "Test data seed conflict — product stock depleted by parallel test"
        suggested_fix = "Reset seed data in beforeEach hook or use unique product IDs per test"

    return {
        "root_cause": root_cause,
        "suggested_fix": suggested_fix,
        "similar_failures": [s[:200] for s in similar[:3]],
        "confidence": 0.6 if similar else 0.4,
    }


def analyze_failures_from_dir(input_dir: str) -> list[dict]:
    """CLI entry: scan Playwright test-results directory."""
    results = []
    path = Path(input_dir)
    if not path.exists():
        return results

    for error_file in path.rglob("error-context.md"):
        content = error_file.read_text(encoding="utf-8", errors="ignore")
        test_name = error_file.parent.name
        analysis = analyze_failure(test_name, content[:3000])
        index_failure(test_name, content[:3000])
        results.append({"test_name": test_name, **analysis})

    output_dir = Path(settings.test_artifacts_dir) / "ai_analysis"
    output_dir.mkdir(parents=True, exist_ok=True)
    (output_dir / "report.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    return results


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    args = parser.parse_args()
    analyze_failures_from_dir(args.input)
