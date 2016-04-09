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
			relation = new Relation (name,attribute,[]); //{'name':name,'attr':attributes,'fd':[],"steps":[]};
			relationList.push(relation);
		}
		else if(line.contains("->"))//Indicates a dependency [attr1,...]->[attr1,...]
		{
			var dLoc = line.indexOf("-");
			var left = line.substring(0,dLoc).split(/ *, */);
			var right = line.substring(dLoc+2).split(/ *, */);
			relation.dependencyList.push(new Dependency(left,right));	
		}
	}
	return relationList; 
}
function Dependency(lhs,rhs)
{
	this.lhs = lhs;
	this.rhs = rhs;
	
	this.toString = function()
	{
		return lhs.toString() + " --> " + rhs.toString();		
	}
}

function Relation(name,attributes,dependencyList)
{
	this.attributes = attributes;
	this.name = name;
	this.dependencyList = dependencyList;
}

