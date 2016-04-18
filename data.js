function Dependency(lhs,rhs)
{
	this.lhs = lhs.sort();
	this.rhs = rhs.sort();
	
	this.toString = function()
	{
		return lhs.toString() + "->" + rhs.toString();		
	}
	
	this.equals = function(that)
	{
		return this.lhs.equals(that.lhs) && this.rhs.equals(that.rhs);
	}
}

function Relation(name,attributes,dependencyList)
{
	this.attributes = attributes;
	this.name = name;
	this.dependencyList = dependencyList;
	
	this.toString = function()
	{
		var str = "";
		str+= this.name + "(" + this.attributes.join() + "):\n";
		
		this.dependencyList.forEach(function(e){str+=e + "\n";});
		return str;
	}
}

//TODO:Implement more robust parsing
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
			attributeList = attributeList.map(function(el){return el.match(/\S.*/)[0].match(/.*\S/)});//Remove whitespace
			
			relation = new Relation(name,attributeList,[]); //{'name':name,'attr':attributes,'fd':[],"steps":[]};
			relationList.push(relation);
		}
		else if(line.indexOf("->") != -1)//Indicates a dependency [attr1,...]->[attr1,...]
		{
			relation.dependencyList.push(parseDependency(line));	
		}
	}
	return relationList; 
}

function parseDependency(line)
{
	
	if(line.indexOf("->") != -1)
	{
		var dLoc = line.indexOf("-");
		var left = line.substring(0,dLoc).split(/ *, */);
		left = left.map(function(el){return el.match(/\S.*/)[0].match(/.*\S/)});//Remove whitespace
		
		var right = line.substring(dLoc+2).split(/ *, */);
		right = right.map(function(el){return el.match(/\S.*/)[0].match(/.*\S/)});//Remove whitespace
		
		return (new Dependency(left,right));
	}		
	else
		return null;
}


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

/**************************************************
* 
* Util functions
* 
***************************************************/
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


Array.prototype.equals = function(that)
{
	if (this.length != that.length)
		return false;
	
	var map = {};
	
	for (var i = 0; i < this.length ; i++)
		if (map[this[i]] == undefined)
			map[this[i]] = 1;
		else
			map[this[i]] = map[this[i]] + 1;
	
	for (var i = 0; i < that.length ; i++)
		if (map[that[i]] == undefined)
			return false;
		else 
			map[that[i]] = map[that[i]] - 1;

	
	Object.keys(map).forEach(function(key){
		if (map[key] != 0)
			return false;
	});
	return true;
}

Array.prototype.isSubset = function(that)
{
	var subset = this;
	var superset = that;
	
	if (subset.length > superset.length)
		return false;
	
	var map = {};
	
	for (var i = 0; i < superset.length ; i++)
	{
		//Means that that character is found
		map[superset[i]] = 1;
	}
	for (var i = 0; i < subset.length ; i++)
	{
		// If subset has something that superset does not have
		if (map[subset[i]] == undefined)
			return false;
	}
	return true;
}

Array.prototype.difference = function(that)
{	
	var map = {};
	
	for (var i = 0; i < this.length ; i++)
	{
		map[this[i]] = this[i]; // Add items
	}
	
	for (var i = 0; i < that.length ; i++)
	{
		map[that[i]] = null; //Remove items
	}
	
	var result = [];
	
	Object.keys(map).forEach(function(key){
		if (map[key] != null)
			result.push(map[key]);
	});
	
	return result;
}

Array.prototype.union = function(that)
{	
	var map = {};
	
	for (var i = 0; i < this.length ; i++)
	{
		map[this[i]] = this[i];
	}
	
	for (var i = 0; i < that.length ; i++)
	{
		map[that[i]] = that[i];
	}
	
	var result = [];
	
	Object.keys(map).forEach(function(key){
		result.push(map[key]);
	});
	
	return result;
}

Array.prototype.intersection = function(that)
{	
	//Ensures that |this| < |that|
	//That results |map1| < |map2|
	if (this.length > that.length)
		return that.intersection(this);
	
	var set1 = {};
	var set2 = {};
	for (var i = 0; i < this.length ; i++)
	{
		set1[this[i]] = this[i];
	}
	
	for (var i = 0; i < that.length ; i++)
	{
		set2[that[i]] = that[i];
	}
	
	var result = [];
	
	Object.keys(set1).forEach(function(key){
		if (set1[key] != undefined && set2[key] != undefined)
			result.push(set1[key]);
	});
	
	return result;
}

function cloneArray(arr){
	return arr.slice();
}
