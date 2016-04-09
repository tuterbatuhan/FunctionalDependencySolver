document.getElementById("parseButton").onclick=function()
{
	HISTORY = new HistorySection();
	var relationList = parse(document.getElementById("parseInput").value);
	findCanonicalCovers(relationList);
	updateHistory();
}
function findCanonicalCovers(relationList)
{
	document.getElementById("stepsList").value = "";
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
function cloneArray(arr){
	return arr.slice();
}
function updateHistory(){
	document.getElementById("stepsList").value = HISTORY.toString();		
}
