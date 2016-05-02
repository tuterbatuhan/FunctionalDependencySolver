/************************************************************************
 * canonical_cover.js
 *
 *  Implements an algorithm to find canonical covers of
 *		given relations
 *
 *
 *
 ************************************************************************/

function canonicalCover(relationList)
{
	//Set of dependency lists (1 for each relation)
	var rbsResults = [];
	
	//Find canonical covers using rbs
	for (var i = 0 ; i < relationList.length ; i++)
	{
		var dl = relationList[i].dependencyList;
		rbsResults.push(rbsCanonicalCover(dl));
	}
	
	//Find Canonical cover using problem reduction
	findCanonicalCovers(relationList);
	
	//Compare results
	for (var i = 0 ; i < relationList.length ; i++)
	{
		var dlrbs = rbsResults[i];
		var dl = relationList[i].dependencyList;
		
		if (!dl.equals(dlrbs))
		{
			console.log("Canonical Cover algorithm error");
		}
	}
	
	
}

function findCanonicalCovers(relationList)
{
	var can;
	for(var i=0;i<relationList.length;i++)
	{
		var sec = HISTORY.createSection(0);
		sec.add("For Relation: "+relationList[i].name);
		var innerSec = sec.createSection(1);
		relationList[i].dependencyList = decompositionRule(relationList[i].dependencyList,innerSec);
		relationList[i].dependencyList = removeDupp(relationList[i].dependencyList,innerSec);
		var temp=[];
		do{
			temp = relationList[i].dependencyList;
			relationList[i].dependencyList = reduce(relationList[i].dependencyList,innerSec);	
		}while(!temp.equals(relationList[i].dependencyList));
		relationList[i].dependencyList = removeDupp(relationList[i].dependencyList,innerSec);
		relationList[i].dependencyList = removeRedundant(relationList[i].dependencyList,innerSec);
		relationList[i].dependencyList = removeDupp(relationList[i].dependencyList,innerSec);
	}
	return null;
}

function decompositionRule(dependencyList,section)
{	
	var temp =[];
	for (var i=0;i<dependencyList.length;i++)
	{
		var dependency = dependencyList[i];
		if(dependency.rhs.length>1)//Right side needs to be decomposed
		{
			var str = dependency.lhs+"->"+dependency.rhs+" is decomposed into\n";
			for (var itm =0; itm<dependency.rhs.length;itm++)
			{
				var rhs = [];
				rhs.push(dependency.rhs[itm]);
				temp.push(new Dependency(cloneArray(dependency.lhs),rhs));
				str += "\t"+dependency.lhs + "->"+dependency.rhs[itm]+"\n";
			}
			section.add(str);
		}
		else
			temp.push(dependency);
	}
	return temp;
}
function removeDupp(dependencyList,section)
{
	var uniqueItems = {};
	var dupplicates = {};
	for (var i = 0 ; i < dependencyList.length ; i++)
	{
		if(uniqueItems[dependencyList[i].toString()] != undefined)
			dupplicates[dependencyList[i].toString()] = dependencyList[i];
		uniqueItems[dependencyList[i].toString()] = dependencyList[i];
		
	}
	
	var keys = Object.keys(uniqueItems);
	var result = [];
	
	for (var i = 0 ; i < keys.length ; i++)
		result.push(uniqueItems[keys[i]]);
		
		
	var key2 = Object.keys(dupplicates);
	if(key2.length!=0)
	{
		var str = "Dupplicates";
		for (var i = 0 ; i < key2.length ; i++)
		{
			str+= "\n\t"+key2[i];
		}
		str+="\tare removed\n";
		section.add(str);
	}
	return result;
}
function reduce(dependencyList,section)
{
	var temp=[];
	for (var i=0;i<dependencyList.length;i++)
	{
		var dependency = dependencyList[i];	
		if(dependency.lhs.length!=1)
		{
			var reduced = helper(dependency,dependencyList);
			if(reduced!=null)
			{
				var str = dependency.lhs+"->"+dependency.rhs+" is decomposed into\n";
				temp.push(new Dependency(reduced.lhs,dependency.rhs));
				str+="\t"+reduced.lhs+"->"+dependency.rhs+"\t since there exists "+reduced.lhs+"->"+reduced.rhs+"\n";
				section.add(str);
			}
			else
			{
				temp.push(dependency);
			}
		}
		else
		{
			temp.push(dependency);
		}
	}
	
	return temp;
}
function helper(dependency,dependencyList)
{
	for (var k=0;k<dependency.lhs.length;k++)
	{
		var temp = [];
		for (var i=0;i<dependency.lhs.length;i++)
		{
			if(i!=k)
			{
				temp.push(dependency.lhs[i]);
			}
		}
		var temp2 = [];
		temp2.push(dependency.lhs[k]);
		var dep = new Dependency(temp,temp2);
		if(implies(dependencyList,dep))
		{
			return dep;
		}
	}
	return null;
		
}
function removeRedundant(dependencyList,section)
{
	var redundant = [];
	var str;
	for (var i=0;i<dependencyList.length;i++)
	{
		for (var k=0;k<dependencyList.length;k++)
		{
			if(dependencyList[i].rhs.equals(dependencyList[k].lhs))
			{
				for (var n=0;n<dependencyList.length;n++)
					if(dependencyList[n].lhs.equals(dependencyList[i].lhs) && dependencyList[n].rhs.equals(dependencyList[k].rhs))
					{
						str = dependencyList[n]+" is removed since there exists " + dependencyList[i]+" and "+ dependencyList[k]+"\n";
						redundant.push(dependencyList[n]);
						
					}
			}	
		}
	}
	if(!str)
		str="Nothing to be done\n";
	section.add(str);
	if(redundant.length>0)
	{
		var temp = [];
		for (var i=0;i<redundant.length;i++)
		{
			for (var k=0;k<dependencyList.length;k++)
			{
				if(!dependencyList[k].equals(redundant[i]))
					temp.push(dependencyList[k]);
			}
					
		}
		return temp;	
	}
	return dependencyList;
}