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
JOBS.json is a list of {"id", "prompt", "seed", "image" (optional), "steps"
(default 4), "size" (default 512)}. Jobs whose output already exists are
skipped. Outputs are working files; inspect them before registering any.
"""
import gc, json, sys, time
from pathlib import Path
import diffusers, torch, transformers
from PIL import Image
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
