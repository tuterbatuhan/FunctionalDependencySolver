document.getElementById("parseButton").onclick=function()
{
	var p = parse(document.getElementById("parseInput").value);
	console.log(p);
	findCanonicalCovers(p);
}
function findCanonicalCovers(p)
{
	document.getElementById("stepsList").value = "";
	var can;
	for(var i=0;i<p.relations.length;i++)
	{
		can = canonicalCover(p.relations[i].fd,p.relations[i].steps);
		populate(p.relations[i].name,p.relations[i].steps);
		console.log(can);
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
		console.log(steps[i]);
	}
	return null;
		
}
function canonicalCover(fd,steps)
{
	var can = [];
	for (var i=0;i<fd.length;i++)
	{
		if(fd[i].right.length>1)//Right side needs to be decomposed
		{
			var str = "\t"+ fd[i].left+"->"+fd[i].right+" is decomposed into\n";
			for (var itm =0; itm<fd[i].right.length;itm++)
			{
				can.push({"left":cloneArray(fd[i].left),"right":[fd[i].right[itm]]});
				str += "\t\t"+fd[i].left + "->"+fd[i].right[itm]+"\n";
			}
			steps.push(str);
		}
		else
			can.push(fd[i]);
	}
	return can;
}

