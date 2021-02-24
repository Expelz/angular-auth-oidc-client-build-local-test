import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./http-base.service";
export class DataService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    get(url, token) {
        const headers = this.prepareHeaders(token);
        return this.httpClient.get(url, {
            headers,
        });
    }
    post(url, body, headersParams) {
        const headers = headersParams || this.prepareHeaders();
        return this.httpClient.post(url, body, { headers });
    }
    prepareHeaders(token) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/json');
        if (!!token) {
            headers = headers.set('Authorization', 'Bearer ' + decodeURIComponent(token));
        }
        return headers;
    }
}
DataService.ɵfac = function DataService_Factory(t) { return new (t || DataService)(i0.ɵɵinject(i1.HttpBaseService)); };
DataService.ɵprov = i0.ɵɵdefineInjectable({ token: DataService, factory: DataService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(DataService, [{
        type: Injectable
    }], function () { return [{ type: i1.HttpBaseService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvYXBpL2RhdGEuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7O0FBSzNDLE1BQU0sT0FBTyxXQUFXO0lBQ3RCLFlBQW9CLFVBQTJCO1FBQTNCLGVBQVUsR0FBVixVQUFVLENBQWlCO0lBQUcsQ0FBQztJQUVuRCxHQUFHLENBQUksR0FBVyxFQUFFLEtBQWM7UUFDaEMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUUzQyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFJLEdBQUcsRUFBRTtZQUNqQyxPQUFPO1NBQ1IsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztJQUVELElBQUksQ0FBSSxHQUFXLEVBQUUsSUFBUyxFQUFFLGFBQTJCO1FBQ3pELE1BQU0sT0FBTyxHQUFHLGFBQWEsSUFBSSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdkQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBSSxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUUsT0FBTyxFQUFFLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU8sY0FBYyxDQUFDLEtBQWM7UUFDbkMsSUFBSSxPQUFPLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUNoQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUVwRCxJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUU7WUFDWCxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsU0FBUyxHQUFHLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7U0FDL0U7UUFFRCxPQUFPLE9BQU8sQ0FBQztJQUNqQixDQUFDOztzRUExQlUsV0FBVzttREFBWCxXQUFXLFdBQVgsV0FBVztrREFBWCxXQUFXO2NBRHZCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwSGVhZGVycyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBPYnNlcnZhYmxlIH0gZnJvbSAncnhqcyc7XHJcbmltcG9ydCB7IEh0dHBCYXNlU2VydmljZSB9IGZyb20gJy4vaHR0cC1iYXNlLnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgRGF0YVNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgaHR0cENsaWVudDogSHR0cEJhc2VTZXJ2aWNlKSB7fVxyXG5cclxuICBnZXQ8VD4odXJsOiBzdHJpbmcsIHRva2VuPzogc3RyaW5nKTogT2JzZXJ2YWJsZTxUPiB7XHJcbiAgICBjb25zdCBoZWFkZXJzID0gdGhpcy5wcmVwYXJlSGVhZGVycyh0b2tlbik7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuaHR0cENsaWVudC5nZXQ8VD4odXJsLCB7XHJcbiAgICAgIGhlYWRlcnMsXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIHBvc3Q8VD4odXJsOiBzdHJpbmcsIGJvZHk6IGFueSwgaGVhZGVyc1BhcmFtcz86IEh0dHBIZWFkZXJzKSB7XHJcbiAgICBjb25zdCBoZWFkZXJzID0gaGVhZGVyc1BhcmFtcyB8fCB0aGlzLnByZXBhcmVIZWFkZXJzKCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuaHR0cENsaWVudC5wb3N0PFQ+KHVybCwgYm9keSwgeyBoZWFkZXJzIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBwcmVwYXJlSGVhZGVycyh0b2tlbj86IHN0cmluZykge1xyXG4gICAgbGV0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoKTtcclxuICAgIGhlYWRlcnMgPSBoZWFkZXJzLnNldCgnQWNjZXB0JywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuXHJcbiAgICBpZiAoISF0b2tlbikge1xyXG4gICAgICBoZWFkZXJzID0gaGVhZGVycy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmVhcmVyICcgKyBkZWNvZGVVUklDb21wb25lbnQodG9rZW4pKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gaGVhZGVycztcclxuICB9XHJcbn1cclxuIl19