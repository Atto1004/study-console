// A single room keeps the same geometry and tutor while its subject changes.
export function buildClassroom({T,AV,scene,box,sign,targets,avatars,ROOMS}) {
  const r={...ROOMS[0],z:-4};
  const accents=[];
  r.door=box(.14,2.55,1.8,2.4,1.275,r.z,r.color);
  r.door.userData={kind:'door',room:r};targets.push(r.door);
  sign('강의실',2.2,.55,2.29,2.85,r.z,-Math.PI/2);
  box(8.8,.12,5.7,6.9,-.06,r.z,0xc5b49a);
  box(8.8,.12,5.7,6.9,3.45,r.z,0xf4efe3);
  accents.push(box(.2,3.4,5.9,11.3,1.7,r.z,r.color,true));
  box(8.8,3.4,.15,6.9,1.7,r.z-2.9,0xdedfd5,true);
  box(8.8,3.4,.15,6.9,1.7,r.z+2.9,0xdedfd5,true);
  for(const zz of [-1,1])box(2.2,1.4,.03,7.1,2,r.z+zz*2.8,0xa1c4cc);
  // The title sits above the content face, leaving the complete rectangle free.
  box(.16,2.05,5.2,11.12,1.9,r.z,0x8f795e);
  r.board=new T.Mesh(new T.PlaneGeometry(5,1.9),new T.MeshStandardMaterial({color:0x274c41,roughness:.95}));
  r.board.position.set(11.025,1.9,r.z);r.board.rotation.y=-Math.PI/2;scene.add(r.board);
  r.subjectSign=sign(r.name,4,.35,11.02,3.13,r.z,-Math.PI/2);
  r.boardCorners=[new T.Vector3(11.025,2.85,r.z-2.5),new T.Vector3(11.025,2.85,r.z+2.5),new T.Vector3(11.025,.95,r.z+2.5),new T.Vector3(11.025,.95,r.z-2.5)];
  r.desk=box(1.55,.12,1.2,8.1,.82,r.z,0x9b7955);
  r.desk.userData={kind:'seat',room:r};targets.push(r.desk);
  for(const xx of [-.63,.63])for(const zz of [-.48,.48])box(.06,.78,.06,8.1+xx,.39,r.z+zz,0x626c65);
  box(.1,.7,.55,7.15,.55,r.z,0x6a8275);box(.75,.1,.6,7.4,.44,r.z,0x6a8275);
  r.notebook=box(.88,.025,.65,8.1,.897,r.z,0xfffbeb);
  r.deskCorners=[new T.Vector3(7.66,.9095,r.z-.325),new T.Vector3(8.54,.9095,r.z-.325),new T.Vector3(8.54,.9095,r.z+.325),new T.Vector3(7.66,.9095,r.z+.325)];
  r.seatSign=sign('내 자리',.85,.22,7.31,1.02,r.z,-Math.PI/2);
  const teacher=AV.createAvatar(T,'saeng');teacher.group.position.set(10.1,0,r.z+2.1);teacher.group.rotation.y=-Math.PI/2;scene.add(teacher.group);avatars.push(teacher);r.teacher=teacher.group;r.teacherAvatar=teacher;
  // Reuse subject props instead of allocating geometry on every selection.
  const props=ROOMS.map((subject,index)=>{
    const group=new T.Group();scene.add(group);
    const material=new T.MeshStandardMaterial({color:subject.color,roughness:.7});
    const add=(geometry,x,y,z)=>{const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);group.add(mesh);return mesh;};
    if(index===0){add(new T.BoxGeometry(.18,.18,1.2),9.65,.95,r.z-2.2);group.add(new T.ArrowHelper(new T.Vector3(0,-1,0),new T.Vector3(9.65,2,r.z-2.2),.8,0xa44539,.2,.1));}
    else if(index===4){const cube=add(new T.BoxGeometry(.65,.65,.65),9.65,1.12,r.z-2.2);cube.rotation.y=.5;group.add(new T.BoxHelper(cube,0xf5e8c0));}
    else if(index===3){add(new T.BoxGeometry(.15,.8,.3),9.65,1.2,r.z-2.45);add(new T.BoxGeometry(.15,.8,.3),9.65,1.2,r.z-1.95);}
    else{const points=[];for(let a=-1;a<=1;a+=.05)points.push(new T.Vector3(9.65,1+a*a*.6,r.z-2.2+a*.45));group.add(new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:subject.color})));}
    group.visible=false;return group;
  });
  r.setSubject=name=>{
    const index=ROOMS.findIndex(subject=>subject.name===name);if(index<0)return false;
    const subject=ROOMS[index];r.name=subject.name;r.color=subject.color;r.tools=subject.tools;
    r.door.material.color.setHex(r.color);for(const mesh of accents)mesh.material.color.setHex(r.color);
    const texture=r.subjectSign.material.map,canvas=texture.image,ctx=canvas.getContext('2d');
    ctx.fillStyle='#24483e';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#fff8e9';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 64px sans-serif';ctx.fillText(r.name,canvas.width/2,canvas.height/2,canvas.width-64);texture.needsUpdate=true;
    props.forEach((group,i)=>group.visible=i===index);return true;
  };
  r.setSubject(r.name);return r;
}
