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
		relationList[i].dependencyList = decompositionRule(relationList[i].dependencyList,sec.createSection(1));
		relationList[i].dependencyList = relationList[i].dependencyList.unique(relationList[i].dependencyList,sec.createSection(1));
	}
	return null;
}
function cloneArray(arr){
	return arr.slice();
}
function updateHistory(){
	document.getElementById("stepsList").value = HISTORY.toString();		
}
