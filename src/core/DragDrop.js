

const {ErrorPile}=require('./ErrorPile');


const DragDrop=new ((function(){
	let _idc=1;
	let _err = new ErrorPile('DragDrop');
	return class DragDrop{
		constructor(){
			this._families=new Map();
			// this._orphans=new DragDropFamilly(this,null);
			this._data=null;
			this._elements=[];
			this._idc=1;
			console.log('---------- -DragDrop');
		}
		_filterEltMap(type,tgt,ondrag,familly){
			let eltm=this._elements.map((v,i)=>({v,i}));
			if(typeof(type)==='number'){
				return eltm.filter(d=>d.v.id===type);
			}
			eltm=eltm.filter(d=>d.v.type===type);
			if(familly!==true){
				familly=this.famillyName(familly);
				eltm=eltm.filter(d=>d.v.familly===familly);
			}
			if(tgt){
				eltm=eltm.filter(d=>d.v.tgt===tgt);
			}

			if(ondrag){
				eltm=eltm.filter(d=>d.v.ondrag===ondrag);
			}

			return eltm;
		}
		_filterEltIds(type,tgt,ondrag,familly){
			return this._filterEltMap(type,tgt,ondrag,familly).map(d=>d.i);
		}

		famillyName(name){
			return typeof(name)==='string'&&name.length?name:null;
		}
		familly(name=null){
			name = this.famillyName(name);
 			if(!this._families.has(name))this._families.set(name,new DragDropFamilly(this,name));
			return this._families.get(name);
		}
		drag(data,familly=null){
			familly = this.famillyName(familly);
 			this._data={data,familly};
		}
		drop(familly=null){
			let r=this._data&&this._data.familly===this.famillyName(familly)?this._data.data:null;
			this._data=null;
			return r;
		}
		register(type,target,onevt,familly=null,err=null){
			familly = this.famillyName(familly);
			err = err||_err.call('register(type,target,ondrag,familly)');
			if(!['drag','drop'].includes(type)){
				err.add(' - type must be "drag" or "drop"',{type});
			}
			if(!(target instanceof HTMLElement)){
				err.add(' - target is not an HTMLElement',{target});
			}
			if(typeof(onevt)!=='function'){
				err.add(' - onevt is not a function ',{onevt});
			}
			err.test();
			let elt={
				tgt: target,
				type,
				familly,
				onevt,
				draggable:target.draggable
			};
			elt._id=_idc++;
			this._elements.push(elt);
			elt.evts=[];
			if(type==='drag'){
				elt.tgt.draggable=true;
				elt.evts.push(['dragstart',evt=>{
					this.drag(onevt(evt),familly);
				}]);
	
			}else{
				elt.evts.push(['dragover',evt=>{
					evt.preventDefault();
				}]);
				elt.evts.push(['drop',evt=>{
					//var data = ev.dataTransfer.getData("text");
					console.log("ondrop");
					evt.preventDefault();
					onevt(this.drop(familly),evt);
				}]);
			}
			elt.evts.forEach(ev=>elt.tgt.addEventListener(...ev));
 			
			return elt;
		}
		unregister(type,target,ondrag,familly=null){
			let res=[];
			let list=this._filterEltMap(typeof(target)==='number'?target:type,target,ondrag,familly);
			let ids=list.map(d=>d.i);
			let elts=list.map(d=>d.v);
			ids.sort((a,b)=>b-a);
			ids.forEach(id=>res=res.concat(this._elements.splice(id,1)));
			elts.forEach(elt=>{
				if(elt.evts){
					elt.evts.forEach(ev=>elt.tgt.removeEventListener(...ev));
					elt.tgt.draggable=elt.draggable;
				}
				elt.evts=null;
			});
			return res;
		}
		registerDrag(target,ondrag,familly=null){
			return this.register('drag',target,ondrag,familly,_err.call('registerDrag(target,ondrag,familly)'));
		}
		unregisterDrag(target,ondrag,familly=null){
			return this.unregister('drag',target,ondrag,familly);
		}
		registerDrop(target,ondrop,familly){
			return this.register('drop',target,ondrop,familly,_err.call('registerDrop(target,ondrag,familly)'));
		}
		unregisterDrop(target,ondrop,familly=null){
			return this.unregister('drop',target,ondrop,familly);
		}
	}
})())();


class DragDropFamilly{
	constructor(main,name){
		this._priv={
			// id:main.nextId,
			main,
			name,
			elements:[],
		};
	}
	drag(data){
		this._priv.main.drag(data,this._priv.name);
	}
	drop(){
		return this._priv.main.drop(this._priv.name);
	}
	registerDrag(target,ondrag){
		return this._priv.main.registerDrag(target,ondrag,this._priv.name);
	}
	unregisterDrag(target){
		return this._priv.main.unregisterDrag(target,null,this._priv.name);
	}
	registerDrop(target,ondrop){
		return this._priv.main.registerDrop(target,ondrop,this._priv.name);
	}
	unregisterDrop(target){
		return this._priv.main.unregisterDrop(target,null,this._priv.name);
	}
}


module.exports={
	DragDrop
};
