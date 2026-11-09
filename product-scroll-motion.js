/* Lightweight viewport-aware product motion.
   Avoid duplicate fixed image overlays and per-scroll geometry calculations. */
(()=>{'use strict';
 const grid=document.getElementById('productGrid');
 if(!grid)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const observe=(root=document)=>{
  const nodes=root.querySelectorAll?.('#productGrid .product-card, #offers .offer-card')||[];
  nodes.forEach((node,index)=>{
   if(node.dataset.motionObserved)return;
   node.dataset.motionObserved='1';
   if(node.matches('#productGrid .product-card')&&index%2===1)node.classList.add('product-side-right');
   if(reduced||!('IntersectionObserver'in window)){node.classList.add('motion-in-view');return;}
   observer.observe(node);
  });
 };
 if(reduced||!('IntersectionObserver'in window)){observe();return;}
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
   if(entry.isIntersecting){entry.target.classList.add('motion-in-view');observer.unobserve(entry.target);}
  });
 },{rootMargin:'100px 0px',threshold:0.01});
 observe();
 new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{
  if(node.nodeType===1){if(node.matches?.('.product-card,.offer-card'))observe(node.parentElement||document);else observe(node);}
 }))).observe(grid,{childList:true});
 const offers=document.getElementById('offersGrid');
 if(offers)new MutationObserver(()=>observe(offers)).observe(offers,{childList:true});
})();