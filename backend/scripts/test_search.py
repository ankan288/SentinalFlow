import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))
from services.search_service import OpenSearchService

print("--- Testing OpenSearch Interface for AI Agent ---")
search_service = OpenSearchService()

print("\n[AI Agent queries by IP]")
results_ip = search_service.search_events(source_ip="10.0.0.50")
print(f"Results: {results_ip}")

print("\n[AI Agent queries by Time Range & Username]")
results_complex = search_service.search_events(
    username="john.doe",
    start_time="2026-09-17T00:00:00Z",
    end_time="2026-09-18T00:00:00Z"
)
print(f"Results: {results_complex}")
