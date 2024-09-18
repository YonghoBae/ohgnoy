import {io} from 'socket.io-client';
import { Ohgnoy_BackendAPI } from './constants';

const chatServerURL = `${Ohgnoy_BackendAPI}`;

export const socket = io(chatServerURL,{autoConnect:false});