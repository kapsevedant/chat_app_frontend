import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from "rxjs";
import {BASE_URL, MESSAGE, GET_MESSAGE_URL, SEND_MESSAGE_URL} from "../urlmaps";


@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private http: HttpClient) {}

  message(): Observable<any> {
    const token = localStorage.getItem('token'); // or from wherever you stored it
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${BASE_URL}${MESSAGE}`, { headers });
  }

  getMessage(receiverId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(`${BASE_URL}${GET_MESSAGE_URL}/${receiverId}`, { headers });
  }

  sendMessage(message:any,receiverId:any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(`${BASE_URL}${SEND_MESSAGE_URL}/${receiverId}`,{message}, { headers });
  }
}


