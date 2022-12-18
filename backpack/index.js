 
// import esBuild from 'https://esm.sh/esbuild'
// console.log(esBuild)

import posthtml from "npm:posthtml";
import customElements  from 'npm:posthtml-custom-elements'
import postcss  from 'npm:posthtml-postcss'
import autoprefixer from 'npm:autoprefixer'
import {server} from './server.js' 
import { serve, serveTls } from "https://deno.land/std@0.167.0/http/server.ts";


const postcssPlugins = [
    autoprefixer({})
]
const postcssOptions = {}
const filterType = /^text\/css$/

const regex = /[ \t]*\/\*\*\s*\n([^*]*(\*[^/])?)*\*\//g
let instances = {'/docs':[]}
const src =  './src';
const appSrc = `${src}/_app`;
const assetSrc ='./src/assets'
const uri = 'https://sauveur.xyz/api/blacklabel/cli'
const port = 8080;


const serverSrc = `${src}/_server`




const upgrade = async () => {

    const code = await commands(['deno','cache','--reload', uri])

    if(code === 0 ){
      console.log('backpack upgraded')
    }

}

const createDoc = async (_file) => {
    const text = await Deno.readTextFile(`${appSrc}/${_file}`);
    const found = text.match(regex);
    const docArray = []

    if(found){
        found.forEach(element => {
            const doc = element.split('\n')
            const docJSon = {}


            doc.forEach((x,k) => {

                if(x.includes('@name')){
                    docJSon.name = x.split(' ').pop()

                }else if(x.includes('@param')){
                    if(docJSon.param){
                        docJSon.param.push(x)
                    }else{
                        docJSon.param = [x]
                    }
                }else{
                    docJSon.desc = (docJSon.desc ? docJSon.desc : '') + x
                }

            })

            docArray.push(docJSon)
        });
    }


    return docArray
    // await Deno.writeTextFile("./hello.json", JSON.stringify(docArray));
    // console.log("File written to ./hello.txt");
}

const generateHtml = async (html,script) => {


    const envType = Deno.env.get('env');

//    console.log(script)
    const rawHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <meta name="description" content="{desc}" />
    <link rel="icon" type="image/png" href="favicon.png">
    <link rel="manifest" href="app.webmanifest">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="output.css">
    <script type="module" src="${script}.js"></script>
    </head>
    ${html}
    ${envType === 'development' ? `<script>(${hmrInject.toString()})()</script>`:''}
    </html>`
    let res = ''
    await posthtml([ postcss(postcssPlugins, postcssOptions, filterType) ])
    .use(customElements())
    .process(rawHtml).then((result) => res = result.html)

    return res
}

const generateJson = async (instanceName,fileMetadata,subEntry,rawData, docs) => {

    const _instanceName = instanceName.replaceAll('/landing','/').replace('//','/')
    // const instance = instances[`${_instanceName}`]

    if(subEntry.name === 'api'){

        instances[`/api${_instanceName}`] = rawData
        // if(element === 'default'){
        //     instances[`/api${_instanceName}`] = rawData[element]
        // }else{
        //     instances[`/api${_instanceName}/${subEntry.name}`] = rawData[element]
        // }

        // Object.keys(rawData).forEach(element => {
        //     if(element === 'default'){
        //         instances[`/api${_instanceName}`] = rawData[element]
        //     }else{
        //         instances[`/api${_instanceName}/${element}`] = rawData[element]
        //     }
        // });


    }else if(subEntry.name === 'pages'){
        if(fileMetadata.path.includes('jsx')){
            instances[`${_instanceName}`] = {page: rawData,isJSX: true}
        }else{
            instances[`${_instanceName}`] = {page: await generateHtml(rawData,_instanceName)}
        }
     

    }
    else if (subEntry.name === 'services') {
        instances[`${_instanceName}`] = {...instances[`${_instanceName}`] ,
        script: rawData.default.toString(),
        onBuildResult:  rawData.onBuild ? JSON.stringify(await rawData.onBuild()) : null,
        onServer: rawData.onServer ? rawData.onServer.toString() : null}
    }


    if(docs){
        docs.forEach(element => {
            instances[`/docs`] = {...instances['/docs'], [element.name]: element}
        })

    }
}

const bundleInstances = async (_path) => {

    try{
        for await (const dirEntry of Deno.readDir(`${appSrc}`)) {

            if(dirEntry.isDirectory && !(dirEntry.name !== _path  && _path)){
                const instanceName = `/${dirEntry.name}`

                const instanceDir =`${appSrc}${instanceName}`
                // const instanceStat = await Deno.lstat(instanceDir)
                // // mtime for setting running built & test marker
                // console.log(instanceStat, instanceName)
                for await (const subEntry of Deno.readDir(instanceDir)) {

                    for await (const fileEntry of Deno.readDir(`${instanceDir}/${subEntry.name}`)) {

                        let rawData
                        let docs
                        let path
                        if(fileEntry.isDirectory){
                            // implement recursive to support in depth files
                            break;
                        }


                        if(fileEntry.isFile){

                            path = `${instanceName}/${subEntry.name}/${fileEntry.name}`
                            // console.log(`.${instanceName}/${subEntry.name}/${fileEntry.name}`)


                            if(path.includes('services')){
                                rawData = await import(`${Deno.cwd()}/${appSrc}${path}?version=${new Date()}:${Math.random()}`);
                                // reading public docs only, should private docs be availible
                                docs = await createDoc(path)

                            }

                            if(path.includes('pages') || path.includes('api') ){
                                const decoder = new TextDecoder("utf-8");
                                const data = await Deno.readFile(`${instanceDir}/${subEntry.name}/${fileEntry.name}`);
                           
                                rawData =  decoder.decode(data);

                                if(path.includes('jsx')){
                                
                                    await Deno.mkdir(`${serverSrc}/public/${path.split('/')[1]}`,{ recursive: true })
                                    rawData = `${path.split('/')[1]}/${fileEntry.name}`
                                    await Deno.copyFile(`${Deno.cwd()}/${appSrc}${path}`, `${serverSrc}/public/${rawData}`);
                            
                                    // console.log(rawData.default())
                               }
                    
                            }
                        }


                        if(fileEntry.name.includes("index")){
                           
                            generateJson(instanceName,{instanceName, fileName: 'index', path},subEntry,rawData, docs)

                        }else{
                            const fileName = fileEntry.name.split('.').shift()
                            const instancePage = `${instanceName}/${fileName}`

                            generateJson(instancePage,{instanceName, fileName, path},subEntry,rawData, docs)
                        }

                    }
                }

            }

        }

        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!
        await Deno.writeTextFile(`${serverSrc}/sitemap.json`, JSON.stringify(instances));
        //  console.log('build complete', instances)
    }catch (err){
        console.error('unable to build',err)
        Deno.exit()
    }


}


const hmrInject = () => {
    let socket, reconnectionTimerId;

    const requestUrl = `${window.location.origin.replace("http", "ws")}/socket`


    // figure out why the script does not refresh
    function connect(callback) {
        // Close any existing sockets.
        if (socket) {
          socket.close();
        }

        // Create a new WebSocket pointing to the server.
        socket = new WebSocket(requestUrl);

        // When the connection opens, execute the callback.
        socket.addEventListener("open", callback);

        // // Add a listener for messages from the server.
        // socket.addEventListener("message", (event) => {
        //   // Check whether we should refresh the browser.
        //   if (event.data === "refresh") {
        //     log("refreshing...");
        //     refresh();
        //   }
        // });

        // Handle when the WebSocket closes. We log
        // the loss of connection and set a timer to
        // start the connection again after a second.
        // socket.addEventListener("close", () => {
        //   console.log("connection lost - reconnecting...");
        //   window.location.reload();
        // });
    }


   // Kick off the connection code on load.
   connect(() => {
    console.log('connected')
   });
}

// dev runner below
const devRun = async () => {
    // https://dev.to/craigmorten/how-to-code-live-browser-refresh-in-deno-309o
    // add hmr
    await bundleInstances()
    // console.log('Dev Buld Complete')
    const watcher = Deno.watchFs(appSrc);
    for await (const event of watcher) {
    // console.log(">>>> event", event);

    if (["any", "access"].includes(event.kind)) {
        continue;
    }

    await bundleInstances()
    // console.log('New Build Created')
    //    console.log(instances)
       // { kind: "create", paths: [ "/foo.txt" ] }
    }
}

const JITRun = async (path) => {
    await bundleInstances(path)
}

//might be absolute
const dev_watcher = async () => {
    const watcher_dev_files = Deno.watchFs("./src/_server");

    for await (const event of watcher_dev_files) {
//        console.clear()
        console.log('Happy Developing')
        console.log(`Your App is availible at http://localhost:${port}/`);
    }
}

