

const webSocket_middleware = async (pathname,request) => {
  if (request.headers.get("upgrade") === "websocket" && pathname === '/socket') {
    const { socket: ws, response } = Deno.upgradeWebSocket(request);
    
    const handleConnected = () => console.log("Connection established");
    ws.onopen = () => handleConnected();
    
    const handleDisconnected = () => console.log("Connection closed");
    ws.onclose = () => handleDisconnected();
    
    const handleError = (e) =>
      console.log(e instanceof ErrorEvent ? e.message : e.type);
    ws.onerror = (e) => handleError(e);
    
    const handleMessage = (ws, msg) => {
      ws.send("You have a new message");
      console.log(msg);
    };
    
    ws.onmessage = (e) => handleMessage(ws, e.data);
    
    console.log("created websocket connection as ws://localhost:8000");
    return response;
    }

  //   console.log(pathname,'ready to update')
  //   return new Response(JSON.stringify({status:'error', msg:'update under construction'}), {
  // headers:{
  //     "content-type": "application/json",
  //     "Referrer-Policy": "no-referrer",
  //     "access-control-allow-origin": "*"
  // },
  // status: 404 });
}

// if (request.headers.get("upgrade") === "websocket") {
// const { socket: ws, response } = Deno.upgradeWebSocket(request);

// const handleConnected = () => console.log("Connection established");
// ws.onopen = () => handleConnected();

// const handleDisconnected = () => console.log("Connection closed");
// ws.onclose = () => handleDisconnected();

// const handleError = (e) =>
//   console.log(e instanceof ErrorEvent ? e.message : e.type);
// ws.onerror = (e) => handleError(e);

// const handleMessage = (ws, msg) => {
//   ws.send("You have a new message");
//   console.log(msg);
// };

// ws.onmessage = (e) => handleMessage(ws, e.data);

// console.log("created websocket connection as ws://localhost:8000");
// return response;
// }

export default webSocket_middleware