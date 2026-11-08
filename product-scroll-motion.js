/* Scroll-linked 3D product flight: images travel from beyond the viewport into their own cards. */
(()=>{'use strict';
 const grid=document.getElementById('productGrid');
 if(!grid)return;
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce)return;
 let frame=0;
 const registered=new WeakSet();
 const getCards=()=>[...grid.querySelectorAll('.product-card')];
 function register(root){
  const list=[];
  if(root.nodeType===1&&root.matches&&root.matches('.product-card'))list.push(root);
  if(root.querySelectorAll)root.querySelectorAll('.product-card').forEach(card=>list.push(card));
  list.forEach(card=>{
   if(registered.has(card))return;
   registered.add(card);
   const visual=card.querySelector('.product-visual');
   if(visual)visual.classList.add('product-flight-ready');
  });
 }
 function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
 function update(){
  frame=0;
  const width=window.innerWidth||document.documentElement.clientWidth;
  const height=window.innerHeight||document.documentElement.clientHeight;
  const scroll=window.scrollY||window.pageYOffset||0;
  const list=getCards();
  list.forEach((card,index)=>{
   const visual=card.querySelector('.product-visual');
   if(!visual)return;
   const cardRect=card.getBoundingClientRect();
   const visualRect=visual.getBoundingClientRect();
   const cardTop=cardRect.top+scroll;
   const center=cardRect.left+cardRect.width/2;
   const fromRight=Math.abs(center-width/2)<cardRect.width*.16 ? index%2===1 : center>width/2;
   const endScroll=cardTop-height*.55;
   const startScroll=endScroll-height*.9;
   const progress=clamp((scroll-startScroll)/(endScroll-startScroll),0,1);
   const startX=(fromRight?1:-1)*(width+visualRect.width+80);
   const startY=-(cardTop-startScroll+visualRect.height+24);
   const x=startX*(1-progress);
   const y=startY*(1-progress);
   const opacity=clamp(progress*2.1,0,1);
   const scale=.84+.16*progress;
   const rotate=(fromRight?-1:1)*10*(1-progress);
   visual.style.setProperty('--flight-x',x.toFixed(1)+'px');
   visual.style.setProperty('--flight-y',y.toFixed(1)+'px');
   visual.style.setProperty('--flight-opacity',opacity.toFixed(3));
   visual.style.setProperty('--flight-scale',scale.toFixed(3));
   visual.style.setProperty('--flight-rotate',rotate.toFixed(2)+'deg');
   visual.classList.toggle('product-flight-landed',progress>=1);
  });
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(update)}
 try{
  register(grid);
  grid.classList.add('product-flight-enabled');
  void grid.offsetWidth;
  schedule();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  new MutationObserver(records=>{
   records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)register(node)}));
   schedule();
  }).observe(grid,{childList:true,subtree:true});
 }catch(error){
  grid.classList.remove('product-flight-enabled');
  getCards().forEach(card=>{const visual=card.querySelector('.product-visual');if(visual)visual.classList.remove('product-flight-ready')});
 }
})();