const fallbackProducts = [
  {id:1,name:"ظرف و لیوان کاغذی",category:"محصولات سلولزی",description:"انواع ظرف و لیوان کاغذی در سایزهای مختلف",price:null,unit:"بسته",symbol:"▤"},
  {id:2,name:"جار پلاستیکی",category:"جار و بطری",description:"انواع جار از ۳۵۰ سی‌سی تا ۱۰ کیلویی",price:null,unit:"عدد",symbol:"◉"},
  {id:3,name:"بطری پلاستیکی",category:"جار و بطری",description:"انواع بطری از یک تا چهار لیتری",price:null,unit:"عدد",symbol:"♧"},
  {id:4,name:"ظروف یکبار مصرف IML",category:"ظروف IML",description:"انواع ظروف بسته‌بندی مواد غذایی",price:null,unit:"عدد",symbol:"▣"},
  {id:5,name:"کیسه فریزر و زباله",category:"محصولات پلاستیکی",description:"انواع پلاستیک فریزر، میوه و زباله",price:null,unit:"بسته",symbol:"◇"},
  {id:6,name:"بشقاب و کاسه یکبار مصرف",category:"محصولات پلاستیکی",description:"مناسب پذیرایی و رستوران",price:null,unit:"بسته",symbol:"◍"},
  {id:7,name:"قاشق و چنگال یکبار مصرف",category:"محصولات پلاستیکی",description:"انواع قاشق و چنگال",price:null,unit:"بسته",symbol:"Ⅱ"},
  {id:9,name:"فوم تک پرسی",category:"محصولات پلاستیکی",description:"ظرف فوم تک پرسی، بسته ۳۰۰ عددی",price:3250,unit:"عدد",packCount:300,packPrice:975000,symbol:"▣",image:"Gemini_Generated_Image_2agpmg2agpmg2agp.jpg"},
  {id:10,name:"بطری گرد پافیلی ۴ لیتری",category:"بطری‌ها",description:"بطری گرد پافیلی با حجم ۴ لیتر، دهانه ۴۵ میلی‌متر؛ در وزن‌های مختلف",price:null,unit:"عدد",mouthSize:"۴۵ میلی‌متر",symbol:"♧",image:"images/bottle-gard-pafili-4l.jpg"}
];
const products = Array.isArray(window.AMIR_PRODUCTS) && window.AMIR_PRODUCTS.length
  ? window.AMIR_PRODUCTS
  : fallbackProducts;let cart={};let activeCategory="همه";
