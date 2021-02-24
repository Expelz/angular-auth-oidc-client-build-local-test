import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../config/config.provider";
import * as i2 from "../logging/logger.service";
export class BrowserStorageService {
    constructor(configProvider, loggerService) {
        this.configProvider = configProvider;
        this.loggerService = loggerService;
    }
    read(key) {
        var _a;
        if (!this.hasStorage()) {
            this.loggerService.logDebug(`Wanted to read '${key}' but Storage was undefined`);
            return false;
        }
        const item = (_a = this.getStorage()) === null || _a === void 0 ? void 0 : _a.getItem(key);
        if (!item) {
            this.loggerService.logDebug(`Wanted to read '${key}' but nothing was found`);
            return null;
        }
        return JSON.parse(item);
    }
    write(key, value) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(`Wanted to write '${key}/${value}' but Storage was falsy`);
            return false;
        }
        const storage = this.getStorage();
        if (!storage) {
            this.loggerService.logDebug(`Wanted to write '${key}/${value}' but Storage was falsy`);
            return false;
        }
        value = value || null;
        storage.setItem(`${key}`, JSON.stringify(value));
        return true;
    }
    remove(key) {
        if (!this.hasStorage()) {
            this.loggerService.logDebug(`Wanted to remove '${key}' but Storage was falsy`);
            return false;
        }
        const storage = this.getStorage();
        if (!storage) {
            this.loggerService.logDebug(`Wanted to write '${key}' but Storage was falsy`);
            return false;
        }
        storage.removeItem(`${key}`);
        return true;
    }
    getStorage() {
        var _a;
        return (_a = this.configProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.storage;
    }
    hasStorage() {
        return typeof Storage !== 'undefined';
    }
}
BrowserStorageService.ɵfac = function BrowserStorageService_Factory(t) { return new (t || BrowserStorageService)(i0.ɵɵinject(i1.ConfigurationProvider), i0.ɵɵinject(i2.LoggerService)); };
BrowserStorageService.ɵprov = i0.ɵɵdefineInjectable({ token: BrowserStorageService, factory: BrowserStorageService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(BrowserStorageService, [{
        type: Injectable
    }], function () { return [{ type: i1.ConfigurationProvider }, { type: i2.LoggerService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1zdG9yYWdlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9zdG9yYWdlL2Jyb3dzZXItc3RvcmFnZS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7Ozs7QUFNM0MsTUFBTSxPQUFPLHFCQUFxQjtJQUNoQyxZQUFvQixjQUFxQyxFQUFVLGFBQTRCO1FBQTNFLG1CQUFjLEdBQWQsY0FBYyxDQUF1QjtRQUFVLGtCQUFhLEdBQWIsYUFBYSxDQUFlO0lBQUcsQ0FBQztJQUVuRyxJQUFJLENBQUMsR0FBVzs7UUFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLG1CQUFtQixHQUFHLDZCQUE2QixDQUFDLENBQUM7WUFDakYsT0FBTyxLQUFLLENBQUM7U0FDZDtRQUVELE1BQU0sSUFBSSxTQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsMENBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDVCxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO1lBQzdFLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVELEtBQUssQ0FBQyxHQUFXLEVBQUUsS0FBVTtRQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFO1lBQ3RCLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLG9CQUFvQixHQUFHLElBQUksS0FBSyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3ZGLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNaLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLG9CQUFvQixHQUFHLElBQUksS0FBSyx5QkFBeUIsQ0FBQyxDQUFDO1lBQ3ZGLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxLQUFLLEdBQUcsS0FBSyxJQUFJLElBQUksQ0FBQztRQUV0QixPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsR0FBRyxFQUFFLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUVELE1BQU0sQ0FBQyxHQUFXO1FBQ2hCLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDdEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMscUJBQXFCLEdBQUcseUJBQXlCLENBQUMsQ0FBQztZQUMvRSxPQUFPLEtBQUssQ0FBQztTQUNkO1FBRUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDWixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxvQkFBb0IsR0FBRyx5QkFBeUIsQ0FBQyxDQUFDO1lBQzlFLE9BQU8sS0FBSyxDQUFDO1NBQ2Q7UUFFRCxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQztRQUM3QixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFFTyxVQUFVOztRQUNoQixhQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CLDBDQUFFLE9BQU8sQ0FBQztJQUMxRCxDQUFDO0lBRU8sVUFBVTtRQUNoQixPQUFPLE9BQU8sT0FBTyxLQUFLLFdBQVcsQ0FBQztJQUN4QyxDQUFDOzswRkEzRFUscUJBQXFCOzZEQUFyQixxQkFBcUIsV0FBckIscUJBQXFCO2tEQUFyQixxQkFBcUI7Y0FEakMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgQWJzdHJhY3RTZWN1cml0eVN0b3JhZ2UgfSBmcm9tICcuL2Fic3RyYWN0LXNlY3VyaXR5LXN0b3JhZ2UnO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgQnJvd3NlclN0b3JhZ2VTZXJ2aWNlIGltcGxlbWVudHMgQWJzdHJhY3RTZWN1cml0eVN0b3JhZ2Uge1xyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgY29uZmlnUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlciwgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlKSB7fVxyXG5cclxuICByZWFkKGtleTogc3RyaW5nKTogYW55IHtcclxuICAgIGlmICghdGhpcy5oYXNTdG9yYWdlKCkpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBXYW50ZWQgdG8gcmVhZCAnJHtrZXl9JyBidXQgU3RvcmFnZSB3YXMgdW5kZWZpbmVkYCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBpdGVtID0gdGhpcy5nZXRTdG9yYWdlKCk/LmdldEl0ZW0oa2V5KTtcclxuXHJcbiAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBXYW50ZWQgdG8gcmVhZCAnJHtrZXl9JyBidXQgbm90aGluZyB3YXMgZm91bmRgKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIEpTT04ucGFyc2UoaXRlbSk7XHJcbiAgfVxyXG5cclxuICB3cml0ZShrZXk6IHN0cmluZywgdmFsdWU6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0aGlzLmhhc1N0b3JhZ2UoKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYFdhbnRlZCB0byB3cml0ZSAnJHtrZXl9LyR7dmFsdWV9JyBidXQgU3RvcmFnZSB3YXMgZmFsc3lgKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0b3JhZ2UgPSB0aGlzLmdldFN0b3JhZ2UoKTtcclxuICAgIGlmICghc3RvcmFnZSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYFdhbnRlZCB0byB3cml0ZSAnJHtrZXl9LyR7dmFsdWV9JyBidXQgU3RvcmFnZSB3YXMgZmFsc3lgKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHZhbHVlID0gdmFsdWUgfHwgbnVsbDtcclxuXHJcbiAgICBzdG9yYWdlLnNldEl0ZW0oYCR7a2V5fWAsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIHJlbW92ZShrZXk6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCF0aGlzLmhhc1N0b3JhZ2UoKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoYFdhbnRlZCB0byByZW1vdmUgJyR7a2V5fScgYnV0IFN0b3JhZ2Ugd2FzIGZhbHN5YCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdG9yYWdlID0gdGhpcy5nZXRTdG9yYWdlKCk7XHJcbiAgICBpZiAoIXN0b3JhZ2UpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGBXYW50ZWQgdG8gd3JpdGUgJyR7a2V5fScgYnV0IFN0b3JhZ2Ugd2FzIGZhbHN5YCk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBzdG9yYWdlLnJlbW92ZUl0ZW0oYCR7a2V5fWApO1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFN0b3JhZ2UoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5jb25maWdQcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uPy5zdG9yYWdlO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBoYXNTdG9yYWdlKCkge1xyXG4gICAgcmV0dXJuIHR5cGVvZiBTdG9yYWdlICE9PSAndW5kZWZpbmVkJztcclxuICB9XHJcbn1cclxuIl19