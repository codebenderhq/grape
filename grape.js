 
const uri = 'https://sauveur.xyz/api/blacklabel/cli'
 
const cmdRun = async(command,msg) => {
    const cmd = command.split(' ')
    const p = Deno.run({
        cmd,
        stderr: "piped",
    })

    const {code} =  await p.status 
    // const rawOutput = await p.output();
    const rawError = await p.stderrOutput();
    console.log(msg)

    if (code === 0) {
        // await Deno.stdout.write(rawOutput);
    } else {
        const errorString = new TextDecoder().decode(rawError);
        console.log(errorString);
    }
}
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
        console.log('styles generated')
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

const new_project = async () => {
    const frame_installer = 'curl -sLO https://github.com/codebenderhq/backpack/releases/latest/download/binary.zip'
    const unzip_installer = 'unzip binary.zip'

    await cmdRun(frame_installer,'FRAME installed')
    await cmdRun(unzip_installer,'FRAME ready to be used')
}

const deno_task = async (arg) => { 
    const deno_option = `deno task ${arg}`
    await cmdRun(deno_option,'')
}

const generate = async (args) => {

    const type = args[1]
    const name = args[2]
    const other = args[3]


    if(type ==='page'){
        console.log(`generating ${name} page`)
    }

    if(type === 'service'){
        console.log(`generating ${name} service for the ${other ? other : 'index'} page`)
    }

    if(type === 'api'){
        console.log(`generating ${name} api and ${other} method`)
    }
}

if (import.meta.main) {
 
    const args = Deno.args
  
    if(args.length > 0)
    {
      switch (args[0]) {
        case "new":
            await new_project()
            break;
        case "create":
            await generate(args)
            break;
        case "tw":
            await devServe()
            break;
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
            deno_task(args[0])
          break;
      }
    }else{
        console.log('Welcome to grape');
        // console.log(instances)
    }
  }

