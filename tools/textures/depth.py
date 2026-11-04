#!/usr/bin/env python3
"""Relative depth of a texture from a depth model, for process.py's `--height model` and `--height split`
(tools/textures/trials/npu-normals/README.md has the trial that chose them).

The model is Depth Anything V2 Small (Apache-2.0; its Base, Large and Giant weights are non-commercial, do not use them),
as OpenVINO IR with a fixed 518 x 518 input. It runs on the laptop's NPU (0.1 s a frame) and falls back to the CPU
(0.4 s a frame) when there is no NPU or the NPU will not compile it. The weights live outside the repo, in
%LOCALAPPDATA%/krator-models (or $KRATOR_MODELS).

Setup, once, in a venv that has openvino (the system Python's packages stay as they are):

    python -m venv "$env:LOCALAPPDATA\\krator-models\\venv"
    & "$env:LOCALAPPDATA\\krator-models\\venv\\Scripts\\python.exe" -m pip install openvino numpy pillow
    & "$env:LOCALAPPDATA\\krator-models\\venv\\Scripts\\python.exe" tools/textures/depth.py --setup

and run process.py with that venv's python when a set asks for `height` 'model' or 'split'. KRATOR_DEPTH_DEVICE
(e.g. CPU, GPU.0) overrides the device. The depth differs in its last bits between devices (the NPU works in fp16), so a set
made with `height` 'model' is deterministic per device, not across them; meta.json records the device.
"""
import argparse, os, sys, time
import numpy as np

NAME = 'depth-anything-v2-small'
URL = 'https://huggingface.co/onnx-community/depth-anything-v2-small/resolve/main/onnx/model.onnx'
WIN = 518
MEAN, STD = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
SETUP = 'set the depth model up first: tools/textures/depth.py, "Setup" (a venv with openvino, then depth.py --setup)'


def model_dir():
    return os.environ.get('KRATOR_MODELS') or os.path.join(os.environ.get('LOCALAPPDATA', os.path.expanduser('~/.cache')), 'krator-models')


def ir_path():
    return os.path.join(model_dir(), 'ir', NAME + '.xml')


class Depth:
    """One compiled model. frame(a): a 518 x 518 x 3 image in [0, 1] -> its relative depth (larger = nearer)."""
    def __init__(self, device=None):
        try:
            import openvino as ov
        except ImportError:
            raise SystemExit('depth.py: openvino is not installed in this Python; ' + SETUP)
        if not os.path.exists(ir_path()):
            raise SystemExit('depth.py: no model at %s; %s' % (ir_path(), SETUP))
        want = device or os.environ.get('KRATOR_DEPTH_DEVICE') or 'NPU'
        core = ov.Core()
        for dev in [want] + (['CPU'] if want != 'CPU' else []):
            if dev.split('.')[0] not in [d.split('.')[0] for d in core.available_devices]:
                continue
            try:
                self.net, self.device = core.compile_model(ir_path(), dev), dev
                return
            except Exception as e:
                print('depth.py: %s would not compile the model (%s); trying the CPU' % (dev, str(e).strip().splitlines()[-1][:120]))
        raise SystemExit('depth.py: no device compiled the model')

    def frame(self, a):
        x = ((a - MEAN) / STD).transpose(2, 0, 1)[None].astype(np.float32)
        return np.asarray(self.net(x)[0], np.float64).reshape(WIN, WIN)


def periodic_height(a, frame, win=WIN):
    """Relative depth of a periodic image at its own scale, still periodic: windows of `win` px laid round the torus
    (3 x 3 for 1024), each standardised (the model knows depth only up to scale and shift) and feathered into the sum.
    `frame` is Depth.frame, or any function of a win x win x 3 array to a win x win one."""
    H, W = a.shape[:2]
    nx, ny = int(np.ceil(W / (win * 0.66))), int(np.ceil(H / (win * 0.66)))
    acc, wsum = np.zeros((H, W)), np.zeros((H, W))
    f = np.sin(np.pi * (np.arange(win) + 0.5) / win) ** 2 + 1e-3
    wt = f[:, None] * f[None, :]
    for j in range(ny):
        for i in range(nx):
            ys, xs = (np.arange(win) + j * H // ny) % H, (np.arange(win) + i * W // nx) % W
            d = frame(a[np.ix_(ys, xs)])
            d = (d - d.mean()) / max(d.std(), 1e-6)
            np.add.at(acc, np.ix_(ys, xs), d * wt)
            np.add.at(wsum, np.ix_(ys, xs), wt)
    return acc / wsum


_cached = None


def height(a, device=None):
    """process.py's entry: the depth of albedo `a` (H x W x 3 in [0, 1]) and the device that made it."""
    global _cached
    if _cached is None or (device and _cached.device != device):
        _cached = Depth(device)
    return periodic_height(a, _cached.frame), _cached.device


def setup():
    """Fetch the ONNX weights and write the fixed-shape IR (the NPU needs static shapes)."""
    import urllib.request
    import openvino as ov
    onnx = os.path.join(model_dir(), 'onnx', NAME + '.onnx')
    os.makedirs(os.path.dirname(onnx), exist_ok=True); os.makedirs(os.path.dirname(ir_path()), exist_ok=True)
    if not os.path.exists(onnx):
        print('fetching', URL); urllib.request.urlretrieve(URL, onnx)
    m = ov.convert_model(onnx)
    m.reshape({m.inputs[0].get_any_name(): [1, 3, WIN, WIN]})
    ov.save_model(m, ir_path())
    print('wrote', ir_path())
    t = time.time(); d = Depth(); print('compiled on %s in %.1f s' % (d.device, time.time() - t))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--setup', action='store_true', help='fetch the weights and write the IR into the model folder')
    ap.add_argument('--check', action='store_true', help='compile the model and say on which device')
    a = ap.parse_args()
    if a.setup:
        setup()
    elif a.check:
        d = Depth(); t = time.time(); d.frame(np.full((WIN, WIN, 3), 0.5)); print('%s: %.3f s a frame' % (d.device, time.time() - t))
    else:
        ap.print_help()
    return 0


if __name__ == '__main__':
    sys.exit(main())
