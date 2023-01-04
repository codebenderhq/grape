 
const uri = 'https://github.com/codebenderhq/backpack/releases/latest/download/grape.js'
 
const cmdRun = async(command,msg) => {
    const cmd = command.split(' ')
    const p = Deno.run({
        cmd,
        stderr: "piped",
    })

    const {code} =  await p.status 
    // const rawOutput = await p.output();
     const rawError = await p.stderrOutput();
    // console.log(msg)

    console.log(msg)
    if (code === 0) {
        // await Deno.stdout.write(rawOutput);
    } else {
        // const errorString = new TextDecoder().decode(rawError);
        // console.log(errorString);
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
    const styleCMD = `./tailwindcss -i ./src/input.css -o ./src/public/output.css  ${isBuild ? '--minify': '--watch' }`.split(' ')
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

const new_project = async (name) => {
    const frame_installer = 'curl -sLO https://github.com/codebenderhq/backpack-frame/archive/refs/heads/main.zip'
    const unzip_installer = `unzip -q main.zip`
    const rename_zip = `mv backpack-frame-main ${name}`

    await cmdRun(frame_installer,'FRAME installed')
    await cmdRun(unzip_installer,'FRAME ready to be used')
    await cmdRun(rename_zip,'FRAME ready to be used')


    // const srd_installer = 'curl -sLO https://github.com/codebenderhq/backpack-std/archive/refs/heads/main.zip'
    // const unzip_std = `unzip -q main.zip`
    // const rename_std = `mv backpack-frame-main ${name}`
}

const deno_task = async (arg) => { 
    const deno_option = `deno task ${arg}`
    await cmdRun(deno_option,'grape executed')
}

// generate templates for quicker development 
// will then edit the templates before generation to speed up development
const generate = async (args) => {

    let path;
    let template_path = `${Deno.cwd()}/std/.frame/templates`
    const type = args[1]
    const name = args[2]
    const instance = args[4]
    const other = args[5]


    // create page and service together
    if(type ==='page'){
        console.log(`generating ${name} page for ${instance} instance`)
        path = `${Deno.cwd()}/src/_app/${instance}/pages`
        Deno.mkdir(path,{ recursive: true })
        await Deno.copyFile(`${template_path}/index.html`, `${path}/${name}.html`);
    }

    if(type === 'service'){
        path = `${Deno.cwd()}/src/_app/${instance}/services`
        Deno.mkdir(path,{ recursive: true })
        console.log(`generating ${name} service for the ${instance} instance`)
        await Deno.copyFile(`${template_path}/service.js`, `${path}/${name}.js`);
    }
 
    const nameArray = name.split('/')
    let subPath = '';
    let _name = name;
    if(nameArray.length > 1){
        subPath = `/${nameArray[0]}`
        _name = nameArray[1]

    } 

    if(type === 'api'){
        path = `${Deno.cwd()}/src/_app/${instance}/api${subPath}`
        console.log(path)
        Deno.mkdir(path,{ recursive: true })
        console.log(`generating ${name} api for the ${instance} instance`)
        await Deno.copyFile(`${template_path}/api.js`, `${path}/${_name}.js`);
    }
}

if (import.meta.main) {
 
    const args = Deno.args
  
    if(args.length > 0)
    {
      switch (args[0]) {
        case "new":
            await new_project(args[1])
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

