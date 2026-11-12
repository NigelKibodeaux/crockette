# crockette

Make sure you have mono installed first
```
npm install
npm run build
npm start
```

To publish a new version:

1. `npm version major|minor|patch`
1. `git push --follow-tags`
1. The Release workflow on Github builds the Mac and Windows zips and publishes the release. Running copies of Crockette will then prompt their users to update.

To build the zips locally instead, run `npm run build` and look in `out/make/zip/`.
