import json
from pathlib import Path


def load_events():
    data_path = Path(__file__).parent / "data" / "events.json"

    with open(data_path, "r", encoding="utf-8") as file:
        return json.load(file)


def correlate_incident(incident, events):
    event_map = {
        event["event_id"]: event
        for event in events
    }

    related_events = [
        event_map[event_id]
        for event_id in incident["related_events"]
        if event_id in event_map
    ]

    related_events.sort(
        key=lambda event: event["timestamp"]
    )

    return related_events


def build_attack_sequence(related_events):
    sequence = []

    for event in related_events:
        sequence.append({
            "event_id": event["event_id"],
            "timestamp": event["timestamp"],
            "event_type": event["event_type"],
            "user": event["actor"]["username"],
            "source_ip": event["source"]["ip"],
            "device_id": event["source"]["device_id"],
            "target": event["target"]["resource"],
        })

    return sequence


def build_relationship_graph(related_events):
    nodes = []
    edges = []

    node_ids = set()

    def add_node(node_id, node_type, value):
        if node_id not in node_ids:
            nodes.append({
                "id": node_id,
                "type": node_type,
                "value": value
            })
            node_ids.add(node_id)

    for event in related_events:
        user_id = event["actor"]["user_id"]
        username = event["actor"]["username"]
        source_ip = event["source"]["ip"]
        device_id = event["source"]["device_id"]

        add_node(
            f"ip:{source_ip}",
            "IP",
            source_ip
        )

        add_node(
            f"user:{user_id}",
            "USER",
            username
        )

        add_node(
            f"device:{device_id}",
            "DEVICE",
            device_id
        )

        edges.append({
            "from": f"ip:{source_ip}",
            "to": f"user:{user_id}",
            "relationship": "ASSOCIATED_WITH"
        })

        edges.append({
            "from": f"user:{user_id}",
            "to": f"device:{device_id}",
            "relationship": "USES"
        })

        event_node = f"event:{event['event_id']}"

        add_node(
            event_node,
            "EVENT",
            event["event_type"]
        )

        edges.append({
            "from": f"user:{user_id}",
            "to": event_node,
            "relationship": "PERFORMED"
        })

        target = event["target"]["resource"]

        if target:
            target_node = f"resource:{target}"

            add_node(
                target_node,
                "RESOURCE",
                target
            )

            edges.append({
                "from": event_node,
                "to": target_node,
                "relationship": "TARGETED"
            })

    return {
        "nodes": nodes,
        "edges": edges
    }


if __name__ == "__main__":
    events = load_events()

    from detector import detect_all

    incidents = detect_all(events)

    print("\nCorrelated incidents:")

    for incident in incidents:
        related_events = correlate_incident(
            incident,
            events
        )

        attack_sequence = build_attack_sequence(
            related_events
        )

        relationship_graph = build_relationship_graph(
            related_events
        )

        print(f"\n{incident['incident_id']}")
        print(f"Detection: {incident['detection_type']}")

        print("Event sequence:")

        for event in related_events:
            print(
                f"  {event['event_id']} "
                f"-> {event['event_type']} "
                f"-> {event['timestamp']}"
            )

        print("Attack sequence:")

        for step in attack_sequence:
            print(
                f"  {step['event_id']} | "
                f"{step['event_type']} | "
                f"User: {step['user']} | "
                f"IP: {step['source_ip']} | "
                f"Device: {step['device_id']} | "
                f"Target: {step['target']}"
            )

        print("Relationship graph:")

        for edge in relationship_graph["edges"]:
            print(
                f"  {edge['from']} "
                f"--{edge['relationship']}--> "
                f"{edge['to']}"
            )