<script>
	import * as math from "mathjs";
	import { forEach } from "mathjs";
	// import {defaultVars} from "solver/textToTreeParser";
	import {createExpression,defaultVars} from "./solver/textToTreeParser";
	//let {defaultVars,createExpression} = require('solver/textToTreeParser.js');


	let eqObj = null;
	let eqErr = "null";

	let variables = {};
	let eqInput = "";
	function onEnter(event) {
		let key = event.keyCode;
		let keyCode = event.keyCode;
		console.log("In onEnter function");
		console.log("event: "+event.keyCode);
		if (keyCode != 13) {
			return;
		}
		console.log("Pressed Enter");
		// eqObj = createExpression(eqInput);
		// variables = eqObj.variables;

		console.log(defaultVars);
		eqObj = createExpression(eqInput);
		variables = eqObj.variables;
		console.log(defaultVars);
		// try {
		// 	eqObj = createExpression(eqInput);
		// 	variables = eqObj.variables;
		// } catch(error) {
		// 	eqErr = error.message;
		// 	console.log("createExpression threw: "+ error.message);
		// }
	}
</script>

<main>
	<h1 class="heading">Equation writer and solver prototype</h1>
	<!-- <p>Visit the <a href="https://svelte.dev/tutorial">Svelte tutorial</a> to learn how to build Svelte apps.</p> -->
	<textarea bind:value={eqInput} on:keydown={onEnter} />
	{#if eqObj != null}
		{#if eqObj.unknownVariables ==0}
			<h1>{math.evaluate(eqObj.node)}</h1>
		{:else}
			<h1>{eqObj.node.toString()}</h1>
			{#each variables as variable,index}
				{#if !defaultVars.includes(variable)}
					<p>{variable['var_name']}:</p>
					<textarea bind:value={variable['value']}></textarea>					
				{/if}
			{/each}
		{/if}
	{:else if eqErr != "null"}
		<h1>{eqErr}</h1>
	{:else}
		<h1>"Enter an expression and hit enter"</h1>
	{/if}
	<h1 style="text-align: left">{"output: " + eqInput}</h1>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
		max-width: 75%;
	}

	.heading {
		text-align: left;
	}

	textarea {
		width: 100%;
		align-self: flex-start;
	}
</style>
