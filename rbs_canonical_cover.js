/************************************************************
* rbs_canonical_cover.js
* Uses rbs.js 
* 
* Implements a rule based system for canonical cover problem
* Please refer the rbs.js in order to understand how to use rbs 
*
*
*************************************************************/
//Working Set section names
var SECTION_COMPLEX = 'complex'; //Represents complex section of the working set
var SECTION_CANONICAL = 'canonical'; // Represents simple section of the working set

//Rules for the rule based system
var rules = 
[
	//Full set creators
	//These rules use dependencies from canonical (Simple) section 
	//to create more complex dependencies
	//New dependencies that are created by these rules will be added to the
	//Complex section of the working set
	{
		name:'FullDecomposition',
		requires:[SECTION_CANONICAL],
		when:function(match1)
		{
			return match1.rhs.length > 1;
		},
		then: function(match)
		{
			this.add(SECTION_COMPLEX,new Dependency(match.lhs,[match.rhs[1]]));
			this.add(SECTION_COMPLEX,new Dependency(match.lhs,match.rhs.difference([match.rhs[1]])));
		}
	},
	{
		name:'FullTransitivity',
		requires:[SECTION_COMPLEX,SECTION_CANONICAL],
		when:function(match1,match2)
		{
			return match1.rhs.equals(match2.lhs);
		},
		then: function(match1,match2)
		{
			this.add(SECTION_COMPLEX,new Dependency(match1.lhs,match2.rhs));
		}
	},
	{
		name:'FullUnion',
		requires:[SECTION_COMPLEX,SECTION_CANONICAL],
		when:function(match1,match2)
		{
			return match1.lhs.equals(match2.lhs);
		},
		then: function(match1,match2)
		{
			this.add(SECTION_COMPLEX,new Dependency(match1.lhs,match1.rhs.union(match2.rhs)));
		}
	},
	
	//Canonical cover rules
	//These rules uses both complex and simple sections of the working set to simplify
	//the rules that are in the simple section
	//These rules also adds new dependencies into complex section of the working set
	// in order to prevent extra calculations of the new dependencies.
	{
		name:'CanonicalDecomposition',
		requires:[SECTION_CANONICAL],
		when:canDecomposed,
		then: function(match)
		{
			this.remove(SECTION_CANONICAL,match);
			
			var dep = new Dependency(match.lhs,[match.rhs[1]]);
			var rest = new Dependency(match.lhs,match.rhs.difference([match.rhs[1]]));
			this.add(SECTION_CANONICAL,dep);
			this.add(SECTION_CANONICAL,rest);
			this.add(SECTION_COMPLEX,dep);
			this.add(SECTION_COMPLEX,rest);
		}
	},
	{
		name:'CanonicalReduction',
		requires:[SECTION_CANONICAL,SECTION_COMPLEX],
		when:canReduced,
		then: function(match1,match2)
		{
			var reducedDependency = new Dependency(match1.lhs.difference(match2.rhs),match1.rhs);
			
			this.remove(SECTION_CANONICAL,match1);
			if (reducedDependency.lhs.length > 0)
			{
				this.add(SECTION_CANONICAL,reducedDependency);
				this.add(SECTION_COMPLEX,reducedDependency);
			}
		}
	},
	{
		name:'CanonicalRedundancy1',
		requires:[SECTION_COMPLEX,SECTION_COMPLEX,SECTION_CANONICAL],
		when:isRedundant,
		then: function(match1,match2,match3)
		{
			this.remove(SECTION_CANONICAL,match3);
		}
	}
]


/*
 *
 *
 */
function rbsCanonicalCover(dependencyList)
{
	var workingSet = new WorkingSet();
	var rbs = new RBS(rules);

	var s1 = workingSet.createSection(SECTION_CANONICAL);
	var s2 = workingSet.createSection(SECTION_COMPLEX);

	dependencyList.forEach(function(e){
		s1.addItem(e);
		s2.addItem(e);
	});
	
	rbs.forward(workingSet);
	return s1.toList();
}


//Util functions that are used in rule definitions
function canDecomposed(dependency)
{
	return dependency.rhs.length > 1;
}

function canReduced(match1,match2)
{
	if (match1.lhs.length < 2)
	{
		return false;
	}
	else
	{
		return match2.lhs.union(match2.rhs).isSubset(match1.lhs);
	}
}

function isRedundant(match1,match2,match3)
{
	return match1.rhs.equals(match2.lhs) &&
			match2.rhs.equals(match3.rhs) &&
			match1.lhs.equals(match3.lhs);
}

