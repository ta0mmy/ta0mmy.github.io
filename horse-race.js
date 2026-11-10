// A gentle, self-contained side-scrolling ride. All character art belongs to the main game.
export function createRun(){return {time:0,distance:0,y:0,vy:0,jumps:0,hp:5,score:0,shield:0,cooldown:0,spawn:3,items:[],phase:'ready',buffer:0};}
export function jump(r){if(r.phase!=='running')return;r.buffer=.16;if(r.jumps<2){r.vy=r.jumps?-420:-550;r.jumps++;r.buffer=0;}}
export function shield(r){if(r.phase==='running'&&r.cooldown<=0){r.shield=1.6;r.cooldown=4;}}
export function step(r,dt,random=Math.random){
 if(r.phase!=='running')return;dt=Math.min(dt,.04);r.time+=dt;const speed=155+Math.min(25,r.time*.45);r.distance+=speed*dt;r.shield=Math.max(0,r.shield-dt);r.cooldown=Math.max(0,r.cooldown-dt);r.buffer=Math.max(0,r.buffer-dt);
 r.vy+=1050*dt;r.y+=r.vy*dt;if(r.y>=0){r.y=0;r.vy=0;r.jumps=0;if(r.buffer)jump(r);}
 r.spawn-=dt;if(r.spawn<=0){const bird=random()>.72;r.items.push({x:1000,y:bird?-115:0,w:bird?38:34,h:bird?24:34,type:bird?'bird':'fence'});for(let i=0;i<3;i++)r.items.push({x:1060+i*46,y:-90-Math.sin(i/2*Math.PI)*35,w:16,h:16,type:'apple'});r.spawn=2.8+random()*.9;}
 for(const o of r.items){o.x-=speed*dt;if(o.hit)continue;const hit=o.x<235&&o.x+o.w>170&&o.y-o.h<r.y-9&&o.y>r.y-66;if(hit){o.hit=true;if(o.type==='apple'){r.score+=20;}else if(!r.shield){r.hp--;r.shield=2;r.score=Math.max(0,r.score-10);}}}
 r.items=r.items.filter(o=>o.x>-60&&!o.hit);if(r.hp<=0)r.phase='lost';else if(r.distance>=9000){r.distance=9000;r.phase='won';}
}
export function startHorseRace({images,onFinish,onExit,ears=false}){
 let r=createRun(),raf,last=0,disposed=false;
 const host=document.createElement('div');host.style.cssText='position:fixed;inset:0;z-index:1000;background:#100f1c;display:flex;align-items:center;justify-content:center;flex-direction:column;padding:12px;box-sizing:border-box;color:#ffe8b0;font-family:monospace';
 host.innerHTML='<canvas width="960" height="540" aria-label="Шевелись, Беляш — скачки" style="width:min(100%,1150px);max-height:82vh;aspect-ratio:16/9;object-fit:contain;border:3px solid #bb8e59;image-rendering:pixelated"></canvas><div style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;justify-content:center"><button data-action="jump">Пробел / ↑ · Прыжок ×2</button><button data-action="shield">X · Защита</button><button data-action="pause">P · Пауза</button><button data-action="exit">Esc · В конюшню</button></div>';
 document.body.append(host);const cv=host.querySelector('canvas'),g=cv.getContext('2d');g.imageSmoothingEnabled=false;
 for(const b of host.querySelectorAll('button'))b.style.cssText='background:#322f46;color:#ffedba;border:1px solid #b58a62;padding:10px 16px;font:14px monospace;cursor:pointer';
 function finish(win){if(disposed)return;disposed=true;cancelAnimationFrame(raf);window.removeEventListener('keydown',key,true);document.removeEventListener('visibilitychange',visibility);host.remove();(win?onFinish:onExit)();}
 function action(a){if(a==='none')return;if(a==='exit')return finish(false);if(a==='pause'){if(r.phase==='running')r.phase='paused';else if(r.phase==='paused')r.phase='running';return;}if(a==='shield')return shield(r);if(r.phase==='won')return finish(true);if(r.phase==='lost'){r=createRun();r.phase='running';return;}if(r.phase==='ready'){r.phase='running';return;}jump(r);}
 function key(e){e.stopImmediatePropagation();if(['Space','ArrowUp','KeyW','KeyX','KeyP','Escape','Enter'].includes(e.code))e.preventDefault();if(e.repeat)return;action(e.code==='Escape'?'exit':e.code==='KeyP'?'pause':e.code==='KeyX'?'shield':['Space','ArrowUp','KeyW','Enter'].includes(e.code)?'jump':'none');}
 function visibility(){if(document.hidden&&r.phase==='running')r.phase='paused';}
 window.addEventListener('keydown',key,true);document.addEventListener('visibilitychange',visibility);host.onclick=e=>{const b=e.target.closest('button');if(b)action(b.dataset.action);};cv.onclick=()=>action('jump');
 const box=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),w,h);};
 const text=(s,x,y,size=18,col='#ffe8b0')=>{g.fillStyle=col;g.font=`bold ${size}px monospace`;g.fillText(s,x,y);};
 function landscape(){const n=Math.min(2,Math.floor(r.distance/3000)),colors=[['#98bdd0','#849dae','#647981','#c9c38f'],['#d0a5a0','#927f98','#666980','#a7ac84'],['#323651','#525675','#777685','#c3b29a']][n];box(0,0,960,540,colors[0]);box(755,92,48,48,'#ffe4a7');box(747,100,64,32,'#ffe4a7');
 for(let i=0;i<8;i++){const x=((i*180-r.distance*.12)%1400+1400)%1400-200;for(let j=0;j<6;j++)box(x+j*13,270-j*23,170-j*26,200,colors[1]);}
 for(let i=0;i<12;i++){const x=((i*125-r.distance*.36)%1500+1500)%1500-140;box(x+25,266,12,168,'#554e5b');for(let j=0;j<5;j++)box(x+j*7,250-j*22,65-j*14,48,colors[2]);}
 if(n===1){for(let i=0;i<5;i++){const x=((i*290-r.distance*.25)%1450+1450)%1450-240;box(x,240,98,190,'#756f83');box(x-8,232,114,16,'#514d63');for(let j=0;j<4;j++)box(x+j*28,217,14,20,'#514d63');box(x+34,300,26,45,'#e5bd83');}}
 box(0,424,960,116,'#403b48');box(0,424,960,12,colors[3]);box(0,436,960,7,'#877258');for(let i=0;i<50;i++){let x=((i*53-r.distance)%1100+1100)%1100;box(x,453+(i%4)*20,16,4,'#69545a');}text(['I · ДОРОГА ИЗ КОНЮШНИ','II · СТАРЫЙ ЗАМОК','III · ЗАКАТ В ТРОДОСЕ'][n],28,105,15);}
 function draw(t){const dt=last?Math.min((t-last)/1000,.04):0;last=t;step(r,dt);landscape();
 for(const o of r.items){const y=424+o.y;if(o.type==='apple'){box(o.x,y-14,15,12,'#e78c72');box(o.x+6,y-18,3,5,'#e4c58a');box(o.x+9,y-19,7,4,'#819b71');}else if(o.type==='fence'){box(o.x,y-34,7,34,'#e1bb83');box(o.x+27,y-34,7,34,'#e1bb83');box(o.x-4,y-26,42,7,'#96705d');box(o.x-4,y-12,42,7,'#96705d');}else{box(o.x,y-12,32,12,'#302e48');box(o.x+12,y-20+Math.sin(t/90)*7,10,18,'#51415b');box(o.x-5,y-10,8,4,'#dfb77c');}}
 const bob=r.y===0?Math.sin(r.time*19)*3:0;g.save();g.translate(200,424+r.y+bob);if(r.shield){g.strokeStyle='#fff3bc';g.lineWidth=3;g.strokeRect(-62,-118,126,121);g.globalAlpha=.65+.35*Math.sin(t/65);}
 if(images.horse.naturalWidth)g.drawImage(images.horse,-73,-93,146,104);if(images['hero-side'].naturalWidth)g.drawImage(images['hero-side'],-28,-139,57,84);if(ears){box(-18,-145,12,12,'#292534');box(15,-145,12,12,'#292534');}g.restore();
 box(0,0,960,73,'#201e31');text('ШЕВЕЛИСЬ, БЕЛЯШ!',24,30,23);text('♥ '.repeat(r.hp)+'♡ '.repeat(5-r.hp),24,57,20,'#efa48b');text('ЯБЛОКИ '+r.score,390,32,18);text(r.cooldown>0?'ЗАЩИТА '+r.cooldown.toFixed(1)+' c':'X · ЗАЩИТА ГОТОВА',390,57,14);text(Math.floor(r.distance/90)+'%  /  ФИНИШ',720,32,18);box(720,48,210,7,'#51465d');box(720,48,210*r.distance/9000,7,'#eaca92');
 for(let y=0;y<540;y+=4)box(0,y,960,1,'#11102013');
 if(r.phase!=='running'){box(145,151,670,225,'#201e31f5');box(145,151,670,4,'#e7bb80');g.textAlign='center';text(r.phase==='ready'?'ШЕВЕЛИСЬ, БЕЛЯШ!':r.phase==='paused'?'ПЕРЕДЫШКА':r.phase==='won'?'ВЫ ДОСКАКАЛИ!':'ЕЩЁ ОДНА ПОПЫТКА?',480,207,30);const lines=r.phase==='ready'?['Лёгкая прогулка · 5 жизней · около минуты','Пробел / ↑ — прыжок, ещё раз — двойной','X — защита на 1,6 секунды. Яблоки — бонус.','Enter / Пробел — начать']:r.phase==='paused'?['P — продолжить · Esc — вернуться в конюшню']:r.phase==='won'?['Беляш заслужил яблоко. А вы — лучший вид.','Enter / Пробел — забрать воспоминание']:['Ничего страшного: история и огоньки сохранены.','Enter / Пробел — попробовать снова','Esc — вернуться в конюшню'];lines.forEach((s,i)=>text(s,480,249+i*29,16));g.textAlign='left';}raf=requestAnimationFrame(draw);}
 raf=requestAnimationFrame(draw);return ()=>finish(false);
}
