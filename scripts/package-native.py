"""Package native-only and skill downloads. No panel runtime is added to these ZIPs."""
import hashlib
from pathlib import Path
import zipfile

ROOT = Path(__file__).resolve().parents[1]
version = (ROOT / 'skills/nicole-pet/VERSION').read_text().strip()
output = ROOT / 'dist' / f'native-v{version}'
output.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(output / 'nicole-codex-v2.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for name in ['pet.json', 'spritesheet.webp']:
        archive.write(ROOT / 'output/nicole' / name, f'nicole/{name}')
with zipfile.ZipFile(output / 'nicole-pet-skill.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for file in sorted((ROOT / 'skills/nicole-pet').rglob('*')):
        if file.is_file() and file.name != '.DS_Store':
            archive.write(file, file.relative_to(ROOT / 'skills'))
packages = [*output.glob('*.zip'), *(ROOT / 'dist/pet').glob(f'nicole-pet-{version}-*.zip')]
checksums = [f'{hashlib.sha256(file.read_bytes()).hexdigest()}  {file.name}' for file in sorted(packages)]
(output / 'SHA256SUMS.txt').write_text('\n'.join(checksums) + '\n')
print(output)
