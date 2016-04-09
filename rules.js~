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
	var uniq = dependencyList.map((name) => {return {count: 1, name: name}}).reduce((a, b) => {a[b.name] = (a[b.name] || 0) + b.count; 
	return a;}, {});

	var duplicates = Object.keys(uniq).filter((a) => uniq[a] > 1);

	var temp =[];
	for (var i=0; i<duplicates.length;i++)
	{
		for (var k=0; k<dependencyList.length;k++)
		{
			if(!dependencyList[k].equals(duplicates[i]))
				temp.push(dependencyList[k]);
		}
	}
	var str = " Dupplicates :";
	for (var i=0; i<duplicates.length;i++)
	{
		str+=duplicates[i];
		temp.push(duplicates[i]);
	}
	str+="are removed!\n";
	section.add(str);
	return temp;
}
