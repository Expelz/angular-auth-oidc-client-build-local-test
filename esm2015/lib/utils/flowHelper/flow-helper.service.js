import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "../../config/config.provider";
export class FlowHelper {
    constructor(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    isCurrentFlowCodeFlow() {
        return this.currentFlowIs('code');
    }
    isCurrentFlowAnyImplicitFlow() {
        return this.isCurrentFlowImplicitFlowWithAccessToken() || this.isCurrentFlowImplicitFlowWithoutAccessToken();
    }
    isCurrentFlowCodeFlowWithRefreshTokens() {
        if (this.isCurrentFlowCodeFlow() && this.configurationProvider.openIDConfiguration.useRefreshToken) {
            return true;
        }
        return false;
    }
    isCurrentFlowImplicitFlowWithAccessToken() {
        return this.currentFlowIs('id_token token');
    }
    isCurrentFlowImplicitFlowWithoutAccessToken() {
        return this.currentFlowIs('id_token');
    }
    currentFlowIs(flowTypes) {
        const currentFlow = this.configurationProvider.openIDConfiguration.responseType;
        if (Array.isArray(flowTypes)) {
            return flowTypes.some((x) => currentFlow === x);
        }
        return currentFlow === flowTypes;
    }
}
FlowHelper.ɵfac = function FlowHelper_Factory(t) { return new (t || FlowHelper)(i0.ɵɵinject(i1.ConfigurationProvider)); };
FlowHelper.ɵprov = i0.ɵɵdefineInjectable({ token: FlowHelper, factory: FlowHelper.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(FlowHelper, [{
        type: Injectable
    }], function () { return [{ type: i1.ConfigurationProvider }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmxvdy1oZWxwZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8uLi9wcm9qZWN0cy9hbmd1bGFyLWF1dGgtb2lkYy1jbGllbnQvc3JjLyIsInNvdXJjZXMiOlsibGliL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7QUFJM0MsTUFBTSxPQUFPLFVBQVU7SUFDckIsWUFBb0IscUJBQTRDO1FBQTVDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7SUFBRyxDQUFDO0lBRXBFLHFCQUFxQjtRQUNuQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDRCQUE0QjtRQUMxQixPQUFPLElBQUksQ0FBQyx3Q0FBd0MsRUFBRSxJQUFJLElBQUksQ0FBQywyQ0FBMkMsRUFBRSxDQUFDO0lBQy9HLENBQUM7SUFFRCxzQ0FBc0M7UUFDcEMsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsSUFBSSxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsZUFBZSxFQUFFO1lBQ2xHLE9BQU8sSUFBSSxDQUFDO1NBQ2I7UUFFRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUM7SUFFRCx3Q0FBd0M7UUFDdEMsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELDJDQUEyQztRQUN6QyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELGFBQWEsQ0FBQyxTQUE0QjtRQUN4QyxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsWUFBWSxDQUFDO1FBRWhGLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsRUFBRTtZQUM1QixPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLFdBQVcsS0FBSyxDQUFDLENBQUMsQ0FBQztTQUNqRDtRQUVELE9BQU8sV0FBVyxLQUFLLFNBQVMsQ0FBQztJQUNuQyxDQUFDOztvRUFuQ1UsVUFBVTtrREFBVixVQUFVLFdBQVYsVUFBVTtrREFBVixVQUFVO2NBRHRCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgRmxvd0hlbHBlciB7XHJcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcikge31cclxuXHJcbiAgaXNDdXJyZW50Rmxvd0NvZGVGbG93KCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEZsb3dJcygnY29kZScpO1xyXG4gIH1cclxuXHJcbiAgaXNDdXJyZW50Rmxvd0FueUltcGxpY2l0RmxvdygpIHtcclxuICAgIHJldHVybiB0aGlzLmlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRoQWNjZXNzVG9rZW4oKSB8fCB0aGlzLmlzQ3VycmVudEZsb3dJbXBsaWNpdEZsb3dXaXRob3V0QWNjZXNzVG9rZW4oKTtcclxuICB9XHJcblxyXG4gIGlzQ3VycmVudEZsb3dDb2RlRmxvd1dpdGhSZWZyZXNoVG9rZW5zKCkge1xyXG4gICAgaWYgKHRoaXMuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCkgJiYgdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbi51c2VSZWZyZXNoVG9rZW4pIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgaXNDdXJyZW50Rmxvd0ltcGxpY2l0Rmxvd1dpdGhBY2Nlc3NUb2tlbigpIHtcclxuICAgIHJldHVybiB0aGlzLmN1cnJlbnRGbG93SXMoJ2lkX3Rva2VuIHRva2VuJyk7XHJcbiAgfVxyXG5cclxuICBpc0N1cnJlbnRGbG93SW1wbGljaXRGbG93V2l0aG91dEFjY2Vzc1Rva2VuKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuY3VycmVudEZsb3dJcygnaWRfdG9rZW4nKTtcclxuICB9XHJcblxyXG4gIGN1cnJlbnRGbG93SXMoZmxvd1R5cGVzOiBzdHJpbmdbXSB8IHN0cmluZykge1xyXG4gICAgY29uc3QgY3VycmVudEZsb3cgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uLnJlc3BvbnNlVHlwZTtcclxuXHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShmbG93VHlwZXMpKSB7XHJcbiAgICAgIHJldHVybiBmbG93VHlwZXMuc29tZSgoeCkgPT4gY3VycmVudEZsb3cgPT09IHgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjdXJyZW50RmxvdyA9PT0gZmxvd1R5cGVzO1xyXG4gIH1cclxufVxyXG4iXX0=