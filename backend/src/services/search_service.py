import os
import json
import boto3
try:
    from opensearchpy import OpenSearch, RequestsHttpConnection
    from requests_aws4auth import AWS4Auth
except ImportError:
    # Handle local testing environments without dependencies
    pass

class OpenSearchService:
    def __init__(self):
        self.host = os.environ.get('OPENSEARCH_HOST', 'localhost')
        self.region = os.environ.get('AWS_REGION', 'us-east-1')
        
        # In AWS, we use IAM Roles (SigV4) to authenticate to OpenSearch.
        if self.host != 'localhost':
            credentials = boto3.Session().get_credentials()
            awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, 
                             self.region, 'es', session_token=credentials.token)
            
            self.client = OpenSearch(
                hosts=[{'host': self.host, 'port': 443}],
                http_auth=awsauth,
                use_ssl=True,
                verify_certs=True,
                connection_class=RequestsHttpConnection
            )
        else:
            self.client = None
            
    def search_events(self, query=None, incident_id=None, source_ip=None, username=None, start_time=None, end_time=None, size=50):
        """
        INTERFACE FOR MEMBER 1 (AI AGENT).
        Use this method to query the raw security event logs.
        """
        must_clauses = []
        
        if query:
            must_clauses.append({"multi_match": {"query": query, "fields": ["message", "event_type"]}})
        if incident_id:
            must_clauses.append({"term": {"related_incident_id": incident_id}})
        if source_ip:
            must_clauses.append({"term": {"source_ip": source_ip}})
        if username:
            must_clauses.append({"term": {"username": username}})
        if start_time and end_time:
            must_clauses.append({"range": {"timestamp": {"gte": start_time, "lte": end_time}}})
            
        search_body = {
            "query": {
                "bool": {
                    "must": must_clauses if must_clauses else [{"match_all": {}}]
                }
            },
            "sort": [{"timestamp": {"order": "desc"}}],
            "size": size
        }
        
        if self.client:
            # Execute real query against OpenSearch
            response = self.client.search(index="security-events", body=search_body)
            return [hit['_source'] for hit in response['hits']['hits']]
        else:
            # Local mock response for testing AI agent without cloud connection
            print(f"Mock OpenSearch query compiled: \n{json.dumps(search_body, indent=2)}")
            return [
                {
                    "event_id": "EVT-101",
                    "timestamp": "2026-09-18T10:05:00Z",
                    "event_type": "PrivilegeEscalation",
                    "source_ip": source_ip or "192.168.1.55",
                    "username": username or "compromised_user",
                    "message": "User assumed admin role unexpectedly."
                }
            ]
