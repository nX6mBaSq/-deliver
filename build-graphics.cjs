// Editable, local vector illustrations. Measurements remain live HTML text.
const fs = require('node:fs');
const dir = 'images/graphics';
fs.mkdirSync(dir, { recursive: true });
const navy = '#0b2f5b', blue = '#0866d6', pale = '#dbeefc', teal = '#087a72', cream = '#f6d68f', amber = '#8a5200';
// Fresh sky tints replace the earlier grey-blue shading (applied after the palette swap below).
const sky = {'#dce8f2':'#d9eafa','#dbe9f4':'#d6eafb','#97bfda':'#8cc4ef','#91b6d3':'#86bdea','#e4eff7':'#e3f1fd','#d2e3ef':'#d3e8fb','#bdd5e6':'#bcdcf6','#6894b8':'#5d97d1','#b3d6e7':'#aedaf7','#dbe9f5':'#d6eafb','#d8e5ec':'#d6e8f7','#d8e7ec':'#d4e9fa','#78a6b2':'#6aa4d4','#b3cedf':'#a9cdeb','#8eb5ce':'#80b5e0','#438dd1':'#3b8fe6','#a5caec':'#9fd0f7','#c4dfd8':'#bfe8e1','#e7f1fb':'#e4f2fd','#d1e1eb':'#d3e6f5','#bed6e7':'#b8d9f2','#d5e6f4':'#d3e9fb','#b6cfdf':'#acd2ee'};
function svg(name, w, h, content) {
  // Keep the existing small icon paths on the same palette as the larger scenes.
  for (const [oldColor, newColor] of Object.entries({'#163c63':navy,'#2274bf':blue,'#3f8c88':teal,'#f7d995':cream,'#dfedfa':pale,'#e0efec':'#def5f1',...sky})) content=content.replaceAll(oldColor,newColor);
  fs.writeFileSync(`${dir}/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none"><g stroke="${navy}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">${content}</g></svg>\n`);
}
const box = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 18 36 0 80 20 44 40Z" fill="${cream}"/><path d="M0 18v53l44 22V40Z" fill="#edd09a"/><path d="m44 40 36-20v53L44 93Z" fill="#dcb779"/><path d="m18 9 44 21v19l-13 6V36L7 15" stroke="none" fill="#fff0cf"/><path d="m59 61 10-5"/></g>`;
const fridge = `<rect x="35" y="8" width="92" height="161" rx="9" fill="#f8fcff"/><path d="M35 65h92"/><path d="M49 36v16m0 28v31" stroke="${blue}" stroke-width="5"/><path d="M45 171v7m72-7v7"/>`;
const washer = `<path d="M29 52 42 27h85l12 25v116H29Z" fill="#f8fcff"/><path d="M29 52h110"/><path d="m46 44 6-11h65l6 11Z" fill="${pale}"/><path d="M42 66h83" stroke="#b3cedf"/><rect x="53" y="39" width="48" height="4" rx="2" fill="#8eb5ce" stroke="none"/><circle cx="123" cy="58" r="3" fill="${blue}" stroke="none"/><path d="M47 154h74M43 172v5m82-5v5" stroke="#8eb5ce"/>`;
const drawers = `<rect x="32" y="31" width="99" height="137" rx="7" fill="#d8e7ec"/>${[36,68,100,132].map(y=>`<rect x="38" y="${y}" width="87" height="28" rx="4" fill="#fff"/><path d="M69 ${y+10}h25" stroke="#78a6b2"/>`).join('')}`;
const clothes = `<path d="M25 171V36h112v135M15 171h26m81 0h26"/><path d="M81 37V25q0-11 10-11"/><path d="m80 36-30 22h62Z" fill="#fff"/><path d="m61 49-25 18 11 24 13-8v71h44V83l13 8 11-24-28-18-20 11Z" fill="${blue}"/><path d="m76 59 6 22 7-22" stroke="#b5d9f7"/>`;
const mattress = `<path d="m45 21 50-15q16-4 20 9l29 132q3 13-9 17l-51 15q-11 3-15-11L35 39q-3-14 10-18Z" fill="#f2e5c9"/><path d="m45 21 31 134q3 11 15 8l50-15" stroke="#c1a976"/><path d="m62 43 40-11M70 76l39-11M78 109l39-11M86 143l37-11" stroke="#d3bc8d"/>`;
const bicycle = `<circle cx="43" cy="121" r="33" fill="#f8fcff"/><circle cx="132" cy="121" r="33" fill="#f8fcff"/><path d="m43 121 31-58 27 58H43l46-40h32l11 40M108 58h17m-4 0v23M64 62h24" stroke="${teal}" stroke-width="6"/>`;
for (const [name, art] of Object.entries({fridge,washer,drawers,clothes,mattress,bicycle,boxes:box(18,73,.8)+box(73,81,.8)+box(58,20,.75)})) {
  svg(name,180,190, `<ellipse cx="90" cy="177" rx="70" ry="8" fill="#d8e5ec" stroke="none"/>${art}`);
}
svg('cargo-side',800,560, `
  <ellipse cx="410" cy="491" rx="336" ry="19" fill="#dce8f2" stroke="none"/>
  <path d="M104 244h118v207H72V331Z" fill="#dbe9f4"/><path d="M118 267h77v74H90Z" fill="#97bfda"/><path d="M195 357h-18M69 415h152"/>
  <path d="M120 90h550v374H252V222H120Z" fill="#fff" stroke-width="5"/>
  <path d="M127 97h536v118H127Z" fill="#f9e6b5" stroke="none"/>
  <path d="M259 228h404v229H259Z" fill="#e7f1fb" stroke="none"/>
  <path d="M120 222h550" stroke="${teal}" stroke-width="4"/>
  <rect x="151" y="137" width="365" height="58" rx="22" fill="#fff8e8" stroke="#a78742"/><path d="M168 166h331" stroke="#d9c58f"/>
  <rect x="535" y="156" width="102" height="39" rx="19" fill="#fff8e8" stroke="#a78742"/><path d="M549 173h72" stroke="#d9c58f"/>
  <g transform="translate(270 265) scale(1.05)">${fridge}</g>
  <g transform="translate(422 289) scale(.85)">${drawers}</g>${box(563,354,.95)}${box(562,276,.9)}
  <path d="M220 469h463" stroke-width="12"/>
  <circle cx="142" cy="465" r="34" fill="${navy}"/><circle cx="142" cy="465" r="15" fill="#d2e3ef"/>
  <circle cx="574" cy="465" r="34" fill="${navy}"/><circle cx="574" cy="465" r="15" fill="#d2e3ef"/>
  <g stroke="${teal}" stroke-width="2"><path d="M120 62h550m-550-9v18m550-18v18M252 526h418m-418-9v18m418-18v18M706 90v374m-9-374h18m-18 374h18"/><path d="m130 57-10 5 10 5m530-10 10 5-10 5M262 521l-10 5 10 5m398-10 10 5-10 5"/></g>
  <g stroke="none" font-family="Arial,sans-serif" font-size="20" font-weight="700" text-anchor="middle"><circle cx="394" cy="62" r="23" fill="${amber}"/><text x="394" y="69" fill="white">01</text><circle cx="461" cy="526" r="23" fill="${blue}"/><text x="461" y="533" fill="white">02</text><circle cx="706" cy="276" r="23" fill="${navy}"/><text x="706" y="283" fill="white">03</text></g>`);
