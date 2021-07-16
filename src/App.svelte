<script>
	import  {index, log } from "mathjs";
	import { createEquation } from "./solver/equation";
	import { MakeSub } from './solver/solver';
	import * as math from 'mathjs';
	// import  math from "mathjs";
	let equationStrings = [];
	let equations = [];

	let globalScope = {};
	let explicitVars = [];
	let eqInput = "";
	
	let solveStepString = [];

	function addEquationClick() {
		equationStrings.push("");
		equationStrings = equationStrings;
		equations.push(createEquation(""));
		console.log("Equation Strings: ");
		console.log(equationStrings);
	}

	function eqInputTextUpdate(eqIndex) {
		try {
			equations[eqIndex].setInputString(equationStrings[eqIndex]);
			updateScopes(eqIndex);
			for(let i = 0;i<equations[eqIndex].localVariables.length;i++){
				if(! equations[eqIndex].localVariables[i] in globalScope){
					globalScope[equations[eqIndex].localVariables[i]] = null;
				}
			}
			// equations[eqIndex].updateLocalScope(globalScope);
		
			equations[eqIndex] = equations[eqIndex];
		} catch (err) {
			console.log(err);
		}	
		updateScopes(eqIndex);
		equations[eqIndex] = equations[eqIndex];
	}

	function editScopeByInput(varName, value) {
		console.log("Entered editScopeByInput");
		console.log("ExplicitVars: "+explicitVars);
		if (explicitVars.includes(varName)) {
			globalScope[varName] = value;
			for(let i =0;i<equations.length;i++){
				console.log("Doing updateLocalScope for: "+i);
				equations[i].updateLocalScope(globalScope);
			}
		} else {
			if (varName in globalScope) {
				globalScope[varName] = null;
			}
		}
	}
	function editScopeBySolving(varName,value){
		globalScope[varName] = value;
		for(let i =0;i<equations.length;i++){
			equations[i].updateLocalScope(globalScope);
		}
		equations = equations;
	}

	function updateScopes(index){

		for(let v of equations[index].localVariables){
			if(! (v in globalScope)){
				if(equations[index].localScope[v]!=null)
					globalScope[v] = equations[index].localScope[v];
				else
					globalScope[v] = null;
			}else{
				if(globalScope[v]!=null)
					equations[index].localScope[v] = globalScope[v];
			}
		}
	}
	function setExplicitVar(varName) {
		if (!explicitVars.includes(varName)) {
			explicitVars.push(varName);
		}
	}
	function removeExplicitVar(varName) {
		if (explicitVars.includes(varName)) {
			explicitVars.splice(explicitVars.indexOf(varName), 1);
		}
	}
	function getAmountOfExplicitVars(eq){
		let c = 0;
		for(let i = 0;i<eq.localVariables.length;i++){
			if(eq.localVariables[i] in explicitVars)
				c++;
		}
		return c;
	}
	function checkExplicitVarOverload(){
		let err = [];
		for(let i = 0;i<equations.length;i++){
			if(getAmountOfExplicitVars(equations[i]) == equations[i].localVariables.length){
				equations[i].errorString = "Clear one of the explicit variables.";
				err.push(i);
			}else{
				equations[i].errorString = "";
			}
		}
		return err;
	}
	function solveSingleMissingVar(eq){
		//todo code
		let v = null;
		for(let i =0;i<eq.localVariables.length;i++){
			if(!globalScope[eq.localVariables[i]]){
				v=eq.localVariables[i];
				break;
			}
		}
		if(!v){
			throw {"function:":"solveSingleMissingVar","error:":"var not found"};
		}
		if(v.length>1){console.log("AGHHHHhhhhhhhhhaaaaaaaaa");}
		let sol = MakeSub(v,eq.leftNode,eq.rightNode);
		solveStepString.push( v+" = "+sol.toString());
		solveStepString = solveStepString;
		console.log("EK IS HIER");
		let parser = math.parse(sol);
		console.log("parser: "+parser.toString());
		let code = parser.compile();
		console.log("code: "+code.toString());
		let newValue = code.evaluate(globalScope);
		console.log("newValue: "+newValue.toString());
		editScopeBySolving(v,newValue);
		equations = equations;
	}
	function solveForMissingVariables(){
		console.log("Enters solve");
		let vo = checkExplicitVarOverload;
		if(vo.length != 0){throw {"Error: ":"checkExplicitVarOverload return statement","equations:":vo};}
		let loopCount = 0;//in case of infinite loop. TODO REMOVE
		for(let i = 0;i<equations.length;i++){
			console.log("unknownVars at index "+i+":"+equations[i].unknownVars);
			if(equations[i].unknownVars == 1){
				try{					
					solveSingleMissingVar(equations[i]);
				}catch(error){
					console.log(error.toString());
				}
				i = 0;
				console.log("loop count: "+loopCount++);
			}
		}
		//simultaneously solve for 2 missing vars with adequete number of equations
		//solve for 3...
		//etc
				
	}
	function clearNonExplicitVarsAndUpdate(){
		for(let i =0;i<equations.length;i++){
			for(let j=0;j<equations[i].localVariables.length;j++){
				if(!explicitVars.includes(equations[i].localVariables[i]) && globalScope[equations[i].localVariables[i]]){
					editScopeBySolving(equations[i].localVariables[i],null);
				}
			}
		}
		solveStepString = [];
		solveForMissingVariables();
	}
	
