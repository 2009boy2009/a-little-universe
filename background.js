// Live procedural WebGL scenery: no wallpaper, no flat CSS landscape.
(()=>{const c=document.getElementById("scene");if(!c)return;const g=c.getContext("webgl",{alpha:false,antialias:false,powerPreference:"high-performance"});if(!g){document.body.classList.add("webgl-fallback");return;}
const vs=`attribute vec2 position;varying vec2 uv;void main(){uv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;
const fs=`
precision highp float;
varying vec2 uv;
uniform vec2 resolution;
uniform float time;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<6;i++){v+=a*noise(p);p=m*p;a*=.52;}return v;}
void main(){
 vec2 p=uv;float asp=resolution.x/resolution.y;vec2 q=vec2((p.x-.5)*asp,p.y);
 vec3 c=mix(vec3(.018,.014,.065),vec3(.17,.045,.27),smoothstep(0.,.9,p.y));
 float axis=q.x*.62+q.y*.27;float band=exp(-pow(axis-.05,2.)/.012);
 float gn=fbm(vec2(q.x*5.+q.y,q.y*7.+time*.001));
 c+=vec3(.42,.09,.58)*band*(.2+gn*.65);
 c+=vec3(.92,.18,.66)*band*pow(gn,2.)*.55;
 vec2 sc=p*resolution/2.4;vec2 cell=floor(sc),loc=fract(sc)-.5;float h=hash(cell);
 float d=length(loc-(vec2(hash(cell+3.1),hash(cell+8.7))-.5)*.72);
 float star=smoothstep(.035,0.,d)*step(.82,h);
 c+=vec3(.85,.75,1.)*star*(.55+.45*sin(time*(1.+hash(cell+4.))*1.8+h*30.));
 for(int i=0;i<3;i++){float f=float(i);float cyc=mod(time*.055+f*.37,1.7);vec2 head=vec2(.12+hash(vec2(f,9.))*.8,.48+hash(vec2(f,2.))*.42)-vec2(cyc*.78,cyc*.42);vec2 z=p-head;float streak=exp(-pow(z.x*.86+z.y*.5,2.)*18000.)*smoothstep(1.7,.9,cyc)*step(.88,hash(vec2(f,4.)));c+=vec3(1.,.6,.92)*streak*.8;}
 vec2 md=(p-vec2(.805,.825))*vec2(asp,1.);float r=length(md);
 c+=vec3(1.,.35,.73)*exp(-r*r*125.)*.5;
 float disk=1.-smoothstep(.048,.052,r);float cut=1.-smoothstep(.046,.05,length(md-vec2(.021,.012)));
 float moon=disk*(1.-cut);c=mix(c,vec3(1.,.79,.84),moon);
 float ridge=.235+fbm(vec2(p.x*5.5,2.3))*.105+.02*sin(p.x*17.);
 float ridge2=.19+fbm(vec2(p.x*9.,5.))*.055;
 c=mix(c,vec3(.16,.075,.25),1.-smoothstep(ridge-.004,ridge+.006,p.y));
 c=mix(c,vec3(.045,.027,.105),1.-smoothstep(ridge2-.004,ridge2+.006,p.y));
 vec2 cp=vec2(p.x*3.1+time*.006,p.y*5.8-time*.003);
 float cloudN=fbm(cp)*.72+fbm(cp*2.6+vec2(time*.008,-time*.004))*.28;
 float env=smoothstep(.27,.39,p.y)*(1.-smoothstep(.68,.83,p.y));
 float cloud=smoothstep(.39,.69,cloudN)*env;
 vec3 cloudCol=mix(vec3(.24,.095,.39),vec3(1.,.43,.72),smoothstep(.38,.78,cloudN));
 c=mix(c,cloudCol,cloud*.8);
 float water=1.-smoothstep(.275,.29,p.y);float depth=1.-p.y/.29;
 float ripple=sin(p.y*330.+sin(p.x*27.+time*.8)*2.2+time*1.6);
 float refl=exp(-pow((p.x-.51)*5.2,2.))*exp(-depth*5.2);
 vec3 wc=mix(vec3(.12,.045,.24),vec3(.38,.105,.36),depth*.65);
 wc+=vec3(.8,.25,.56)*max(0.,ripple*.5+.5)*refl*.34;
 wc+=vec3(.32,.19,.54)*max(0.,sin(p.y*175.-p.x*19.+time*.55))*.055;
 c=mix(c,wc,water);
 c+=vec3(.46,.12,.39)*exp(-pow((p.y-.30)*12.,2.))*exp(-pow((p.x-.5)*2.8,2.))*.22;
 float vig=smoothstep(1.1,.18,length((p-.5)*vec2(asp,1.)));c*=.76+.24*vig;
 gl_FragColor=vec4(pow(max(c,0.),vec3(.92)),1.);
}
`;
function compile(t,s){const x=g.createShader(t);g.shaderSource(x,s);g.compileShader(x);if(!g.getShaderParameter(x,g.COMPILE_STATUS)){console.error(g.getShaderInfoLog(x));return null;}return x;}
const a=compile(g.VERTEX_SHADER,vs),b=compile(g.FRAGMENT_SHADER,fs);if(!a||!b)return;
const pr=g.createProgram();g.attachShader(pr,a);g.attachShader(pr,b);g.linkProgram(pr);if(!g.getProgramParameter(pr,g.LINK_STATUS))return;g.useProgram(pr);
const buf=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,buf);g.bufferData(g.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),g.STATIC_DRAW);
const pos=g.getAttribLocation(pr,"position");g.enableVertexAttribArray(pos);g.vertexAttribPointer(pos,2,g.FLOAT,false,0,0);
const res=g.getUniformLocation(pr,"resolution"),clock=g.getUniformLocation(pr,"time");let start=performance.now();
function size(){let d=Math.min(devicePixelRatio||1,1.5);c.width=innerWidth*d;c.height=innerHeight*d;c.style.width="100%";c.style.height="100%";g.viewport(0,0,c.width,c.height);g.uniform2f(res,c.width,c.height);}
function draw(t){requestAnimationFrame(draw);if(document.hidden)return;g.uniform1f(clock,(t-start)/1000);g.drawArrays(g.TRIANGLE_STRIP,0,4);}
addEventListener("resize",size,{passive:true});size();draw(start);
})();