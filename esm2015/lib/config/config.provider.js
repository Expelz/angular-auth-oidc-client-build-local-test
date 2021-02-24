import { Injectable } from '@angular/core';
import { DEFAULT_CONFIG } from './default-config';
import * as i0 from "@angular/core";
import * as i1 from "../utils/platform-provider/platform.provider";
export class ConfigurationProvider {
    constructor(platformProvider) {
        this.platformProvider = platformProvider;
    }
    get openIDConfiguration() {
        return this.openIdConfigurationInternal || null;
    }
    hasValidConfig() {
        return !!this.openIdConfigurationInternal;
    }
    setConfig(configuration) {
        this.openIdConfigurationInternal = Object.assign(Object.assign({}, DEFAULT_CONFIG), configuration);
        if (configuration === null || configuration === void 0 ? void 0 : configuration.storage) {
            console.warn(`PLEASE NOTE: The storage in the config will be deprecated in future versions:
                Please pass the custom storage in forRoot() as documented`);
        }
        this.setSpecialCases(this.openIdConfigurationInternal);
        return this.openIdConfigurationInternal;
    }
    setSpecialCases(currentConfig) {
        if (!this.platformProvider.isBrowser) {
            currentConfig.startCheckSession = false;
            currentConfig.silentRenew = false;
            currentConfig.useRefreshToken = false;
        }
    }
}
ConfigurationProvider.ɵfac = function ConfigurationProvider_Factory(t) { return new (t || ConfigurationProvider)(i0.ɵɵinject(i1.PlatformProvider)); };
ConfigurationProvider.ɵprov = i0.ɵɵdefineInjectable({ token: ConfigurationProvider, factory: ConfigurationProvider.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(ConfigurationProvider, [{
        type: Injectable
    }], function () { return [{ type: i1.PlatformProvider }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLnByb3ZpZGVyLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvY29uZmlnL2NvbmZpZy5wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQzs7O0FBSWxELE1BQU0sT0FBTyxxQkFBcUI7SUFPaEMsWUFBb0IsZ0JBQWtDO1FBQWxDLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBa0I7SUFBRyxDQUFDO0lBSjFELElBQUksbUJBQW1CO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLDJCQUEyQixJQUFJLElBQUksQ0FBQztJQUNsRCxDQUFDO0lBSUQsY0FBYztRQUNaLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQztJQUM1QyxDQUFDO0lBRUQsU0FBUyxDQUFDLGFBQWtDO1FBQzFDLElBQUksQ0FBQywyQkFBMkIsbUNBQVEsY0FBYyxHQUFLLGFBQWEsQ0FBRSxDQUFDO1FBRTNFLElBQUksYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFFLE9BQU8sRUFBRTtZQUMxQixPQUFPLENBQUMsSUFBSSxDQUNWOzBFQUNrRSxDQUNuRSxDQUFDO1NBQ0g7UUFFRCxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBRXZELE9BQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDO0lBQzFDLENBQUM7SUFFTyxlQUFlLENBQUMsYUFBa0M7UUFDeEQsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUU7WUFDcEMsYUFBYSxDQUFDLGlCQUFpQixHQUFHLEtBQUssQ0FBQztZQUN4QyxhQUFhLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztZQUNsQyxhQUFhLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztTQUN2QztJQUNILENBQUM7OzBGQWxDVSxxQkFBcUI7NkRBQXJCLHFCQUFxQixXQUFyQixxQkFBcUI7a0RBQXJCLHFCQUFxQjtjQURqQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBQbGF0Zm9ybVByb3ZpZGVyIH0gZnJvbSAnLi4vdXRpbHMvcGxhdGZvcm0tcHJvdmlkZXIvcGxhdGZvcm0ucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBERUZBVUxUX0NPTkZJRyB9IGZyb20gJy4vZGVmYXVsdC1jb25maWcnO1xyXG5pbXBvcnQgeyBPcGVuSWRDb25maWd1cmF0aW9uIH0gZnJvbSAnLi9vcGVuaWQtY29uZmlndXJhdGlvbic7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBDb25maWd1cmF0aW9uUHJvdmlkZXIge1xyXG4gIHByaXZhdGUgb3BlbklkQ29uZmlndXJhdGlvbkludGVybmFsOiBPcGVuSWRDb25maWd1cmF0aW9uO1xyXG5cclxuICBnZXQgb3BlbklEQ29uZmlndXJhdGlvbigpOiBPcGVuSWRDb25maWd1cmF0aW9uIHtcclxuICAgIHJldHVybiB0aGlzLm9wZW5JZENvbmZpZ3VyYXRpb25JbnRlcm5hbCB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBwbGF0Zm9ybVByb3ZpZGVyOiBQbGF0Zm9ybVByb3ZpZGVyKSB7fVxyXG5cclxuICBoYXNWYWxpZENvbmZpZygpIHtcclxuICAgIHJldHVybiAhIXRoaXMub3BlbklkQ29uZmlndXJhdGlvbkludGVybmFsO1xyXG4gIH1cclxuXHJcbiAgc2V0Q29uZmlnKGNvbmZpZ3VyYXRpb246IE9wZW5JZENvbmZpZ3VyYXRpb24pIHtcclxuICAgIHRoaXMub3BlbklkQ29uZmlndXJhdGlvbkludGVybmFsID0geyAuLi5ERUZBVUxUX0NPTkZJRywgLi4uY29uZmlndXJhdGlvbiB9O1xyXG5cclxuICAgIGlmIChjb25maWd1cmF0aW9uPy5zdG9yYWdlKSB7XHJcbiAgICAgIGNvbnNvbGUud2FybihcclxuICAgICAgICBgUExFQVNFIE5PVEU6IFRoZSBzdG9yYWdlIGluIHRoZSBjb25maWcgd2lsbCBiZSBkZXByZWNhdGVkIGluIGZ1dHVyZSB2ZXJzaW9uczpcclxuICAgICAgICAgICAgICAgIFBsZWFzZSBwYXNzIHRoZSBjdXN0b20gc3RvcmFnZSBpbiBmb3JSb290KCkgYXMgZG9jdW1lbnRlZGBcclxuICAgICAgKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLnNldFNwZWNpYWxDYXNlcyh0aGlzLm9wZW5JZENvbmZpZ3VyYXRpb25JbnRlcm5hbCk7XHJcblxyXG4gICAgcmV0dXJuIHRoaXMub3BlbklkQ29uZmlndXJhdGlvbkludGVybmFsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBzZXRTcGVjaWFsQ2FzZXMoY3VycmVudENvbmZpZzogT3BlbklkQ29uZmlndXJhdGlvbikge1xyXG4gICAgaWYgKCF0aGlzLnBsYXRmb3JtUHJvdmlkZXIuaXNCcm93c2VyKSB7XHJcbiAgICAgIGN1cnJlbnRDb25maWcuc3RhcnRDaGVja1Nlc3Npb24gPSBmYWxzZTtcclxuICAgICAgY3VycmVudENvbmZpZy5zaWxlbnRSZW5ldyA9IGZhbHNlO1xyXG4gICAgICBjdXJyZW50Q29uZmlnLnVzZVJlZnJlc2hUb2tlbiA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxufVxyXG4iXX0=