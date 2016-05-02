/************************************************************
* rbs.js
* Implements a simple rule based 'expert :o' system
* 
* Only forward propagation supported
*
* Example Usage and Input formats
*	A Rule:
*		In order create a RBS instance, a list of rules must be defined first.
*		A rule is an object (JSON Object) that has the following properties:
*		-name:String that defines name of the rule. RBS does not requires name of the rules
*				to operate but it can be used for user to differentiate 
*				different rules from each other.
*		-requires:A list of strings that contains the section names that 
*				match will be searched.
*		-when: A function that returns a boolean that shows whether to apply the rule
*		-then: Runs when a rule is applicable with given working set items
*				(called when 'when' function returns true)
*			*Parameters of the when and then function are the items that are found for rule
*
* 	RBS:
*		Example rbs code:
*			var rbs = new RBS(Rule Set);			//Creates a rbs instance with given rules
*			var workingSet = new WorkingSet();  //A new working set must be created before
*												//forward propagaton
*			var section = workingSet.createSection('MainSection'); //Creates a section in ws
*
*			//Add initial facts to the working set
*			section.addItem('Has white stripes');
*			section.addItem('Carnivore');
*			
*			rbs.forward(workingSet);//Forward propagation
*			var items = section.toList();//Returns list of items of the section
*
*************************************************************/
//Represents an RBS instance with empty working set
function RBS(rules)
{
	this.workingSet = null;
	
	//Add new item to working set
	//Section is a part of the working set.
	this.add = function(sectionName,item)
	{
		var section = this.workingSet.getSection(sectionName);
		
		if (section != null)
		{
			return section.addItem(item);
		}
	}

	//Removes new item to working set
	this.remove = function(sectionName,item)
	{
		var section = this.workingSet.getSection(sectionName);
		
		if (section != null)
		{
			return section.removeItem(item);
		}
	}
	
	//Runs forward propagation on given facts
	//Facts are the initial items in the working set
	//Returns ultimate working set
	this.forward = function(workingSet)
	{
		this.workingSet = workingSet;
		do
		{
			this.forwardOnce();
		}while(this.workingSet.changed);
		return workingSet;
	}

	//Forward propagation
	//Applies rules once
	this.forwardOnce = function()
	{
		var workingSet = this.workingSet;
		this.workingSet.changed = false;//Set working set changed to false
								//This will determine whether a new item added to the last iteration
		//For each rules apply
		rules.forEach((function(rule){
			var sections = rule.requires.map(function(e){return workingSet.getSection(e)});
			var iterators = sections.map(function(e){return e.getIterator()});
			var states = iterators.map(function(e){return e()});
			while(states[0] != null)
			{
				if (rule.when.apply(this,states))
					rule.then.apply(this,states);
				states[states.length - 1] = iterators[states.length - 1]();
				
				for (var i = states.length - 1 ; i > 0 && states[i] == null ; i--)
				{
					iterators[i] = sections[i].getIterator();
					states[i-1] = iterators[i-1]();
					states[i] = iterators[i]();
				}
				
			}
		}).bind(this));
			
	}
}

//Represents a working set
function WorkingSet()
{
	var sections = {};
	this.changed = false;
	
	this.createSection = function(name)
	{
		if (sections[name] == undefined)
		{
			sections[name] = new WorkingSetSection(this,name);
			return sections[name];
		}
		else
		{
			return null;
		}
	}
	this.getSection = function(name)
	{
		return sections[name];
	}
	
	this.toList = function()
	{
		return Object.keys(sections).map(function(e){return sections[e].toList()})
									.reduce(function(prev,next){return prev.concat(next)});
	}
	
	this.toString = function()
	{
		var keys = Object.keys(sections);
		var str = "";
		for (var i = 0 ; i < keys.length ; i++)
		{
			str += ("Section " + keys[i]) + "\n";
			str += sections[keys[i]].toString() + "\n";
		}
		
		return str;
	}
}

//Represents a section in the working set
//Rules uses items in various sections
function WorkingSetSection(workingSet,name)
{
	var data = {};
	this.name = name;
	
	this.toList = function()
	{
		return Object.keys(data)
			.map(function(e){return data[e]})
			.filter(function(e){return e!=undefined});
	}
	
	this.toString = function()
	{
		return this.toList().join('\n');
	}
	this.addItem = function(item)
	{
		if (data[item] == undefined)
		{
			data[item] = item;
			workingSet.changed = true;
			return true;
		}
		return false;
	}
	
	this.removeItem = function(item)
	{
		if (data[item] != undefined)
		{
			delete data[item];
			workingSet.changed = true;
			return true;
		}
		return false;
	}
	
	this.getIterator = function()
	{
		var list = this.toList();
		var index = 0;
		
		var next = function(){
			if (index < list.length)
			{
				return list[index++];
			}
			else
				return null;
		}
		return next;
	}
}
