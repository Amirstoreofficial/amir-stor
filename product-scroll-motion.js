/* Reliable product image side-entry. Uses scroll geometry as a fallback-free controller. */
(()=>{'use strict';
 const grid=document.getElementById('productGrid');
 if(!grid)return;
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduce)return;
 const seen=new WeakSet();
 let frame=0;
 const register=(root)=>{
  const cards=[];
  if(root.nodeType===1&&root.matches&&root.matches('.product-card'))cards.push(root);
  if(root.querySelectorAll)root.querySelectorAll('.product-card').forEach(card=>cards.push(card));
  cards.forEach(card=>{
   if(seen.has(card))return;
   seen.add(card);
   const siblings=[...card.parentElement.children].filter(el=>el.classList.contains('product-card'));
   card.classList.toggle('product-side-right',siblings.indexOf(card)%2===1);
   card.classList.remove('product-side-visible');
  });
 };
 const update=()=>{
  frame=0;
  const h=window.innerHeight||document.documentElement.clientHeight;
  grid.querySelectorAll('.product-card').forEach(card=>{
   const rect=card.getBoundingClientRect();
   const visible=rect.top<h*.88&&rect.bottom>h*.12;
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
   records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)register(node)}));
   schedule();
  }).observe(grid,{childList:true,subtree:true});
 }catch(error){
  grid.classList.remove('product-motion-ready');
  grid.querySelectorAll('.product-card').forEach(card=>card.classList.add('product-side-visible'));
 }
})();