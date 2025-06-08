import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {BASE_URL, LOGIN_URL, SIGNUP_URL, VERIFY_CODE} from "../urlmaps";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  signup(payload: any): Observable<any> {
    return this.http.post(`${BASE_URL}${SIGNUP_URL}`, payload);
  }

  login(payload: any): Observable<any> {
    return this.http.post(`${BASE_URL}${LOGIN_URL}`, payload);
  }

  verifyEmail(payload: any): Observable<any> {
    return this.http.post(`${BASE_URL}${VERIFY_CODE}`, payload);
  }

}
