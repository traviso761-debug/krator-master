#!/usr/bin/env python3
"""Tests for tools/check_botany.py (harvest tag extraction, classification, and census)."""
import os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import check_botany

fails = []

def check(name, ok, detail=''):
    print(('PASS  ' if ok else 'FAIL  ') + name + (': ' + str(detail)[:400] if detail and not ok else ''))
    if not ok:
        fails.append(name)


def test_parser_and_classification():
    # Test HV parsing
    hv = check_botany.parse_hv("'timber', ['fruit'], true, 'healing resin and firewood', 'pod'")
    check("parse_hv wood", hv['wood'] == 'timber', hv['wood'])
    check("parse_hv edible", hv['edible'] == "['fruit']", hv['edible'])
    check("parse_hv medicinal", hv['medicinal'] is True, hv['medicinal'])
    check("parse_hv fruit", hv['fruit'] == 'pod', hv['fruit'])

    # Test classification
    cls = check_botany.classify_species({'harvest': hv})
    check("classify medicinal", cls['is_medicinal'] is True)
    check("classify fuel", cls['is_fuel'] is True)
    check("classify edible", cls['is_edible'] is True)
    check("classify misc resin", 'adhesives_resins' in cls['misc_domains'], cls['misc_domains'])


def test_census_load():
    census = check_botany.load_census()
    check("census file exists and loads", census is not None and len(census) > 0)
    biomes = set(p['biome'] for p in census)
    check("census has biomes", len(biomes) >= 40, f"found {len(biomes)} biomes")
    
    # Check hyperjungle species presence
    hj = [p for p in census if p['biome'] == 'hyperjungle']
    check("hyperjungle in census", len(hj) >= 10, f"found {len(hj)}")


def test_biome_scan():
    hj_plants = check_botany.scan_biome('biomes/hyperjungle')
    check("scan_biome hyperjungle returns species", len(hj_plants) >= 10, f"found {len(hj_plants)}")
    keys = {p['key'] for p in hj_plants}
    check("hyperjungle has prismgum", 'prismgum' in keys)


def main():
    test_parser_and_classification()
    test_census_load()
    test_biome_scan()
    if fails:
        print(f"\n{len(fails)} tests failed:")
        for f in fails:
            print(f"  {f}")
        return 1
    print("\nAll check_botany tests passed.")
    return 0


if __name__ == '__main__':
    sys.exit(main())
