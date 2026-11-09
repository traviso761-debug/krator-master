#!/usr/bin/env python3
"""Generate one animal on fal from its three reference views: python3 rig/fal_gen.py <key> <rodin|hunyuan|trellis> [request_id]

A request id fetches a run that already finished, without paying again.

Reads rig/sources/<key>/front.png, left.png, back.png, runs the model on fal's queue, and writes rig/sources/<key>/raw-<model>.glb and
raw-<model>.json (the request's settings, fal's request id, the price paid). The key comes from the file FAL_KEY_FILE names; it is sent
only to fal and is never printed. Nothing but the standard library.
"""
import base64, json, os, subprocess, sys, time, urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
KEYFILE = os.environ.get('FAL_KEY_FILE') or os.path.expanduser('~/.krator-keys/fal.txt')
MODELS = {
    'rodin': ('fal-ai/hyper3d/rodin', 0.40, lambda v: {'input_image_urls': [v['front'], v['left'], v['back']], 'condition_mode': 'concat', 'geometry_file_format': 'glb', 'material': 'PBR', 'quality': 'medium', 'tier': 'Regular', 'seed': 7}),
    'hunyuan': ('fal-ai/hunyuan3d/v2/multi-view', 0.48, lambda v: {'front_image_url': v['front'], 'left_image_url': v['left'], 'back_image_url': v['back'], 'textured_mesh': True, 'seed': 7}),
    'trellis': ('fal-ai/trellis/multi', 0.02, lambda v: {'image_urls': [v['front'], v['left'], v['back']], 'texture_size': 1024, 'multiimage_algo': 'multidiffusion', 'seed': 7}),
}


def call(url, key, body=None):
    req = urllib.request.Request(url, data=None if body is None else json.dumps(body).encode(), headers={'Authorization': 'Key ' + key, 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit('fal %s: %s' % (e.code, e.read()[:500].decode('utf-8', 'replace')))


def main():
    key, name = sys.argv[1], sys.argv[2]
    path, price, inputs = MODELS[name]
    d = os.path.join(HERE, 'sources', key)
    views = {}
    for v in ('front', 'left', 'back'):
        with open(os.path.join(d, v + '.png'), 'rb') as fh:
            views[v] = 'data:image/png;base64,' + base64.b64encode(fh.read()).decode('ascii')
    with open(KEYFILE, encoding='utf-8') as fh:
        secret = fh.read().strip()
    body = inputs(views)
    if len(sys.argv) > 3:      # a finished request whose file did not arrive: fetch it again, unpaid
        rid = sys.argv[3]; base = 'https://queue.fal.run/' + '/'.join(path.split('/')[:2]) + '/requests/' + rid
        status_url, result_url = base + '/status', base
    else:
        job = call('https://queue.fal.run/' + path, secret, body)
        rid, status_url, result_url = job['request_id'], job['status_url'], job['response_url']
    print(key, name, 'queued', rid, flush=True)
    t0 = time.time()
    while True:
        s = call(status_url, secret)
        if s.get('status') == 'COMPLETED':
            break
        if time.time() - t0 > 900:
            sys.exit('%s %s: gave up after 15 minutes, request %s still %s' % (key, name, rid, s.get('status')))
        time.sleep(6)
    res = call(result_url, secret)
    mesh = res.get('model_mesh') or {}
    if not mesh.get('url'):
        sys.exit('%s %s: no mesh in the result: %s' % (key, name, list(res)))
    out = os.path.join(d, 'raw-%s.glb' % name)
    # curl, on the operating system's certificate store: Python's own store does not hold the chain of fal's file host
    subprocess.run(['curl', '-fsSL', '--max-time', '300', '-o', out, mesh['url']], check=True)
    rec ={'generator': path, 'request_id': rid, 'price_usd': price, 'seed': res.get('seed', 7), 'settings': {k: v for k, v in body.items() if not (isinstance(v, str) and v.startswith('data:')) and not isinstance(v, list)},
           'views': ['front.png', 'left.png', 'back.png'], 'seconds': round(time.time() - t0), 'raw': os.path.basename(out)}
    with open(os.path.join(d, 'raw-%s.json' % name), 'w', encoding='utf-8', newline='\n') as fh:
        json.dump(rec, fh, indent=1, sort_keys=True)
    print(key, name, 'done in %ds, %.1f MB' % (rec['seconds'], os.path.getsize(out) / 1e6), flush=True)


if __name__ == '__main__':
    main()
