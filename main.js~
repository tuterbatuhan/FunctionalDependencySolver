document.getElementById("parseButton").onclick=function()
{
	var relationList = parse(document.getElementById("parseInput").value);
	//console.log(relationList);
	findCanonicalCovers(relationList);
}
function findCanonicalCovers(relationList)
{
	document.getElementById("stepsList").value = "";
	var can;
	for(var i=0;i<relationList.length;i++)
	{
		can = canonicalCover(relationList[i].dependencyList,p.relations[i].steps);
		populate(p.relations[i].name,p.relations[i].steps);
		//console.log(can);
	}
	return null;
}
function cloneArray(arr)
{
	return arr.slice();
}
function populate(name,steps){
	document.getElementById("stepsList").value += "For Relation: "+name+"\n";
	for (var i=0;i<steps.length;i++)
	{
		document.getElementById("stepsList").value += steps[i]+ "\n";
		//console.log(steps[i]);
	}
	return null;
		
}
function canonicalCover(dependencyList,steps)
{
	var can = [];
	for (var i=0;i<dependencyList.length;i++)
	{
		var dependency = dependencyList[i];
		if(dependency.rhs.length>1)//Right side needs to be decomposed
		{
			var str = "\t"+ dependency.lhs+"->"+dependency.rhs+" is decomposed into\n";
			for (var itm =0; itm<dependency.rhs.length;itm++)
			{
				can.push({"left":cloneArray(dependency.lhs),"right":[dependency.rhs[itm]]});
				str += "\t\t"+dependency.lhs + "->"+dependency.rhs[itm]+"\n";
			}
			steps.push(str);
		}
		else
			can.push(fd[i]);
	}
	return can;
}

