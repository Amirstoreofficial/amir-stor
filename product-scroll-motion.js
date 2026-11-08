/* Product images enter from the actual viewport edge, then settle in their own cards. */
(()=>{'use strict';
 const grid=document.getElementById('productGrid');
 if(!grid)return;
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce)return;
 const seen=new WeakSet();
 let frame=0;
 const cards=()=>[...grid.querySelectorAll('.product-card')];
 const register=(root)=>{
  const list=[];
  if(root.nodeType===1&&root.matches&&root.matches('.product-card'))list.push(root);
  if(root.querySelectorAll)root.querySelectorAll('.product-card').forEach(c=>list.push(c));
  list.forEach(card=>{
   if(seen.has(card))return;
   seen.add(card);
   const visual=card.querySelector('.product-visual');
   if(visual)visual.style.setProperty('--product-entry-x','-110vw');
   card.classList.remove('product-side-visible');
  });
 };
 const update=()=>{
  frame=0;
  const width=window.innerWidth||document.documentElement.clientWidth;
  const height=window.innerHeight||document.documentElement.clientHeight;
  const list=cards();
  list.forEach((card,index)=>{
   const visual=card.querySelector('.product-visual');
   if(!visual)return;
   const rect=card.getBoundingClientRect();
   const center=rect.left+rect.width/2;
   let fromRight=center>width/2;
   if(Math.abs(center-width/2)<rect.width*.12)fromRight=index%2===1;
   /* Offset far enough that the complete visual begins beyond the chosen viewport edge. */
   const distance=fromRight ? Math.max(0,width-rect.left)+rect.width*.15+40 : -(Math.max(0,rect.right)+rect.width*.15+40);
   visual.style.setProperty('--product-entry-x',distance+'px');
   const visible=rect.top<height*.88&&rect.bottom>height*.12;
   card.classList.toggle('product-side-visible',visible);
  });
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
 try{
  register(grid);
  grid.classList.add('product-motion-ready');
  void grid.offsetWidth;
  schedule();
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  new MutationObserver(records=>{
   records.forEach(r=>r.addedNodes.forEach(node=>{if(node.nodeType===1)register(node)}));
   schedule();
  }).observe(grid,{childList:true,subtree:true});
 }catch(error){
  grid.classList.remove('product-motion-ready');
  cards().forEach(card=>card.classList.add('product-side-visible'));
 }
})();