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
function upLv(t){const S=S_();return (S.tbUp&&S.tbUp[t])||0}
function mk(t,x,y,side,bonus){const u=UT[t];return {t,x,y,side,hp:u.hp+(side==='e'?bonus:upLv(t)*2),done:false}}
function buyUp(t){const S=S_();S.tbUp=S.tbUp||{};const lv=upLv(t);if(lv>=3){toast('⚠️ أعلى مستوى');return}const c=60*(lv+1);if(S.res.gold<c){toast('⚠️ الذهب لا يكفي: '+c);return}S.res.gold-=c;S.tbUp[t]=lv+1;try{addLog('🔧 تطوير '+UT[t].n+' إلى المستوى '+(lv+1))}catch(e){}TB=null;render()}
function start(form){
 const S=S_();if(!ready()){toast('⚠️ لا معركة قبل مرور 25 يوماً');return false}
 const bonus=Math.min(2,Math.floor(S.day/250))+Math.min(1,S.tbStreak||0)+Math.floor(Math.min(4,S.tcLv||0)/2);
 const ek=['sp','ar','ch'];const n=S.day>300?4:3;
 let sd=(S.seed||5)*7+S.day*13;const rn=()=>{sd=(sd*9301+49297)%233280;return sd/233280};const rock={};for(let k=0;k<4;k++){rock[(1+Math.floor(rn()*5))+','+Math.floor(rn()*ROWS)]=1}
 TB={rock,us:[],en:[],sel:null,msg:'اختر وحدة',turn:1,over:null,bonus};
 const rows=n===4?[0,1,3,4]:[1,2,3];
 (form||['sp','ar','ch','sp']).slice(0,n).forEach((t,i)=>TB.us.push(mk(t,0,rows[i],'p',0)));
 for(let i=0;i<n;i++)TB.en.push(mk(ek[i%3],6,rows[i],'e',bonus));
 S.tbAt=S.day;render();return true}
function at(x,y){return TB.us.concat(TB.en).find(u=>u.hp>0&&u.x===x&&u.y===y)}
function moves(u){const r=[];for(let x=0;x<COLS;x++)for(let y=0;y<ROWS;y++){if(!at(x,y)&&!TB.rock[x+','+y]&&Math.abs(x-u.x)+Math.abs(y-u.y)<=UT[u.t].mov)r.push([x,y])}return r}
function dmg(a,d){let v=UT[a.t].atk;if(a.t==='ch'&&d.t==='ar')v+=2;if(a.t==='sp'&&d.t==='ch')v+=2;if(a.t==='ar'&&d.t==='sp')v+=1;return v}
function hit(a,d){const v=dmg(a,d);d.hp-=v;a.done=true;return v}
function check(){if(!TB.en.some(u=>u.hp>0)){TB.over='win'}else if(!TB.us.some(u=>u.hp>0)){TB.over='lose'}
 if(TB.over){const S=S_();if(TB.over==='win'){const st=S.tbStreak||0;const g=30+TB.us.filter(u=>u.hp>0).length*8+Math.min(20,st*5);S.tbStreak=st+1;S.res.gold+=g;S.culture=(S.culture||0);try{S.res.culture=(S.res.culture||0)+0}catch(e){}S.tbWins=(S.tbWins||0)+1;S.tcLv=(S.tcLv||0)+1;if(S.tcLv>=5){S.tcLv=0;S.tcDone=(S.tcDone||0)+1;S.res.gold+=150;try{addLog('🏆 أكملت الحملة التكتيكية: +150 ذهب')}catch(e){}}try{addLog('⚔️ انتصار تكتيكي: +'+g+' ذهب')}catch(e){};TB.msg='🏆 انتصرت! +'+g+' ذهب'}else{S.tbStreak=0;S.tcLv=Math.max(0,(S.tcLv||0)-1);S.res.gold=Math.max(0,S.res.gold-25);try{addLog('⚔️ خسارة معركة تكتيكية')}catch(e){};TB.msg='💀 هُزمت (-25 ذهب)'}}}