svg('truck',760,440, `
  <ellipse cx="388" cy="369" rx="298" ry="21" fill="#dce8f2" stroke="none"/>
  <path d="m258 76 97-42 320 48-103 43Z" fill="#dbe9f5"/><path d="m572 125 103-43v237l-103 44Z" fill="#91b6d3"/><path d="M258 76 572 125v236l-314-45Z" fill="#f7fbff"/>
  <path d="m258 188-105-15-68 103v61l173 22Z" fill="#fff"/><path d="m165 199 72 10v73l-116-16Z" fill="#b3d6e7"/><path d="m184 283 44 7m-118 29 33 4"/>
  <path d="m280 111 270 43v173l-270-40Z" stroke="#b6cfdf" stroke-dasharray="9 9"/>
  <path d="m92 342 467 52" stroke-width="12"/>
  <ellipse cx="173" cy="348" rx="33" ry="42" fill="${navy}"/><ellipse cx="173" cy="348" rx="15" ry="23" fill="#bdd5e6"/>
  <ellipse cx="494" cy="383" rx="33" ry="42" fill="${navy}"/><ellipse cx="494" cy="383" rx="15" ry="23" fill="#bdd5e6"/>
  <path d="m302 233 48 7m-48 12 89 13" stroke="${blue}" stroke-width="9"/>
  <path d="M704 75v272m-8-272h16m-16 272h16M84 396l169 24m-169-31v14m169 10v14" stroke="${teal}" stroke-width="2"/>`);
