function Dependency(lhs,rhs)
{
	this.lhs = lhs;
	this.rhs = rhs;
	
	this.toString = function()
	{
		return lhs.toString() + " --> " + rhs.toString();		
	}
}

function Relation(name)
{
	this.name = name;
	this.dependencyList = [];
}