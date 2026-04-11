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
- `npm run check` - run lint and production build

## Project Structure

```text
src/
  features/viewers/   realtime widget logic
  config.ts           env handling
  App.tsx             app entry component
```

## License

MIT, see [LICENSE](./LICENSE).
