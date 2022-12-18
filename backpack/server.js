// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const html_middleware = async (sitemap, pathname, req)=>{
    const activeSite = sitemap[pathname];
    const res = activeSite ? activeSite : sitemap['/@'] ? sitemap['/@'] : sitemap['/error'];
    if (res.isJSX) {
        const jsxResponse = await import(`../src/_server/public/${res.page}`);
        return jsxResponse.default();
    }
    return new Response(res.page, {
        headers: {
            "content-type": "text/html"
        }
    });
};
const asset_middlware = async (pathname, request, path)=>{
    try {
        const type = pathname.split('.').pop();
        const content_type = `text/${type}`;
        const file_path = `${path}/assets${pathname}`;
        console.log(file_path);
        console.log(Deno.cwd());
        const file = await Deno.open(file_path, {
            read: true
        });
        const content = file.readable;
        if (type === 'css') {
            return new Response(content, {
                headers: {
                    "content-type": content_type,
                    "access-control-allow-origin": "*",
                    "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
                }
            });
        } else {
            return new Response(content, {
                headers: {
                    "content-type": request.headers.get('accept').split(',')[0],
                    "access-control-allow-origin": "*",
                    "Access-Control-Allow-Headers": "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
                }
            });
        }
    } catch (err) {
        console.log(err.message);
    }
};
const script_middleware = async (sitemap, pathname, req)=>{
    const referer = req.headers.get('referer');
    const activeSite = sitemap[pathname];
    const res = activeSite ? activeSite : sitemap['/error'];
    let prop = JSON.parse(res.onBuildResult);
    if (res.onServer) {
        const param = referer.split('/').pop();
        const serverProps = {
            param
        };
        const serverSideScript = eval(`(${res.onServer})(${JSON.stringify(serverProps)})`);
        prop = {
            ...prop,
            onServerResult: await serverSideScript
        };
    }
    return new Response(`(${res.script})(${JSON.stringify(prop)})`, {
        headers: {
            "content-type": "text/javascript"
        }
    });
};
const valid_domain = (referer)=>{
    console.log(referer);
    return [
        'sauveur.xyz',
        'http://localhost:8080/',
        'mmereko.co.za'
    ].includes(referer);
};
const is_authenticated = (auth)=>{
    return [
        Deno.env.get('SERVER_KEY')
    ].includes(auth);
};
const handler = (value)=>{
    return new Function(value);
};
const api_middleware = async (sitemap, pathname, request)=>{
    let response;
    try {
        const auth = request.headers.get("authorization");
        const referer = request.headers.get("referer");
        if (!is_authenticated(auth) && !valid_domain(request.headers.get("referer")) && !referer) {
            throw new Error('Unotharized');
        }
        const isFormReq = request.headers.get("content-type") === "application/x-www-form-urlencoded";
        if (request.method === "GET") {
            const func = handler(`
      const request = ${JSON.stringify({
                method: request.method
            })}
      ${sitemap[pathname]}`);
            const json = await func();
            response = Response.json(json, {
                status: json.status
            });
        } else if (request.method === "POST") {
            let data = {};
            if (isFormReq && referer) {
                let referer1 = new URL(request.headers.get("referer"));
                let _data = new URLSearchParams(await request.text());
                for (const key of _data.keys()){
                    const value = _data.get(key);
                    if (value !== "") {
                        data[key] = value;
                    }
                }
                for (var key1 of referer1.searchParams.keys()){
                    _data.set(key1, referer1.searchParams.get(key1));
                }
            } else if (isFormReq && !referer) {
                throw new Error('Form request require referer');
            } else {
                data = await request.json();
            }
            const func1 = handler(`
      const request = ${JSON.stringify({
                method: request.method
            })}
      const body = ${JSON.stringify(data)}
      ${sitemap[pathname]}`);
            const json1 = await func1();
            if (isFormReq && json1) {
                let page = '/status';
                let replace = [
                    {
                        name: "msg",
                        value: json1.msg
                    },
                    {
                        name: "uri",
                        value: json1.uri ? json1.uri : '/'
                    },
                    {
                        name: "cta",
                        value: json1.cta
                    }
                ];
                if (json1.custom) {
                    page = json1.custom;
                    replace = json1.replace;
                }
                const urlPath = page.split('/');
                urlPath.shift();
                return await html_middleware(app, page, urlPath, request, replace);
            }
            response = Response.json(json1, {
                status: json1.status
            });
        } else if (request.method == "PUT") {
            let data1 = await request.blob();
            const func2 = handler(`
      const request = ${JSON.stringify({
                method: request.method
            })}
      const body = ${JSON.stringify(data1)}
      ${sitemap[pathname]}`);
            const _response = await func2();
            response = new Response(JSON.stringify(_response), {
                headers: {
                    "content-type": "application/json"
                },
                status: 200
            });
        }
    } catch (err) {
        globalThis.errorObject = {
            title: `SERVER:API:ERROR:${request.url}`,
            msg: err.message
        };
        console.log(globalThis.errorObject);
        return await html_middleware(sitemap, '/error');
    }
    return response;
};
const webSocket_middleware = async (pathname, request)=>{
    if (request.headers.get("upgrade") === "websocket") {
        const { socket: ws , response  } = Deno.upgradeWebSocket(request);
        const handleConnected = ()=>console.log("Connection established");
        ws.onopen = ()=>handleConnected();
        const handleDisconnected = ()=>console.log("Connection closed");
        ws.onclose = ()=>handleDisconnected();
        const handleError = (e)=>console.log(e instanceof ErrorEvent ? e.message : e.type);
        ws.onerror = (e)=>handleError(e);
        const handleMessage = (ws, msg)=>{
            ws.send("You have a new message");
            console.log(msg);
        };
        ws.onmessage = (e)=>handleMessage(ws, e.data);
        console.log("created websocket connection as ws://localhost:8000");
        return response;
    }
};
const set_domain = (request)=>{
    const ref = request.headers.get("referer");
    const tlc = ref ? ref.split('.').pop() : 'localhost';
    if (request.headers.get("domain")) {
        window.domain = request.headers.get("domain");
    } else if (!tlc.includes('localhost')) {
        window.domain = 'live';
    } else {
        window.domain = 'dev';
    }
};
const middleware = async (request, info)=>{
    try {
        set_domain(request);
        const { pathname  } = new URL(request.url);
        const domain = request.headers.get('host').split(':')[0];
        const localDev = Deno.env.get('LOCAL');
        const serverSrc = Deno.env.get('REMOTE');
        const sitemapSrc = localDev ? localDev : domain === Deno.env.get('QA_ENV_DOMAIN') ? `${serverSrc}/d/${pathname}` : `${serverSrc}/p/${domain}`;
        const sitemap = await import(`.${sitemapSrc}/sitemap.json`, {
            assert: {
                type: "json"
            }
        });
        const isFormType = request.headers.get("content-type") === 'application/x-www-form-urlencoded';
        const isApiCall = pathname.includes('api') || request.headers.get("host").includes('api');
        const isFileRequest = pathname.includes('.');
        const isScriptRequest = pathname.includes('.js');
        if (pathname == '/socket') {
            return await webSocket_middleware(pathname, request);
        }
        if (isScriptRequest) {
            const path = pathname.split('.').shift();
            return script_middleware(sitemap.default, path, request);
        } else if (isFileRequest) {
            console.log(sitemapSrc);
            return asset_middlware(pathname, request, sitemapSrc);
        }
        if (isApiCall || isFormType) {
            return api_middleware(sitemap.default, pathname, request);
        } else {
            return html_middleware(sitemap.default, pathname, request);
        }
    } catch (err) {
        let msg = "Internal server error";
        return Response.json({
            msg,
            trace: err.message
        }, {
            status: 500
        });
    }
};
function removeEmptyValues(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([, value])=>{
        if (value === null) return false;
        if (value === undefined) return false;
        if (value === "") return false;
        return true;
    }));
}
function difference(arrA, arrB) {
    return arrA.filter((a)=>arrB.indexOf(a) < 0);
}
const RE_KeyValue = /^\s*(?:export\s+)?(?<key>[a-zA-Z_]+[a-zA-Z0-9_]*?)\s*=[\ \t]*('\n?(?<notInterpolated>(.|\n)*?)\n?'|"\n?(?<interpolated>(.|\n)*?)\n?"|(?<unquoted>[^\n#]*)) *#*.*$/gm;
const RE_ExpandValue = /(\${(?<inBrackets>.+?)(\:-(?<inBracketsDefault>.+))?}|(?<!\\)\$(?<notInBrackets>\w+)(\:-(?<notInBracketsDefault>.+))?)/g;
function parse(rawDotenv, restrictEnvAccessTo = []) {
    const env = {};
    let match;
    const keysForExpandCheck = [];
    while((match = RE_KeyValue.exec(rawDotenv)) != null){
        const { key , interpolated , notInterpolated , unquoted  } = match?.groups;
        if (unquoted) {
            keysForExpandCheck.push(key);
        }
        env[key] = typeof notInterpolated === "string" ? notInterpolated : typeof interpolated === "string" ? expandCharacters(interpolated) : unquoted.trim();
    }
    const variablesMap = {
        ...env,
        ...readEnv(restrictEnvAccessTo)
    };
    keysForExpandCheck.forEach((key)=>{
        env[key] = expand(env[key], variablesMap);
    });
    return env;
}
const defaultConfigOptions = {
    path: `.env`,
    export: false,
    safe: false,
    example: `.env.example`,
    allowEmptyValues: false,
    defaults: `.env.defaults`,
    restrictEnvAccessTo: []
};
function configSync(options = {}) {
    const o = {
        ...defaultConfigOptions,
        ...options
    };
    const conf = parseFile(o.path, o.restrictEnvAccessTo);
    if (o.defaults) {
        const confDefaults = parseFile(o.defaults, o.restrictEnvAccessTo);
        for(const key in confDefaults){
            if (!(key in conf)) {
                conf[key] = confDefaults[key];
            }
        }
    }
    if (o.safe) {
        const confExample = parseFile(o.example, o.restrictEnvAccessTo);
        assertSafe(conf, confExample, o.allowEmptyValues, o.restrictEnvAccessTo);
    }
    if (o.export) {
        for(const key1 in conf){
            if (Deno.env.get(key1) !== undefined) continue;
            Deno.env.set(key1, conf[key1]);
        }
    }
    return conf;
}
function parseFile(filepath, restrictEnvAccessTo = []) {
    try {
        return parse(new TextDecoder("utf-8").decode(Deno.readFileSync(filepath)), restrictEnvAccessTo);
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) return {};
        throw e;
    }
}
function expandCharacters(str) {
    const charactersMap = {
        "\\n": "\n",
        "\\r": "\r",
        "\\t": "\t"
    };
    return str.replace(/\\([nrt])/g, ($1)=>charactersMap[$1]);
}
function assertSafe(conf, confExample, allowEmptyValues, restrictEnvAccessTo = []) {
    const currentEnv = readEnv(restrictEnvAccessTo);
    const confWithEnv = Object.assign({}, currentEnv, conf);
    const missing = difference(Object.keys(confExample), Object.keys(allowEmptyValues ? confWithEnv : removeEmptyValues(confWithEnv)));
    if (missing.length > 0) {
        const errorMessages = [
            `The following variables were defined in the example file but are not present in the environment:\n  ${missing.join(", ")}`,
            `Make sure to add them to your env file.`,
            !allowEmptyValues && `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`
        ];
        throw new MissingEnvVarsError(errorMessages.filter(Boolean).join("\n\n"), missing);
    }
}
function readEnv(restrictEnvAccessTo) {
    if (restrictEnvAccessTo && Array.isArray(restrictEnvAccessTo) && restrictEnvAccessTo.length > 0) {
        return restrictEnvAccessTo.reduce((accessedEnvVars, envVarName)=>{
            if (Deno.env.get(envVarName)) {
                accessedEnvVars[envVarName] = Deno.env.get(envVarName);
            }
            return accessedEnvVars;
        }, {});
    }
    return Deno.env.toObject();
}
class MissingEnvVarsError extends Error {
    missing;
    constructor(message, missing){
        super(message);
        this.name = "MissingEnvVarsError";
        this.missing = missing;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
function expand(str, variablesMap) {
    if (RE_ExpandValue.test(str)) {
        return expand(str.replace(RE_ExpandValue, function(...params) {
            const { inBrackets , inBracketsDefault , notInBrackets , notInBracketsDefault  } = params[params.length - 1];
            const expandValue = inBrackets || notInBrackets;
            const defaultValue = inBracketsDefault || notInBracketsDefault;
            return variablesMap[expandValue] || expand(defaultValue, variablesMap);
        }), variablesMap);
    } else {
        return str;
    }
}
if (!(Deno.readTextFileSync instanceof Function)) {
    console.warn(`Deno.readTextFileSync is not a function: No .env data was read.`);
} else {
    configSync({
        export: true
    });
}
const server = async (request, info)=>{
    return middleware(request, info);
};
export { server as server };
