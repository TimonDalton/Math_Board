import * as math from 'mathjs';
var lft;
var rght;
//start

//START
function equation(string,char){
    [lft, rght] = string.split("=");
    lft = expression(lft);
    rght = expression(rght);

    MakeSub(char,lft,rght);

}

function expression(string){
    var exp = math.simplify(string);
    exp = math.parse(exp.toString());

    return exp;
}

export function MakeSub(char,lft,rght){

    if(varCheck(lft,rght,char,true) == true && varCheck(lft,rght,char,false) == true){
        lft = minus(lft,rght);
        rght =  math.parse('0');
        lft = math.simplify(lft);
    }
    else if(varCheck(lft,rght,char,true) == false && varCheck(lft,rght,char,false) == false){
        return "Subject variable does not exist in left or right";
    }
    else{
        if(varCheck(lft,rght,char,true) == false && varCheck(lft,rght,char,false) == true){
            var swi = lft;
            lft = rght;
            rght = swi;
        }
    }

    var arr = [lft,rght];
        while(isSub(arr[0],arr[1],true,char) != true){
            if(varCheck(arr[0],arr[1],char,true) == true){
                arr = reverse(arr[0],arr[1],char);
            }else{
                var a = arr[0];
                arr[0] = arr[1];
                arr[1] = a;
                arr = reverse(arr[0],arr[1],char);
            }
            
        }
        
    // console.log("");
    // console.log("ANS: " +char+" = " + arr[1].toString());
    return arr[1].toString();

}



function reverse(lft,rght,char){
    var opI;
    var varLoc =0;

    if(lft.type == 'FunctionNode'){
        if(lft.toString().includes("log") == true){
            var sub = math.parse('e');
            rght = expo(sub,rght);
            lft = expo(sub,lft);
            

        }
    }

   else if(lft.type == 'OperatorNode'){
        if(lft.op == '+'){
            opI = findOp(lft,char,true);
            var sub = lft.args[opI];
            lft = minus(lft,sub);
            rght = minus(rght,sub);
            
        }
        
        else if(lft.op == '-'){
            if(lft.args.length == 1){
                var sub = math.parse('0');
            }else{
                opI = findOp(lft,char,true);
                varLoc = findOp(lft,char,false);
                var sub = lft.args[opI];
            }
    
            if(opI>varLoc){
                lft = plus(lft,sub);
                rght = plus(rght,sub);
            }else{
                lft = minus(lft,sub);
                rght = minus(rght,sub);
            }
            
            lft = math.simplify(lft);
            rght = math.simplify(rght);
            var n1 = math.parse('-1');
    
            lft = times(lft,n1);
            rght = times(rght,n1);
            
        }
        
        else if(lft.op == '^'){
                if(lft.args[0] == 'e'){
                    if(lft.args[1].toString().includes('log') == true){
                        lft = eFix(lft,char);
                    }else{
                        lft = lft.args[1];
                        rght = "log(" + rght.toString() +")";
                        rght = math.parse(rght);
                    }
                    
                }else{
                    var sub = div(math.parse('1'), lft.args[1]);
                    sub = math.parse(sub.toString());
                    sub = math.simplify(sub);
            
                    rght = expo(rght,sub);
                    lft = expo(lft,sub);
                }
        }
    
        else if(lft.op == '*'){
            opI = findOp(lft,char,true);
            var sub = lft.args[opI];
    
            lft = div(lft,sub);
            rght = div(rght,sub);
        }
        
        else if(lft.op == '/'){
            sub = lft.args[1];
            lft.args[1] = math.parse('1');
            rght = times(rght,sub);

            var h =0;
        }
    }
    lft = math.simplify(lft);
    rght = math.simplify(rght);
    
    var arrA = [lft,rght];

    return arrA;
}

function eFix(nodee,char){
    //this implements e^log laws
    var node = nodee.args[1];
    var sub = math.parse('e');
    var ret =  math.parse('1');

    while(true){
        if(node.args[0] == 'e' && node.op == '^'){
            node.args[0] = math.parse('1');
            node.op = '*';
            node = node.args[1];
        }
        if(node.op == '+' || node.op == '-'){
            
            node.args[0] = math.simplify(expo(sub,node.args[0]));
            node.args[1] = math.simplify(expo(sub,node.args[1]));

            node.op = '*';

            
            if(varCheck(node.args[0],rght,char,true) == true){
                ret = times(ret,node.args[1]);
                node = node.args[0];
            }
            else if(varCheck(node.args[1],rght,char,true) == true){
                //I did not check args[1] cause it lowkey scares me
                ret = times(ret,node.args[0]);
                node = node.args[1];
            }

        }
        else{
            if(node.toString().includes('log') == true){
                if(node.op != '*' && node.op != '/'){
                    node = node.args[0];
                }else{

                    if(node.args[0].toString().includes('log') == true){
                        node =  expo(node.args[0].args[0],node.args[1]);
                    }else{
                      node =  expo(node.args[1].args[0],node.args[0]);
                    }
                }
            }else{
               node =  expo(sub,node);
            }
            ret = times(ret,node);
            ret = math.simplify(ret);
            return ret;
        }
    
    }

}

function isSub(lft,rght,bool,char){
    //true means lft 
    //false means rght

    if(bool == true){
        if(lft.toString().length == 1 && varCheck(lft,rght,char,true) == true){
            return true;
        }else{
            return false;
        }
        
    }
    if(bool == false){
        if(rght.toString().length == 1 && varCheck(lft,rght,char,false) == true){
            return true;
        }else{
            return false;
        }
    }
}

function varCheck(lft,rght,char,bool){
    //true means lft 
    //false means rght
    var check = false;

    if(bool == true){
        //we must search left
        lft.traverse(function (lft, path, parent) {
                if(lft.name == char){
                    check = true;
                }
          })
    }else{
        //we must search right
        rght.traverse(function (rght, path, parent) {
                if(rght.name == char){
                    check = true;
                }
          })
    }
    return check;
}

function findOp(lft,char,bool){
    //we assume the args array exists
    //bool = true then find not x
    //bool = false then find x
    var num = 0;
    if(lft.args.length > 1){
        for(var i=0;i<lft.args.length;i++){
            var node = lft.args[i];
            if(bool ==  true){
                if(varCheck(node,rght,char,true) == false){
                    num =i;
                 }
            }else{
                if(varCheck(node,rght,char,true) == true){
                    num =i;
                 }
            }
           
        }
    }

    return num;
}

function minus(node1,node2){
    return new math.OperatorNode('-','subtract',[node1,node2]);
}

function plus(node1,node2){
    return new math.OperatorNode('+','add',[node1,node2])
}

function times(node1,node2){
    return new math.OperatorNode('*','multiply',[node1,node2])
}

function div(node1,node2){
    return new math.OperatorNode('/','divide',[node1,node2])
}
function expo(node1,node2){
    return new math.OperatorNode('^','pow',[node1,node2])
}