function loaded(extra) {
 return `<ellipse cx="300" cy="442" rx="226" ry="17" fill="#dce8f2" stroke="none"/><rect x="108" y="35" width="384" height="386" rx="24" fill="${navy}"/><rect x="125" y="51" width="350" height="348" rx="14" fill="#e4eff7"/><path d="M125 155h350" stroke="${teal}" stroke-width="9"/><rect x="148" y="76" width="222" height="59" rx="20" fill="#f4e1b5"/><rect x="383" y="89" width="70" height="44" rx="17" fill="#f4e1b5"/>
 <g transform="translate(123 207) scale(1.05)">${fridge}</g><g transform="translate(279 170) scale(.73)">${clothes}</g>
 <g transform="translate(234 278) scale(.65)">${drawers}</g><g transform="translate(365 274) scale(.69)">${washer}</g>
 ${extra?`<g transform="translate(250 168) scale(1.14)">${bicycle}</g>${box(325,328,.62)}`:`${box(322,321,.7)}${box(328,265,.65)}`}
 <path d="M114 410h372" stroke="#6894b8" stroke-width="16"/><path d="M152 428v14m296-14v14" stroke-width="24"/>`;
}
svg('load-standard',600,480,loaded(false));svg('load-extra',600,480,loaded(true));
svg('team',800,340, `
 <path d="M53 293h694" stroke="#d1e1eb"/><path d="M610 271V101h102v171M630 121h61v55m-31-55v55" stroke="#bed6e7"/><path d="m80 271 20-104 23 104m-39-42h35" stroke="#8cbbb0"/>
 <circle cx="285" cy="79" r="29" fill="#f4d6b5"/><path d="M255 65q3-37 42-25l19 26Z" fill="${navy}"/><path d="M256 112h55l20 101h-85Z" fill="${blue}"/>
 <path d="m261 212-14 73m54-73 17 73" stroke="${navy}" stroke-width="22"/><path d="m271 139 57 41 37-5" stroke="#f4d6b5" stroke-width="19"/>
 <circle cx="520" cy="79" r="29" fill="#f4d6b5"/><path d="M490 72q-8-39 34-36 33 3 30 55l-12-7-11-30-40 21" fill="${navy}"/><path d="M495 112h55l19 101h-88Z" fill="${teal}"/>
 <path d="m495 212-8 73m56-73 15 73" stroke="${navy}" stroke-width="22"/><path d="m505 139-49 41-37-5" stroke="#f4d6b5" stroke-width="19"/>
 <path d="M344 128h99v81h-99Z" fill="${cream}"/><path d="M382 128v31h24v-31" fill="#fff1cd"/><path d="M362 190h20"/>
 <path d="m244 296 23-1m41 0 22 1m147 0h23m46 0h22" stroke-width="12"/>
 <path d="M373 68h45m-23-22v44" stroke="#d5e6f4" stroke-width="8"/>`);
