const DEV = false;

const LOCAL_SERVER = 'http://localhost:3300';
const DEPLOYED_SERVER = 'https://mlmar-server.vercel.app';

export const SERVER_URL = DEV ? LOCAL_SERVER : DEPLOYED_SERVER;