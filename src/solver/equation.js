import * as math from 'mathjs';

export function getVarsFromTree(node){
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
}

export function createEquation(inputString){
    let equation = {
        leftNode:null,
        rightNode:null,
        localVariables:[],
        localScope:{},
        inputString:inputString,
        errorString:null,
        unknownVars:-1,
        getUnknownVarCount:function(){
            let c = 0;
            for(let i =0;i<this.localVariables.length;i++){
                if(this.localVariables[i] in this.localScope)
                    if(this.localScope[this.localVariables[i]]){
                        c++;
                    }
            }
            return c;
        },
        init:function(){
            if(this.inputString == ""){console.log(inputString);return;}
            console.log("initialIndexOf(=): "+ this.inputString.indexOf('='));
            if(this.inputString.indexOf('=')>0){

                // console.log("inputString: "+this.inputString);
                let leftStr = this.inputString.substring(0,this.inputString.indexOf('='));
                // console.log("left node: "+leftStr);
                // console.log(this.leftNode);
                let rightStr = this.inputString.substring(this.inputString.indexOf('=')+1,this.inputString.length)
                // console.log("right node: "+rightStr);
                // console.log(this.rightNode);

                this.leftNode = math.parse(leftStr);
                this.rightNode = math.parse(rightStr);
                

                let singleNodeRepresentation = new math.OperatorNode('-','subtract',[this.leftNode,this.rightNode]);
                this.localVariables = getVarsFromTree(singleNodeRepresentation);
                // console.log(singleNodeRepresentation);
                // console.log("local vars: ");
                // console.log(this.localVariables);
                // console.log("Local var count: "+this.localVariables.length);
                this.unknownVars = this.localVariables.length;
            }  
            return this;
        },
        setInputString:function(inStr){
            this.inputString = inStr;
            this.init();
            this.updateLocalScope(this.localScope);
        },
        updateLocalScope:function(scope){
            let keys = Object.keys(scope);
            this.unknownVars = this.localVariables.length;
            for(let i =0;i<keys.length;i++){
                console.log("Scope: ");
                console.log(scope);
                if(this.localVariables.includes(keys[i]) && scope[keys[i]]){
                    this.localScope[keys[i]] = scope[keys[i]];
                    this.unknownVars--;
                }
            }
        }
    }
    return equation;
}