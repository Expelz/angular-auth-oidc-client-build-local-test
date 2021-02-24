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
        return this.storagePersistanceService.read('authStateControl');
    }
    setAuthStateControl(authStateControl) {
        this.storagePersistanceService.write('authStateControl', authStateControl);
    }
    getExistingOrCreateAuthStateControl() {
        let state = this.storagePersistanceService.read('authStateControl');
        if (!state) {
            state = this.randomService.createRandom(40);
            this.storagePersistanceService.write('authStateControl', state);
        }
        return state;
    }
    createAuthStateControl() {
        const state = this.randomService.createRandom(40);
        this.storagePersistanceService.write('authStateControl', state);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvd3MtZGF0YS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7OztBQWEzQyxNQUFNLE9BQU8sZ0JBQWdCO0lBQzNCLFlBQ1UseUJBQW9ELEVBQ3BELGFBQTRCLEVBQzVCLHFCQUE0QyxFQUM1QyxhQUE0QjtRQUg1Qiw4QkFBeUIsR0FBekIseUJBQXlCLENBQTJCO1FBQ3BELGtCQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWU7SUFDbkMsQ0FBQztJQUVKLFdBQVc7UUFDVCxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNsRCxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3JCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFhO1FBQ3BCLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7SUFFRCxtQkFBbUI7UUFDakIsT0FBTyxJQUFJLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7SUFDakUsQ0FBQztJQUVELG1CQUFtQixDQUFDLGdCQUF3QjtRQUMxQyxJQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixFQUFFLGdCQUFnQixDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVELG1DQUFtQztRQUNqQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMseUJB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QUF3QixDQUFDLENBQUM7WUFDcEYsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7WUFDNUQsTUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQyxDQUFDO1lBQ3RGLE1BQU0sZUFBZSxHQUFHLHlCQUF5QixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsQ0FBQywyQkFBMkIsR0FBRyxJQUFJLENBQUM7WUFFdEksSUFBSSxlQUFlLEVBQUU7Z0JBQ25CLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLDhEQUE4RCxDQUFDLENBQUM7Z0JBQzVGLElBQUksQ0FBQyx1QkFBdUIsRUFBRSxDQUFDO2dCQUMvQixPQUFPLEtBQUssQ0FBQzthQUNkO1lBRUQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsdUNBQXVDLElBQUksSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBRWhHLE9BQU8sYUFBYSxDQUFDLEtBQUssS0FBSyxTQUFTLENBQUM7U0FDMUM7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7O2dGQTNJVSxnQkFBZ0I7d0RBQWhCLGdCQUFnQixXQUFoQixnQkFBZ0I7a0RBQWhCLGdCQUFnQjtjQUQ1QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBDb25maWd1cmF0aW9uUHJvdmlkZXIgfSBmcm9tICcuLi9jb25maWcvY29uZmlnLnByb3ZpZGVyJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdG9yYWdlS2V5cywgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgUmFuZG9tU2VydmljZSB9IGZyb20gJy4vcmFuZG9tL3JhbmRvbS5zZXJ2aWNlJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgTXV0dWFsRXhjbHVzaW9uTG9ja2luZ01vZGVsIHtcclxuICB4S2V5OiBTdG9yYWdlS2V5cyxcclxuICB5S2V5OiBTdG9yYWdlS2V5cyxcclxuICBzdGF0ZTogc3RyaW5nXHJcbn1cclxuXHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIEZsb3dzRGF0YVNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByYW5kb21TZXJ2aWNlOiBSYW5kb21TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgY3JlYXRlTm9uY2UoKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IG5vbmNlID0gdGhpcy5yYW5kb21TZXJ2aWNlLmNyZWF0ZVJhbmRvbSg0MCk7XHJcbiAgICB0aGlzLnNldE5vbmNlKG5vbmNlKTtcclxuICAgIHJldHVybiBub25jZTtcclxuICB9XHJcblxyXG4gIHNldE5vbmNlKG5vbmNlOiBzdHJpbmcpIHtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnYXV0aE5vbmNlJywgbm9uY2UpO1xyXG4gIH1cclxuXHJcbiAgZ2V0QXV0aFN0YXRlQ29udHJvbCgpOiBhbnkge1xyXG4gICAgcmV0dXJuIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoU3RhdGVDb250cm9sJyk7XHJcbiAgfVxyXG5cclxuICBzZXRBdXRoU3RhdGVDb250cm9sKGF1dGhTdGF0ZUNvbnRyb2w6IHN0cmluZykge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoU3RhdGVDb250cm9sJywgYXV0aFN0YXRlQ29udHJvbCk7XHJcbiAgfVxyXG5cclxuICBnZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpOiBhbnkge1xyXG4gICAgbGV0IHN0YXRlID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhTdGF0ZUNvbnRyb2wnKTtcclxuICAgIGlmICghc3RhdGUpIHtcclxuICAgICAgc3RhdGUgPSB0aGlzLnJhbmRvbVNlcnZpY2UuY3JlYXRlUmFuZG9tKDQwKTtcclxuICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoU3RhdGVDb250cm9sJywgc3RhdGUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlQXV0aFN0YXRlQ29udHJvbCgpOiBhbnkge1xyXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLnJhbmRvbVNlcnZpY2UuY3JlYXRlUmFuZG9tKDQwKTtcclxuICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdhdXRoU3RhdGVDb250cm9sJywgc3RhdGUpO1xyXG4gICAgcmV0dXJuIHN0YXRlO1xyXG4gIH1cclxuXHJcbiAgc2V0U2Vzc2lvblN0YXRlKHNlc3Npb25TdGF0ZTogYW55KSB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUoJ3Nlc3Npb25fc3RhdGUnLCBzZXNzaW9uU3RhdGUpO1xyXG4gIH1cclxuXHJcbiAgcmVzZXRTdG9yYWdlRmxvd0RhdGEoKSB7XHJcbiAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVzZXRTdG9yYWdlRmxvd0RhdGEoKTtcclxuICB9XHJcblxyXG4gIGdldENvZGVWZXJpZmllcigpIHtcclxuICAgIHJldHVybiB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnY29kZVZlcmlmaWVyJyk7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVDb2RlVmVyaWZpZXIoKSB7XHJcbiAgICBjb25zdCBjb2RlVmVyaWZpZXIgPSB0aGlzLnJhbmRvbVNlcnZpY2UuY3JlYXRlUmFuZG9tKDY3KTtcclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnY29kZVZlcmlmaWVyJywgY29kZVZlcmlmaWVyKTtcclxuICAgIHJldHVybiBjb2RlVmVyaWZpZXI7XHJcbiAgfVxyXG5cclxuICAvLyBpc1NpbGVudFJlbmV3UnVubmluZygpIHtcclxuICAvLyAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSBKU09OLnBhcnNlKHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJykpO1xyXG5cclxuICAvLyAgIGlmIChzdG9yYWdlT2JqZWN0KSB7XHJcbiAgLy8gICAgIGNvbnN0IGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0YyA9IERhdGUucGFyc2Uoc3RvcmFnZU9iamVjdC5kYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gIC8vICAgICBjb25zdCBjdXJyZW50RGF0ZVV0YyA9IERhdGUucGFyc2UobmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcclxuICAvLyAgICAgY29uc3QgZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA9IE1hdGguYWJzKGN1cnJlbnREYXRlVXRjIC0gZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAvLyAgICAgY29uc3QgaXNQcm9iYWJseVN0dWNrID0gZWxhcHNlZFRpbWVJbk1pbGxpc2Vjb25kcyA+IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24uc2lsZW50UmVuZXdUaW1lb3V0SW5TZWNvbmRzICogMTAwMDtcclxuXHJcbiAgLy8gICAgIGlmIChpc1Byb2JhYmx5U3R1Y2spIHtcclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ3NpbGVudCByZW5ldyBwcm9jZXNzIGlzIHByb2JhYmx5IHN0dWNrLCBzdGF0ZSB3aWxsIGJlIHJlc2V0LicpO1xyXG4gIC8vICAgICAgIHRoaXMucmVzZXRTaWxlbnRSZW5ld1J1bm5pbmcoKTtcclxuICAvLyAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgLy8gICAgIH1cclxuXHJcbiAgLy8gICAgIHJldHVybiBzdG9yYWdlT2JqZWN0LnN0YXRlID09PSAncnVubmluZyc7XHJcbiAgLy8gICB9XHJcblxyXG4gIC8vICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIH1cclxuXHJcbiAgc2V0U2lsZW50UmVuZXdSdW5uaW5nKCkge1xyXG4gICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9IHtcclxuICAgICAgc3RhdGU6ICdydW5uaW5nJyxcclxuICAgICAgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZSgnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycsIEpTT04uc3RyaW5naWZ5KHN0b3JhZ2VPYmplY3QpKTtcclxuICB9XHJcblxyXG4gIHJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCkge1xyXG4gICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKCdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJywgJycpO1xyXG4gIH1cclxuXHJcbiAgLy8gaXNTaWxlbnRSZW5ld1J1bm5pbmcoKSB7XHJcbiAgLy8gICBjb25zdCBqc29uID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnKTtcclxuICAvLyAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSAhIWpzb24gPyBKU09OLnBhcnNlKGpzb24pIDogbnVsbDtcclxuXHJcbiAgLy8gICBpZiAoc3RvcmFnZU9iamVjdCkge1xyXG4gIC8vICAgICBjb25zdCBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMgPSBEYXRlLnBhcnNlKHN0b3JhZ2VPYmplY3QuZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAvLyAgICAgY29uc3QgY3VycmVudERhdGVVdGMgPSBEYXRlLnBhcnNlKG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XHJcbiAgLy8gICAgIGNvbnN0IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPSBNYXRoLmFicyhjdXJyZW50RGF0ZVV0YyAtIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgLy8gICAgIGNvbnN0IGlzUHJvYmFibHlTdHVjayA9IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3VGltZW91dEluU2Vjb25kcyAqIDEwMDA7XHJcblxyXG4gIC8vICAgICBpZiAoaXNQcm9iYWJseVN0dWNrKSB7XHJcbiAgLy8gICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnQgcmVuZXcgcHJvY2VzcyBpcyBwcm9iYWJseSBzdHVjaywgc3RhdGUgd2lsbCBiZSByZXNldC4nKTtcclxuICAvLyAgICAgICB0aGlzLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgLy8gICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vICAgICB9XHJcblxyXG4gIC8vICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzU2lsZW50UmVuZXdSdW5uaW5nID4gY3VycmVudFRpbWU6ICR7bmV3IERhdGUoKS50b1RpbWVTdHJpbmcoKX1gKTtcclxuXHJcbiAgLy8gICAgIHJldHVybiBzdG9yYWdlT2JqZWN0LnN0YXRlID09PSAncnVubmluZyc7XHJcbiAgLy8gICB9XHJcblxyXG4gIC8vICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vIH1cclxuXHJcbiAgaXNTaWxlbnRSZW5ld1J1bm5pbmcoKSB7XHJcbiAgICBjb25zdCBqc29uID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ3N0b3JhZ2VTaWxlbnRSZW5ld1J1bm5pbmcnKTtcclxuICAgIGNvbnN0IHN0b3JhZ2VPYmplY3QgPSAhIWpzb24gPyBKU09OLnBhcnNlKGpzb24pIDogbnVsbDtcclxuXHJcbiAgICBpZiAoc3RvcmFnZU9iamVjdCkge1xyXG4gICAgICBjb25zdCBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMgPSBEYXRlLnBhcnNlKHN0b3JhZ2VPYmplY3QuZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAgICAgY29uc3QgY3VycmVudERhdGVVdGMgPSBEYXRlLnBhcnNlKG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSk7XHJcbiAgICAgIGNvbnN0IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPSBNYXRoLmFicyhjdXJyZW50RGF0ZVV0YyAtIGRhdGVPZkxhdW5jaGVkUHJvY2Vzc1V0Yyk7XHJcbiAgICAgIGNvbnN0IGlzUHJvYmFibHlTdHVjayA9IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3VGltZW91dEluU2Vjb25kcyAqIDEwMDA7XHJcblxyXG4gICAgICBpZiAoaXNQcm9iYWJseVN0dWNrKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdzaWxlbnQgcmVuZXcgcHJvY2VzcyBpcyBwcm9iYWJseSBzdHVjaywgc3RhdGUgd2lsbCBiZSByZXNldC4nKTtcclxuICAgICAgICB0aGlzLnJlc2V0U2lsZW50UmVuZXdSdW5uaW5nKCk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYGlzU2lsZW50UmVuZXdSdW5uaW5nID4gY3VycmVudFRpbWU6ICR7bmV3IERhdGUoKS50b1RpbWVTdHJpbmcoKX1gKTtcclxuXHJcbiAgICAgIHJldHVybiBzdG9yYWdlT2JqZWN0LnN0YXRlID09PSAncnVubmluZyc7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gc2V0U2lsZW50UmVuZXdSdW5uaW5nT25IYW5kbGVyV2hlbklzTm90TGF1Y2hlZCgpOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAvLyAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1Zyhgc2V0U2lsZW50UmVuZXdSdW5uaW5nT25IYW5kbGVyV2hlbklzTm90TGF1Y2hlZCBjdXJyZW50VGltZTogJHtuZXcgRGF0ZSgpLnRvVGltZVN0cmluZygpfWApO1xyXG4gIC8vICAgY29uc3QgbG9ja2luZ01vZGVsOiBNdXR1YWxFeGNsdXNpb25Mb2NraW5nTW9kZWwgID0ge1xyXG4gIC8vICAgICBzdGF0ZTogJ29uSGFuZGxlcicsXHJcbiAgLy8gICAgIHhLZXk6ICdvaWRjLW9uLWhhbmRsZXItcnVubmluZy14JyxcclxuICAvLyAgICAgeUtleTogJ29pZGMtb24taGFuZGxlci1ydW5uaW5nLXknXHJcbiAgLy8gICB9XHJcblxyXG4gIC8vICAgcmV0dXJuIHRoaXMucnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobShsb2NraW5nTW9kZWwsICdzdG9yYWdlU2lsZW50UmVuZXdSdW5uaW5nJyk7XHJcbiAgLy8gfVxyXG5cclxuICAvLyBzZXRTaWxlbnRSZW5ld1J1bm5pbmdXaGVuSXNOb3RMYXVjaGVkKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gIC8vICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBzZXRTaWxlbnRSZW5ld1J1bm5pbmdXaGVuSXNOb3RMYXVjaGVkIGN1cnJlbnRUaW1lOiAke25ldyBEYXRlKCkudG9UaW1lU3RyaW5nKCl9YCk7XHJcblxyXG4gIC8vICAgY29uc3QgbG9ja2luZ01vZGVsOiBNdXR1YWxFeGNsdXNpb25Mb2NraW5nTW9kZWwgID0ge1xyXG4gIC8vICAgICBzdGF0ZTogJ3J1bm5pbmcnLFxyXG4gIC8vICAgICB4S2V5OiAnb2lkYy1wcm9jZXNzLXJ1bm5pbmcteCcsXHJcbiAgLy8gICAgIHlLZXk6ICdvaWRjLXByb2Nlc3MtcnVubmluZy15J1xyXG4gIC8vICAgfVxyXG5cclxuICAvLyAgIHJldHVybiB0aGlzLnJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0obG9ja2luZ01vZGVsLCAnc3RvcmFnZVNpbGVudFJlbmV3UnVubmluZycpO1xyXG4gIC8vIH1cclxuXHJcbiAgLy8gcHJpdmF0ZSBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtKGxvY2tpbmdNb2RlbDogTXV0dWFsRXhjbHVzaW9uTG9ja2luZ01vZGVsLCBrZXk6IFN0b3JhZ2VLZXlzKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgLy8gICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAvLyAgICAgY29uc3QgY3VycmVudFJhbmRvbUlkID0gYCR7TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyKDIsIDkpfV8ke25ldyBEYXRlKCkuZ2V0VVRDTWlsbGlzZWNvbmRzKCl9YDtcclxuXHJcbiAgLy8gICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG5cclxuICAvLyAgICAgY29uc3Qgb25TdWNjZXNzTG9ja2luZyA9ICgpID0+IHtcclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gSU5TSURFIG9uU3VjY2Vzc0xvY2tpbmcgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gIC8vICAgICAgIGlmICh0aGlzLmlzU2lsZW50UmVuZXdSdW5uaW5nKGxvY2tpbmdNb2RlbC5zdGF0ZSkpIHtcclxuICAvLyAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBJTlNJREUgb25TdWNjZXNzTG9ja2luZyA+IHRoaXMuaXNTaWxlbnRSZW5ld1J1bm5pbmcgcmV0dXJuIHRydWUgd2UgZ28gYmFjayA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgLy8gICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAvLyAgICAgICB9IGVsc2Uge1xyXG4gIC8vICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IElOU0lERSBvblN1Y2Nlc3NMb2NraW5nID4gVklDVE9SWSAhISEhIFdFIFdJTiBBTkQgU0VUIFZBTFVFPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gIC8vICAgICAgICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9IHtcclxuICAvLyAgICAgICAgICAgc3RhdGU6IGxvY2tpbmdNb2RlbC5zdGF0ZSxcclxuICAvLyAgICAgICAgICAgZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjOiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCksXHJcbiAgLy8gICAgICAgICB9OyBcclxuICAvLyAgICAgICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShrZXksIEpTT04uc3RyaW5naWZ5KHN0b3JhZ2VPYmplY3QpKTtcclxuICAvLyAgICAgICAgIC8vIFJlbGVhc2UgbG9ja1xyXG4gIC8vICAgICAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKGxvY2tpbmdNb2RlbC55S2V5LCAnJyk7XHJcbiAgLy8gICAgICAgICByZXNvbHZlKHRydWUpO1xyXG4gIC8vICAgICAgIH1cclxuICAvLyAgICAgfTtcclxuICAgICAgXHJcbiAgLy8gICAgIHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS53cml0ZShsb2NraW5nTW9kZWwueEtleSwgY3VycmVudFJhbmRvbUlkKTtcclxuICAvLyAgICAgY29uc3QgcmVhZGVkVmFsdWVZID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQobG9ja2luZ01vZGVsLnlLZXkpXHJcblxyXG4gIC8vICAgICBpZiAoISFyZWFkZWRWYWx1ZVkpIHtcclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gcmVhZGVkVmFsdWVZICE9PSAnJyA+IGN1cnJlbnRSYW5kb21JZDogJHtjdXJyZW50UmFuZG9tSWR9YCk7XHJcbiAgLy8gICAgICAgY29uc3Qgc3RvcmFnZU9iamVjdCA9IEpTT04ucGFyc2UocmVhZGVkVmFsdWVZKTtcclxuICAvLyAgICAgICBjb25zdCBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMgPSBEYXRlLnBhcnNlKHN0b3JhZ2VPYmplY3QuZGF0ZU9mTGF1bmNoZWRQcm9jZXNzVXRjKTtcclxuICAvLyAgICAgICBjb25zdCBjdXJyZW50RGF0ZVV0YyA9IERhdGUucGFyc2UobmV3IERhdGUoKS50b0lTT1N0cmluZygpKTtcclxuICAvLyAgICAgICBjb25zdCBlbGFwc2VkVGltZUluTWlsbGlzZWNvbmRzID0gTWF0aC5hYnMoY3VycmVudERhdGVVdGMgLSBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGMpO1xyXG4gIC8vICAgICAgIGNvbnN0IGlzUHJvYmFibHlTdHVjayA9IGVsYXBzZWRUaW1lSW5NaWxsaXNlY29uZHMgPiB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnNpbGVudFJlbmV3VGltZW91dEluU2Vjb25kcyAqIDEwMDA7XHJcblxyXG4gIC8vICAgICAgIGlmIChpc1Byb2JhYmx5U3R1Y2spe1xyXG4gIC8vICAgICAgICAgIC8vIFJlbGVhc2UgbG9ja1xyXG4gIC8vICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBpc1Byb2JhYmx5U3R1Y2sgLSBjbGVhciBZIGtleT4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAvLyAgICAgICB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2Uud3JpdGUobG9ja2luZ01vZGVsLnlLZXksICcnKTtcclxuICAvLyAgICAgICB9XHJcblxyXG4gIC8vICAgICAgIHJlc29sdmUoZmFsc2UpO1xyXG4gIC8vICAgICAgIHJldHVybjtcclxuICAvLyAgICAgfVxyXG5cclxuICAvLyAgICAgdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLndyaXRlKGxvY2tpbmdNb2RlbC55S2V5LCBKU09OLnN0cmluZ2lmeSh7XHJcbiAgLy8gICAgICAgaWQ6IGN1cnJlbnRSYW5kb21JZCxcclxuICAvLyAgICAgICBkYXRlT2ZMYXVuY2hlZFByb2Nlc3NVdGM6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKVxyXG4gIC8vICAgICB9KSk7XHJcblxyXG4gIC8vICAgICBpZiAodGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQobG9ja2luZ01vZGVsLnhLZXkpICE9PSBjdXJyZW50UmFuZG9tSWQpIHtcclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gYmVmb3JlIHNldFRpbWVvdXQgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gIC8vICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gIC8vICAgICAgICAgaWYgKHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKGxvY2tpbmdNb2RlbC55S2V5KSAhPT0gY3VycmVudFJhbmRvbUlkKSB7XHJcbiAgLy8gICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgcnVuTXV0dWFsRXhjbHVzaW9uTG9ja2luZ0FsZ29yaXRobSAtIHN0YXRlIFwiJHtsb2NraW5nTW9kZWwuc3RhdGV9XCIgPiBpbnNpZGUgc2V0VGltZW91dCA+IHdlIExPU0UgPiBjdXJyZW50UmFuZG9tSWQ6ICR7Y3VycmVudFJhbmRvbUlkfWApO1xyXG4gIC8vICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcclxuICAvLyAgICAgICAgICAgcmV0dXJuO1xyXG4gIC8vICAgICAgICAgfVxyXG4gIC8vICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBydW5NdXR1YWxFeGNsdXNpb25Mb2NraW5nQWxnb3JpdGhtIC0gc3RhdGUgXCIke2xvY2tpbmdNb2RlbC5zdGF0ZX1cIiA+IGluc2lkZSBzZXRUaW1lb3V0ID4gd2UgV0lOID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAvLyAgICAgICAgIG9uU3VjY2Vzc0xvY2tpbmcoKTtcclxuICAvLyAgICAgICB9LCBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDApKTtcclxuICAvLyAgICAgfSBlbHNlIHtcclxuICAvLyAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYHJ1bk11dHVhbEV4Y2x1c2lvbkxvY2tpbmdBbGdvcml0aG0gLSBzdGF0ZSBcIiR7bG9ja2luZ01vZGVsLnN0YXRlfVwiID4gV0UgV0lOIEFMTCBDT05ESVRJT05TID4gY3VycmVudFJhbmRvbUlkOiAke2N1cnJlbnRSYW5kb21JZH1gKTtcclxuICAvLyAgICAgICBvblN1Y2Nlc3NMb2NraW5nKCk7XHJcbiAgLy8gICAgIH1cclxuICAvLyAgIH0pO1xyXG4gIC8vIH1cclxufVxyXG4iXX0=