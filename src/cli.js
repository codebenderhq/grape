const fileNames = Deno.args;
// const env = Deno.env.toObject();


const commands = async (args) =>  {

  const p = Deno.run({
    cmd:[...args],
    stdout: "piped",
    stderr: "piped",
  });
  
  const { code } = await p.status();
  
  // Reading the outputs closes their pipes
  const rawOutput = await p.output();
  const rawError = await p.stderrOutput();
  
  if (code === 0) {
    // const rawString = new TextDecoder().decode(rawError);
    await Deno.stdout.write(rawOutput);
    // const rawOut = new TextDecoder().decode(rawOutput);
    return code
  } else {
    const errorString = new TextDecoder().decode(rawError);
    console.log(errorString)
    console.log('Setup your enviroment here --> https://codebenderhq.notion.site/4806ddc648e644d38e2223793a6a815e');
    return false
  }
  


}


const push = async (msg) => {
  const gitAdd = 'git add .'.split(' ')
  let code = commands([...gitAdd])
  if(await code === 0){
  const gitCommit = 'git commit -m'.split(' ')
  gitCommit.push(`${msg}`)
  code = commands([...gitCommit])
  if(await code === 0){
      const gitPush = `git push`.split(' ')
      code = commands([...gitPush])
  }
  }

}


const upgrade = async () => {

  const code = await commands(['deno','cache','--reload','https://sauveur.xyz/api/blacklabel/cli'])
 
  if(code === 0 ){
    console.log('backpack upgraded')
  }

}


if (import.meta.main) {
 
  if(Deno.args.length > 0)
  {
    switch ( Deno.args[0]) {
      case "push":
        push(Deno.args[1])
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
    try{
  
      const p = Deno.run({
          cmd: [
            "deno",
            "--version"
          ],
          stdout: "piped",
          stderr: "piped",
        });
        
        const { code } = await p.status();
        
        // Reading the outputs closes their pipes
        const rawOutput = await p.output();
        const rawError = await p.stderrOutput();
        
        if (code === 0) {
          console.log('Setup your enviroment here --> https://codebenderhq.notion.site/4806ddc648e644d38e2223793a6a815e');
          await Deno.stdout.write(rawOutput);
        } else {
          // const errorString = new TextDecoder().decode(rawError);
          console.log('Setup your enviroment here --> https://www.notion.so/codebenderhq/Bacpack-f88eb16087d248f1a845ffb3bfec3980');
        }
        
        Deno.exit(code)
  }catch{
  
      console.error('hello error')
  }
  }
}








