"""
user_agent_parser.py — Lightweight User-Agent parser for server-side telemetry extraction.

Parses User-Agent headers into human-readable browser+OS summaries
(e.g., 'Chrome 128 on Windows 11') without inventing fake hardware models.
"""

import re


def parse_user_agent(ua_string: str | None) -> dict:
    """
    Parses a raw User-Agent header into browser, OS, readable summary, and device slug.
    """
    if not ua_string or not ua_string.strip():
        return {
            "browser": "Unknown Browser",
            "os": "Unknown OS",
            "summary": "Unknown Device",
            "device_slug": "dev-unknown-browser"
        }

    ua = ua_string.strip()

    # 1. Detect Operating System
    os_name = "Unknown OS"
    if "Windows NT 10.0" in ua:
        os_name = "Windows 11/10"
    elif "Windows NT 6.3" in ua:
        os_name = "Windows 8.1"
    elif "Windows NT 6.1" in ua:
        os_name = "Windows 7"
    elif "Windows NT" in ua:
        os_name = "Windows"
    elif "Mac OS X" in ua:
        # Extract macOS version if possible
        m = re.search(r"Mac OS X (\d+[._]\d+)", ua)
        ver = m.group(1).replace("_", ".") if m else ""
        os_name = f"macOS {ver}".strip()
    elif "iPhone" in ua or "iPad" in ua:
        os_name = "iOS"
    elif "Android" in ua:
        os_name = "Android"
    elif "Linux" in ua:
        os_name = "Linux"

    # 2. Detect Browser
    browser_name = "Unknown Browser"
    if "Edg/" in ua:
        m = re.search(r"Edg/(\d+)", ua)
        ver = f" {m.group(1)}" if m else ""
        browser_name = f"Edge{ver}"
    elif "Chrome/" in ua and "Safari/" in ua:
        m = re.search(r"Chrome/(\d+)", ua)
        ver = f" {m.group(1)}" if m else ""
        browser_name = f"Chrome{ver}"
    elif "Firefox/" in ua:
        m = re.search(r"Firefox/(\d+)", ua)
        ver = f" {m.group(1)}" if m else ""
        browser_name = f"Firefox{ver}"
    elif "Safari/" in ua and "Chrome/" not in ua:
        m = re.search(r"Version/(\d+)", ua)
        ver = f" {m.group(1)}" if m else ""
        browser_name = f"Safari{ver}"

    summary = f"{browser_name} on {os_name}"
    
    # Generate schema-compatible device slug hash/string
    clean_browser = re.sub(r"[^a-zA-Z0-9]", "-", browser_name.split()[0].lower())
    clean_os = re.sub(r"[^a-zA-Z0-9]", "-", os_name.split()[0].lower())
    device_slug = f"dev-{clean_browser}-{clean_os}"

    return {
        "browser": browser_name,
        "os": os_name,
        "summary": summary,
        "device_slug": device_slug
    }
