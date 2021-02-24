import { Injectable } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { EventTypes } from '../public-events/event-types';
import * as i0 from "@angular/core";
import * as i1 from "../api/data.service";
import * as i2 from "../storage/storage-persistance.service";
import * as i3 from "../public-events/public-events.service";
import * as i4 from "../logging/logger.service";
import * as i5 from "../utils/tokenHelper/oidc-token-helper.service";
import * as i6 from "../utils/flowHelper/flow-helper.service";
import * as i7 from "../config/config.provider";
export class UserService {
    constructor(oidcDataService, storagePersistanceService, eventService, loggerService, tokenHelperService, flowHelper, configurationProvider) {
        this.oidcDataService = oidcDataService;
        this.storagePersistanceService = storagePersistanceService;
        this.eventService = eventService;
        this.loggerService = loggerService;
        this.tokenHelperService = tokenHelperService;
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.userDataInternal$ = new BehaviorSubject(null);
    }
    get userData$() {
        return this.userDataInternal$.asObservable();
    }
    // TODO CHECK PARAMETERS
    //  validationResult.idToken can be the complete valudationResult
    getAndPersistUserDataInStore(isRenewProcess = false, idToken, decodedIdToken) {
        idToken = idToken || this.storagePersistanceService.getIdToken();
        decodedIdToken = decodedIdToken || this.tokenHelperService.getPayloadFromToken(idToken, false);
        const existingUserDataFromStorage = this.getUserDataFromStore();
        const haveUserData = !!existingUserDataFromStorage;
        const isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
        const isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
        const accessToken = this.storagePersistanceService.getAccessToken();
        if (!(isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow)) {
            this.loggerService.logDebug('authorizedCallback id_token flow');
            this.loggerService.logDebug('accessToken', accessToken);
            this.setUserDataToStore(decodedIdToken);
            return of(decodedIdToken);
        }
        if (!isRenewProcess || this.configurationProvider.openIDConfiguration.renewUserInfoAfterTokenRenew || !haveUserData) {
            return this.getUserDataOidcFlowAndSave(decodedIdToken.sub).pipe(switchMap((userData) => {
                this.loggerService.logDebug('Received user data', userData);
                if (!!userData) {
                    this.loggerService.logDebug('accessToken', accessToken);
                    return of(userData);
                }
                else {
                    return throwError('no user data, request failed');
                }
            }));
        }
        return of(existingUserDataFromStorage);
    }
    getUserDataFromStore() {
        return this.storagePersistanceService.read('userData') || null;
    }
    publishUserDataIfExists() {
        const userData = this.getUserDataFromStore();
        if (userData) {
            this.userDataInternal$.next(userData);
            this.eventService.fireEvent(EventTypes.UserDataChanged, userData);
        }
    }
    setUserDataToStore(value) {
        this.storagePersistanceService.write('userData', value);
        this.userDataInternal$.next(value);
        this.eventService.fireEvent(EventTypes.UserDataChanged, value);
    }
    resetUserDataInStore() {
        this.storagePersistanceService.remove('userData');
        this.eventService.fireEvent(EventTypes.UserDataChanged, null);
        this.userDataInternal$.next(null);
    }
    getUserDataOidcFlowAndSave(idTokenSub) {
        return this.getIdentityUserData().pipe(map((data) => {
            if (this.validateUserDataSubIdToken(idTokenSub, data === null || data === void 0 ? void 0 : data.sub)) {
                this.setUserDataToStore(data);
                return data;
            }
            else {
                // something went wrong, userdata sub does not match that from id_token
                this.loggerService.logWarning('authorizedCallback, User data sub does not match sub in id_token');
                this.loggerService.logDebug('authorizedCallback, token(s) validation failed, resetting');
                this.resetUserDataInStore();
                return null;
            }
        }));
    }
    getIdentityUserData() {
        const token = this.storagePersistanceService.getAccessToken();
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        if (!authWellKnownEndPoints) {
            this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined');
            return throwError('authWellKnownEndpoints is undefined');
        }
        const userinfoEndpoint = authWellKnownEndPoints.userinfoEndpoint;
        if (!userinfoEndpoint) {
            this.loggerService.logError('init check session: authWellKnownEndpoints.userinfo_endpoint is undefined; set auto_userinfo = false in config');
            return throwError('authWellKnownEndpoints.userinfo_endpoint is undefined');
        }
        return this.oidcDataService.get(userinfoEndpoint, token);
    }
    validateUserDataSubIdToken(idTokenSub, userdataSub) {
        if (!idTokenSub) {
            return false;
        }
        if (!userdataSub) {
            return false;
        }
        if (idTokenSub !== userdataSub) {
            this.loggerService.logDebug('validateUserDataSubIdToken failed', idTokenSub, userdataSub);
            return false;
        }
        return true;
    }
}
UserService.ɵfac = function UserService_Factory(t) { return new (t || UserService)(i0.ɵɵinject(i1.DataService), i0.ɵɵinject(i2.StoragePersistanceService), i0.ɵɵinject(i3.PublicEventsService), i0.ɵɵinject(i4.LoggerService), i0.ɵɵinject(i5.TokenHelperService), i0.ɵɵinject(i6.FlowHelper), i0.ɵɵinject(i7.ConfigurationProvider)); };
UserService.ɵprov = i0.ɵɵdefineInjectable({ token: UserService, factory: UserService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(UserService, [{
        type: Injectable
    }], function () { return [{ type: i1.DataService }, { type: i2.StoragePersistanceService }, { type: i3.PublicEventsService }, { type: i4.LoggerService }, { type: i5.TokenHelperService }, { type: i6.FlowHelper }, { type: i7.ConfigurationProvider }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvdXNlckRhdGEvdXNlci1zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLGVBQWUsRUFBYyxFQUFFLEVBQUUsVUFBVSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQ25FLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFJaEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLDhCQUE4QixDQUFDOzs7Ozs7Ozs7QUFPMUQsTUFBTSxPQUFPLFdBQVc7SUFPdEIsWUFDVSxlQUE0QixFQUM1Qix5QkFBb0QsRUFDcEQsWUFBaUMsRUFDakMsYUFBNEIsRUFDNUIsa0JBQXNDLEVBQ3RDLFVBQXNCLEVBQ3RCLHFCQUE0QztRQU41QyxvQkFBZSxHQUFmLGVBQWUsQ0FBYTtRQUM1Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGlCQUFZLEdBQVosWUFBWSxDQUFxQjtRQUNqQyxrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUM1Qix1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBQ3RDLGVBQVUsR0FBVixVQUFVLENBQVk7UUFDdEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtRQWI5QyxzQkFBaUIsR0FBRyxJQUFJLGVBQWUsQ0FBTSxJQUFJLENBQUMsQ0FBQztJQWN4RCxDQUFDO0lBWkosSUFBSSxTQUFTO1FBQ1gsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQVlELHdCQUF3QjtJQUN4QixpRUFBaUU7SUFDakUsNEJBQTRCLENBQUMsY0FBYyxHQUFHLEtBQUssRUFBRSxPQUFhLEVBQUUsY0FBb0I7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QkFBZ0IsQ0FBQztRQUVqRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDckIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQ3pCLGdIQUFnSCxDQUNqSCxDQUFDO1lBQ0YsT0FBTyxVQUFVLENBQUMsdURBQXVELENBQUMsQ0FBQztTQUM1RTtRQUVELE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsS0FBSyxDQUFDLENBQUM7SUFDM0QsQ0FBQztJQUVPLDBCQUEwQixDQUFDLFVBQWUsRUFBRSxXQUFnQjtRQUNsRSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDaEIsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELElBQUssVUFBcUIsS0FBTSxXQUFzQixFQUFFO1lBQ3RELElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLG1DQUFtQyxFQUFFLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUMxRixPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDOztzRUFwSVUsV0FBVzttREFBWCxXQUFXLFdBQVgsV0FBVztrREFBWCxXQUFXO2NBRHZCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IEJlaGF2aW9yU3ViamVjdCwgT2JzZXJ2YWJsZSwgb2YsIHRocm93RXJyb3IgfSBmcm9tICdyeGpzJztcclxuaW1wb3J0IHsgbWFwLCBzd2l0Y2hNYXAgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XHJcbmltcG9ydCB7IERhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vYXBpL2RhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IEV2ZW50VHlwZXMgfSBmcm9tICcuLi9wdWJsaWMtZXZlbnRzL2V2ZW50LXR5cGVzJztcclxuaW1wb3J0IHsgUHVibGljRXZlbnRzU2VydmljZSB9IGZyb20gJy4uL3B1YmxpYy1ldmVudHMvcHVibGljLWV2ZW50cy5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFRva2VuSGVscGVyU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3Rva2VuSGVscGVyL29pZGMtdG9rZW4taGVscGVyLnNlcnZpY2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgVXNlclNlcnZpY2Uge1xyXG4gIHByaXZhdGUgdXNlckRhdGFJbnRlcm5hbCQgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PGFueT4obnVsbCk7XHJcblxyXG4gIGdldCB1c2VyRGF0YSQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy51c2VyRGF0YUludGVybmFsJC5hc09ic2VydmFibGUoKTtcclxuICB9XHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBvaWRjRGF0YVNlcnZpY2U6IERhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBldmVudFNlcnZpY2U6IFB1YmxpY0V2ZW50c1NlcnZpY2UsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHRva2VuSGVscGVyU2VydmljZTogVG9rZW5IZWxwZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlclxyXG4gICkge31cclxuXHJcbiAgLy8gVE9ETyBDSEVDSyBQQVJBTUVURVJTXHJcbiAgLy8gIHZhbGlkYXRpb25SZXN1bHQuaWRUb2tlbiBjYW4gYmUgdGhlIGNvbXBsZXRlIHZhbHVkYXRpb25SZXN1bHRcclxuICBnZXRBbmRQZXJzaXN0VXNlckRhdGFJblN0b3JlKGlzUmVuZXdQcm9jZXNzID0gZmFsc2UsIGlkVG9rZW4/OiBhbnksIGRlY29kZWRJZFRva2VuPzogYW55KTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgIGlkVG9rZW4gPSBpZFRva2VuIHx8IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5nZXRJZFRva2VuKCk7XHJcbiAgICBkZWNvZGVkSWRUb2tlbiA9IGRlY29kZWRJZFRva2VuIHx8IHRoaXMudG9rZW5IZWxwZXJTZXJ2aWNlLmdldFBheWxvYWRGcm9tVG9rZW4oaWRUb2tlbiwgZmFsc2UpO1xyXG5cclxuICAgIGNvbnN0IGV4aXN0aW5nVXNlckRhdGFGcm9tU3RvcmFnZSA9IHRoaXMuZ2V0VXNlckRhdGFGcm9tU3RvcmUoKTtcclxuICAgIGNvbnN0IGhhdmVVc2VyRGF0YSA9ICEhZXhpc3RpbmdVc2VyRGF0YUZyb21TdG9yYWdlO1xyXG4gICAgY29uc3QgaXNDdXJyZW50Rmxvd0ltcGxpY2l0Rmxvd1dpdGhBY2Nlc3NUb2tlbiA9IHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aEFjY2Vzc1Rva2VuKCk7XHJcbiAgICBjb25zdCBpc0N1cnJlbnRGbG93Q29kZUZsb3cgPSB0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCk7XHJcblxyXG4gICAgY29uc3QgYWNjZXNzVG9rZW4gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UuZ2V0QWNjZXNzVG9rZW4oKTtcclxuICAgIGlmICghKGlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4gfHwgaXNDdXJyZW50Rmxvd0NvZGVGbG93KSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2F1dGhvcml6ZWRDYWxsYmFjayBpZF90b2tlbiBmbG93Jyk7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYWNjZXNzVG9rZW4nLCBhY2Nlc3NUb2tlbik7XHJcblxyXG4gICAgICB0aGlzLnNldFVzZXJEYXRhVG9TdG9yZShkZWNvZGVkSWRUb2tlbik7XHJcbiAgICAgIHJldHVybiBvZihkZWNvZGVkSWRUb2tlbik7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpc1JlbmV3UHJvY2VzcyB8fCB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnJlbmV3VXNlckluZm9BZnRlclRva2VuUmVuZXcgfHwgIWhhdmVVc2VyRGF0YSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5nZXRVc2VyRGF0YU9pZGNGbG93QW5kU2F2ZShkZWNvZGVkSWRUb2tlbi5zdWIpLnBpcGUoXHJcbiAgICAgICAgc3dpdGNoTWFwKCh1c2VyRGF0YSkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdSZWNlaXZlZCB1c2VyIGRhdGEnLCB1c2VyRGF0YSk7XHJcbiAgICAgICAgICBpZiAoISF1c2VyRGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ2FjY2Vzc1Rva2VuJywgYWNjZXNzVG9rZW4pO1xyXG4gICAgICAgICAgICByZXR1cm4gb2YodXNlckRhdGEpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoJ25vIHVzZXIgZGF0YSwgcmVxdWVzdCBmYWlsZWQnKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBvZihleGlzdGluZ1VzZXJEYXRhRnJvbVN0b3JhZ2UpO1xyXG4gIH1cclxuXHJcbiAgZ2V0VXNlckRhdGFGcm9tU3RvcmUoKTogYW55IHtcclxuICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgndXNlckRhdGEnKSB8fCBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHVibGlzaFVzZXJEYXRhSWZFeGlzdHMoKSB7XHJcbiAgICBjb25zdCB1c2VyRGF0YSA9IHRoaXMuZ2V0VXNlckRhdGFGcm9tU3RvcmUoKTtcclxuICAgIGlmICh1c2VyRGF0YSkge1xyXG4gICAgICB0aGlzLnVzZXJEYXRhSW50ZXJuYWwkLm5leHQodXNlckRhdGEpO1xyXG4gICAgICB0aGlzLmV2ZW50U2VydmljZS5maXJlRXZlbnQoRXZlbnRUeXBlcy5Vc2VyRGF0YUNoYW5nZWQsIHVzZXJEYXRhKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHNldFVzZXJEYXRhVG9TdG9yZSh2YWx1ZTogYW55KTogdm9pZCB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3VzZXJEYXRhJywgdmFsdWUpO1xyXG4gICAgdGhpcy51c2VyRGF0YUludGVybmFsJC5uZXh0KHZhbHVlKTtcclxuICAgIHRoaXMuZXZlbnRTZXJ2aWNlLmZpcmVFdmVudChFdmVudFR5cGVzLlVzZXJEYXRhQ2hhbmdlZCwgdmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXRVc2VyRGF0YUluU3RvcmUoKTogdm9pZCB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVtb3ZlKCd1c2VyRGF0YScpO1xyXG4gICAgdGhpcy5ldmVudFNlcnZpY2UuZmlyZUV2ZW50KEV2ZW50VHlwZXMuVXNlckRhdGFDaGFuZ2VkLCBudWxsKTtcclxuICAgIHRoaXMudXNlckRhdGFJbnRlcm5hbCQubmV4dChudWxsKTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0VXNlckRhdGFPaWRjRmxvd0FuZFNhdmUoaWRUb2tlblN1YjogYW55KTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgIHJldHVybiB0aGlzLmdldElkZW50aXR5VXNlckRhdGEoKS5waXBlKFxyXG4gICAgICBtYXAoKGRhdGE6IGFueSkgPT4ge1xyXG4gICAgICAgIGlmICh0aGlzLnZhbGlkYXRlVXNlckRhdGFTdWJJZFRva2VuKGlkVG9rZW5TdWIsIGRhdGE/LnN1YikpIHtcclxuICAgICAgICAgIHRoaXMuc2V0VXNlckRhdGFUb1N0b3JlKGRhdGEpO1xyXG4gICAgICAgICAgcmV0dXJuIGRhdGE7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIC8vIHNvbWV0aGluZyB3ZW50IHdyb25nLCB1c2VyZGF0YSBzdWIgZG9lcyBub3QgbWF0Y2ggdGhhdCBmcm9tIGlkX3Rva2VuXHJcbiAgICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aG9yaXplZENhbGxiYWNrLCBVc2VyIGRhdGEgc3ViIGRvZXMgbm90IG1hdGNoIHN1YiBpbiBpZF90b2tlbicpO1xyXG4gICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdXRob3JpemVkQ2FsbGJhY2ssIHRva2VuKHMpIHZhbGlkYXRpb24gZmFpbGVkLCByZXNldHRpbmcnKTtcclxuICAgICAgICAgIHRoaXMucmVzZXRVc2VyRGF0YUluU3RvcmUoKTtcclxuICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldElkZW50aXR5VXNlckRhdGEoKTogT2JzZXJ2YWJsZTxhbnk+IHtcclxuICAgIGNvbnN0IHRva2VuID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLmdldEFjY2Vzc1Rva2VuKCk7XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcblxyXG4gICAgaWYgKCFhdXRoV2VsbEtub3duRW5kUG9pbnRzKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpbml0IGNoZWNrIHNlc3Npb246IGF1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVzZXJpbmZvRW5kcG9pbnQgPSBhdXRoV2VsbEtub3duRW5kUG9pbnRzLnVzZXJpbmZvRW5kcG9pbnQ7XHJcblxyXG4gICAgaWYgKCF1c2VyaW5mb0VuZHBvaW50KSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihcclxuICAgICAgICAnaW5pdCBjaGVjayBzZXNzaW9uOiBhdXRoV2VsbEtub3duRW5kcG9pbnRzLnVzZXJpbmZvX2VuZHBvaW50IGlzIHVuZGVmaW5lZDsgc2V0IGF1dG9fdXNlcmluZm8gPSBmYWxzZSBpbiBjb25maWcnXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzLnVzZXJpbmZvX2VuZHBvaW50IGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLm9pZGNEYXRhU2VydmljZS5nZXQodXNlcmluZm9FbmRwb2ludCwgdG9rZW4pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSB2YWxpZGF0ZVVzZXJEYXRhU3ViSWRUb2tlbihpZFRva2VuU3ViOiBhbnksIHVzZXJkYXRhU3ViOiBhbnkpOiBib29sZWFuIHtcclxuICAgIGlmICghaWRUb2tlblN1Yikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCF1c2VyZGF0YVN1Yikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKChpZFRva2VuU3ViIGFzIHN0cmluZykgIT09ICh1c2VyZGF0YVN1YiBhcyBzdHJpbmcpKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygndmFsaWRhdGVVc2VyRGF0YVN1YklkVG9rZW4gZmFpbGVkJywgaWRUb2tlblN1YiwgdXNlcmRhdGFTdWIpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG59XHJcbiJdfQ==