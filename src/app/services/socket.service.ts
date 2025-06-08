import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  // private readonly SERVER_URL = 'http://localhost:8080';
  private readonly SERVER_URL = 'https://chatapp-1e6j.onrender.com';

  constructor() {
    this.socket = io(this.SERVER_URL, {
      transports: ['websocket']
    });
  }

  // Join user to socket (call when user logs in)
  joinUser(userId: string): void {
    this.socket.emit('userOnline', { userId });
  }

  // Leave user from socket (call when user logs out)
  leaveUser(userId: string): void {
    this.socket.emit('userOffline', { userId });
  }

  // Emit message to server
  sendMessage(message: any): void {
    this.socket.emit('newMessage', message);
  }

  // Receive real-time message from server
  onNewMessage(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('newMessage', (data) => {
        console.log("datadata", data);
        observer.next(data);
      });
    });
  }

  // Listen for user online status updates
  onUserStatusUpdate(): Observable<{ userId: string; isOnline: boolean }> {
    return new Observable((observer) => {
      this.socket.on('userStatusUpdate', (data) => {
        observer.next(data);
      });
    });
  }

  // Listen for online users list
  onOnlineUsers(): Observable<string[]> {
    return new Observable((observer) => {
      this.socket.on('onlineUsers', (userIds: string[]) => {
        observer.next(userIds);
      });
    });
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
