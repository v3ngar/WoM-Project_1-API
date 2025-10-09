const WebSocket = require('ws')

require('dotenv').config()

const PORT = process.env.PORT || 5000
const wss = new WebSocket.Server({ port: PORT });
const clients = new Set();


// URL example: ws://my-server?token=my-secret-token
wss.on('connection', (ws, req) => {
    //console.log('Client connected');

    // Check valid token (set token in .env as TOKEN=my-secret-token )
    const urlParams = new URLSearchParams(req.url.slice(1));
    if (urlParams.get('token') !== process.env.TOKEN) {
        console.log('Invalid token: ' + urlParams.get('token'));
        
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: Invalid token.'
        }));
        ws.close();
    }

    if (!clients.has(ws)) {
        console.log("new client connected!");
        clients.add(ws);
    }


    ws.on('message', (message) => {
        console.log('Received message:', String(message));

        // Send a response back to the client along with some other info
        clients.forEach(client => {
            client.send(JSON.stringify({
                status: 0,
                msg: String(message).toUpperCase()
            }));
        })

    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});