function click(x,y){
 if(!TB||TB.over)return;const u=at(x,y);
 if(u&&u.side==='p'&&!u.done){TB.sel=u;TB.msg='اختر مكاناً أو عدواً';render();return}
 const s=TB.sel;if(!s||s.hp<=0){return}
 if(u&&u.side==='e'){if(dist(s,u)<=UT[s.t].rng){const v=hit(s,u);TB.msg=UT[s.t].i+' ضرب '+v;TB.sel=null;check();render()}else{TB.msg='بعيد عن المدى';render()}return}
 if(!u&&!TB.rock[x+','+y]&&!s.moved&&Math.abs(x-s.x)+Math.abs(y-s.y)<=UT[s.t].mov){s.x=x;s.y=y;s.moved=true;TB.msg='تحرك. اضرب أو أنهِ الدور';render();return}
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
 const S=S_();if(!TB){showModal('<h2>⚔️ معركة تكتيكية</h2><div class="small">3 وحدات ضد جيش العدو على رقعة 7×5. حرّك ثم اضرب. الرامي يضرب من بعيد، العربة تتفوق على الرماة، والرمح يتفوق على العربات. النصر يمنحك ذهباً.</div><div class="card"><b>🗺️ الحملة: المعركة '+(((S.tcLv||0)+1))+' من 5</b><div class="small">كل فوز يقوّي العدو التالي. أكمل 5 انتصارات للحصول على 150 ذهب. الخسارة ترجعك مرحلة.</div></div><div class="card"><b>🔧 تطوير الوحدات (+2 صحة لكل مستوى)</b>'+['sp','ar','ch'].map(t=>'<button onclick="__tb.buyUp(\''+t+'\')">'+UT[t].i+' '+UT[t].n+' م'+upLv(t)+'/3 - '+(upLv(t)>=3?'أقصى':60*(upLv(t)+1)+' ذهب')+'</button>').join('')+'</div><button onclick="__tb.start()">'+(ready()?'ابدأ المعركة':'⏳ غير متاح الآن')+'</button><button onclick="closeModal()">إغلاق</button>');return}
 let g='<div style="direction:ltr;display:grid;grid-template-columns:repeat('+COLS+',minmax(0,1fr));width:100%;box-sizing:border-box;gap:3px">';
 for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){const u=at(x,y);const s=TB.sel;let bg=TB.rock[x+','+y]?'#2a2a2a':'#5a4a2a';
  if(s&&!u&&!s.moved&&Math.abs(x-s.x)+Math.abs(y-s.y)<=UT[s.t].mov)bg='#7a6a3a';
  if(s&&u&&u.side==='e'&&dist(s,u)<=UT[s.t].rng)bg='#a33';
  if(u&&u===s)bg='#2d7';
  g+='<div onclick="__tb.click('+x+','+y+')" style="aspect-ratio:1;min-width:0;overflow:hidden;background:'+bg+';border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:20px;border:2px solid '+(u?(u.side==='p'?'#4ac':'#c44'):'#3a2a1a')+'">'+(TB.rock[x+','+y]?'🪨':'')+(u?UT[u.t].i+'<span style="font-size:11px">'+u.hp+(u.done&&u.side==='p'?'✔':'')+'</span>':'')+'</div>'}
 g+='</div>';
 showModal('<h2>⚔️ معركة تكتيكية</h2>'+g+'<div class="small" style="margin:6px 0">'+TB.msg+' | سلسلة الانتصارات: '+(S_().tbStreak||0)+'</div>'+(TB.over?'<button onclick="__tb.close()">إنهاء</button>':'<button onclick="__tb.end()">إنهاء الدور</button><button onclick="__tb.close()">انسحاب</button>'));
}
function close(){TB=null;closeModal()}
window.__tb={buyUp,upLv,start,click,end:endTurn,close,render,get TB(){return TB},UT,ready,moves,show(){TB=null;render()}};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-m="tact"]');if(b){e.stopPropagation();window.__tb.show()}},true);
})();
// Round 66: desert raids on trade caravans
(function(){
const S_=()=>__civ.S;
let lastD=-1,pend=null;
function routes(){const S=S_();return Object.keys(S.caravans||{}).filter(k=>S.caravans[k]>0)}
function nm(k){try{return NEIGH_DEF.find(d=>d.id===k).n}catch(e){return k}}
function raidCheck(force){
 const S=S_();if(S.day===lastD&&!force)return;lastD=S.day;
 if(pend||(S.spShield&&S.spShield>S.day&&!force))return;const rs=routes().filter(k=>!(S.guard&&S.guard[k]>S.day));if(!rs.length||S.day<25)return;
 let seed=(S.seed||5)*977+S.day*31;seed=(seed*9301+49297)%233280;const r=seed/233280;
 if(!force&&(r>.035||(S.raidAt!==undefined&&S.day-S.raidAt<15)))return;
 const k=rs[Math.floor(r*1000)%rs.length];pend=k;S.raidAt=S.day;
 try{addLog('🏴‍☠️ قطاع طرق يهددون قافلة '+nm(k))}catch(e){}
 const md=document.querySelector('#modal');if(md&&md.style.display==='flex'){return}
 showRaid()}
function showRaid(){
 if(!pend)return;const k=pend;
 showModal('<h2>🏴‍☠️ غارة على القافلة</h2><div class="small">قطاع طرق في الصحراء يتربصون بقافلة '+nm(k)+'.</div><button onclick="__raid.pay()">🛡️ استأجر حرساً (30 ذهب) - آمنة 40 يوماً</button><button onclick="__raid.fight()">⚔️ دافع بالجنود (يحتاج 3 جنود)</button><button onclick="__raid.ignore()">تجاهل (قد تخسر الطريق)</button>')}
function done(m){pend=null;try{addLog(m);toast(m)}catch(e){}closeModal()}
function pay(){const S=S_();if(!pend)return;if(S.res.gold<30){toast('⚠️ الذهب لا يكفي');return}S.res.gold-=30;S.guard=S.guard||{};S.guard[pend]=S.day+40;done('🛡️ الحرس حمى القافلة')}
function soldiers(){const S=S_();let n=0;for(const k in (S.army||{}))n+=(S.army[k]||0);return n}
function fight(){const S=S_();if(!pend)return;if(soldiers()<3){toast('⚠️ تحتاج 3 جنود على الأقل');return}
 const lose=Math.max(1,Math.floor(soldiers()*.1));let l=lose;for(const k in S.army){const t=Math.min(S.army[k]||0,l);S.army[k]-=t;l-=t;if(l<=0)break}
 S.res.gold+=20;S.guard=S.guard||{};S.guard[pend]=S.day+25;done('⚔️ هزمت القطاع، +20 ذهب، خسرت '+lose+' جندي')}
function ignore(){const S=S_();if(!pend)return;const k=pend;
 if(((S.seed||5)+S.day)%2===0){S.caravans[k]=0;done('💨 نُهبت القافلة وضاع الطريق')}else{S.res.gold=Math.max(0,S.res.gold-15);done('😮‍💨 نجت القافلة بخسارة 15 ذهب')}}
const _tk=tick;tick=function(){const r=_tk.apply(this,arguments);try{raidCheck()}catch(e){}return r};
window.__raid={raidCheck,pay,fight,ignore,showRaid,get pend(){return pend},clear(){pend=null}};
})();
// Round 67: achievements for the new systems
(function(){
const add=[
 {id:'n60',t:'🏘️ مخطط الأحياء',d:'10 روابط تجاور',c:()=>{try{return __dist.links().reduce((a,o)=>a+o.n,0)>=10}catch(e){return false}},r:15},
 {id:'n61',t:'🏛️ سيد العجائب',d:'ابنِ كل العجائب',c:()=>{try{return __won.glory().all}catch(e){return false}},r:40},
 {id:'n64',t:'⚔️ قائد ميدان',d:'3 انتصارات تكتيكية',c:()=>(__civ.S.tbWins||0)>=3,r:20},
 {id:'n64b',t:'🔥 سلسلة نصر',d:'3 انتصارات متتالية',c:()=>(__civ.S.tbStreak||0)>=3,r:25},
 {id:'n66',t:'🛡️ حارس القوافل',d:'أمّن قافلة من الغارات',c:()=>{const g=__civ.S.guard||{};return Object.keys(g).length>0},r:15},
 {id:'n68',t:'🗺️ فاتح الحملة',d:'أكمل الحملة التكتيكية',c:()=>(__civ.S.tcDone||0)>=1,r:35},
 {id:'n59',t:'📜 الحاكم الحكيم',d:'أصدر مرسوماً ملكياً',c:()=>(__civ.S.decN||0)>=1,r:10}
];
add.forEach(a=>{if(!ACH.find(x=>x.id===a.id))ACH.push(a)});
window.__ach67={add};
})();
// Round 69: chronicle (timeline of events + counters)
(function(){
const S_=()=>__civ.S;
function sev(m){return /غارة|نُهبت|هُزمت|خسارة|وباء|ثورة|خماسين/.test(m)?'#c44':/انتصار|إنجاز|أكملت|هزمت القطاع|حرس/.test(m)?'#e8c13d':'#6a8'}
function show(){
 const S=S_(),L=(S.log||[]).slice(0,40);
 const stats=[['⚔️ انتصارات تكتيكية',S.tbWins||0],['🗺️ حملات مكتملة',S.tcDone||0],['📜 مراسيم',S.decN||0],['🏅 إنجازات',Object.keys(S.ach||{}).length],['📅 الأيام',S.day]];
 const rows=L.length?L.map(m=>'<div style="border-right:4px solid '+sev(m)+';padding:4px 8px;margin:3px 0;background:#2a1f12;border-radius:6px;text-align:right">'+m+'</div>').join(''):'<div class="small">لا أحداث بعد.</div>';
 showModal('<h2>📖 سجل الأحداث</h2><div style="display:flex;flex-wrap:wrap;gap:4px">'+stats.map(s=>'<div class="card" style="flex:1 1 30%;min-width:90px;text-align:center"><div class="small">'+s[0]+'</div><b>'+s[1]+'</b></div>').join('')+'</div><div style="max-height:45vh;overflow:auto;margin-top:6px">'+rows+'</div><div class="small">الأحمر: خطر | الذهبي: إنجاز | الأخضر: عادي</div><button onclick="closeModal()">إغلاق</button>');
}
window.__chron={show,sev};
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-m="chron"]');if(b){e.stopPropagation();show()}},true);
})();
;(function(){/* R71 era tint */
const E=[[0,'🛖 عصر القرية','rgba(120,90,40,0)'],[4,'🌾 عصر الزراعة','rgba(90,140,60,.07)'],[9,'🏛️ العصر الفرعوني','rgba(220,170,40,.08)'],[15,'⚔️ عصر الإمبراطورية','rgba(180,50,40,.08)'],[22,'👑 العصر الذهبي','rgba(255,215,90,.12)']];
let d=document.getElementById('eraTint');
if(!d){d=document.createElement('div');d.id='eraTint';d.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:1;transition:background 2s';document.body.appendChild(d);}
function era(){const S=window.__civ&&__civ.S;const n=S&&S.techs?Object.keys(S.techs).length:0;let e=E[0];for(const x of E)if(n>=x[0])e=x;return e}
function upd(){try{const e=era();d.style.background='radial-gradient(ellipse at center,transparent 40%,'+e[2]+' 100%)';d.title=e[1];window.__era=e[1]}catch(x){}}
upd();setInterval(upd,3000);window.__eraTint={era,upd};
})();
;(function(){/* R72 era change announcement */
let last=null;
setInterval(()=>{try{const e=__eraTint.era()[1];if(last&&e!==last){const t=document.getElementById('toast');if(t){t.textContent='🌅 دخلت '+e;t.style.opacity=1;t.style.display='block';setTimeout(()=>{t.style.opacity=''},3500)}
const S=__civ.S;if(S.log)S.log.unshift('🌅 بداية '+e)}last=e}catch(x){}},3000);
})();
;(function(){/* R73 Nile flood minigame */
const S_=()=>__civ.S,R=()=>S_().res;
const OPT={dam:{n:'🧱 بناء سد',k:'stone',c:25,ok:.8,w:'🧱'},canal:{n:'🪵 حفر قنوات',k:'wood',c:25,ok:.65,w:'🪵'},pray:{n:'🙏 صلاة للنيل',k:'culture',c:12,ok:.45,w:'🙏'}};
function cd(){const S=S_();return Math.max(0,(S.flCd||0)-S.day)}
function act(id,rnd){const S=S_(),o=OPT[id];if(!o||cd()>0)return null;if((R()[o.k]||0)<o.c)return{err:1};
 R()[o.k]-=o.c;S.flCd=S.day+20;const win=(rnd===undefined?Math.random():rnd)<o.ok;
 const lvl=Math.min(10,Math.floor((S.pop||S.people||10)/50)+1);const food=Math.round(60+lvl*25);
 if(win){R().food+=food;R().culture+=5;S.flW=(S.flW||0)+1;S.log&&S.log.unshift('يوم '+S.day+': 🌊 فيضان مبارك! +'+food+' طعام')}
 else{R().food=Math.max(0,R().food-Math.round(food/2));S.flL=(S.flL||0)+1;S.log&&S.log.unshift('يوم '+S.day+': 🌊 فيضان مدمّر، خسرت '+Math.round(food/2)+' طعام')}
 return{win,food}}
function show(msg){const S=S_(),c=cd();
 const bs=Object.keys(OPT).map(id=>{const o=OPT[id];return '<button data-fl="'+id+'"'+(c>0?' disabled':'')+'>'+o.n+' ('+o.c+' '+o.k+') نجاح '+Math.round(o.ok*100)+'%</button>'}).join('');
 showModal('<h2>🌊 فيضان النيل</h2><div class="small">اختر طريقة استقبال الفيضان. النجاح يعطي طعاماً وثقافة، والفشل يضيع جزءاً من الطعام.'+(c>0?'<br>التالي بعد '+c+' يوم':'')+'</div>'+(msg?'<div class="card">'+msg+'</div>':'')+'<div>'+bs+'</div><div class="small">نجح '+(S.flW||0)+' | فشل '+(S.flL||0)+'</div><button onclick="closeModal()">إغلاق</button>')}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-m="flood"]');if(t){e.stopPropagation();show();return}
 const b=e.target.closest&&e.target.closest('[data-fl]');if(b){e.stopPropagation();const r=act(b.dataset.fl);show(!r?'':r.err?'⚠️ موارد غير كافية':r.win?'✅ فيضان مبارك!':'❌ الفيضان دمّر جزءاً من المحصول')}},true);
