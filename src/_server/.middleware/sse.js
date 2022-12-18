
export default () => {

   
      return new Response("retry: 10000\nevent: ping\ndata: some text\n\n",{
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/event-stream"
        }
    })
}