(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.MinesGame=factory();})(typeof window==='object'?window:globalThis,()=>{
'use strict';
return class MinesGame{
 constructor(rows=9,cols=9,mines=10,random=Math.random){
  if(!Number.isInteger(rows)||!Number.isInteger(cols)||!Number.isInteger(mines)||rows<4||cols<4||mines<1||mines>rows*cols-9)throw new Error('Invalid minefield');
  Object.assign(this,{rows,cols,mines,random,status:'ready',placed:false,flags:0,revealed:0,exploded:-1});
  this.cells=Array.from({length:rows*cols},()=>({mine:false,count:0,open:false,flag:false}));
 }
 neighbors(i){const row=Math.floor(i/this.cols),col=i%this.cols,out=[];for(let y=Math.max(0,row-1);y<=Math.min(this.rows-1,row+1);y++)for(let x=Math.max(0,col-1);x<=Math.min(this.cols-1,col+1);x++){const n=y*this.cols+x;if(n!==i)out.push(n);}return out;}
 place(first){const safe=new Set([first,...this.neighbors(first)]),spots=this.cells.map((_,i)=>i).filter(i=>!safe.has(i));
  for(let i=spots.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[spots[i],spots[j]]=[spots[j],spots[i]];}
  for(const i of spots.slice(0,this.mines))this.cells[i].mine=true;
  this.cells.forEach((c,i)=>{c.count=this.neighbors(i).filter(n=>this.cells[n].mine).length;});this.placed=true;this.status='playing';
 }
 toggle(i){const c=this.cells[i];if(!c||c.open||['won','lost'].includes(this.status)||!c.flag&&this.flags>=this.mines)return false;c.flag=!c.flag;this.flags+=c.flag?1:-1;return true;}
 open(i){const c=this.cells[i];if(!c||c.flag||['won','lost'].includes(this.status))return false;
  if(!this.placed)this.place(i);
  if(c.open)return this.chord(i);
  return this.reveal([i]);
 }
 chord(i){const c=this.cells[i];if(!c.open||!c.count)return false;const around=this.neighbors(i);if(around.filter(n=>this.cells[n].flag).length!==c.count)return false;
  return this.reveal(around.filter(n=>!this.cells[n].flag&&!this.cells[n].open));
 }
 reveal(targets){if(!targets.length)return false;const bomb=targets.find(i=>this.cells[i].mine);if(bomb!==undefined){this.status='lost';this.exploded=bomb;return true;}
  const queue=targets.slice(),seen=new Set(queue);for(let at=0;at<queue.length;at++){const i=queue[at],c=this.cells[i];if(c.open||c.flag||c.mine)continue;c.open=true;this.revealed++;
   if(!c.count)for(const n of this.neighbors(i))if(!seen.has(n)&&!this.cells[n].flag&&!this.cells[n].mine){seen.add(n);queue.push(n);}
  }
  if(this.revealed===this.cells.length-this.mines){this.status='won';for(const c of this.cells)if(c.mine)c.flag=true;this.flags=this.mines;}return true;
 }
};
});
