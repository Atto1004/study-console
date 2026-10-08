// The same camera moves through the corridor, classroom and seated learning views.
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,fn)=>{const e=make('button',text);e.type='button';e.onclick=fn;return e;};
const ICON={up:'M12 19V5M5 12l7-7 7 7',down:'M12 5v14M19 12l-7 7-7-7',left:'M19 12H5M12 19l-7-7 7-7',right:'M5 12h14M12 5l7 7-7 7',run:'M7 11l5-5 5 5M7 17l5-5 5 5',exit:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',seat:'M7 3h10v8H7zM5 11h14v3H5zM7 14v7M17 14v7',board:'M3 4h18v12H3zM8 20h8M12 16v4',notebook:'M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z',ask:'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-5.4A8 8 0 1 1 21 12z',tools:'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z',stand:'M12 17V3M6 9l6-6 6 6M5 21h14'};
const iconButton=(icon,label,fn,text)=>{const e=button(undefined,fn);e.classList.add('icon-btn');e.setAttribute('aria-label',label);e.title=label;e.dataset.icon=icon;e.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${ICON[icon]}"/></svg>`;if(text)e.append(make('span',text));return e;};
export const ROOMS=[
  {name:'정역학',color:0x446c78,tools:'자유물체도 · 힘과 모멘트'},
  {name:'미분적분학2',color:0x526b96,tools:'수업자료의 행렬 · 행렬식과 검산'},
  {name:'공업수학1',color:0x687552,tools:'방정식 · 해와 검산'},
  {name:'일반물리학2',color:0x897045,tools:'벡터 · 물리량과 단위'},
  {name:'CADD',color:0x736486,tools:'도면 · 투상과 치수'},
];
export function createSpace(app){
  const school=document.querySelector('.school'),layer=make('div',null,'school-world');layer.id='schoolWorld';layer.setAttribute('aria-hidden','true');school.prepend(layer);
  const hud=make('section',null,'world-hud');hud.hidden=true;hud.setAttribute('aria-label','1인칭 교실 이동');
  // 화면에는 지금 필요한 것만: 교실 이름 · 가까이 갔을 때의 안내 · 앉아서 수업 · 나가기. 이동 버튼은 터치 기기에서만(CSS).
  const title=make('b','학교 복도'),action=button('',()=>ctl?ctl.interact():interact());action.className='world-action';action.hidden=true;
  const sit=iconButton('seat','자리에 앉아 수업 시작',()=>{if(room)app.select(room.name);},'수업 시작');sit.className='world-sit';sit.hidden=true;
  const pad=make('div',null,'world-pad');for(const [key,label,icon] of [['w','앞으로','up'],['a','왼쪽','left'],['d','오른쪽','right'],['s','뒤로','down'],['shift','빨리 (누르고 있기)','run']]){const b=iconButton(icon,label,()=>{});b.classList.add('pad-'+icon);b.onpointerdown=e=>{e.preventDefault();ctl?.hold(key,true);b.dataset.held='';try{b.setPointerCapture(e.pointerId);}catch{}};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>{ctl?.hold(key,false);delete b.dataset.held;};b.oncontextmenu=e=>e.preventDefault();pad.append(b);}
  const reduced={checked:false};try{reduced.checked=localStorage.getItem('school-reduced-motion')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{}
  const exit=iconButton('exit','나가기',()=>{hide();app.home();});exit.classList.add('world-exit');
  hud.append(title,action,sit,exit);school.append(hud,pad);
  const controls=make('nav',null,'seat-controls');controls.hidden=true;controls.setAttribute('aria-label','학습 시점');
  controls.append(iconButton('board','앞의 설명 보기',()=>view('lecture')),iconButton('notebook','내 공책 내려다보기',()=>view('notebook')),iconButton('ask','옆의 스앵님께 질문',()=>{view('notebook');app.ask();}),iconButton('tools','교실 도구',()=>tools()),iconButton('stand','자리에서 일어나기',async()=>{await app.pause();walk(room.name);}));document.getElementById('room').prepend(controls);
  let T,AV,FP,WM,ctl=null,spawnAt=null,leaving=false,avatars=[],scene,camera,renderer,loaded=false,dirty=true,ray=null,aimAt=0,boxes=[],dprMax=1.25,dpr=1.25,dprCheck=0,pendingDpr=false,room=null,walking=false,transition=null,last=0,doors3=[],targets=[],colliders=[],lastTarget=null,loadingPromise=null,generation=0;
  // 겹친 창(설계 v2 계약 B): 이 중 하나라도 열려 있으면 이동·시선·E·착석 방향키·쓸기를 모두 멈춘다.
  const shown=sel=>{const e=document.querySelector(sel);return !!e&&!e.hidden&&e.getClientRects().length>0;};
  // 성능 측정(설계 F): 최근 120프레임의 렌더 시간·프레임 간격·draw call·삼각형. 검사가 window.__worldStats() 로 읽는다.
  const perf={cpu:[],t:[],f:[],calls:0,tris:0,push(rt,dt,info){this.t.push(rt);this.f.push(dt);if(this.t.length>120){this.t.shift();this.f.shift();}this.calls=info.calls;this.tris=info.triangles;}};
  window.__worldStats=()=>{const avg=a=>a.reduce((x,y)=>x+y,0)/(a.length||1);return {cpuMs:+avg(perf.cpu).toFixed(2),renderMs:+avg(perf.t).toFixed(2),fps:+(1/(avg(perf.f)||1)).toFixed(1),calls:perf.calls,tris:perf.tris,meshes:scene?scene.children.length:0,dpr:renderer?.getPixelRatio()};};
  let adaptive=true;try{adaptive=localStorage.getItem('world-adaptive')!=='0';}catch{}
  const overlay=()=>!!document.getElementById('panel')?.open||shown('#chat')||shown('.setup-sheet')||shown('.map-sheet');
  async function load(){
    if(!loadingPromise)loadingPromise=loadScene().catch(e=>{loadingPromise=null;throw e;});
    return loadingPromise;
  }
  async function loadScene(){
    if(loaded)return;
    T=await import('./vendor/three.module.js');AV=await import('./avatar3d.js');FP=await import('./world/fp-controller.js');WM=await import('./world/world-map.js');
    scene=new T.Scene();scene.background=new T.Color(0xe0e7e3);scene.fog=new T.Fog(0xe0e7e3,23,55);
    camera=new T.PerspectiveCamera(65,innerWidth/innerHeight,.02,100);camera.rotation.order='YXZ';camera.position.set(0,1.65,1);scene.add(camera);
    renderer=new T.WebGLRenderer({antialias:true,alpha:false});dprMax=Math.min(devicePixelRatio||1,1.5);dpr=Math.min(dprMax,1.25);renderer.setPixelRatio(dpr);layer.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','학교 공간 · 마우스로 시선 이동');
    scene.add(new T.HemisphereLight(0xfff7e6,0x64786b,2.3));const sun=new T.DirectionalLight(0xfff0d8,2.1);sun.position.set(-7,12,5);scene.add(sun);
    build();boxes=colliders.map(m=>new T.Box3().setFromObject(m));for(const r of doors3)r.box=new T.Box3().setFromObject(r.door);ray=new T.Raycaster();
    loaded=true;resize();renderer.setAnimationLoop(frame);
    window.__schoolPixel=()=>{renderer.render(scene,camera);const gl=renderer.getContext(),px=new Uint8Array(4);gl.readPixels(gl.drawingBufferWidth>>1,gl.drawingBufferHeight>>1,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);return [...px];};   // 검사용 읽기 전용
    window.__schoolCamera=()=>({x:+camera.position.x.toFixed(3),z:+camera.position.z.toFixed(3),yaw:+(ctl?.yaw??0).toFixed(3),mode:ctl?.mode});   // 검사용 읽기 전용
    ctl=FP.createController({T,camera,canvas:renderer.domElement,isOverlay:overlay,blocked,onInteract:interact,reduced:()=>reduced.checked});
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();ctl?.release();hide();app.status('3D 화면 연결이 끊겼습니다. 학습 화면에서 이어갈 수 있습니다.',true);});
  }
  function box(w,h,d,x,y,z,color,solid=false){const m=new T.Mesh(new T.BoxGeometry(w,h,d),new T.MeshStandardMaterial({color,roughness:.85}));m.position.set(x,y,z);scene.add(m);if(solid)colliders.push(m);return m;}
  function sign(text,w,h,x,y,z,rotation=0,bg='#24483e'){
    const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,256);ctx.fillStyle='#fff8e9';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 64px sans-serif';ctx.fillText(text,512,128,960);
    const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture}));m.position.set(x,y,z);m.rotation.y=rotation;scene.add(m);return m;
  }
  function build(){
    box(4.8,.12,36,0,-.06,-16,0xc7bba4);box(.18,3.4,36,-2.4,1.7,-16,0xe7e7de,true);box(4.8,3.4,.2,0,1.7,-34,0xd4d8d0,true);box(4.8,.12,36,0,3.45,-16,0xf4efe3);
    sign('GREENLIGHT 학교',3.3,.7,0,2.4,-33.8);sign('교실은 오른쪽 · 문 앞에서 E',3,.45,0,1.5,-33.8);
    for(let j=0;j<5;j++){
      const r={...ROOMS[j],z:-4-j*6};doors3.push(r);
      box(.18,3.4,4.1,2.4,1.7,r.z+2.95,0xe7e7de,true);
      box(.18,.75,1.9,2.4,3,r.z,0xe7e7de);
      r.door=box(.14,2.55,1.8,2.4,1.275,r.z,r.color);r.door.userData={kind:'door',room:r};targets.push(r.door);
      sign(r.name,2.2,.55,2.29,2.85,r.z,-Math.PI/2);
      box(8.8,.12,5.7,6.9,-.06,r.z,0xc5b49a);box(8.8,.12,5.7,6.9,3.45,r.z,0xf4efe3);
      box(.2,3.4,5.9,11.3,1.7,r.z,0xe7e7de,true);box(8.8,3.4,.15,6.9,1.7,r.z-2.9,0xdedfd5,true);box(8.8,3.4,.15,6.9,1.7,r.z+2.9,0xdedfd5,true);
      for(const zz of [-1.6,1.6]){box(2.2,1.4,.03,7.1,2,r.z+zz*1.8,0xa1c4cc);}
      box(.16,1.65,4.1,11.12,2.02,r.z,0x274c41);
      sign(r.name,3.4,.55,11.02,2.5,r.z,-Math.PI/2);sign(r.tools,3.5,.38,11.01,1.95,r.z,-Math.PI/2);
      for(const x of [5.1,7.5])for(const zz of [-1.55,1.55])desk(x,r.z+zz,r,false);
      r.desk=desk(8.1,r.z,r,true);
      // The tutor is the shared 3D avatar, standing beside the board and facing the desks.
      {const teacher=AV.createAvatar(T,'saeng');teacher.group.position.set(10.1,0,r.z+1.6);teacher.group.rotation.y=-Math.PI/2;teacher.group.visible=school.dataset.world!=='seated';scene.add(teacher.group);avatars.push(teacher);r.teacher=teacher.group;}
      props(r);
    }
    box(.18,3.4,2.3,2.4,1.7,-33,0xe7e7de,true);
    WM.buildHallway({T,box,sign,targets,colliders});   // 2단계: 대표실로 가는 연결 복도
    for(let z=-2;z>-32;z-=6){box(1.8,.03,.7,0,3.35,z,0xfff6d8);box(.03,1.5,2.6,-2.29,2,z,0xaac9cb);}
  }
  function desk(x,z,r,mine){const m=box(1.55,.12,1.2,x,.82,z,0x9b7955);for(const xx of [-.63,.63])for(const zz of [-.48,.48])box(.06,.78,.06,x+xx,.39,z+zz,0x626c65);box(.1,.7,.55,x-.95,.55,z,0x6a8275);box(.75,.1,.6,x-.7,.44,z,0x6a8275);if(mine){m.userData={kind:'seat',room:r};targets.push(m);box(.65,.025,.88,x,.897,z,0xfffbeb);r.seatSign=sign('내 자리',.85,.22,x-.79,1.02,z,-Math.PI/2);}return m;}
  function props(r){
    if(r.name==='정역학'){box(.25,.25,2.2,9.6,1.12,r.z-1.8,0x66818e);const a=new T.ArrowHelper(new T.Vector3(0,-1,0),new T.Vector3(9.6,2.25,r.z-1.8),.85,0xa44539,.22,.12);scene.add(a);}
    else if(r.name==='CADD'){const m=box(.9,.9,.9,9.7,1.45,r.z-1.8,r.color);m.rotation.y=.5;scene.add(new T.BoxHelper(m,0xf5e8c0));}
    else if(r.name==='일반물리학2'){for(const zz of [-.5,.5])box(.2,1.1,.6,9.7,1.4,r.z-1.8+zz,zz<0?0xa34e46:0x4e7093);}
    else{const points=[];for(let a=-1;a<=1;a+=.05)points.push(new T.Vector3(10.95,1.6+a*a*.5,r.z-1.5+a*.7));scene.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xe6cc77})));}
  }
  function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();dirty=true;}
  const hitBox=(b,x,z)=>x>b.min.x-.22&&x<b.max.x+.22&&z>b.min.z-.22&&z<b.max.z+.22;
  function blocked(x,z){const B=WM.BOUNDS;if(x<B.minX||x>B.maxX||z>B.maxZ||z<B.minZ)return true;for(const b of boxes)if(hitBox(b,x,z))return true;for(const r of doors3)if(!r.open&&hitBox(r.box,x,z))return true;return false;}
  function frame(t){const dt=Math.min((t-last)/1000||0,.05);last=t;if(!loaded||layer.hidden||document.hidden)return;const c0=performance.now();if(pendingDpr){pendingDpr=false;renderer.setPixelRatio(dpr);renderer.setSize(innerWidth,innerHeight);dirty=true;}
    if(transition){const f=Math.min(1,(t-transition.at)/(reduced.checked?1:700)),a=f*f*(3-2*f);camera.position.lerpVectors(transition.from,transition.to,a);ctl.yaw=transition.y0+(transition.y1-transition.y0)*a;ctl.pitch=transition.p0+(transition.p1-transition.p0)*a;if(f===1){transition=null;school.classList.remove('view-moving');}}
    else if(walking){ctl.update(dt);if(spawnAt&&Math.hypot(camera.position.x-spawnAt.x,camera.position.z-spawnAt.z)>=WM.GATE.armAfter)spawnAt=null;if(!spawnAt&&!leaving&&!overlay()&&WM.inGate(camera.position.x,camera.position.z))goOffice();}
    // 착석 중에는 3D 가 공부 화면 뒤에 가만히 있다: 시점이 바뀔 때만 그린다(펜·화면이 덜 버벅이게).
    if(!walking&&!transition&&!dirty)return;
    ctl.arms.visible=walking&&!transition;ctl.apply();
    // 스앵님은 플레이어가 있는 교실 근처(9m 안)에서만 보이고 움직인다.
    for(const r of doors3){if(!r.teacher)continue;const near=walking&&Math.abs(camera.position.z-r.z)<9&&camera.position.x>2;r.teacher.visible=near;}
    for(const a of avatars)if(a.group.visible)a.update(dt);
    if(walking&&!overlay()&&t-aimAt>100){aimAt=t;ray.setFromCamera(new T.Vector2(0,0),camera);const hit=ray.intersectObjects(targets).find(x=>x.distance<3);lastTarget=hit?.object.userData||null;action.hidden=!lastTarget;if(lastTarget)action.textContent=lastTarget.kind==='gate'?'대표실로 · E':lastTarget.kind==='door'?`${lastTarget.room.name} 문 ${lastTarget.room.open?'닫기':'열기'} · E`:`${lastTarget.room.name} 내 자리에 앉기 · E`;sit.hidden=!room;}
    const r0=performance.now();perf.cpu.push(r0-c0);if(perf.cpu.length>120)perf.cpu.shift();renderer.render(scene,camera);perf.push(performance.now()-r0,dt,renderer.info.render);dirty=false;
    // 해상도 자동 조절: 걷는 동안 2초마다 fps 를 보고 45 미만이면 한 단계 내리고, 58 넘게 넉넉하면 올린다.
    if(adaptive&&walking&&t-dprCheck>2000&&perf.f.length>=60){dprCheck=t;const fps=1/(perf.f.reduce((x,y)=>x+y,0)/perf.f.length);let next=dpr;if(fps<45){next=Math.max(1,dpr-.25);dprMax=Math.min(dprMax,next);}else if(fps>58)next=Math.min(dprMax,dpr+.25);if(next!==dpr){dpr=next;pendingDpr=true;}}   // 한 번이라도 내렸으면 이번 접속 동안 그 위로는 안 올린다(진동 방지, 오타 10/8)
  }
  function move(to,y,p){dirty=true;transition={from:camera.position.clone(),to:new T.Vector3(...to),y0:ctl.yaw,y1:y,p0:ctl.pitch,p1:p,at:performance.now()};school.classList.add('view-moving');}
  async function walk(name,opts={}){const token=++generation;try{await app.pause();await load();if(token!==generation)return;layer.hidden=false;school.dataset.world='walking';app.screen?.({world:'walking',subject:name});for(const r of doors3){if(r.teacher)r.teacher.visible=true;if(r.seatSign)r.seatSign.visible=true;}controls.hidden=true;hud.hidden=false;layer.setAttribute('aria-hidden','false');walking=true;ctl.setMode('walking');room=doors3.find(r=>r.name===name)||null;title.textContent=room?room.name+' 교실':'학교 복도';leaving=false;if(room){spawnAt=null;openDoor(room,true);move([6.3,1.65,room.z],-Math.PI/2,0);}else{const sp=WM.spawnOf(opts.spawn);spawnAt={x:sp.x,z:sp.z};if(opts.spawn){camera.position.set(sp.x,1.65,sp.z);ctl.yaw=sp.yaw;ctl.pitch=0;title.textContent='대표실 가는 복도';}else move([sp.x,1.65,sp.z],sp.yaw,0);}title.tabIndex=-1;title.focus({preventScroll:true});}catch(e){if(token!==generation)return;app.status('교실 공간을 열지 못했습니다. '+e.message,true);hide();}}
  async function goOffice(){if(leaving)return;leaving=true;ctl.release();let ok=false;try{ok=await app.leaveTo?.('/kingdom/');}catch{}if(!ok){leaving=false;spawnAt={x:camera.position.x,z:camera.position.z};}}   // 실패하면 1m 벗어났다 와야 다시 시도(문 앞 반복 방지)
  function openDoor(r,value){r.open=value;r.door.visible=!value;}
  async function enter(name){await load();room=doors3.find(r=>r.name===name);if(!room)return;openDoor(room,true);await walk(name);}
  function interact(){if(!walking||!lastTarget||overlay())return;if(lastTarget.kind==='gate'){goOffice();return;}if(lastTarget.kind==='door')openDoor(lastTarget.room,!lastTarget.room.open);else{room=lastTarget.room;app.select(room.name);}}
  async function seated(name,kind='understand',cameraView){const token=++generation;try{await load();if(token!==generation)return;room=doors3.find(r=>r.name===name);if(!room){hide();return;}openDoor(room,true);walking=false;ctl.setMode('seated');hud.hidden=true;controls.hidden=false;layer.hidden=false;layer.setAttribute('aria-hidden','false');school.dataset.world='seated';for(const r of doors3){if(r.teacher)r.teacher.visible=false;if(r.seatSign)r.seatSign.visible=false;}school.dataset.subject=name;view(['lecture','notebook'].includes(cameraView)?cameraView:kind==='quiz'?'notebook':'lecture');}catch(e){if(token!==generation)return;hide();app.status('3D 표시를 준비하지 못했습니다. 기존 학습 화면에서 계속합니다.',true);}}
  function view(mode){if(!room||walking)return;mode=app.fixedView?.()||mode;document.exitPointerLock?.();school.dataset.view=mode;for(const b of controls.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.dataset.icon===(mode==='lecture'?'board':'notebook')));move([6.7,1.22,room.z],-Math.PI/2,mode==='notebook'?-.65:mode==='paper'?-.2:0);app.view?.(mode);}
  function hide(){++generation;walking=false;ctl?.setMode('hidden');layer.hidden=true;layer.setAttribute('aria-hidden','true');hud.hidden=true;controls.hidden=true;delete school.dataset.world;delete school.dataset.view;}
  function tools(){const host=app.panel((room?.name||'과목')+' · 교실 도구');const c=make('canvas');c.width=720;c.height=400;c.className='subject-canvas';host.append(make('p',room?.tools),c);const range=make('input');range.type='range';range.min='-5';range.max='5';range.step='.1';range.value='1';range.setAttribute('aria-label','도형·그래프 매개변수');const readout=make('p');host.append(range,readout);
    const draw=()=>{const ctx=c.getContext('2d'),a=Number(range.value);ctx.clearRect(0,0,720,400);ctx.fillStyle='#fffaf0';ctx.fillRect(0,0,720,400);ctx.strokeStyle='#b7c5bc';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(60,320);ctx.lineTo(670,320);ctx.moveTo(360,30);ctx.lineTo(360,370);ctx.stroke();ctx.strokeStyle='#246455';ctx.lineWidth=3;
      if(room?.name==='정역학'||room?.name==='일반물리학2'){ctx.strokeRect(190,190,310,35);ctx.beginPath();ctx.moveTo(345,195);ctx.lineTo(345+a*35,65);ctx.lineTo(337+a*35,80);ctx.moveTo(345+a*35,65);ctx.lineTo(352+a*35,83);ctx.stroke();ctx.fillStyle='#234a40';ctx.font='20px sans-serif';ctx.fillText('F · 방향을 확인하세요',365,95);ctx.fillText('A',195,260);ctx.fillText('B',490,260);readout.textContent='화살표 기울기 '+a+' · 공책의 펜으로 자유물체도를 그려보세요.';}
      else if(room?.name==='미분적분학2'){ctx.fillStyle='#234a40';ctx.font='28px sans-serif';ctx.fillText('[ '+a.toFixed(1)+'   2 ]',230,160);ctx.fillText('[ 3     4 ]',230,210);ctx.fillText('det A = 4a - 6 = '+(4*a-6).toFixed(1),180,275);readout.textContent='행렬식 ad-bc · 값이 0이면 역행렬을 만들 수 없습니다.';}else if(room?.name==='CADD'){ctx.strokeRect(240,150,150,150);ctx.strokeRect(290+a*5,100,150,150);for(const [x,y] of [[240,150],[390,150],[240,300],[390,300]]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+50+a*5,y-50);ctx.stroke();}readout.textContent='투상 도식 · 실제 CAD 작업 결과는 자료실에서 이어서 확인합니다.';}
      else{ctx.beginPath();for(let x=-3;x<=3;x+=.025){const y=room?.name==='공업수학1'?Math.exp(a*x*.25):a*x*x;const px=360+x*90,py=320-y*35;if(x===-3)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();readout.textContent=room?.name==='공업수학1'?`예시 y′ = ${a/4}y, y(0)=1 · 계수에 따른 해 변화`:`예시 y = ${a}x² · 계수에 따른 그래프 변화`;}
    };range.oninput=draw;draw();
  }
  window.addEventListener('resize',resize);
  // 고개 동작(아이패드만 쓸 때): ↑ 칠판 보기 · ↓ 책상 내려다보기, 칠판을 위로 쓸면 책상, 위쪽 칠판 띠를 아래로 쓸면 칠판.
  window.addEventListener('keydown',e=>{if(school.dataset.world!=='seated'||walking||overlay()||app.fixedView?.()||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||e.target.isContentEditable)return;if(e.key==='ArrowUp'){e.preventDefault();view('lecture');}else if(e.key==='ArrowDown'){e.preventDefault();view('notebook');}});
  // 스크롤은 막지 않는다: 끝까지 내린 칠판에서 위로 쓸면 책상, 맨 위인 칠판 띠에서 아래로 쓸면 칠판.
  {let swipe=null;const board=document.getElementById('board');
   board.addEventListener('touchstart',e=>{if(school.dataset.world!=='seated'||overlay()||app.fixedView?.()||e.touches.length!==1){swipe=null;return;}const t=e.touches[0];swipe={x:t.clientX,y:t.clientY,top:board.scrollTop<=1,bottom:board.scrollTop+board.clientHeight>=board.scrollHeight-2};},{passive:true});
   board.addEventListener('touchend',e=>{if(!swipe)return;
    // 끝날 때도 다시 본다(오타 10/8): 쓸던 중 창이 열렸거나 착석·시점 고정·입력 포커스가 바뀌었으면 이 쓸기는 버린다.
    if(overlay()||school.dataset.world!=='seated'||walking||app.fixedView?.()||FP?.typingTarget?.(document.activeElement)){swipe=null;return;}const t=e.changedTouches[0],dy=t.clientY-swipe.y,dx=t.clientX-swipe.x,s0=swipe;swipe=null;if(Math.abs(dy)<60||Math.abs(dy)<Math.abs(dx)*1.5)return;if(dy<0&&s0.bottom&&school.dataset.view==='lecture')view('notebook');else if(dy>0&&s0.top&&school.dataset.view==='notebook')view('lecture');},{passive:true});
   board.addEventListener('touchcancel',()=>swipe=null);}
  new MutationObserver(()=>{if(school.dataset.mode!=='classroom'&&!walking)hide();}).observe(school,{attributes:true,attributeFilter:['data-mode']});
  layer.hidden=true;return {walk,enter,seated,view,hide,refresh:()=>{if(school.dataset.world==='seated'){const v=school.dataset.view;view(v==='notebook'?'notebook':'lecture');}},get mode(){return school.dataset.view;}};
}