window.__flood={act,show,cd};
})();
;(function(){/* R74 spies */
const S_=()=>__civ.S,R=()=>S_().res;
const M={steal:{n:'💰 سرقة خزينة',c:40,ok:.5,g:()=>120+S_().day%50},sci:{n:'📚 سرقة أسرار علمية',c:60,ok:.45,g:()=>25},sab:{n:'🔥 تخريب العدو',c:50,ok:.55,g:()=>0}};
function cd(){const S=S_();return Math.max(0,(S.spCd||0)-S.day)}
function go(id,rnd){const S=S_(),m=M[id];if(!m||cd()>0)return null;if(R().gold<m.c)return{err:1};R().gold-=m.c;S.spCd=S.day+10;
 const win=(rnd===undefined?Math.random():rnd)<m.ok;const g=m.g();
 if(win){S.spW=(S.spW||0)+1;if(id==='steal')R().gold+=g;else if(id==='sci')R().science=(R().science||0)+g;else S.spShield=S.day+15;S.log&&S.log.unshift('يوم '+S.day+': 🕵️ نجحت مهمة '+m.n)}
 else{S.spL=(S.spL||0)+1;R().culture=Math.max(0,R().culture-5);S.log&&S.log.unshift('يوم '+S.day+': 🕵️ قُبض على الجاسوس')}
 return{win,g}}
function show(msg){const S=S_(),c=cd();
 const bs=Object.keys(M).map(id=>'<button data-sp="'+id+'"'+(c>0?' disabled':'')+'>'+M[id].n+' ('+M[id].c+' ذهب) '+Math.round(M[id].ok*100)+'%</button>').join('');
 showModal('<h2>🕵️ الجواسيس</h2><div class="small">أرسل جاسوساً: سرقة ذهب أو علم، أو تخريب يحمي من الغارات 15 يوماً. الفشل يكلف ثقافة.'+(c>0?'<br>التالي بعد '+c+' يوم':'')+'</div>'+(msg?'<div class="card">'+msg+'</div>':'')+bs+'<div class="small">نجاح '+(S.spW||0)+' | فشل '+(S.spL||0)+'</div><button onclick="closeModal()">إغلاق</button>')}
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-m="spy"]');if(t){e.stopPropagation();show();return}
 const b=e.target.closest&&e.target.closest('[data-sp]');if(b){e.stopPropagation();const r=go(b.dataset.sp);show(!r?'':r.err?'⚠️ ذهب غير كاف':r.win?'✅ نجحت المهمة':'❌ قُبض على الجاسوس')}},true);
window.__spy={go,show,cd};
})();
