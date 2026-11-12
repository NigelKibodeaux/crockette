# crockette

Make sure you have mono installed first
```
npm install
npm run build
npm start
```

To publish a new version:

1. `npm version major|minor|patch`
1. `npm run build`
1. Create a release on Github and upload the Mac and Windows zips from `out/make/zip/`
