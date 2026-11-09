# Device Repository for LoRaWAN — Website

A Hugo static site generated from the lorawan-devices repository, redesigned with the TTI design system.

The live production site is served at `https://www.thethingsnetwork.org/device-repository/`. A staging build (with `noindex`) deploys to GitHub Pages via `.github/workflows/pages.yml`.

## Architecture

1. **Content generation (Go)** — `tools/build` reads `vendor/index.yaml`, every vendor's device YAML, profile YAML and codec YAML, and writes Hugo page bundles to `content/devices/{vendor}/{device}/` (front matter + product photo + codec `.js` files). URL structure is derived from this layout — **do not change output paths without an SEO migration plan**.
2. **Frontend assets (webpack)** — `src/js` (vanilla ES modules) and `src/styles` (design tokens + app CSS) build to `static/`, with a manifest in `data/manifest.json` that the Hugo templates read. No React/TTUI dependencies.
3. **Hugo** — `layouts/` renders the browse page (client-side filtering over server-rendered cards), device detail pages (tabs, live codec decoder, device emulator, battery estimator), vendor pages, tag pages, the vendors directory and the submit wizard.

## SEO invariants

- All 1,369 historical URLs (`/`, `/devices/{vendor}/{model}/`, `/devices/{vendor}/`, `/tags/{tag}/`) must keep resolving.
- `head.html` preserves the title pattern `{name} | Device Repository for LoRaWAN`, meta description, canonical + `<base>`, OG/Twitter tags, and adds JSON-LD (`Product`, `BreadcrumbList`).
- Staging builds use `--environment staging` (see `config/staging/config.toml`), which sets `noindex,nofollow` and removes Google Tag Manager. Production builds keep `index,follow` + GTM.

## Local development

Requirements: `node` + `yarn`, `go`, `hugo` (extended).

```sh
# 1. Generate content from the vendor YAML files
make go.deps && make go.build

# 2. Build frontend assets (creates static/ and data/manifest.json)
yarn install && yarn build

# 3. Serve
make run     # hugo server at http://localhost:1313/device-repository/
```

For asset watch mode use `yarn start` (webpack-dev-server) alongside `make run`.

## Production build

```sh
cd website
make go.deps && make go.build
yarn install && yarn build
hugo --minify --baseURL https://www.thethingsnetwork.org/device-repository
```

## Staging build (GitHub Pages)

```sh
cd website
make go.deps && make go.build
yarn install && BASE_PATH=/lorawan-devices yarn build
hugo --minify --environment staging --baseURL https://<user>.github.io/lorawan-devices
```
