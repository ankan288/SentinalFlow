"""
device_info.py — Cross-platform hardware device detection for SentinelFlow demo data generation.

Detects the actual machine model name on Windows, macOS, and Linux so synthetic
demo events and attack graphs reflect the presenter's real system.
"""

from __future__ import annotations

import os
import platform
import subprocess
import sys


def get_device_model_name() -> str:
    """
    Returns the real hardware model name of the current machine.
    Checks DEMO_DEVICE_NAME env var first.
    
    Platforms:
      - Windows: (Get-CimInstance -ClassName Win32_ComputerSystem).Model / WMIC
      - macOS: sysctl -n hw.model
      - Linux: /sys/devices/virtual/dmi/id/product_name / hostname
      - Fallback: 'Demo Host Machine'
    """
    env_name = os.getenv("DEMO_DEVICE_NAME")
    if env_name and env_name.strip():
        return env_name.strip()

    try:
        if sys.platform == "win32":
            # Primary Windows detection via PowerShell CIM
            cmd = ["powershell", "-Command", "(Get-CimInstance -ClassName Win32_ComputerSystem).Model"]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=5)
            model = res.stdout.strip()
            if model:
                return model

            # Fallback Windows detection via WMIC
            res2 = subprocess.run(["wmic", "csproduct", "get", "name"], capture_output=True, text=True, timeout=5)
            lines = [line.strip() for line in res2.stdout.splitlines() if line.strip() and "Name" not in line]
            if lines:
                return lines[0]

        elif sys.platform == "darwin":
            # macOS hw.model detection
            res = subprocess.run(["sysctl", "-n", "hw.model"], capture_output=True, text=True, timeout=5)
            model = res.stdout.strip()
            if model:
                return model

        elif sys.platform.startswith("linux"):
            # Linux DMI product name
            product_file = "/sys/devices/virtual/dmi/id/product_name"
            if os.path.exists(product_file):
                with open(product_file, "r", encoding="utf-8") as f:
                    model = f.read().strip()
                    if model and model != "System Product Name":
                        return model
            
            # Linux fallback to hostname
            hostname = platform.uname().node
            if hostname:
                return f"Linux ({hostname})"

    except Exception as err:
        sys.stderr.write(f"[device_info] Warning: Could not detect hardware model: {err}\n")

    return "Demo Host Machine"


if __name__ == "__main__":
    print(f"Detected Hardware Device Model: {get_device_model_name()}")
