import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
await build({entryPoints:['src/squad-app.js'],outfile:'public/game.js',bundle:true,format:'iife',target:['safari15'],minify:true,banner:{js:"/* One Leaf v5.0 - bundled for static hosting and Safari */\nif(!Object.hasOwn)Object.hasOwn=function(o,k){return Object.prototype.hasOwnProperty.call(o,k);};"}});
let css='/* One Leaf v5.0 */\n';
for(const file of ['src/style.css','src/cards.css','src/visual.css','src/immortal.css'])css+=await readFile(file,'utf8')+'\n';
await writeFile('public/game.css',css);
console.log('Built self-contained browser script and styles: public/game.js, public/game.css');
let html=await readFile('index.html','utf8');
let inlineCss=css;
for(const [i,asset] of ['heroes-atlas.png','heroes-atlas-2.png','sanctuary.png'].entries()){const bytes=await readFile('public/'+asset);inlineCss=inlineCss.replaceAll("url('./"+asset+"')",`var(--embedded-image-${i})`);inlineCss+=`:root{--embedded-image-${i}:url('data:image/png;base64,${bytes.toString('base64')}')}`;}
html=html.replace(/<link[^>]+rel="(?:manifest|icon|apple-touch-icon)"[^>]*>/g,'').replace(/<link[^>]+href="\.\/public\/game.css[^>]*>/,()=>`<style>${inlineCss}</style>`).replace(/<script defer src="\.\/public\/game.js[^>]*><\/script>/,()=>`<script>window.__standalone=true;${''}</script><script>${''}</script>`);
const js=(await readFile('public/game.js','utf8')).replace(/<\/script/gi,'<\\/script');
html=html.replace('<script></script>',()=>`<script>${js}</script>`);
await writeFile('play.html',html);
