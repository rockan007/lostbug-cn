# LostBug production build

`lostbug-cn-next-build.tar.gz` contains the production `.next` output, public assets, and package manifests for this revision.

Deploy it on a Node.js host from an empty directory:

```bash
tar -xzf lostbug-cn-next-build.tar.gz
npm ci --omit=dev
DATABASE_URL='postgresql://…' npm start
```

The archive intentionally excludes `.next/dev`, build caches, diagnostics, and local trace files. Install dependencies on the target host so native packages match the server operating system and architecture.
