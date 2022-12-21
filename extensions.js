import websocket_midleware from './src/_server/.middleware/websocket.js'


export const run_extensions = (pathname, request) => {
    websocket_midleware(pathname, request)
}