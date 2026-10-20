"""Render the raw stimulus photographs listed in source.json.

Every tile is generated locally by FLUX.2 [klein] 4B (Apache-2.0) through
Hugging Face diffusers, with a fixed seed on a CPU generator, so a tile can be
regenerated from its prompt and seed alone. Raw renders and a sidecar record of
each one go to tools/stimuli/.cache/raw/ (git-ignored); build.py turns them into
the published assets and the catalogue.

The text encoder and the transformer do not fit in memory together on a small
machine, so prompts are encoded first, the encoder is released, and only then is
the transformer loaded. Weights stay in bfloat16 to save memory, but every
computation runs in float32: CPUs without native bfloat16 arithmetic are several
times slower in bfloat16, and float32 is the more faithful of the two anyway.

Usage (from a virtual environment with torch, diffusers and transformers):
    python tools/stimuli/generate.py [TILE_ID ...]
With no arguments, renders every tile of the published grids whose raw file is
missing or whose prompt or seed has changed since it was rendered. Grids marked
"published": false are prepared for later and rendered only by naming their tiles.
"""

import gc
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

import diffusers
import torch
import transformers

HERE = Path(__file__).resolve().parent
RAW = HERE / ".cache" / "raw"


def _linear_fp32(self, x: torch.Tensor) -> torch.Tensor:
    bias = None if self.bias is None else self.bias.float()
    return torch.nn.functional.linear(x.float(), self.weight.float(), bias)


def compute_in_fp32(module: torch.nn.Module) -> None:
    """Keep Linear weights in bfloat16 (upcast per call); move everything else to float32."""
    for child in module.modules():
        if isinstance(child, torch.nn.Linear):
            continue
        for name, param in child.named_parameters(recurse=False):
            if param.dtype == torch.bfloat16:
                setattr(child, name, torch.nn.Parameter(param.float(), requires_grad=False))
        for name, buffer in child.named_buffers(recurse=False):
            if buffer.dtype == torch.bfloat16:
                child.register_buffer(name, buffer.float())


def full_prompt(spec: dict, tile: dict) -> str:
    return f'{tile["prompt"]}, {spec["style"][tile["style"]]}'


def is_current(spec: dict, tile: dict) -> bool:
    sidecar = RAW / f'{tile["tile_id"]}.json'
    if not sidecar.exists() or not (RAW / f'{tile["tile_id"]}.png').exists():
        return False
    record = json.loads(sidecar.read_text())
    return (
        record["prompt"] == full_prompt(spec, tile)
        and record["seed"] == tile["seed"]
        and record["model"] == spec["model"]
        and record["width"] == spec["width"]
    )


def main() -> None:
    spec = json.loads((HERE / "source.json").read_text())
    RAW.mkdir(parents=True, exist_ok=True)
    wanted = set(sys.argv[1:])
    tiles = [t for g in spec["grids"] for t in g["tiles"]]
    published = [t for g in spec["grids"] if g["published"] for t in g["tiles"]]
    todo = [t for t in tiles if t["tile_id"] in wanted] if wanted else [t for t in published if not is_current(spec, t)]
    if not todo:
        print("All tiles are current.")
        return
    torch.nn.Linear.forward = _linear_fp32

    pipe = diffusers.Flux2KleinPipeline.from_pretrained(spec["model"], transformer=None, vae=None, torch_dtype=torch.bfloat16)
    compute_in_fp32(pipe.text_encoder)
    embeds = {}
    with torch.inference_mode():
        for tile in todo:
            embeds[tile["tile_id"]], _ = pipe.encode_prompt(prompt=full_prompt(spec, tile), device="cpu")
            embeds[tile["tile_id"]] = embeds[tile["tile_id"]].float()
    del pipe
    gc.collect()
    print(f"Encoded {len(todo)} prompts.", flush=True)

    pipe = diffusers.Flux2KleinPipeline.from_pretrained(spec["model"], text_encoder=None, tokenizer=None, torch_dtype=torch.bfloat16)
    compute_in_fp32(pipe.transformer)
    pipe.vae.to(torch.float32)
    for n, tile in enumerate(todo, 1):
        started = time.time()
        with torch.inference_mode():
            image = pipe(
                prompt_embeds=embeds[tile["tile_id"]],
                width=spec["width"],
                height=spec["height"],
                num_inference_steps=spec["steps"],
                guidance_scale=spec["guidance_scale"],
                generator=torch.Generator("cpu").manual_seed(tile["seed"]),
            ).images[0]
        image.save(RAW / f'{tile["tile_id"]}.png')
        record = {
            "tile_id": tile["tile_id"],
            "model": spec["model"],
            "model_revision": spec["model_revision"],
            "prompt": full_prompt(spec, tile),
            "seed": tile["seed"],
            "width": spec["width"],
            "height": spec["height"],
            "steps": spec["steps"],
            "guidance_scale": spec["guidance_scale"],
            "precision": "bfloat16 weights, float32 computation, CPU",
            "software": {"torch": torch.__version__, "diffusers": diffusers.__version__, "transformers": transformers.__version__},
            "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }
        (RAW / f'{tile["tile_id"]}.json').write_text(json.dumps(record, indent=2) + "\n")
        print(f'[{n}/{len(todo)}] {tile["tile_id"]} in {time.time() - started:.0f} s', flush=True)


if __name__ == "__main__":
    main()
