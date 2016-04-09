function Dependency(lhs,rhs)
{
	this.lhs = lhs.sort();
	this.rhs = rhs.sort();
	
	this.toString = function()
	{
		return lhs.toString() + " --> " + rhs.toString();		
	}
	
	this.equals = function(that)
	{
		return this.lhs.equals(that.lhs) && this.rhs.equals(that.rhs);
	}
}

Array.prototype.equals = function(that)
{
	if (this.length != that.length)
		return;
	
	var map = {};
	
	for (var i = 0; i < this.length ; i++)
		map[this[i]] = 1;
	
	for (var i = 0; i < that.length ; i++)
		if (map[that[i]] == 1)
			map[that[i]] = 0;
		else
			return false;
	
	Object.keys(map).forEach(function(key){
		if (map[key] != 0)
			return false;
	});
	return true;
}

Array.prototype.unique = function()
{
	var map = {};
	this.forEach(function(e){map[e.toString()]=e;});
	return Object.keys(map).map(function(e){return map[e];});
}

function Relation(name,attributes,dependencyList)
{
	this.attributes = attributes;
	this.name = name;
	this.dependencyList = dependencyList;
}

function parse(text)
{
	var lines = text.split(/ *\n */);
	var relation = null;
	var relationList = [];
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if(line.endsWith(":"))//Indicates a relation [name]([attr1,...]):
		{
			var pStart = line.indexOf("(");	//Start index of paranthesis
			var pEnd = line.indexOf(")");	//End index of paranthesis
			var name = line.substring(0,pStart);
			var attributeList = line.substring(pStart+1,pEnd).split(/ *, */);
			relation = new Relation(name,attributeList,[]); //{'name':name,'attr':attributes,'fd':[],"steps":[]};
			relationList.push(relation);
		}
		else if(line.indexOf("->") != -1)//Indicates a dependency [attr1,...]->[attr1,...]
		{
			var dLoc = line.indexOf("-");
			var left = line.substring(0,dLoc).split(/ *, */);
			var right = line.substring(dLoc+2).split(/ *, */);
			relation.dependencyList.push(new Dependency(left,right));	
		}
	}
	return relationList; 
}



String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
var HISTORY = new HistorySection();
function HistorySection()
{
	this.indentationLevel = 0;
	this.historyList = [];
	
	this.createSection = function(indent)
	{
		var section = new HistorySection();
		section.indentationLevel = this.indentationLevel + indent;
		this.historyList.push(section);
		return section;
	}
	
	this.add = function(text)
	{
		var i = "\t".repeat(this.indentationLevel);
		
		this.historyList.push(i+text.replaceAll('\n','\n'+i)+"\n");
	}
	
	this.toString = function()
	{
		var str = "";
		this.historyList.forEach(function(e){str += e.toString()})
		return str;
	}
}
