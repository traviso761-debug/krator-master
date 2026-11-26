#!/usr/bin/env python3
"""The baked light of a texture, from Marigold-IID lighting (prs-eth/marigold-iid-lighting-v1-1, CreativeML OpenRAIL++-M:
commercial use allowed under its use restrictions), for process.py's `--delight marigold`
(tools/textures/trials/npu-delight/README.md has the trial that chose it).

Marigold's albedo is smeared below a few pixels, but its light is right. So process.py takes only the light: the image's
luminance over the albedo's, both blurred past the smear, and divides the image by it. The image keeps its own detail.

It runs on OpenVINO with no PyTorch: the VAE encoder, the UNet and the VAE decoder as IR at a fixed 768 px, the
empty-prompt text embedding as a .npy file, and the DDIM sampling loop below in numpy, four steps as the model's own
default. It matches diffusers' pipeline to 0.5/255 on average (`--compare`). About 20 s a set once warm (encoder and UNet
on the NPU, the decoder on the CPU: class Marigold); the first set in a process about 18 s more.

Setup, once. The export needs PyTorch, in a venv of its own:

    python -m venv "$env:LOCALAPPDATA\\krator-models\\venv-export"
    & "$env:LOCALAPPDATA\\krator-models\\venv-export\\Scripts\\python.exe" -m pip install torch --index-url https://download.pytorch.org/whl/cpu
    & "$env:LOCALAPPDATA\\krator-models\\venv-export\\Scripts\\python.exe" -m pip install diffusers transformers accelerate safetensors openvino numpy pillow
    & "$env:LOCALAPPDATA\\krator-models\\venv-export\\Scripts\\python.exe" tools/textures/marigold_iid.py --export

Then process.py runs it from the model venv (tools/textures/depth.py, "Setup"): no PyTorch there. The export downloads
about 2.5 GB into %LOCALAPPDATA%/krator-models/hf and writes about 1.8 GB of IR. KRATOR_MARIGOLD_DEVICE overrides the
encoder's and the UNet's device (default NPU, falling back to the CPU, also when the NPU fails mid-run). The NPU works in
fp16, so a set's bytes differ by device; meta.json records the devices.
"""
import argparse, os, sys, time
import numpy as np

RES, LAT, STEPS, SCALE = 768, 96, 4, 0.18215
BORDER = 64            # the wrap border round the texture in the 768 frame, so the light at one edge sees the other
PARTS = ('marigold-vae-encoder', 'marigold-iid-unet-768', 'marigold-vae-decoder')
SETUP = 'set Marigold up first: tools/textures/marigold_iid.py, "Setup" (a PyTorch venv, then marigold_iid.py --export)'


def model_dir():
    return os.environ.get('KRATOR_MODELS') or os.path.join(os.environ.get('LOCALAPPDATA', os.path.expanduser('~/.cache')), 'krator-models')


def ir(name):
    return os.path.join(model_dir(), 'ir', name + '.xml')


# ---------------------------------------------------------------- the DDIM scheduler, as the model's config sets it
def schedule(steps=STEPS):
    """(timesteps, alphas_cumprod, final): scaled-linear betas 0.00085..0.012 over 1000, rescaled to zero terminal SNR,
    'trailing' spacing, set_alpha_to_one false: diffusers' DDIMScheduler with Marigold-IID's scheduler_config.json."""
    betas = np.linspace(0.00085 ** 0.5, 0.012 ** 0.5, 1000, dtype=np.float64) ** 2
    ab = np.sqrt(np.cumprod(1 - betas))
    a0, aT = ab[0], ab[-1]
    ab = (ab - aT) * a0 / (a0 - aT)
    ab2 = ab ** 2
    alphas = np.concatenate([ab2[:1], ab2[1:] / ab2[:-1]])
    ac = np.cumprod(alphas)
    ts = (np.round(np.arange(1000, 0, -1000 / steps)) - 1).astype(np.int64)
    return ts, ac, ac[0]


def ddim_step(v, t, x, ac, final, steps=STEPS):
    """One DDIM step (eta 0) for a v-prediction model."""
    prev = t - 1000 // steps
    a_t = ac[t]; a_p = ac[prev] if prev >= 0 else final
    x0 = np.sqrt(a_t) * x - np.sqrt(1 - a_t) * v
    eps = np.sqrt(a_t) * v + np.sqrt(1 - a_t) * x
    return np.sqrt(a_p) * x0 + np.sqrt(1 - a_p) * eps


