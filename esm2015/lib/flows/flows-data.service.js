import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../storage/storage-persistance.service";
import * as i2 from "./random/random.service";
import * as i3 from "../config/config.provider";
import * as i4 from "../logging/logger.service";
export class FlowsDataService {
    constructor(storagePersistanceService, randomService, configurationProvider, loggerService) {
        this.storagePersistanceService = storagePersistanceService;
        this.randomService = randomService;
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
    }
    createNonce() {
        const nonce = this.randomService.createRandom(40);
        this.setNonce(nonce);
        return nonce;
    }
    setNonce(nonce) {
        this.storagePersistanceService.write('authNonce', nonce);
    }
    getAuthStateControl() {
        const json = this.storagePersistanceService.read('authStateControl');
        const storageObject = !!json ? JSON.parse(json) : null;
        this.loggerService.logDebug(`getAuthStateControl > currentTime: ${new Date().toTimeString()}`);
        if (storageObject) {
            const dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
            const currentDateUtc = Date.parse(new Date().toISOString());
            const elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
            const isProbablyStuck = elapsedTimeInMilliseconds > this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000;
            if (isProbablyStuck) {
                this.loggerService.logWarning('getAuthStateControl -> silent renew process is probably stuck, AuthState will be reset.');
                this.storagePersistanceService.write('authStateControl', '');
                return false;
            }
            this.loggerService.logDebug(`getAuthStateControl > STATE SUCCESSFULLY RETURNED ${storageObject.state} > currentTime: ${new Date().toTimeString()}`);
            return storageObject.state;
        }
        this.loggerService.logWarning(`getAuthStateControl > storageObject IS NULL RETURN FALSE > currentTime: ${new Date().toTimeString()}`);
        return false;
    }
    setAuthStateControl(authStateControl) {
        this.storagePersistanceService.write('authStateControl', authStateControl);
    }
    getExistingOrCreateAuthStateControl() {
        let state = this.getAuthStateControl();
        if (!state) {
            state = this.createAuthStateControl();
        }
        return state;
    }
    createAuthStateControl() {
        const state = this.randomService.createRandom(40);
        const storageObject = {
            state: state,
            dateOfLaunchedProcessUtc: new Date().toISOString(),
        };
        this.storagePersistanceService.write('authStateControl', storageObject);
        return state;
    }
    setSessionState(sessionState) {
        this.storagePersistanceService.write('session_state', sessionState);
    }
    resetStorageFlowData() {
        this.storagePersistanceService.resetStorageFlowData();
    }
    getCodeVerifier() {
        return this.storagePersistanceService.read('codeVerifier');
    }
    createCodeVerifier() {
        const codeVerifier = this.randomService.createRandom(67);
        this.storagePersistanceService.write('codeVerifier', codeVerifier);
        return codeVerifier;
    }
    // isSilentRenewRunning() {
    //   const storageObject = JSON.parse(this.storagePersistanceService.read('storageSilentRenewRunning'));
    //   if (storageObject) {
    //     const dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
    //     const currentDateUtc = Date.parse(new Date().toISOString());
    //     const elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
    //     const isProbablyStuck = elapsedTimeInMilliseconds > this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000;
    //     if (isProbablyStuck) {
    //       this.loggerService.logDebug('silent renew process is probably stuck, state will be reset.');
    //       this.resetSilentRenewRunning();
    //       return false;
    //     }
    //     return storageObject.state === 'running';
    //   }
    //   return false;
    // }
    setSilentRenewRunning() {
        const storageObject = {
            state: 'running',
            dateOfLaunchedProcessUtc: new Date().toISOString(),
        };
        this.storagePersistanceService.write('storageSilentRenewRunning', JSON.stringify(storageObject));
    }
    resetSilentRenewRunning() {
        this.storagePersistanceService.write('storageSilentRenewRunning', '');
    }
    // isSilentRenewRunning() {
    //   const json = this.storagePersistanceService.read('storageSilentRenewRunning');
    //   const storageObject = !!json ? JSON.parse(json) : null;
    //   if (storageObject) {
    //     const dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
    //     const currentDateUtc = Date.parse(new Date().toISOString());
    //     const elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
    //     const isProbablyStuck = elapsedTimeInMilliseconds > this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000;
    //     if (isProbablyStuck) {
    //       this.loggerService.logDebug('silent renew process is probably stuck, state will be reset.');
    //       this.resetSilentRenewRunning();
    //       return false;
    //     }
    //     this.loggerService.logDebug(`isSilentRenewRunning > currentTime: ${new Date().toTimeString()}`);
    //     return storageObject.state === 'running';
    //   }
    //   return false;
    // }
    isSilentRenewRunning() {
        const json = this.storagePersistanceService.read('storageSilentRenewRunning');
        const storageObject = !!json ? JSON.parse(json) : null;
        if (storageObject) {
            const dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
            const currentDateUtc = Date.parse(new Date().toISOString());
            const elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
            const isProbablyStuck = elapsedTimeInMilliseconds > this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000;
            if (isProbablyStuck) {
                this.loggerService.logDebug('silent renew process is probably stuck, state will be reset.');
                this.resetSilentRenewRunning();
                return false;
            }
            this.loggerService.logDebug(`isSilentRenewRunning > currentTime: ${new Date().toTimeString()}`);
            return storageObject.state === 'running';
        }
        return false;
    }
}
FlowsDataService.ɵfac = function FlowsDataService_Factory(t) { return new (t || FlowsDataService)(i0.ɵɵinject(i1.StoragePersistanceService), i0.ɵɵinject(i2.RandomService), i0.ɵɵinject(i3.ConfigurationProvider), i0.ɵɵinject(i4.LoggerService)); };
FlowsDataService.ɵprov = i0.ɵɵdefineInjectable({ token: FlowsDataService, factory: FlowsDataService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(FlowsDataService, [{
        type: Injectable
    }], function () { return [{ type: i1.StoragePersistanceService }, { type: i2.RandomService }, { type: i3.ConfigurationProvider }, { type: i4.LoggerService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3MtZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7OztBQWEzQyxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ1UseUJBQW9ELEVBQ3BELGFBQTRCLEVBQzVCLHFCQUE0QyxFQUM1QyxhQUE0QjtRQUg1Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFDbkMsQ0FBQztJQUVKLFdBQVc7UUFDVCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFhO1FBQ3BCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxtQkFBbUI7UUFDakIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUV2RCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxzQ0FBc0Ms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QixNQUFNLHdCQUF3QixHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLHdCQUF3QixDQUFDLENBQUM7WUFDcEYsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDNUQsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sZUFBZSxHQUFHLHlCQUF5QixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUM7WUFFdEksSUFBSSxlQUFlLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLDhEQUE4RCxDQUFDLENBQUM7Z0JBQzVGLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUMvQixPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsdUNBQXVDLElBQUksSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWhHLE9BQU8sYUFBYSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUM7U0FDMUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7O2dGQXhLVSxnQkFBZ0I7d0RBQWhCLGdCQUFnQixXQUFoQixnQkFBZ0I7a0RBQWhCLGdCQUFnQjtjQUQ1QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdG9yYWdlS2V5cywgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmFuZG9tU2VydmljZSB9IGZyb20gJy4vcmFuZG9tL3JhbmRvbS5zZXJ2aWNlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTXV0dWFsRXhjbHVzaW9uTG9ja2luZ01vZGVsIHtcclxuICB4S2V5OiBTdG9yYWdlS2V5cztcclxuICB5S2V5OiBTdG9yYWdlS2V5cztcclxuICBzdGF0ZTogc3RyaW5nO1xyXG59XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBGbG93c0RhdGFTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSxcclxuICAgIHByaXZhdGUgcmFuZG9tU2VydmljZTogUmFuZG9tU2VydmljZSxcclxuICAgIHByaXZhdGUgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGNyZWF0ZU5vbmNlKCk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBub25jZSA9IHRoaXMucmFuZG9tU2VydmljZS5jcmVhdGVSYW5kb20oNDApO1xyXG4gICAgdGhpcy5zZXROb25jZShub25jZSk7XHJcbiAgICByZXR1cm4gbm9uY2U7XHJcbiAgfVxyXG5cclxuICBzZXROb25jZShub25jZTogc3RyaW5nKSB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ2F1dGhOb25jZScsIG5vbmNlKTtcclxuICB9XHJcblxyXG4gIGdldEF1dGhTdGF0ZUNvbnRyb2woKTogYW55IHtcclxuICAgIGNvbnN0IGpzb24gPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFN0YXRlQ29udHJvbCcpO1xyXG4gICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9ICEhanNvbiA/IEpTT04ucGFyc2UoanNvbikgOiBudWxsO1xyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgZ2V0QXV0aFN0YXRlQ29udHJvbCA+IGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcblxyXG4gICAgaWYgKHN0b3JhZ2VPYmplY3QpIHtcclxuICAgICAgY29uc3QgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjID0gRGF0ZS5wYXJzZShzdG9yYWdlT2JqZWN0LmRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnREYXRlVXRjID0gRGF0ZS5wYXJzZShuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICBjb25zdCBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID0gTWF0aC5hYnMoY3VycmVudERhdGVVdGMgLSBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gICAgICBjb25zdCBpc1Byb2JhYmx5U3R1Y2sgPSBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID4gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ld1RpbWVvdXRJblNlY29uZHMgKiAxMDAwO1xyXG5cclxuICAgICAgaWYgKGlzUHJvYmFibHlTdHVjaykge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdnZXRBdXRoU3RhdGVDb250cm9sIC0+IHNpbGVudCByZW5ldyBwcm9jZXNzIGlzIHByb2JhYmx5IHN0dWNrLCBBdXRoU3RhdGUgd2lsbCBiZSByZXNldC4nKTtcclxuICAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ2F1dGhTdGF0ZUNvbnRyb2wnLCAnJyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoXHJcbiAgICAgICAgYGdldEF1dGhTdGF0ZUNvbnRyb2wgPiBTVEFURSBTVUNDRVNTRlVMTFkgUkVUVVJORUQgJHtzdG9yYWdlT2JqZWN0LnN0YXRlfSA+IGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YFxyXG4gICAgICApO1xyXG5cclxuICAgICAgcmV0dXJuIHN0b3JhZ2VPYmplY3Quc3RhdGU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoYGdldEF1dGhTdGF0ZUNvbnRyb2wgPiBzdG9yYWdlT2JqZWN0IElTIE5VTEwgUkVUVVJOIEZBTFNFID4gY3VycmVudFRpbWU6ICR7bmV3IERhdGUoKS50b1RpbWVTdHJpbmcoKX1gKTtcclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBzZXRBdXRoU3RhdGVDb250cm9sKGF1dGhTdGF0ZUNvbnRyb2w6IHN0cmluZykge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoU3RhdGVDb250cm9sJywgYXV0aFN0YXRlQ29udHJvbCk7XHJcbiAgfVxyXG5cclxuICBnZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpOiBhbnkge1xyXG4gICAgbGV0IHN0YXRlID0gdGhpcy5nZXRBdXRoU3RhdGVDb250cm9sKCk7XHJcbiAgICBpZiAoIXN0YXRlKSB7XHJcbiAgICAgIHN0YXRlID0gdGhpcy5jcmVhdGVBdXRoU3RhdGVDb250cm9sKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVBdXRoU3RhdGVDb250cm9sKCk6IGFueSB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMucmFuZG9tU2VydmljZS5jcmVhdGVSYW5kb20oNDApO1xyXG4gICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9IHtcclxuICAgICAgc3RhdGU6IHN0YXRlLFxyXG4gICAgICBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGM6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAgIH07XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ2F1dGhTdGF0ZUNvbnRyb2wnLCBzdG9yYWdlT2JqZWN0KTtcclxuICAgIHJldHVybiBzdGF0ZTtcclxuICB9XHJcblxyXG4gIHNldFNlc3Npb25TdGF0ZShzZXNzaW9uU3RhdGU6IGFueSkge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdzZXNzaW9uX3N0YXRlJywgc2Vzc2lvblN0YXRlKTtcclxuICB9XHJcblxyXG4gIHJlc2V0U3RvcmFnZUZsb3dEYXRhKCkge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlc2V0U3RvcmFnZUZsb3dEYXRhKCk7XHJcbiAgfVxyXG5cclxuICBnZXRDb2RlVmVyaWZpZXIoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2NvZGVWZXJpZmllcicpO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlQ29kZVZlcmlmaWVyKCkge1xyXG4gICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg2Nyk7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ2NvZGVWZXJpZmllcicsIGNvZGVWZXJpZmllcik7XHJcbiAgICByZXR1cm4gY29kZVZlcmlmaWVyO1xyXG4gIH1cclxuXHJcbiAgLy8gaXNTaWxlbnRSZW5ld1J1bm5pbmcoKSB7XHJcbiAgLy8gICBjb25zdCBzdG9yYWdlT2JqZWN0ID0gSlNPTi5wYXJzZSh0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycpKTtcclxuXHJcbiAgLy8gICBpZiAoc3RvcmFnZU9iamVjdCkge1xyXG4gIC8vICAgICBjb25zdCBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMgPSBEYXRlLnBhcnNlKHN0b3JhZ2VPYmplY3QuZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAvLyAgICAgY29uc3QgY3VycmVudERhdGVVdGMgPSBEYXRlLnBhcnNlKG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XHJcbiAgLy8gICAgIGNvbnN0IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPSBNYXRoLmFicyhjdXJyZW50RGF0ZVV0YyAtIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgLy8gICAgIGNvbnN0IGlzUHJvYmFibHlTdHVjayA9IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3VGltZW91dEluU2Vjb25kcyAqIDEwMDA7XHJcblxyXG4gIC8vICAgICBpZiAoaXNQcm9iYWJseVN0dWNrKSB7XHJcbiAgLy8gICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnQgcmVuZXcgcHJvY2VzcyBpcyBwcm9iYWJseSBzdHVjaywgc3RhdGUgd2lsbCBiZSByZXNldC4nKTtcclxuICAvLyAgICAgICB0aGlzLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgLy8gICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vICAgICB9XHJcblxyXG4gIC8vICAgICByZXR1cm4gc3RvcmFnZU9iamVjdC5zdGF0ZSA9PT0gJ3J1bm5pbmcnO1xyXG4gIC8vICAgfVxyXG5cclxuICAvLyAgIHJldHVybiBmYWxzZTtcclxuICAvLyB9XHJcblxyXG4gIHNldFNpbGVudFJlbmV3UnVubmluZygpIHtcclxuICAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSB7XHJcbiAgICAgIHN0YXRlOiAncnVubmluZycsXHJcbiAgICAgIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnLCBKU09OLnN0cmluZ2lmeShzdG9yYWdlT2JqZWN0KSk7XHJcbiAgfVxyXG5cclxuICByZXNldFNpbGVudFJlbmV3UnVubmluZygpIHtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycsICcnKTtcclxuICB9XHJcblxyXG4gIC8vIGlzU2lsZW50UmVuZXdSdW5uaW5nKCkge1xyXG4gIC8vICAgY29uc3QganNvbiA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJyk7XHJcbiAgLy8gICBjb25zdCBzdG9yYWdlT2JqZWN0ID0gISFqc29uID8gSlNPTi5wYXJzZShqc29uKSA6IG51bGw7XHJcblxyXG4gIC8vICAgaWYgKHN0b3JhZ2VPYmplY3QpIHtcclxuICAvLyAgICAgY29uc3QgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjID0gRGF0ZS5wYXJzZShzdG9yYWdlT2JqZWN0LmRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgLy8gICAgIGNvbnN0IGN1cnJlbnREYXRlVXRjID0gRGF0ZS5wYXJzZShuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xyXG4gIC8vICAgICBjb25zdCBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID0gTWF0aC5hYnMoY3VycmVudERhdGVVdGMgLSBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gIC8vICAgICBjb25zdCBpc1Byb2JhYmx5U3R1Y2sgPSBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID4gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ld1RpbWVvdXRJblNlY29uZHMgKiAxMDAwO1xyXG5cclxuICAvLyAgICAgaWYgKGlzUHJvYmFibHlTdHVjaykge1xyXG4gIC8vICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnc2lsZW50IHJlbmV3IHByb2Nlc3MgaXMgcHJvYmFibHkgc3R1Y2ssIHN0YXRlIHdpbGwgYmUgcmVzZXQuJyk7XHJcbiAgLy8gICAgICAgdGhpcy5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gIC8vICAgICAgIHJldHVybiBmYWxzZTtcclxuICAvLyAgICAgfVxyXG5cclxuICAvLyAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcblxyXG4gIC8vICAgICByZXR1cm4gc3RvcmFnZU9iamVjdC5zdGF0ZSA9PT0gJ3J1bm5pbmcnO1xyXG4gIC8vICAgfVxyXG5cclxuICAvLyAgIHJldHVybiBmYWxzZTtcclxuICAvLyB9XHJcblxyXG4gIGlzU2lsZW50UmVuZXdSdW5uaW5nKCkge1xyXG4gICAgY29uc3QganNvbiA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJyk7XHJcbiAgICBjb25zdCBzdG9yYWdlT2JqZWN0ID0gISFqc29uID8gSlNPTi5wYXJzZShqc29uKSA6IG51bGw7XHJcblxyXG4gICAgaWYgKHN0b3JhZ2VPYmplY3QpIHtcclxuICAgICAgY29uc3QgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjID0gRGF0ZS5wYXJzZShzdG9yYWdlT2JqZWN0LmRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgICAgIGNvbnN0IGN1cnJlbnREYXRlVXRjID0gRGF0ZS5wYXJzZShuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkpO1xyXG4gICAgICBjb25zdCBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID0gTWF0aC5hYnMoY3VycmVudERhdGVVdGMgLSBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gICAgICBjb25zdCBpc1Byb2JhYmx5U3R1Y2sgPSBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID4gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi5zaWxlbnRSZW5ld1RpbWVvdXRJblNlY29uZHMgKiAxMDAwO1xyXG5cclxuICAgICAgaWYgKGlzUHJvYmFibHlTdHVjaykge1xyXG4gICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zygnc2lsZW50IHJlbmV3IHByb2Nlc3MgaXMgcHJvYmFibHkgc3R1Y2ssIHN0YXRlIHdpbGwgYmUgcmVzZXQuJyk7XHJcbiAgICAgICAgdGhpcy5yZXNldFNpbGVudFJlbmV3UnVubmluZygpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBpc1NpbGVudFJlbmV3UnVubmluZyA+IGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcblxyXG4gICAgICByZXR1cm4gc3RvcmFnZU9iamVjdC5zdGF0ZSA9PT0gJ3J1bm5pbmcnO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIHNldFNpbGVudFJlbmV3UnVubmluZ09uSGFuZGxlcldoZW5Jc05vdExhdWNoZWQoKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgLy8gICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHNldFNpbGVudFJlbmV3UnVubmluZ09uSGFuZGxlcldoZW5Jc05vdExhdWNoZWQgY3VycmVudFRpbWU6ICR7bmV3IERhdGUoKS50b1RpbWVTdHJpbmcoKX1gKTtcclxuICAvLyAgIGNvbnN0IGxvY2tpbmdNb2RlbDogTXV0dWFsRXhjbHVzaW9uTG9ja2luZ01vZGVsICA9IHtcclxuICAvLyAgICAgc3RhdGU6ICdvbkhhbmRsZXInLFxyXG4gIC8vICAgICB4S2V5OiAnb2lkYy1vbi1oYW5kbGVyLXJ1bm5pbmcteCcsXHJcbiAgLy8gICAgIHlLZXk6ICdvaWRjLW9uLWhhbmRsZXItcnVubmluZy15J1xyXG4gIC8vICAgfVxyXG5cclxuICAvLyAgIHJldHVybiB0aGlzLnJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0obG9ja2luZ01vZGVsLCAnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycpO1xyXG4gIC8vIH1cclxuXHJcbiAgLy8gc2V0U2lsZW50UmVuZXdSdW5uaW5nV2hlbklzTm90TGF1Y2hlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAvLyAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhgc2V0U2lsZW50UmVuZXdSdW5uaW5nV2hlbklzTm90TGF1Y2hlZCBjdXJyZW50VGltZTogJHtuZXcgRGF0ZSgpLnRvVGltZVN0cmluZygpfWApO1xyXG5cclxuICAvLyAgIGNvbnN0IGxvY2tpbmdNb2RlbDogTXV0dWFsRXhjbHVzaW9uTG9ja2luZ01vZGVsICA9IHtcclxuICAvLyAgICAgc3RhdGU6ICdydW5uaW5nJyxcclxuICAvLyAgICAgeEtleTogJ29pZGMtcHJvY2Vzcy1ydW5uaW5nLXgnLFxyXG4gIC8vICAgICB5S2V5OiAnb2lkYy1wcm9jZXNzLXJ1bm5pbmcteSdcclxuICAvLyAgIH1cclxuXHJcbiAgLy8gICByZXR1cm4gdGhpcy5ydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtKGxvY2tpbmdNb2RlbCwgJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnKTtcclxuICAvLyB9XHJcblxyXG4gIC8vIHByaXZhdGUgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobShsb2NraW5nTW9kZWw6IE11dHVhbEV4Y2x1c2lvbkxvY2tpbmdNb2RlbCwga2V5OiBTdG9yYWdlS2V5cyk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gIC8vICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgLy8gICAgIGNvbnN0IGN1cnJlbnRSYW5kb21JZCA9IGAke01hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KX1fJHtuZXcgRGF0ZSgpLmdldFVUQ01pbGxpc2Vjb25kcygpfWA7XHJcblxyXG4gIC8vICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuXHJcbiAgLy8gICAgIGNvbnN0IG9uU3VjY2Vzc0xvY2tpbmcgPSAoKSA9PiB7XHJcbiAgLy8gICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IElOU0lERSBvblN1Y2Nlc3NMb2NraW5nID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAvLyAgICAgICBpZiAodGhpcy5pc1NpbGVudFJlbmV3UnVubmluZyhsb2NraW5nTW9kZWwuc3RhdGUpKSB7XHJcbiAgLy8gICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gSU5TSURFIG9uU3VjY2Vzc0xvY2tpbmcgPiB0aGlzLmlzU2lsZW50UmVuZXdSdW5uaW5nIHJldHVybiB0cnVlIHdlIGdvIGJhY2sgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gIC8vICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XHJcbiAgLy8gICAgICAgfSBlbHNlIHtcclxuICAvLyAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBJTlNJREUgb25TdWNjZXNzTG9ja2luZyA+IFZJQ1RPUlkgISEhISBXRSBXSU4gQU5EIFNFVCBWQUxVRT4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAvLyAgICAgICAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSB7XHJcbiAgLy8gICAgICAgICAgIHN0YXRlOiBsb2NraW5nTW9kZWwuc3RhdGUsXHJcbiAgLy8gICAgICAgICAgIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxyXG4gIC8vICAgICAgICAgfTtcclxuICAvLyAgICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShrZXksIEpTT04uc3RyaW5naWZ5KHN0b3JhZ2VPYmplY3QpKTtcclxuICAvLyAgICAgICAgIC8vIFJlbGVhc2UgbG9ja1xyXG4gIC8vICAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKGxvY2tpbmdNb2RlbC55S2V5LCAnJyk7XHJcbiAgLy8gICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gIC8vICAgICAgIH1cclxuICAvLyAgICAgfTtcclxuXHJcbiAgLy8gICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShsb2NraW5nTW9kZWwueEtleSwgY3VycmVudFJhbmRvbUlkKTtcclxuICAvLyAgICAgY29uc3QgcmVhZGVkVmFsdWVZID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQobG9ja2luZ01vZGVsLnlLZXkpXHJcblxyXG4gIC8vICAgICBpZiAoISFyZWFkZWRWYWx1ZVkpIHtcclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gcmVhZGVkVmFsdWVZICE9PSAnJyA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgLy8gICAgICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9IEpTT04ucGFyc2UocmVhZGVkVmFsdWVZKTtcclxuICAvLyAgICAgICBjb25zdCBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMgPSBEYXRlLnBhcnNlKHN0b3JhZ2VPYmplY3QuZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAvLyAgICAgICBjb25zdCBjdXJyZW50RGF0ZVV0YyA9IERhdGUucGFyc2UobmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcclxuICAvLyAgICAgICBjb25zdCBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID0gTWF0aC5hYnMoY3VycmVudERhdGVVdGMgLSBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gIC8vICAgICAgIGNvbnN0IGlzUHJvYmFibHlTdHVjayA9IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3VGltZW91dEluU2Vjb25kcyAqIDEwMDA7XHJcblxyXG4gIC8vICAgICAgIGlmIChpc1Byb2JhYmx5U3R1Y2spe1xyXG4gIC8vICAgICAgICAgIC8vIFJlbGVhc2UgbG9ja1xyXG4gIC8vICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBpc1Byb2JhYmx5U3R1Y2sgLSBjbGVhciBZIGtleT4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAvLyAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUobG9ja2luZ01vZGVsLnlLZXksICcnKTtcclxuICAvLyAgICAgICB9XHJcblxyXG4gIC8vICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gIC8vICAgICAgIHJldHVybjtcclxuICAvLyAgICAgfVxyXG5cclxuICAvLyAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKGxvY2tpbmdNb2RlbC55S2V5LCBKU09OLnN0cmluZ2lmeSh7XHJcbiAgLy8gICAgICAgaWQ6IGN1cnJlbnRSYW5kb21JZCxcclxuICAvLyAgICAgICBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGM6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG4gIC8vICAgICB9KSk7XHJcblxyXG4gIC8vICAgICBpZiAodGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQobG9ja2luZ01vZGVsLnhLZXkpICE9PSBjdXJyZW50UmFuZG9tSWQpIHtcclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gYmVmb3JlIHNldFRpbWVvdXQgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gIC8vICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gIC8vICAgICAgICAgaWYgKHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKGxvY2tpbmdNb2RlbC55S2V5KSAhPT0gY3VycmVudFJhbmRvbUlkKSB7XHJcbiAgLy8gICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBpbnNpZGUgc2V0VGltZW91dCA+IHdlIExPU0UgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gIC8vICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAvLyAgICAgICAgICAgcmV0dXJuO1xyXG4gIC8vICAgICAgICAgfVxyXG4gIC8vICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IGluc2lkZSBzZXRUaW1lb3V0ID4gd2UgV0lOID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAvLyAgICAgICAgIG9uU3VjY2Vzc0xvY2tpbmcoKTtcclxuICAvLyAgICAgICB9LCBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDApKTtcclxuICAvLyAgICAgfSBlbHNlIHtcclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gV0UgV0lOIEFMTCBDT05ESVRJT05TID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAvLyAgICAgICBvblN1Y2Nlc3NMb2NraW5nKCk7XHJcbiAgLy8gICAgIH1cclxuICAvLyAgIH0pO1xyXG4gIC8vIH1cclxufVxyXG4iXX0=