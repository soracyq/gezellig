const esbuild=require('esbuild');
esbuild.build({entryPoints:['src/imports/worker.ts'],bundle:true,platform:'browser',format:'iife',outfile:'public/import-worker.js',minify:true,target:['es2022']}).catch(()=>process.exit(1));
