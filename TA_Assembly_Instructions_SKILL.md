# Tabletop Armory — Assembly Instructions PDF Skill

## When to use this skill
Use this skill whenever Ron asks to create product assembly instructions as a PDF for a Tabletop Armory product. Triggers include: "make instructions for [product]", "create an assembly PDF", "build instructions sheet", or any request involving step-by-step assembly documentation for a laser-cut MDF product.

---

## Overview of the process

The final PDF has four sections:
1. **Cover page** — logo, product name, "Assembly Instructions" subtitle, a finished product photo, and an adhesive note
2. **Parts page** — all part photos in a 5-column grid with names, fitting on one page
3. **Assembly steps** — one step per block: numbered header bar, photo, bullet instruction(s)
4. **Footer on every page** — small TA logo left, tabletoparmory.store right, separator line above

---

## Photo collection workflow

Ask Ron to upload photos in this order:

### Round 1 — Finished product photos
Ask for multiple angles of the completed product:
- Front, back, left, right, top (alt/aklt) views
- Tell Ron: "Please upload photos of the finished assembled product from multiple angles."
- Use the **top/isometric view** (or best overall shot) as the cover photo.

### Round 2 — Individual part photos
Ask for one photo per part, flat-laid on a white background, one part per image.
- Tell Ron: "Please upload one photo of each individual part, laid flat. Name them by part name if possible."
- Catalog each photo with its part name and quantity (e.g. "Side Risers ×2").

### Round 3 — Step photos
Ask for numbered in-progress photos showing each assembly stage.
- Tell Ron: "Please upload numbered photos (1.jpg, 2.jpg, etc.) showing each assembly step in order."
- Ask Ron to confirm: (a) the correct step instructions for each number, and (b) if any photo number is wrong or missing.
- **Important:** Ron may tell you that a step photo is wrong (e.g. "step 6 should use photo 7") — always use the filename Ron specifies.

### Logo
- Ask Ron to upload the logo as a **PDF file** for best quality (vector, transparent background).
- Convert the PDF logo to PNG with transparency using pdf2image with pdftocairo:
  ```python
  from pdf2image import convert_from_path
  imgs = convert_from_path('logo.pdf', dpi=300, fmt='png', transparent=True, use_pdftocairo=True)
  imgs[0].save('/home/claude/logo.png', 'PNG')
  ```
- Get the logo aspect ratio: `LOGO_ASPECT = img_height / img_width`

---

## Step instructions

Ron provides the step instructions himself — do not invent them. Ask:
> "What is the instruction text for each step? Please give me one short sentence per step, like 'Insert the back wall into the base plate.'"

Keep each instruction to one short imperative sentence. If Ron gives you longer text, simplify it to match that style.

---

## Color scheme

**Always use colors extracted from the logo.** For the Tabletop Armory logo:

```python
BROWN_DARK   = HexColor('#5C3317')   # dark brown — headings, step bars
BROWN_MID    = HexColor('#8B5E3C')   # mid brown — subtitle, box borders
BROWN_LIGHT  = HexColor('#C4A882')   # tan — rule lines
BROWN_BG     = HexColor('#F5EFE6')   # warm cream — note box background
BROWN_RULE   = HexColor('#C4A882')   # horizontal rules
GRAY_DARK    = HexColor('#2C2C2A')   # body text
GRAY_MED     = HexColor('#5F5E5A')   # secondary text
GRAY_LIGHT   = HexColor('#E8E0D5')   # step divider lines
```

If a different brand logo is used, sample the dominant dark color, mid color, and light/background color from it and substitute accordingly.

---

## Critical technical rules (hard-won fixes)

### Title overlap — NEVER use consecutive Paragraphs for title + subtitle
ReportLab's `spaceAfter`/`spaceBefore` on adjacent Paragraphs causes overlap. Always wrap the product name and subtitle together in a single `Table`:

```python
title_block = Table(
    [
        [Paragraph('Product Name', title_style)],
        [Paragraph('Assembly Instructions', subtitle_style)],
    ],
    colWidths=[W],
    rowHeights=[34, 20],  # explicit row heights prevent overlap
)
title_block.setStyle(TableStyle([
    ('ALIGN',         (0,0), (-1,-1), 'CENTER'),
    ('VALIGN',        (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING',    (0,0), (-1,-1), 0),
    ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ('LEFTPADDING',   (0,0), (-1,-1), 0),
    ('RIGHTPADDING',  (0,0), (-1,-1), 0),
]))
```

