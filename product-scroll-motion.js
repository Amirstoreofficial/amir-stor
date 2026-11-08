/* Product-only scroll motion — fail-open, independent of generic reveal effects. */
(()=>{'use strict';
 const grid=document.getElementById('productGrid');
 if(!grid)return;
 const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!('IntersectionObserver' in window))return;
 const observed=new WeakSet();
 let observer;
 try{
   observer=new IntersectionObserver(entries=>{
     entries.forEach(entry=>{
       entry.target.classList.toggle('product-side-visible',entry.isIntersecting);
     });
   },{threshold:0.08,rootMargin:'0px 0px -3% 0px'});
   function prepare(root){
     if(!root)return;
     const cards=[];
     if(root.nodeType===1&&root.matches?.('#productGrid .product-card'))cards.push(root);
     root.querySelectorAll?.('#productGrid .product-card').forEach(card=>cards.push(card));
     cards.forEach(card=>{
       if(observed.has(card))return;
       observed.add(card);
       const siblings=[...card.parentElement.children].filter(el=>el.matches('.product-card'));
       if(siblings.indexOf(card)%2===1)card.classList.add('product-side-right');
       observer.observe(card);
     });
   }
   prepare(document);
   const mutations=new MutationObserver(records=>{
     records.forEach(record=>record.addedNodes.forEach(node=>{
       if(node.nodeType===1)prepare(node);
     }));
   });
   mutations.observe(grid,{childList:true,subtree:true});
   // Activate hidden starting positions only after observer setup succeeds.
   grid.classList.add('product-motion-ready');
 }catch(error){
   grid.classList.remove('product-motion-ready');
   grid.querySelectorAll('.product-card').forEach(card=>card.classList.add('product-side-visible'));
 }
})();