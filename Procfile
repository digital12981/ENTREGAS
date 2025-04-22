release: node heroku-verify.mjs && node rebuild-static.mjs && node create-basic-assets.mjs && node fix-static-paths.mjs && node copy-static-files.mjs
web: node heroku-start.mjs
api: gunicorn for4payments-wrapper:app