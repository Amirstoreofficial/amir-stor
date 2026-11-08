/* Product card side-entry motion — independent translate channel. */
(()=>{'use strict';
 const grid=document.getElementById('productGrid');
 if(!grid)return;
 const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(reduce||!('IntersectionObserver' in window))return;
 const seen=new WeakSet();
 try{
  const observer=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{
    entry.target.classList.toggle('product-side-visible',entry.isIntersecting);
   });
  },{threshold:0.04,rootMargin:'0px 0px -2% 0px'});
  const prepare=node=>{
   if(!node)return;
   const cards=[];
   if(node.nodeType===1&&node.matches?.('.product-card'))cards.push(node);
   node.querySelectorAll?.('.product-card').forEach(card=>cards.push(card));
   cards.forEach(card=>{
    if(seen.has(card))return;
    seen.add(card);
    const siblings=[...card.parentElement.children].filter(el=>el.classList.contains('product-card'));
    card.classList.toggle('product-side-right',siblings.indexOf(card)%2===1);
    observer.observe(card);
   });
  };
  prepare(grid);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(prepare)))
   .observe(grid,{childList:true,subtree:true});
  grid.classList.add('product-motion-ready');
 }catch(error){
  grid.classList.remove('product-motion-ready');
  grid.querySelectorAll('.product-card').forEach(card=>card.classList.add('product-side-visible'));
 }
})();