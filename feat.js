// Round 60: districts with adjacency bonuses
(function(){
const RULES=[
 {id:'com',n:'الحي التجاري',i:'🏪',a:['market','port','workshop'],res:'gold',v:.45,d:'سوق/ميناء/ورشة متجاورة: +0.45 ذهب لكل رابط'},
 {id:'sac',n:'الحي المقدس',i:'🛕',a:['temple','obelisk','sphinx','karnak','abusimbel'],res:'cul',v:.5,d:'معابد ومسلات متجاورة: +0.5 ثقافة لكل رابط'},
 {id:'aca',n:'الأكاديمية',i:'📚',a:['library','school','greatlib'],res:'sci',v:.6,d:'دار كتابة/مدرسة متجاورتان: +0.6 علوم لكل رابط'},
 {id:'agr',n:'الحي الزراعي',i:'🌾',a:['farm','granary','fishery'],res:'food',v:.3,d:'مزارع وصوامع متجاورة: +0.3 غذاء لكل رابط'}
];
function links(){
 const out=RULES.map(r=>({r,n:0,cl:[]}));
 const W_=44;
 for(let i=0;i<S_().tiles.length;i++){
  const t=S_().tiles[i];if(!t.b)continue;const x=i%W_,y=(i/W_)|0;
  for(const [dx,dy] of [[1,0],[0,1]]){
   const nx=x+dx,ny=y+dy;if(nx>=W_||ny>=W_)continue;const u=S_().tiles[ny*W_+nx];if(!u.b)continue;
   out.forEach(o=>{if(o.r.a.includes(t.b)&&o.r.a.includes(u.b)&&(t.b!==u.b||o.r.id==='agr'||o.r.id==='com')){o.n++;o.cl.push([x,y,nx,ny])}});
  }
 }
 return out;
}
function S_(){return window.__civ.S}
function bonus(){
 const L=links(),pop=S_().pop||0;const b={food:0,gold:0,sci:0,cul:0};
 const cap={food:3+pop*.04,gold:2+pop*.05,sci:2+pop*.03,cul:2+pop*.03};
 L.forEach(o=>{b[o.r.res]+=o.n*o.r.v});
 for(const k in b)b[k]=Math.min(b[k],cap[k]);
 return {b,L,cap};
}
const _rates=rates;
rates=function(){const r=_rates();try{const {b}=bonus();r.food+=b.food;r.gold+=b.gold;r.sci+=b.sci;r.cul+=b.cul}catch(e){}return r};
function showDist(){
 const {b,L,cap}=bonus();
 showModal('<h2>🏘️ الأحياء وتجاور المباني</h2><div class="small">ضع المباني المتشابهة جنباً إلى جنب لتكوين أحياء تعطي دخلاً إضافياً (له سقف يزيد مع عدد السكان).</div>'+
  L.map(o=>'<div class="card"><b>'+o.r.i+' '+o.r.n+'</b> <span class="small">روابط: '+o.n+' | +'+Math.min(o.n*o.r.v,cap[o.r.res]).toFixed(1)+' '+({food:'غذاء',gold:'ذهب',sci:'علوم',cul:'ثقافة'})[o.r.res]+'</span><div class="small">'+o.r.d+'</div></div>').join('')+
  '<button onclick="closeModal()">إغلاق</button>');
}
window.__dist={links,bonus,showDist,RULES};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-m="dist"]');if(b){e.stopPropagation();showDist()}},true);
})();
// Round 61: wonders gallery with glory bonus
(function(){
function wonders(){return Object.keys(BUILD).filter(k=>BUILD[k].unique)}
function built(k){const S=__civ.S;return k==='pyramid'?(S.pyr||0)>=12||S.tiles.some(t=>t.b==='pyramid'):S.tiles.some(t=>t.b===k)}
function glory(){const w=wonders();const n=w.filter(built).length;return {n,total:w.length,cul:n*.8+(n===w.length?4:0),gold:n*.3,all:n===w.length}}
const _r=rates;
rates=function(){const r=_r();try{const g=glory();r.cul+=g.cul;r.gold+=g.gold}catch(e){}return r};
function showWonders(){
 const g=glory();
 showModal('<h2>🏛️ معرض العجائب</h2><div class="small">كل عجيبة تبنيها تعطي مجداً: +0.8 ثقافة و+0.3 ذهب. وعند اكتمال كل العجائب: +4 ثقافة إضافية.</div><div class="card"><b>المجد: '+g.n+'/'+g.total+'</b> <span class="small">+'+g.cul.toFixed(1)+' ثقافة، +'+g.gold.toFixed(1)+' ذهب'+(g.all?' 👑 عجائب مكتملة':'')+'</span><div style="background:#3a2a1a;border-radius:6px;height:10px"><div style="background:#e8c13d;height:10px;border-radius:6px;width:'+Math.round(g.n/g.total*100)+'%"></div></div></div>'+
  wonders().map(k=>{const d=BUILD[k],b=built(k);return '<div class="card" style="'+(b?'border-color:#e8c13d':'opacity:.8')+'"><b>'+d.i+' '+d.n+'</b> '+(b?'✅ مبنية':'⬜')+'<div class="small">'+d.d+'</div>'+(b?'':'<div class="small">التكلفة: '+costStr(d.cost)+(d.need.length?' | تحتاج: '+d.need.map(x=>TECH[x].n).join(' + '):'')+'</div>')+'</div>'}).join('')+
  '<button onclick="closeModal()">إغلاق</button>');
}
window.__won={glory,showWonders,wonders,built};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-m="won"]');if(b){e.stopPropagation();showWonders()}},true);
})();
// Round 62: city panorama (skyline that grows with the city)
(function(){
function cnt(){const S=__civ.S,c={};for(const t of S.tiles)if(t.b)c[t.b]=(c[t.b]||0)+1;return c}
function era(){const S=__civ.S,n=Object.keys(S.techs).length;return n>=30?{n:'عصر الإمبراطورية',sky:['#1b2a5e','#f2a65a']}:n>=18?{n:'عصر المملكة الحديثة',sky:['#2a4d8f','#f6c36b']}:n>=8?{n:'عصر المملكة القديمة',sky:['#3c7bc4','#fbe3a0']}:{n:'عصر القرى',sky:['#5aa0d8','#fdf0c8']}}
function panorama(){
 const c=cnt(),S=__civ.S,e=era(),W=320,H=150;let s='';
 s+='<defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+e.sky[0]+'"/><stop offset="1" stop-color="'+e.sky[1]+'"/></linearGradient></defs><rect width="'+W+'" height="'+H+'" fill="url(#pg)"/><circle cx="262" cy="34" r="16" fill="#fff6c8" opacity=".9"/>';
 s+='<rect y="118" width="'+W+'" height="32" fill="#d9b66a"/><rect y="126" width="'+W+'" height="9" fill="#2e7cc4"/>';
 let x=8;const add=(w,fn)=>{if(x+w<W-4){s+=fn(x);x+=w+3}};
 const houses=Math.min(c.house||0,14);
 if(c.pyramid||(S.pyr||0)>0){s+='<polygon points="40,118 110,38 180,118" fill="#e2c27a" stroke="#a98a43"/><polygon points="110,38 180,118 130,118" fill="#c9a24f"/>'}
 if(c.sphinx)s+='<rect x="200" y="100" width="34" height="18" rx="6" fill="#cfae65"/><circle cx="240" cy="98" r="8" fill="#cfae65"/>';
 if(c.obelisk)s+='<polygon points="256,118 260,70 264,118" fill="#b3532d"/>';
 if(c.lighthouse)s+='<rect x="288" y="62" width="10" height="56" fill="#eee"/><rect x="286" y="54" width="14" height="10" fill="#f2c94c"/>';
 if(c.karnak||c.temple){s+='<rect x="20" y="86" width="46" height="32" fill="#cdb27c"/>'+[0,1,2,3].map(i=>'<rect x="'+(24+i*11)+'" y="86" width="5" height="32" fill="#e6d3a2"/>').join('')}
 for(let i=0;i<houses;i++){const hx=6+i*22,hh=14+(i*7)%10;s+='<rect x="'+hx+'" y="'+(118-hh)+'" width="17" height="'+hh+'" fill="#e7cf9a" stroke="#b79a5e" stroke-width=".6"/>'}
 for(let i=0;i<Math.min(c.farm||0,10);i++)s+='<rect x="'+(8+i*30)+'" y="119" width="24" height="5" fill="#6fae3d"/>';
 for(let i=0;i<Math.min(c.lumber||0,8);i++)s+='<rect x="'+(300-i*8)+'" y="106" width="2" height="12" fill="#6b4a2a"/><circle cx="'+(301-i*8)+'" cy="104" r="5" fill="#2f8f3a"/>';
 for(let i=0;i<Math.min((c.port||0)+(c.fishery||0),5);i++)s+='<polygon points="'+(30+i*55)+',146 '+(46+i*55)+',146 '+(40+i*55)+',130 '+(36+i*55)+',130" fill="#fff" stroke="#5a3d1a"/>';
 return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="border-radius:10px;border:2px solid #c9a24b">'+s+'</svg>';
}
function showPano(){
 const S=__civ.S,e=era(),c=cnt(),tot=Object.values(c).reduce((a,b)=>a+b,0);
 showModal('<h2>🌅 بانوراما المدينة</h2>'+panorama()+'<div class="card"><b>'+e.n+'</b><div class="small">اليوم '+S.day+' | السكان '+Math.floor(S.pop)+' | المباني '+tot+' | العلوم '+Object.keys(S.techs).length+'</div></div><button onclick="closeModal()">إغلاق</button>');
}
window.__pano={showPano,panorama,era,cnt};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-m="pano"]');if(b){e.stopPropagation();showPano()}},true);
})();