const loopFile = async (dir) => {
    for await (const fileEntry of Deno.readDir(`${src}/${dir}`)) {
        const fileName = fileEntry.name;
        const fileSrc = `${dir}/${fileName}`
        if(fileEntry.isDirectory){
            await Deno.mkdir(`${serverSrc}/${fileSrc}`, { recursive: true })
            loopFile(`${dir}/${fileName}`)
        }else if(fileEntry.isFile){
            await Deno.copyFile(`./src/${fileSrc}`, `${serverSrc}/${fileSrc}`);
        }

    }
}

const assetManagement = async () => {

    for await (const dirEntry of Deno.readDir(assetSrc)) {
        const fileName = dirEntry.name;
        const fileSrc = `assets/${fileName}`
       if(dirEntry.isDirectory){
           await Deno.mkdir(`${serverSrc}/${fileSrc}`,{ recursive: true })

           await loopFile(`assets/${fileName}`)
       }else if(dirEntry.isFile){
           await Deno.copyFile(`${src}/${fileSrc}`, `${serverSrc}/assets/${fileName}`);
       }
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

const tailwindRun = (isBuild) => {
    const styleCMD = `./tailwindcss -i ./src/input.css -o ./src/_server/assets/output.css  ${isBuild ? '--minify': '--watch' }`.split(' ')
    const styleProcess = Deno.run({
        cmd:styleCMD,
        stdout: "piped",
        stderr: "piped",
    })
}
const devServe = async () => {

    try{
        await tailwindInit()
        tailwindRun()
        await assetManagement()
        console.log('Happy Developing')
        await devRun()
 
    }catch(err){
        console.log('err',err)
    }


}


const prodServe = async () => {

    try{
        await tailwindInit()
        tailwindRun(true)

        await assetManagement()
        console.log('Happy Hunting')
        await bundleInstances()
    }catch(err){
        console.log('err',err)
    }


}


if (import.meta.main) {

    serve(server, { port });
    if(Deno.args.length > 0)
    {
      switch ( Deno.args[0]) {
        case "jit":
             await JITRun(Deno.args[1])
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
          break;
      }
    }else{
        await devServe()

        // console.log(instances)
    }
  }

