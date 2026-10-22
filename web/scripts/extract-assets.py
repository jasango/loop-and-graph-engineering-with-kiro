#!/usr/bin/env python3
"""Deterministically extract the presentation media and build its content manifest."""
from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from zipfile import ZipFile

A = "http://schemas.openxmlformats.org/drawingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
REL = "http://schemas.openxmlformats.org/package/2006/relationships"
NS = {"a": A}
ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT.parent / "deck" / "kiro-cli-en-accion-loop-engineering.pptx"
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".svg"}

# These models are the accessible, DOM-equivalent vocabulary for the diagrams.
MODEL_LABELS = {
    3: ["Prompt Engineering", "Context Engineering", "Retrieval Engineering", "Memory Engineering", "Tool Engineering", "Skill Engineering", "Loop Engineering", "Graph Engineering", "Guardrail Engineering", "Harness Engineering"],
    4: ["Prompt Engineering", "Context Engineering", "Retrieval Engineering", "Memory Engineering", "Tool Engineering", "Skill Engineering", "Loop Engineering", "Graph Engineering", "Guardrail Engineering", "Harness Engineering"],
    6: ["Objetivo verificable", "Observación del entorno", "Ejecución adaptativa", "Verificación de resultados", "Medición del progreso", "Recuperación de errores", "Gestión del estado", "Terminación controlada", "Control de recursos y seguridad", "Observabilidad y trazabilidad"],
    8: ["Loop Programático usando Kiro CLI", "Una opción es usar kiro-cli dentro de scripts y controlar el flujo aprovechando las primitivas del sistema operativo.", "El paramento –no-interactive ejecuta Kiro CLI sin preguntas ni interfaz interactiva.", "El parámetro –trust-tools autoriza únicamente las herramientas especificadas durante esa ejecución."],
    10: ["Loop Programático usando Agentes Kiro CLI", "Inicio", "Definir objetivo", "Ejecutar agente", "Verificar resultado", "Corregir o continuar", "Finalizar"],
    12: ["Automatización SDLC usando Kiro Workflows", "Definición de Workflows", "Nodos de agente", "Secuencias", "Loops", "Ramas paralelas", "IDE", "CLI", "WEB", ".kiro/workflows"],
    13: ["Automatización SDLC usando Kiro Workflows", "Specs Creation", "software-spec.workflow", "Code Generation", "software-build.workflow", "Refinement", "Testing and Fixing", "Code", "Deploy", "software-deploy.workflow"],
    14: ["Automatización SDLC usando Kiro Workflows", "Specs Creation", "software-spec.workflow", "Refinement"],
    15: ["Automatización SDLC usando Kiro Workflows", "Specs Creation", "software-spec.workflow", "Refinement", "Se crea la carpeta del nuevo proyecto", "Se define el workflow, agente, esfuerzo y prompt inicial", "Se define un bucle se revisión y aprobación con iteraciones máximas", "El Analyst crea la spec y hace preguntas al usuario y búsquedas web para llenar vacíos existentes en la spec", "El Reviewer revisa la spec y emite un jucio si la misma está lista para implementarse emitiendo una opinión"],
    16: ["Automatización SDLC usando Kiro Workflows", "Code Generation", "software-build.workflow", "Testing and Fixing"],
    17: ["Automatización SDLC usando Kiro Workflows", "Code", "Deploy", "software-deploy.workflow", "Testing and Fixing"],
}


