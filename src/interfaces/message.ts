export type Message = {
  type: 'ENTER' | 'TALK' | 'LEAVE';
  roomId: string;
  sender: string;
  message: string | null;
  userId: number;
  sendDate: number;
};
