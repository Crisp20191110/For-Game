"""Package only static web assets, runnable on any HTTPS static host root."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parents[1]
output = root / 'dist' / 'one-leaf-web.zip'
output.parent.mkdir(exist_ok=True)
files = [root / name for name in ('index.html', 'manifest.webmanifest', 'sw.js')]
files += sorted((root / 'src').glob('*')) + sorted((root / 'public').glob('*'))
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for file in files:
        if file.is_file():
            archive.write(file, file.relative_to(root))
print(f'{output} ({output.stat().st_size} bytes)')
