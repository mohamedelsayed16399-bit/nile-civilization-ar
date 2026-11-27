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
