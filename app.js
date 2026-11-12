const products = Array.isArray(window.AMIR_PRODUCTS) ? window.AMIR_PRODUCTS : [];let cart={};let activeCategory="همه";
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("fa-IR").format(n)+" تومان";
const normalizeText=value=>String(value??"").normalize("NFKC").replace(/[يى]/g,"ی").replace(/ك/g,"ک").replace(/[\u064B-\u065F\u0670]/g,"").toLocaleLowerCase("fa");
const preferredCategories=["بطری و جار","سفره","محصولات فومی"];const categories=[...preferredCategories.filter(c=>products.some(p=>p.category===c)),...new Set(products.map(p=>p.category).filter(c=>!preferredCategories.includes(c)))];
if(!products.length){document.querySelector("#categories").hidden=true;document.querySelector("#products").hidden=true;}
$("#categoryGrid").innerHTML=categories.map((c,i)=>`<button class="category-card" data-category="${c}"><span class="cat-icon">${["▤","▣","◉","♧","◇","✳"][i%6]}</span><b>${c}</b><small>مشاهده محصولات ←</small></button>`).join("");
$("#categoryFilter").innerHTML+=[...categories].map(c=>`<option>${c}</option>`).join("");
let showAllProducts=false;
function renderProducts(){
 let q=normalizeText($("#search").value.trim());
 let cat=$("#categoryFilter").value;
 let list=products.filter(p=>(cat==="همه"||p.category===cat)&&(activeCategory==="همه"||p.category===activeCategory)&&normalizeText(`${p.name} ${p.description} ${p.volume||""} ${p.mouthSize||""} ${p.weight||p.weights||""}`).includes(q));
 const visibleList=showAllProducts?list:list.slice(0,12);
 const cards=visibleList.map(p=>`<article class="product-card ${p.motion?"product-card--motion":""} ${p.featuredOffer?"product-card--offer":""}" data-product-detail="${p.id}" onclick="window.openProductDetail(this.dataset.productDetail)" tabindex="0" role="button" aria-label="مشاهده جزئیات ${p.name}"><div class="product-visual">${p.image?`<img class="product-photo ${p.motion?"product-photo-float":""}" src="${p.image}" alt="${p.name}" loading="lazy">`:`<div class="product-image-placeholder"><small>تصویر واقعی این محصول هنوز ثبت نشده است</small></div>`}</div><div class="product-info"><h3>${p.name}</h3><div class="product-card-meta">${p.discountPrice!=null?`<span class="tissue-price-stack"><del>${money(p.price)}</del><strong>${money(p.discountPrice)}</strong></span>`:`<b>${p.price!=null?money(p.price):"استعلام قیمت"}</b>`}<span>مشاهده مشخصات و سفارش ←</span></div>${p.featuredOffer?`<span class="product-offer-badge">✦ تخفیف ویژه</span>`:""}</div></article>`).join("");
 $("#productGrid").innerHTML=cards||`<div class="catalog-empty"><span>AMIR / CATALOG</span><b>محصولی پیدا نشد</b><small>عبارت جست‌وجو یا دسته‌بندی را تغییر دهید.</small></div>`;

 $("#productGrid").querySelectorAll("img.product-photo").forEach(img=>img.addEventListener("error",()=>{const box=document.createElement("div");box.className="product-image-placeholder";box.textContent="تصویر واقعی این محصول در دسترس نیست";img.replaceWith(box)},{once:true}));
 const more=$("#productsMoreWrap");
 more.hidden=list.length<=12||showAllProducts;
}
$("#showMoreProducts").addEventListener("click",()=>{showAllProducts=true;renderProducts()});

