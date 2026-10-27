const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('open')}));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});document.querySelectorAll('[data-category]').forEach(item=>item.hidden=button.dataset.filter!=='all'&&item.dataset.category!==button.dataset.filter)}));
const lightbox=document.querySelector('#lightbox');document.querySelectorAll('[data-image]').forEach(button=>button.addEventListener('click',()=>{document.querySelector('#lightbox-image').src=button.dataset.image;document.querySelector('#lightbox-image').alt=button.querySelector('img').alt;document.querySelector('#lightbox-caption').textContent=button.dataset.caption;lightbox.showModal()}));
document.querySelectorAll('dialog').forEach(dialog=>{dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}})});
document.querySelector('#credits-button').addEventListener('click',()=>document.querySelector('#credits').showModal());
document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>document.querySelector('#service').value=a.dataset.service));
const date=document.querySelector('#date');const today=new Date();date.min=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
document.querySelector('#year').textContent=new Date().getFullYear();

const whatsappButton=document.querySelector('#whatsapp-float');
const whatsappNumber=String(window.JESSIBRAIDS_CONTACT?.whatsapp||'').replace(/\D/g,'');
if(whatsappNumber){
  whatsappButton.href='https://wa.me/'+whatsappNumber+'?text='+encodeURIComponent('Olá, JessiBraids! Gostava de saber mais sobre os vossos serviços.');
  whatsappButton.target='_blank';whatsappButton.rel='noopener noreferrer';
}else{
  whatsappButton.setAttribute('aria-haspopup','dialog');
  whatsappButton.addEventListener('click',event=>{event.preventDefault();document.querySelector('#whatsapp-demo').showModal()});
}
document.querySelector('#whatsapp-prepare').addEventListener('click',()=>document.querySelector('#whatsapp-demo').close());

// Show during scrolling; tuck away 1.2 seconds after the final scroll event.
// Keep navigation available at the top and while someone is using it.
const scrollHeader=document.querySelector('body>header');
let headerIdleTimer;
let headerPointerInside=false;
const headerMustStay=()=>window.scrollY<=8||nav.classList.contains('open')||headerPointerInside||Boolean(scrollHeader.querySelector(':focus-visible'));
function scheduleHeaderHide(){
  clearTimeout(headerIdleTimer);
  scrollHeader.classList.remove('header-idle');
  scrollHeader.classList.toggle('header-scrolled',window.scrollY>8);
  if(!headerMustStay())headerIdleTimer=setTimeout(()=>{
    if(!headerMustStay())scrollHeader.classList.add('header-idle');
  },1200);
}
window.addEventListener('scroll',scheduleHeaderHide,{passive:true});
scrollHeader.addEventListener('pointerenter',()=>{headerPointerInside=true;scheduleHeaderHide()});
scrollHeader.addEventListener('pointerleave',()=>{headerPointerInside=false;scheduleHeaderHide()});
scrollHeader.addEventListener('focusin',scheduleHeaderHide);
scrollHeader.addEventListener('focusout',()=>setTimeout(scheduleHeaderHide,0));
menu.addEventListener('click',scheduleHeaderHide);
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',scheduleHeaderHide));
window.addEventListener('pageshow',scheduleHeaderHide);
scheduleHeaderHide();
