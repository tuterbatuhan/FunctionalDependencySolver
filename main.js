document.getElementById("parseButton").onclick=function(){
	
	var p = parse(document.getElementById("parseInput").value);
	console.log(p);
	var can = canonicalCover(p.relations[0].fd,p.relations[0].steps);
	console.log(can);
	populate(p.relations[0].name,p.relations[0].steps);
}
function cloneArray(arr)
{
	return arr.slice();
}
function populate(name,steps){
	document.getElementById("stepsList").value = "For Relation: "+name+"\n";
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
			var str = "\t"+ fd[i].left+"-"+fd[i].right+" is decomposed into";
			steps.push(str);
			for (var itm =0; itm<fd[i].right.length;itm++)
			{
				can.push({"left":cloneArray(fd[i].left),"right":[fd[i].right[itm]]});
			}
		}
		else
			can.push(fd[i]);
	}
	return can;
}
function parse(text)
{
	var result = {};
	var lines = text.split(/ *\n */);
	var relation = null;
	result.relations = [];
	for (var i = 0; i < lines.length; i++) {
		var line = lines[i];
		if(line.endsWith(":"))
		{
			var pStart = line.indexOf("(");
			var pEnd = line.indexOf(")");
			var name = line.substring(0,pStart);
			var params = line.substring(pStart+1,pEnd).split(/ *, */);
			relation = {'name':name,'attr':params,'fd':[],"steps":[]};
			result.relations.push(relation);
		}
		else if(line.contains("-"))
		{
			var dLoc = line.indexOf("-");
			var left = line.substring(0,dLoc).split(/ *, */);
			var right = line.substring(dLoc+1).split(/ *, */);
			relation.fd.push({'left':left,'right':right});
		}
	}
	return result; 
}