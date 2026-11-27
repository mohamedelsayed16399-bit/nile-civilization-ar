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
// Round 63: weather system with visible overlay
(function(){
const WX=[
 {id:'clear',n:'صافٍ',i:'☀️',w:5,f:1,g:1,tint:'rgba(0,0,0,0)'},
 {id:'heat',n:'موجة حر',i:'🔥',w:2,f:.93,g:1,tint:'rgba(255,120,30,.16)'},
 {id:'rain',n:'مطر نادر',i:'🌧️',w:1,f:1.12,g:1,tint:'rgba(60,90,160,.2)'},
 {id:'fog',n:'ضباب النيل',i:'🌫️',w:1,f:1,g:.95,tint:'rgba(220,220,230,.22)'},
 {id:'breeze',n:'نسيم شمالي',i:'🍃',w:2,f:1.05,g:1.04,tint:'rgba(120,200,160,.08)'}
];
const S_=()=>__civ.S;
function cur(){const S=S_();return WX.find(w=>w.id===(S.wxId||'clear'))||WX[0]}
function roll(){const S=S_();let seed=(S.seed||5)*131+S.day*17;seed=(seed*9301+49297)%233280;let r=seed/233280*WX.reduce((a,w)=>a+w.w,0);for(const w of WX){r-=w.w;if(r<0)return w}return WX[0]}
let lastDay=-1,ov=null,cv=null,parts=[];
function ensureOv(){if(ov)return;ov=document.createElement('div');ov.style.cssText='position:fixed;left:0;top:0;right:0;bottom:0;pointer-events:none;z-index:5;transition:background 1.5s';cv=document.createElement('canvas');cv.style.cssText='position:absolute;left:0;top:0;width:100%;height:100%';ov.appendChild(cv);document.body.appendChild(ov);
 const loop=()=>{try{draw()}catch(e){}requestAnimationFrame(loop)};loop()}
function draw(){const w=cur();cv.width=cv.clientWidth||300;cv.height=cv.clientHeight||300;const c=cv.getContext('2d');c.clearRect(0,0,cv.width,cv.height);
 if(w.id==='rain'){c.strokeStyle='rgba(180,200,255,.6)';c.lineWidth=1;while(parts.length<90)parts.push({x:Math.random()*cv.width,y:Math.random()*cv.height});parts.forEach(p=>{c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-3,p.y+12);c.stroke();p.y+=14;p.x-=2;if(p.y>cv.height){p.y=-10;p.x=Math.random()*cv.width}})}
 else if(w.id==='breeze'){c.fillStyle='rgba(255,255,255,.45)';while(parts.length<14)parts.push({x:Math.random()*cv.width,y:Math.random()*cv.height});parts.forEach(p=>{c.fillRect(p.x,p.y,10,1.5);p.x+=3;if(p.x>cv.width){p.x=-10;p.y=Math.random()*cv.height}})}
 else parts=[];
 ov.style.background=w.tint}
function wTick(){const S=S_();if(S.day===lastDay)return;lastDay=S.day;ensureOv();
 if(!S.wxUntil||S.day>=S.wxUntil){const p=cur(),n=S.day<3?WX[0]:roll();S.wxId=n.id;S.wxUntil=S.day+6+((S.day*7)%7);if(n.id!==p.id&&n.id!=='clear'){try{toast(n.i+' '+n.n);addLog(n.i+' طقس: '+n.n)}catch(e){}}}}
const _tick=tick;tick=function(){const r=_tick.apply(this,arguments);try{wTick()}catch(e){}return r};
const _rates=rates;rates=function(){const r=_rates();try{const w=cur();if(r.food>0)r.food*=w.f;r.gold*=w.g}catch(e){}return r};
function showWx(){const S=S_(),w=cur();ensureOv();
 showModal('<h2>'+w.i+' الطقس: '+w.n+'</h2><div class="card"><div class="small">يتغير الطقس كل أسبوع تقريباً. ينتهي الحالي في اليوم '+(S.wxUntil||'?')+'.</div></div>'+WX.map(x=>'<div class="card"'+(x.id===w.id?' style="border-color:#e8c13d"':'')+'><b>'+x.i+' '+x.n+'</b><div class="small">'+(x.f!==1?'الغذاء '+(x.f>1?'+':'')+Math.round((x.f-1)*100)+'% ':'')+(x.g!==1?'الذهب '+(x.g>1?'+':'')+Math.round((x.g-1)*100)+'%':'')+(x.f===1&&x.g===1?'بلا تأثير':'')+'</div></div>').join('')+'<button onclick="closeModal()">إغلاق</button>')}
window.__wx={WX,cur,roll,wTick,showWx,force(id){S_().wxId=id;S_().wxUntil=S_().day+20}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-m="wx"]');if(b){e.stopPropagation();showWx()}},true);
})();
// Round 64: turn-based tactics battle
(function(){
const COLS=7,ROWS=5;
const UT={sp:{n:'حامل رمح',i:'🛡️',hp:10,atk:4,rng:1,mov:2},ar:{n:'رامٍ',i:'🏹',hp:6,atk:3,rng:3,mov:2},ch:{n:'عربة حربية',i:'🐎',hp:8,atk:5,rng:1,mov:4}};
let TB=null;const S_=()=>__civ.S;
const dist=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function ready(){const S=S_();return S.day-(S.tbAt===undefined?-99:S.tbAt)>=25}
function mk(t,x,y,side,bonus){const u=UT[t];return {t,x,y,side,hp:u.hp+(side==='e'?bonus:0),done:false}}
function start(form){
 const S=S_();if(!ready()){toast('⚠️ لا معركة قبل مرور 25 يوماً');return false}
 const bonus=Math.min(3,Math.floor(S.day/200));
 const ek=['sp','ar','ch'];const n=S.day>300?4:3;
 TB={us:[],en:[],sel:null,msg:'اختر وحدة',turn:1,over:null,bonus};
 const rows=n===4?[0,1,3,4]:[1,2,3];
 (form||['sp','ar','ch','sp']).slice(0,n).forEach((t,i)=>TB.us.push(mk(t,0,rows[i],'p',0)));
 for(let i=0;i<n;i++)TB.en.push(mk(ek[i%3],6,rows[i],'e',bonus));
 S.tbAt=S.day;render();return true}
function at(x,y){return TB.us.concat(TB.en).find(u=>u.hp>0&&u.x===x&&u.y===y)}
function moves(u){const r=[];for(let x=0;x<COLS;x++)for(let y=0;y<ROWS;y++){if(!at(x,y)&&Math.abs(x-u.x)+Math.abs(y-u.y)<=UT[u.t].mov)r.push([x,y])}return r}
function dmg(a,d){let v=UT[a.t].atk;if(a.t==='ch'&&d.t==='ar')v+=2;if(a.t==='sp'&&d.t==='ch')v+=2;if(a.t==='ar'&&d.t==='sp')v+=1;return v}
function hit(a,d){const v=dmg(a,d);d.hp-=v;a.done=true;return v}
function check(){if(!TB.en.some(u=>u.hp>0)){TB.over='win'}else if(!TB.us.some(u=>u.hp>0)){TB.over='lose'}
 if(TB.over){const S=S_();if(TB.over==='win'){const g=30+TB.us.filter(u=>u.hp>0).length*8;S.res.gold+=g;S.culture=(S.culture||0);try{S.res.culture=(S.res.culture||0)+0}catch(e){}S.tbWins=(S.tbWins||0)+1;try{addLog('⚔️ انتصار تكتيكي: +'+g+' ذهب')}catch(e){};TB.msg='🏆 انتصرت! +'+g+' ذهب'}else{S.res.gold=Math.max(0,S.res.gold-25);try{addLog('⚔️ خسارة معركة تكتيكية')}catch(e){};TB.msg='💀 هُزمت (-25 ذهب)'}}}
function click(x,y){
 if(!TB||TB.over)return;const u=at(x,y);
 if(u&&u.side==='p'&&!u.done){TB.sel=u;TB.msg='اختر مكاناً أو عدواً';render();return}
 const s=TB.sel;if(!s||s.hp<=0){return}
 if(u&&u.side==='e'){if(dist(s,u)<=UT[s.t].rng){const v=hit(s,u);TB.msg=UT[s.t].i+' ضرب '+v;TB.sel=null;check();render()}else{TB.msg='بعيد عن المدى';render()}return}
 if(!u&&!s.moved&&Math.abs(x-s.x)+Math.abs(y-s.y)<=UT[s.t].mov){s.x=x;s.y=y;s.moved=true;TB.msg='تحرك. اضرب أو أنهِ الدور';render();return}
}
function endTurn(){
 if(!TB||TB.over)return;
 for(const e of TB.en.filter(u=>u.hp>0)){
  const tg=TB.us.filter(u=>u.hp>0).sort((a,b)=>dist(e,a)-dist(e,b)||a.hp-b.hp)[0];if(!tg)break;
  if(dist(e,tg)>UT[e.t].rng){const m=moves(e).sort((a,b)=>(Math.abs(a[0]-tg.x)+Math.abs(a[1]-tg.y))-(Math.abs(b[0]-tg.x)+Math.abs(b[1]-tg.y)));
   const want=UT[e.t].rng;let best=m.find(p=>Math.abs(p[0]-tg.x)+Math.abs(p[1]-tg.y)<=want)||m[0];if(best){e.x=best[0];e.y=best[1]}}
  if(dist(e,tg)<=UT[e.t].rng)hit(e,tg)}
 TB.us.forEach(u=>{u.done=false;u.moved=false});TB.sel=null;TB.turn++;TB.msg='دور '+TB.turn;check();render()}
function render(){
 if(!TB){showModal('<h2>⚔️ معركة تكتيكية</h2><div class="small">3 وحدات ضد جيش العدو على رقعة 7×5. حرّك ثم اضرب. الرامي يضرب من بعيد، العربة تتفوق على الرماة، والرمح يتفوق على العربات. النصر يمنحك ذهباً.</div><button onclick="__tb.start()">'+(ready()?'ابدأ المعركة':'⏳ غير متاح الآن')+'</button><button onclick="closeModal()">إغلاق</button>');return}
 let g='<div style="direction:ltr;display:grid;grid-template-columns:repeat('+COLS+',minmax(0,1fr));width:100%;box-sizing:border-box;gap:3px">';
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const u=at(x,y);const s=TB.sel;let bg='#5a4a2a';
  if(s&&!u&&!s.moved&&Math.abs(x-s.x)+Math.abs(y-s.y)<=UT[s.t].mov)bg='#7a6a3a';
  if(s&&u&&u.side==='e'&&dist(s,u)<=UT[s.t].rng)bg='#a33';
  if(u&&u===s)bg='#2d7';
  g+='<div onclick="__tb.click('+x+','+y+')" style="aspect-ratio:1;min-width:0;overflow:hidden;background:'+bg+';border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:20px;border:2px solid '+(u?(u.side==='p'?'#4ac':'#c44'):'#3a2a1a')+'">'+(u?UT[u.t].i+'<span style="font-size:11px">'+u.hp+(u.done&&u.side==='p'?'✔':'')+'</span>':'')+'</div>'}
 g+='</div>';
 showModal('<h2>⚔️ معركة تكتيكية</h2>'+g+'<div class="small" style="margin:6px 0">'+TB.msg+'</div>'+(TB.over?'<button onclick="__tb.close()">إنهاء</button>':'<button onclick="__tb.end()">إنهاء الدور</button><button onclick="__tb.close()">انسحاب</button>'));
}
function close(){TB=null;closeModal()}
window.__tb={start,click,end:endTurn,close,render,get TB(){return TB},UT,ready,moves,show(){TB=null;render()}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-m="tact"]');if(b){e.stopPropagation();window.__tb.show()}},true);
})();