# ---------------------------------------------------------------- the runtime (openvino and numpy only)
class Part:
    """One converted network on a device, falling back to the CPU when the device will not compile it or fails while
    running (the NPU can report 'device lost' and stay unusable for the rest of the process)."""
    def __init__(self, core, name, want):
        self.core, self.name = core, name
        for dev in [want] + (['CPU'] if want != 'CPU' else []):
            if dev.split('.')[0] not in [d.split('.')[0] for d in core.available_devices]:
                continue
            try:
                self.net, self.device = core.compile_model(ir(name), dev), dev
                return
            except Exception as e:
                print('marigold_iid.py: %s would not compile %s (%s); trying the CPU' % (dev, name, str(e).strip().splitlines()[-1][:120]))
        raise SystemExit('marigold_iid.py: no device compiled ' + name)

    def __call__(self, feed):
        try:
            return self.net(feed)
        except RuntimeError as e:
            if self.device == 'CPU':
                raise
            print('marigold_iid.py: %s failed on %s (%s); the CPU from here on' % (self.name, self.device, str(e).strip().splitlines()[-1][:120]))
            self.net, self.device = self.core.compile_model(ir(self.name), 'CPU'), 'CPU'
            return self.net(feed)


class Marigold:
    """The encoder and the UNet on the NPU (1.0 s and 1.7 s a step there, against 4.6 s and 4.8 s on the CPU; the first
    UNet step on a fresh process takes about 18 s more while its weights load); the decoder on the CPU (12 to 16 s): on
    the NPU it hangs the device."""
    def __init__(self, device=None):
        try:
            import openvino as ov
        except ImportError:
            raise SystemExit('marigold_iid.py: openvino is not installed in this Python; ' + SETUP)
        missing = [p for p in PARTS if not os.path.exists(ir(p))] + ([] if os.path.exists(self.text_path()) else ['text embedding'])
        if missing:
            raise SystemExit('marigold_iid.py: missing %s in %s; %s' % (', '.join(missing), model_dir(), SETUP))
        core = ov.Core()
        core.set_property({'CACHE_DIR': os.path.join(model_dir(), 'cache')})
        self.text = np.load(self.text_path()).astype(np.float32)
        want = device or os.environ.get('KRATOR_MARIGOLD_DEVICE') or 'NPU'
        self.enc, self.unet = Part(core, PARTS[0], want), Part(core, PARTS[1], want)
        self.dec = Part(core, PARTS[2], 'CPU')

    @property
    def device(self):
        return 'encoder %s, UNet %s, decoder %s' % (self.enc.device, self.unet.device, self.dec.device)

    @staticmethod
    def text_path():
        return os.path.join(model_dir(), 'ir', 'marigold-empty-text.npy')

    def albedo(self, frame, seed=0, noise=None):
        """frame: 768 x 768 x 3 sRGB in [0, 1] -> Marigold's albedo, 768 x 768 x 3 sRGB in [0, 1]."""
        x = (frame.astype(np.float32) * 2 - 1).transpose(2, 0, 1)[None]
        img_lat = np.asarray(self.enc(x)[0], np.float32) * SCALE
        pred = np.random.default_rng(seed).standard_normal((1, 12, LAT, LAT)).astype(np.float32) if noise is None else noise
        ts, ac, final = schedule()
        t_arr = np.zeros(1, np.int64)
        for t in ts:
            t_arr[0] = t
            v = np.asarray(self.unet([np.concatenate([img_lat, pred], 1), t_arr, self.text])[0], np.float32)
            pred = ddim_step(v, int(t), pred, ac, final).astype(np.float32)
        out = np.asarray(self.dec(pred[:, :4] / SCALE)[0], np.float32)[0].transpose(1, 2, 0)
        return np.clip((np.clip(out, -1, 1) + 1) / 2, 0, 1) ** (1 / 2.2)


def light(a, model, blur, ratio_blur=2.0):
    """The baked light of a periodic texture a (H x W x 3 in [0, 1]), at a's size, with mean 1: Marigold's albedo of a
    wrap-bordered 768 frame, then the image's luminance over the albedo's, both blurred `ratio_blur` source pixels.
    `blur` is process.py's periodic blur."""
    from PIL import Image
    H, W = a.shape[:2]
    inner = RES - 2 * BORDER
    small = np.asarray(Image.fromarray((np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)).resize((inner, inner), Image.LANCZOS), np.float32) / 255
    frame = np.pad(small, ((BORDER, BORDER), (BORDER, BORDER), (0, 0)), mode='wrap')
    alb = model.albedo(frame)[BORDER:BORDER + inner, BORDER:BORDER + inner]
    alb = np.asarray(Image.fromarray((alb * 255 + 0.5).astype(np.uint8)).resize((W, H), Image.LANCZOS), np.float64) / 255
    lum = lambda x: x[..., 0] * 0.2126 + x[..., 1] * 0.7152 + x[..., 2] * 0.0722
    R = blur(lum(a), sigma=ratio_blur) / np.maximum(blur(lum(alb), sigma=ratio_blur), 1e-3)
    R = np.maximum(R, 0.05)
    return R / np.median(R)


_cached = None


