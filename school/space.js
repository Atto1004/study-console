// The same camera moves through the corridor, classroom and seated learning views.
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text)e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,fn)=>{const e=make('button',text);e.type='button';e.onclick=fn;return e;};
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
  const title=make('b','학교 복도'),action=button('',interact);action.className='world-action';action.hidden=true;
  const sit=button('자리에 앉아 수업 시작',()=>{if(room)app.select(room.name);});sit.className='world-sit';sit.hidden=true;
  const pad=make('div',null,'world-pad');for(const [key,label] of [['w','앞으로'],['a','왼쪽'],['s','뒤로'],['d','오른쪽'],['shift','빨리']]){const b=button(label,()=>{});if(key==='shift')b.className='pad-run';b.onpointerdown=e=>{e.preventDefault();keys.add(key);b.dataset.held='';try{b.setPointerCapture(e.pointerId);}catch{}};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>{keys.delete(key);delete b.dataset.held;};b.oncontextmenu=e=>e.preventDefault();pad.append(b);}
  const reduced={checked:false};try{reduced.checked=localStorage.getItem('school-reduced-motion')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches;}catch{}
  const exit=button('나가기',()=>{hide();app.home();});exit.className='world-exit';exit.title='로비로 돌아가기';
  hud.append(title,action,sit,exit);school.append(hud,pad);
  const controls=make('nav',null,'seat-controls');controls.hidden=true;controls.setAttribute('aria-label','학습 시점');
  controls.append(button('앞의 설명 보기',()=>view('lecture')),button('내 공책 내려다보기',()=>view('notebook')),button('옆의 스앵님께 질문',()=>{view('notebook');app.ask();}),button('교실 도구',()=>tools()),button('자리에서 일어나기',async()=>{await app.pause();walk(room.name);}));document.getElementById('room').prepend(controls);
  let T,scene,camera,renderer,loaded=false,room=null,walking=false,yaw=0,pitch=0,transition=null,last=0,step=0,drag=null,doors3=[],targets=[],colliders=[],lastTarget=null,loadingPromise=null,generation=0,pointerDragged=false;
  const keys=new Set();
  async function load(){
    if(!loadingPromise)loadingPromise=loadScene().catch(e=>{loadingPromise=null;throw e;});
    return loadingPromise;
  }
  async function loadScene(){
    if(loaded)return;
    T=await import('./vendor/three.module.js');
    scene=new T.Scene();scene.background=new T.Color(0xe0e7e3);scene.fog=new T.Fog(0xe0e7e3,23,55);
    camera=new T.PerspectiveCamera(65,innerWidth/innerHeight,.05,100);camera.rotation.order='YXZ';camera.position.set(0,1.65,1);
    renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));layer.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','학교 공간 · 마우스로 시선 이동');
    scene.add(new T.HemisphereLight(0xfff7e6,0x64786b,2.3));const sun=new T.DirectionalLight(0xfff0d8,2.1);sun.position.set(-7,12,5);scene.add(sun);
    build();loaded=true;resize();renderer.setAnimationLoop(frame);
    renderer.domElement.onclick=()=>{if(walking&&!pointerDragged){const request=renderer.domElement.requestPointerLock?.();request?.catch?.(()=>{});}};
    renderer.domElement.onpointerdown=e=>{renderer.domElement.focus();pointerDragged=false;if(walking&&document.pointerLockElement!==renderer.domElement){drag={id:e.pointerId,x:e.clientX,y:e.clientY};try{renderer.domElement.setPointerCapture(e.pointerId);}catch{}}};
    renderer.domElement.onpointermove=e=>{if(!walking)return;if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.0025;pitch=Math.max(-1.1,Math.min(1.1,pitch-e.movementY*.0025));}else if(drag?.id===e.pointerId){if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>2)pointerDragged=true;yaw-=(e.clientX-drag.x)*.005;pitch=Math.max(-1.1,Math.min(1.1,pitch-(e.clientY-drag.y)*.005));drag={id:e.pointerId,x:e.clientX,y:e.clientY};}};
    renderer.domElement.onpointerup=renderer.domElement.onpointercancel=()=>drag=null;renderer.domElement.addEventListener('wheel',e=>{if(!walking)return;e.preventDefault();yaw-=e.deltaX*.004;pitch=Math.max(-1.1,Math.min(1.1,pitch-e.deltaY*.004));},{passive:false});
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();hide();app.status('3D 화면 연결이 끊겼습니다. 학습 화면에서 이어갈 수 있습니다.',true);});
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
      // A recognizable tutor lives beside the board; learning uses the existing portrait.
      new T.TextureLoader().load('../notes/classroom/assets/tutor/neutral.png',texture=>{texture.colorSpace=T.SRGBColorSpace;const teacher=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true}));teacher.position.set(10.25,1.2,r.z+1.6);teacher.scale.set(1.25,2.25,1);r.teacher=teacher;teacher.visible=school.dataset.world!=='seated';scene.add(teacher);});
      props(r);
    }
    box(.18,3.4,2.3,2.4,1.7,-33,0xe7e7de,true);
    for(let z=-2;z>-32;z-=6){box(1.8,.03,.7,0,3.35,z,0xfff6d8);box(.03,1.5,2.6,-2.29,2,z,0xaac9cb);}
  }
  function desk(x,z,r,mine){const m=box(1.55,.12,1.2,x,.82,z,0x9b7955);for(const xx of [-.63,.63])for(const zz of [-.48,.48])box(.06,.78,.06,x+xx,.39,z+zz,0x626c65);box(.1,.7,.55,x-.95,.55,z,0x6a8275);box(.75,.1,.6,x-.7,.44,z,0x6a8275);if(mine){m.userData={kind:'seat',room:r};targets.push(m);box(.65,.025,.88,x,.897,z,0xfffbeb);r.seatSign=sign('내 자리',.85,.22,x-.79,1.02,z,-Math.PI/2);}return m;}
  function props(r){
    if(r.name==='정역학'){box(.25,.25,2.2,9.6,1.12,r.z-1.8,0x66818e);const a=new T.ArrowHelper(new T.Vector3(0,-1,0),new T.Vector3(9.6,2.25,r.z-1.8),.85,0xa44539,.22,.12);scene.add(a);}
    else if(r.name==='CADD'){const m=box(.9,.9,.9,9.7,1.45,r.z-1.8,r.color);m.rotation.y=.5;scene.add(new T.BoxHelper(m,0xf5e8c0));}
    else if(r.name==='일반물리학2'){for(const zz of [-.5,.5])box(.2,1.1,.6,9.7,1.4,r.z-1.8+zz,zz<0?0xa34e46:0x4e7093);}
    else{const points=[];for(let a=-1;a<=1;a+=.05)points.push(new T.Vector3(10.95,1.6+a*a*.5,r.z-1.5+a*.7));scene.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:0xe6cc77})));}
  }
  function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}
  function blocked(x,z){if(x< -2.05||x>10.9||z>1.7||z< -33.6)return true;for(const m of [...colliders,...doors3.filter(r=>!r.open).map(r=>r.door)]){const b=new T.Box3().setFromObject(m);if(x>b.min.x-.22&&x<b.max.x+.22&&z>b.min.z-.22&&z<b.max.z+.22)return true;}return false;}
  function frame(t){const dt=Math.min((t-last)/1000||0,.05);last=t;if(!loaded||layer.hidden||document.hidden)return;
    if(transition){const f=Math.min(1,(t-transition.at)/(reduced.checked?1:700)),a=f*f*(3-2*f);camera.position.lerpVectors(transition.from,transition.to,a);yaw=transition.y0+(transition.y1-transition.y0)*a;pitch=transition.p0+(transition.p1-transition.p0)*a;if(f===1){transition=null;school.classList.remove('view-moving');}}
    else if(walking){let forward=(keys.has('w')?1:0)-(keys.has('s')?1:0),side=(keys.has('d')?1:0)-(keys.has('a')?1:0);const n=Math.hypot(forward,side)||1;forward/=n;side/=n;const speed=2.65*dt*(keys.has('shift')?1.9:1),x=camera.position.x+(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*speed,z=camera.position.z+(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*speed;if(!blocked(x,camera.position.z))camera.position.x=x;if(!blocked(camera.position.x,z))camera.position.z=z;step+=speed*(Math.abs(forward)+Math.abs(side));camera.position.y=1.65+(reduced.checked?0:Math.sin(step*8)*.022*(Math.abs(forward)+Math.abs(side)));}
    camera.rotation.set(pitch,yaw,0,'YXZ');
    if(walking){const ray=new T.Raycaster();ray.setFromCamera(new T.Vector2(0,0),camera);const hit=ray.intersectObjects(targets).find(x=>x.distance<3);lastTarget=hit?.object.userData||null;action.hidden=!lastTarget;if(lastTarget)action.textContent=lastTarget.kind==='door'?`${lastTarget.room.name} 문 ${lastTarget.room.open?'닫기':'열기'} · E`:`${lastTarget.room.name} 내 자리에 앉기 · E`;sit.hidden=!room;}
    renderer.render(scene,camera);
  }
  function move(to,y,p){transition={from:camera.position.clone(),to:new T.Vector3(...to),y0:yaw,y1:y,p0:pitch,p1:p,at:performance.now()};school.classList.add('view-moving');}
  async function walk(name){const token=++generation;try{await app.pause();await load();if(token!==generation)return;layer.hidden=false;school.dataset.world='walking';app.screen?.({world:'walking',subject:name});for(const r of doors3){if(r.teacher)r.teacher.visible=true;if(r.seatSign)r.seatSign.visible=true;}controls.hidden=true;hud.hidden=false;layer.setAttribute('aria-hidden','false');walking=true;keys.clear();document.exitPointerLock?.();room=doors3.find(r=>r.name===name)||null;title.textContent=room?room.name+' 교실':'학교 복도';if(room){openDoor(room,true);move([6.3,1.65,room.z],-Math.PI/2,0);}else move([0,1.65,1],0,0);title.tabIndex=-1;title.focus({preventScroll:true});}catch(e){if(token!==generation)return;app.status('교실 공간을 열지 못했습니다. '+e.message,true);hide();}}
  function openDoor(r,value){r.open=value;r.door.visible=!value;}
  async function enter(name){await load();room=doors3.find(r=>r.name===name);if(!room)return;openDoor(room,true);await walk(name);}
  function interact(){if(!walking||!lastTarget)return;if(lastTarget.kind==='door')openDoor(lastTarget.room,!lastTarget.room.open);else{room=lastTarget.room;app.select(room.name);}}
  async function seated(name,kind='understand',cameraView){const token=++generation;try{await load();if(token!==generation)return;room=doors3.find(r=>r.name===name);if(!room){hide();return;}openDoor(room,true);walking=false;keys.clear();document.exitPointerLock?.();hud.hidden=true;controls.hidden=false;layer.hidden=false;layer.setAttribute('aria-hidden','false');school.dataset.world='seated';for(const r of doors3){if(r.teacher)r.teacher.visible=false;if(r.seatSign)r.seatSign.visible=false;}school.dataset.subject=name;view(['lecture','notebook'].includes(cameraView)?cameraView:kind==='quiz'?'notebook':'lecture');}catch(e){if(token!==generation)return;hide();app.status('3D 표시를 준비하지 못했습니다. 기존 학습 화면에서 계속합니다.',true);}}
  function view(mode){if(!room||walking)return;document.exitPointerLock?.();school.dataset.view=mode;for(const b of controls.querySelectorAll('button'))b.setAttribute('aria-pressed',String(b.textContent===(mode==='lecture'?'앞의 설명 보기':'내 공책 내려다보기')));move([6.7,1.22,room.z],-Math.PI/2,mode==='notebook'?-.65:0);app.view?.(mode);}
  function hide(){++generation;walking=false;keys.clear();document.exitPointerLock?.();layer.hidden=true;layer.setAttribute('aria-hidden','true');hud.hidden=true;controls.hidden=true;delete school.dataset.world;delete school.dataset.view;}
  function tools(){const host=app.panel((room?.name||'과목')+' · 교실 도구');const c=make('canvas');c.width=720;c.height=400;c.className='subject-canvas';host.append(make('p',room?.tools),c);const range=make('input');range.type='range';range.min='-5';range.max='5';range.step='.1';range.value='1';range.setAttribute('aria-label','도형·그래프 매개변수');const readout=make('p');host.append(range,readout);
    const draw=()=>{const ctx=c.getContext('2d'),a=Number(range.value);ctx.clearRect(0,0,720,400);ctx.fillStyle='#fffaf0';ctx.fillRect(0,0,720,400);ctx.strokeStyle='#b7c5bc';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(60,320);ctx.lineTo(670,320);ctx.moveTo(360,30);ctx.lineTo(360,370);ctx.stroke();ctx.strokeStyle='#246455';ctx.lineWidth=3;
      if(room?.name==='정역학'||room?.name==='일반물리학2'){ctx.strokeRect(190,190,310,35);ctx.beginPath();ctx.moveTo(345,195);ctx.lineTo(345+a*35,65);ctx.lineTo(337+a*35,80);ctx.moveTo(345+a*35,65);ctx.lineTo(352+a*35,83);ctx.stroke();ctx.fillStyle='#234a40';ctx.font='20px sans-serif';ctx.fillText('F · 방향을 확인하세요',365,95);ctx.fillText('A',195,260);ctx.fillText('B',490,260);readout.textContent='화살표 기울기 '+a+' · 공책의 펜으로 자유물체도를 그려보세요.';}
      else if(room?.name==='미분적분학2'){ctx.fillStyle='#234a40';ctx.font='28px sans-serif';ctx.fillText('[ '+a.toFixed(1)+'   2 ]',230,160);ctx.fillText('[ 3     4 ]',230,210);ctx.fillText('det A = 4a - 6 = '+(4*a-6).toFixed(1),180,275);readout.textContent='행렬식 ad-bc · 값이 0이면 역행렬을 만들 수 없습니다.';}else if(room?.name==='CADD'){ctx.strokeRect(240,150,150,150);ctx.strokeRect(290+a*5,100,150,150);for(const [x,y] of [[240,150],[390,150],[240,300],[390,300]]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+50+a*5,y-50);ctx.stroke();}readout.textContent='투상 도식 · 실제 CAD 작업 결과는 자료실에서 이어서 확인합니다.';}
      else{ctx.beginPath();for(let x=-3;x<=3;x+=.025){const y=room?.name==='공업수학1'?Math.exp(a*x*.25):a*x*x;const px=360+x*90,py=320-y*35;if(x===-3)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();readout.textContent=room?.name==='공업수학1'?`예시 y′ = ${a/4}y, y(0)=1 · 계수에 따른 해 변화`:`예시 y = ${a}x² · 계수에 따른 그래프 변화`;}
    };range.oninput=draw;draw();
  }
  window.addEventListener('resize',resize);// 한글 입력 상태에서도 같은 자리의 키로 움직이도록 글자(key)가 아니라 키 위치(code)로 읽는다.
  const MOVE={KeyW:'w',ArrowUp:'w',KeyS:'s',ArrowDown:'s',KeyA:'a',ArrowLeft:'a',KeyD:'d',ArrowRight:'d',ShiftLeft:'shift',ShiftRight:'shift'};
  window.addEventListener('keydown',e=>{if(walking&&e.key==='Escape'){document.exitPointerLock?.();keys.clear();return;}if(!walking||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;const k=MOVE[e.code];if(k){keys.add(k);e.preventDefault();}if(e.code==='KeyE'&&!e.repeat){e.preventDefault();interact();}});window.addEventListener('keyup',e=>{const k=MOVE[e.code];if(k)keys.delete(k);});window.addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{if(document.hidden)keys.clear();});
  new MutationObserver(()=>{if(school.dataset.mode!=='classroom'&&!walking)hide();}).observe(school,{attributes:true,attributeFilter:['data-mode']});
  layer.hidden=true;return {walk,enter,seated,view,hide,get mode(){return school.dataset.view;}};
}
