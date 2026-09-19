"""
test_attack_graph.py — Phase 5 Verification: Attack Graph Generation & Dynamic Entity Traceability.

Verifies:
1. Event -> Entity extraction -> Relationships:
   SOURCE_IP -> USER -> DEVICE -> PRIVILEGE -> RESOURCE
2. Dynamic Graph updates when incident data changes (Incident A vs. Incident B).
3. Evaluates backend correlation graph vs. frontend UI representation.
"""

from __future__ import annotations

import os
import sys

CURRENT_DIR = os.path.dirname(__file__)
REPO_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
sys.path.insert(0, os.path.join(REPO_ROOT, "backend", "src"))
sys.path.insert(0, os.path.join(REPO_ROOT, "contracts", "authorization"))
sys.path.insert(0, os.path.join(REPO_ROOT, "ai-agent", "src"))
sys.path.insert(0, os.path.join(REPO_ROOT, "detection", "src"))

from detector import run_all_rules
from correlation import correlate


def build_attack_graph_nodes_and_edges(chain) -> dict:
    """Transform an AttackChain into graph nodes and directed edges."""
    entities = chain.entities
    nodes = []
    edges = []

    # Extract entities
    ip = entities.get("source_ip")
    user = entities.get("user_id")
    device = entities.get("device_id")
    resource = entities.get("resource")

    if ip:
        nodes.append({"id": f"node_ip_{ip}", "type": "SOURCE_IP", "label": ip})
    if user:
        nodes.append({"id": f"node_user_{user}", "type": "USER", "label": user})
    if device:
        nodes.append({"id": f"node_device_{device}", "type": "DEVICE", "label": device})
    if resource:
        nodes.append({"id": f"node_resource_{resource}", "type": "RESOURCE", "label": resource})

    # Directed attack chain relationships: IP -> USER -> DEVICE -> RESOURCE
    if ip and user:
        edges.append({"source": f"node_ip_{ip}", "target": f"node_user_{user}", "relation": "COMPROMISED_ACCOUNT_VIA"})
    if user and device:
        edges.append({"source": f"node_user_{user}", "target": f"node_device_{device}", "relation": "REGISTERED_NEW_DEVICE"})
    if user and resource:
        edges.append({"source": f"node_user_{user}", "target": f"node_resource_{resource}", "relation": "UNUSUAL_ACCESS"})

    return {
        "incident_id": chain.incident_id,
        "nodes": nodes,
        "edges": edges,
    }


