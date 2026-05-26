"""
Pixel AI Town — Art Generation Script
Uses gptimage2 via agent-hub or media-gen MCP endpoint.
Run: python generate.py [--all | --agents | --buildings | --tileset | --player]
"""

import httpx
import base64
import os
import sys
from pathlib import Path
import time

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

OUTPUT_DIR = Path(__file__).parent / "generated"
OUTPUT_DIR.mkdir(exist_ok=True)

# Working endpoint (configured via env or .env file)
GENERATE_URL = "http://127.0.0.1:9800/generate-image"
FALLBACK_URL = os.environ.get("GPTIMAGE_URL", "https://cclaude.ai/v1/images/generations")
FALLBACK_KEY = os.environ.get("GPTIMAGE_KEY", "")

STYLE_PREFIX = (
    "pixel art, 32x32 game sprite, top-down RPG style, warm pastel color palette, "
    "cozy cute aesthetic, clean pixel edges, gentle shading, game asset, "
    "transparent background, no anti-aliasing, crisp pixels"
)

AGENTS = {
    "agent_opus": "wise owl character wearing purple robe with golden trim, small crown on head, calm expression",
    "agent_pixelcat": "playful orange pixel cat with tiny blue scarf, alert ears, curious eyes",
    "agent_codex": "round robot with blue-purple gradient body, glowing terminal screen face showing cursor",
    "agent_sonnet": "gentle deer character with cream and soft brown colors, holding a small notebook",
    "agent_haiku": "tiny hummingbird character, iridescent teal-green feathers, fast and energetic pose",
    "agent_deepseek": "small friendly blue whale character with a tiny backpack, gentle smile",
    "agent_openhands": "raccoon character with tool belt, brown and grey fur, determined expression",
    "agent_aris": "crystal golem character, translucent purple geometric body, glowing core",
    "agent_player": "cute anime girl with long flowing hair, pastel pink and lavender colors, fantasy flower crown headpiece, gentle expression",
}

BUILDINGS = {
    "building_town_hall": "cozy stone town hall building, warm beige walls, red tile roof, small flag on top, arched entrance",
    "building_memory_library": "magical library building, blue crystal dome roof, floating glowing books around it",
    "building_skill_workshop": "wooden workshop building, tools hanging on walls, warm orange lantern light, chimney with smoke",
    "building_dream_garden": "enchanted garden pavilion, glowing pastel flowers, soft yellow-green grass, fairy lights",
    "building_devtools_lab": "modern lab building, multiple small screens visible through windows, grey and blue metal exterior",
    "building_resource_market": "open market stall building, colorful fabric awnings in green and gold, crates and barrels",
    "building_knowledge_tower": "tall crystal tower, blue and white gradient, tiny stars orbiting the top, magical glow",
    "building_agent_homes": "row of tiny cute houses, each a different pastel color, tiny chimneys with smoke",
    "building_plaza": "stone fountain centerpiece, cobblestone ground, flower beds around edges, warm lighting",
}


def generate_image(prompt: str, name: str, size: str = "1024x1024"):
    full_prompt = f"{STYLE_PREFIX}, {prompt}"
    print(f"  Generating: {name}...")

    # Try agent-hub first
    try:
        resp = httpx.post(
            GENERATE_URL,
            json={"prompt": full_prompt, "size": size, "quality": "high", "n": 1},
            timeout=60.0,
        )
        if resp.status_code == 200:
            data = resp.json()
            if "image" in data:
                img_bytes = base64.b64decode(data["image"])
                out_path = OUTPUT_DIR / f"{name}.png"
                out_path.write_bytes(img_bytes)
                print(f"  [OK] Saved: {out_path}")
                return True
            elif "data" in data and data["data"]:
                img_data = data["data"][0]
                if "b64_json" in img_data:
                    img_bytes = base64.b64decode(img_data["b64_json"])
                    out_path = OUTPUT_DIR / f"{name}.png"
                    out_path.write_bytes(img_bytes)
                    print(f"  [OK] Saved: {out_path}")
                    return True
    except Exception as e:
        print(f"  Agent-hub failed: {e}")

    # Fallback to media-gen rotator
    try:
        headers = {"Content-Type": "application/json"}
        if FALLBACK_KEY:
            headers["Authorization"] = f"Bearer {FALLBACK_KEY}"
        resp = httpx.post(
            FALLBACK_URL,
            json={"model": "gpt-image-2", "prompt": full_prompt, "size": size, "quality": "high", "n": 1},
            headers=headers,
            timeout=120.0,
        )
        if resp.status_code == 200:
            data = resp.json()
            if "data" in data and data["data"]:
                img_data = data["data"][0]
                if "b64_json" in img_data:
                    img_bytes = base64.b64decode(img_data["b64_json"])
                elif "url" in img_data:
                    img_resp = httpx.get(img_data["url"], timeout=30.0)
                    img_bytes = img_resp.content
                else:
                    print(f"  [FAIL] No image data in response")
                    return False
                out_path = OUTPUT_DIR / f"{name}.png"
                out_path.write_bytes(img_bytes)
                print(f"  [OK] Saved: {out_path}")
                return True
    except Exception as e:
        print(f"  Fallback failed: {e}")

    print(f"  [FAIL] Failed to generate: {name}")
    return False


def generate_agents():
    print("\n=== Generating Agent Sprites ===")
    for name, desc in AGENTS.items():
        generate_image(desc, name)
        time.sleep(2)


def generate_buildings():
    print("\n=== Generating Building Sprites ===")
    for name, desc in BUILDINGS.items():
        generate_image(desc, name, size="1024x1024")
        time.sleep(2)


def generate_tileset():
    print("\n=== Generating Tileset ===")
    prompt = (
        "pixel art tileset sheet arranged in a 4x4 grid, 16x16 tiles each, "
        "top-down RPG style, includes: grass plain, grass with flowers, tall grass, "
        "cobblestone path, dirt path, still water, water with ripples, "
        "pink flowers, yellow flowers, round tree, pine tree, wooden fence, "
        "stone wall, wooden bridge, bench, lamppost, "
        "warm pastel colors, cozy fantasy town aesthetic"
    )
    generate_image(prompt, "tileset", size="1024x1024")


def generate_banner():
    print("\n=== Generating Banner ===")
    prompt = (
        "wide pixel art banner for a cozy AI town game, "
        "showing a cute pastel-colored town with tiny buildings, "
        "a central plaza with fountain, trees, flowers, "
        "small pixel characters walking around, "
        "warm sunset lighting, text area at top, "
        "game title banner style, 16:9 aspect ratio composition"
    )
    generate_image(prompt, "banner", size="1536x1024")


if __name__ == "__main__":
    args = sys.argv[1:] if len(sys.argv) > 1 else ["--all"]

    if "--all" in args:
        generate_agents()
        generate_buildings()
        generate_tileset()
        generate_banner()
    else:
        if "--agents" in args:
            generate_agents()
        if "--buildings" in args:
            generate_buildings()
        if "--tileset" in args:
            generate_tileset()
        if "--banner" in args:
            generate_banner()
        if "--player" in args:
            generate_image(AGENTS["agent_player"], "agent_player")

    print("\nDone! Check art/generated/ for outputs.")
