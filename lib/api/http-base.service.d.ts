import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
export declare class HttpBaseService {
    private http;
    constructor(http: HttpClient);
    get<T>(url: string, params?: {
        [key: string]: any;
    }): Observable<T>;
    post<T>(url: string, body: any, params?: {
        [key: string]: any;
    }): Observable<T>;
    static ɵfac: i0.ɵɵFactoryDef<HttpBaseService, never>;
    static ɵprov: i0.ɵɵInjectableDef<HttpBaseService>;
}
//# sourceMappingURL=http-base.service.d.ts.map