### Footer logo must sit entirely below the separator line
Compute the separator Y position from the logo height upward — not from the margin downward:

```python
LOGO_FOOTER_W = 0.55*inch
LOGO_FOOTER_H = LOGO_FOOTER_W * LOGO_ASPECT

def add_footer(canvas, doc):
    canvas.saveState()
    footer_y = 0.08*inch
    sep_y    = footer_y + LOGO_FOOTER_H + 0.05*inch
    # draw separator ABOVE logo
    canvas.line(LMARGIN, sep_y, PW - RMARGIN, sep_y)
    # draw logo below separator
    canvas.drawImage(LOGO, LMARGIN, footer_y,
        width=LOGO_FOOTER_W, height=LOGO_FOOTER_H,
        mask='auto', preserveAspectRatio=True)
    canvas.drawRightString(PW - RMARGIN, footer_y + LOGO_FOOTER_H/2 - 4, 'tabletoparmory.store')
    canvas.restoreState()
```

### Parts page — 5 columns, image row + name row alternating
```python
COLS      = 5
cell_w    = W / COLS
img_max_w = cell_w - 0.1*inch
img_max_h = 2.2*inch

rows = []
for row_start in range(0, len(parts), COLS):
    img_row, name_row = [], []
    for filename, name in parts[row_start:row_start+COLS]:
        img = get_image(UPLOADS + filename, img_max_w, img_max_h)
        img_row.append(img if img else '')
        name_row.append(Paragraph(name, part_name_style))
    while len(img_row)  < COLS: img_row.append('')
    while len(name_row) < COLS: name_row.append('')
    rows.append(img_row)
    rows.append(name_row)
```

### KeepTogether — only wrap first 3 items (header + spacer + photo)
Wrapping too many items causes ReportLab to break pages unexpectedly:
```python
story.append(KeepTogether(block[:3]))
for item in block[3:]:
    story.append(item)
```

### Image scaling helper
```python
def get_image(path, max_w, max_h):
    if not os.path.exists(path):
        return None
    img = Image(path)
    iw, ih = img.imageWidth, img.imageHeight
    ratio = min(max_w / iw, max_h / ih)
    img.drawWidth  = iw * ratio
    img.drawHeight = ih * ratio
    return img
```

---

## Full working template

Install dependency first:
```bash
pip install reportlab pdf2image --break-system-packages -q
apt-get install -y poppler-utils -q
```

