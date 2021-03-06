import { Injectable } from '@angular/core';
import { allRules } from './rules';
import * as i0 from "@angular/core";
import * as i1 from "../logging/logger.service";
export class ConfigValidationService {
    constructor(loggerService) {
        this.loggerService = loggerService;
    }
    validateConfig(passedConfig) {
        const allValidationResults = allRules.map((rule) => rule(passedConfig));
        const allMessages = allValidationResults.filter((x) => x.messages.length > 0);
        const allErrorMessages = this.getAllMessagesOfType('error', allMessages);
        const allWarnings = this.getAllMessagesOfType('warning', allMessages);
        allErrorMessages.map((message) => this.loggerService.logError(message));
        allWarnings.map((message) => this.loggerService.logWarning(message));
        return allErrorMessages.length === 0;
    }
    getAllMessagesOfType(type, results) {
        const allMessages = results.filter((x) => x.level === type).map((result) => result.messages);
        return allMessages.reduce((acc, val) => acc.concat(val), []);
    }
}
ConfigValidationService.ɵfac = function ConfigValidationService_Factory(t) { return new (t || ConfigValidationService)(i0.ɵɵinject(i1.LoggerService)); };
ConfigValidationService.ɵprov = i0.ɵɵdefineInjectable({ token: ConfigValidationService, factory: ConfigValidationService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(ConfigValidationService, [{
        type: Injectable
    }], function () { return [{ type: i1.LoggerService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLXZhbGlkYXRpb24uc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL2NvbmZpZy12YWxpZGF0aW9uL2NvbmZpZy12YWxpZGF0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUkzQyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sU0FBUyxDQUFDOzs7QUFHbkMsTUFBTSxPQUFPLHVCQUF1QjtJQUNsQyxZQUFvQixhQUE0QjtRQUE1QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtJQUFHLENBQUM7SUFFcEQsY0FBYyxDQUFDLFlBQWlDO1FBQzlDLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFFeEUsTUFBTSxXQUFXLEdBQUcsb0JBQW9CLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUU5RSxNQUFNLGdCQUFnQixHQUFHLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDekUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUN0RSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDeEUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUVyRSxPQUFPLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVPLG9CQUFvQixDQUFDLElBQVcsRUFBRSxPQUErQjtRQUN2RSxNQUFNLFdBQVcsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzdGLE9BQU8sV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDL0QsQ0FBQzs7OEZBbkJVLHVCQUF1QjsrREFBdkIsdUJBQXVCLFdBQXZCLHVCQUF1QjtrREFBdkIsdUJBQXVCO2NBRG5DLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IE9wZW5JZENvbmZpZ3VyYXRpb24gfSBmcm9tICcuLi9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IExldmVsLCBSdWxlVmFsaWRhdGlvblJlc3VsdCB9IGZyb20gJy4vcnVsZSc7XHJcbmltcG9ydCB7IGFsbFJ1bGVzIH0gZnJvbSAnLi9ydWxlcyc7XHJcblxyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBDb25maWdWYWxpZGF0aW9uU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlKSB7fVxyXG5cclxuICB2YWxpZGF0ZUNvbmZpZyhwYXNzZWRDb25maWc6IE9wZW5JZENvbmZpZ3VyYXRpb24pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IGFsbFZhbGlkYXRpb25SZXN1bHRzID0gYWxsUnVsZXMubWFwKChydWxlKSA9PiBydWxlKHBhc3NlZENvbmZpZykpO1xyXG5cclxuICAgIGNvbnN0IGFsbE1lc3NhZ2VzID0gYWxsVmFsaWRhdGlvblJlc3VsdHMuZmlsdGVyKCh4KSA9PiB4Lm1lc3NhZ2VzLmxlbmd0aCA+IDApO1xyXG5cclxuICAgIGNvbnN0IGFsbEVycm9yTWVzc2FnZXMgPSB0aGlzLmdldEFsbE1lc3NhZ2VzT2ZUeXBlKCdlcnJvcicsIGFsbE1lc3NhZ2VzKTtcclxuICAgIGNvbnN0IGFsbFdhcm5pbmdzID0gdGhpcy5nZXRBbGxNZXNzYWdlc09mVHlwZSgnd2FybmluZycsIGFsbE1lc3NhZ2VzKTtcclxuICAgIGFsbEVycm9yTWVzc2FnZXMubWFwKChtZXNzYWdlKSA9PiB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IobWVzc2FnZSkpO1xyXG4gICAgYWxsV2FybmluZ3MubWFwKChtZXNzYWdlKSA9PiB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZyhtZXNzYWdlKSk7XHJcblxyXG4gICAgcmV0dXJuIGFsbEVycm9yTWVzc2FnZXMubGVuZ3RoID09PSAwO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRBbGxNZXNzYWdlc09mVHlwZSh0eXBlOiBMZXZlbCwgcmVzdWx0czogUnVsZVZhbGlkYXRpb25SZXN1bHRbXSkge1xyXG4gICAgY29uc3QgYWxsTWVzc2FnZXMgPSByZXN1bHRzLmZpbHRlcigoeCkgPT4geC5sZXZlbCA9PT0gdHlwZSkubWFwKChyZXN1bHQpID0+IHJlc3VsdC5tZXNzYWdlcyk7XHJcbiAgICByZXR1cm4gYWxsTWVzc2FnZXMucmVkdWNlKChhY2MsIHZhbCkgPT4gYWNjLmNvbmNhdCh2YWwpLCBbXSk7XHJcbiAgfVxyXG59XHJcbiJdfQ==