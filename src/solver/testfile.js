import * as math from 'mathjs';
import nerdamer from'nerdamer/nerdamer.core.js';
import 'nerdamer/Solve.js';





//first parse the equation
var x = nerdamer('x^2+2=y-7*a');
let y = nerdamer('14z=3n');
console.log(nerdamer.expressions());
y= y.evaluate({z:2});
console.log(y.solveFor('n').toString())

x.evaluate('c=14');
//You can make substitutions to the equation
x = x.evaluate({a: '3',y:'2'});
y= y.evaluate({a: '3',y:'2'});
console.log(x.toString()); //2+x^2=-7*x^2+21+y
var solutions = x.solveFor('x');
console.log(solutions.toString()); //(1/16)*sqrt(32*y+608),(-1/16)*sqrt(32*y+608)