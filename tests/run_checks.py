"""Compatibility entry point for the current reproducible business-rule suite."""
from pathlib import Path
import subprocess
import sys
subprocess.run([sys.executable, str(Path(__file__).resolve().parents[1]/'scripts/reproduce.py')],check=True)
