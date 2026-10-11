const DATA = {"brand": {"name": "Les Gîtes de Chooz", "status": "provisoire - à valider", "concept": "La parenthèse verte", "portal_url": null, "palette": {"forest": "#203F35", "sage": "#98A384", "linen": "#F4F0E5", "brass": "#A98B52"}}, "gites": [{"id": "grain", "name": "Le Grain d’Amour", "reference": "08G430", "capacity": 2, "bedrooms": 1, "area_m2": 55, "active": true, "booking_url": "https://www.gites-de-france.com/fr/grand-est/ardennes/le-grain-damour-08g430", "photo": "photo-430_800_1067.jpg", "tagline": "Une échappée à deux.", "description": "Une maison indépendante au cœur d’un jardin partagé, pour savourer les Ardennes à deux.", "gallery": ["photo-430_800_1067.jpg", "photo13-430_800_1067.jpg", "photo15-430_800_1067.jpg", "photo11-430_800_1067.jpg", "photo6-430_800_600.jpg", "photo10-430_800_1201.jpg"], "features": ["Wi-Fi", "Cuisine et séjour", "Chambre à l’étage", "Jardin et piscine partagés"], "energy": "Charges et chauffage inclus selon la fiche de réservation. Évitez de chauffer avec les fenêtres ouvertes.", "pets": "Un animal autorisé selon la fiche de réservation.", "linen": "Linge et ménage inclus selon la fiche de réservation.", "private_wifi": null, "bins": null, "arrival_time": null, "departure_time": null, "status_instructions": "à compléter par la propriétaire"}, {"id": "brasserie", "name": "La Brasserie", "reference": "08G339", "capacity": 12, "bedrooms": 5, "area_m2": 240, "active": true, "booking_url": "https://www.gites-de-france-ardennes.com/location-vacances-Gite-Chooz-08G339.html", "photo": "photo-339_800_1093.jpg", "tagline": "Le bonheur de se retrouver.", "description": "De généreux espaces de vie, une terrasse et la vallée de la Meuse pour les retrouvailles en famille ou entre amis.", "gallery": ["photo-339_800_1093.jpg", "photo1-339_800_1422.jpg", "photo4-339_800_1422.jpg", "photo7-339_800_1422.jpg", "photo24-339_800_1422.jpg", "photo11-339_800_1067.jpg"], "features": ["Wi-Fi", "Grande pièce de vie", "5 chambres", "Vue Meuse et forêt"], "energy": "Charges non comprises. Les conditions de chauffage et d’électricité sont détaillées sur votre fiche de réservation. Évitez de chauffer fenêtres ouvertes.", "pets": "Deux animaux au maximum selon la fiche de réservation.", "linen": "Le linge de lit et de toilette peut faire l’objet de prestations supplémentaires. Vérifiez votre réservation.", "private_wifi": null, "bins": null, "arrival_time": null, "departure_time": null, "status_instructions": "à compléter par la propriétaire"}], "future_gites": [{"id": "future-3", "active": false, "name": null, "booking_url": null}, {"id": "future-4", "active": false, "name": null, "booking_url": null}], "outings": [{"category": "nature", "name": "La Meuse à votre rythme", "where": "Chooz", "text": "À pied ou à vélo, découvrez la Voie Verte et le paysage des bords de Meuse.", "url": "https://www.valdardennetourisme.com/incontournables-du-val-dardenne/villes-et-villages/chooz/", "label": "Découvrir la balade", "number": "01"}, {"category": "visites", "name": "Fort de Charlemont", "where": "Givet", "text": "Un lieu d’histoire et des activités à découvrir au-dessus de la Meuse.", "url": "https://www.charlemont.fr/", "label": "Préparer ma visite", "number": "02"}, {"category": "gourmand", "name": "Pâtisserie Léval", "where": "2 place Carnot · Givet", "text": "Une adresse pour les douceurs, le pain et une pause au salon de thé.", "url": "https://www.valdardennetourisme.com/commerce-service/boulangerie-patisserie-leval/", "label": "Voir l’adresse", "number": "03"}, {"category": "gourmand", "name": "Presqu’île de Chooz", "where": "Chooz", "text": "Une suggestion de restaurant dans le village. Consultez les formules et disponibilités auprès de l’établissement.", "url": "https://www.ile-chooz.com/presentation/restauration.html", "label": "Découvrir le restaurant", "number": "04"}], "so_zen": {"name": "So Zen", "facebook_url": "https://www.facebook.com/people/So-Zen/61578057072575/", "address": "Rue Tony, Chooz", "telephone": "+33621114358", "contact_source": "capture utilisateur du 11 octobre 2026", "symbol": "01-identidade/so-zen-logo-transparente.png", "services": ["Yoga sur place"], "schedule": null, "prices": null, "logo_source": "05-secoes/so-zen/logo-source.png", "photo_sources": ["05-secoes/so-zen/yoga-terrasse-01.png", "05-secoes/so-zen/yoga-terrasse-02.png"], "services_source": "Confirmation utilisateur et photos fournies le 11/10/2026", "language": "fr"}, "shared": {"pool": "Piscine extérieure partagée, chauffée de mai à septembre selon les fiches.", "wellness": "Sauna, spa et hammam sur demande, selon disponibilité et avec supplément.", "wellness_so_zen_relationship": "À confirmer : ne pas confondre prestations spa des fiches et programmation So Zen."}, "checked_on": "2026-10-11"};
'use strict';
const byId = id => document.getElementById(id);
const activeGites = DATA.gites.filter(g=>g.active);
const getGite = id => activeGites.find(g=>g.id===id) || activeGites[0];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
let currentPage = 'accueil';
let currentGallery = {gite:'grain',index:0};
let galleryTrigger = null;
function resolveRoute(hash) {
 const clean=String(hash||'').replace(/^#/,'');
 if(clean.startsWith('sejour-')) return {page:'sejour',gite:getGite(clean.slice(7)).id};
 const valid=['accueil','gites','grain','brasserie','sejour','explorer','sozen'];
 return {page:valid.includes(clean)?clean:'accueil',gite:null};
}
function setGuide(id){
 const g=getGite(id);
 byId('guide-select').value=g.id;
 byId('guide-property').textContent=g.name+' · '+g.capacity+' personnes · '+g.reference;
 byId('guide-energy').textContent=g.energy;
 byId('guide-pets').textContent=g.pets;
 byId('guide-linen').textContent=g.linen;
 byId('guide-booking').href=g.booking_url;
 return g;
}
function route(){
 const r=resolveRoute(window.location.hash);
 if(r.page==='sejour')setGuide(r.gite||byId('guide-select').value);
 if(byId('lightbox').open)byId('lightbox').close();
 document.querySelectorAll('.page').forEach(el=>el.hidden=el.id!=='page-'+r.page);
 document.querySelectorAll('[data-nav]').forEach(el=>{
  const group=['grain','brasserie'].includes(r.page)?'gites':r.page;
  if(el.dataset.nav===group)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
 });
 byId('nav').classList.remove('open');byId('menu-toggle').setAttribute('aria-expanded','false');
 currentPage=r.page;
 document.title=(r.page==='grain'||r.page==='brasserie'?getGite(r.page).name:r.page==='sozen'?'So Zen':r.page==='sejour'?'Votre carnet de séjour':r.page==='explorer'?'Explorer les alentours':'La parenthèse verte')+' · Les Gîtes de Chooz';
 window.scrollTo({top:0,behavior:'instant'});
 byId('main').focus({preventScroll:true});
 updateMotion();
 return r;
}
function filterOutings(category){
 const allowed=['all','nature','visites','gourmand'];
 if(!allowed.includes(category))category='all';
 let count=0;
 document.querySelectorAll('.outing').forEach(el=>{el.hidden=category!=='all'&&el.dataset.category!==category;if(!el.hidden)count++;});
 document.querySelectorAll('[data-filter]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.filter===category)));
 byId('filter-result').textContent=count+' '+(count===1?'idée à découvrir':'idées à découvrir');
 return count;
}
function galleryIndex(index,length){return ((index%length)+length)%length;}
function showGallery(gite,index){
 const g=getGite(gite);currentGallery={gite:g.id,index:galleryIndex(index,g.gallery.length)};
 byId('gallery-photo').src='../04-fotos-reais/'+g.gallery[currentGallery.index];
 byId('gallery-photo').alt=g.name+' : photographie officielle '+(currentGallery.index+1);
 byId('gallery-caption').textContent=g.name+' · '+(currentGallery.index+1)+' / '+g.gallery.length;
}
function motionState(progress,isReduced){
 const p=Math.max(0,Math.min(1,Number(progress)||0));
 return isReduced?{y:0,scale:1,dash:0,tilt:0,upper:0,lower:0}:{y:-28*p,scale:1+.035*p,dash:100*(1-p),tilt:2*p,upper:-35*p,lower:20*p};
}
function updateMotion(){
 if(currentPage!=='accueil')return;
 const scene=document.querySelector('.hero-scroll');
 const bounds=scene.getBoundingClientRect();
 const p=-bounds.top/Math.max(1,bounds.height-window.innerHeight);
 const m=motionState(p,reduced.matches);
 byId('hero-art').style.transform='translateY('+m.y+'px) scale('+m.scale+')';
 byId('river').style.strokeDashoffset=String(m.dash);
 byId('plane-upper').style.transform='translateY(calc(-5% + '+m.upper+'px)) scale(.92)';
 byId('plane-lower').style.transform='translate(3%,calc(14% + '+m.lower+'px)) scale(.94)';
 document.querySelectorAll('.home-cards .photo').forEach((el,i)=>el.style.transform=reduced.matches?'none':'perspective(1100px) rotateY('+(i?-m.tilt:m.tilt)+'deg)');
}
let scrollQueued=false;
window.addEventListener('scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{updateMotion();scrollQueued=false;});},{passive:true});
window.addEventListener('resize',updateMotion);
window.addEventListener('hashchange',route);
reduced.addEventListener('change',updateMotion);
byId('menu-toggle').addEventListener('click',()=>{const open=byId('nav').classList.toggle('open');byId('menu-toggle').setAttribute('aria-expanded',String(open));});
byId('guide-select').addEventListener('change',e=>{window.location.hash='sejour-'+getGite(e.target.value).id;});
let printState=[];
window.addEventListener('beforeprint',()=>{printState=Array.from(document.querySelectorAll('.guide-grid details')).map(el=>({el,open:el.open}));printState.forEach(x=>x.el.open=true);});
window.addEventListener('afterprint',()=>printState.forEach(x=>x.el.open=x.open));
byId('print-guide').addEventListener('click',()=>window.print());
document.querySelectorAll('[data-filter]').forEach(el=>el.addEventListener('click',()=>filterOutings(el.dataset.filter)));
document.querySelectorAll('[data-gallery]').forEach(el=>el.addEventListener('click',()=>{galleryTrigger=el;showGallery(el.dataset.gallery,Number(el.dataset.index));byId('lightbox').showModal();}));
byId('gallery-close').addEventListener('click',()=>byId('lightbox').close());
byId('lightbox').addEventListener('close',()=>{if(galleryTrigger)galleryTrigger.focus();});
byId('gallery-prev').addEventListener('click',()=>showGallery(currentGallery.gite,currentGallery.index-1));
byId('gallery-next').addEventListener('click',()=>showGallery(currentGallery.gite,currentGallery.index+1));
byId('lightbox').addEventListener('keydown',e=>{if(e.key==='ArrowLeft')showGallery(currentGallery.gite,currentGallery.index-1);if(e.key==='ArrowRight')showGallery(currentGallery.gite,currentGallery.index+1);});
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}else document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));
window.__portalTests={getGite,resolveRoute,setGuide,filterOutings,galleryIndex,motionState,route,showGallery};
document.querySelector('.hero').classList.add('layered');
setGuide('grain');route();
