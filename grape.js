 
const uri = 'https://sauveur.xyz/api/blacklabel/cli'
 
const upgrade = async () => {

    const code = await commands(['deno','cache','--reload', uri])

    if(code === 0 ){
      console.log('backpack upgraded')
    }

}

const tailwindInit = async () => {
    try{
        await Deno.readTextFile("tailwind.config.js");
    }catch{
        const styleInitCmd = './tailwindcss init'.split(' ')
        const styleInitProcess = Deno.run(
                {
                    cmd:styleInitCmd,
                })
        await styleInitProcess.status()
    }

}

const tailwindRun = async (isBuild) => {
    console.log('generating styles')
    const styleCMD = `./tailwindcss -i ./src/input.css -o ./src/assets/output.css  ${isBuild ? '--minify': '--watch' }`.split(' ')
    const styleProcess = Deno.run({
        cmd:styleCMD,
        stdout: "piped",
        stderr: "piped",
    })

    const {code} =await styleProcess.status 
    const rawError = await styleProcess.stderrOutput();
    
    if (code === 0) {
        console.log('generated styles')
    } else {
        const errorString = new TextDecoder().decode(rawError);
        console.log(errorString);
    }
}

const devServe = async () => {

    try{
        await tailwindInit()
        tailwindRun()
        console.log('Happy Developing')
 
    }catch(err){
        console.log('err',err)
    }


}


const prodServe = async () => {

    try{
        await tailwindInit()
        tailwindRun(true) 
        console.log('Happy Hunting')
    }catch(err){
        console.log('err',err)
    }


}


if (import.meta.main) {
 
    if(Deno.args.length > 0)
    {
      switch ( Deno.args[0]) {
        case "build":
            await prodServe()
            break;
        case "help":
          console.log('Setup your enviroment here --> https://codebenderhq.notion.site/4806ddc648e644d38e2223793a6a815e');
          break;
        case "upgrade":
           upgrade()
          break;
        default:
          break;
      }
    }else{
        await devServe()

        // console.log(instances)
    }
  }

