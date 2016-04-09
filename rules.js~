function decompositionRule(dependencyList,section)
{
	var can = [];
	for (var i=0;i<dependencyList.length;i++)
	{
		var dependency = dependencyList[i];
		if(dependency.rhs.length>1)//Right side needs to be decomposed
		{
			var str = dependency.lhs+"->"+dependency.rhs+" is decomposed into\n";
			for (var itm =0; itm<dependency.rhs.length;itm++)
			{
				can.push({"left":cloneArray(dependency.lhs),"right":[dependency.rhs[itm]]});
				str += "\t"+dependency.lhs + "->"+dependency.rhs[itm]+"\n";
			}
			section.add(str);
		}
		else
			can.push(dependency);
	}
	return can;
}
