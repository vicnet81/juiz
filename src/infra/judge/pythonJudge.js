const DriveJudge = require('./driveJudge');
const fs = require('fs');
class PythonJudge extends DriveJudge{
    constructor(path){
        super();
        this._pathInput = "./python/input/"+path;
        this._pathOutput = "./python/output/"+path;
    }
    deliberate(){
        this.get_content().then((content)=>{
            fs.writeFileSync('./python/main.py',content);
            let tests = fs.readdirSync(this._pathInput);
            
            let points = Array(tests.length).fill(Math.floor(100/tests.length));
            points[0] += 100 - points.reduce((accumulator, currentValue) => accumulator + currentValue);
            console.log(points);
            let testFault = 0;
            for(let i=0;i<tests.length;i++){
                let cmd = `python main.py < ${this._pathInput}/${tests[i]}`;
                try {
                    const exec = require('child_process').execSync;

                    let out = exec(cmd,{timeout: 1000,killSignal: 'SIGKILL'}).toString();
                    let outtest = fs.readFileSync(`${this._pathOutput}/${tests[i]}`).toString();
                    if(out==outtest){
                       this.assert(true,"",points[i]);
                    }else{
                       testFault++; 
                    }
                } catch (error) {
                    console.log(error);
                    let typeError;
                    if(/(?<typeError>(ETIMEDOUT)|(EOFError)|(SyntaxError)|(TypeError)|(NameError))/.test(error.message)){
                        typeError = error.message.match(/(?<typeError>(ETIMEDOUT)|(EOFError)|(SyntaxError)|(TypeError)|(NameError))/).groups.typeError;
                        
                    }else{
                        typeError=undefined;
                    }
                    switch (typeError) {
                        case "ETIMEDOUT":
                            this.assert(false,`teste excedeu o limite de tempo de execução`,0);
                            break;
                        case "EOFError":
                            this.assert(false,`código submetido solicita mais dados que o fornecido pelo teste`,0);
                            break;
                        case "SyntaxError":
                        case "TypeError":
                        case "NameError":
                            let groups = error.message.match(/line (?<line>\d+)[^\n]*\n(?<code>([^\n]*\n)*)(?<error>[^\n]*\n)$/).groups; 
                            this.assert(false,`${groups.error}\nLinha ${groups.line}:${groups.code}.`,0);                           
                            break;
                        default:
                            this.assert(false,`${error.message}`,0);
                            break;
                    }
                   // console.log(typeError);  
                   // let groups = error.message.match(/line (?<line>\d+)[^\n]*\n(?<code>([^\n]*\n)*)(?<error>[^\n]*\n)$/).groups; 
                   // this.assert(false,`${groups.error}\nLinha ${groups.line}:${groups.code}.`,0);
                    break;
                }
            }
            this.assert(testFault==0,`${testFault} teste(s) falharam de um total de ${tests.length}`,0);
            this.publish();
        });
        
    }

}

module.exports = PythonJudge;
