Next generation [reveal-app](https://github.com/patarapolw/reveal-app) that also works offline.

## Configuration

A discardable config is in `.env` which contains configuration such as `PORT`, `DEV_SERVER_PORT` and `DATA_PATH`, which all have default values. This can be safely edited / deleted, and will not be contained in Electron app.

Another part of configuration is in `.env.local` (which is not synced to GitHub). Create `.env.local` alongside `.env` to enable syncing.

```
AUTH0_CLIENT_ID=<AUTH0_CLIENT_ID>
AUTH0_DOMAIN=<AUTH0_DOMAIN>
AUTH0_CLIENT_SECRET=<AUTH0_CLIENT_SECRET>
SECRET_KEY=<SECRET_KEY>
MONGO_URI=<MONGO_URI>
```

## Installation

- `cd web && npm run build`

## Running the server

- `cd server && npm start`

## Plan

Remove `.env.local`. Write to "`DATA_PATH`/config.yaml" instead.
