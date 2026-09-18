import os
import glob

files = glob.glob('d:/AWS/backend/scripts/test_*.py')
for f in files:
    if f.endswith('test_pipeline.py') or f.endswith('test_docs.py') or f.endswith('test_cedar.py') or f.endswith('test_search.py'):
        continue
    with open(f, 'r') as file:
        content = file.read()
    
    if "assert response['statusCode']" not in content and "assert response.get('statusCode')" not in content:
        content = content.replace("print(f\"Status Code: {response['statusCode']}\")", "print(f\"Status Code: {response['statusCode']}\")\nassert response['statusCode'] in (200, 201), f\"Unexpected status code: {response['statusCode']}\"")
        with open(f, 'w') as file:
            file.write(content)
        print(f"Added assert to {f}")