def run(command: list[str]) -> None:
    subprocess.run(command, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


def paragraphs(xml: bytes) -> list[str]:
    root = ET.fromstring(xml)
    result = []
    for para in root.findall(".//a:p", NS):
        text = "".join(node.text or "" for node in para.findall(".//a:t", NS)).strip()
        if text:
            result.append(text)
    return result


def notes_context(z: ZipFile, index: int) -> dict | None:
    name = f"ppt/notesSlides/notesSlide{index}.xml"
    if name not in z.namelist():
        return None
    values = [value for value in paragraphs(z.read(name)) if value != str(index)]
    if not values:
        return None
    return {"available": True, "label": "Notas del presentador / contexto adicional", "text": values}


def dimensions(path: Path) -> list[int] | None:
    if path.suffix.lower() == ".svg":
        return None
    if path.suffix.lower() in IMAGE_EXTENSIONS:
        data = path.read_bytes()
        if data[:8] == b"\x89PNG\r\n\x1a\n":
            return [int.from_bytes(data[16:20], "big"), int.from_bytes(data[20:24], "big")]
        if data[:2] == b"\xff\xd8":
            # JPEG dimensions, without requiring Pillow.
            pos = 2
            while pos + 9 < len(data):
                if data[pos] != 0xFF:
                    pos += 1; continue
                marker = data[pos + 1]; pos += 2
                if marker in {0xD8, 0xD9} or 0xD0 <= marker <= 0xD7:
                    continue
                length = int.from_bytes(data[pos:pos + 2], "big")
                if marker in set(range(0xC0, 0xC4)) | set(range(0xC5, 0xC8)) | set(range(0xC9, 0xCC)) | set(range(0xCD, 0xD0)):
                    return [int.from_bytes(data[pos + 5:pos + 7], "big"), int.from_bytes(data[pos + 3:pos + 5], "big")]
                pos += length
    return None


def asset_record(path: Path, asset_type: str, required: bool = True, logical_src: str | None = None) -> dict:
    data = path.read_bytes()
    record = {"src": logical_src or str(path.relative_to(ROOT)).replace("\\", "/"), "type": asset_type, "required": required,
              "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data)}
    size = dimensions(path)
    if size:
        record["dimensions"] = {"width": size[0], "height": size[1]}
    return record


def model(index: int) -> dict:
    labels = MODEL_LABELS.get(index, [])
    nodes = [{"id": f"node-{index:02d}-{n:02d}", "label": label} for n, label in enumerate(labels, 1)]
    relations = [{"from": nodes[n - 1]["id"], "to": nodes[n]["id"], "kind": "sequence"} for n in range(1, len(nodes))]
    branches = []
    if index == 10:
        relations += [{"from": nodes[4]["id"], "to": nodes[5]["id"], "kind": "decision"}, {"from": nodes[5]["id"], "to": nodes[3]["id"], "kind": "loop-return"}]
        branches = [{"label": "Corregir o continuar → Ejecutar agente"}]
    elif index == 13:
        relations = [{"from": nodes[0]["id"], "to": nodes[1]["id"], "kind": "sequence"}, {"from": nodes[1]["id"], "to": nodes[2]["id"], "kind": "recipe"}, {"from": nodes[0]["id"], "to": nodes[3]["id"], "kind": "branch"}, {"from": nodes[3]["id"], "to": nodes[4]["id"], "kind": "recipe"}, {"from": nodes[4]["id"], "to": nodes[5]["id"], "kind": "sequence"}, {"from": nodes[5]["id"], "to": nodes[6]["id"], "kind": "branch"}, {"from": nodes[6]["id"], "to": nodes[7]["id"], "kind": "sequence"}, {"from": nodes[7]["id"], "to": nodes[8]["id"], "kind": "sequence"}, {"from": nodes[8]["id"], "to": nodes[9]["id"], "kind": "recipe"}]
        branches = [{"label": "Specs Creation ∥ Code Generation"}, {"label": "Code ∥ Deploy"}]
    elif index == 15:
        relations += [{"from": nodes[4]["id"], "to": nodes[5]["id"], "kind": "sequence"}, {"from": nodes[6]["id"], "to": nodes[4]["id"], "kind": "review-loop"}, {"from": nodes[8]["id"], "to": nodes[6]["id"], "kind": "review-loop"}]
        branches = [{"label": "Analyst ∥ Reviewer"}]
    elif index == 16:
        relations += [{"from": nodes[3]["id"], "to": nodes[1]["id"], "kind": "test-loop"}]
        branches = [{"label": "Code Generation → Testing and Fixing"}]
    elif index == 17:
        relations += [{"from": nodes[3]["id"], "to": nodes[0]["id"], "kind": "return"}]
        branches = [{"label": "Deploy ∥ Testing and Fixing"}]
    return {"kind": "workflow" if index in {10, 13, 14, 15, 16, 17} else "content", "nodes": nodes, "relations": relations,
            "order": [node["id"] for node in nodes], "branches": branches}


def extract(source: Path) -> None:
    image_dir, video_dir = ROOT / "assets/images", ROOT / "assets/video"
    image_dir.mkdir(parents=True, exist_ok=True); video_dir.mkdir(parents=True, exist_ok=True)
    conversion_note = "inkscape SVG conversion"
    with ZipFile(source) as z:
        media = sorted(name for name in z.namelist() if name.startswith("ppt/media/"))
        for name in media:
            target = ROOT / "_media-tmp" / Path(name).name
            target.parent.mkdir(exist_ok=True)
            target.write_bytes(z.read(name))
        # Preserve the deck's deterministic image numbering, while replacing EMF for browsers.
        for number in range(1, 26):
            raw = ROOT / "_media-tmp" / f"image{number}.png"
            if number == 23:
                emf = ROOT / "_media-tmp" / "image23.emf"
                svg = image_dir / "image-23.svg"
                png = image_dir / "image-23.png"
                if shutil.which("inkscape"):
                    run(["inkscape", "--export-type=svg", f"--export-filename={svg}", str(emf)])
                    conversion_note = "image23.emf converted with Inkscape to SVG"
                    continue
                if shutil.which("magick"):
                    try:
                        run(["magick", str(emf), str(png)])
                        conversion_note = "image23.emf converted with ImageMagick fallback"
                        continue
                    except subprocess.CalledProcessError:
                        pass
                # Some EMF files contain an embedded PDF even when ImageMagick lacks
                # its LibreOffice delegate. Rasterize that payload as the final local fallback.
                payload = emf.read_bytes(); offset = payload.find(b"%PDF-")
                if offset < 0 or not shutil.which("pdftoppm"):
                    raise RuntimeError("image23.emf conversion failed: install Inkscape or ImageMagick with EMF support")
                embedded = ROOT / "_image23-embedded.pdf"
                embedded.write_bytes(payload[offset:])
                try:
                    run(["pdftoppm", "-singlefile", "-png", "-r", "150", str(embedded), str(image_dir / "image-23")])
                finally:
                    embedded.unlink(missing_ok=True)
                conversion_note = "image23.emf converted via embedded PDF raster fallback (Inkscape unavailable; ImageMagick delegate unavailable)"
                continue
            if raw.exists():
                shutil.copyfile(raw, image_dir / f"image-{number:02d}.png")
        for number in range(1, 4):
            raw = ROOT / "_media-tmp" / f"media{number}.mp4"
            target = video_dir / f"demo-{number:02d}.mp4"
            shutil.copyfile(raw, target)
            run(["ffmpeg", "-y", "-i", str(target), "-frames:v", "1", "-q:v", "2", str(video_dir / f"poster-{number:02d}.jpg")])

        slides = []
        for index in range(1, 23):
            visible = paragraphs(z.read(f"ppt/slides/slide{index}.xml"))
            title = visible[0] if visible else f"Slide {index}"
            rels_name = f"ppt/slides/_rels/slide{index}.xml.rels"
            assets = []
            if rels_name in z.namelist():
                relroot = ET.fromstring(z.read(rels_name))
                for relation in relroot.findall(f"{{{REL}}}Relationship"):
                    target = relation.attrib.get("Target", "")
                    if not target.startswith("../media/"):
                        continue
                    filename = Path(target).name
                    if filename.startswith("image"):
                        number = int(filename[5:].split(".")[0])
                        src = f"assets/images/image-{number:02d}.{'svg' if number == 23 and (image_dir / 'image-23.svg').exists() else 'png'}"
                        path = ROOT / src
                        assets.append(asset_record(path, "image", logical_src=src))
                    elif filename.startswith("media"):
                        number = int(filename[5:].split(".")[0])
                        video = video_dir / f"demo-{number:02d}.mp4"; poster = video_dir / f"poster-{number:02d}.jpg"
                        assets.extend([asset_record(video, "video"), asset_record(poster, "poster")])
                        assets[-2]["poster"] = assets[-1]["src"]
            slide = {"id": f"slide-{index:02d}", "index": index, "title": title, "visibleText": visible,
                     "notesContext": notes_context(z, index), "assets": assets, "accessibleModel": model(index)}
            slides.append(slide)
    manifest = {"source": {"file": "deck/kiro-cli-en-accion-loop-engineering.pptx", "widthEmu": 12192000, "heightEmu": 6858000}, "conversionPolicy": conversion_note, "slides": slides}
    out = ROOT / "assets/manifest.json"; out.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    shutil.rmtree(ROOT / "_media-tmp", ignore_errors=True)
    validate(manifest)


def validate(manifest: dict) -> None:
    slides = manifest.get("slides", [])
    assert len(slides) == 22 and [s["index"] for s in slides] == list(range(1, 23))
    assert len({s["id"] for s in slides}) == 22
    assert any("Harness Engineering" in s["visibleText"] for s in slides)
    slide8 = slides[7]["visibleText"]
    assert slide8[1:4] == ["Una opción es usar kiro-cli dentro de scripts y controlar el flujo aprovechando las primitivas del sistema operativo.", "El paramento –no-interactive ejecuta Kiro CLI sin preguntas ni interfaz interactiva.", "El parámetro –trust-tools autoriza únicamente las herramientas especificadas durante esa ejecución."]
    for slide in slides:
        for asset in slide["assets"]:
            path = ROOT / asset["src"]
            assert path.is_file(), f"missing {asset['src']}"
            actual = asset_record(path, asset["type"], asset["required"], asset["src"])
            assert actual["sha256"] == asset["sha256"] and actual["bytes"] == asset["bytes"], f"integrity {asset['src']}"
            if "dimensions" in asset: assert actual["dimensions"] == asset["dimensions"]
        model_data = slide["accessibleModel"]
        assert all(node["id"] in model_data["order"] for node in model_data["nodes"])
        ids = {node["id"] for node in model_data["nodes"]}
        assert all(r["from"] in ids and r["to"] in ids for r in model_data["relations"])
    assert all(not Path(p).is_file() for p in [ROOT / "_media-tmp"])
    print(f"manifest integrity passed: {len(slides)} slides, {sum(len(s['assets']) for s in slides)} asset references")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(); parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    args = parser.parse_args()
    if not args.source.is_file():
        parser.error(f"source not found: {args.source}")
    try:
        extract(args.source.resolve())
    except (AssertionError, OSError, RuntimeError, subprocess.CalledProcessError) as exc:
        print(f"extraction failed: {exc}", file=sys.stderr); sys.exit(1)