</script>

<main>
	<p>15x+2y=1</p>	
	<p>x+y+a+b=1</p>	
	<div id="wrapper">
		<div id="leftScreen">
			<h1 class="heading">Equation writer and solver prototype</h1>
			<button on:click={addEquationClick}> Add Equation </button>
			{#each equationStrings as eqStr, index}
				{#if equations[index].leftNode && equations[index].rightNode}
					<p>
						{equations[index].leftNode.toString()} = {equations[
							index
						].rightNode.toString()}
					</p>
				{:else}
					<p>:{eqStr}</p>
				{/if}
				<div class = "eqInputDiv">
					<input
						type="text"
						bind:value={equationStrings[index]}
						on:keyup={() => eqInputTextUpdate(index)}
						class="valInput {(equations[index].errorString)?'eqInputError':'equationTextInput'}"
					/>
					{#if equations[index].errorString}
						<p class = "eqErrorString">{equations[index].errorString}</p>
					{/if}
				</div>
				<div class="parent flex-parent">
					{#each equations[index].localVariables as locVar, i}
						<div class="child flex-child parent flex-parent">
							<p class="child flex-child">{locVar}:</p>
							<input
								class="child flex-child {explicitVars.includes(
									locVar
								)
									? 'explicitlyDefinedInput'
									: ''}"
								type="number"
								step="0.000001"
								bind:value={equations[index].localScope[locVar]}
								on:keyup={function () {
									console.log(
										"var val of " +
											locVar +
											": " +
											equations[index].localScope[locVar]
									);
									if (!equations[index].localScope[locVar]) {
										removeExplicitVar(locVar);
										explicitVars = explicitVars;
									} else {
										setExplicitVar(locVar);
										explicitVars = explicitVars;
									}
									editScopeByInput(
										locVar,
										equations[index].localScope[locVar]
									);
									clearNonExplicitVarsAndUpdate();
									solveForMissingVariables();
								}}
							/>
							<div class="horizontal-spacer" />
						</div>
					{/each}
				</div>
			{/each}
		</div>
		<div id="rightScreen" class = "implicitlyDefinedInput">
			{#each Object.keys(globalScope) as key}
				<p>{key}:{globalScope[key]}</p>				
			{/each}
			<h3>Steps:</h3>
			{#each solveStepString as solLine}
				<p>{solLine}</p>
			{/each}
		</div>
	</div>
</main>

<style>
	main {
		text-align: left;
		padding: 1em;
		margin: 0 auto;
		max-width: 80%;
	}

	.heading {
		text-align: left;
	}

	/* textarea {
		width: 100%;
		align-self: flex-start;
	} */

	.flex-parent {
		display: inline-flex;
		flex-wrap: wrap;
	}
	.flex-child {
		flex: 1;
	}
	.horizontal-spacer {
		width: 20px;
	}

	.implicitlyDefinedInput {
		background-color: rgb(255, 102, 0);
		color: rgb(255, 255, 255);
	}
	.explicitlyDefinedInput {
		background-color: rgba(54, 54, 54, 0.404);
		color: rgb(255, 255, 255);
	}

	#wrapper {
		overflow: hidden; /* will contain if #first is longer than #second */
	}
	#leftScreen {
		float: left; /* add this */
		width: 60%;
	}
	#rightScreen {
		float: right;
		/* width: 100%; */
		width:40%;
		min-height: 20px;
		height: 100%;
	}
	.valInput{
		float:inline-start
	}
	.eqInputDiv{
		width:max-content;
	}
	.equationTextInput{
	}
	.eqInputError{
		background-color: crimson;
		float:left;
	}
	.eqErrorString{
		float:inline-end;
		color:crimson;
	}
</style>
