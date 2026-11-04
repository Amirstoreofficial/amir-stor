
(() => {
  const launcher=document.getElementById('aiLauncher'), panel=document.getElementById('aiPanel');
  if(!launcher||!panel)return;
  const messages=document.getElementById('aiMessages'), input=document.getElementById('aiInput');
  const products=()=>Array.isArray(window.AMIR_PRODUCTS)?window.AMIR_PRODUCTS:[];
  const normalize=s=>String(s||'').toLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک').replace(/[\u064B-\u065F\u0670\u200c\s،؛,.!?؟ـ]/g,'');
  const add=(text,who='bot')=>{const el=document.createElement('div');el.className='ai-msg '+who;el.textContent=text;messages.appendChild(el);messages.scrollTop=messages.scrollHeight;};
  const open=()=>{panel.classList.add('is-open');launcher.setAttribute('aria-expanded','true');input.focus();};
  const close=()=>{panel.classList.remove('is-open');launcher.setAttribute('aria-expanded','false');};
  launcher.addEventListener('click',()=>panel.classList.contains('is-open')?close():open());
  document.getElementById('aiClose').addEventListener('click',close);
  function answer(q){
    const nq=normalize(q), list=products();
    if(/سلام|درود|وقت بخیر|خسته نباشید/.test(q))return 'سلام، خوش آمدید 🌿 من دستیار فروشگاه امیر هستم. برای پیدا کردن محصول، مشخصات یا قیمتش راهنمایی‌تان می‌کنم. چه محصولی مدنظرتان است؟';
    if(/آدرس|کجا|نشانی/.test(q))return 'فروشگاه امیر در قاسم‌آباد، داخل شریعتی ۴۴ قرار دارد. برای راهنمایی بیشتر با شماره ۰۹۱۵۲۲۰۶۳۲۵ تماس بگیرید.';
    if(/تماس|تلفن|واتساپ|سفارش|خرید/.test(q))return 'برای ثبت سفارش یا استعلام، از طریق واتساپ با فروشگاه در ارتباط باشید یا با شماره ۰۹۱۵۲۲۰۶۳۲۵ تماس بگیرید.';
    if(!list.length)return 'در حال حاضر اطلاعات کاتالوگ در دسترس نیست. لطفاً برای راهنمایی مستقیم با فروشگاه تماس بگیرید: ۰۹۱۵۲۲۰۶۳۲۵';
    const matches=list.map(p=>{const hay=normalize([p.name,p.category,p.description,p.volume,p.mouthSize,p.weights].join(' '));let score=0;for(const token of nq.match(/.{2,}/g)||[])if(hay.includes(token))score+=token.length;return {p,score};}).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
    if(matches.length){
      const p=matches[0].p;
      const specs=[p.volume&&'حجم: '+p.volume,p.mouthSize&&'دهانه: '+p.mouthSize,p.weights&&'وزن: '+p.weights].filter(Boolean).join('، ');
      const price=p.price!=null?'قیمت ثبت‌شده: '+Number(p.price).toLocaleString('fa-IR')+' تومان':'قیمت این محصول در کاتالوگ ثبت نشده و باید استعلام شود.';
      return 'این محصول را در کاتالوگ پیدا کردم: «'+p.name+'»'+(specs?'\n'+specs:'')+'\n'+price+'\nبرای موجودی روز و ثبت سفارش، با فروشگاه هماهنگ کنید.';
    }
    if(/قیمت|چنده|چند/.test(q))return 'برای اعلام قیمت دقیق، لطفاً نام محصول یا حجم و دهانه آن را بفرمایید. قیمت‌های ثبت‌نشده را حدس نمی‌زنم.';
    return 'برای اینکه دقیق راهنمایی‌تان کنم، لطفاً نام محصول یا کاربردش را بگویید؛ مثلاً بطری، جار یا ظروف بسته‌بندی غذا. اگر محصول خاصی مدنظرتان است، حجم یا اندازه‌اش را هم بنویسید.';
  }
  function send(text){const q=(text||input.value).trim();if(!q)return;add(q,'user');input.value='';window.setTimeout(()=>add(answer(q)),180);}
  document.getElementById('aiSend').addEventListener('click',()=>send());
  input.addEventListener('keydown',e=>{if(e.key==='Enter')send();});
  panel.querySelectorAll('[data-ai-question]').forEach(b=>b.addEventListener('click',()=>send(b.dataset.aiQuestion)));
  add('سلام! 🌱 به فروشگاه امیر خوش آمدید. درباره محصولات، مشخصات یا نحوه سفارش سؤالتان را بپرسید.');
})();
