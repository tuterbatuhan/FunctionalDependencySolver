/************************************************************************
 *
 * main.js
 *  Implements UI specifications of the project
 *		functional dependency solver
 *
 *
 ************************************************************************/

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
		
		canonicalCover(RELATIONS);
		updateRelations();
		updateHistory(historyArea);
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
		
		var resultSection = HISTORY.createSection(0);
		var stepsSection = HISTORY.createSection(1);
		
		if (implies(relation.dependencyList,dependency,stepsSection))
			resultSection.add("Dependency " + dependency + " implies in " + relation.name);
		else
			resultSection.add("Dependency " + dependency + " does not imply in " + relation.name);
		updateHistory();
	};
}

init();
