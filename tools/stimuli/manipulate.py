"""Render AI edits and fully generated images for the stimulus collection.

Runs FLUX.2 [klein] 4B (Apache-2.0) locally on the CPU through Hugging Face
diffusers, like generate.py: prompts are encoded first, the text encoder is
released, then the transformer renders each job with a fixed seed. A job with
an "image" path is an edit of that (standardised) photograph; a job without one
is generated from the prompt alone. Each output PNG gets a JSON sidecar with
the prompt, seed, model revision, settings and software versions, which
tools/stimuli/register.py records in the catalogue. Nothing leaves the machine
and no input is used for training.

Usage (from a virtual environment with torch, diffusers and transformers):
    python tools/stimuli/manipulate.py JOBS.json OUTPUT_FOLDER
or, much faster, on the model makers' public Hugging Face Space (same model,
GPU, 1,024 px; needs gradio_client and network access to *.hf.space):
    python tools/stimuli/manipulate.py --space JOBS.json OUTPUT_FOLDER
Space outputs are saved exactly as received (WebP) with the same sidecar.
JOBS.json is a list of {"id", "prompt", "seed", "image" (optional), "steps"
(default 4), "size" (default 512)}. Jobs whose output already exists are
skipped. Outputs are working files; inspect them before registering any.
"""
import gc, json, sys, time
from pathlib import Path
from PIL import Image

SPACE = "black-forest-labs/FLUX.2-klein-4B"
if sys.argv[1] == "--space":
    import shutil
    import gradio_client
    jobs = json.loads(Path(sys.argv[2]).read_text()); out = Path(sys.argv[3]); out.mkdir(parents=True, exist_ok=True)
    client = gradio_client.Client(SPACE, verbose=False)
    for n, j in enumerate(jobs, 1):
        if (out / f"{j['id']}.json").exists():
            continue
        size = j.get("size", 1024); t = time.time()
        images = [gradio_client.handle_file(j["image"])] if j.get("image") else []
        try:
            result, seed = client.predict(j["prompt"], images, "Distilled (4 steps)", j["seed"], False, size, size, j.get("steps", 4), 1.0, False, api_name="/infer")
        except Exception as error:
            print(f"[{n}/{len(jobs)}] {j['id']} failed: {error}", flush=True)
            if "quota" in str(error).lower():
                break
            continue
        source = Path(result["path"] if isinstance(result, dict) else result)
        target = out / f"{j['id']}{source.suffix}"
        shutil.copyfile(source, target)
        record = dict(j, model="black-forest-labs/FLUX.2-klein-4B", model_revision="e7b7dc27f91deacad38e78976d1f2b499d76a294 (Space default; not pinned by the client)",
                      guidance_scale=1.0, steps=j.get("steps", 4), width=size, height=size, precision=f"GPU on the Hugging Face Space {SPACE} (ZeroGPU)",
                      software={"gradio_client": gradio_client.__version__, "space": SPACE}, generated_at=time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                      seconds=round(time.time() - t), output_file=target.name)
        (out / f"{j['id']}.json").write_text(json.dumps(record, indent=2) + "\n")
        print(f"[{n}/{len(jobs)}] {j['id']} {time.time() - t:.0f}s", flush=True)
    sys.exit()

import diffusers, torch, transformers
MODEL = 'black-forest-labs/FLUX.2-klein-4B'; REV = 'e7b7dc27f91deacad38e78976d1f2b499d76a294'

def _linear_fp32(self, x):
    bias = None if self.bias is None else self.bias.float()
    return torch.nn.functional.linear(x.float(), self.weight.float(), bias)

def compute_in_fp32(module):
    for child in module.modules():
        if isinstance(child, torch.nn.Linear): continue
        for name, p in child.named_parameters(recurse=False):
            if p.dtype == torch.bfloat16: setattr(child, name, torch.nn.Parameter(p.float(), requires_grad=False))
        for name, b in child.named_buffers(recurse=False):
            if b.dtype == torch.bfloat16: child.register_buffer(name, b.float())

jobs = json.loads(Path(sys.argv[1]).read_text()); out = Path(sys.argv[2]); out.mkdir(parents=True, exist_ok=True)
jobs = [j for j in jobs if not (out / f"{j['id']}.png").exists()]
if not jobs: print('nothing to do'); sys.exit()
torch.set_num_threads(4)
torch.nn.Linear.forward = _linear_fp32
pipe = diffusers.Flux2KleinPipeline.from_pretrained(MODEL, revision=REV, transformer=None, vae=None, torch_dtype=torch.bfloat16)
compute_in_fp32(pipe.text_encoder)
embeds = {}
with torch.inference_mode():
    for j in jobs:
        embeds[j['id']] = pipe.encode_prompt(prompt=j['prompt'], device='cpu')[0].float()
del pipe; gc.collect(); print(f'encoded {len(jobs)}', flush=True)
pipe = diffusers.Flux2KleinPipeline.from_pretrained(MODEL, revision=REV, text_encoder=None, tokenizer=None, torch_dtype=torch.bfloat16)
compute_in_fp32(pipe.transformer); pipe.vae.to(torch.float32)
for n, j in enumerate(jobs, 1):
    t = time.time(); size = j.get('size', 512)
    kw = dict(prompt_embeds=embeds[j['id']], width=size, height=size, num_inference_steps=j.get('steps', 4), guidance_scale=1.0,
              generator=torch.Generator('cpu').manual_seed(j['seed']))
    if j.get('image'): kw['image'] = [Image.open(j['image']).convert('RGB')]
    with torch.inference_mode():
        img = pipe(**kw).images[0]
    img.save(out / f"{j['id']}.png")
    rec = dict(j, model=MODEL, model_revision=REV, guidance_scale=1.0, steps=j.get('steps', 4), width=size, height=size,
               precision='bfloat16 weights, float32 computation, CPU',
               software={'torch': torch.__version__, 'diffusers': diffusers.__version__, 'transformers': transformers.__version__},
               generated_at=time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), seconds=round(time.time() - t))
    (out / f"{j['id']}.json").write_text(json.dumps(rec, indent=2) + '\n')
    print(f"[{n}/{len(jobs)}] {j['id']} {time.time()-t:.0f}s", flush=True)
