import sys
import yaml
import os

print("--- Validating Documentation (Phase 12) ---")

spec_path = os.path.join(os.path.dirname(__file__), '..', '..', 'docs', 'api', 'api-spec.yaml')

try:
    with open(spec_path, 'r') as f:
        spec = yaml.safe_load(f)
        
    print(f"[SUCCESS] OpenAPI Spec loaded. Title: {spec['info']['title']}, Version: {spec['info']['version']}")
    print(f"[SUCCESS] Found {len(spec['paths'])} API routes defined.")
    print("Documentation is finalized and ready for Member 2 & 3.")
except Exception as e:
    print(f"[FAILED] Could not parse OpenAPI spec: {e}")
    sys.exit(1)
