"""
ai/investigator.py — Bridge to ai-agent/src/investigator.py
"""

from __future__ import annotations

import os
import sys

_current_dir = os.path.dirname(__file__)
_repo_root = os.path.abspath(os.path.join(_current_dir, ".."))
_ai_agent_src = os.path.join(_repo_root, "ai-agent", "src")
if _ai_agent_src not in sys.path:
    sys.path.insert(0, _ai_agent_src)

from investigator import AIInvestigator  # noqa: F401
