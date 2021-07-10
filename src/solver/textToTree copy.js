
const math = require('../../node_modules/mathjs');

let inputStr = "13scos(0.58(s/y)) + 5s^2 - 10y";

//#region input to workable string format
//#region constants
const des_numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'X', 'Y', 'Z'];

const termwise_operations = ['+', '-'];
const interterm_operations = ['^', '*', '/'];
let function_operations = ['sin', 'asin', 'cos', 'acos', 'tan', 'atan', 'ln', 'e^'];

let all_operations = termwise_operations.concat(interterm_operations, function_operations);

let vars = [{ 'e': 2.718281828459045 }, { 'π': 3.14159265359 }];
let multichar_consts = ['pi'];

//#endregion



function operator_following_index(inStr, curIndex) {
    let functionOpRetIndex = -1;
    let ops = [];
    for (let i = 0; i < all_operations.length; i++) {
        if (inStr[curIndex] == all_operations[i][0]) {
            ops.push(i);
            if (all_operations[i].length == 1) {
                functionOpRetIndex = i;
            }
        }
    }
    let reach = 0;
    while (ops.length >= 1) {
        reach++;
        if (curIndex + reach == inStr.length) {
            return "";//possible problem
        }

        for (let i = 0; i < ops.length; i++) {
            if (all_operations[ops[i]].length == reach) {
                functionOpRetIndex = ops[i];
                ops.splice(i, 1);
            } else
                if (inStr[curIndex + reach] != all_operations[ops[i]][reach]) {
                    ops.splice(i, 1);
                }
        }
    }

    if (functionOpRetIndex == -1) { return ""; }
    return all_operations[functionOpRetIndex];

}

function number_following_curIndex(inStr, curIndex) {
    let numStr = "";
    let reach = 0;
    while (curIndex + reach < inStr.length) {
        if (!des_numbers.includes(inStr[curIndex + reach]) && inStr[curIndex + reach] != '.') {
            return numStr;
        }

        numStr += inStr[curIndex + reach];
        reach++;
    }
    return numStr;
}

function var_name_following_index(inStr, curIndex) {
    let retStr = "";
    if (!alphabet.includes(inStr[currentIndex]))
        return retStr;
    retStr += inStr[currentIndex];
    let reach = 1;
    let nfi = number_following_curIndex(inStr, curIndex + reach);
    if (nfi.length > 0) { return retStr + nfi; }
    if (inStr[curIndex + reach] == '_') {
        reach++;
        retStr += '_';
        if (curIndex + reach >= inStr.length) return retStr;
        while (alphabet.includes(inStr[curIndex + reach]) || des_numbers.includes(inStr[curIndex + reach])) {
            retStr += inStr[curIndex + reach]
            reach++;
            if (curIndex + reach >= inStr.length) return retStr;
        }
    }
    return retStr;

}

//#region string zoning
//constant marker =[];
//var marker = ##;
//operation marker = {};
//order marker = ();

//#endregion

//#region input todos
//TODO: 
/*
    1.preprocessing in input string:
        1.1 turn [] to ()
        1.2 turn pi in to π
    
    next update:
        1. add live invisible bracket placement like desmos
*/
//#endregion

console.log("input:        " + inputStr);
let processedStr = "";
let currentIndex = 0;

let previousType = 0;
/*
type == 0 | term +-
type == 1 | function cos tan
type == 2 | product /*
*/

function keyExists(key, list) {
    for (let i = 0; i < list.length; i++) {
        if (key in list[i]) return true;
    }
    return false;
}

//TODO:
//  ERROR WHEN ENTERING REPEATING ^. eg 2^2^3

//this currently assumes correct bracketing
while (currentIndex < inputStr.length) {
    if (inputStr[currentIndex] == ' ') {
        currentIndex++;
        continue;
    }

    if (previousType == 0) {
        processedStr += '(';
        previousType = 2;
    }
    let next = number_following_curIndex(inputStr, currentIndex);
    if (!(next === "")) {
        currentIndex += next.length;
        processedStr += '[' + next + ']';
        if (previousType == 3) {
            //console.log("Enters prev type = 3");

            processedStr += ")";
            previousType = 2;
        }
        if (inputStr[currentIndex] == '^') {
            if (previousType)
                processedStr += '(';
            previousType = 3;
        }
        continue;
    }
    next = operator_following_index(inputStr, currentIndex);
    if (!(next === "")) {
        if (termwise_operations.includes(next)) {
            processedStr += ')';
            previousType = 0;
        }
        processedStr += '{' + next + '}';
        currentIndex += next.length;

        continue;
    }
    next = var_name_following_index(inputStr, currentIndex);
    if (!(next === "")) {
        currentIndex += next.length;
        if (inputStr[currentIndex] == '^') {
            processedStr += '(';
            previousType = 3;
        }
        processedStr += '#' + next + '#';
        if (!keyExists(next, vars)) { let p = {}; p[next] = null; vars.push(p); }
        continue;
    }
    processedStr += inputStr[currentIndex];
    currentIndex++;
}
processedStr += ')';
console.log(processedStr);
//#endregion
//console.log("variables present: " + JSON.stringify(vars));
//console.log("type marked: " + processedStr);

//#region input validation

function count(searchChar, str) {
    let c = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] == searchChar) c++;
    }
    return c
}

if (count('(', inputStr) != count(')', inputStr)) { throw ("Number of brackets don't match"); }

//#endregion

//#region textToNode and helpers

