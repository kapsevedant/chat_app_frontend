import {Component, OnInit, OnDestroy, ElementRef, ViewChild} from '@angular/core';
import { MessageService } from '../message.service';
import { ActivatedRoute } from '@angular/router';
import { SocketService } from "../../services/socket.service";
import { Subscription } from 'rxjs';
import {Router} from "@angular/router";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})
export class MessageComponent implements OnInit, OnDestroy {
  @ViewChild('messageContainer') private messageContainer!: ElementRef;
  otherUsers: any[] = [];
  receiverId: any;
  senderMessage: any;
  receiverMessages: any[] = [];
  loggedInUserData: any;
  onlineUsers: string[] = []; // Track online user IDs
  showUserListOnMobile:boolean = false;
  activeUserId: string | null = null;
  selectedImageUrl: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private messageService: MessageService,
    private activatedRoute: ActivatedRoute,
    private socketService: SocketService,
    private router:Router
  ) {}

  ngOnInit() {
    this.getOtherUsers();
    this.setupSocketListeners();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());

    // Notify server that user is going offline
    if (this.loggedInUserData?._id) {
      this.socketService.leaveUser(this.loggedInUserData._id);
    }
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
    } catch(err) {
      console.error(err);
    }
  }

  toggleUserList() {
    this.showUserListOnMobile = !this.showUserListOnMobile;
  }

  hideUserListOnMobile() {
    if (window.innerWidth <= 768) {
      this.showUserListOnMobile = false;
    }
  }

  private setupSocketListeners() {
    // Listen for real-time messages
    const messageSubscription = this.socketService.onNewMessage().subscribe((message: any) => {
      if (message.senderId === this.receiverId) {
        this.receiverMessages.push(message);
      }
    });

    // Listen for user status updates (individual user online/offline)
    const statusSubscription = this.socketService.onUserStatusUpdate().subscribe((statusUpdate: any) => {
      this.updateUserOnlineStatus(statusUpdate.userId, statusUpdate.isOnline);
    });

    // Listen for complete online users list
    const onlineUsersSubscription = this.socketService.onOnlineUsers().subscribe((userIds: string[]) => {
      this.onlineUsers = userIds;
    });

    this.subscriptions.push(messageSubscription, statusSubscription, onlineUsersSubscription);
  }

  getOtherUsers() {
    this.messageService.message().subscribe({
      next: (data) => {
        if (data.status === true) {
          this.loggedInUserData = data.userData;
          this.otherUsers = data.otherUsers || [];

          // Join socket room when user data is loaded
          if (this.loggedInUserData?._id) {
            this.socketService.joinUser(this.loggedInUserData._id);
          }
        }
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
      }
    });
  }

  getMessages(receiverId: any) {
    this.receiverMessages = [];
    this.activeUserId = receiverId;
    this.receiverId = receiverId;
    this.messageService.getMessage(receiverId).subscribe({
      next: (response) => {
        this.receiverMessages = response.sort((a: any, b: any) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
      }
    });
  }

  sendMessage(message: any) {
    if (!message || !this.receiverId || !message.trim()) return;

    this.messageService.sendMessage(message, this.receiverId).subscribe({
      next: (response) => {
        const newMessage = {
          senderId: this.loggedInUserData._id,
          receiverId: this.receiverId,
          message: message,
          createdAt: new Date()
        };

        this.receiverMessages.push(newMessage); // Show instantly
        this.socketService.sendMessage(newMessage); // 📡 Emit via socket
        this.senderMessage = ''; // Clear input
      },
      error: (error) => {
        console.error('Error sending message:', error);
      }
    });
  }

  // Check if a user is online
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.includes(userId);
  }

  // Get current chat user's name
  getCurrentUserName(): string {
    const currentUser = this.otherUsers.find(user => user._id === this.receiverId);
    return currentUser?.fullName || 'Unknown User';
  }

  // Get current chat user's username
  getCurrentUserUsername(): string {
    const currentUser = this.otherUsers.find(user => user._id === this.receiverId);
    return currentUser?.username || '';
  }

  // Get current chat user's photo
  getCurrentUserPhoto(): string {
    const currentUser = this.otherUsers.find(user => user._id === this.receiverId);
    return currentUser?.profilePhoto || 'assets/default-avatar.png';
  }

  // Update online status for a specific user
  private updateUserOnlineStatus(userId: string, isOnline: boolean) {
    if (isOnline) {
      if (!this.onlineUsers.includes(userId)) {
        this.onlineUsers.push(userId);
      }
    } else {
      this.onlineUsers = this.onlineUsers.filter(id => id !== userId);
    }
  }

  editProfile(){
    this.router.navigate(['/profile'])
  }

  logoutUser(){
    localStorage.removeItem('token');
    this.router.navigate(['/login'])
  }
}
