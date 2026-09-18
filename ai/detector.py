import json
from pathlib import Path
from datetime import datetime


def load_events():
    data_path = Path(__file__).parent / "data" / "events.json"

    with open(data_path, "r", encoding="utf-8") as file:
        return json.load(file)


def detect_brute_force(events):
    incidents = []

    # Sort events chronologically
    events = sorted(
        events,
        key=lambda event: event["timestamp"]
    )

    for index, event in enumerate(events):

        # We are interested in successful logins
        if event["event_type"] != "login_success":
            continue

        user_id = event["actor"]["user_id"]
        source_ip = event["source"]["ip"]

        success_time = datetime.fromisoformat(
            event["timestamp"].replace("Z", "+00:00")
        )

        failed_events = []

        # Look backward from the successful login
        for previous_event in events[:index]:

            if (
                previous_event["event_type"] == "login_failed"
                and previous_event["actor"]["user_id"] == user_id
                and previous_event["source"]["ip"] == source_ip
            ):
                failed_time = datetime.fromisoformat(
                    previous_event["timestamp"].replace("Z", "+00:00")
                )

                time_difference = success_time - failed_time

                # Only consider failures within 5 minutes
                if time_difference.total_seconds() <= 300:
                    failed_events.append(previous_event)

        # We need at least 3 failed attempts
        if len(failed_events) >= 3:

            incident = {
                "incident_id": f"INC-BF-{len(incidents) + 1:03d}",
                "detection_type": "BRUTE_FORCE_SUCCESS",
                "severity": "HIGH",

                "involved_entities": {
                    "user_id": user_id,
                    "source_ip": source_ip
                },

                "evidence": [
                    event["event_id"]
                    for event in failed_events[-3:]
                ],

                "related_events": [
                    event["event_id"]
                    for event in failed_events[-3:]
                ] + [event["event_id"]]
            }

            incidents.append(incident)

    return incidents
   
def detect_privilege_escalation(events):
    incidents = []

    for event in events:

        if event["event_type"] != "privilege_escalation":
            continue

        previous_privilege = event["metadata"].get("previous_privilege")
        new_privilege = event["metadata"].get("new_privilege")

        if (
            previous_privilege
            and new_privilege
            and new_privilege.lower() in ["admin", "administrator"]
        ):
            user_id = event["actor"]["user_id"]
            user_events = [
                e["event_id"] for e in events
                if e["actor"]["user_id"] == user_id
            ]

            incident = {
                "incident_id": f"INC-PE-{len(incidents) + 1:03d}",
                "detection_type": "PRIVILEGE_ESCALATION",
                "severity": "HIGH",

                "involved_entities": {
                    "user_id": user_id,
                    "username": event["actor"]["username"],
                    "source_ip": event["source"]["ip"],
                    "device_id": event["source"]["device_id"]
                },

                "evidence": [
                    event["event_id"]
                ],

                "related_events": user_events
            }

            incidents.append(incident)

    return incidents
def detect_sensitive_resource_access(events):
    incidents = []

    for event in events:

        if event["event_type"] != "resource_access":
            continue

        resource_classification = event["metadata"].get(
            "resource_classification"
        )

        if resource_classification != "sensitive":
            continue

        user_id = event["actor"]["user_id"]
        user_events = [
            e["event_id"] for e in events
            if e["actor"]["user_id"] == user_id
        ]

        incident = {
            "incident_id": f"INC-RA-{len(incidents) + 1:03d}",
            "detection_type": "SENSITIVE_RESOURCE_ACCESS",
            "severity": "HIGH",

            "involved_entities": {
                "user_id": user_id,
                "username": event["actor"]["username"],
                "source_ip": event["source"]["ip"],
                "device_id": event["source"]["device_id"],
                "resource": event["target"]["resource"]
            },

            "evidence": [
                event["event_id"]
            ],

            "related_events": user_events
        }

        incidents.append(incident)

    return incidents
def detect_all(events):
    incidents = []

    incidents.extend(
        detect_brute_force(events)
    )

    incidents.extend(
        detect_privilege_escalation(events)
    )

    incidents.extend(
        detect_sensitive_resource_access(events)
    )

    return incidents
if __name__ == "__main__":
    events = load_events()

    incidents = detect_all(events)

    print("\nDetected incidents:")

    for incident in incidents:
        print(json.dumps(incident, indent=2))