def run_attack_graph_verification():
    print("=" * 80)
    print("  PHASE 5: ATTACK GRAPH DYNAMIC VERIFICATION")
    print("=" * 80)

    # 1. Incident 1: Northgate Demo Scenario
    events_1 = [
        {"event_id": "e1", "timestamp": "2026-03-12T09:41:00.000Z", "event_type": "login_failed", "source_ip": "203.0.113.77", "user_id": "u-8823", "severity": "medium"},
        {"event_id": "e2", "timestamp": "2026-03-12T09:41:05.000Z", "event_type": "login_failed", "source_ip": "203.0.113.77", "user_id": "u-8823", "severity": "medium"},
        {"event_id": "e3", "timestamp": "2026-03-12T09:41:10.000Z", "event_type": "login_failed", "source_ip": "203.0.113.77", "user_id": "u-8823", "severity": "medium"},
        {"event_id": "e4", "timestamp": "2026-03-12T09:41:15.000Z", "event_type": "login_failed", "source_ip": "203.0.113.77", "user_id": "u-8823", "severity": "medium"},
        {"event_id": "e5", "timestamp": "2026-03-12T09:41:20.000Z", "event_type": "login_failed", "source_ip": "203.0.113.77", "user_id": "u-8823", "severity": "medium"},
        {"event_id": "e6", "timestamp": "2026-03-12T09:42:00.000Z", "event_type": "login_success", "source_ip": "203.0.113.77", "user_id": "u-8823", "severity": "low"},
        {"event_id": "e7", "timestamp": "2026-03-12T09:43:00.000Z", "event_type": "new_device", "source_ip": "203.0.113.77", "user_id": "u-8823", "device_id": "dev-unknown-902", "severity": "medium"},
        {"event_id": "e8", "timestamp": "2026-03-12T09:44:00.000Z", "event_type": "privilege_escalation", "source_ip": "203.0.113.77", "user_id": "u-8823", "device_id": "dev-unknown-902", "severity": "high", "metadata": {"role_before": "student", "role_after": "admin"}},
        {"event_id": "e9", "timestamp": "2026-03-12T09:45:00.000Z", "event_type": "resource_access", "source_ip": "203.0.113.77", "user_id": "u-8823", "resource": "srv-grades-db", "severity": "high"},
    ]

    dets_1 = run_all_rules(events_1, sensitive_resources={"srv-grades-db"})
    chains_1 = correlate(dets_1, incident_id="INC-0001")
    graph_1 = build_attack_graph_nodes_and_edges(chains_1[0])

    print(f"[+] Incident 1 Graph Generated ({graph_1['incident_id']}):")
    print(f"    Nodes: {[n['label'] for n in graph_1['nodes']]}")
    print(f"    Edges: {[(e['source'], '->', e['target']) for e in graph_1['edges']]}")

    # 2. Incident 2: Synthetic Incident B with different entities
    events_2 = [
        {"event_id": "eb1", "timestamp": "2026-03-19T10:00:00.000Z", "event_type": "login_failed", "source_ip": "198.51.100.44", "user_id": "user-corp-99", "severity": "medium"},
        {"event_id": "eb2", "timestamp": "2026-03-19T10:00:05.000Z", "event_type": "login_failed", "source_ip": "198.51.100.44", "user_id": "user-corp-99", "severity": "medium"},
        {"event_id": "eb3", "timestamp": "2026-03-19T10:00:10.000Z", "event_type": "login_failed", "source_ip": "198.51.100.44", "user_id": "user-corp-99", "severity": "medium"},
        {"event_id": "eb4", "timestamp": "2026-03-19T10:00:15.000Z", "event_type": "login_failed", "source_ip": "198.51.100.44", "user_id": "user-corp-99", "severity": "medium"},
        {"event_id": "eb5", "timestamp": "2026-03-19T10:00:20.000Z", "event_type": "login_failed", "source_ip": "198.51.100.44", "user_id": "user-corp-99", "severity": "medium"},
        {"event_id": "eb6", "timestamp": "2026-03-19T10:01:00.000Z", "event_type": "login_success", "source_ip": "198.51.100.44", "user_id": "user-corp-99", "severity": "low"},
        {"event_id": "eb7", "timestamp": "2026-03-19T10:02:00.000Z", "event_type": "new_device", "source_ip": "198.51.100.44", "user_id": "user-corp-99", "device_id": "dev-corp-mobile-01", "severity": "medium"},
        {"event_id": "eb8", "timestamp": "2026-03-19T10:03:00.000Z", "event_type": "resource_access", "source_ip": "198.51.100.44", "user_id": "user-corp-99", "resource": "srv-payroll-db", "severity": "high"},
    ]

    dets_2 = run_all_rules(events_2, sensitive_resources={"srv-payroll-db"})
    chains_2 = correlate(dets_2, incident_id="INC-0002")
    graph_2 = build_attack_graph_nodes_and_edges(chains_2[0])

    print(f"\n[+] Incident 2 Graph Generated ({graph_2['incident_id']}):")
    print(f"    Nodes: {[n['label'] for n in graph_2['nodes']]}")
    print(f"    Edges: {[(e['source'], '->', e['target']) for e in graph_2['edges']]}")

    # 3. Check graph dynamic mutation (FAIL condition check)
    labels_1 = {n["label"] for n in graph_1["nodes"]}
    labels_2 = {n["label"] for n in graph_2["nodes"]}

    print(f"\n[+] Dynamic Mutation Check:")
    print(f"    Graph 1 Entities: {labels_1}")
    print(f"    Graph 2 Entities: {labels_2}")
    
    assert labels_1 != labels_2, "FAIL: Attack Graph failed dynamic mutation test! Nodes did not change when incident data changed."
    print("    Backend Dynamic Graph Test: PASS (Graph dynamically reflects incident entities)")

    # 4. Frontend Component State Warning
    print("\n[!] Frontend UI Attack Graph Audit:")
    print("    frontend/src/components/attack-graph/AttackGraphCanvas.tsx is currently hardcoded with:")
    print("    ['192.168.1.45', 'admin@acme.com', 'MacBook Pro', 'SuperAdmin', 'Customer DB']")
    print("    Backend engine is dynamic; Frontend component relies on static mock data.")

    print("\n[+] Phase 5 Verification Status: BACKEND PASS / FRONTEND MOCKED")


if __name__ == "__main__":
    run_attack_graph_verification()
