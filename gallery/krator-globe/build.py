"""gallery/krator-globe: the full Krator 5.1 Planetary Globe & Geodetic Atlas.

Assembles template.html and globe_data.json into dist/krator-globe.html, which also
serves as the canonical upstream synthesis source for gallery/krator-system/bake_krator.py.

    python3 build.py
"""
import os, sys                                   # item 25 (the survey): a plain run goes through tools/build.py
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'tools')); import buildlib; sys.path.pop(0)
buildlib.through_tools_build(__file__)           # build-inputs.json is always written (KRATOR_ALLOW_PLAIN_BUILD=1 skips it)
import os

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    tpl_path = os.path.join(HERE, 'template.html')
    data_path = os.path.join(HERE, 'globe_data.json')
    dist_dir = os.path.join(HERE, 'dist')
    out_path = os.path.join(dist_dir, 'krator-globe.html')

    with open(tpl_path, encoding='utf-8') as fh:
        tpl = fh.read()
    with open(data_path, encoding='utf-8') as fh:
        globe_data = fh.read().strip()

    assert '{{GLOBE_DATA}}' in tpl, 'placeholder {{GLOBE_DATA}} missing in template.html'
    html = tpl.replace('{{GLOBE_DATA}}', globe_data, 1)

    os.makedirs(dist_dir, exist_ok=True)
    with open(out_path, 'w', encoding='utf-8', newline='\n') as fh:
        fh.write(html)
    print(len(html) // 1024, 'KB ->', os.path.relpath(out_path, HERE).replace(os.sep, '/'))


if __name__ == '__main__':
    main()
