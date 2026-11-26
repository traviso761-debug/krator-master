#!/usr/bin/env python3
"""Marigold-IID lighting's albedo for the baked-lighting trial (README.md here): a quality check in PyTorch on the CPU, before
any work to put it on the NPU.

    <export venv>/python tools/textures/trials/npu-delight/marigold.py OUT_DIR [--steps 4] [--res 768]

Reads OUT_DIR/<set>/baked.png (trial.py writes them), writes OUT_DIR/<set>/marigold.png; trial.py then scores it. Also
takes any image: --image PATH --to PATH. The weights (prs-eth/marigold-iid-lighting-v1-1, CreativeML OpenRAIL++-M) go into
%LOCALAPPDATA%/krator-models/hf. Needs torch, diffusers and transformers: a separate venv (README.md, "Reproduce").
"""
import argparse, glob, os, sys, time

os.environ.setdefault('HF_HOME', os.path.join(os.environ.get('LOCALAPPDATA', '.'), 'krator-models', 'hf'))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('out', nargs='?')
    ap.add_argument('--image'); ap.add_argument('--to')
    ap.add_argument('--steps', type=int, default=4)
    ap.add_argument('--res', type=int, default=768)
    a = ap.parse_args()
    import torch
    from diffusers import MarigoldIntrinsicsPipeline
    from PIL import Image
    t = time.time()
    pipe = MarigoldIntrinsicsPipeline.from_pretrained('prs-eth/marigold-iid-lighting-v1-1', variant='fp16', torch_dtype=torch.float32)
    print('loaded in %.0f s; targets %s' % (time.time() - t, pipe.target_properties.get('target_names')))
    jobs = [(a.image, a.to)] if a.image else [(p, os.path.join(os.path.dirname(p), 'marigold.png')) for p in sorted(glob.glob(os.path.join(a.out, '*', 'baked.png')))]
    for src, dst in jobs:
        im = Image.open(src).convert('RGB')
        t = time.time()
        r = pipe(im, num_inference_steps=a.steps, processing_resolution=a.res, generator=torch.Generator().manual_seed(0))
        vis = pipe.image_processor.visualize_intrinsics(r.prediction, pipe.target_properties)
        vis[0]['albedo'].resize(im.size, Image.LANCZOS).save(dst)
        print('%-40s %.0f s' % (os.path.basename(os.path.dirname(src)) if not a.image else src, time.time() - t))
    return 0


if __name__ == '__main__':
    sys.exit(main())
