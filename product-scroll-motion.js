/* Product-only scroll motion. Kept separate from catalog/order logic. */
(()=>{'use strict';
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const seen=new WeakSet();
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   entry.target.classList.toggle('product-side-visible',entry.isIntersecting);
 }),{threshold:.12,rootMargin:'0px 0px -5% 0px'});
 function prepare(root){
   if(!root||!(root instanceof Element||root===document))return;
   const cards=[];
   if(root instanceof Element&&root.matches('#productGrid .product-card'))cards.push(root);
   root.querySelectorAll?.('#productGrid .product-card').forEach(card=>cards.push(card));
   cards.forEach(card=>{
     if(seen.has(card))return;
     seen.add(card);
     const index=[...card.parentElement.children].filter(el=>el.matches('.product-card')).indexOf(card);
     if(index%2===1)card.classList.add('product-side-right');
     observer.observe(card);
   });
 }
 prepare(document);
 const mutations=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)prepare(node)})));
 mutations.observe(document.body,{childList:true,subtree:true});
})();