function renderFeaturedOffers(){
 const offers=products.filter(p=>p.featuredOffer);
 const grid=$("#offersGrid");
 if(!grid)return;
 grid.innerHTML=offers.map(p=>`<article class="offer-card" data-product-detail="${p.id}" onclick="window.openProductDetail(this.dataset.productDetail)" tabindex="0" role="button" aria-label="مشاهده پیشنهاد ویژه ${p.name}">
  <div class="offer-card-visual">${p.image?((p.id===1004||p.id===1005)?`<img class="shahoo-single-image" src="${p.image}" alt="${p.name}" loading="lazy">`:`<img src="${p.image}" alt="${p.name}" loading="lazy">`):""}<span class="offer-ribbon">✦ تخفیف ویژه</span><span class="offer-glow"></span></div>
  <div class="offer-card-info"><span class="offer-kicker">پیشنهاد ویژه فروشگاه امیر</span><h3>${p.name}</h3><p>${p.description||"برای اطلاع از جزئیات این پیشنهاد با ما در تماس باشید."}</p><div class="offer-card-bottom">${p.discountPrice!=null?`<span class="tissue-price-stack"><del>${money(p.price)}</del><strong>${money(p.discountPrice)}</strong></span>`:`<b>${p.price!=null?money(p.price):"استعلام قیمت"}</b>`}<span>مشاهده و سفارش <i>←</i></span></div></div>
 </article>`).join("");

 grid.querySelectorAll("img").forEach(img=>img.addEventListener("error",()=>img.remove(),{once:true}));
}
renderFeaturedOffers();

