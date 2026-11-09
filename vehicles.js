// Parked vehicles remain in save data; mounted vehicles are rendered only once.
export function parkedPosition(value, fallback){
 if(value&&Number.isFinite(value.x)&&Number.isFinite(value.y))return {x:value.x,y:value.y};
 return {...fallback};
}
export function park(state,key,x,y){state[key]={x,y};return state[key]}
export function vehicleVisible(isMounted){return !isMounted}