svg('protection',360,250,`<circle cx="180" cy="121" r="106" fill="#dfedfa" stroke="none"/><path d="m100 61 99-28 71 49v124l-107 24-63-47Z" fill="${blue}"/><path d="m100 61 64 42 106-21M164 103v127" stroke="#a5caec"/><path d="m122 73 58 152m-27-169 59 161m-73-137 130 82m-169-39 139 83" stroke="#438dd1"/><circle cx="278" cy="188" r="41" fill="${teal}" stroke="white" stroke-width="7"/><path d="m260 188 12 12 24-28" stroke="white" stroke-width="6"/>`);
svg('insurance',360,250,`<circle cx="180" cy="121" r="106" fill="#e0efec" stroke="none"/><path d="M179 28q39 29 89 36v70q-9 62-89 96-79-34-89-96V64q53-7 90-36Z" fill="#fff" stroke="${teal}" stroke-width="6"/><path d="m117 137 45 9 28-15 44 3-23 37-47 11-47-18Z" fill="#c4dfd8"/><path d="M182 81c-29-35-65 8 0 46 65-38 28-81 0-46Z" fill="${blue}" stroke="none"/><path d="m250 37 6-16m12 24 16-6" stroke="#cca557"/>`);
const icons={
 contact:'<rect x="28" y="12" width="44" height="72" rx="9" fill="white"/><path d="M41 22h18M44 74h12"/><path d="M52 36h29v24H65l-10 9v-9h-3Z" fill="#f7d995"/>',
 estimate:'<rect x="23" y="14" width="54" height="73" rx="7" fill="white"/><path d="M36 31h28M36 43h18M36 55h10"/><circle cx="70" cy="71" r="20" fill="#c4dfd8"/><path d="m60 70 7 7 13-15"/>',
 payment:'<rect x="13" y="25" width="74" height="50" rx="8" fill="white"/><path d="M13 40h74M26 61h17"/><circle cx="76" cy="74" r="17" fill="#f7d995"/><path d="m68 74 6 6 10-12"/>',
 calendar:'<rect x="18" y="24" width="65" height="62" rx="8" fill="white"/><path d="M18 42h65M34 15v19m33-19v19"/><path d="m34 64 10 10 23-24" stroke="#3f8c88" stroke-width="5"/>',
 move:'<path d="M11 31h47v42H11Z" fill="white"/><path d="M58 43h17l15 17v13H58Z" fill="#c4dfd8"/><path d="M67 49v12h18"/><circle cx="29" cy="76" r="10" fill="#163c63"/><circle cx="75" cy="76" r="10" fill="#163c63"/><path d="M20 20h31M10 11h26" stroke="#2274bf"/>',
 clock:'<circle cx="50" cy="50" r="34" fill="white"/><path d="M50 29v23l17 11" stroke="#2274bf" stroke-width="5"/><path d="m73 17 10 12"/>',
 chat:'<path d="M14 23h71v48H42L24 86V71H14Z" fill="white"/><path d="m53 32-15 21h16l-8 12 22-22H53Z" fill="#f7d995"/>',
 packing:'<path d="m14 35 36-18 37 18-37 18Z" fill="#f7d995"/><path d="M14 35v39l36 18 37-18V35M50 53v39" fill="#f7d995"/><path d="m31 27 38 17v16"/>',
 route:'<circle cx="27" cy="69" r="10" fill="#c4dfd8"/><path d="M38 69h26q24 0 24-20T65 31H43" stroke-dasharray="5 7"/><path d="M44 28c0 15-18 28-18 28S8 43 8 28a18 18 0 0 1 36 0Z" fill="white"/><circle cx="26" cy="27" r="5" fill="#2274bf"/>',
};
for(const [name,art] of Object.entries(icons)) svg(`icon-${name}`,100,100,art);
console.log(`Created ${fs.readdirSync(dir).filter(f=>f.endsWith('.svg')).length} local SVG illustrations in images/graphics.`);
