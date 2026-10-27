(() => {
  'use strict';
  const STORAGE = 'jejakrun_web_runs_v1';
  const LIVE_STORAGE = 'jejakrun_web_live_v1';
  const GOAL_STORAGE = 'jejakrun_web_goal_v1';
  const MAX_POINTS = 6000;
  const daysID = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
  const paths = {
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-7h6v7"/>',
    run:'<circle cx="15.5" cy="5" r="2"/><path d="m12 22 3-6-4-3-2 4-5 3m17-7-5-2-3-4-4 3m4-1 2 4 3 3"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    chart:'<path d="M3 3v18h18M7 16l4-5 4 3 5-8"/>',
    target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    shield:'<path d="M12 22c7-3 9-8 9-14l-9-5-9 5c0 6 2 11 9 14Z"/><path d="m9 12 2 2 4-4"/>',
    download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    'arrow-up-right':'<path d="M7 17 17 7M8 7h9v9"/>',
    location:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    route:'<circle cx="6" cy="19" r="2"/><path d="M9 19h7a4 4 0 0 0 0-8H8a4 4 0 0 1 0-8h7"/><circle cx="18" cy="3" r="2"/>',
    shoe:'<path d="m3 14 4 2 3-8 3 5 4 1 4 3v4H3z"/><path d="M10 16h4m2 0h2"/>',
    timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v5l3 2M9 2h6"/>',
    play:'<path d="m8 5 11 7-11 7z"/>',
    pause:'<path d="M8 5v14M16 5v14"/>',
    flag:'<path d="M5 21V4m0 1c7-4 8 4 16 0v11c-8 4-9-4-16 0"/>',
    info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10v.2"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    crosshair:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>',
    lock:'<rect x="4" y="10" width="16" height="12" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    x:'<path d="M18 6 6 18M6 6l12 12"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
    share:'<path d="M12 3v13m-5-8 5-5 5 5M5 13v8h14v-8"/>'
  };
  function icons(root=document) {
    root.querySelectorAll('[data-icon]').forEach(el => {
      const svg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[el.dataset.icon] || paths.info}</svg>`;
      el.outerHTML = svg;
    });
  }
  icons();
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const jsTime = x => new Date(x);
  const safeNum = v => typeof v === 'number' && Number.isFinite(v) ? v : 0;
  const round = (num,dp=2) => Number(safeNum(num).toFixed(dp));
  const km = meters => (safeNum(meters)/1000).toFixed(2);
  const escapeHTML = t => String(t).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function getJSON(key,fallback) {try{const x=JSON.parse(localStorage.getItem(key));return x??fallback;}catch{return fallback;}}
  let runs = getJSON(STORAGE,[]);
  if(!Array.isArray(runs)) runs=[];
  runs = runs.filter(x=>x && typeof x.id==='string' && Number.isFinite(x.distance) && Number.isFinite(x.durationMs));
  let goal=Number(localStorage.getItem(GOAL_STORAGE))||20;
  if(goal < 1 || goal>500) goal=20;
  let session=null;
  let gpsWatcher=null;
  let wakeLock=null;
  let map=null, trackLines=[], trackMarker=null, trackAutoPan=true;
  let detailMap=null, lastSaved=0, pendingInstall=null;
  const savedSession=getJSON(LIVE_STORAGE,null);
  if(savedSession && Array.isArray(savedSession.route) && savedSession.started && Number.isFinite(savedSession.distance) && Number.isFinite(savedSession.elapsedMs)) {
    session={...savedSession,mode:'paused',segmentStarted:null,last:null};
  }
  const pageTitle={beranda:'Beranda',lari:'Mulai Lari',riwayat:'Riwayat',statistik:'Statistik'};
  const ICON=(name)=>`<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.info}</svg>`;
  function toast(msg,type='ok') {
    const n=document.createElement('div');n.className=`toast ${type==='error'?'error':''}`;n.textContent=msg;$('#toast-container').append(n);setTimeout(()=>{n.remove();},5200);
  }
  function saveRuns(){try{localStorage.setItem(STORAGE,JSON.stringify(runs));return true;}catch{toast('Penyimpanan browser penuh. Ekspor data dan kosongkan aktivitas lama.','error');return false;}}
  function saveLive(){try{if(session){const copy={...session,elapsedMs:elapsed(),mode:'paused',segmentStarted:null,last:null};localStorage.setItem(LIVE_STORAGE,JSON.stringify(copy));} else localStorage.removeItem(LIVE_STORAGE);}catch{toast('Gagal menyimpan sesi sementara.','error');}}
  function dateStr(timestamp, opts={day:'numeric',month:'long',year:'numeric'}){return jsTime(timestamp).toLocaleDateString('id-ID',opts);}
  function shortDate(timestamp){return dateStr(timestamp,{day:'numeric',month:'short',year:'numeric'})}
  function duration(ms){const s=Math.max(0,Math.floor(ms/1000));return `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s%3600/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
  function pace(ms,meters){if(meters<20 || ms<=0)return '--:--';const minPerKm=ms/60000/(meters/1000);if(!isFinite(minPerKm)||minPerKm>99.99)return '--:--';const n=Math.round(minPerKm*60);return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
  function elapsed(){return session ? session.elapsedMs + (session.mode==='running'?Math.max(0,Date.now()-session.segmentStarted):0) : 0;}
  function mondayStart(timestamp=Date.now()){const d=new Date(timestamp);const day=(d.getDay()+6)%7;d.setHours(0,0,0,0);d.setDate(d.getDate()-day);return d.getTime();}
  function weekRuns(){const st=mondayStart();return runs.filter(r=>r.started>=st && r.started<=Date.now());}
  function totalDistance(arr){return arr.reduce((s,x)=>s+x.distance,0);}
  function showPage(page){if(!pageTitle[page])page='beranda';$$('.page').forEach(x=>x.classList.toggle('hidden',x.id!==`page-${page}`));$$('[data-page]').forEach(x=>{x.classList.toggle('selected',x.dataset.page===page);x.classList.toggle('active',x.dataset.page===page);});$('#top-page-name').textContent=pageTitle[page];if(page==='beranda')renderHome();if(page==='lari'){renderLive();setTimeout(initLiveMap,40);}if(page==='riwayat')renderHistory();if(page==='statistik')renderStats();window.scrollTo({top:0,behavior:'instant'});if(location.hash!==`#${page}`)history.replaceState(null,'',`#${page}`);}
  $$('[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
  $$('[data-link]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();showPage(b.dataset.link)}));
  $$('[data-action]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.action==='go-run'?'lari':'riwayat')));
  function aggregate(){const total=totalDistance(runs), ms=runs.reduce((s,r)=>s+r.durationMs,0);return {total,ms,week:totalDistance(weekRuns()),count:runs.length,longest:runs.reduce((m,r)=>Math.max(m,r.distance),0)};}
  function chartData(){const arr=[];const now=new Date();now.setHours(0,0,0,0);for(let i=6;i>=0;i--){const day=new Date(now);day.setDate(day.getDate()-i);const next=new Date(day);next.setDate(next.getDate()+1);arr.push({label:daysID[day.getDay()],date:day.getTime(),meters:totalDistance(runs.filter(r=>r.started>=day.getTime()&&r.started<next.getTime()))});}return arr;}
  function makeChart(id){const d=chartData(),max=Math.max(1000,...d.map(x=>x.meters));$(id).innerHTML=d.map((x,i)=>`<div class="chart-col" title="${x.label}: ${km(x.meters)} km"><div class="bar ${i===6?'active':''}" style="height:${Math.max(3,(x.meters/max)*100)}%"><span class="bar-val">${km(x.meters)}</span></div><span>${x.label}</span></div>`).join('');}
  function renderGoal(){const wd=totalDistance(weekRuns());const pct=Math.min(100,100*(wd/1000)/goal);$$('.goal-label').forEach(el=>el.textContent=goal);$('#side-week-km').textContent=(wd/1000).toFixed(1);$('#side-week-progress').style.width=pct+'%';$('#stat-progress').style.width=pct+'%';$('#goal-progress-text').textContent=Math.round(pct)+'%';$('#goal-description').textContent=`${(wd/1000).toFixed(1)} dari ${goal} km minggu ini`;$('#goal-input').value=goal;}
  function emptyActivity(){return `<div class="empty-state">${ICON('shoe')}<strong>Belum ada perjalanan</strong><p>Aktivitas pertamamu akan muncul di sini setelah kamu menyelesaikan lari.</p><button data-empty-start>Mulai lari pertamamu →</button></div>`;}
  function listItem(run){return `<button class="activity-row" data-run-id="${escapeHTML(run.id)}"><span class="activity-icon">${ICON('run')}</span><span class="activity-details"><span class="activity-title">Lari ${escapeHTML(dateStr(run.started,{weekday:'long'}))}</span><span class="activity-sub">${escapeHTML(shortDate(run.started))} · ${duration(run.durationMs)} · ${pace(run.durationMs,run.distance)} /km</span></span><span class="activity-km">${km(run.distance)} km<small>LIHAT DETAIL ↗</small></span></button>`;}
  function wireLists(root){$$('[data-run-id]',root).forEach(el=>el.addEventListener('click',()=>showDetail(el.dataset.runId)));$$('[data-empty-start]',root).forEach(el=>el.addEventListener('click',()=>showPage('lari')));}
  function renderHome(){const a=aggregate();$('#total-km').textContent=km(a.total);$('#total-runs').textContent=a.count;$('#avg-pace').textContent=pace(a.ms,a.total);$('#home-week-total').textContent=km(chartData().reduce((s,x)=>s+x.meters,0))+' km';makeChart('#home-chart');const recent=[...runs].sort((a,b)=>b.started-a.started).slice(0,3);$('#recent-list').innerHTML=recent.length?recent.map(listItem).join(''):emptyActivity();wireLists($('#recent-list'));renderGoal();}
  function renderHistory(){const sorted=[...runs].sort((a,b)=>b.started-a.started);$('#history-count').textContent=sorted.length+' AKTIVITAS';$('#history-list').innerHTML=sorted.length?sorted.map(listItem).join(''):emptyActivity();wireLists($('#history-list'));}
  function renderStats(){const a=aggregate();$('#stat-km').textContent=km(a.total);$('#stat-hours').textContent=`${Math.floor(a.ms/3600000)}j ${Math.floor(a.ms%3600000/60000)}m`;$('#stat-longest').textContent=km(a.longest);$('#stat-count').textContent=a.count;const chart=chartData();$('#stats-week-total').textContent=km(chart.reduce((s,x)=>s+x.meters,0))+' km';makeChart('#stats-chart');renderGoal();}
  $('#save-goal').addEventListener('click',()=>{let v=Number($('#goal-input').value);if(!Number.isFinite(v)||v<1||v>500){toast('Target harus antara 1 sampai 500 km.','error');return;}goal=Math.round(v*10)/10;localStorage.setItem(GOAL_STORAGE,String(goal));renderGoal();toast('Target mingguan berhasil diperbarui.');});
  function status(text,kind='normal'){$('#gps-status').className='gps-status'+(kind==='good'?' good':kind==='bad'?' bad':'');$('#gps-status span:last-child').textContent=text;}
  function renderLive(){const active=!!session,running=active&&session.mode==='running',paused=active&&session.mode==='paused';$('#live-distance').textContent=km(active?session.distance:0);$('#live-time').textContent=duration(elapsed());$('#live-pace').innerHTML=`${pace(elapsed(),active?session.distance:0)} <small>/km</small>`;const speed=active&&session.distance>20&&elapsed()>0?(session.distance/(elapsed()/1000)*3.6):0;$('#live-speed').innerHTML=`${speed.toFixed(1)} <small>km/j</small>`;$('#tracker-clock').textContent=running?'● RECORDING':paused?'II PAUSED':'READY TO RUN';$('#session-state').textContent=running?'● SEDANG LARI':paused?'DIJEDA':'SIAP MULAI';$('#btn-start').classList.toggle('hidden',active);$('#btn-pause').classList.toggle('hidden',!running);$('#btn-resume').classList.toggle('hidden',!paused);$('#btn-finish').classList.toggle('hidden',!active);$('#track-help').innerHTML=running?`${ICON('info')} GPS aktif. Jaga layar tetap menyala agar pengukuran tidak terhenti.`:paused?`${ICON('info')} Sesi dijeda. Lanjutkan atau akhiri untuk menyimpan aktivitas.`:`${ICON('info')} Izinkan akses lokasi saat diminta. Untuk hasil terbaik, gunakan di luar ruangan dengan layar tetap menyala.`;}
  function haversine(a,b){const R=6371000,rad=Math.PI/180,df=(b.lat-a.lat)*rad,dl=(b.lng-a.lng)*rad;const s=Math.sin(df/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dl/2)**2;return 2*R*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));}
  async function lockScreen(){try{if('wakeLock'in navigator && document.visibilityState==='visible')wakeLock=await navigator.wakeLock.request('screen');}catch{} }
  function unlockScreen(){if(wakeLock){wakeLock.release().catch(()=>{});wakeLock=null;}}
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&session?.mode==='running')lockScreen();});
  function gpsError(err){let message='GPS gagal digunakan.';if(err.code===1)message='Izin lokasi ditolak. Aktifkan izin lokasi untuk situs ini di pengaturan browser.';if(err.code===2)message='Lokasi tidak tersedia. Aktifkan GPS dan coba di area terbuka.';if(err.code===3)message='GPS belum memperoleh posisi. Coba tunggu di luar ruangan.';status('GPS belum siap','bad');$('#map-foot-label').textContent=message;toast(message,'error');if(err.code===1 && session?.mode==='running')pauseRun();}
  function onPosition(position){const c=position.coords;const lat=c.latitude,lng=c.longitude,accuracy=c.accuracy;if(!Number.isFinite(lat)||!Number.isFinite(lng))return;$('#gps-accuracy').textContent=accuracy?`±${Math.round(accuracy)} m`:'—';if(accuracy>55){status('Sinyal GPS lemah','bad');$('#map-foot-label').textContent=`GPS ±${Math.round(accuracy)} m — titik diabaikan`;return;}status('GPS aktif · '+Math.round(accuracy)+'m','good');$('#map-foot-label').textContent='GPS terkunci · rute direkam';if(session?.mode!=='running')return;
    const point={lat,lng,time:Number(position.timestamp)||Date.now(),accuracy:Math.round(accuracy),break:!session.last};
    if(session.last){const diff=point.time-session.last.time;const d=haversine(session.last,point);if(diff<=0)return;if(diff>90000){point.break=true;session.last=point;session.route.push(point);updateMap(point);saveLive();return;}
      const threshold=Math.max(5,Math.min(18,(point.accuracy+session.last.accuracy)*.25));if(d<threshold)return;
      if(d/(diff/1000)>8.5){$('#map-foot-label').textContent='Lonjakan GPS diabaikan';return;}
      session.distance+=d;
    }
    if(session.route.length>=MAX_POINTS){toast('Batas titik GPS tercapai. Selesaikan aktivitas ini dan mulai sesi baru.','error');pauseRun();return;}
    session.route.push(point);session.last=point;updateMap(point);renderLive();if(Date.now()-lastSaved>7000){saveLive();lastSaved=Date.now();}
  }
  function stopGps(){if(gpsWatcher!==null){navigator.geolocation.clearWatch(gpsWatcher);gpsWatcher=null;}unlockScreen();}
  function startGps(){if(!navigator.geolocation){status('GPS tidak didukung','bad');toast('Browser ini tidak mendukung GPS. Gunakan Chrome Android.','error');pauseRun();return;}if(!window.isSecureContext){status('HTTPS diperlukan','bad');toast('GPS hanya berjalan melalui HTTPS atau localhost. Hosting web ini di HTTPS.','error');pauseRun();return;}if(gpsWatcher!==null)stopGps();status('Mencari sinyal GPS...');$('#map-foot-label').textContent='Menunggu persetujuan lokasi…';try{gpsWatcher=navigator.geolocation.watchPosition(onPosition,gpsError,{enableHighAccuracy:true,maximumAge:0,timeout:24000});lockScreen();}catch{status('GPS gagal dibuka','bad');toast('Gagal meminta lokasi pada perangkat ini.','error');pauseRun();}}
  function startRun(){if(session){toast('Masih ada sesi berjalan. Selesaikan terlebih dahulu.','error');return;}if(!navigator.geolocation || !window.isSecureContext){toast('GPS web membutuhkan browser dengan HTTPS. Gunakan situs yang sudah dihosting melalui HTTPS.','error');return;}session={id:`jr_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,started:Date.now(),mode:'running',elapsedMs:0,segmentStarted:Date.now(),distance:0,route:[],last:null};trackAutoPan=true;drawRoute();renderLive();saveLive();startGps();toast('Sesi dimulai. Menunggu posisi GPS pertamamu.');}
  function pauseRun(){if(!session||session.mode!=='running')return;session.elapsedMs=elapsed();session.segmentStarted=null;session.mode='paused';session.last=null;stopGps();status('Lari dijeda');$('#map-foot-label').textContent='Lari dijeda';saveLive();renderLive();toast('Sesi dijeda.');}
  function resumeRun(){if(!session||session.mode!=='paused')return;session.mode='running';session.segmentStarted=Date.now();session.last=null;renderLive();saveLive();startGps();}
  function finishRun(){if(!session)return;const ms=elapsed();if(ms<15000 && session.distance<20){if(!confirm('Sesi masih sangat singkat. Akhiri dan buang sesi ini?'))return;discardRun();return;}
    const r={id:session.id,started:session.started,ended:Date.now(),distance:round(session.distance,3),durationMs:ms,route:session.route.map(p=>({lat:p.lat,lng:p.lng,time:p.time,accuracy:p.accuracy,break:!!p.break}))};const old=sortedRunsCount();runs.unshift(r);if(!saveRuns()){runs.shift();toast('Aktivitas tidak tersimpan. Periksa penyimpanan browser.','error');return;}stopGps();session=null;saveLive();drawRoute();renderLive();status('GPS belum aktif');$('#gps-accuracy').textContent='—';$('#map-foot-label').textContent='Aktivitas tersimpan';toast(`Lari tersimpan! ${km(r.distance)} km dalam ${duration(r.durationMs)}.`);showPage('riwayat');}
  function sortedRunsCount(){return runs.length;}
  function discardRun(){stopGps();session=null;saveLive();drawRoute();renderLive();status('GPS belum aktif');$('#gps-accuracy').textContent='—';$('#map-foot-label').textContent='Menunggu GPS';toast('Sesi singkat dibuang.');}
  $('#btn-start').addEventListener('click',startRun);$('#btn-pause').addEventListener('click',pauseRun);$('#btn-resume').addEventListener('click',resumeRun);$('#btn-finish').addEventListener('click',finishRun);
  function initLiveMap(){if(map){map.invalidateSize();drawRoute();return;}if(!window.L){$('#map-error').hidden=false;return;}const el=$('#live-map');if(!el)return;map=L.map(el,{zoomControl:false,scrollWheelZoom:false}).setView([-0.9,100.35],12);L.control.zoom({position:'bottomright'}).addTo(map);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);map.on('dragstart',()=>trackAutoPan=false);drawRoute();setTimeout(()=>map.invalidateSize(),250);}
  function drawRoute(){if(!map)return;trackLines.forEach(line=>map.removeLayer(line));trackLines=[];if(trackMarker){map.removeLayer(trackMarker);trackMarker=null;}const pts=session?.route||[];if(!pts.length){$('#map-empty').classList.remove('hidden');return;}$('#map-empty').classList.add('hidden');const segments=[];let current=[];for(const p of pts){if(p.break&&current.length){segments.push(current);current=[];}current.push([p.lat,p.lng]);}if(current.length)segments.push(current);for(const coords of segments){const line=L.polyline(coords,{color:'#cbf775',weight:5,opacity:.97,lineJoin:'round'}).addTo(map);trackLines.push(line);}const p=pts[pts.length-1];trackMarker=L.circleMarker([p.lat,p.lng],{radius:8,color:'#17261b',weight:3,fillColor:'#d2fa76',fillOpacity:1}).addTo(map);if(trackAutoPan)map.setView([p.lat,p.lng],16,{animate:true});}
  function updateMap(point){if(!map)return;drawRoute();}
  $('#btn-recenter').addEventListener('click',()=>{trackAutoPan=true;const pts=session?.route||[];if(pts.length&&map){const p=pts[pts.length-1];map.setView([p.lat,p.lng],17,{animate:true});}else toast('Mulai lari untuk mendapatkan lokasi GPS.');});
  setInterval(()=>{if(session?.mode==='running'){renderLive();if(Date.now()-lastSaved>7000){saveLive();lastSaved=Date.now();}}},1000);
  function showDetail(id){const r=runs.find(x=>x.id===id);if(!r)return;const modal=$('#modal-root');$('#modal-body').innerHTML=`<div class="eyebrow"><span class="eyebrow-line"></span> YOUR RUN</div><h2 id="modal-title" class="detail-title">Detail lari</h2><div class="detail-date">${escapeHTML(dateStr(r.started,{weekday:'long',day:'numeric',month:'long',year:'numeric'}))} · ${new Date(r.started).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'})}</div><div class="detail-grid"><div><span>JARAK</span><strong>${km(r.distance)} km</strong></div><div><span>DURASI</span><strong>${duration(r.durationMs)}</strong></div><div><span>PACE</span><strong>${pace(r.durationMs,r.distance)}</strong></div></div><div class="detail-route" id="detail-route"></div><div class="detail-actions"><button class="btn btn-outline" id="detail-gpx">${ICON('download')} GPX</button><button class="btn btn-outline" id="detail-share">${ICON('share')} BAGIKAN</button><button class="btn danger-btn" id="detail-delete">${ICON('trash')} HAPUS</button></div>`;
    modal.classList.remove('hidden');document.body.style.overflow='hidden';$('#detail-gpx').onclick=()=>downloadGPX(r);$('#detail-share').onclick=()=>shareRun(r);$('#detail-delete').onclick=()=>{if(!confirm('Hapus riwayat lari ini secara permanen?'))return;runs=runs.filter(x=>x.id!==r.id);saveRuns();closeModal();renderHistory();renderHome();toast('Aktivitas dihapus.');};setTimeout(()=>drawDetailMap(r),100);
  }
  function drawDetailMap(r){const el=$('#detail-route');if(!el)return;if(!window.L||!r.route?.length){el.innerHTML='<div class="detail-no-route">Tidak ada koordinat GPS untuk ditampilkan.</div>';return;}detailMap=L.map(el,{zoomControl:false,attributionControl:true,scrollWheelZoom:false});L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(detailMap);let seg=[],segments=[];for(const p of r.route){if(p.break&&seg.length){segments.push(seg);seg=[];}seg.push([p.lat,p.lng]);}if(seg.length)segments.push(seg);const all=r.route.map(p=>[p.lat,p.lng]);segments.forEach(s=>L.polyline(s,{color:'#cafa6a',weight:5}).addTo(detailMap));L.circleMarker(all[0],{radius:7,color:'#122315',fillColor:'#d2fa76',fillOpacity:1}).addTo(detailMap);L.circleMarker(all[all.length-1],{radius:7,color:'#fff',fillColor:'#263829',fillOpacity:1}).addTo(detailMap);detailMap.fitBounds(L.latLngBounds(all).pad(.2),{maxZoom:17});setTimeout(()=>detailMap?.invalidateSize(),150);}
  function closeModal(){if(detailMap){detailMap.remove();detailMap=null;}$('#modal-root').classList.add('hidden');document.body.style.overflow='';}
  $$('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
  function dl(data,name,type){const blob=new Blob([data],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),3000);}
  function downloadGPX(r){const iso=new Date(r.started).toISOString();const coords=r.route.map(p=>`<trkpt lat="${p.lat.toFixed(7)}" lon="${p.lng.toFixed(7)}"><time>${new Date(p.time).toISOString()}</time></trkpt>`).join('');const gpx=`<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="JejakRun" xmlns="http://www.topografix.com/GPX/1/1"><metadata><name>JejakRun ${iso}</name></metadata><trk><name>JejakRun</name><trkseg>${coords}</trkseg></trk></gpx>`;dl(gpx,`jejakrun-${r.id}.gpx`,'application/gpx+xml');toast('File rute GPX berhasil disiapkan.');}
  async function shareRun(r){const text=`Aku baru saja lari ${km(r.distance)} km dalam ${duration(r.durationMs)} dengan pace ${pace(r.durationMs,r.distance)} /km di JejakRun!`;if(navigator.share){try{await navigator.share({title:'Aktivitas JejakRun',text});return;}catch{}}if(navigator.clipboard&&window.isSecureContext){try{await navigator.clipboard.writeText(text);toast('Ringkasan berhasil disalin.');return;}catch{}}toast(text);}
  $('#export-all').addEventListener('click',()=>{if(!runs.length){toast('Belum ada riwayat yang dapat diekspor.');return;}dl(JSON.stringify({app:'JejakRun',exportedAt:new Date().toISOString(),runs},null,2),'jejakrun-riwayat.json','application/json');toast('Riwayat berhasil diekspor sebagai JSON.');});
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pendingInstall=e;$('#install-btn').hidden=false;});
  $('#install-btn').addEventListener('click',async()=>{if(!pendingInstall){toast('Di Chrome: menu ⋮ → Tambahkan ke layar utama.');return;}pendingInstall.prompt();await pendingInstall.userChoice;pendingInstall=null;$('#install-btn').hidden=true;});
  if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
  window.addEventListener('pagehide',()=>{if(session)saveLive();});
  window.addEventListener('hashchange',()=>{const p=location.hash.slice(1);if(pageTitle[p])showPage(p);});
  const startPage=location.hash.replace('#','');showPage(pageTitle[startPage]?startPage:'beranda');
  if(session){toast('Sesi sebelumnya dipulihkan dalam keadaan jeda. Pilih Lanjutkan untuk melacak GPS lagi.');}
})();
