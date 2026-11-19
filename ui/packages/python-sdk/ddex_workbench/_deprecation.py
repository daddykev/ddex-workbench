# packages/python-sdk/ddex_workbench/_deprecation.py
"""Helpers for one-time deprecation warnings"""

import threading
import warnings

_warned = set()
_lock = threading.Lock()

KEY_MANAGEMENT_DEPRECATION = (
    "API key management requires a signed-in session and isn't supported from the SDK. "
    "Manage keys at https://ddex-workbench.org/api-keys. These methods will be removed in 2.0."
)


def warn_deprecated_once(name: str, message: str, stacklevel: int = 3) -> None:
    """Emit a DeprecationWarning for ``name`` the first time it's used in this process"""
    with _lock:
        if name in _warned:
            return
        _warned.add(name)
    warnings.warn(f"{name} is deprecated: {message}", DeprecationWarning, stacklevel=stacklevel)


def _reset_for_tests() -> None:
    """Forget which warnings were emitted (test helper)"""
    with _lock:
        _warned.clear()
