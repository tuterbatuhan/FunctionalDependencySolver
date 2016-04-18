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

//Searches functional dependency to check whether dependency exist
function implies(dependencyList,dependency,historySection)
{	
	//Helper function used for representing 1st rule of the armstrong
	//1st axiom of Armstrong,reflexivity, infers that if Y is a subset of X,
	//  then X->Y
	//Returns a struct that contains:
	//	implies: a  boolean that shows whether dep is implied by reflexivity
	//	step: a string that explains how we find the implies result.
	//    step does not return anything when implies is false
	function _reflexivity(dep)
	{
		if (dep.rhs.isSubset(dep.lhs))//If dep = X->Y check whether Y is a subset of X
		{
			
			if (dep.rhs.equals(dep.lhs))//If X equals Y
			{
				return {
					implies:true,
					step: dep + " is always true "
				}
			}
			else//Otherwise
			{
				return {
					implies:true,
					step:  dep + " is always true since "  + dep.lhs + " is subset of " + dep.rhs + " (reflexitivity)"
				}
			}
		}
		
		return {implies:false};
	}
	
	
	// Contains check whether given dependency,dep, is already in dependency set(dependencyList)
	//Returns a struct that contains:
	//	implies: a  boolean that shows whether dep is an element of the dependency set
	//	step: a string that explains how we find the implies result.
	//    step does not return anything when implies is false
	function _contains(dep)
	{
		//If dependency X->Y is contained in FD or if FD has dependency like X->YA
		//then it implies
		for (var i = 0 ; i < dependencyList.length ; i++)
			if (dependencyList[i].equals(dep))
			{
				return {
					implies:true,
					step: dep + " is in the dependency set"
				};
			}
			else if (dependencyList[i].lhs.equals(dep.lhs) &&
					 dep.rhs.isSubset(dependencyList[i].rhs))
			{
				return {
					implies:true,
					step: dep + " is in the dependency set. ( decompose :" + dependencyList[i] + ")"
				};
			}
			
		return  {implies:false};
	}
	
	//Helper function used for representing 2nd axiom of the Armstrong
	//2nd axiom of Armstrong,augmentation, infers that X->Y then
	// AX->AY.
	//
	// This function looks for valid dependencies that might produce dep by using 
	//   augmentation rule. If these dependences implies then dep implies.
	//Returns a struct that contains:
	//	implies: a  boolean that shows whether dep is implied by augmentation
	//	step: a string that explains how we find the implies result.
	//    step does not return anything when implies is false
	function _augmentation(dep)
	{
		// If we have AB -> CB then search for AB -> C because
		// we can produce AB->CB from AB->C by using augmentation rule
		var common = dep.rhs.intersection(dep.lhs); //Find common characters between lhs and rhs
		console.log(dep);
		if (common.length > 0)//If there are common attribbutes
		{
			var newRHS = dep.rhs.difference(common);
			if (newRHS.length > 0  && _implies(new Dependency(dep.lhs,newRHS)))
			{
				return {
					implies:true,
					step:"We can augment " + new Dependency(dep.lhs,newRHS) +
						" into " + dep + " (augmentation)"
				};
			}
		}
		
		return {implies:false};
	}
	
	//Helper function used for representing 3rd axiom of the Armstrong
	//3rd axiom of Armstrong,transitivity, infers that X->Y & Y->Z then
	// X->Z.
	//
	// This function looks for valid dependencies that might produce dep by using 
	//   transitivity rule. If these dependences implies then dep implies.
	//  
	// For example, if dep is X->Z and dependency set contains Y->Z
	//   it checks whether X->Y is true,if it is true then X->Z is also true,
	//   since X->Y and Y->Z both implies.
	//
	//Returns a struct that contains:
	//	implies: a  boolean that shows whether dep is implied by transtivity
	//	step: a string that explains how we find the implies result.
	//    step does not return anything when implies is false
	function _transitivity(dep)
	{
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
				{
					var reason = "";
					if (dep.rhs.equals(dependencyList[i].rhs))//If we only used transitivity
						reason = "We found " + newDep +
								" and in our dependency list we have " + dependencyList[i] +
								" then " + dep + " (transitivity)";
					else //If we used transitivity with decomposition
						reason = "We found " + newDep +
								" and in our dependency list we have " + dependencyList[i] +
								" then " + new Dependency(dep.lhs,dependencyList[i].rhs) + " implies "+ 
								" and we can decompose " + new Dependency(dep.lhs,dependencyList[i].rhs) +
								" into " + dep + " (transitivity and decomposition)";
					return {
							implies:true,
							step: reason
						}
				}
			}
		}
		
		return {implies:false};
	}
	
	//Helper function used for representing union corollary derived from Armstrong's axioms
	//Union infers that X->Y & X->Z then X->YZ
	// 
	//
	// This function separates all attributes that is in rhs of the dep and
	//   it tries to solve them seperately. If they imply seperately then dep also implies.  
	//
	// For example, if dep is X->YZ then this function checks for X->Y and X->Z. If they
	//  both imply in the functional dependency set then X->YZ also implies
	//
	//Returns a struct that contains:
	//	implies: a  boolean that shows whether dep is implied by union
	//	step: a string that explains how we find the implies result.
	//    step does not return anything when implies is false
	function _union(dep)
	{
		//Can be decomposed X->Y => |Y| > 1??
		if (dep.rhs.length > 1)
		{
			var temp = "";
			//Can be decomposed
			//For each decomposition A->BC => A->B , A->C
			//Check whether are they implies 
			//If all of them exists (A->B and A->C) then A->BC
			for (var i = 0 ; i < dep.rhs.length ; i++)
			{
				if (i == dep.rhs.length - 1)
					temp += " and ";
				else
					temp += " , " ;
				temp += new Dependency(dep.lhs,[dep.rhs[i]]).toString();
				if (!_implies(new Dependency(dep.lhs,[dep.rhs[i]])))
					return false;//There exists a decomposition that does not implies
				
			}
			temp= temp.substring(temp.indexOf(',') + 1);
			
			return {
				implies:true,
				step:"Since we have dependencies: " + temp +
					 " , " + dep + " is also implies. (union)"
			
			};//Can be decomposed and every decomposition of it implies
		}
		else
			return {implies:false}; // Cannot be decomposed
	}
	
	
	//A map that is used for cycle elimination and to eliminate repetiton
	var visited = {};
	
	//Steps is a list of string that contains explanation of the steps
	//for finding dependency
	var steps = [];
	
	// Inner function called recursively to check wheter dep is implied for a
	// given dependencyList
	function _implies(dep)
	{
		//If already visited, remember result
		if (visited[dep.toString()] != undefined)
			return visited[dep.toString()];
		
		//If not visited mark it to false (We are currently visiting)
		visited[dep.toString()] = false;
		
		//Describes list of operations that will be performed in given order,
		//(Reduction steps)
		var operations = [_reflexivity,_contains,_augmentation,_transitivity,_union];

		//Intial result is false
		var result = {implies:false};
		
		//For each operation reduce problem until you find a solution
		//(Or node)
		for (var i = 0 ; i < operations.length && !result.implies;i++)
		{
			op = operations[i];
			var result = op(dep);
		}
		
		visited[dep.toString()] = result.implies;//If found that X->Y then save it
		if (result.implies)
			steps.push(result.step);
	
		return result.implies;
	}
	var result = _implies(dependency);
	
	if (result && historySection != null)//Write to the history section
	{
		steps.forEach(function(el){
			historySection.add(el);	
		});
	}
	return result;
}//End of function implies
