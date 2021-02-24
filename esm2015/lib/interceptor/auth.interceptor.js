import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../authState/auth-state.service";
import * as i2 from "../config/config.provider";
import * as i3 from "./../logging/logger.service";
export class AuthInterceptor {
    constructor(authStateService, configurationProvider, loggerService) {
        this.authStateService = authStateService;
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
    }
    intercept(req, next) {
        // Ensure we send the token only to routes which are secured
        const { secureRoutes } = this.configurationProvider.openIDConfiguration;
        if (!secureRoutes) {
            this.loggerService.logDebug(`No routes to check configured`);
            return next.handle(req);
        }
        const matchingRoute = secureRoutes.find((x) => req.url.startsWith(x));
        if (!matchingRoute) {
            this.loggerService.logDebug(`Did not find matching route for ${req.url}`);
            return next.handle(req);
        }
        this.loggerService.logDebug(`'${req.url}' matches configured route '${matchingRoute}'`);
        const token = this.authStateService.getAccessToken();
        if (!token) {
            this.loggerService.logDebug(`Wanted to add token to ${req.url} but found no token: '${token}'`);
            return next.handle(req);
        }
        this.loggerService.logDebug(`'${req.url}' matches configured route '${matchingRoute}', adding token`);
        req = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + token),
        });
        return next.handle(req);
    }
}
AuthInterceptor.ɵfac = function AuthInterceptor_Factory(t) { return new (t || AuthInterceptor)(i0.ɵɵinject(i1.AuthStateService), i0.ɵɵinject(i2.ConfigurationProvider), i0.ɵɵinject(i3.LoggerService)); };
AuthInterceptor.ɵprov = i0.ɵɵdefineInjectable({ token: AuthInterceptor, factory: AuthInterceptor.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(AuthInterceptor, [{
        type: Injectable
    }], function () { return [{ type: i1.AuthStateService }, { type: i2.ConfigurationProvider }, { type: i3.LoggerService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5pbnRlcmNlcHRvci5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2ludGVyY2VwdG9yL2F1dGguaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7Ozs7QUFPM0MsTUFBTSxPQUFPLGVBQWU7SUFDMUIsWUFDVSxnQkFBa0MsRUFDbEMscUJBQTRDLEVBQzVDLGFBQTRCO1FBRjVCLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7UUFDbEMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQUM1QyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUNuQyxDQUFDO0lBRUosU0FBUyxDQUFDLEdBQXFCLEVBQUUsSUFBaUI7UUFDaEQsNERBQTREO1FBQzVELE1BQU0sRUFBRSxZQUFZLEVBQUUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUM7UUFFeEUsSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNqQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO1lBQzdELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN6QjtRQUVELE1BQU0sYUFBYSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFdEUsSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxtQ0FBbUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7WUFDMUUsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3pCO1FBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRywrQkFBK0IsYUFBYSxHQUFHLENBQUMsQ0FBQztRQUV4RixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFckQsSUFBSSxDQUFDLEtBQUssRUFBRTtZQUNWLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLDBCQUEwQixHQUFHLENBQUMsR0FBRyx5QkFBeUIsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNoRyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDekI7UUFFRCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLCtCQUErQixhQUFhLGlCQUFpQixDQUFDLENBQUM7UUFDdEcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDZCxPQUFPLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLFNBQVMsR0FBRyxLQUFLLENBQUM7U0FDN0QsQ0FBQyxDQUFDO1FBRUgsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFCLENBQUM7OzhFQXRDVSxlQUFlO3VEQUFmLGVBQWUsV0FBZixlQUFlO2tEQUFmLGVBQWU7Y0FEM0IsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBFdmVudCwgSHR0cEhhbmRsZXIsIEh0dHBJbnRlcmNlcHRvciwgSHR0cFJlcXVlc3QgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgT2JzZXJ2YWJsZSB9IGZyb20gJ3J4anMnO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVTZXJ2aWNlIH0gZnJvbSAnLi4vYXV0aFN0YXRlL2F1dGgtc3RhdGUuc2VydmljZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi8uLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIEF1dGhJbnRlcmNlcHRvciBpbXBsZW1lbnRzIEh0dHBJbnRlcmNlcHRvciB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIGF1dGhTdGF0ZVNlcnZpY2U6IEF1dGhTdGF0ZVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcclxuICAgIC8vIEVuc3VyZSB3ZSBzZW5kIHRoZSB0b2tlbiBvbmx5IHRvIHJvdXRlcyB3aGljaCBhcmUgc2VjdXJlZFxyXG4gICAgY29uc3QgeyBzZWN1cmVSb3V0ZXMgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb247XHJcblxyXG4gICAgaWYgKCFzZWN1cmVSb3V0ZXMpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBObyByb3V0ZXMgdG8gY2hlY2sgY29uZmlndXJlZGApO1xyXG4gICAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBtYXRjaGluZ1JvdXRlID0gc2VjdXJlUm91dGVzLmZpbmQoKHgpID0+IHJlcS51cmwuc3RhcnRzV2l0aCh4KSk7XHJcblxyXG4gICAgaWYgKCFtYXRjaGluZ1JvdXRlKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgRGlkIG5vdCBmaW5kIG1hdGNoaW5nIHJvdXRlIGZvciAke3JlcS51cmx9YCk7XHJcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgJyR7cmVxLnVybH0nIG1hdGNoZXMgY29uZmlndXJlZCByb3V0ZSAnJHttYXRjaGluZ1JvdXRlfSdgKTtcclxuXHJcbiAgICBjb25zdCB0b2tlbiA9IHRoaXMuYXV0aFN0YXRlU2VydmljZS5nZXRBY2Nlc3NUb2tlbigpO1xyXG5cclxuICAgIGlmICghdG9rZW4pIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBXYW50ZWQgdG8gYWRkIHRva2VuIHRvICR7cmVxLnVybH0gYnV0IGZvdW5kIG5vIHRva2VuOiAnJHt0b2tlbn0nYCk7XHJcbiAgICAgIHJldHVybiBuZXh0LmhhbmRsZShyZXEpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgJyR7cmVxLnVybH0nIG1hdGNoZXMgY29uZmlndXJlZCByb3V0ZSAnJHttYXRjaGluZ1JvdXRlfScsIGFkZGluZyB0b2tlbmApO1xyXG4gICAgcmVxID0gcmVxLmNsb25lKHtcclxuICAgICAgaGVhZGVyczogcmVxLmhlYWRlcnMuc2V0KCdBdXRob3JpemF0aW9uJywgJ0JlYXJlciAnICsgdG9rZW4pLFxyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIG5leHQuaGFuZGxlKHJlcSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==