document.getElementById("parseButton").onclick=function()
{
	HISTORY = new HistorySection();
	var relationList = parse(document.getElementById("parseInput").value);
	findCanonicalCovers(relationList);
}
function findCanonicalCovers(relationList)
{
	document.getElementById("stepsList").value = "";
	var can;
	for(var i=0;i<relationList.length;i++)
	{
		var sec = HISTORY.createSection(0);
		sec.add("For Relation: "+relationList[i].name);
		can = decompositionRule(relationList[i].dependencyList,sec.createSection(1));
		updateHistory();
	}
	return null;
}
function cloneArray(arr){
	return arr.slice();
}
function updateHistory(){
	document.getElementById("stepsList").value = HISTORY.toString();		
}
