let IS_PROD = true;
const server = IS_PROD ?
    "https://video-connect-project-backend-node.onrender.com" :

    "http://localhost:8000"

const socketServer = IS_PROD ?
    "wss://video-connect-project-backend-node.onrender.com" :
    "http://localhost:8000"

export  { server, socketServer };
