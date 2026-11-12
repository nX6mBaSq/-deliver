const fs=require('node:fs');
const crypto=require('node:crypto');
const esbuild=require('esbuild');
const {PurgeCSS}=require('purgecss');
const common=['refresh','foundations','structure','typography'];
const pageStyles={index:['common','top',...common,'graphics','colors','polish','architecture','layout','design-system','hero','service','price','capacity','process','promise','faq','cta','header'],company:['common','company',...common,'colors','polish','architecture','layout','header'],'important-notes':['common',...common,'colors','polish','architecture','layout','design-system','important-notes','cta','header'],'privacy-policy':['common',...common,'colors','polish','architecture','layout','design-system','privacy-policy','cta','header']};
(async()=>{
 for(const [page,styles] of Object.entries(pageStyles)){
  const css=['fonts',...styles].map(name=>fs.readFileSync(`css/${name}.css`,'utf8')).join('\n');  const file=`css/site-${page}.min.css`;
  // HTML comments (shelved old designs) are dropped so their CSS is not kept as "used"; rebuild after restoring one.
  const [{css:usedCss}]=await new PurgeCSS().purge({content:[{raw:fs.readFileSync(page+'.html','utf8').replace(/<!--[\s\S]*?-->/g,''),extension:'html'},'js/*.js'],css:[{raw:css}],safelist:['is-open','has-modal-open','visually-hidden'],dynamicAttributes:['aria-expanded','aria-current','aria-invalid','open']});
  // typesetting.css is appended after PurgeCSS, which drops valid :is()/:has() selectors.
  const finalCss=usedCss+'\n'+fs.readFileSync('css/typesetting.css','utf8');
  await esbuild.build({stdin:{contents:finalCss,loader:'css',resolveDir:require('node:path').resolve(__dirname,'../css')},outfile:file,minify:true,charset:'utf8',legalComments:'none',target:['chrome110','safari16.4','firefox115']});
  // Content hash busts stale browser/CDN caches after each deploy.
  const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,8);
  let html=fs.readFileSync(page+'.html','utf8');
  html=html.replace(/<link[^>]+(?:rel="stylesheet"|rel="preconnect")[^>]*>\s*/g,'');
  html=html.replace(/<link[^>]+rel="preload"[^>]*>\s*/g,'');
  html=html.replace('</head>',`<link rel="preload" href="fonts/noto-sans-jp-critical.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="stylesheet" href="${file}?v=${hash}">\n</head>`);
  fs.writeFileSync(page+'.html',html);console.log(`${page}: ${Buffer.byteLength(css)} → ${fs.statSync(file).size} CSS bytes`);
 }
})().catch(e=>{console.error(e);process.exitCode=1});
