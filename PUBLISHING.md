# Publishing

The npm package name is `opencode-desktop-notify`.

## First publication

```sh
npm login
npm test
npm pack --dry-run
npm publish
```

`prepack` builds `dist/` automatically before packing or publishing.

## New release

Update the version without creating a Git tag automatically:

```sh
npm version patch --no-git-tag-version
npm test
npm publish
```

Use `minor` or `major` instead of `patch` when appropriate. Commit and tag the
release separately after reviewing `package.json`, `package-lock.json`, and the
published tarball contents.
