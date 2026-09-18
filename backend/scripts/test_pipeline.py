import os
import subprocess
import sys

print("--- Simulating CI/CD Pipeline Execution (Phase 11) ---")

scripts = [
    "test_api.py",
    "test_auth.py",
    "test_search.py",
    "test_analyze.py",
    "test_eventbridge.py",
    "test_workflow.py",
    "test_cedar.py",
    "test_audit.py",
    "test_docs.py"
]

backend_dir = os.path.join(os.path.dirname(__file__), '..')

for script in scripts:
    script_path = os.path.join(backend_dir, 'scripts', script)
    print(f"\n[Running {script}]")
    try:
        result = subprocess.run([sys.executable, script_path], check=True, capture_output=True, text=True)
        print("[SUCCESS]")
    except subprocess.CalledProcessError as e:
        print(f"[FAILED]")
        print(e.stdout)
        print(e.stderr)
        sys.exit(1)

print("\nAll pipeline tests passed! Ready for SAM Deploy.")
