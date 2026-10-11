# Ícones locais — 11/10/2026

Material Symbols Rounded é distribuído sob Apache 2.0. A licença original acompanha
`public/fonts/LICENSE-material-symbols.txt`; fonte e hash estão no JSON ao lado.
O subset contém os nomes de `ICONS` e preserva os eixos variáveis `opsz` (20–48),
`wght` (300–700), `FILL` (0–1) e `GRAD` (−50–200). O app usa apenas o arquivo
WOFF2 local, com preload e cache offline; não consulta Google Fonts em runtime.
Até `document.fonts.load` confirmar a fonte carregada, os glifos ficam invisíveis
com espaço reservado. A regra também cobre spans de pins feitos por HTML e evita
expor nomes técnicos em conexões lentas ou quando o download falha.

Fonte oficial: https://developers.google.com/fonts/docs/material_symbols
Licença: https://github.com/google/material-design-icons/blob/master/LICENSE

Ao acrescentar um ícone a `ICONS`, regenerar o subset e o manifesto na raiz:

```python
from pathlib import Path
import hashlib, json, re, urllib.request

names = re.findall(r"  '([^']+)',", Path('src/ui/icons.ts').read_text())
url = ('https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:'
       'opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200&icon_names='
       + ','.join(names) + '&display=block')
ua = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) '
      'Chrome/131.0.0.0 Safari/537.36')
css = urllib.request.urlopen(urllib.request.Request(url, headers={
    'User-Agent': ua}), timeout=30).read().decode()
source = re.search(r'url\((https://[^)]+)\)', css).group(1)
font = urllib.request.urlopen(source, timeout=30).read()
assert font[:4] == b'wOF2'
folder = Path('public/fonts')
(folder / 'material-symbols-rounded.woff2').write_bytes(font)
(folder / 'material-symbols-rounded.json').write_text(json.dumps({
    'iconNames': names, 'sha256': hashlib.sha256(font).hexdigest(),
    'source': source, 'stylesheet': url,
}, indent=2) + '\n')
```

Verificar com `npx vitest run src/ui/icons.test.ts` e build com
`GITHUB_ACTIONS=true npm run build`: CSS e preload precisam apontar para
`/travel-boss/fonts/material-symbols-rounded.woff2`.
