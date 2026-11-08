/* Independent floating product cutouts: scroll drives each object from category area into its own catalog image slot. */
(()=>{'use strict';
 const grid=document.getElementById('productGrid');
 const categories=document.getElementById('categories');
 if(!grid||!categories||!document.body)return;
 const records=new Map();
 let frame=0;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const ease=v=>v*v*(3-2*v);
 function sideFor(card,index){
  const name=(card.querySelector('.product-info h3')?.textContent||'').trim();
  if(/جار/.test(name))return 'left';
  if(/بطری/.test(name))return 'right';
  return index%2?'left':'right';
 }
 function sync(){
  const cards=[...grid.querySelectorAll('.product-card')];
  const alive=new Set(cards);
  for(const [card,rec] of records){
   if(!alive.has(card)){
    rec.img.style.visibility=rec.originalVisibility;
    rec.overlay.remove();
    records.delete(card);
   }
  }
  cards.forEach((card,index)=>{
   if(records.has(card))return;
   const img=card.querySelector('img.product-photo');
   if(!img||!img.getAttribute('src'))return;
   const overlay=document.createElement('img');
   overlay.className='amir-product-flight-object';
   overlay.alt='';
   overlay.setAttribute('aria-hidden','true');
   overlay.draggable=false;
   overlay.decoding='async';
   overlay.loading='eager';
   overlay.src=img.currentSrc||img.src;
   document.body.appendChild(overlay);
   records.set(card,{img,overlay,index,side:sideFor(card,index),originalVisibility:img.style.visibility});
  });
 }
 function update(){
  frame=0;
  sync();
  const scroll=window.scrollY||window.pageYOffset||0;
  const vh=window.innerHeight||document.documentElement.clientHeight;
  const vw=window.innerWidth||document.documentElement.clientWidth;
  const categoryTop=categories.getBoundingClientRect().top+scroll;
  for(const [card,rec] of records){
   if(!card.isConnected||!rec.img.isConnected)continue;
   const target=rec.img.getBoundingClientRect();
   if(!target.width||!target.height)continue;
   const cardTop=card.getBoundingClientRect().top+scroll;
   const stagger=rec.index*vh*.11;
   let start=categoryTop-vh*.28+stagger;
   let end=cardTop-vh*.48+stagger;
   if(end-start<vh*.48)start=end-vh*.72;
   const raw=(scroll-start)/(end-start);
   const p=clamp(raw,0,1);
   const t=ease(p);
   const w=target.width;
   const h=target.height;
   const fromRight=rec.side==='right';
   const startX=fromRight?vw+w*.72:-w*.72;
   const endX=target.left+w/2;
   const startY=vh*(.19+(rec.index%3)*.075);
   const endY=target.top+h/2;
   const x=startX+(endX-startX)*t;
   const y=startY+(endY-startY)*t-Math.sin(p*Math.PI)*vh*.10;
   const scale=1.28-.28*t;
   const rotate=(fromRight?1:-1)*(16*(1-t)+Math.sin(p*Math.PI*2)*2.2);
   const active=raw>0&&raw<1;
   rec.img.style.visibility=active?'hidden':rec.originalVisibility;
   rec.overlay.style.width=w+'px';
   rec.overlay.style.height=h+'px';
   rec.overlay.style.left=x+'px';
   rec.overlay.style.top=y+'px';
   rec.overlay.style.transform='translate3d(-50%,-50%,0) scale('+scale+') rotate('+rotate+'deg)';
   rec.overlay.style.opacity=active?String(clamp(Math.min(p/.08,(1-p)/.045),0,1)):'0';
   rec.overlay.style.visibility=active?'visible':'hidden';
  }
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 try{
  sync();
  schedule();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  new MutationObserver(schedule).observe(grid,{childList:true,subtree:true});
  window.addEventListener('load',schedule,{once:true});
 }catch(error){
  for(const rec of records.values()){rec.img.style.visibility=rec.originalVisibility;rec.overlay.remove()}
  records.clear();
 }
})();