const $=s=>document.querySelector(s);
const money=n=>new Intl.NumberFormat("fa-IR").format(n)+" تومان";
const categories=[...new Set(products.map(p=>p.category))];
$("#categoryGrid").innerHTML=categories.map((c,i)=>`<button class="category-card" data-category="${c}"><span class="cat-icon">${["▤","▣","◉","♧","◇","✳"][i%6]}</span><b>${c}</b><small>مشاهده محصولات ←</small></button>`).join("");
$("#categoryFilter").innerHTML+=[...categories].map(c=>`<option>${c}</option>`).join("");
function renderProducts(){let q=$("#search").value.trim();let cat=$("#categoryFilter").value;let list=products.filter(p=>(cat==="همه"||p.category===cat)&&(activeCategory==="همه"||p.category===activeCategory)&&(`${p.name} ${p.description}`.includes(q)));$("#productGrid").innerHTML=list.length?list.map(p=>`<article class="product-card" data-product-detail="${p.id}" tabindex="0" role="button" aria-label="مشاهده جزئیات ${p.name}"><div class="product-visual">${p.image?`<img class="product-photo" src="${p.image}" alt="${p.name}" loading="lazy">`:`<span>${p.symbol||"▣"}</span>`}<small>${p.category}</small></div><div class="product-info"><h3>${p.name}</h3><p>${p.description||"برای مشاهده مشخصات بیشتر کلیک کنید."}</p><div class="product-bottom"><b>${p.price==null?"استعلام قیمت":money(p.price)}</b><button type="button" onclick="event.stopPropagation();addToCart(${p.id})">افزودن به سفارش +</button></div><small class="detail-hint">مشاهده تصویر بزرگ و مشخصات ←</small></div></article>`).join(""):`<p class="empty">محصولی با این مشخصات پیدا نشد.</p>`}
function openProductDetail(id){
  const p=products.find(x=>x.id==id);if(!p)return;
  const modal=$("#productModal");
  $("#detailTitle").textContent=p.name||"جزئیات محصول";
  $("#detailImage").src=p.image||"";$("#detailImage").alt=p.name||"";
  $("#detailImage").hidden=!p.image;$("#detailPlaceholder").hidden=!!p.image;
  $("#detailCategory").textContent=p.category||"";
  $("#detailDescription").textContent=p.description||"توضیحی ثبت نشده است.";
  const specs=[
    {title:"قیمت هر واحد",value:p.price!=null?money(p.price):"استعلام قیمت",note:"قیمت فروش هر عدد از محصول"},
    {title:"قیمت بسته‌ای",value:p.packPrice!=null?money(p.packPrice):null,note:"مبلغ کل یک بسته"},
    {title:"تعداد در بسته",value:p.packCount?new Intl.NumberFormat("fa-IR").format(p.packCount)+" عدد":null,note:"تعداد محصول موجود در هر بسته"},
    {title:"واحد فروش",value:p.unit||null,note:"واحد محاسبه و ثبت سفارش"},
    {title:"ابعاد محصول",value:p.dimensions||null,note:"اندازه و ابعاد اعلام‌شده محصول"},
    {title:"قطر دهانه",value:p.mouthSize||null,note:"اندازه دهانه یا محل ورودی بطری"},
    {title:"وزن",value:p.weight||p.weights||null,note:"وزن اعلام‌شده محصول"}
  ].filter(x=>x.value);
  $("#detailSpecs").innerHTML=specs.map(x=>`<div class="detail-spec"><small>${x.title}</small><b>${x.value}</b><span>${x.note}</span></div>`).join("");
  $("#detailAdd").onclick=()=>{addToCart(p.id);closeProductDetail()};
  $("#detailImage").onclick=()=>$("#detailImage").classList.toggle("zoomed");
  modal.classList.add("show");modal.setAttribute("aria-hidden","false");document.body.classList.add("modal-open")
}
function closeProductDetail(){const m=$("#productModal");m.classList.remove("show");m.setAttribute("aria-hidden","true");document.body.classList.remove("modal-open");$("#detailImage").classList.remove("zoomed")}
$("#productGrid").addEventListener("click",e=>{const card=e.target.closest("[data-product-detail]");if(card&&!e.target.closest("button"))openProductDetail(card.dataset.productDetail)});$("#productGrid").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-product-detail]")){e.preventDefault();openProductDetail(e.target.dataset.productDetail)}});$("#productModal").addEventListener("click",e=>{if(e.target.matches("[data-close-modal]"))closeProductDetail()});$("#detailClose").onclick=closeProductDetail;$("#detailImage").onclick=()=>$("#detailImage").classList.toggle("zoomed");document.addEventListener("keydown",e=>{if(e.key==="Escape")closeProductDetail()});
window.addToCart=id=>{cart[id]=(cart[id]||0)+1;renderCart();$("#cartDrawer").classList.add("show");$("#overlay").classList.add("show")};
function renderCart(){let entries=Object.entries(cart).filter(([id,n])=>n>0);$("#cartCount").textContent=new Intl.NumberFormat("fa-IR").format(entries.reduce((a,[,n])=>a+n,0));$("#cartItems").innerHTML=entries.length?entries.map(([id,n])=>{let p=products.find(x=>x.id==id);return `<div class="cart-item"><div><b>${p.name}</b><small>${p.price==null?"استعلام قیمت":money(p.price)}</small></div><div class="qty"><button onclick="changeQty(${id},-1)">−</button><b>${n}</b><button onclick="changeQty(${id},1)">+</button></div></div>`}).join(""):`<p class="empty">هنوز محصولی انتخاب نکرده‌اید.</p>`;let total=entries.reduce((a,[id,n])=>{let p=products.find(x=>x.id==id);return a+(p.price||0)*n},0);$("#cartTotal").textContent=total?money(total):"نیازمند استعلام"}
window.changeQty=(id,d)=>{cart[id]=(cart[id]||0)+d;if(cart[id]<=0)delete cart[id];renderCart()};
function closeCart(){$("#cartDrawer").classList.remove("show");$("#overlay").classList.remove("show")}
$("#openCart").onclick=()=>{$("#cartDrawer").classList.add("show");$("#overlay").classList.add("show")};$("#closeCart").onclick=closeCart;$("#overlay").onclick=closeCart;
$("#categoryGrid").addEventListener("click",e=>{let b=e.target.closest("[data-category]");if(!b)return;activeCategory=b.dataset.category;$("#categoryFilter").value=activeCategory;renderProducts();document.querySelector("#products").scrollIntoView({behavior:"smooth"})});
$("#categoryFilter").onchange=()=>{activeCategory="همه";renderProducts()};$("#search").oninput=renderProducts;
$("#sendOrder").onclick=()=>{let entries=Object.entries(cart).filter(([id,n])=>n>0);if(!entries.length){alert("ابتدا محصولی به سبد سفارش اضافه کنید.");return}let lines=entries.map(([id,n])=>{let p=products.find(x=>x.id==id);return `• ${p.name} — تعداد: ${n} ${p.unit} — ${p.price==null?"استعلام قیمت":money(p.price)}`});let total=entries.reduce((a,[id,n])=>a+(products.find(x=>x.id==id).price||0)*n,0);let msg=`سلام، برای فروشگاه امیر سفارش دارم:\n\n${lines.join("\n")}\n\nجمع اقلام قیمت‌دار: ${total?money(total):"نیازمند استعلام"}\nلطفاً موجودی و مبلغ نهایی را اعلام کنید.`;window.open("https://wa.me/989152206325?text="+encodeURIComponent(msg),"_blank")};
renderProducts();renderCart();
