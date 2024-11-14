# pc-pdfa-conversion

## Requirements

- Python 3.x
- Ghostscript (Ensure Ghostscript is installed and the `gswin32` or `gswin64` (for Windows ) `gs` (for MAC) command is available in your system's PATH

## Installation

### macOS

1. **Install Homebrew** (if not already installed):

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. **Install Python**:

```bash
brew install python
```

3. **Install Ghostscript**:

```bash
brew install ghostscript
```

Set the environment variable GS4JS_HOME to  '/usr/local/lib‘

5. **Install dependencies**:

```bash
pip install -r requirements.txt
```

## Project setup

```sh
# yarn
yarn

# npm
npm install

# pnpm
pnpm install
```

### Compiles and hot-reloads for development

```sh
# yarn
yarn dev

# npm
npm run dev

# pnpm
pnpm dev
```

### Compiles and minifies for production

```sh
# yarn
yarn build

# npm
npm run build

# pnpm
pnpm build
```

### Run and Debug

```sh
# yarn
yarn app:preview

# npm
npm run app:preview

Select Electron: Main
Start Debugging
```