function packageQuantity(p){if(Number(p.packCount)>0)return Number(p.packCount);const source=String(p.description||"");const digits=source.replace(/[۰-۹]/g,d=>String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))).replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));const match=digits.match(/(?:بسته\s*)?(\d+(?:\.\d+)?)\s*عددی|(?:تعداد\s*(?:در|داخل)\s*بسته\s*[:：]?\s*)(\d+(?:\.\d+)?)/i);return match?Number(match[1]||match[2]):0}
function productUnits(p){return Array.isArray(p.salesUnits)&&p.salesUnits.length?p.salesUnits:["بسته","عدد"]}
function selectedUnit(p){return productUnits(p)[0]}
function unitPrice(p,unit){if(unit==="بسته")return p.packPrice??null;if(unit==="کیلوگرم")return p.kgPrice??null;return p.price??null}
let detailCloseTimer=null;
function openProductDetail(id){
  const p=products.find(x=>x.id==id);if(!p)return;
  const modal=$("#productModal");clearTimeout(detailCloseTimer);modal.classList.remove("is-closing");
  $("#detailTitle").textContent=p.name||"جزئیات محصول";
  $("#detailImage").src=p.image||"";$("#detailImage").alt=p.name||"";$("#detailImage").classList.remove("detail-photo-float");
  $("#detailImage").onerror=()=>{$("#detailImage").hidden=true;$("#detailPlaceholder").hidden=false;$("#detailPlaceholder").textContent="تصویر واقعی این محصول در دسترس نیست"};
  $("#detailImage").hidden=!p.image;$("#detailPlaceholder").hidden=!!p.image;
  $("#detailCategory").textContent=p.category||"";
  $("#detailDescription").textContent=p.description||"توضیحی ثبت نشده است.";
  const specs=[
    ...(p.discountPrice!=null?[{title:"قیمت قبل از تخفیف",value:money(p.price),note:"قیمت فروش قبلی"},{title:"قیمت با تخفیف ویژه",value:money(p.discountPrice),note:"قیمت نهایی فروش هر بسته"}]:[{title:"قیمت هر عدد",value:p.price!=null?money(p.price):"استعلام قیمت",note:"قیمت مستقل فروش یک عدد"},{title:"قیمت هر بسته",value:p.packPrice!=null?money(p.packPrice):"استعلام قیمت",note:"قیمت مستقل فروش یک بسته"}]),
    {title:"تعداد در بسته",value:packageQuantity(p)?new Intl.NumberFormat("fa-IR").format(packageQuantity(p))+" عدد":null,note:"از فیلد تعداد بسته یا توضیحات محصول خوانده می‌شود"},
    {title:"واحد فروش",value:productUnits(p).join("، "),note:"واحدهای قابل انتخاب برای فروش"},
    {title:"ابعاد محصول",value:p.dimensions||null,note:"اندازه و ابعاد اعلام‌شده محصول"},
    {title:"حجم محصول",value:p.volume||null,note:"ظرفیت اعلام‌شده محصول"},
    {title:"قطر دهانه",value:p.mouthSize||null,note:"اندازه دهانه یا محل ورودی بطری"},
    {title:"رنگ درب / دستگیره",value:p.capHandle||null,note:"رنگ‌بندی درب یا دستگیره محصول"},
    {title:"وزن",value:p.weight||p.weights||null,note:"وزن اعلام‌شده محصول"}
  ].filter(x=>x.value);
  const units=productUnits(p);const defaultUnit=selectedUnit(p);
  $("#detailSpecs").innerHTML=specs.map(x=>`<div class="detail-spec"><small>${x.title}</small><b>${x.value}</b><span>${x.note}</span></div>`).join("")+
    `<div class="detail-spec" style="grid-column:1/-1"><small>واحد خرید</small><div style="display:flex;gap:8px;flex-wrap:wrap;margin:8px 0">${units.map((u,i)=>`<label style="display:flex;align-items:center;gap:6px;padding:9px 13px;border:1px solid var(--line,#d7dfdc);border-radius:12px;cursor:pointer"><input type="radio" name="detailSalesUnit" value="${u}" ${i===0?"checked":""}> ${u}</label>`).join("")}</div><small>تعداد داخل هر بسته: ${packageQuantity(p)?new Intl.NumberFormat("fa-IR").format(packageQuantity(p))+" عدد":"در توضیحات مشخص نشده"}</small></div>
    <div class="detail-spec" style="grid-column:1/-1"><small>تعداد درخواستی</small><input id="detailQuantity" type="number" min="0.01" step="${defaultUnit==="کیلوگرم"?"0.1":"1"}" value="1" style="width:100%;padding:12px;border:1px solid var(--line,#d7dfdc);border-radius:12px;font:inherit"></div>`;
  $("#detailAdd").onclick=()=>{const unit=document.querySelector('input[name="detailSalesUnit"]:checked')?.value||defaultUnit;const qty=Math.max(0.01,Number($("#detailQuantity").value)||1);addToCart(p.id,unit,qty);closeProductDetail()};
  $("#detailImage").onclick=()=>$("#detailImage").classList.toggle("zoomed");
  modal.classList.add("show");modal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open")
}
window.openProductDetail=openProductDetail;
function closeProductDetail(){const m=$("#productModal");if(!m.classList.contains("show"))return;m.classList.add("is-closing");clearTimeout(detailCloseTimer);detailCloseTimer=setTimeout(()=>{m.classList.remove("show","is-closing");m.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");$("#detailImage").classList.remove("zoomed")},300)}
// One document-level capture handler covers product cards after every render
// and prevents nested elements or other bubbling handlers from swallowing the click.
document.addEventListener("click",e=>{
  const card=e.target.closest?.("[data-product-detail]");
  if(!card || card.closest("#productModal"))return;
  e.preventDefault();
  e.stopImmediatePropagation();
  openProductDetail(card.dataset.productDetail);
},true);
document.addEventListener("keydown",e=>{
  if(e.key!=="Enter"&&e.key!==" ")return;
  const card=e.target.closest?.("[data-product-detail]");
  if(!card || card.closest("#productModal"))return;
  e.preventDefault();
  e.stopImmediatePropagation();
  openProductDetail(card.dataset.productDetail);
},true);$("#productModal").addEventListener("click",e=>{if(e.target.matches("[data-close-modal]"))closeProductDetail()});$("#detailClose").onclick=closeProductDetail;$("#detailImage").onclick=()=>$("#detailImage").classList.toggle("zoomed");document.addEventListener("keydown",e=>{if(e.key==="Escape")closeProductDetail()});
window.addToCart=(id,unit,qty=1)=>{const p=products.find(x=>x.id==id);if(!p)return;unit=unit||selectedUnit(p);const key=String(id)+"::"+unit;cart[key]={id,unit,qty:(cart[key]?.qty||0)+qty};renderCart();$("#cartDrawer").classList.add("show");$("#overlay").classList.add("show")};
function renderCart(){let entries=Object.entries(cart).filter(([,item])=>item.qty>0);$("#cartCount").textContent=new Intl.NumberFormat("fa-IR").format(entries.reduce((a,[,item])=>a+item.qty,0));$("#cartItems").innerHTML=entries.length?entries.map(([key,item])=>{let p=products.find(x=>x.id==item.id),price=unitPrice(p,item.unit);const inPack=packageQuantity(p);const quantityNote=item.unit==="بسته"&&inPack?` (${new Intl.NumberFormat("fa-IR").format(item.qty*inPack)} عدد در مجموع)`: "";return `<div class="cart-item"><div><b>${p.name}</b><small>${new Intl.NumberFormat("fa-IR").format(item.qty)} ${item.unit}${quantityNote} · ${price==null?"استعلام قیمت":money(price)+" / "+item.unit}</small></div><div class="qty"><button onclick="changeQty('${key}',-1)">−</button><b>${new Intl.NumberFormat("fa-IR").format(item.qty)}</b><button onclick="changeQty('${key}',1)">+</button></div></div>`}).join(""):`<p class="empty">هنوز محصولی انتخاب نکرده‌اید.</p>`;let total=entries.reduce((a,[,item])=>{let p=products.find(x=>x.id==item.id),price=unitPrice(p,item.unit);return a+(price||0)*item.qty},0);$("#cartTotal").textContent=total?money(total):"نیازمند استعلام"}
window.changeQty=(key,d)=>{if(!cart[key])return;cart[key].qty+=d;if(cart[key].qty<=0)delete cart[key];renderCart()};
function closeCart(){$("#cartDrawer").classList.remove("show");$("#overlay").classList.remove("show")}
$("#openCart").onclick=()=>{$("#cartDrawer").classList.add("show");$("#overlay").classList.add("show")};$("#closeCart").onclick=closeCart;$("#overlay").onclick=closeCart;
$("#categoryGrid").addEventListener("click",e=>{let b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;$("#categoryFilter").value=activeCategory;renderProducts();document.querySelector("#products").scrollIntoView({behavior:"smooth"})});
$("#categoryFilter").onchange=()=>{activeCategory="همه";showAllProducts=false;renderProducts()};$("#search").oninput=()=>{showAllProducts=false;renderProducts()};
function openOrderForm(){let entries=Object.entries(cart).filter(([,item])=>item.qty>0);if(!entries.length){alert("ابتدا محصولی به سبد سفارش اضافه کنید.");return}closeCart();$("#orderStatus").textContent="";$("#orderModal").classList.add("show");$("#orderModal").setAttribute("aria-hidden","false");document.body.classList.add("modal-open")}
function closeOrderForm(){$("#orderModal").classList.remove("show");$("#orderModal").setAttribute("aria-hidden","true");document.body.classList.remove("modal-open")}
$("#sendOrder").onclick=openOrderForm;$("#orderClose").onclick=closeOrderForm;$("#orderModal").addEventListener("click",e=>{if(e.target.matches("[data-close-order]"))closeOrderForm()});
$("#orderForm").addEventListener("submit",e=>{e.preventDefault();let entries=Object.entries(cart).filter(([,item])=>item.qty>0);if(!entries.length){alert("سبد سفارش خالی است.");closeOrderForm();return}let form=new FormData(e.currentTarget);let name=String(form.get("customerName")||"").trim(),phone=String(form.get("customerPhone")||"").trim(),address=String(form.get("customerAddress")||"").trim(),note=String(form.get("customerNote")||"").trim();if(!name||!phone||!address){alert("لطفاً نام، شماره تماس و آدرس را کامل کنید.");return}let lines=entries.map(([,item])=>{let p=products.find(x=>x.id==item.id),price=unitPrice(p,item.unit);const inPack=packageQuantity(p);const quantityNote=item.unit==="بسته"&&inPack?` (معادل ${new Intl.NumberFormat("fa-IR").format(item.qty*inPack)} عدد)`: "";return `• ${p.name} — مقدار: ${new Intl.NumberFormat("fa-IR").format(item.qty)} ${item.unit}${quantityNote} — ${price==null?"استعلام قیمت":money(price)+" / "+item.unit}`});let total=entries.reduce((a,[,item])=>{let p=products.find(x=>x.id==item.id);return a+(unitPrice(p,item.unit)||0)*item.qty},0);let msg=`سلام، درخواست سفارش جدید برای فروشگاه امیر دارم.\n\nمشخصات مشتری:\nنام: ${name}\nشماره تماس: ${phone}\nآدرس: ${address}\n\nاقلام درخواستی:\n${lines.join("\n")}\n\nجمع تقریبی اقلام قیمت‌دار: ${total?money(total):"نیازمند استعلام"}\n${note?"توضیحات: "+note+"\n":""}\nاین پیام صرفاً درخواست سفارش است؛ پرداختی انجام نشده و لطفاً موجودی و مبلغ نهایی را اعلام کنید.`;
const rubikaUrl="https://rubika.ir/AmirPlastics";const status=$("#orderStatus");const fallbackCopy=()=>{const field=document.createElement("textarea");field.value=msg;field.setAttribute("readonly","");field.style.position="fixed";field.style.opacity="0";field.style.pointerEvents="none";document.body.appendChild(field);field.select();field.setSelectionRange(0,field.value.length);let copied=false;try{copied=document.execCommand("copy")}catch(error){copied=false}field.remove();return copied};const openRubika=()=>{status.textContent="متن سفارش کپی شد؛ روبیکا باز می‌شود. وارد گفت‌وگوی فروشگاه شوید و متن را جای‌گذاری و ارسال کنید.";window.location.assign(rubikaUrl)};if(typeof navigator.share==="function"){status.textContent="پنجره اشتراک‌گذاری باز می‌شود؛ روبیکا را انتخاب کنید و گفت‌وگوی فروشگاه امیر را برای ارسال متن سفارش انتخاب کنید.";navigator.share({title:"سفارش فروشگاه امیر",text:msg}).then(()=>{status.textContent="متن سفارش به برنامه انتخاب‌شده تحویل شد؛ ارسال نهایی را در روبیکا بررسی و خودتان انجام دهید."}).catch(error=>{if(error&&error.name==="AbortError"){status.textContent="اشتراک‌گذاری لغو شد؛ سفارش ارسال نشده است.";return}if(fallbackCopy())openRubika();else status.textContent="اشتراک‌گذاری و کپی خودکار انجام نشد؛ سفارش ارسال نشده است. دوباره تلاش کنید."})}else if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(msg).then(openRubika).catch(()=>{if(fallbackCopy())openRubika();else status.textContent="کپی خودکار انجام نشد. سفارش ارسال نشده است؛ لطفاً دوباره تلاش کنید."})}else if(fallbackCopy()){openRubika()}else{status.textContent="کپی خودکار انجام نشد. سفارش ارسال نشده است؛ لطفاً دوباره تلاش کنید."}});
renderProducts();renderCart();


/* Scroll-linked background products with a bounded full-page layer and responsive mobile navigation */
(()=>{const hero=document.querySelector(".hero"),layers=[...document.querySelectorAll("[data-depth]")];let ticking=false;const scrollItems=[...document.querySelectorAll(".scroll-item[data-scroll-depth]")];const atmosphere=document.querySelector("body>.scroll-atmosphere");const bgProducts=[...document.querySelectorAll(".scroll-atmosphere>.bg-product")];let resizeFrame=0;const sizeAtmosphere=()=>{if(!atmosphere)return;const footer=document.querySelector("body>footer");const main=document.querySelector("body>main");const end=footer?footer.getBoundingClientRect().bottom+window.scrollY:(main?main.getBoundingClientRect().bottom+window.scrollY:document.documentElement.clientHeight);atmosphere.style.setProperty("height",Math.ceil(end)+"px","important")};const scheduleSize=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(sizeAtmosphere)};sizeAtmosphere();if("ResizeObserver"in window){const atmosphereObserver=new ResizeObserver(scheduleSize);const pageMain=document.querySelector("body>main"),pageFooter=document.querySelector("body>footer");if(pageMain)atmosphereObserver.observe(pageMain);if(pageFooter)atmosphereObserver.observe(pageFooter)}window.addEventListener("load",scheduleSize,{once:true});const move=()=>{const scroll=window.scrollY||0;const rect=hero?.getBoundingClientRect();if(rect){const progress=Math.max(-1,Math.min(1,(window.innerHeight/2-(rect.top+rect.height/2))/(window.innerHeight+rect.height)));layers.forEach((el,i)=>{const depth=Number(el.dataset.depth||.2),y=progress*110*depth,x=Math.sin(progress*2.2+i*.8)*13*depth;el.style.translate=x+"px "+y+"px"})}scrollItems.forEach((el,i)=>{const depth=Number(el.dataset.scrollDepth||.15);const drift=scroll*depth;const sway=Math.sin(scroll/310+i*1.2)*18;el.style.translate=sway+"px "+drift+"px"});bgProducts.forEach((el,i)=>{const depth=.66+(i%4)*.055;const drift=scroll*depth;const sway=Math.sin(scroll/260+i*1.05)*15;el.style.translate=sway+"px "+drift+"px"});ticking=false};window.addEventListener("scroll",()=>{if(!ticking){requestAnimationFrame(move);ticking=true}},{passive:true});window.addEventListener("resize",()=>{scheduleSize();move()},{passive:true});move();const menu=document.getElementById("mobileMenuBtn"),nav=document.getElementById("mainNav");menu?.addEventListener("click",()=>{const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"×":"☰"});nav?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menu?.setAttribute("aria-expanded","false");if(menu)menu.textContent="☰"}))})();