//takes a string of nodes seperated by operators and chains them together to form a tree.
//if it encounters a bracketed string then it recursively creates a node

function getNextMatchingBracket(str) {//assumes str[0] == '('
    if (str[0] != '(') { throw 'first char of getNextMatchingBracket(str) must be "("'; }
    let substr = '';
    let bracketCount = 1;
    let i = 1;
    while (i < str.length) {
        if (str[i] == '(') bracketCount++;
        else if (str[i] == ')') bracketCount--;
        if (bracketCount == 0) {
            return substr;
        }
        substr += str[i];
        i++;
    }
    throw 'getNextMatchingBracket(str) of "' + str + '" has a bracket mismatch';

}
let indent = "   ";
let indents = 0;
function textToNode(str) {
    let subnodes = [];
    let operationStrings = [];

    let previousObjectIsSubnode = false;//if true then the interleaving nodes must be multiplied

    let tab = "";
    for (let i = 0; i < indents; i++) {
        tab += indent;
    }
    let i = 0;
    while (i < str.length) {
        if (str[i] == '(') {
            let substr = getNextMatchingBracket(str.slice(i, str.length));//gets the substring before next matching bracket but omits the brackets in returned substring
            if (substr.length == 0) throw '() is not valid input';
            i += substr.length + 2;
            //console.log(tab + '1.subnodes substr to push: ' + substr);
            indents++;
            subnodes.push(textToNode(substr));
            indents--;
            if (previousObjectIsSubnode) operationStrings.push('*');
            previousObjectIsSubnode = true;
            continue;
        }
        if (str[i] == '#') {
            let substr = str.slice(i + 1, str.length);
            // console.log('1.substr: '+substr);
            substr = substr.slice(0, substr.indexOf('#'));
            // console.log('2.substr: '+substr+', new i char: '+str[i]);
            if (substr.length == 0 || substr.indexOf('#') != -1) throw 'textToNode # substring is invalid';
            i += substr.length + 2;
            if (previousObjectIsSubnode) operationStrings.push('*');
            //console.log(tab + '2.subnodes substr to push: ' + substr);
            subnodes.push(new math.SymbolNode(substr));
            previousObjectIsSubnode = true;
            continue;
        }
        if (str[i] == '[') {
            let substr = str.slice(i + 1, str.length);
            substr = substr.slice(0, substr.indexOf(']'));
            if (substr.length == 0 || substr.indexOf(']') != -1) throw 'textToNode [ substring is invalid';
            i += substr.length + 2;
            // console.log('substr: '+substr+', new i char: '+str[i]);
            if (previousObjectIsSubnode) operationStrings.push('*');

            //console.log(tab + '3.subnodes substr to push: ' + substr);
            subnodes.push(new math.ConstantNode(substr));
            previousObjectIsSubnode = true;
            continue;
        }
        if (str[i] == '{') {//gees like iets nie
            let substr = str.slice(i + 1, str.length - 1);
            substr = substr.slice(0, substr.indexOf('}'));
            if (substr.length == 0 || substr.indexOf('}') != -1) throw 'textToNode { substring is invalid';
            i += substr.length + 2;
            if (function_operations.includes(substr)) {
                operationStrings.push('*');
                previousObjectIsSubnode = true;
            } else {
                previousObjectIsSubnode = false;
            }
            //console.log(tab + '4.operation substr to push: ' + substr);
            operationStrings.push(substr);
            continue;
        }
        throw ('invalid character "' + str[i] + '" at index ' + i + ' of substr "' + str + '" in textToNode');
    }
    //console.log('----------------------------------------');
    //console.log(tab + 'operations arr: ' + operationStrings);
    //console.log(tab + 'subnodes array: ' + subnodes);
    //console.log('----------------------------------------');

    let rootNode = null;
    let prevNode = null;
    //step 1: apply all of the function operations to their specific subnodes
    //step 2: apply 2 var operations
    
    for(let i = 0;i<operationStrings.length;i++) {
        if (function_operations.includes(operationStrings[i])) {
            subnodes[i] = new math.FunctionNode(operationStrings[i], [subnodes[i]]);
            if(subnodes.length == 1){return subnodes[i];}
            operationStrings[i] = '*';
        }
    }
    let opsMap = {
        '+':'add',
        '-':'subtract',
        '*':'multiply',
        '/':'divide',
        '^':'dotPow',
    }
    //console.log('operations '+operationStrings);
    //console.log('subnodes '+subnodes);
    while(subnodes.length>1){
        let node = subnodes.shift();
        let operator = operationStrings.shift();
        //console.log('operator: '+ operator);
        //console.log('opsMap[operator]: '+opsMap[operator]);
        subnodes[0] = new math.OperatorNode(operator,opsMap[operator], [node, subnodes[0]]);
    }
    //console.log('final subnode '+subnodes[0]);
    return subnodes[0];
    //TODO: make operation string array and subnode array weave in to a tree and return root node
    // return new math.SymbolNode('x');

}
//#endregion

let node = textToNode(processedStr);
console.log(node);

let scope = {
    s: 3,
    y: 4
}
// const code = node.compile();
// const eval = code.evaluate(scope);
// console.log(math.evaluate('3+5'));
// const code = node.compile()        // returns {evaluate: function (scope) {...}}
// const evaluate = code.evaluate(scope) // returns 5


const code = node.compile()        // returns {evaluate: function (scope) {...}}
const evaluate = code.evaluate(scope) // returns 5

console.log(evaluate);
// console.log(node);





























