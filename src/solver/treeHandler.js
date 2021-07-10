const { evaluate } = require('../../node_modules/mathjs');
const math = require('../../node_modules/mathjs');




// const node = math.parse('2 + x')   // returns the root Node of an expression tree
// const code = node.compile()        // returns {evaluate: function (scope) {...}}
// const evaluate = code.evaluate({x: 3}) // returns 5

// const parser = math.parser();

const node1 = new math.ConstantNode('x1');
const node2 = new math.ConstantNode('2');
const node3 = new math.OperatorNode('+', 'add', [node1, node2]);
const node4 = new math.FunctionNode('sqrt', [node3]);


// const code = node.compile()        // returns {evaluate: function (scope) {...}}
// const evaluate = code.evaluate({x: 3}) // returns 5

// parser.evaluate(node4.compile.toString());


console.log(node4.compile().evaluate({x1:3}));