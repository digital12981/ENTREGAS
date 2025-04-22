release: node rebuild-static.mjs && node create-basic-assets.mjs && node extract-html-and-create-assets.mjs && node fix-static-paths.mjs
web: node heroku-start.mjs
api: gunicorn for4payments-wrapper:app