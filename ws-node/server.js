//requirements
const WebSocket = require('ws')
const jwt = require('jsonwebtoken')
require('dotenv').config()

//Kör på port 5000
const PORT = process.env.PORT || 5000

console.log('Startar websocket server...');
console.log('PORT:', PORT);
//console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Found' : 'Missing'); Visa JWT för testing

// new Map() för att hantera flera användare
const userConnections = new Map();

///Skapa websocket connection
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server kör på port ${PORT}`);
console.log('Väntar på uppkopplngar...');

wss.on('connection', (ws, req) => {
    console.log('=== WebSocket Connection Attempt ===');
    
    // Hämta JWT från headern
    const url = new URL(req.url, `http://${req.headers.host}`);
    const jwtToken = url.searchParams.get('token');
    
    console.log('URL:', req.url);
    //console.log('JWT Token:', jwtToken ? 'Found' : 'Missing'); visa JWT för testing
    
    if (!jwtToken) {
        console.log('JWT Saknas');
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: No token provided.'
        }));
        ws.close(); //Stäng uppkoppling
        return; 
    }
    
    let userData; //Variabel för att hantera användaredata från JWT'n
    try {
        userData = jwt.verify(jwtToken, process.env.JWT_SECRET); 
        console.log(`JWT verified for user: ${userData.user} (ID: ${userData.sub})`);
    } catch (error) {
        console.log('JWT verification failed:', error.message);
        ws.send(JSON.stringify({
            status: 1,
            msg: 'ERROR: Invalid or expired token.'
        }));
        ws.close();
        return; //allt bra hittills
    }
    
    // Store user info on WebSocket connection
    ws.userId = userData.sub;
    ws.userName = userData.user;
    ws.userEmail = userData.email;
    ws.userRole = userData.role;
    
    // Add this connection to the user's connection set
    if (!userConnections.has(userData.sub)) {
        userConnections.set(userData.sub, new Set());
    }
    userConnections.get(userData.sub).add(ws);
    
    console.log(`User ${userData.user} connected. Total connections for this user: ${userConnections.get(userData.sub).size}`);
    
    // Send welcome message to the user
    ws.send(JSON.stringify({
        status: 0,
        msg: `Välkommen ${userData.user}!`,
        user: userData.user,
        timestamp: new Date().toISOString()
    }));

    ws.send(JSON.stringify({
        status: 2,
        msg: `Du är uppkopplad`,
        user: userData.user,
        timestamp: new Date().toISOString()
    }));

    ws.on('message', (message) => {
        //Funktionalitet för att bara skcika till samma användare
        const userSockets = userConnections.get(ws.userId);
        if (userSockets) {
            userSockets.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                    //userSockets.send(JSON.stringify({    
                        status: 0,
                        //msg: `${ws.userName} säger: ${String(message)}`,
                        msg: String(message),
                        user: ws.userName,
                        userId: ws.userId,
                        timestamp: new Date().toISOString()
                    }));
                }
           });
        }
    });

    ws.on('close', () => {
        console.log(`User ${ws.userName} disconnected`);
        
        // Kapa uppkoppling
        const userSockets = userConnections.get(ws.userId);
        if (userSockets) {
            userSockets.delete(ws);
            
            // Om inga flera uppkopplingar, kapa
            if (userSockets.size === 0) {
                userConnections.delete(ws.userId);
                console.log(`All connections closed for user ${ws.userName}`);
            } else {
                console.log(`User ${ws.userName} still has ${userSockets.size} connection(s) open`);
            }
        }
    });

    ws.on('error', (error) => {
        console.log(`WebSocket error for user ${ws.userName}:`, error.message);
    });
});


