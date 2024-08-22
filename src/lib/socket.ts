import {io} from 'socket.io-client';

const chatServerURL = 'http://localhost:3130';

export const socket = io(chatServerURL,{autoConnect:false});