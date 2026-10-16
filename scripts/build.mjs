import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
await build({entryPoints:['src/squad-app.js'],outfile:'public/game.js',bundle:true,format:'iife',target:['safari15'],minify:true,banner:{js:"/* One Leaf v6.1.0 - bundled for static hosting and Safari */\nif(!Object.hasOwn)Object.hasOwn=function(o,k){return Object.prototype.hasOwnProperty.call(o,k);};"}});
let css='/* One Leaf v6.1.0 */\n';
for(const file of ['src/style.css','src/cards.css','src/visual.css','src/immortal.css','src/gacha.css','src/armory.css'])css+=await readFile(file,'utf8')+'\n';
await writeFile('public/game.css',css);
console.log('Built self-contained browser script and styles: public/game.js, public/game.css');
let html=await readFile('index.html','utf8');
let inlineCss=css;
const embeddedAssets=[];
for(const [i,asset] of ['heroes-atlas.png','heroes-atlas-2.png','sanctuary.png','gear-atlas.png'].entries()){const bytes=await readFile('public/'+asset);inlineCss=inlineCss.replaceAll("url('./"+asset+"')",`var(--embedded-image-${i})`);embeddedAssets.push(bytes.toString('base64'));}
// Large data URLs exceed browser custom-property limits. Keep CSS variables small
// by creating local Blob URLs once from the embedded PNG bytes. No network is used.
const assetBootstrap=`window.__standalone=true;(()=>{const assets=${JSON.stringify(embeddedAssets)};for(let i=0;i<assets.length;i++){const raw=atob(assets[i]),bytes=new Uint8Array(raw.length);for(let n=0;n<raw.length;n++)bytes[n]=raw.charCodeAt(n);const url=URL.createObjectURL(new Blob([bytes],{type:'image/png'}));document.documentElement.style.setProperty('--embedded-image-'+i,'url(\"'+url+'\")');}})();`;
html=html.replace(/<link[^>]+rel="(?:manifest|icon|apple-touch-icon)"[^>]*>/g,'').replace(/<link[^>]+href="\.\/public\/game.css[^>]*>/,()=>`<style>${inlineCss}</style>`).replace(/<script defer src="\.\/public\/game.js[^>]*><\/script>/,()=>`<script>${assetBootstrap}</script><script></script>`);
const js=(await readFile('public/game.js','utf8')).replace(/<\/script/gi,'<\\/script');
html=html.replace('<script></script>',()=>`<script>${js}</script>`);
await writeFile('play.html',html);
