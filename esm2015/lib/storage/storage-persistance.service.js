import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "./abstract-security-storage";
import * as i2 from "../config/config.provider";
export class StoragePersistanceService {
    constructor(oidcSecurityStorage, configurationProvider) {
        this.oidcSecurityStorage = oidcSecurityStorage;
        this.configurationProvider = configurationProvider;
    }
    read(key) {
        const keyToRead = this.createKeyWithPrefix(key);
        return this.oidcSecurityStorage.read(keyToRead);
    }
    write(key, value) {
        const keyToStore = this.createKeyWithPrefix(key);
        this.oidcSecurityStorage.write(keyToStore, value);
    }
    remove(key) {
        const keyToStore = this.createKeyWithPrefix(key);
        this.oidcSecurityStorage.remove(keyToStore);
    }
    resetStorageFlowData() {
        this.remove('session_state');
        this.remove('storageSilentRenewRunning');
        this.remove('codeVerifier');
        this.remove('userData');
        this.remove('storageCustomRequestParams');
    }
    resetAuthStateInStorage() {
        this.remove('authzData');
        this.remove('authnResult');
    }
    getAccessToken() {
        return this.read('authzData');
    }
    getIdToken() {
        var _a;
        return (_a = this.read('authnResult')) === null || _a === void 0 ? void 0 : _a.id_token;
    }
    getRefreshToken() {
        var _a;
        return (_a = this.read('authnResult')) === null || _a === void 0 ? void 0 : _a.refresh_token;
    }
    createKeyWithPrefix(key) {
        var _a;
        const prefix = ((_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId) || '';
        return `${prefix}_${key}`;
    }
}
StoragePersistanceService.ɵfac = function StoragePersistanceService_Factory(t) { return new (t || StoragePersistanceService)(i0.ɵɵinject(i1.AbstractSecurityStorage), i0.ɵɵinject(i2.ConfigurationProvider)); };
StoragePersistanceService.ɵprov = i0.ɵɵdefineInjectable({ token: StoragePersistanceService, factory: StoragePersistanceService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(StoragePersistanceService, [{
        type: Injectable
    }], function () { return [{ type: i1.AbstractSecurityStorage }, { type: i2.ConfigurationProvider }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RhbmNlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7OztBQXNCM0MsTUFBTSxPQUFPLHlCQUF5QjtJQUNwQyxZQUNtQixtQkFBNEMsRUFDNUMscUJBQTRDO1FBRDVDLHdCQUFtQixHQUFuQixtQkFBbUIsQ0FBeUI7UUFDNUMsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUF1QjtJQUM1RCxDQUFDO0lBRUosSUFBSSxDQUFDLEdBQWdCO1FBQ25CLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoRCxPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVELEtBQUssQ0FBQyxHQUFnQixFQUFFLEtBQVU7UUFDaEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFRCxNQUFNLENBQUMsR0FBZ0I7UUFDckIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELG9CQUFvQjtRQUNsQixJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUN6QyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCx1QkFBdUI7UUFDckIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6QixJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFFRCxjQUFjO1FBQ1osT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFFRCxVQUFVOztRQUNSLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsMENBQUUsUUFBUSxDQUFDO0lBQzVDLENBQUM7SUFFRCxlQUFlOztRQUNiLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsMENBQUUsYUFBYSxDQUFDO0lBQ2pELENBQUM7SUFFTyxtQkFBbUIsQ0FBQyxHQUFXOztRQUNyQyxNQUFNLE1BQU0sR0FBRyxPQUFBLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsMENBQUUsUUFBUSxLQUFJLEVBQUUsQ0FBQztRQUM5RSxPQUFPLEdBQUcsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzVCLENBQUM7O2tHQWpEVSx5QkFBeUI7aUVBQXpCLHlCQUF5QixXQUF6Qix5QkFBeUI7a0RBQXpCLHlCQUF5QjtjQURyQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgQWJzdHJhY3RTZWN1cml0eVN0b3JhZ2UgfSBmcm9tICcuL2Fic3RyYWN0LXNlY3VyaXR5LXN0b3JhZ2UnO1xyXG5cclxuZXhwb3J0IHR5cGUgU3RvcmFnZUtleXMgPVxyXG4gIHwgJ2F1dGhuUmVzdWx0J1xyXG4gIHwgJ2F1dGh6RGF0YSdcclxuICB8ICdhY2Nlc3NfdG9rZW5fZXhwaXJlc19hdCdcclxuICB8ICdhdXRoV2VsbEtub3duRW5kUG9pbnRzJ1xyXG4gIHwgJ3VzZXJEYXRhJ1xyXG4gIHwgJ2F1dGhOb25jZSdcclxuICB8ICdjb2RlVmVyaWZpZXInXHJcbiAgfCAnYXV0aFN0YXRlQ29udHJvbCdcclxuICB8ICdzZXNzaW9uX3N0YXRlJ1xyXG4gIHwgJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnXHJcbiAgfCAnc3RvcmFnZUN1c3RvbVJlcXVlc3RQYXJhbXMnXHJcbiAgfCAnb2lkYy1wcm9jZXNzLXJ1bm5pbmcteCdcclxuICB8ICdvaWRjLXByb2Nlc3MtcnVubmluZy15J1xyXG4gIHwgJ29pZGMtb24taGFuZGxlci1ydW5uaW5nLXgnXHJcbiAgfCAnb2lkYy1vbi1oYW5kbGVyLXJ1bm5pbmcteSc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgb2lkY1NlY3VyaXR5U3RvcmFnZTogQWJzdHJhY3RTZWN1cml0eVN0b3JhZ2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyXHJcbiAgKSB7fVxyXG5cclxuICByZWFkKGtleTogU3RvcmFnZUtleXMpIHtcclxuICAgIGNvbnN0IGtleVRvUmVhZCA9IHRoaXMuY3JlYXRlS2V5V2l0aFByZWZpeChrZXkpO1xyXG4gICAgcmV0dXJuIHRoaXMub2lkY1NlY3VyaXR5U3RvcmFnZS5yZWFkKGtleVRvUmVhZCk7XHJcbiAgfVxyXG5cclxuICB3cml0ZShrZXk6IFN0b3JhZ2VLZXlzLCB2YWx1ZTogYW55KSB7XHJcbiAgICBjb25zdCBrZXlUb1N0b3JlID0gdGhpcy5jcmVhdGVLZXlXaXRoUHJlZml4KGtleSk7XHJcbiAgICB0aGlzLm9pZGNTZWN1cml0eVN0b3JhZ2Uud3JpdGUoa2V5VG9TdG9yZSwgdmFsdWUpO1xyXG4gIH1cclxuXHJcbiAgcmVtb3ZlKGtleTogU3RvcmFnZUtleXMpIHtcclxuICAgIGNvbnN0IGtleVRvU3RvcmUgPSB0aGlzLmNyZWF0ZUtleVdpdGhQcmVmaXgoa2V5KTtcclxuICAgIHRoaXMub2lkY1NlY3VyaXR5U3RvcmFnZS5yZW1vdmUoa2V5VG9TdG9yZSk7XHJcbiAgfVxyXG5cclxuICByZXNldFN0b3JhZ2VGbG93RGF0YSgpIHtcclxuICAgIHRoaXMucmVtb3ZlKCdzZXNzaW9uX3N0YXRlJyk7XHJcbiAgICB0aGlzLnJlbW92ZSgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycpO1xyXG4gICAgdGhpcy5yZW1vdmUoJ2NvZGVWZXJpZmllcicpO1xyXG4gICAgdGhpcy5yZW1vdmUoJ3VzZXJEYXRhJyk7XHJcbiAgICB0aGlzLnJlbW92ZSgnc3RvcmFnZUN1c3RvbVJlcXVlc3RQYXJhbXMnKTtcclxuICB9XHJcblxyXG4gIHJlc2V0QXV0aFN0YXRlSW5TdG9yYWdlKCkge1xyXG4gICAgdGhpcy5yZW1vdmUoJ2F1dGh6RGF0YScpO1xyXG4gICAgdGhpcy5yZW1vdmUoJ2F1dGhuUmVzdWx0Jyk7XHJcbiAgfVxyXG5cclxuICBnZXRBY2Nlc3NUb2tlbigpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMucmVhZCgnYXV0aHpEYXRhJyk7XHJcbiAgfVxyXG5cclxuICBnZXRJZFRva2VuKCk6IGFueSB7XHJcbiAgICByZXR1cm4gdGhpcy5yZWFkKCdhdXRoblJlc3VsdCcpPy5pZF90b2tlbjtcclxuICB9XHJcblxyXG4gIGdldFJlZnJlc2hUb2tlbigpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMucmVhZCgnYXV0aG5SZXN1bHQnKT8ucmVmcmVzaF90b2tlbjtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlS2V5V2l0aFByZWZpeChrZXk6IHN0cmluZykge1xyXG4gICAgY29uc3QgcHJlZml4ID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uY2xpZW50SWQgfHwgJyc7XHJcbiAgICByZXR1cm4gYCR7cHJlZml4fV8ke2tleX1gO1xyXG4gIH1cclxufVxyXG4iXX0=