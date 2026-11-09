/* Smooth category-to-catalog scroll flight. */
(()=>{'use strict';
 const grid=document.getElementById('productGrid');
 const categories=document.getElementById('categories');
 const products=document.getElementById('products');
 if(!grid||!categories||!products||!document.body)return;
 const records=new Map();
 let frame=0;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const ease=v=>v*v*v*(v*(v*6-15)+10);
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
    rec.img.style.opacity=rec.originalOpacity;
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
   records.set(card,{img,overlay,index,side:sideFor(card,index),
    originalOpacity:img.style.opacity,originalVisibility:img.style.visibility});
  });
 }
 function update(){
  frame=0;
  sync();
  const detailModal=document.getElementById('productModal');
  if(document.body.classList.contains('modal-open')||(detailModal&&detailModal.classList.contains('show'))){
   for(const rec of records.values()){
    rec.img.style.opacity=rec.originalOpacity;
    rec.img.style.visibility=rec.originalVisibility;
    rec.overlay.style.opacity='0';
    rec.overlay.style.visibility='hidden';
   }
   return;
  }
  const scroll=window.scrollY||window.pageYOffset||0;
  const vh=window.innerHeight||document.documentElement.clientHeight;
  const vw=window.innerWidth||document.documentElement.clientWidth;
  const categoryTop=categories.getBoundingClientRect().top+scroll;
  const cards=[...grid.querySelectorAll('.product-card')];
  if(!cards.length)return;
  const firstRowTop=Math.min(...cards.map(card=>card.getBoundingClientRect().top+scroll));
  let startScroll=categoryTop-vh*.72;
  let endScroll=firstRowTop-vh*.72;
  if(endScroll-startScroll<vh*.32)endScroll=startScroll+vh*.32;
  const range=endScroll-startScroll;
  const jobs=[];
  for(const [card,rec] of records){
   if(!card.isConnected||!rec.img.isConnected)continue;
   const target=rec.img.getBoundingClientRect();
   if(!target.width||!target.height)continue;
   const delay=rec.index*range*.009;
   const p=clamp((scroll-startScroll-delay)/(range-delay),0,1);
   const t=ease(p);
   const w=target.width,h=target.height;
   const fromRight=rec.side==='right';
   const startX=fromRight?vw+w*.58:-w*.58;
   const endX=target.left+w/2;
   const startY=categoryTop+vh*.18-scroll;
   const endY=target.top+h/2;
   const x=startX+(endX-startX)*t;
   const y=startY+(endY-startY)*t-Math.sin(p*Math.PI)*vh*.045;
   const scale=1.12-.12*t;
   const rotate=(fromRight?1:-1)*(8*(1-t)+Math.sin(p*Math.PI*2)*.8);
   const fadeIn=clamp(p/.15,0,1);
   const fadeOut=clamp((1-p)/.055,0,1);
   const alpha=Math.min(fadeIn,fadeOut);
   const active=p>0&&p<1;
   jobs.push({rec,w,h,x,y,scale,rotate,alpha,active});
  }
  for(const job of jobs){
   const {rec,w,h,x,y,scale,rotate,alpha,active}=job;
   rec.img.style.opacity=active?String(1-alpha):rec.originalOpacity;
   rec.img.style.visibility=rec.originalVisibility;
   rec.overlay.style.width=w+'px';
   rec.overlay.style.height=h+'px';
   rec.overlay.style.left=x+'px';
   rec.overlay.style.top=y+'px';
   rec.overlay.style.transform='translate3d(-50%,-50%,0) scale('+scale+') rotate('+rotate+'deg)';
   rec.overlay.style.opacity=active?String(alpha):'0';
   rec.overlay.style.visibility=active&&alpha>.002?'visible':'hidden';
  }
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 try{
  sync();
  schedule();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  new MutationObserver(schedule).observe(grid,{childList:true,subtree:true});
  const detailModal=document.getElementById('productModal');
  if(detailModal)new MutationObserver(schedule).observe(detailModal,{attributes:true,attributeFilter:['class','aria-hidden']});
  new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
  window.addEventListener('load',schedule,{once:true});
 }catch(error){
  for(const rec of records.values()){
   rec.img.style.opacity=rec.originalOpacity;
   rec.img.style.visibility=rec.originalVisibility;
   rec.overlay.remove();
  }
  records.clear();
 }
})();