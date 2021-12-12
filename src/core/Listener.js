

class Listener{
	constructor(filter=null,flushArgs=false){
		this._filter=null;
		this._events=new Map();
		this._flushType=flushArgs?'args':'event';
		this.filter=filter;
	}
	get filter(){
		return this._filter;
	}
	set filter(filter){
		if(filter instanceof Array)this._filter=v=>filter.includes(v);
		else if(typeof(filter)==='function')this._filter=filter;
		else this._filter=()=>true;
	}
	has(type){
		return this._events.has(type);
		// return this.events.hasOwnProperty(type);
	}
	flush(type,data){
		if(this._flushType==='event'){
			return this.flushEvent(type,data);
		}else if(this._flushType==='args'){
			return this.flushArgs(type,data);
		}
	}
	flushArgs(type,args){
		if(this.has(type)){
			if(!(args instanceof Array))args=[args];
			return this._events.get(type).map(cb=>cb(...args));
		}
		return [];
	}
	flushEvent(type,data){
		let res=[];
		if(this.has(type)){
			let bridge={};
			let evt=new ListenerEvent(type,data);
			let list=this._events.get(type);
			for(let i=0;i<list.length&&!bridge.requireStop;i++){
				res.push(list[i](evt));
			}
		}
		return res;
	}
	on(type,callback,prepend=false){
		if(type instanceof Array){
			type.forEach(t=>this.on(t,callback,prepend));
		}else if(this.filter(type)){
			if(!this.has(type))this._events.set(type,[]);
			if(prepend)this._events.get(type).unshift(callback);
			else this._events.get(type).push(callback);
		}
		return this;
	}
	off(type,callback){
		if(this.has(type)){
			let fid=this._events.get(type).findIndex(cb=>cb===callback);
			if(fid>-1){
				let rd= this._events.get(type).splice(fid,1)[0];
				if(!this._events.get(type).length) this._events.delete(type);
				return rd;
			}
		}
	}
}


class ListenerEvent{
	constructor(type,data,bridge){
		this.type=type;
		this.data=data;
		this.stop=function(){
			bridge.requireStop=1;
		};
	}
}
/**
 * class extention mixin.
 * extended :
 *  - must call super([filter[,flushArgs[,args]]])
 *  - can call this._listener.flush(type,data) to output event
 */
const ListeningMixin=childClass=>{
	class ListeningMixin extends childClass{
		constructor(filter=t=>true,flushArgs=false,args=[]){
			super(...args);
			this._listener=new Listener(filter,flushArgs);
		}
		on(type,callback,prepend=false){
			this._listener.on(type,callback,prepend);
			return this;
		}
		off(type,callback){
			return this._listener.off(type,callback);
		}
	}
	return ListeningMixin;
};

/**
 * class Extention.
 * extended :
 *  - must call super([filter[,flushArgs]])
 *  - can call this._listener.flush(type,data) to output event
*/
const Listening=ListeningMixin(Object);

module.exports={
	Listener,
	Listening,
	ListeningMixin
};
