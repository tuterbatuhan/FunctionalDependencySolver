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
		relationList[i].dependencyList = reduce(relationList[i].dependencyList,innerSec);
		innerSec.add("\nLast");
		innerSec.add(relationList[i].dependencyList.join("\n"));
	}
	return null;
}

 
var RELATIONS = null;//Global variable for storing parsed relation set


/*
 * Called initially when document loaded
 * All ui events will be registered here
 *
 */
function init()
{
	var parseInputArea = document.getElementById("parse-input");
	var historyArea = document.getElementById("history-textarea");
	var outputArea = document.getElementById("output-textarea");
	
	function relationsParsed()
	{
		if (RELATIONS == null)
		{
			alert("Current relation set is empty");
			return false;
		}
		return true;
	}
	
	function updateRelations(relation)
	{
		//Called when relations updated
		if (relation != undefined)
		{
			RELATIONS = relation;
		}
		outputArea.value = RELATIONS.join("\n");
		
		//Update relation selection at implies
		var relationSelect = '<option selected disabled value="-1">No Relation</option>';
		RELATIONS.forEach(function(rel,index){
			relationSelect += '<option value="'+ index +'">' + rel.name + '</option>';
		});
		
		document.getElementById("implies-relation-select").innerHTML = relationSelect;
	}
	
	function updateHistory(){
		historyArea.value = HISTORY.toString();		
	}
	document.getElementById("parse-button").onclick=function()
	{
		HISTORY = new HistorySection();
		updateRelations(parse(parseInputArea.value));
		HISTORY.add("Input parsed");
		updateHistory();
	}
	
	document.getElementById("canonical-cover-button").onclick=function()
	{
		if (!relationsParsed())
			return;
		
		HISTORY = new HistorySection();
		
		findCanonicalCovers(RELATIONS);
		updateRelations();
		updateHistory(historyArea);
		writeOutput();
	}
	
	document.getElementById("implies-button").onclick = function()
	{
		if (!relationsParsed())
			return;
		var depStr = document.getElementById("implies-input-text").value;
		if (/^\s+$/g.test(depStr) || depStr.length == 0)
		{
			alert("Please enter a dependency to check");
			return;
		}
		var dependency = parseDependency(depStr);
		
		if (dependency == null)
		{
			alert("Dependency is invalid");
			return;
		}
		
		var relationIndex = document.getElementById("implies-relation-select").value;
		
		if (relationIndex == -1)
		{
			alert("Please select a relation");
			return;
		}
		var relation = RELATIONS[relationIndex];
		
		HISTORY = new HistorySection();
		
		if (implies(relation.dependencyList,dependency))
			HISTORY.add("Dependency " + dependency + " implies in " + relation.name);
		else
			HISTORY.add("Dependency " + dependency + " does not imply in " + relation.name);
		updateHistory();
	};
}

init();