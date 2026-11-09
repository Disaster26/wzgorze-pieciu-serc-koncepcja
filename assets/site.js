(function(){
  "use strict";
  var $ = function(s,c){return (c||document).querySelector(s)};
  var $$ = function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};

  /* rok */
  $$("[data-rok]").forEach(function(e){e.textContent=new Date().getFullYear()});

  /* menu mobilne */
  var burger=$(".burger"), panel=$("#panel");
  function zamknij(){panel.classList.remove("otwarte");burger.querySelector("path").setAttribute("d","M4 7h16M4 12h16M4 17h16");burger.setAttribute("aria-expanded","false");burger.setAttribute("aria-label","Otwórz menu")}
  burger.addEventListener("click",function(){
    var o=panel.classList.toggle("otwarte");
    burger.setAttribute("aria-expanded",o?"true":"false");
    burger.setAttribute("aria-label",o?"Zamknij menu":"Otwórz menu");
    burger.querySelector("path").setAttribute("d",o?"M6 6l12 12M18 6L6 18":"M4 7h16M4 12h16M4 17h16");
  });
  $$("a",panel).forEach(function(a){a.addEventListener("click",zamknij)});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")zamknij()});

  /* aktywna pozycja menu = bieżąca sekcja */
  var linki=$$(".menu a, .panel a"), sekcje=["dom","okolica","galeria","termin","dojazd"].map(function(id){return document.getElementById(id)});
  function spy(){
    var y=window.scrollY+window.innerHeight*0.35, akt=null;
    sekcje.forEach(function(s){if(s && s.offsetTop<=y) akt=s.id});
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-4) akt="dojazd";
    linki.forEach(function(a){a.classList.toggle("aktywny",akt && a.getAttribute("href")==="#"+akt)});
  }
  window.addEventListener("scroll",spy,{passive:true});spy();

  /* dolny pasek po minięciu przycisku w hero */
  var mob=$("#mob"), cta=$("#hero-cta");
  if(mob && cta && "IntersectionObserver" in window){
    new IntersectionObserver(function(en){
      var poza=!en[0].isIntersecting && en[0].boundingClientRect.top<0;
      var t=document.getElementById("termin").getBoundingClientRect();
      mob.classList.toggle("widac",poza && !(t.top<window.innerHeight && t.bottom>0));
    }).observe(cta);
    window.addEventListener("scroll",function(){
      var t=document.getElementById("termin").getBoundingClientRect();
      var c=cta.getBoundingClientRect();
      mob.classList.toggle("widac",c.bottom<0 && !(t.top<window.innerHeight && t.bottom>0));
    },{passive:true});
  }

  /* karuzele: palec, mysz, strzałki, licznik */
  $$("[data-karuzela]").forEach(function(k){
    var tor=$(".tor",k), el=$$(":scope > *",tor), licz=$(".licznik",k), wstecz=$("[data-kier='-1']",k), dalej=$("[data-kier='1']",k);
    function krok(){var a=el[0],b=el[1];return b? b.offsetLeft-a.offsetLeft : tor.clientWidth}
    function stan(){
      var i=0,best=1e9;
      el.forEach(function(e,n){var d=Math.abs(e.offsetLeft-el[0].offsetLeft-tor.scrollLeft);if(d<best){best=d;i=n}});
      var koniec=tor.scrollLeft+tor.clientWidth>=tor.scrollWidth-4;
      if(koniec) i=el.length-1;
      if(licz) licz.textContent=(i+1)+" / "+el.length;
      wstecz.disabled=tor.scrollLeft<=2; dalej.disabled=koniec;
    }
    [wstecz,dalej].forEach(function(b){b.addEventListener("click",function(){
      tor.scrollBy({left:krok()*Number(b.dataset.kier),behavior:"smooth"});
    })});
    tor.addEventListener("scroll",function(){window.requestAnimationFrame(stan)},{passive:true});
    window.addEventListener("resize",stan);
    tor.addEventListener("keydown",function(e){
      if(e.key==="ArrowRight"){e.preventDefault();dalej.click()}
      if(e.key==="ArrowLeft"){e.preventDefault();wstecz.click()}
    });
    /* przeciąganie myszą */
    var x0=0,s0=0,ciag=false,ruch=0;
    tor.addEventListener("pointerdown",function(e){
      if(e.pointerType!=="mouse"||e.button!==0)return;
      ciag=true;ruch=0;x0=e.clientX;s0=tor.scrollLeft;
    });
    window.addEventListener("pointermove",function(e){
      if(!ciag)return;
      var dx=e.clientX-x0; ruch=Math.max(ruch,Math.abs(dx));
      if(ruch>4){tor.classList.add("ciagniety");tor.scrollLeft=s0-dx}
    });
    window.addEventListener("pointerup",function(){
      if(!ciag)return; ciag=false;
      if(tor.classList.contains("ciagniety")){
        tor.classList.remove("ciagniety");
        var w=krok(), cel=Math.round(tor.scrollLeft/w)*w;
        tor.scrollTo({left:cel,behavior:"smooth"});
      }
    });
    tor.addEventListener("click",function(e){if(ruch>4){e.preventDefault();e.stopPropagation()}},true);
    stan();
  });

  /* powiększenie zdjęć w galerii */
  var lb=$("#lightbox"), lbImg=$("img",lb), lbPod=$(".lb-podpis",lb), fig=$$("#galeria figure"), akt=0, ostatni=null;
  function pokaz(i){
    akt=(i+fig.length)%fig.length;
    var im=$("img",fig[akt]);
    lbImg.src=im.currentSrc.replace("-640.","-1200.");
    lbImg.alt=im.alt;
    lbPod.textContent=im.alt+" · "+$("figcaption",fig[akt]).textContent;
  }
  fig.forEach(function(f,i){$("button.pow",f).addEventListener("click",function(){
    ostatni=this;pokaz(i);lb.classList.add("otwarte");$(".zamknij",lb).focus();
  })});
  function zamknijLb(){lb.classList.remove("otwarte");if(ostatni)ostatni.focus()}
  $(".zamknij",lb).addEventListener("click",zamknijLb);
  $(".lb-prev",lb).addEventListener("click",function(){pokaz(akt-1)});
  $(".lb-next",lb).addEventListener("click",function(){pokaz(akt+1)});
  lb.addEventListener("click",function(e){if(e.target===lb)zamknijLb()});
  document.addEventListener("keydown",function(e){
    if(!lb.classList.contains("otwarte"))return;
    if(e.key==="Escape")zamknijLb();
    if(e.key==="ArrowRight")pokaz(akt+1);
    if(e.key==="ArrowLeft")pokaz(akt-1);
  });
  var tx=null;
  lb.addEventListener("touchstart",function(e){tx=e.touches[0].clientX},{passive:true});
  lb.addEventListener("touchend",function(e){
    if(tx===null)return; var dx=e.changedTouches[0].clientX-tx; tx=null;
    if(Math.abs(dx)>40) pokaz(akt+(dx<0?1:-1));
  });

  /* formularz pokazowy */
  var form=$("form.zapytanie");
  if(form){
    var dzis=new Date().toISOString().slice(0,10);
    $("#f-od").min=dzis; $("#f-do").min=dzis;
    form.addEventListener("submit",function(e){e.preventDefault();$(".komunikat",form).classList.add("widac")});
  }

  /* cookies */
  var KLUCZ="wps-zgody", box=$("#cookies"), mapa=$("#mapa");
  function czytaj(){try{var z=JSON.parse(localStorage.getItem(KLUCZ)||"null");if(z && z.do>Date.now())return z}catch(e){}return null}
  function zapisz(m){var z={mapy:m,do:Date.now()+365*864e5};try{localStorage.setItem(KLUCZ,JSON.stringify(z))}catch(e){}stosuj(z)}
  function stosuj(z){
    if(!mapa)return;
    if(z && !z.mapy){mapa.classList.add("bez-zgody")}
    else{mapa.classList.remove("bez-zgody")}
  }
  var z=czytaj(); stosuj(z);
  if(!z) box.classList.add("widac");
  $$("[data-c]",box).forEach(function(b){b.addEventListener("click",function(){
    var c=b.dataset.c;
    if(c==="wszystkie"){zapisz(true);box.classList.remove("widac","ustawienia")}
    else if(c==="niezbedne"){zapisz(false);box.classList.remove("widac","ustawienia")}
    else if(box.classList.contains("ustawienia")){zapisz($("#c-mapy").checked);box.classList.remove("widac","ustawienia")}
    else{box.classList.add("ustawienia");b.textContent="Zapisz wybór"}
  })});
  $$("[data-cookies-otworz]").forEach(function(b){b.addEventListener("click",function(){
    var z=czytaj(); $("#c-mapy").checked=!z||z.mapy;
    box.classList.add("widac","ustawienia");
    $("[data-c='ustawienia']",box).textContent="Zapisz wybór";
  })});
})();
