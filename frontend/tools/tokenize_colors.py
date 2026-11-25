#!/usr/bin/env python3
"""
Role-aware design-token codemod.

Rewrites hard-coded colours inside *style objects* (style={{...}}, *Style objects,
recharts contentStyle, <style> CSS text) and a few SVG attributes into the
"Daybreak" CSS variables, so legacy pages inherit the new palette AND dark mode.

It deliberately does NOT touch: canvas/game data colours, state initialisers,
colours persisted to the DB, or anything outside a style context.

usage: tokenize.py <file> <profile: light|dark>
  light = source UI was light slate (MoodTracker, Booking)
  dark  = source UI was dark slate  (AdminDashboard)
"""
import re
import sys
import colorsys

# ---------------------------------------------------------------- colour maths

def parse_hex(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    if len(h) not in (6, 8):
        return None
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
    return r, g, b, a


def hls(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    return h * 360, l, s


NEUTRAL_HEX = {
    # slate / gray / zinc / neutral families (tailwind) — treated as neutrals
    *'#0f172a #1e293b #334155 #475569 #64748b #94a3b8 #cbd5e1 #e2e8f0 #f1f5f9 #f8fafc'.split(),
    *'#030712 #111827 #1f2937 #374151 #4b5563 #6b7280 #9ca3af #d1d5db #e5e7eb #f3f4f6 #f9fafb'.split(),
    *'#18181b #27272a #3f3f46 #52525b #71717a #a1a1aa #d4d4d8 #e4e4e7 #f4f4f5 #fafafa'.split(),
    '#000', '#000000', '#fff', '#ffffff',
}


def family_of(r, g, b):
    h, l, s = hls(r, g, b)
    if s < 0.16:
        return 'neutral'
    if h >= 345 or h < 12:
        return 'danger'
    if h < 32:
        return 'sun'
    if h < 68:
        return 'warn'
    if h < 165:
        return 'success'
    if h < 200:
        return 'primary'
    if h < 225.5:
        return 'sky'
    if h < 315:
        return 'primary'   # indigo / violet / purple are folded into the brand colour
    return 'rose'


def is_neutral(hexstr, r, g, b):
    if hexstr.lower() in NEUTRAL_HEX:
        return True
    return family_of(r, g, b) == 'neutral'


# ---------------------------------------------------------------- role tables

BG_KEYS = {'background', 'backgroundColor', 'background-color'}
TEXT_KEYS = {'color', 'WebkitTextFillColor', 'caretColor', 'textDecorationColor', '-webkit-text-fill-color'}
SHADOW_KEYS = {'boxShadow', 'textShadow', 'filter', 'box-shadow', 'text-shadow'}
SVG_KEYS = {'fill', 'stroke', 'stopColor', 'accentColor'}


def role_of(key):
    if key in BG_KEYS:
        return 'bg'
    if key in TEXT_KEYS:
        return 'text'
    if key in SHADOW_KEYS:
        return 'shadow'
    if key in SVG_KEYS:
        return 'svg'
    if key.startswith('border') or key.startswith('outline') or key in ('border-color',):
        return 'line'
    return None


def neutral_token(L, role, profile, is_white=False, keep_white_text=False):
    """Return CSS value for a neutral colour, or None to keep as-is."""
    if profile == 'light':
        if role == 'bg':
            if is_white:
                return 'var(--surface)'
            if L >= 0.975:
                return 'var(--surface-2)'
            if L >= 0.94:
                return 'var(--surface-3)'
            if L >= 0.88:
                return 'var(--line)'
            if L >= 0.78:
                return 'var(--line-strong)'
            if L >= 0.5:
                return 'var(--ink-4)'
            return None  # intentionally dark surface (games, code) – keep
        if role == 'text':
            if is_white:
                return None
            if L < 0.22:
                return 'var(--ink)'
            if L < 0.40:
                return 'var(--ink-2)'
            if L < 0.52:
                return 'var(--ink-3)'
            if L < 0.72:
                return 'var(--ink-4)'
            return None
        if role == 'line':
            if is_white:
                return None
            if L >= 0.88:
                return 'var(--line)'
            if L >= 0.55:
                return 'var(--line-strong)'
            return None
        if role == 'svg':
            if is_white:
                return None
            if L >= 0.88:
                return 'var(--line)'
            if L >= 0.55:
                return 'var(--ink-4)'
            if L >= 0.4:
                return 'var(--ink-3)'
            return 'var(--ink-2)'
    else:  # dark-source
        if role == 'bg':
            if is_white or L >= 0.9:
                return 'var(--surface)'
            if L < 0.12:
                return 'var(--bg)'
            if L < 0.20:
                return 'var(--surface)'
            if L < 0.30:
                return 'var(--surface-3)'
            if L < 0.42:
                return 'var(--line-strong)'
            return 'var(--ink-4)'
        if role == 'text':
            if is_white or L >= 0.88:
                return 'var(--ink)' if not keep_white_text else None
            if L >= 0.78:
                return 'var(--ink-2)'
            return 'var(--ink-3)' if L >= 0.25 else 'var(--ink)'
        if role == 'line':
            if is_white:
                return 'var(--line)'
            if L < 0.35:
                return 'var(--line)'
            return 'var(--line-strong)'
        if role == 'svg':
            if is_white or L >= 0.88:
                return 'var(--ink)'
            if L >= 0.5:
                return 'var(--ink-3)'
            return 'var(--line-strong)'
    return None


def chromatic_token(fam, L, role, profile):
    soft = f'var(--{fam}-soft)'
    fill = f'var(--{fam}-fill)'
    ink = f'var(--{fam}-ink)'
    base = f'var(--{fam})'
    if role == 'bg':
        return soft if L >= 0.86 else fill
    if role == 'text':
        if L >= 0.86:
            return None if profile == 'light' else ink
        return ink if L < 0.45 else base
    if role == 'line':
        return soft if L >= 0.86 else base
    if role == 'svg':
        return soft if L >= 0.86 else base
    return None


def convert_color(tok, role, profile, accent_in_block):
    """tok is '#abc123' | 'rgba(...)' | 'white' ; returns replacement or None."""
    low = tok.lower()
    if low in ('white', '#fff', '#ffffff'):
        if role == 'text':
            if profile == 'dark' and not accent_in_block:
                return 'var(--ink)'
            return None
        return neutral_token(1.0, role, profile, is_white=True)
    if low in ('black', '#000', '#000000'):
        return None
    if low.startswith('rgb'):
        m = re.match(r'rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)', tok)
        if not m:
            return None
        r, g, b = (int(float(m.group(i))) for i in (1, 2, 3))
        a = float(m.group(4)) if m.group(4) is not None else 1.0
        return convert_rgba(r, g, b, a, role, profile)
    p = parse_hex(tok)
    if not p:
        return None
    r, g, b, a = p
    if a < 1.0:
        return convert_rgba(r, g, b, a, role, profile)
    fam = family_of(r, g, b)
    _, L, _ = hls(r, g, b)
    if tok.lower() in NEUTRAL_HEX or fam == 'neutral':
        return neutral_token(L, role, profile)
    return chromatic_token(fam, L, role, profile)


def convert_rgba(r, g, b, a, role, profile):
    fam = family_of(r, g, b)
    pct = max(0, min(100, round(a * 100)))
    if fam == 'neutral':
        # white/black translucency
        if r > 200 and g > 200 and b > 200:     # white-alpha
            if profile == 'dark':
                return f'color-mix(in srgb, var(--ink) {pct}%, transparent)'
            return None
        if r < 60 and g < 60 and b < 60:        # black-alpha (shadows, scrims)
            return None
        # slate-alpha
        return f'color-mix(in srgb, var(--ink-3) {pct}%, transparent)'
    return f'color-mix(in srgb, var(--{fam}) {pct}%, transparent)'


COLOR_RE = re.compile(
    r'#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\([^()]*\)|\bwhite\b|\bblack\b'
)


def rewrite_color_text(text, role, profile, accent_in_block):
    if role is None:
        return text

    def sub(m):
        out = convert_color(m.group(0), role, profile, accent_in_block)
        return out if out is not None else m.group(0)

    return COLOR_RE.sub(sub, text)


# ---------------------------------------------------------------- JS scanning

def match_brace(src, i):
    """src[i] is '{' ; return index of matching '}' (string/template/comment aware)."""
    depth = 0
    n = len(src)
    while i < n:
        c = src[i]
        if c in '\'"':
            i = skip_string(src, i)
            continue
        if c == '`':
            i = skip_template(src, i)
            continue
        if c == '/' and src[i + 1:i + 2] == '/':
            j = src.find('\n', i)
            i = n if j < 0 else j
            continue
        if c == '/' and src[i + 1:i + 2] == '*':
            j = src.find('*/', i + 2)
            i = n if j < 0 else j + 2
            continue
        if c == '{':
            depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0:
                return i
        i += 1
    return -1


def skip_string(src, i):
    q = src[i]
    i += 1
    while i < len(src):
        if src[i] == '\\':
            i += 2
            continue
        if src[i] == q:
            return i + 1
        if src[i] == '\n':
            return i + 1
        i += 1
    return i


def skip_template(src, i):
    i += 1
    while i < len(src):
        c = src[i]
        if c == '\\':
            i += 2
            continue
        if c == '`':
            return i + 1
        if c == '$' and src[i + 1:i + 2] == '{':
            j = match_brace(src, i + 1)
            i = j + 1 if j > 0 else i + 2
            continue
        i += 1
    return i


STYLE_START = re.compile(
    r'(?:\b[A-Za-z]*[sS]tyle[A-Za-z]*\s*=\s*\{)'            # style={ , contentStyle={
    r'|(?:\b[A-Za-z]*[sS]tyle[A-Za-z]*\s*[=:]\s*(?:\([^)]*\)\s*=>\s*)?\(?\s*\{)'  # const xStyle = {  /  fn = () => ({
    r'|(?:\bcursor\s*=\s*\{\s*\{)'
)


def style_regions(src):
    regions = []
    for m in STYLE_START.finditer(src):
        # opening brace of the expression/object is the last '{' of the match
        brace = src.rfind('{', m.start(), m.end())
        end = match_brace(src, brace)
        if end > 0:
            regions.append((brace, end + 1))
    # merge / drop nested
    regions.sort()
    merged = []
    for s, e in regions:
        if merged and s < merged[-1][1]:
            merged[-1] = (merged[-1][0], max(merged[-1][1], e))
        else:
            merged.append((s, e))
    return merged


KEY_RE = re.compile(r'(?:^|[{,]\s*)([A-Za-z_][\w-]*)\s*:(?!:)', re.S)
STR_RE = re.compile(r"'(?:[^'\\\n]|\\.)*'|\"(?:[^\"\\\n]|\\.)*\"|`(?:[^`\\]|\\.)*`")


def has_accent(block):
    for m in COLOR_RE.finditer(block):
        t = m.group(0).lower()
        if t in ('white', 'black', '#fff', '#ffffff', '#000', '#000000'):
            continue
        if t.startswith('rgb'):
            mm = re.match(r'rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)', t)
            r, g, b = (int(float(mm.group(i))) for i in (1, 2, 3))
            if family_of(r, g, b) != 'neutral':
                return True
            continue
        p = parse_hex(t)
        if p and family_of(*p[:3]) != 'neutral':
            return True
    if re.search(r'var\(--(primary|sun|dusk|sky|rose|success|warn|danger)(-fill)?\)', block):
        return True
    return 'gradient' in block


def transform_region(region, profile):
    """Transform every string literal in a style region according to the key it belongs to."""
    keys = [(m.start(1), m.group(1)) for m in KEY_RE.finditer(region)]
    out = []
    last = 0
    accent = has_accent(region)
    for sm in STR_RE.finditer(region):
        pos = sm.start()
        # find governing key
        key = None
        for kp, kn in keys:
            if kp < pos:
                key = kn
            else:
                break
        role = role_of(key) if key else None
        lit = sm.group(0)
        if role is None:
            continue
        if lit[0] == '`':
            # transform static chunks only
            new = []
            i = 0
            while i < len(lit):
                if lit[i] == '$' and lit[i + 1:i + 2] == '{':
                    j = match_brace(lit, i + 1)
                    new.append(lit[i:j + 1])
                    i = j + 1
                else:
                    j = i
                    while j < len(lit) and not (lit[j] == '$' and lit[j + 1:j + 2] == '{'):
                        j += 1
                    new.append(rewrite_color_text(lit[i:j], role, profile, accent))
                    i = j
            newlit = ''.join(new)
        else:
            newlit = rewrite_color_text(lit, role, profile, accent)
        if newlit != lit:
            out.append(region[last:sm.start()])
            out.append(newlit)
            last = sm.end()
    out.append(region[last:])
    result = ''.join(out)
    return inject_on_dark(result)


ON_DARK_VARS = (
    "'--ink': '#ffffff', '--ink-2': 'rgba(255,255,255,0.9)', '--ink-3': 'rgba(255,255,255,0.74)', "
    "'--ink-4': 'rgba(255,255,255,0.6)', '--line': 'rgba(255,255,255,0.2)', '--line-strong': 'rgba(255,255,255,0.34)', "
    "'--surface': 'rgba(255,255,255,0.12)', '--surface-2': 'rgba(255,255,255,0.1)', '--surface-3': 'rgba(255,255,255,0.18)'"
)


def inject_on_dark(region):
    """A direct style={{...}} with a dark/gradient background + white text: scope the
    ink/surface tokens so every descendant stays readable in light AND dark mode."""
    if not region.startswith('{{') or "'--ink'" in region:
        return region
    if not re.search(r"\bcolor:\s*['\"](white|#fff|#ffffff)['\"]", region):
        return region
    bg = re.search(r"\bbackground(?:Color)?:\s*(['\"`])(.*?)\1", region, re.S)
    if not bg:
        return region
    val = bg.group(2)
    dark = 'gradient' in val
    if not dark:
        m = re.match(r'#[0-9a-fA-F]{6}$', val.strip())
        if m:
            r, g, b, _ = parse_hex(val.strip())
            dark = hls(r, g, b)[1] < 0.3
    if not dark:
        return region
    end = region.rfind('}}')
    inner = region[:end].rstrip()
    sep = '' if inner.endswith(',') else ','
    return inner + sep + ' ' + ON_DARK_VARS + ' ' + region[end:]


ATTR_RE = re.compile(r'\b(stroke|fill|stopColor)=("[^"]*"|\'[^\']*\')')


def transform_attrs(src, profile):
    def sub(m):
        attr, val = m.group(1), m.group(2)
        new = rewrite_color_text(val, 'svg', profile, False)
        return f'{attr}={new}'

    return ATTR_RE.sub(sub, src)


CSS_PROP_RE = re.compile(r'([a-zA-Z-]+)\s*:\s*([^;{}]+)(;|(?=\}))')


def transform_style_tags(src, profile):
    """<style>{`...css...`}</style> and <style dangerouslySetInnerHTML ...>"""
    out, last = [], 0
    for m in re.finditer(r'<style[^>]*>\s*\{\s*`', src):
        start = m.end() - 1
        end = skip_template(src, start)
        css = src[start:end]

        def sub(pm):
            prop = pm.group(1)
            camel = re.sub(r'-([a-z])', lambda x: x.group(1).upper(), prop)
            role = role_of(camel) or role_of(prop)
            if role is None:
                return pm.group(0)
            if '${' in pm.group(2):
                return pm.group(0)
            return f'{prop}:{rewrite_color_text(pm.group(2), role, profile, True)}{pm.group(3)}'

        newcss = CSS_PROP_RE.sub(sub, css)
        out.append(src[last:start])
        out.append(newcss)
        last = end
    out.append(src[last:])
    return ''.join(out)


def run(path, profile, skip_before=None):
    src = open(path, encoding='utf-8', newline='').read()
    start_idx = 0
    if skip_before:
        start_idx = src.index(skip_before)
    head, body = src[:start_idx], src[start_idx:]

    regs = style_regions(body)
    pieces, last = [], 0
    for s, e in regs:
        pieces.append(body[last:s])
        pieces.append(transform_region(body[s:e], profile))
        last = e
    pieces.append(body[last:])
    body = ''.join(pieces)
    body = transform_attrs(body, profile)
    body = transform_style_tags(body, profile)

    # fonts: legacy pages hard-code Outfit/Inter in places — inherit the new stack
    body = re.sub(r"fontFamily:\s*'\"Outfit\", \"Inter\", sans-serif'", "fontFamily: 'inherit'", body)
    body = re.sub(r"fontFamily:\s*'Outfit, sans-serif'", "fontFamily: 'var(--font-display)'", body)
    body = re.sub(r"fontFamily:\s*'\"Outfit\", \"Plus Jakarta Sans\", sans-serif'", "fontFamily: 'inherit'", body)

    open(path, 'w', encoding='utf-8', newline='').write(head + body)
    return len(regs)


if __name__ == '__main__':
    path, profile = sys.argv[1], sys.argv[2]
    skip = sys.argv[3] if len(sys.argv) > 3 else None
    n = run(path, profile, skip)
    print(f'{path}: {n} style regions processed')