```python
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.lib.enums import TA_CENTER
from reportlab.platypus import Flowable
import os

# ── CONFIGURE THESE FOR EACH PRODUCT ─────────────────────────────
PRODUCT_NAME   = 'Deluxe Wrack'           # product name on cover
COVER_PHOTO    = 'finished_aklt.jpg'      # best finished product photo
OUTPUT_NAME    = 'deluxe_wrack_assembly_instructions.pdf'
WEBSITE        = 'tabletoparmory.store'
ADHESIVE_NOTE  = (
    '<b>Note on adhesive:</b> Wood glue or CA (super) glue is required for every step. '
    'Loctite or Gorilla Glue work well. Apply a small amount to each tab before inserting '
    'and wipe away any squeeze-out before it cures.'
)

# List of (photo_filename, display_name) for the parts page
PARTS = [
    ('bottom_plate.jpg',    'Bottom Plate'),
    ('front_wall.jpg',      'Front Wall'),
    # ... add all parts
]

# List of steps: each has a list of instruction strings and a photo filename
# Instructions should be short imperative sentences.
# Photo filename is the numbered step photo Ron provides.
STEPS = [
    {'instructions': ['Insert the Back Wall into the Base Plate.'],   'photo': '1.jpg'},
    {'instructions': ['Place on the Bottom Sorter.'],                 'photo': '2.jpg'},
    # ... add all steps
]
# ─────────────────────────────────────────────────────────────────

# Brand colors — update if logo changes
BROWN_DARK  = HexColor('#5C3317')
BROWN_MID   = HexColor('#8B5E3C')
BROWN_BG    = HexColor('#F5EFE6')
BROWN_RULE  = HexColor('#C4A882')
GRAY_DARK   = HexColor('#2C2C2A')
GRAY_MED    = HexColor('#5F5E5A')
GRAY_LIGHT  = HexColor('#E8E0D5')

UPLOADS     = '/mnt/user-data/uploads/'
LOGO        = '/home/claude/logo.png'
OUT         = f'/mnt/user-data/outputs/{OUTPUT_NAME}'

PW, PH      = letter
LMARGIN     = RMARGIN = 0.65*inch
TMARGIN     = 0.55*inch
BMARGIN     = 0.65*inch
W           = PW - LMARGIN - RMARGIN
LOGO_ASPECT = 5400 / 5851  # UPDATE if logo changes: img_h / img_w

LOGO_FOOTER_W = 0.55*inch
LOGO_FOOTER_H = LOGO_FOOTER_W * LOGO_ASPECT

def add_footer(canvas, doc):
    canvas.saveState()
    footer_y = 0.08*inch
    sep_y    = footer_y + LOGO_FOOTER_H + 0.05*inch
    canvas.setStrokeColor(GRAY_LIGHT)
    canvas.setLineWidth(0.5)
    canvas.line(LMARGIN, sep_y, PW - RMARGIN, sep_y)
    canvas.drawImage(LOGO, LMARGIN, footer_y,
        width=LOGO_FOOTER_W, height=LOGO_FOOTER_H,
        mask='auto', preserveAspectRatio=True)
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(GRAY_MED)
    canvas.drawRightString(PW - RMARGIN, footer_y + LOGO_FOOTER_H/2 - 4, WEBSITE)
    canvas.restoreState()

doc = SimpleDocTemplate(OUT, pagesize=letter,
    rightMargin=RMARGIN, leftMargin=LMARGIN,
    topMargin=TMARGIN,   bottomMargin=BMARGIN,
    title=f'{PRODUCT_NAME} Assembly Instructions')

title_style      = ParagraphStyle('T',  fontName='Helvetica-Bold', fontSize=26, textColor=BROWN_DARK, leading=30, alignment=TA_CENTER)
subtitle_style   = ParagraphStyle('S',  fontName='Helvetica',      fontSize=11, textColor=BROWN_MID,  leading=14, alignment=TA_CENTER)
body_style       = ParagraphStyle('B',  fontName='Helvetica',      fontSize=10, textColor=GRAY_DARK,  leading=14)
part_name_style  = ParagraphStyle('PN', fontName='Helvetica-Bold', fontSize=7,  textColor=GRAY_DARK,  alignment=TA_CENTER, leading=9)
note_style       = ParagraphStyle('N',  fontName='Helvetica',      fontSize=9,  textColor=BROWN_DARK, leading=13)
section_style    = ParagraphStyle('SH', fontName='Helvetica-Bold', fontSize=13, textColor=BROWN_DARK, alignment=TA_CENTER, leading=16)

def get_image(path, max_w, max_h):
    if not os.path.exists(path): return None
    img = Image(path)
    iw, ih = img.imageWidth, img.imageHeight
    ratio = min(max_w / iw, max_h / ih)
    img.drawWidth  = iw * ratio
    img.drawHeight = ih * ratio
    return img

class StepHeader(Flowable):
    def __init__(self, n, total, width):
        Flowable.__init__(self)
        self.n, self.total, self.width, self.height = n, total, width, 26
    def draw(self):
        c = self.canv
        c.setFillColor(BROWN_DARK)
        c.roundRect(0, 0, self.width, self.height, 5, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(10, 7, f'Step {self.n} of {self.total}')

story = []

# COVER
logo_img = get_image(LOGO, 1.7*inch, 1.7*inch * LOGO_ASPECT)
if logo_img:
    logo_img.hAlign = 'CENTER'
    story.append(logo_img)

title_block = Table(
    [[Paragraph(PRODUCT_NAME, title_style)],
     [Paragraph('Assembly Instructions', subtitle_style)]],
    colWidths=[W], rowHeights=[34, 20])
title_block.setStyle(TableStyle([
    ('ALIGN',(0,0),(-1,-1),'CENTER'), ('VALIGN',(0,0),(-1,-1),'MIDDLE'),
    ('TOPPADDING',(0,0),(-1,-1),0),   ('BOTTOMPADDING',(0,0),(-1,-1),0),
    ('LEFTPADDING',(0,0),(-1,-1),0),  ('RIGHTPADDING',(0,0),(-1,-1),0),
]))
story.append(Spacer(1, 6))
story.append(title_block)
story.append(Spacer(1, 8))
story.append(HRFlowable(width=W, thickness=1.5, color=BROWN_RULE, spaceAfter=8))

cover = get_image(UPLOADS + COVER_PHOTO, W, 2.6*inch)
if cover:
    cover.hAlign = 'CENTER'
    story.append(cover)
story.append(Spacer(1, 10))

note_table = Table([[Paragraph(ADHESIVE_NOTE, note_style)]], colWidths=[W])
note_table.setStyle(TableStyle([
    ('BACKGROUND',(0,0),(-1,-1),BROWN_BG), ('ROUNDEDCORNERS',[6]),
    ('LEFTPADDING',(0,0),(-1,-1),12),  ('RIGHTPADDING',(0,0),(-1,-1),12),
    ('TOPPADDING',(0,0),(-1,-1),8),    ('BOTTOMPADDING',(0,0),(-1,-1),8),
    ('BOX',(0,0),(-1,-1),1,BROWN_MID),
]))
story.append(note_table)
story.append(PageBreak())

# PARTS
story.append(Paragraph('Parts', section_style))
story.append(Spacer(1, 8))
COLS = 5
cell_w = W / COLS
rows = []
for row_start in range(0, len(PARTS), COLS):
    img_row, name_row = [], []
    for filename, name in PARTS[row_start:row_start+COLS]:
        img = get_image(UPLOADS + filename, cell_w - 0.1*inch, 2.2*inch)
        if img: img.hAlign = 'CENTER'
        img_row.append(img if img else '')
        name_row.append(Paragraph(name, part_name_style))
    while len(img_row)  < COLS: img_row.append('')
    while len(name_row) < COLS: name_row.append('')
    rows.append(img_row)
    rows.append(name_row)
pt = Table(rows, colWidths=[cell_w]*COLS)
pt.setStyle(TableStyle([
    ('ALIGN',(0,0),(-1,-1),'CENTER'), ('VALIGN',(0,0),(-1,-1),'BOTTOM'),
    ('TOPPADDING',(0,0),(-1,-1),3),   ('BOTTOMPADDING',(0,0),(-1,-1),2),
    ('LEFTPADDING',(0,0),(-1,-1),3),  ('RIGHTPADDING',(0,0),(-1,-1),3),
    ('VALIGN',(0,1),(-1,1),'TOP'),    ('VALIGN',(0,3),(-1,3),'TOP'),
]))
story.append(pt)
story.append(PageBreak())

# STEPS
TOTAL = len(STEPS)
for i, s in enumerate(STEPS, 1):
    block = [StepHeader(i, TOTAL, W), Spacer(1, 5)]
    img = get_image(UPLOADS + s['photo'], W, 2.8*inch)
    if img:
        img.hAlign = 'CENTER'
        block += [img, Spacer(1, 5)]
    for line in s['instructions']:
        block += [Paragraph(f'• {line}', body_style), Spacer(1, 2)]
    block += [Spacer(1, 6), HRFlowable(width=W, thickness=0.5, color=GRAY_LIGHT, spaceAfter=6)]
    story.append(KeepTogether(block[:3]))
    for item in block[3:]: story.append(item)

doc.build(story, onFirstPage=add_footer, onLaterPages=add_footer)
print("Done:", OUT)
```

