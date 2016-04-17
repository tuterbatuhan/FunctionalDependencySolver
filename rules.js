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
		str+="\tare removed";
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
				str+="\t"+reduced.lhs+"->"+dependency.rhs+"\t since there exists "+reduced.lhs+"->"+reduced.rhs;
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

	for (var i=0;i<dependencyList.length;i++)
	{
		for (var k=0;k<dependencyList.length;k++)
		{
			if(dependencyList[i].rhs.equals(dependencyList[k].lhs))
			{
				for (var n=0;n<dependencyList.length;n++)
					if(dependencyList[n].lhs.equals(dependencyList[i].lhs) && dependencyList[n].rhs.equals(dependencyList[k].rhs))
					{
						var str = dependencyList[n]+" is removed since there exists " + dependencyList[i]+" and "+ dependencyList[k];
						redundant.push(dependencyList[n]);
						section.add(str);
					}
			}	
		}
	}
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

//This will have to be converted into a search like ones in Berwick's notes
//Maybe BFS??
//Or Maybe rule based system (Now it works like rule based system)
//That it remembers implies calls
//Right now it runs like DFS
function implies(dependencyList,dependency)
{
	var visited = {};//Dirty trick to stop cycles
	
	// Inner function called recursively to check wheter dep is implied for a
	// given dependencyList
	function _implies(dep)
	{
		//If already visited, remember result
		if (visited[dep.toString()] != undefined)
			return visited[dep.toString()];
		
		//If not visited mark it to false
		visited[dep.toString()] = false;
		
		var found = false;
		
		//Note that this if conditions below can be turned into 1 if statement
		//if (reflexivity(dep) && contains(dep) &&  augmentation(dep) &&
		//		transitivity(dep) && decomposition(dep))
		//These represents base cases or neighbour cases
		if (!found && reflexivity(dep))
			found = true;
		
		if (!found && contains(dep))
			found = true;
		
		if (!found && augmentation(dep))
			found = true;

		if (!found && transitivity(dep))
			found = true;
		
		if (!found && decomposition(dep))
			found = true;
		
		visited[dep.toString()] = found;//If found that X->Y then save it
		
		return found;
	}
	
	function reflexivity(dep)
	{
		//If B is a subset of A then A->B
		//Represents 1st axiom of Armstrong
		
		return (dep.rhs.isSubset(dep.lhs))//isSubset defined in data.js
	}
	
	function contains(dep)
	{
		//If dependency X->Y is contained in FD or if FD has dependency like X->YA
		//then it implies 
		for (var i = 0 ; i < dependencyList.length ; i++)
			if (dependencyList[i].equals(dep))
				return true;
			else if (dependencyList[i].lhs.equals(dep.lhs) &&
					 dep.rhs.isSubset(dependencyList[i].rhs))
				return true;
			
		return false;
	}
	
	function augmentation(dep)
	{
		//If A -> B then AC -> BC
		//Represents 2nd axiom of Armstrong
		
		// If we have AB -> CB then search for A -> C
		var common = dep.rhs.intersection(dep.lhs);
		
		if (common.length > 0)
		{
			var newRHS = dep.rhs.difference(common);
			if (newRHS.length > 0  && _implies(new Dependency(dep.lhs,newRHS)))
				return true;
		}
		
		return false;
	}
	
	function transitivity(dep)
	{
		//If A->B & B->C then A->C
		//Represents 3rd axiom of Armstrong
		
		//If there exists a rule such that X->BY and we are checking
		//whether A->B? , then check A->X
		//Because if A->X and X->BY then A->BY. Since we can decompose A->BY
		//into A->B and A->Y, we can say that A->B.
		for (var i = 0 ; i < dependencyList.length ; i++)
		{
			//If there exist a rule such that X->BY s.t. X != A 
			if (dep.rhs.isSubset(dependencyList[i].rhs) && !dep.lhs.equals(dependencyList[i].lhs))
			{
				var newLHS = dep.lhs; //A
				var newRHS = dependencyList[i].lhs; //X
				var newDep = new Dependency(newLHS,newRHS); //A->X
				
				if (!newDep.equals(dep) && _implies(newDep))
					return true;
			}
		}
		
		return false;
	}
	
	function decomposition(dep)
	{
		//If A -> BC then A->B & A->C
		//Represents decomposition corollary of the Armstrong's axioms
		//In theory we do not need this since first 3 rules of Armstrong's
		//axioms can be used to get this rule. But we are using it :P
		
		//Can be decomposed X->Y => |Y| > 1??
		if (dep.rhs.length > 1)
		{
			//Can be decomposed
			//For each decomposition A->BC => A->B , A->C
			//Check whether are they implies 
			//If all of them exists (A->B and A->C) then A->BC
			for (var i = 0 ; i < dep.rhs.length ; i++)
			{
				if (!_implies(new Dependency(dep.lhs,[dep.rhs[i]])))
					return false;//There exists a decomposition that does not implies
			}
			
			return true;//Can be decomposed and every decomposition of it implies
		}
		else
			return false; // Cannot be decomposed
	}
	
	return _implies(dependency);
}//End of function implies
