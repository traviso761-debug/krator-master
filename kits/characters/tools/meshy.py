#!/usr/bin/env python3
"""Make an outfit donor on Meshy: text-to-3d (preview, then refine), then auto-rigging. Downloads the rigged GLB.

The key comes from MESHY_API_KEY (or a file named by MESHY_API_KEY_FILE); it is never written anywhere.

  python3 tools/meshy.py donor <id> "<outfit words>"   # runs all three steps, writes donors/<id>.glb + donors/<id>.json
  python3 tools/meshy.py balance

The prompt is the fixed template DONOR_PROMPT with the outfit words put in, so every donor comes out the same build,
in the same A-pose as Styv (hero/styv.glb), with no cape, weapon or shield (those cross the slot cuts). Cost per donor:
20 (preview) + 10 (refine) + 5 (rig) credits. The json keeps the task ids, so a rerun resumes rather than repaying.
"""
import json, os, sys, time, urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import compact_glb

API = 'https://api.meshy.ai/openapi'
HERE = os.path.dirname(os.path.abspath(__file__))
DONORS = os.path.join(HERE, '..', 'donors')

DONOR_PROMPT = ('Full body game character, an adult man of average athletic build, standing in A-pose, '
                'stylized realistic, bare head with short dark hair, clean shaven, face visible, wearing {outfit}. '
                'Arms, hands and legs fully covered. No cape, no cloak, no weapon, no shield, nothing held.')


def key():
    k = os.environ.get('MESHY_API_KEY')
    if not k and os.environ.get('MESHY_API_KEY_FILE'):
        k = open(os.environ['MESHY_API_KEY_FILE']).read().strip()
    if not k:
        sys.exit('meshy.py: set MESHY_API_KEY')
    return k


def call(method, path, body=None):
    req = urllib.request.Request(API + path, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={'Authorization': 'Bearer ' + key(), 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def wait(path, tid):
    while True:
        t = call('GET', '%s/%s' % (path, tid))
        print('  %s %s %s%%' % (path.split('/')[-1], t['status'], t.get('progress')), flush=True)
        if t['status'] == 'SUCCEEDED':
            return t
        if t['status'] in ('FAILED', 'CANCELED'):
            sys.exit('meshy.py: %s %s: %s' % (path, tid, t.get('task_error')))
        time.sleep(15)


def donor(did, outfit):
    os.makedirs(DONORS, exist_ok=True)
    jp = os.path.join(DONORS, did + '.json')
    rec = json.load(open(jp)) if os.path.exists(jp) else {'id': did, 'outfit': outfit,
                                                         'prompt': DONOR_PROMPT.format(outfit=outfit)}
    save = lambda: json.dump(rec, open(jp, 'w'), indent=1)
    if 'preview' not in rec:
        rec['preview'] = call('POST', '/v2/text-to-3d', {
            'mode': 'preview', 'prompt': rec['prompt'], 'ai_model': 'latest', 'pose_mode': 'a-pose',
            'should_remesh': True, 'topology': 'triangle', 'target_polycount': 24000, 'target_formats': ['glb']})['result']
        save()
    wait('/v2/text-to-3d', rec['preview'])
    if 'refine' not in rec:
        rec['refine'] = call('POST', '/v2/text-to-3d', {
            'mode': 'refine', 'preview_task_id': rec['preview'], 'enable_pbr': True, 'texture_resolution': '2k',
            'target_formats': ['glb']})['result']
        save()
    wait('/v2/text-to-3d', rec['refine'])
    if 'rig' not in rec:
        rec['rig'] = call('POST', '/v1/rigging', {'input_task_id': rec['refine'], 'height_meters': 1.75})['result']
        save()
    t = wait('/v1/rigging', rec['rig'])
    out = os.path.join(DONORS, did + '.glb')
    urllib.request.urlretrieve(t['result']['rigged_character_glb_url'], out)
    compact_glb.compact(out)            # 4K maps down to 2K/1K for the repo
    rec['glb'] = did + '.glb'
    save()
    print('%s: %s (%d KB)' % (did, out, os.path.getsize(out) // 1024))


if __name__ == '__main__':
    if sys.argv[1:2] == ['balance']:
        print(call('GET', '/v1/balance'))
    elif sys.argv[1:2] == ['donor'] and len(sys.argv) == 4:
        donor(sys.argv[2], sys.argv[3])
    else:
        sys.exit(__doc__)
