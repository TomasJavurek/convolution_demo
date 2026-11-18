'use strict';
const N=28, CELL=20;
const $=id=>document.getElementById(id);
const input=$('inputCanvas'), output=$('outputCanvas');
let image=Array.from({length:N},()=>Array(N).fill(0));
let size=3, weights=[], values=[], selected={row:13,col:13}, drawing=false;

function example(){
  // A little house provides strong lines and filled areas to explore.
  image=Array.from({length:N},(_,r)=>Array.from({length:N},(_,c)=>{
    const roof=r>=4&&r<=12&&Math.abs(c-13.5)<=r-4;
    const walls=r>=12&&r<=23&&c>=6&&c<=21;
    const door=r>=17&&r<=23&&c>=12&&c<=15;
    const window=r>=14&&r<=17&&((c>=8&&c<=10)||(c>=17&&c<=19));
    return (roof||walls)&&!door&&!window ? .86 : 0;
  }));
  update();
}
function preset(name){
  weights=Array.from({length:size},()=>Array(size).fill(0));
  const m=Math.floor(size/2);
  if(name==='blur') weights=weights.map(row=>row.map(()=>1/(size*size)));
  else if(name==='edge') {weights=weights.map(row=>row.map(()=>-1));weights[m][m]=size*size-1;}
  else if(name==='sharpen'){weights[m][m]=5;weights[m-1][m]=-1;weights[m+1][m]=-1;weights[m][m-1]=-1;weights[m][m+1]=-1;}
  else weights[m][m]=1;
  renderKernel();update();
}
function renderKernel(){
  const grid=$('kernel');grid.style.gridTemplateColumns=`repeat(${size}, 1fr)`;grid.replaceChildren();
  weights.forEach((row,r)=>row.forEach((weight,c)=>{
    const field=document.createElement('input');field.type='number';field.step='any';field.value=Number(weight.toFixed(6));field.setAttribute('aria-label',`Kernel row ${r+1}, column ${c+1}`);
    field.addEventListener('input',()=>{weights[r][c]=Number.isFinite(field.valueAsNumber)?field.valueAsNumber:0;$('preset').value='custom';update()});grid.append(field);
  }));
}
function update(){
  const half=Math.floor(size/2);
  values=Array.from({length:N},(_,r)=>Array.from({length:N},(_,c)=>{
    let sum=0;for(let y=0;y<size;y++)for(let x=0;x<size;x++){const iy=r+y-half,ix=c+x-half;if(iy>=0&&iy<N&&ix>=0&&ix<N)sum+=image[iy][ix]*weights[y][x]}
    return sum;
  }));
  $('kernelSum').textContent=format(weights.flat().reduce((a,b)=>a+b,0));
  $('position').textContent=`Row ${selected.row+1}, column ${selected.col+1}`;$('rawValue').textContent=format(values[selected.row][selected.col]);draw();
}
function format(n){return Number(n.toFixed(4)).toString()}
function draw(){
  const ic=input.getContext('2d'),oc=output.getContext('2d');
  const flat=values.flat(),min=Math.min(...flat),max=Math.max(...flat),range=max-min;
  for(let r=0;r<N;r++)for(let c=0;c<N;c++){
    let shade=Math.round(255*(1-image[r][c]));ic.fillStyle=`rgb(${shade},${shade},${shade})`;ic.fillRect(c*CELL,r*CELL,CELL,CELL);
    // Constant maps use neutral gray; otherwise darker means a higher value.
    let v=range>1e-12?(values[r][c]-min)/range:0.5;shade=Math.round(255*(1-v));oc.fillStyle=`rgb(${shade},${shade},${shade})`;oc.fillRect(c*CELL,r*CELL,CELL,CELL);
  }
  for(const ctx of [ic,oc]){ctx.strokeStyle='rgba(120,145,125,.24)';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<=N;i++){ctx.moveTo(i*CELL+.5,0);ctx.lineTo(i*CELL+.5,N*CELL);ctx.moveTo(0,i*CELL+.5);ctx.lineTo(N*CELL,i*CELL+.5)}ctx.stroke()}
  const half=Math.floor(size/2),left=Math.max(0,selected.col-half),top=Math.max(0,selected.row-half),right=Math.min(N,selected.col+half+1),bottom=Math.min(N,selected.row+half+1);
  ic.fillStyle='rgba(168, 220, 111, .25)';ic.fillRect(left*CELL,top*CELL,(right-left)*CELL,(bottom-top)*CELL);ic.strokeStyle='#91c95f';ic.lineWidth=3;ic.strokeRect(left*CELL+1.5,top*CELL+1.5,(right-left)*CELL-3,(bottom-top)*CELL-3);
  oc.strokeStyle='#a9e477';oc.lineWidth=3;oc.strokeRect(selected.col*CELL+1.5,selected.row*CELL+1.5,CELL-3,CELL-3);
}
function cell(event,canvas){const rect=canvas.getBoundingClientRect();return {col:Math.max(0,Math.min(N-1,Math.floor((event.clientX-rect.left)/rect.width*N))),row:Math.max(0,Math.min(N-1,Math.floor((event.clientY-rect.top)/rect.height*N)))}}
function paint(e){const p=cell(e,input);image[p.row][p.col]=1-Number($('shade').value)/255;update()}
input.addEventListener('pointerdown',e=>{drawing=true;input.setPointerCapture(e.pointerId);paint(e)});input.addEventListener('pointermove',e=>{if(drawing)paint(e)});input.addEventListener('pointerup',()=>drawing=false);input.addEventListener('pointercancel',()=>drawing=false);
output.addEventListener('pointermove',e=>{selected=cell(e,output);update()});output.addEventListener('pointerdown',e=>{selected=cell(e,output);update()});
output.addEventListener('keydown',e=>{const directions={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]};if(!directions[e.key])return;e.preventDefault();const [dr,dc]=directions[e.key];selected={row:Math.max(0,Math.min(27,selected.row+dr)),col:Math.max(0,Math.min(27,selected.col+dc))};update()});
$('sizes').addEventListener('click',e=>{const button=e.target.closest('button[data-size]');if(!button)return;size=Number(button.dataset.size);document.querySelectorAll('#sizes button').forEach(b=>b.classList.toggle('active',b===button));if($('preset').value==='custom')$('preset').value='identity';preset($('preset').value)});
$('preset').addEventListener('change',e=>{if(e.target.value!=='custom')preset(e.target.value)});
$('clear').addEventListener('click',()=>{image=Array.from({length:N},()=>Array(N).fill(0));update()});$('example').addEventListener('click',example);
$('shade').addEventListener('input',e=>{$('swatch').style.background=`rgb(${e.target.value},${e.target.value},${e.target.value})`});
preset('edge');example();
