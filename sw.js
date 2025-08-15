const CACHE='bite-v4.4.1-mod-organized';
const ASSETS=[
  'index.html',
  'public/manifest.webmanifest',
  'public/bite_app_icon_512.png',
  'style/base.css',
  'style/theme.css',
  'logic/main.js',
  'logic/config.js',
  'logic/utils.js',
  'logic/lunar.js',
  'logic/calculators.js',
  'logic/prevalence.js',
  'logic/scan.js',
  'logic/manual.js',
  'logic/map.js',
  'logic/diag.js',
  'logic/weather/providers.js',
  'data/lake_species.json',
  'data/spots.json'
];

self.addEventListener('install',evt=>{
  evt.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(e=>console.warn('addAll partial',e))));
  self.skipWaiting();
});
self.addEventListener('activate',evt=>evt.waitUntil(self.clients.claim()));
self.addEventListener('fetch',evt=>{
  const url=new URL(evt.request.url);
  if(url.origin===location.origin){
    evt.respondWith(caches.match(evt.request).then(r=>r||fetch(evt.request)));
  }else{
    evt.respondWith(fetch(evt.request).catch(()=>caches.match(evt.request)));
  }
});
