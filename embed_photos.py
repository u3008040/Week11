"""Bake the photographs into the single HTML file.

The Week 11 page must stay ONE file, so a photograph cannot sit beside it: it
has to go inside it. This script takes whatever JPEGs are in  photos/ , cuts
each one to 16 by 9 at 1600 x 900, and writes  photos.json , which build.js
then embeds.

    1. download the three photographs (see PHOTOS_TO_DOWNLOAD.txt)
    2. save them in  src/photos/  under the names below
    3. python3 embed_photos.py
    4. node build.js

Any photograph you do not supply is simply skipped. The page still builds and
every card still reads correctly; the card draws its own panel instead.
"""
import base64, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PHOTO_DIR = os.path.join(HERE, "photos")

#   key in the page          file name            where to crop from
WANTED = [
    ("crew",      "photo-crew.jpg",      "centre"),
    ("landscape", "photo-landscape.jpg", "centre"),
    ("anneal",    "photo-anneal.jpg",    "centre"),
]
W, H, QUALITY = 1600, 900, 78
FIT_WHOLE = {"landscape", "anneal"}   # diagrams: show all of it, never crop

try:
    from PIL import Image
except ImportError:
    sys.exit("This needs Pillow:  pip install Pillow --break-system-packages")


def crop_169(path, anchor):
    """Cut to 16 by 9 without squashing anything, then shrink to 1600 x 900."""
    im = Image.open(path).convert("RGB")
    w, h = im.size
    if w / h > W / H:                      # too wide: trim the sides
        new_w = int(h * W / H)
        off = (w - new_w) // 2
        im = im.crop((off, 0, off + new_w, h))
    else:                                  # too tall: trim top and bottom
        new_h = int(w * H / W)
        off = 0 if anchor == "top" else (h - new_h if anchor == "bottom"
                                         else (h - new_h) // 2)
        im = im.crop((0, off, w, off + new_h))
    return im.resize((W, H), Image.LANCZOS)


def fit_169(path):
    """Put the whole picture inside 16 by 9 on a white card, cutting nothing.

    A photograph can lose its edges. A labelled diagram cannot: the labels
    live at the edges, so a diagram is fitted, not cropped.
    """
    im = Image.open(path).convert("RGB")
    im.thumbnail((W, H), Image.LANCZOS)
    card = Image.new("RGB", (W, H), (255, 255, 255))
    card.paste(im, ((W - im.width) // 2, (H - im.height) // 2))
    return card


def main():
    os.makedirs(PHOTO_DIR, exist_ok=True)
    out, missing = {}, []
    for key, name, anchor in WANTED:
        path = os.path.join(PHOTO_DIR, name)
        if not os.path.exists(path):
            missing.append(name)
            continue
        im = fit_169(path) if key in FIT_WHOLE else crop_169(path, anchor)
        tmp = os.path.join(PHOTO_DIR, "." + name + ".tmp")
        im.save(tmp, "JPEG", quality=QUALITY, optimize=True, progressive=True)
        raw = open(tmp, "rb").read()
        os.remove(tmp)
        out[key] = "data:image/jpeg;base64," + base64.b64encode(raw).decode()
        print("  %-8s %-18s %s -> 1600x900, %d KB embedded"
              % (key, name, "x".join(map(str, Image.open(path).size)), len(raw) // 1024))

    with open(os.path.join(HERE, "photos.json"), "w") as f:
        json.dump(out, f, separators=(",", ":"))
    total = sum(len(v) for v in out.values()) // 1024
    print("\nwrote photos.json: %d photograph(s), %d KB of base64" % (len(out), total))
    if missing:
        print("not supplied (the page will draw its own panel instead):")
        for m in missing:
            print("  " + m)
    print("\nnow run:  node build.js")


if __name__ == "__main__":
    main()
