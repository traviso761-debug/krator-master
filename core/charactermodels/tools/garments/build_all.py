"""Unified CLI entrypoint (`tools/garments/build_all.py`) for building procedural outfits by culture."""
import sys
if sys.path and sys.path[0].replace('\\', '/').endswith('/garments'):
    sys.path.pop(0)

import argparse
from pathlib import Path

TOOLS = Path(__file__).resolve().parent.parent
if str(TOOLS) not in sys.path:
    sys.path.insert(0, str(TOOLS))

from garments.core import register_entries
from garments.cultures import CULTURE_BUILDERS, build_culture


def main():
    parser = argparse.ArgumentParser(description='Build Krator procedural garments by culture.')
    parser.add_argument('cultures', nargs='*', help='Culture IDs to build (default: all)')
    args = parser.parse_args()

    targets = args.cultures or list(CULTURE_BUILDERS.keys())
    all_entries = []
    for cid in targets:
        if cid not in CULTURE_BUILDERS:
            raise SystemExit(f'Unknown culture: {cid!r}. Available: {", ".join(CULTURE_BUILDERS)}')
        entries = build_culture(cid)
        all_entries.extend(entries)
        print(f'[{cid}] built {len(entries)} garment pieces')

    if all_entries:
        register_entries(all_entries)
        print(f'Registered {len(all_entries)} garment pieces in kit.json')


if __name__ == '__main__':
    main()
