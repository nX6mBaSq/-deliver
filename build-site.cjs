const fs=require('node:fs');
const esbuild=require('esbuild');
const {PurgeCSS}=require('purgecss');
const common=['refresh','foundations','structure','typography'];
const pageStyles={index:['common','top',...common,'graphics','colors','polish','architecture'],company:['common','company',...common,'colors','polish','architecture'],'important-notes':['common','important-notes',...common,'colors','polish','architecture'],'privacy-policy':['common','privacy-policy',...common,'colors','polish','architecture']};
(async()=>{
 for(const [page,styles] of Object.entries(pageStyles)){
  const css=['fonts',...styles].map(name=>fs.readFileSync(`css/${name}.css`,'utf8')).join('\n');
  const file=`css/site-${page}.min.css`;
  const [{css:usedCss}]=await new PurgeCSS().purge({content:[page+'.html','js/*.js'],css:[{raw:css}],safelist:['is-open','has-modal-open','visually-hidden'],dynamicAttributes:['aria-expanded','aria-current','aria-invalid','open']});
  await esbuild.build({stdin:{contents:usedCss,loader:'css',resolveDir:__dirname+'/css'},outfile:file,minify:true,charset:'utf8',legalComments:'none',target:['chrome110','safari16.4','firefox115']});
  let html=fs.readFileSync(page+'.html','utf8');
  html=html.replace(/<link[^>]+(?:rel="stylesheet"|rel="preconnect")[^>]*>\s*/g,'');
  html=html.replace(/<link[^>]+rel="preload"[^>]*>\s*/g,'');
  html=html.replace('</head>',`<link rel="preload" href="fonts/noto-sans-jp-critical.woff2" as="font" type="font/woff2" crossorigin>\n<link rel="stylesheet" href="${file}">\n</head>`);
  fs.writeFileSync(page+'.html',html);console.log(`${page}: ${Buffer.byteLength(css)} → ${fs.statSync(file).size} CSS bytes`);
 }
})().catch(e=>{console.error(e);process.exitCode=1});
