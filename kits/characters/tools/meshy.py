#!/usr/bin/env python3
"""Make an outfit donor on Meshy: text-to-3d (preview, then refine), then auto-rigging. Downloads the rigged GLB.

The key comes from MESHY_API_KEY (or a file named by MESHY_API_KEY_FILE); it is never written anywhere.

  python3 tools/meshy.py donor <id> "<outfit words>" [body=female] [kind=base|piece]
                                                      # runs the steps, writes donors/<id>.glb + donors/<id>.json
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
# per body: the outfit template, and the clean base model (bald, clean shaven, plain underclothes) that hair and
# beards are fitted to
PROMPTS = {
    'male': {'outfit': DONOR_PROMPT,
             'base': ('Full body game character base model, an adult man of average athletic build, standing in A-pose, '
                      'stylized realistic, completely bald smooth head, no hair, no beard, no eyebrows piercings or '
                      'tattoos, neutral calm face, wearing plain grey fitted shorts and a plain grey tank top, '
                      'barefoot, even neutral skin tone, nothing held.')},
    'female': {'outfit': ('Full body game character, an adult woman of average athletic build, standing in A-pose, '
                          'stylized realistic, bare head with short dark hair tied back, face visible, wearing {outfit}. '
                          'Arms, hands and legs fully covered. No cape, no cloak, no weapon, no shield, nothing held.'),
               'base': ('Full body game character base model, an adult woman of average athletic build, standing in '
                        'A-pose, stylized realistic, completely bald smooth head, no hair, no eyebrows piercings or '
                        'tattoos, neutral calm face, wearing a plain grey fitted sports top and plain grey fitted '
                        'shorts, barefoot, even neutral skin tone, nothing held.')},
}
# a hair or beard piece: no rig; make_pieces.py fits it onto a base head
PIECE_PROMPT = ('{what}, as a separate game asset on its own: hair only, no head, no face, no skin, no body, hollow '
                'inside where the head would be, front facing +Z, stylized realistic, natural colour.')


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


def donor(did, outfit, body='male', kind='outfit'):
    """kind: 'outfit' (rigged, the outfit words go in the body's template), 'base' (rigged, the body's base model),
    'piece' (a hair or beard: not rigged; the words describe it)"""
    os.makedirs(DONORS, exist_ok=True)
    jp = os.path.join(DONORS, did + '.json')
    prompt = (PIECE_PROMPT.format(what=outfit) if kind == 'piece' else
              PROMPTS[body]['base'] if kind == 'base' else PROMPTS[body]['outfit'].format(outfit=outfit))
    rec = json.load(open(jp)) if os.path.exists(jp) else {'id': did, 'outfit': outfit, 'body': body, 'kind': kind,
                                                         'prompt': prompt}
    save = lambda: json.dump(rec, open(jp, 'w'), indent=1)
    if 'preview' not in rec:
        rec['preview'] = call('POST', '/v2/text-to-3d', {
            'mode': 'preview', 'prompt': rec['prompt'], 'ai_model': 'latest',
            'pose_mode': '' if rec.get('kind') == 'piece' else 'a-pose',
            'should_remesh': True, 'topology': 'triangle', 'target_polycount': 24000, 'target_formats': ['glb']})['result']
        save()
    wait('/v2/text-to-3d', rec['preview'])
    if 'refine' not in rec:
        rec['refine'] = call('POST', '/v2/text-to-3d', {
            'mode': 'refine', 'preview_task_id': rec['preview'], 'enable_pbr': True, 'texture_resolution': '2k',
            'target_formats': ['glb']})['result']
        save()
    wait('/v2/text-to-3d', rec['refine'])
    if rec.get('kind') == 'piece':
        t = call('GET', '/v2/text-to-3d/%s' % rec['refine'])
        out = os.path.join(DONORS, did + '.glb')
        urllib.request.urlretrieve(t['model_urls']['glb'], out)
        compact_glb.compact(out)
        rec['glb'] = did + '.glb'
        save()
        print('%s: %s (%d KB)' % (did, out, os.path.getsize(out) // 1024))
        return
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
    elif sys.argv[1:2] == ['donor'] and len(sys.argv) >= 4:
        opt = dict(a.split('=', 1) for a in sys.argv[4:])      # body=female kind=base|piece
        donor(sys.argv[2], sys.argv[3], opt.get('body', 'male'), opt.get('kind', 'outfit'))
    else:
        sys.exit(__doc__)
