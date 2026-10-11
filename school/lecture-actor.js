// Alternate cutout poses keep the original portrait available outside the classroom.
const NS='http://www.w3.org/2000/svg';
const shape=(tag,attrs)=>{const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs||{}))e.setAttribute(k,String(v));return e;};
export async function mountLectureActor(host, guide) {
  if (!host || !guide) return;
  const poses=['point','explain','listen'], images=poses.map(p=>'./assets/saeng-lecture/v1/'+p+'.png');
  const loaded=await Promise.all(images.map(src=>new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(true);i.onerror=()=>resolve(false);i.src=src;})));
  if (loaded.some(ok=>!ok) || !host.isConnected) return;
  const actor=document.createElement('div');actor.className='lecture-actor';actor.setAttribute('role','img');actor.setAttribute('aria-label','김주영 스앵님');
  poses.forEach((pose,i)=>{
    const svg=shape('svg',{viewBox:'0 0 1088 1445','data-pose':pose,'aria-hidden':'true'});
    const image=()=>shape('image',{href:images[i],width:1088,height:1445});
    if(pose==='listen'){svg.append(image());actor.append(svg);return;}
    const defs=shape('defs'),path='M0 440 H340 L455 565 L477 806 L403 1028 H0 Z';
    const clip=shape('clipPath',{id:'actor-arm-'+pose});clip.append(shape('path',{d:path}));
    const mask=shape('mask',{id:'actor-body-'+pose,maskUnits:'userSpaceOnUse',x:0,y:0,width:1088,height:1445});
    mask.append(shape('rect',{width:1088,height:1445,fill:'white'}),shape('path',{d:path,fill:'black'}));defs.append(clip,mask);
    const arm=shape('g',{class:'lecture-arm'}),cutout=shape('g',{'clip-path':'url(#actor-arm-'+pose+')'});cutout.append(image());arm.append(cutout);
    const body=image();body.setAttribute('mask','url(#actor-body-'+pose+')');svg.append(defs,arm,body);actor.append(svg);
  });
  host.append(actor);host.classList.add('has-lecture-actor');
}