---

## Checklist for each new product

- [ ] Upload logo PDF → convert to PNG with transparency
- [ ] Upload finished product photos (multiple angles)
- [ ] Upload individual part photos (one per part, white background)
- [ ] Upload numbered step photos (1.jpg, 2.jpg, ...)
- [ ] Confirm step instructions text with Ron (short imperative sentences)
- [ ] Confirm correct photo filename for each step
- [ ] Set `PRODUCT_NAME`, `COVER_PHOTO`, `OUTPUT_NAME`, `PARTS`, `STEPS`
- [ ] Run script, output goes to `/mnt/user-data/outputs/`
- [ ] Present file with `present_files` tool

---

## Common mistakes to avoid

| Mistake | Fix |
|---|---|
| Title and subtitle overlap | Always use `Table` with explicit `rowHeights` for title block — never consecutive `Paragraph` flowables |
| Footer separator line cutting through logo | Compute `sep_y` from `footer_y + logo_height + gap` upward, not from margin downward |
| Wrong photo on a step | Always confirm photo-to-step mapping with Ron before building |
| Logo has black background | Use PDF logo + pdf2image with `use_pdftocairo=True, transparent=True` |
| Parts don't fit on one page | Keep `img_max_h = 2.2*inch` and `COLS = 5`; reduce if more than 10 parts |
| Steps spill across too many pages | Reduce `img` max_h to `2.5*inch` or lower; reduce spacers |
