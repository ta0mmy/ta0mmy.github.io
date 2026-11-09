// Collision shapes follow the visible footprints in the illustrated backgrounds.
// Coordinates are world pixels; only the feet of characters collide.
const poly = (...points) => ({points});
const regionShapes = [
 [ // Village: cottage footprints, pond/stream, flowerbed and lower fence.
  poly([0,0],[235,0],[230,120],[160,125],[125,110],[0,145]),
  poly([455,0],[565,0],[590,92],[550,105],[480,100]),
  poly([690,0],[960,0],[960,125],[870,128],[835,115],[750,120],[700,95]),
  poly([715,185],[770,195],[810,235],[850,260],[875,300],[900,300],[920,270],[960,270],[960,195],[900,190],[850,175],[815,150],[780,150],[755,160]),
  poly([0,340],[180,340],[245,410],[210,500],[0,510]),
  poly([810,340],[960,320],[960,500],[870,475],[830,435]),
  poly([520,455],[630,420],[725,420],[735,440],[620,470],[540,480]),
 ],
 [ // Troodos: stable, rocks, stream, fence posts and mountainside.
  poly([0,0],[450,0],[450,115],[370,135],[300,140],[260,160],[0,175]),
  poly([0,185],[105,205],[150,260],[200,290],[250,320],[245,345],[195,355],[150,345],[100,315],[45,300],[0,325]),
  poly([0,360],[125,365],[170,400],[230,415],[300,435],[340,475],[310,510],[0,510]),
  poly([790,0],[960,0],[960,145],[880,155],[840,130],[790,105]),
  poly([820,250],[960,240],[960,350],[900,345],[855,315]),
  poly([680,475],[960,455],[960,510],[680,510]),
 ],
 [ // Harbour: buildings, planters, rocks. Water is blocked separately on foot.
  poly([0,0],[255,0],[280,160],[225,185],[0,195]),
  poly([0,210],[65,205],[90,260],[85,335],[0,365]),
  poly([0,370],[150,380],[190,440],[170,510],[0,510]),
  poly([430,470],[560,470],[590,510],[410,510]),
 ],
 [ // City: façades around the plaza and the lower walls.
  poly([0,0],[385,0],[385,140],[340,170],[270,180],[240,205],[185,225],[90,260],[0,270]),
  poly([590,0],[960,0],[960,265],[900,245],[850,220],[800,190],[730,175],[660,160],[590,135]),
  poly([0,320],[145,340],[205,370],[230,425],[260,510],[0,510]),
  poly([715,440],[790,410],[875,350],[960,330],[960,510],[715,510]),
 ],
 [ // Garden: the tree roots, side arches, plants and water below.
  poly([0,0],[290,0],[290,175],[240,190],[195,210],[100,200],[0,250]),
  poly([365,0],[720,0],[720,140],[670,160],[620,170],[370,165]),
  poly([780,0],[960,0],[960,240],[885,230],[840,205],[780,180]),
  poly([0,310],[125,330],[170,370],[220,410],[240,510],[0,510]),
  poly([700,390],[780,365],[830,335],[960,310],[960,510],[700,510]),
 ]
];
const fenceSegments=[[[620,260],[785,260]],[[620,370],[785,370]],[[785,260],[785,370]],[[620,260],[620,295]],[[620,335],[620,370]]];
const narrowPassage=[[620,295],[620,335]];
function pointInside(x,y,p){let hit=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const [xi,yi]=p[i],[xj,yj]=p[j];if(((yi>y)!==(yj>y))&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)hit=!hit}return hit}
function nearSegment(x,y,a,b,r){const dx=b[0]-a[0],dy=b[1]-a[1],l=dx*dx+dy*dy;const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(l||1)));return Math.hypot(x-(a[0]+t*dx),y-(a[1]+t*dy))<r}
function blockedByPolygon(x,y,points,r){if(pointInside(x,y,points))return true;return points.some((p,i)=>nearSegment(x,y,p,points[(i+1)%points.length],r))}
export function blocked(region,x,y,{hedgehog=false,boat=false}={}){
 const radius=hedgehog?5:9;if(x<25||x>935||y<120||y>510)return true;
 if(regionShapes[region].some(s=>blockedByPolygon(x,y,s.points,radius)))return true;
 if(region===0){if(fenceSegments.some(([a,b])=>nearSegment(x,y,a,b,radius+3)))return true;if(!hedgehog&&nearSegment(x,y,...narrowPassage,radius+3))return true}
 // Harbour: shore is solid until boarding. Boat checkpoints remain reachable on water.
 if(region===2&&!boat&&x>Math.max(635,760-(y-200)*.55)&&y>190&&y<455)return true;
 return false;
}
export function safePosition(region,x,y,opts={}){if(!blocked(region,x,y,opts))return{x,y};for(let r=8;r<=250;r+=8)for(let a=0;a<Math.PI*2;a+=Math.PI/12){let xx=Math.max(25,Math.min(935,x+Math.cos(a)*r)),yy=Math.max(120,Math.min(510,y+Math.sin(a)*r));if(!blocked(region,xx,yy,opts))return{x:xx,y:yy}}return{x:480,y:300}}
// Coordinates are paired at paths or thresholds in each painted location.
export const routes={
 '0-1':{x:430,y:465,label:'В конюшню',arrival:{x:510,y:435}},
 '1-0':{x:510,y:470,label:'В деревню',arrival:{x:430,y:430}},
 '1-2':{x:760,y:165,label:'В Лавандовую гавань',arrival:{x:300,y:200}},
 '2-1':{x:300,y:160,label:'В конюшню',arrival:{x:725,y:195}},
 '2-3':{x:200,y:265,label:'В Город двух небес',arrival:{x:480,y:410}},
 '3-2':{x:480,y:455,label:'В гавань',arrival:{x:250,y:260}},
 '3-4':{x:500,y:175,label:'В Сад после июня',arrival:{x:230,y:250}},
 '4-3':{x:200,y:240,label:'В город',arrival:{x:500,y:220}},
};
