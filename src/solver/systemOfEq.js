import * as math from 'mathjs';
import nerdamer from'nerdamer/nerdamer.core.js'
import 'nerdamer/Solve'




function definedError(message,e){
    throw [message,e];
}

function createSystem(){
    let system = {
        equations:[],
        variables:[],
        systemState:"",


        createNewVar:function(name,val = null,implicit = false,isKnown = false){
            let variable = {
                var_name:name,
                val:val,
                implicitlyDefined:implicit,
                isKnown:isKnown

            }
            return variable;
        },
        addNewVar:function(new_var){
            clone = false;
            for (let i =0;i<this.variables.length;i++){
                if(this.variables[i]['var_name'] == new_var['var_name'])clone = true;
            }
            if(!clone)
                vars.append(new_var);
        },
        considerVarDiscontinuation:function(var_name,excludeIndex = -1){
            found = false;
            for (let i =0;i<this.equations.length && !found;i++){
                if(i != excludeIndex){
                    if(var_name in equations[i]['var_names']){
                        found = true;
                    }
                }
            }
            if(!found){//delete var
                let delIndex = -1;
                for(let i =0;i<this.variables.length;i++){
                    if(var_name==this.variables[i]['var_name']==var_name){
                        delIndex = i;
                        break;
                    }
                }
                
                this.variables.splice(delIndex,1);
            }
        },
        varsToScope(vars){
            let ret = {};
            for(v in vars)
                ret[v['var_name']]=v['val'];
            return ret;
        },
        getCurrentScope(){
            ret = {};
            for(let i = 0;i<this.variables.length;i++){
                if(this.variables[i].isKnown){
                    ret[v['var_name']]=v['val'];
                }
            }
            return ret;
        },
        getVarsFromTree:function(node){
            let functions = ['sin', 'asin', 'cos', 'acos', 'tan', 'atan', 'ln','e','pi','π','sqrt'];
            let vars = [];
            node.traverse(function (node) {
                switch (node.type) {
                  case 'SymbolNode':
                    if(!vars.includes(node.name)&&!functions.includes(node.name))
                        vars.push(node.name);
                    break
                  default:
                }
              });
            return vars;
        },

        createNewEquationFromString:function(eq_string){
            let equation = {
                inputString:eq_string,
                var_names:[],
                leftNode:null,
                rightNode:null,
                equationType:"unspecified",
                non_erroneous:false,
                statusIndex: 0,
                statuses:['empty','no = present','equation viable','missing variables','oversaturated explicit variables','solved'],
                
                update_internally:function(){
                    try{
                        let leftStr = this.inputString.substring(0,this.inputString.indexOf('='));
                        let rightStr = this.inputString.substring(this.inputString.indexOf('=')+1,this.inputString.length);
                        this.leftNode = math.parse(leftStr);
                        this.rightNode = math.parse(rightStr);
                        
                        let singleNodeRepresentation = new math.OperatorNode('-','subtract',[this.leftNode,this.rightNode]);
                        this.var_names = this.getVarsFromTree(singleNodeRepresentation);

                        statusIndex = 2;
                    }catch(e){
                        if(this.inputString == ""){
                            this.non_erroneous = false;
                            statusIndex = 0;
                            throw definedError("empty equation string",e);
                        }
                        if(this.inputString.indexOf('=')<=0){
                            this.non_erroneous = false;
                            statusIndex = 1;
                            throw definedError("no = present in equation string",e);
                        }
                    }
                },
                getNumberOfUnknowns:function(){
                    let count = 0;
                    for(n in this.var_names){
                        if(variables.findIndex(function(v){
                            return n == v.var_name;
                        })){
                            count++;
                        }                        
                    }
                    return count;
                }
            }
            // try{
                update_internally();
            // }catch(e){}
            return equation;
        },
        addEquation:function(equation){
            this.equations.append(equation);
            for(let i =0;i<equation['var_names'].length;i++){
                this.addNewVar(this.createNewVar(equation['var_names'][i]));
            }            
        },
        addEquationFromString(eq_string){
            this.addEquation(this.createNewEquationFromString(eq_string));
        },


        editEquationAtIndex:function (index,replacementEquation){
            if(index < this.equations.length){
                oldEqVars = equations[index]['var_names'];
                newEqVars = replacementEquation['var_names'];
                
                // varsToAdd = [];
                // varsToDelete = [];
                // contingentVars = [];

                oldEqVars.sort();
                newEqVars.sort();
                oldCount = 0;
                newCount = 0;
                while (oldCount != oldEqVars.length || newCount != newEqVars.length){

                    oldAhead = false;
                    newAhead = false;
                    listDone = false;
                    if(oldCount == oldEqVars.length){oldAhead = true;listDone = true;}
                    if(newCount == newEqVars.length){newAhead = true;listDone = true;}
                    if(!listDone)if(newEqVars[newCount] != oldEqVars[oldCount])if(newEqVars[newCount] > oldEqVars[oldCount])newAhead = true;else oldAhead = true;

                    if(oldAhead == newAhead){
                        newCount++;
                        oldCount++;
                    }else if(newAhead){
                        this.considerVarDiscontinuation(oldEqVars[oldCount],index);
                        newCount++;
                    }else{
                        this.addNewVar(this.createNewVar(newEqVars[newCount])),
                        newCount++;
                    }
                }   

                equations[index] = replacementEquation;
            }else{
                definedError("index >= this.equations.length")
            }
        },

        evaluateEquations:function(){//tries so solve all equations where their statusIndex = 2
            let unknowns = [];
            let evaluableEquationIndexes = [];
            for(let i =0;i<this.equations.length;i++){//1. scrape all of unknown variables and equations to be solved in to the above 2 lists 
                if(equations[i].statusIndex == 2){
                    let explicitCount = equations[i].var_names.length;
                    let knownCount = 0;
                    for(n in equations[i].var_names){//should create a list (named unkowns) of each unknown variable and which equations contain them
                        var_ = this.variables.find(function(v){
                            return n == v.var_name;
                        });
                        if(var_.isKnown)knownCount++;
                            else{
                                index = unknowns.findIndex(function(u){
                                    return u.name == var_.var_name;
                                })
                                if(index==-1){
                                    unknowns.push({name:var_.var_name,equationIndexes:[i]});
                                }else{
                                    unknowns[index].equationIndexes.push(i);
                                }
                            }
                        if(var_.implicitlyDefined)explicitCount--;
                    }
                    if(explicitCount == eq.var_name.length){
                        this.equations[i].statusIndex = 4;
                    }else{
                        if(equations[i].statusIndex == 2){
                            evaluableEquationIndexes.push(i);
                        }
                    }
                }
            }

            //2. Solve all possible equations and update the state of every equation.  
            let count = 0;
            while(count <= evaluableEquationIndexes.length){
                for(let i = 0;i<evaluableEquationIndexes.length;i++){
                    let idx = evaluableEquationIndexes[i];
                    let eq = equations[idx];
                    if(eq.getNumberOfUnknowns() == 1){
                        let v_ = eq.getUnknownVars();
                        let v  = v_[0];
                        let sols = nerdamer.solve(eq.eq_string,v.var_name);

                        let x = nerdamer(eq.eq_string);
                        let solutions = x.solveFor('x');
                        let ans = nerdamer(v.var_name +'='+solutions[0]);
                        x.evaluate({v.var_name: v.val});
                        
                    }
                }
                
                count++;
            }
        },

        getUnknownVars:function(){
            let ret = []
            for (v in vars){
                if(!v['known'])
                    ret.append(v);
            }
            return ret;
        },
        getImplicitVars:function(){
            let ret = []
            for (v in vars){
                if(!v['implicit'])
                    ret.append(v);
            }
            return ret;
        }
    }
    return system;
}

