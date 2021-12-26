
class ErrorPile{
	constructor(name,callName=null){
		this.name=name||'undefined';
		this.callName=callName;
		this.misc={
			_skeys:['sample','invalid'],
			errTab:''
		};
		this.css={
			sample:'color:#4a0',
			invalid:'color:#f00',
		};
		this.patterns={
			samples:'---------- ${0} ---------- ',
			prefix:'---------- ${0} Error ----------',
			sample:'- ${0} =',
			invalid:'invalid ${0} :',
		};
		this.errors=[];
		this.samples=[];
	}
	
	// ---- cloning
	clone(name=null,callName=null){
		let nu=new ErrorPile(name||this.name,callName||this.callName);
		nu.misc=Object.assign({},this.misc);
		nu.css=Object.assign({},this.css);
		nu.patterns=Object.assign({},this.patterns);
		return nu;
	}
	call(callName=null){
		return this.clone(this.name,callName);
	}
	callSub(subName){
		return this.clone(this.name,(this.callName?this.callName+'.':'')+subName);
	}

	// ---- message pile
	hasErrors(){
		return !!this.errors.length;
	}
	hasSamples(){
		return !!this.samples.length;
	}
	addError(msgLine){
		if(msgLine instanceof Array)msgLine.map(l=>this.errors.push(l+''));
		else this.errors.push(msgLine+'');
		return this;
	}
	addSample(name,value){
		this.samples.push({name,value});
	}
	add(err,smpObj=null){
		this.addError(err);
		if(smpObj)Object.keys(smpObj)
		.forEach(k=>this.addSample(k,smpObj[k]));
		return this;
	}
	// ---- output
	getPrefix(pattern){
		return (this.patterns.prefix=pattern||this.patterns.prefix)
		.split('${0}').join(this.name);
	}
	getSamples(pattern,css){
		let p,c,dp='sample';
		if(this.misc._skeys.includes(pattern)){
			p=this.patterns[pattern];
			c=this.css[pattern];
		}else{
			p=pattern||this.patterns[dp];
			c=css||this.css[dp];
		}
		if(this.misc._skeys.includes(css)){
			c=this.css[css];
		}
		let lst=[];
		this.samples.map(s=>{
			lst.push(p.split('${0}').join('%c'+s.name+'%c'),c);
			lst.push(s.value);
		});
		return lst;
	}
	getInvalid(){
		return this.getSamples('invalid');
	}
	getLogs(){
		return [this.getPrefix()].concat(this.getInvalid());
	}
	getError(){
		if(this.hasErrors()){
			return ['',this.name+(this.callName?'.'+this.callName:'')]
			.concat(this.errors.map(e=>this.misc.errTab+e)).join('\n');
		}
	}
	// ---- log
	logPrefix(pattern){
		console.error(this.getPrefix(pattern));
	}
	logSamples(pattern,css){
		this.getSamples(pattern,css)
		.forEach(l=>console.log(...l));	
	}
	logInvalid(){
		this.logSamples('invalid');
	}
	logError(){
		let err=this.getError();
		if(err)console.error(err);
	}
	output(force=false){
		let err=this.getError();
		if(err){
			console.error(this.getPrefix(pattern));
			this.getSamples().forEach(l=>console.log(...l));
			console.error(err);
		}else if(this.hasSamples()||force){
			let line=this.patterns.samples.split('${0}').join('%c'+this.name+'%c');
			console.group(line,this.css.sample);
			this.getSamples().forEach(l=>console.log(...l));
			console.groupEnd();
		}

	}
	test(){
		let err=this.getError();
		if(err){
			console.error(this.getPrefix(pattern));
			this.getSamples().forEach(l=>console.log(...l));
			throw(err);
		}
	}
	trow(err,smpObj=null){
		this.add(err,smpObj);
		this.test();
	}
}
module.exports={
	ErrorPile
};