def baked_light(a, blur, device=None):
    """process.py's entry: (the light to divide out, the UNet's device)."""
    global _cached
    if _cached is None:
        _cached = Marigold(device)
    return light(a, _cached, blur), _cached.device


# ---------------------------------------------------------------- the export (PyTorch, once)
def export():
    os.environ.setdefault('HF_HOME', os.path.join(model_dir(), 'hf'))
    import torch, openvino as ov
    from diffusers import MarigoldIntrinsicsPipeline
    pipe = MarigoldIntrinsicsPipeline.from_pretrained('prs-eth/marigold-iid-lighting-v1-1', variant='fp16', torch_dtype=torch.float32)
    os.makedirs(os.path.join(model_dir(), 'ir'), exist_ok=True)
    with torch.no_grad():
        ids = pipe.tokenizer('', padding='do_not_pad', max_length=pipe.tokenizer.model_max_length, truncation=True, return_tensors='pt').input_ids
        text = pipe.text_encoder(ids)[0]
        np.save(Marigold.text_path(), text.numpy())
        print('text embedding', tuple(text.shape))
        vae = pipe.vae.eval()

        class Enc(torch.nn.Module):
            def __init__(s):
                super().__init__(); s.v = vae
            def forward(s, x):
                return s.v.encode(x).latent_dist.mode()

        class Dec(torch.nn.Module):
            def __init__(s):
                super().__init__(); s.v = vae
            def forward(s, z):
                return s.v.decode(z, return_dict=False)[0]

        class Step(torch.nn.Module):
            def __init__(s):
                super().__init__(); s.u = pipe.unet.eval()
            def forward(s, x, t, ctx):
                return s.u(x, t, encoder_hidden_states=ctx, return_dict=False)[0]

        jobs = ((PARTS[0], Enc(), (torch.zeros(1, 3, RES, RES),)),
                (PARTS[2], Dec(), (torch.zeros(1, 4, LAT, LAT),)),
                (PARTS[1], Step(), (torch.zeros(1, 16, LAT, LAT), torch.tensor([999], dtype=torch.int64), text)))
        for name, mod, ex in jobs:
            if os.path.exists(ir(name)):
                print('have', ir(name)); continue
            t = time.time()
            m = ov.convert_model(mod.eval(), example_input=ex)
            m.reshape({m.inputs[i]: ov.PartialShape(list(v.shape)) for i, v in enumerate(ex)})
            ov.save_model(m, ir(name), compress_to_fp16=True)
            print('wrote %s in %.0f s' % (ir(name), time.time() - t))


def compare(path):
    """The numpy pipeline against diffusers' on one image with the same starting noise, both on the CPU: the albedos'
    mean and max difference (0-255)."""
    os.environ.setdefault('HF_HOME', os.path.join(model_dir(), 'hf'))
    import torch
    from diffusers import MarigoldIntrinsicsPipeline
    from PIL import Image
    frame = np.asarray(Image.open(path).convert('RGB').resize((RES, RES), Image.LANCZOS), np.float32) / 255
    noise = np.random.default_rng(0).standard_normal((1, 12, LAT, LAT)).astype(np.float32)
    t = time.time(); ours = Marigold('CPU').albedo(frame, noise=noise); t_ours = time.time() - t
    pipe = MarigoldIntrinsicsPipeline.from_pretrained('prs-eth/marigold-iid-lighting-v1-1', variant='fp16', torch_dtype=torch.float32)
    t = time.time()
    r = pipe(Image.fromarray((frame * 255 + 0.5).astype(np.uint8)), num_inference_steps=STEPS, processing_resolution=RES,
             latents=torch.from_numpy(noise))
    t_ref = time.time() - t
    ref = np.asarray(pipe.image_processor.visualize_intrinsics(r.prediction, pipe.target_properties)[0]['albedo'], np.float32) / 255
    d = np.abs(ours - ref) * 255
    print('numpy+OpenVINO (CPU) %.0f s, diffusers %.0f s; albedo difference mean %.2f, p99 %.1f, max %.1f (0-255)'
          % (t_ours, t_ref, d.mean(), np.percentile(d, 99), d.max()))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--export', action='store_true', help='convert the model to IR (needs PyTorch and diffusers)')
    ap.add_argument('--compare', metavar='IMAGE', help='check the numpy pipeline against diffusers on one image (needs both)')
    ap.add_argument('--check', action='store_true', help='compile the parts and time one albedo')
    a = ap.parse_args()
    if a.export:
        export()
    elif a.compare:
        compare(a.compare)
    elif a.check:
        m = Marigold()
        for i in range(2):
            t = time.time(); m.albedo(np.full((RES, RES, 3), 0.5, np.float32)); print('%s: %.1f s an albedo%s' % (m.device, time.time() - t, ' (the first: weights loading)' if i == 0 else ''))
    else:
        ap.print_help()
    return 0


if __name__ == '__main__':
    sys.exit(main())
