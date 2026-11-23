#!/usr/bin/env python3
"""Run one Tripo task and keep what it makes: python3 rig/tripo_gen.py <key> <step> [args]

Steps (each writes into rig/sources/<key>/ and appends to tripo.json there: the step, task id, settings, credits consumed):
  balance                          the account's credits (free)
  image "<prompt>"                 text to image (seedream_v4, 5 credits): ref.png
  multiview [file.png]             image to four views (10 credits): front.png, left.png, back.png, right.png (default input ref.png)
  model                            the four views to a textured PBR model (v3.1, 30 credits): raw-tripo.glb
  rigcheck                         is the model riggable, and as what (free)
  rig <rig_type>                   Tripo's auto rig (25 credits): rig-tripo.glb
  get <task_id> <step>             fetch a finished task's files again, unpaid

The key comes from the file TRIPO_KEY_FILE names (default ~/.krator-keys/tripo.txt); it is sent only to Tripo and never printed.
Tripo's file URLs expire after five minutes, so each is downloaded as soon as the task succeeds. Standard library only.
"""
import json, os, sys, time, urllib.error, urllib.request, uuid

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.environ.get('TRIPO_BASE') or 'https://openapi.tripo3d.ai/v3'
KEYFILE = os.environ.get('TRIPO_KEY_FILE') or os.path.expanduser('~/.krator-keys/tripo.txt')
UA = 'krator-client/1.0'
MODEL = 'v3.1-20260211'
RIG_MODEL = 'v3.0-20260909'


def secret():
    with open(KEYFILE, encoding='utf-8') as fh:
        return fh.read().strip()


def call(path, body=None, raw=None, ctype='application/json'):
    data = raw if raw is not None else (None if body is None else json.dumps(body).encode())
    req = urllib.request.Request(BASE + path, data=data, headers={'Authorization': 'Bearer ' + secret(), 'Content-Type': ctype, 'User-Agent': UA})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            out = json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit('tripo %s %s: %s' % (path, e.code, e.read()[:600].decode('utf-8', 'replace')))
    if out.get('code') != 0:
        sys.exit('tripo %s: %s' % (path, json.dumps(out)[:600]))
    return out['data']


def upload(path):
    b = uuid.uuid4().hex
    with open(path, 'rb') as fh:
        img = fh.read()
    ext = os.path.splitext(path)[1].lower().lstrip('.')
    mime = 'image/png' if ext == 'png' else 'image/jpeg'
    body = ('--%s\r\nContent-Disposition: form-data; name="file"; filename="%s"\r\nContent-Type: %s\r\n\r\n' % (b, os.path.basename(path), mime)).encode() + img + ('\r\n--%s--\r\n' % b).encode()
    return call('/files', raw=body, ctype='multipart/form-data; boundary=' + b)['file_token']


def wait(tid):
    t0 = time.time()
    while True:
        d = call('/tasks/' + tid)
        st = d.get('status')
        if st == 'success':
            return d
        if st in ('failed', 'cancelled', 'banned', 'expired'):
            sys.exit('task %s %s: %s' % (tid, st, json.dumps(d)[:600]))
        if time.time() - t0 > 900:
            sys.exit('task %s still %s after 15 minutes' % (tid, st))
        time.sleep(4)


def fetch(url, out):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=300) as r, open(out, 'wb') as fh:
        fh.write(r.read())
    print('  wrote', os.path.relpath(out, HERE).replace(os.sep, '/'), os.path.getsize(out), 'bytes', flush=True)


OUTS = {
    'image': {'generated_image_url': 'ref.png'},
    'multiview': {'front_view_url': 'front.png', 'left_view_url': 'left.png', 'back_view_url': 'back.png', 'right_view_url': 'right.png'},
    'model': {'model_url': 'raw-tripo.glb', 'rendered_image_url': 'raw-tripo-render.png'},
    'rig': {'model_url': 'rig-tripo.glb'},
}


def keep(d, key, step, tid, settings, task):
    out = dict(task.get('output') or {})
    for v in list(out.values()):
        if isinstance(v, dict):
            out.update(v)
    for field, name in OUTS.get(step, {}).items():
        url = out.get(field)
        if url:
            fetch(url, os.path.join(d, name))
    log = os.path.join(d, 'tripo.json')
    rows = json.load(open(log, encoding='utf-8')) if os.path.exists(log) else []
    rows.append({'step': step, 'task_id': tid, 'settings': settings, 'credits': task.get('credits_consumed'), 'at': time.strftime('%Y-%m-%d %H:%M')})
    with open(log, 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(rows, fh, indent=1)
    print(key, step, tid, 'credits', task.get('credits_consumed'), flush=True)


def last_task(d, step):
    rows = json.load(open(os.path.join(d, 'tripo.json'), encoding='utf-8'))
    return [r for r in rows if r['step'] == step][-1]['task_id']


def main():
    key, step = sys.argv[1], sys.argv[2]
    d = os.path.join(HERE, 'sources', key)
    os.makedirs(d, exist_ok=True)
    if step == 'balance':
        print(balance())
        return
    if step == 'get':
        tid, what = sys.argv[3], sys.argv[4]
        keep(d, key, what, tid, {'refetch': True}, call('/tasks/' + tid))
        return
    if step == 'image':
        body = {'prompt': sys.argv[3], 'model': 'seedream_v4', 'size': '2048x2048', 'output_format': 'png'}
        path = '/generation/text-to-image'
    elif step == 'multiview':
        src = os.path.join(d, sys.argv[3] if len(sys.argv) > 3 else 'ref.png')
        body = {'input': upload(src)}
        path = '/generation/image-to-multiview'
    elif step == 'model':
        body = {'inputs': [{'task_id': last_task(d, 'multiview')}], 'model': MODEL, 'texture': True, 'pbr': True, 'texture_quality': 'standard', 'auto_size': True}
        path = '/generation/multiview-to-model'
    elif step == 'rigcheck':
        out = call('/animations/rig-check', {'input': last_task(d, 'model')})
        if out.get('task_id'):
            out = wait(out['task_id']).get('output')
        print(json.dumps(out))
        return
    elif step == 'rig':
        body = {'input': last_task(d, 'model'), 'model': RIG_MODEL, 'rig_type': sys.argv[3], 'spec': 'tripo'}
        path = '/animations/rig'
    else:
        sys.exit('unknown step ' + step)
    tid = call(path, body)['task_id']
    print(key, step, 'queued', tid, flush=True)
    task = wait(tid)
    settings = {k: v for k, v in body.items() if k != 'input' or step != 'multiview'}
    keep(d, key, step, tid, settings, task)


def balance():
    for path in ('/account/balance',):
        try:
            return call(path)
        except SystemExit as e:
            last = e
    raise last


if __name__ == '__main__':
    main()
