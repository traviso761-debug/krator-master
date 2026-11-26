#!/usr/bin/env python3
"""Can Marigold-IID's UNet (the part that runs once per diffusion step) run on the NPU? Converts it from PyTorch to OpenVINO
IR with a fixed shape (one 768 px image: an 8-channel 96 x 96 latent) and times one step on each device against PyTorch.

    <export venv>/python tools/textures/trials/npu-delight/unet_npu.py [--res 768]

Writes %LOCALAPPDATA%/krator-models/ir/marigold-iid-unet-<res>.xml (fp16 weights).
"""
import argparse, os, sys, time

os.environ.setdefault('HF_HOME', os.path.join(os.environ.get('LOCALAPPDATA', '.'), 'krator-models', 'hf'))


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--res', type=int, default=768)
    a = ap.parse_args()
    import numpy as np, torch, openvino as ov
    from diffusers import MarigoldIntrinsicsPipeline
    pipe = MarigoldIntrinsicsPipeline.from_pretrained('prs-eth/marigold-iid-lighting-v1-1', variant='fp16', torch_dtype=torch.float32)
    unet = pipe.unet.eval()
    n_out = pipe.unet.config.in_channels - 4
    lat = a.res // 8
    x = torch.randn(1, unet.config.in_channels, lat, lat)
    t = torch.tensor([999], dtype=torch.int64)
    ctx = torch.zeros(1, 2, unet.config.cross_attention_dim)
    print('unet in_channels', unet.config.in_channels, 'out', n_out, 'latent', lat, 'text tokens', ctx.shape)

    class Step(torch.nn.Module):
        def __init__(s, u):
            super().__init__(); s.u = u
        def forward(s, x, t, ctx):
            return s.u(x, t, encoder_hidden_states=ctx, return_dict=False)[0]
    step = Step(unet).eval()
    with torch.no_grad():
        t0 = time.time(); ref = step(x, t, ctx); print('torch CPU one step: %.2f s' % (time.time() - t0))
        t0 = time.time(); m = ov.convert_model(step, example_input=(x, t, ctx)); print('converted in %.0f s' % (time.time() - t0))
    m.reshape({m.inputs[i]: ov.PartialShape(list(v.shape)) for i, v in enumerate((x, t, ctx))})
    path = os.path.join(os.environ['LOCALAPPDATA'], 'krator-models', 'ir', 'marigold-iid-unet-%d.xml' % a.res)
    ov.save_model(m, path, compress_to_fp16=True); print('wrote', path)
    core = ov.Core(); core.set_property({'CACHE_DIR': os.path.join(os.environ['LOCALAPPDATA'], 'krator-models', 'cache')})
    feed = [x.numpy(), t.numpy(), ctx.numpy()]
    for dev in ('NPU', 'CPU'):          # not the GPU: it is the verifies' (the GPU lock)
        try:
            t0 = time.time(); net = core.compile_model(path, dev); ct = time.time() - t0
            out = net(feed)[0]; t0 = time.time(); out = net(feed)[0]; st = time.time() - t0
            err = float(np.abs(out - ref.numpy()).max() / max(np.abs(ref.numpy()).max(), 1e-6))
            print('%-6s compile %.0f s, one step %.2f s, max rel diff to torch %.3f' % (dev, ct, st, err))
        except Exception as e:
            print('%-6s FAILED: %s' % (dev, str(e).strip().splitlines()[-1][:200]))
    return 0


if __name__ == '__main__':
    sys.exit(main())
