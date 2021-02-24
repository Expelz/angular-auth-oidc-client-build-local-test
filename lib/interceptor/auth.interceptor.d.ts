import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthStateService } from '../authState/auth-state.service';
import { ConfigurationProvider } from '../config/config.provider';
import { LoggerService } from './../logging/logger.service';
import * as i0 from "@angular/core";
export declare class AuthInterceptor implements HttpInterceptor {
    private authStateService;
    private configurationProvider;
    private loggerService;
    constructor(authStateService: AuthStateService, configurationProvider: ConfigurationProvider, loggerService: LoggerService);
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>;
    static ɵfac: i0.ɵɵFactoryDef<AuthInterceptor, never>;
    static ɵprov: i0.ɵɵInjectableDef<AuthInterceptor>;
}
//# sourceMappingURL=auth.interceptor.d.ts.map