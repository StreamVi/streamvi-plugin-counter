# StreamVi View Online Widget

Minimal `React + TypeScript + Vite` widget for showing the current viewer count of a StreamVi channel in real time.

## Features

- latest Vite-based React setup
- strict TypeScript and type-aware ESLint
- live updates through Centrifugo
- compact overlay-friendly UI
- small surface area, ready for open-source publishing

## Requirements

- Node.js `^20.19.0 || >=22.12.0`
- npm `>=10`

## Environment

Create a local env file from the example:

```bash
cp .env.example .env.local
```

Variables:

- `PORT` - local Vite dev/preview port, default `5511`
- `VITE_STREAMVI_API_HOST` - StreamVi API host
- `VITE_CENTRIFUGO_HOST` - Centrifugo websocket host

## Development

```bash
npm install
npm run dev
```

By default the app runs on `http://localhost:5511`.

## Usage

Open the settings page with these query params:

- `template_id=YOUR_TEMPLATE_ID`
- `token=YOUR_token`

Example:

```text
http://localhost:5511/?template_id=YOUR_TEMPLATE_ID&token=YOUR_token
```

The OBS/browser-source path is separate:

```text
http://localhost:5511/obs?template_id=YOUR_TEMPLATE_ID&token=YOUR_token
```

## Available Scripts

- `npm run dev` - start local development server
- `npm run build` - type-check and build production assets
- `npm run lint` - run ESLint
- `npm run typecheck` - run TypeScript project checks
- `npm run check` - run lint and production build

## Build and Deploy

Build the production bundle locally:

```bash
npm install
npm run build
```

This creates the static build in `dist/`.

To deploy from this computer to the remote server `78.17.65.100`, you can sync the build output to the `layout-viewers` app directory.

Working assumption:

- remote app name: `layout-viewers`
- remote target directory: `/var/www/layout-viewers`
- deployment is done over SSH from the local machine

Example deploy command:

```bash
rsync -avz --delete dist/ DEPLOY_USER@78.17.65.100:/var/www/layout-viewers/
```

If the target directory requires elevated permissions on the server, upload to a temporary directory first and then move it over SSH:

```bash
rsync -avz --delete dist/ DEPLOY_USER@78.17.65.100:/tmp/layout-viewers/
ssh DEPLOY_USER@78.17.65.100 "sudo mkdir -p /var/www/layout-viewers && sudo rsync -av --delete /tmp/layout-viewers/ /var/www/layout-viewers/"
```

Recommended deployment flow from the local machine:

```bash
npm run lint
npm run typecheck
npm run build
rsync -avz --delete dist/ DEPLOY_USER@78.17.65.100:/var/www/layout-viewers/
```

After deploy, ensure your web server on the remote host serves `/var/www/layout-viewers` as a static site and rewrites SPA requests to `index.html` when needed.

## Project Structure

```text
src/
  features/viewers/   realtime widget logic
  config.ts           env handling
  App.tsx             app entry component
```

## License

MIT, see [LICENSE](./LICENSE).
