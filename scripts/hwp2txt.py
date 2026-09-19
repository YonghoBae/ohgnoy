import sys, zlib, struct, olefile, re

def extract(path):
    f = olefile.OleFileIO(path)
    # 압축 여부
    head = f.openstream('FileHeader').read()
    compressed = bool(head[36] & 1)
    out = []
    for entry in sorted(f.listdir(), key=lambda e: (e[0], len(e) > 1 and e[1] or '')):
        if entry[0] != 'BodyText':
            continue
        data = f.openstream(entry).read()
        if compressed:
            try:
                data = zlib.decompress(data, -15)
            except Exception:
                continue
        out.append(parse_records(data))
    f.close()
    return '\n'.join(out)

HWPTAG_PARA_TEXT = 0x43  # 67

def parse_records(data):
    i, texts = 0, []
    while i + 4 <= len(data):
        header = struct.unpack('<I', data[i:i+4])[0]
        tag = header & 0x3FF
        size = (header >> 20) & 0xFFF
        i += 4
        if size == 0xFFF:
            size = struct.unpack('<I', data[i:i+4])[0]
            i += 4
        payload = data[i:i+size]
        i += size
        if tag == HWPTAG_PARA_TEXT:
            texts.append(decode_para(payload))
    return '\n'.join(t for t in texts if t.strip())

def decode_para(p):
    out, i = [], 0
    while i + 1 < len(p):
        code = struct.unpack('<H', p[i:i+2])[0]
        if code in (0, 10, 13):
            out.append('\n' if code != 0 else '')
            i += 2
        elif 1 <= code <= 7 or 9 <= code <= 18 or code in (20, 21, 22, 23):
            i += 16 if code in (1,2,3,11,12,14,15,16,17,18,21,22,23) else 2
        else:
            out.append(chr(code)); i += 2
    return ''.join(out)

for path in sys.argv[1:]:
    print('=' * 20, path)
    try:
        print(extract(path))
    except Exception as e:
        print('ERR', e)
