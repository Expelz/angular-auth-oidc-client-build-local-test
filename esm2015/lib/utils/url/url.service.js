import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { oneLineTrim } from 'common-tags';
import { UriEncoder } from './uri-encoder';
import * as i0 from "@angular/core";
import * as i1 from "../../config/config.provider";
import * as i2 from "../../logging/logger.service";
import * as i3 from "../../flows/flows-data.service";
import * as i4 from "../flowHelper/flow-helper.service";
import * as i5 from "../../validation/token-validation.service";
import * as i6 from "../../storage/storage-persistance.service";
const CALLBACK_PARAMS_TO_CHECK = ['code', 'state', 'token', 'id_token'];
export class UrlService {
    constructor(configurationProvider, loggerService, flowsDataService, flowHelper, tokenValidationService, storagePersistanceService) {
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
        this.flowsDataService = flowsDataService;
        this.flowHelper = flowHelper;
        this.tokenValidationService = tokenValidationService;
        this.storagePersistanceService = storagePersistanceService;
    }
    getUrlParameter(urlToCheck, name) {
        if (!urlToCheck) {
            return '';
        }
        if (!name) {
            return '';
        }
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(urlToCheck);
        return results === null ? '' : decodeURIComponent(results[1]);
    }
    isCallbackFromSts(currentUrl) {
        const anyParameterIsGiven = CALLBACK_PARAMS_TO_CHECK.some((x) => !!this.getUrlParameter(currentUrl, x));
        return anyParameterIsGiven;
    }
    getRefreshSessionSilentRenewUrl(customParams, authStateLauchedType) {
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            return this.createUrlCodeFlowWithSilentRenew(customParams, authStateLauchedType);
        }
        return this.createUrlImplicitFlowWithSilentRenew(customParams) || '';
    }
    getAuthorizeUrl(customParams) {
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            return this.createUrlCodeFlowAuthorize(customParams);
        }
        return this.createUrlImplicitFlowAuthorize(customParams) || '';
    }
    createEndSessionUrl(idTokenHint) {
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        const endSessionEndpoint = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.endSessionEndpoint;
        if (!endSessionEndpoint) {
            return null;
        }
        const urlParts = endSessionEndpoint.split('?');
        const authorizationEndsessionUrl = urlParts[0];
        let params = new HttpParams({
            fromString: urlParts[1],
            encoder: new UriEncoder(),
        });
        params = params.set('id_token_hint', idTokenHint);
        const postLogoutRedirectUri = this.getPostLogoutRedirectUrl();
        if (postLogoutRedirectUri) {
            params = params.append('post_logout_redirect_uri', postLogoutRedirectUri);
        }
        return `${authorizationEndsessionUrl}?${params}`;
    }
    createRevocationEndpointBodyAccessToken(token) {
        const clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        return `client_id=${clientId}&token=${token}&token_type_hint=access_token`;
    }
    createRevocationEndpointBodyRefreshToken(token) {
        const clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        return `client_id=${clientId}&token=${token}&token_type_hint=refresh_token`;
    }
    getRevocationEndpointUrl() {
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        const revocationEndpoint = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.revocationEndpoint;
        if (!revocationEndpoint) {
            return null;
        }
        const urlParts = revocationEndpoint.split('?');
        const revocationEndpointUrl = urlParts[0];
        return revocationEndpointUrl;
    }
    createBodyForCodeFlowCodeRequest(code) {
        const codeVerifier = this.flowsDataService.getCodeVerifier();
        if (!codeVerifier) {
            this.loggerService.logError(`CodeVerifier is not set `, codeVerifier);
            return null;
        }
        const clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        const dataForBody = oneLineTrim `grant_type=authorization_code
            &client_id=${clientId}
            &code_verifier=${codeVerifier}
            &code=${code}`;
        const silentRenewUrl = this.getSilentRenewUrl();
        if (this.flowsDataService.isSilentRenewRunning() && silentRenewUrl) {
            return oneLineTrim `${dataForBody}&redirect_uri=${silentRenewUrl}`;
        }
        const redirectUrl = this.getRedirectUrl();
        if (!redirectUrl) {
            return null;
        }
        return oneLineTrim `${dataForBody}&redirect_uri=${redirectUrl}`;
    }
    createBodyForCodeFlowRefreshTokensRequest(refreshtoken, customParams) {
        const clientId = this.getClientId();
        if (!clientId) {
            return null;
        }
        let dataForBody = oneLineTrim `grant_type=refresh_token
            &client_id=${clientId}
            &refresh_token=${refreshtoken}`;
        if (customParams) {
            const customParamsToAdd = Object.assign({}, (customParams || {}));
            for (const [key, value] of Object.entries(customParamsToAdd)) {
                dataForBody = dataForBody.concat(`&${key}=${value.toString()}`);
            }
        }
        return dataForBody;
    }
    createAuthorizeUrl(codeChallenge, redirectUrl, nonce, state, prompt, customRequestParams) {
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        const authorizationEndpoint = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.authorizationEndpoint;
        if (!authorizationEndpoint) {
            this.loggerService.logError(`Can not create an authorize url when authorizationEndpoint is '${authorizationEndpoint}'`);
            return null;
        }
        const { clientId, responseType, scope, hdParam, customParams } = this.configurationProvider.openIDConfiguration;
        if (!clientId) {
            this.loggerService.logError(`createAuthorizeUrl could not add clientId because it was: `, clientId);
            return null;
        }
        if (!responseType) {
            this.loggerService.logError(`createAuthorizeUrl could not add responseType because it was: `, responseType);
            return null;
        }
        if (!scope) {
            this.loggerService.logError(`createAuthorizeUrl could not add scope because it was: `, scope);
            return null;
        }
        const urlParts = authorizationEndpoint.split('?');
        const authorizationUrl = urlParts[0];
        let params = new HttpParams({
            fromString: urlParts[1],
            encoder: new UriEncoder(),
        });
        params = params.set('client_id', clientId);
        params = params.append('redirect_uri', redirectUrl);
        params = params.append('response_type', responseType);
        params = params.append('scope', scope);
        params = params.append('nonce', nonce);
        params = params.append('state', state);
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            params = params.append('code_challenge', codeChallenge);
            params = params.append('code_challenge_method', 'S256');
        }
        if (prompt) {
            params = params.append('prompt', prompt);
        }
        if (hdParam) {
            params = params.append('hd', hdParam);
        }
        if (customParams || customRequestParams) {
            const customParamsToAdd = Object.assign(Object.assign({}, (customParams || {})), (customRequestParams || {}));
            for (const [key, value] of Object.entries(customParamsToAdd)) {
                params = params.append(key, value.toString());
            }
        }
        return `${authorizationUrl}?${params}`;
    }
    createUrlImplicitFlowWithSilentRenew(customParams) {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl('silent-renew-code');
        const nonce = this.flowsDataService.createNonce();
        const silentRenewUrl = this.getSilentRenewUrl();
        if (!silentRenewUrl) {
            return null;
        }
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ', state);
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        if (authWellKnownEndPoints) {
            return this.createAuthorizeUrl('', silentRenewUrl, nonce, state, 'none', customParams);
        }
        this.loggerService.logError('authWellKnownEndpoints is undefined');
        return null;
    }
    createUrlCodeFlowWithSilentRenew(customParams, authStateLauchedType) {
        const state = this.flowsDataService.createAuthStateControl(authStateLauchedType);
        const nonce = this.flowsDataService.createNonce();
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ' + state);
        // code_challenge with "S256"
        const codeVerifier = this.flowsDataService.createCodeVerifier();
        const codeChallenge = this.tokenValidationService.generateCodeChallenge(codeVerifier);
        const silentRenewUrl = this.getSilentRenewUrl();
        if (!silentRenewUrl) {
            return null;
        }
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        if (authWellKnownEndPoints) {
            return this.createAuthorizeUrl(codeChallenge, silentRenewUrl, nonce, state, 'none', customParams);
        }
        this.loggerService.logWarning('authWellKnownEndpoints is undefined');
        return null;
    }
    createUrlImplicitFlowAuthorize(customParams) {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl('login');
        const nonce = this.flowsDataService.createNonce();
        this.loggerService.logDebug('Authorize created. adding myautostate: ' + state);
        const redirectUrl = this.getRedirectUrl();
        if (!redirectUrl) {
            return null;
        }
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        if (authWellKnownEndPoints) {
            return this.createAuthorizeUrl('', redirectUrl, nonce, state, null, customParams);
        }
        this.loggerService.logError('authWellKnownEndpoints is undefined');
        return null;
    }
    createUrlCodeFlowAuthorize(customParams) {
        const state = this.flowsDataService.getExistingOrCreateAuthStateControl('login');
        const nonce = this.flowsDataService.createNonce();
        this.loggerService.logDebug('Authorize created. adding myautostate: ' + state);
        const redirectUrl = this.getRedirectUrl();
        if (!redirectUrl) {
            return null;
        }
        // code_challenge with "S256"
        const codeVerifier = this.flowsDataService.createCodeVerifier();
        const codeChallenge = this.tokenValidationService.generateCodeChallenge(codeVerifier);
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        if (authWellKnownEndPoints) {
            return this.createAuthorizeUrl(codeChallenge, redirectUrl, nonce, state, null, customParams);
        }
        this.loggerService.logError('authWellKnownEndpoints is undefined');
        return null;
    }
    getRedirectUrl() {
        var _a;
        const redirectUrl = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.redirectUrl;
        if (!redirectUrl) {
            this.loggerService.logError(`could not get redirectUrl, was: `, redirectUrl);
            return null;
        }
        return redirectUrl;
    }
    getSilentRenewUrl() {
        var _a;
        const silentRenewUrl = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.silentRenewUrl;
        if (!silentRenewUrl) {
            this.loggerService.logError(`could not get silentRenewUrl, was: `, silentRenewUrl);
            return null;
        }
        return silentRenewUrl;
    }
    getPostLogoutRedirectUrl() {
        var _a;
        const postLogoutRedirectUri = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.postLogoutRedirectUri;
        if (!postLogoutRedirectUri) {
            this.loggerService.logError(`could not get postLogoutRedirectUri, was: `, postLogoutRedirectUri);
            return null;
        }
        return postLogoutRedirectUri;
    }
    getClientId() {
        var _a;
        const clientId = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId;
        if (!clientId) {
            this.loggerService.logError(`could not get clientId, was: `, clientId);
            return null;
        }
        return clientId;
    }
}
UrlService.ɵfac = function UrlService_Factory(t) { return new (t || UrlService)(i0.ɵɵinject(i1.ConfigurationProvider), i0.ɵɵinject(i2.LoggerService), i0.ɵɵinject(i3.FlowsDataService), i0.ɵɵinject(i4.FlowHelper), i0.ɵɵinject(i5.TokenValidationService), i0.ɵɵinject(i6.StoragePersistanceService)); };
UrlService.ɵprov = i0.ɵɵdefineInjectable({ token: UrlService, factory: UrlService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(UrlService, [{
        type: Injectable
    }], function () { return [{ type: i1.ConfigurationProvider }, { type: i2.LoggerService }, { type: i3.FlowsDataService }, { type: i4.FlowHelper }, { type: i5.TokenValidationService }, { type: i6.StoragePersistanceService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi91dGlscy91cmwvdXJsLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQU8xQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7Ozs7OztBQUUzQyxNQUFNLHdCQUF3QixHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFeEUsTUFBTSxPQUFPLFVBQVU7SUFDckIsWUFDbUIscUJBQTRDLEVBQzVDLGFBQTRCLEVBQzVCLGdCQUFrQyxFQUNsQyxVQUFzQixFQUMvQixzQkFBOEMsRUFDOUMseUJBQW9EO1FBTDNDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQy9CLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7UUFDOUMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtJQUMzRCxDQUFDO0lBRUosZUFBZSxDQUFDLFVBQWUsRUFBRSxJQUFTO1FBQ3hDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDZixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FB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QUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsK0JBQStCLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDdkUsT0FBTyxJQUFJLENBQUM7U0FDYjtRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7O29FQWxYVSxVQUFVO2tEQUFWLFVBQVUsV0FBVixVQUFVO2tEQUFWLFVBQVU7Y0FEdEIsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEh0dHBQYXJhbXMgfSBmcm9tICdAYW5ndWxhci9jb21tb24vaHR0cCc7XHJcbmltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcclxuaW1wb3J0IHsgb25lTGluZVRyaW0gfSBmcm9tICdjb21tb24tdGFncyc7XHJcbmltcG9ydCB7IENvbmZpZ3VyYXRpb25Qcm92aWRlciB9IGZyb20gJy4uLy4uL2NvbmZpZy9jb25maWcucHJvdmlkZXInO1xyXG5pbXBvcnQgeyBBdXRoU3RhdGVMYXVjaGVkVHlwZSwgRmxvd3NEYXRhU2VydmljZSB9IGZyb20gJy4uLy4uL2Zsb3dzL2Zsb3dzLWRhdGEuc2VydmljZSc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi8uLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZSB9IGZyb20gJy4uLy4uL3N0b3JhZ2Uvc3RvcmFnZS1wZXJzaXN0YW5jZS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVG9rZW5WYWxpZGF0aW9uU2VydmljZSB9IGZyb20gJy4uLy4uL3ZhbGlkYXRpb24vdG9rZW4tdmFsaWRhdGlvbi5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFVyaUVuY29kZXIgfSBmcm9tICcuL3VyaS1lbmNvZGVyJztcclxuXHJcbmNvbnN0IENBTExCQUNLX1BBUkFNU19UT19DSEVDSyA9IFsnY29kZScsICdzdGF0ZScsICd0b2tlbicsICdpZF90b2tlbiddO1xyXG5ASW5qZWN0YWJsZSgpXHJcbmV4cG9ydCBjbGFzcyBVcmxTZXJ2aWNlIHtcclxuICBjb25zdHJ1Y3RvcihcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgY29uZmlndXJhdGlvblByb3ZpZGVyOiBDb25maWd1cmF0aW9uUHJvdmlkZXIsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGxvZ2dlclNlcnZpY2U6IExvZ2dlclNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZsb3dzRGF0YVNlcnZpY2U6IEZsb3dzRGF0YVNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGZsb3dIZWxwZXI6IEZsb3dIZWxwZXIsXHJcbiAgICBwcml2YXRlIHRva2VuVmFsaWRhdGlvblNlcnZpY2U6IFRva2VuVmFsaWRhdGlvblNlcnZpY2UsXHJcbiAgICBwcml2YXRlIHN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2U6IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2VcclxuICApIHt9XHJcblxyXG4gIGdldFVybFBhcmFtZXRlcih1cmxUb0NoZWNrOiBhbnksIG5hbWU6IGFueSk6IHN0cmluZyB7XHJcbiAgICBpZiAoIXVybFRvQ2hlY2spIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghbmFtZSkge1xyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvW1xcW10vLCAnXFxcXFsnKS5yZXBsYWNlKC9bXFxdXS8sICdcXFxcXScpO1xyXG4gICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKCdbXFxcXD8mXScgKyBuYW1lICsgJz0oW14mI10qKScpO1xyXG4gICAgY29uc3QgcmVzdWx0cyA9IHJlZ2V4LmV4ZWModXJsVG9DaGVjayk7XHJcbiAgICByZXR1cm4gcmVzdWx0cyA9PT0gbnVsbCA/ICcnIDogZGVjb2RlVVJJQ29tcG9uZW50KHJlc3VsdHNbMV0pO1xyXG4gIH1cclxuXHJcbiAgaXNDYWxsYmFja0Zyb21TdHMoY3VycmVudFVybDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBhbnlQYXJhbWV0ZXJJc0dpdmVuID0gQ0FMTEJBQ0tfUEFSQU1TX1RPX0NIRUNLLnNvbWUoKHgpID0+ICEhdGhpcy5nZXRVcmxQYXJhbWV0ZXIoY3VycmVudFVybCwgeCkpO1xyXG4gICAgcmV0dXJuIGFueVBhcmFtZXRlcklzR2l2ZW47XHJcbiAgfVxyXG5cclxuICBnZXRSZWZyZXNoU2Vzc2lvblNpbGVudFJlbmV3VXJsKFxyXG4gICAgY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0sXHJcbiAgICBhdXRoU3RhdGVMYXVjaGVkVHlwZT86IEF1dGhTdGF0ZUxhdWNoZWRUeXBlXHJcbiAgKTogc3RyaW5nIHtcclxuICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCkpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlVXJsQ29kZUZsb3dXaXRoU2lsZW50UmVuZXcoY3VzdG9tUGFyYW1zLCBhdXRoU3RhdGVMYXVjaGVkVHlwZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlVXJsSW1wbGljaXRGbG93V2l0aFNpbGVudFJlbmV3KGN1c3RvbVBhcmFtcykgfHwgJyc7XHJcbiAgfVxyXG5cclxuICBnZXRBdXRob3JpemVVcmwoY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxDb2RlRmxvd0F1dGhvcml6ZShjdXN0b21QYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLmNyZWF0ZVVybEltcGxpY2l0Rmxvd0F1dGhvcml6ZShjdXN0b21QYXJhbXMpIHx8ICcnO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlRW5kU2Vzc2lvblVybChpZFRva2VuSGludDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGNvbnN0IGVuZFNlc3Npb25FbmRwb2ludCA9IGF1dGhXZWxsS25vd25FbmRQb2ludHM/LmVuZFNlc3Npb25FbmRwb2ludDtcclxuXHJcbiAgICBpZiAoIWVuZFNlc3Npb25FbmRwb2ludCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB1cmxQYXJ0cyA9IGVuZFNlc3Npb25FbmRwb2ludC5zcGxpdCgnPycpO1xyXG5cclxuICAgIGNvbnN0IGF1dGhvcml6YXRpb25FbmRzZXNzaW9uVXJsID0gdXJsUGFydHNbMF07XHJcblxyXG4gICAgbGV0IHBhcmFtcyA9IG5ldyBIdHRwUGFyYW1zKHtcclxuICAgICAgZnJvbVN0cmluZzogdXJsUGFydHNbMV0sXHJcbiAgICAgIGVuY29kZXI6IG5ldyBVcmlFbmNvZGVyKCksXHJcbiAgICB9KTtcclxuICAgIHBhcmFtcyA9IHBhcmFtcy5zZXQoJ2lkX3Rva2VuX2hpbnQnLCBpZFRva2VuSGludCk7XHJcblxyXG4gICAgY29uc3QgcG9zdExvZ291dFJlZGlyZWN0VXJpID0gdGhpcy5nZXRQb3N0TG9nb3V0UmVkaXJlY3RVcmwoKTtcclxuXHJcbiAgICBpZiAocG9zdExvZ291dFJlZGlyZWN0VXJpKSB7XHJcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3Bvc3RfbG9nb3V0X3JlZGlyZWN0X3VyaScsIHBvc3RMb2dvdXRSZWRpcmVjdFVyaSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGAke2F1dGhvcml6YXRpb25FbmRzZXNzaW9uVXJsfT8ke3BhcmFtc31gO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlUmV2b2NhdGlvbkVuZHBvaW50Qm9keUFjY2Vzc1Rva2VuKHRva2VuOiBhbnkpIHtcclxuICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZCgpO1xyXG5cclxuICAgIGlmICghY2xpZW50SWQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGBjbGllbnRfaWQ9JHtjbGllbnRJZH0mdG9rZW49JHt0b2tlbn0mdG9rZW5fdHlwZV9oaW50PWFjY2Vzc190b2tlbmA7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVSZXZvY2F0aW9uRW5kcG9pbnRCb2R5UmVmcmVzaFRva2VuKHRva2VuOiBhbnkpIHtcclxuICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZCgpO1xyXG5cclxuICAgIGlmICghY2xpZW50SWQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGBjbGllbnRfaWQ9JHtjbGllbnRJZH0mdG9rZW49JHt0b2tlbn0mdG9rZW5fdHlwZV9oaW50PXJlZnJlc2hfdG9rZW5gO1xyXG4gIH1cclxuXHJcbiAgZ2V0UmV2b2NhdGlvbkVuZHBvaW50VXJsKCkge1xyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBjb25zdCByZXZvY2F0aW9uRW5kcG9pbnQgPSBhdXRoV2VsbEtub3duRW5kUG9pbnRzPy5yZXZvY2F0aW9uRW5kcG9pbnQ7XHJcblxyXG4gICAgaWYgKCFyZXZvY2F0aW9uRW5kcG9pbnQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXJsUGFydHMgPSByZXZvY2F0aW9uRW5kcG9pbnQuc3BsaXQoJz8nKTtcclxuXHJcbiAgICBjb25zdCByZXZvY2F0aW9uRW5kcG9pbnRVcmwgPSB1cmxQYXJ0c1swXTtcclxuICAgIHJldHVybiByZXZvY2F0aW9uRW5kcG9pbnRVcmw7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVCb2R5Rm9yQ29kZUZsb3dDb2RlUmVxdWVzdChjb2RlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldENvZGVWZXJpZmllcigpO1xyXG4gICAgaWYgKCFjb2RlVmVyaWZpZXIpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBDb2RlVmVyaWZpZXIgaXMgbm90IHNldCBgLCBjb2RlVmVyaWZpZXIpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjbGllbnRJZCA9IHRoaXMuZ2V0Q2xpZW50SWQoKTtcclxuXHJcbiAgICBpZiAoIWNsaWVudElkKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRhdGFGb3JCb2R5ID0gb25lTGluZVRyaW1gZ3JhbnRfdHlwZT1hdXRob3JpemF0aW9uX2NvZGVcclxuICAgICAgICAgICAgJmNsaWVudF9pZD0ke2NsaWVudElkfVxyXG4gICAgICAgICAgICAmY29kZV92ZXJpZmllcj0ke2NvZGVWZXJpZmllcn1cclxuICAgICAgICAgICAgJmNvZGU9JHtjb2RlfWA7XHJcblxyXG4gICAgY29uc3Qgc2lsZW50UmVuZXdVcmwgPSB0aGlzLmdldFNpbGVudFJlbmV3VXJsKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuZmxvd3NEYXRhU2VydmljZS5pc1NpbGVudFJlbmV3UnVubmluZygpICYmIHNpbGVudFJlbmV3VXJsKSB7XHJcbiAgICAgIHJldHVybiBvbmVMaW5lVHJpbWAke2RhdGFGb3JCb2R5fSZyZWRpcmVjdF91cmk9JHtzaWxlbnRSZW5ld1VybH1gO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xyXG5cclxuICAgIGlmICghcmVkaXJlY3RVcmwpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9uZUxpbmVUcmltYCR7ZGF0YUZvckJvZHl9JnJlZGlyZWN0X3VyaT0ke3JlZGlyZWN0VXJsfWA7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVCb2R5Rm9yQ29kZUZsb3dSZWZyZXNoVG9rZW5zUmVxdWVzdChyZWZyZXNodG9rZW46IHN0cmluZywgY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgY29uc3QgY2xpZW50SWQgPSB0aGlzLmdldENsaWVudElkKCk7XHJcblxyXG4gICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGF0YUZvckJvZHkgPSBvbmVMaW5lVHJpbWBncmFudF90eXBlPXJlZnJlc2hfdG9rZW5cclxuICAgICAgICAgICAgJmNsaWVudF9pZD0ke2NsaWVudElkfVxyXG4gICAgICAgICAgICAmcmVmcmVzaF90b2tlbj0ke3JlZnJlc2h0b2tlbn1gO1xyXG5cclxuICAgIGlmIChjdXN0b21QYXJhbXMpIHtcclxuICAgICAgY29uc3QgY3VzdG9tUGFyYW1zVG9BZGQgPSB7IC4uLihjdXN0b21QYXJhbXMgfHwge30pIH07XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjdXN0b21QYXJhbXNUb0FkZCkpIHtcclxuICAgICAgICBkYXRhRm9yQm9keSA9IGRhdGFGb3JCb2R5LmNvbmNhdChgJiR7a2V5fT0ke3ZhbHVlLnRvU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGF0YUZvckJvZHk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZUF1dGhvcml6ZVVybChcclxuICAgIGNvZGVDaGFsbGVuZ2U6IHN0cmluZyxcclxuICAgIHJlZGlyZWN0VXJsOiBzdHJpbmcsXHJcbiAgICBub25jZTogc3RyaW5nLFxyXG4gICAgc3RhdGU6IHN0cmluZyxcclxuICAgIHByb21wdD86IHN0cmluZyxcclxuICAgIGN1c3RvbVJlcXVlc3RQYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfVxyXG4gICk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGNvbnN0IGF1dGhvcml6YXRpb25FbmRwb2ludCA9IGF1dGhXZWxsS25vd25FbmRQb2ludHM/LmF1dGhvcml6YXRpb25FbmRwb2ludDtcclxuXHJcbiAgICBpZiAoIWF1dGhvcml6YXRpb25FbmRwb2ludCkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYENhbiBub3QgY3JlYXRlIGFuIGF1dGhvcml6ZSB1cmwgd2hlbiBhdXRob3JpemF0aW9uRW5kcG9pbnQgaXMgJyR7YXV0aG9yaXphdGlvbkVuZHBvaW50fSdgKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyBjbGllbnRJZCwgcmVzcG9uc2VUeXBlLCBzY29wZSwgaGRQYXJhbSwgY3VzdG9tUGFyYW1zIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uO1xyXG5cclxuICAgIGlmICghY2xpZW50SWQpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjcmVhdGVBdXRob3JpemVVcmwgY291bGQgbm90IGFkZCBjbGllbnRJZCBiZWNhdXNlIGl0IHdhczogYCwgY2xpZW50SWQpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlVHlwZSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNyZWF0ZUF1dGhvcml6ZVVybCBjb3VsZCBub3QgYWRkIHJlc3BvbnNlVHlwZSBiZWNhdXNlIGl0IHdhczogYCwgcmVzcG9uc2VUeXBlKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzY29wZSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNyZWF0ZUF1dGhvcml6ZVVybCBjb3VsZCBub3QgYWRkIHNjb3BlIGJlY2F1c2UgaXQgd2FzOiBgLCBzY29wZSk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVybFBhcnRzID0gYXV0aG9yaXphdGlvbkVuZHBvaW50LnNwbGl0KCc/Jyk7XHJcbiAgICBjb25zdCBhdXRob3JpemF0aW9uVXJsID0gdXJsUGFydHNbMF07XHJcblxyXG4gICAgbGV0IHBhcmFtcyA9IG5ldyBIdHRwUGFyYW1zKHtcclxuICAgICAgZnJvbVN0cmluZzogdXJsUGFydHNbMV0sXHJcbiAgICAgIGVuY29kZXI6IG5ldyBVcmlFbmNvZGVyKCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBwYXJhbXMgPSBwYXJhbXMuc2V0KCdjbGllbnRfaWQnLCBjbGllbnRJZCk7XHJcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdyZWRpcmVjdF91cmknLCByZWRpcmVjdFVybCk7XHJcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdyZXNwb25zZV90eXBlJywgcmVzcG9uc2VUeXBlKTtcclxuICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3Njb3BlJywgc2NvcGUpO1xyXG4gICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgnbm9uY2UnLCBub25jZSk7XHJcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdzdGF0ZScsIHN0YXRlKTtcclxuXHJcbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpKSB7XHJcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2NvZGVfY2hhbGxlbmdlJywgY29kZUNoYWxsZW5nZSk7XHJcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2NvZGVfY2hhbGxlbmdlX21ldGhvZCcsICdTMjU2Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHByb21wdCkge1xyXG4gICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdwcm9tcHQnLCBwcm9tcHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChoZFBhcmFtKSB7XHJcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2hkJywgaGRQYXJhbSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGN1c3RvbVBhcmFtcyB8fCBjdXN0b21SZXF1ZXN0UGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IGN1c3RvbVBhcmFtc1RvQWRkID0geyAuLi4oY3VzdG9tUGFyYW1zIHx8IHt9KSwgLi4uKGN1c3RvbVJlcXVlc3RQYXJhbXMgfHwge30pIH07XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjdXN0b21QYXJhbXNUb0FkZCkpIHtcclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKGtleSwgdmFsdWUudG9TdHJpbmcoKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYCR7YXV0aG9yaXphdGlvblVybH0/JHtwYXJhbXN9YDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlVXJsSW1wbGljaXRGbG93V2l0aFNpbGVudFJlbmV3KGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEV4aXN0aW5nT3JDcmVhdGVBdXRoU3RhdGVDb250cm9sKCdzaWxlbnQtcmVuZXctY29kZScpO1xyXG4gICAgY29uc3Qgbm9uY2UgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlTm9uY2UoKTtcclxuXHJcbiAgICBjb25zdCBzaWxlbnRSZW5ld1VybCA9IHRoaXMuZ2V0U2lsZW50UmVuZXdVcmwoKTtcclxuXHJcbiAgICBpZiAoIXNpbGVudFJlbmV3VXJsKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnUmVmcmVzaFNlc3Npb24gY3JlYXRlZC4gYWRkaW5nIG15YXV0b3N0YXRlOiAnLCBzdGF0ZSk7XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBpZiAoYXV0aFdlbGxLbm93bkVuZFBvaW50cykge1xyXG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdXRob3JpemVVcmwoJycsIHNpbGVudFJlbmV3VXJsLCBub25jZSwgc3RhdGUsICdub25lJywgY3VzdG9tUGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlVXJsQ29kZUZsb3dXaXRoU2lsZW50UmVuZXcoXHJcbiAgICBjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSxcclxuICAgIGF1dGhTdGF0ZUxhdWNoZWRUeXBlPzogQXV0aFN0YXRlTGF1Y2hlZFR5cGVcclxuICApOiBzdHJpbmcge1xyXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlQXV0aFN0YXRlQ29udHJvbChhdXRoU3RhdGVMYXVjaGVkVHlwZSk7XHJcbiAgICBjb25zdCBub25jZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVOb25jZSgpO1xyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnUmVmcmVzaFNlc3Npb24gY3JlYXRlZC4gYWRkaW5nIG15YXV0b3N0YXRlOiAnICsgc3RhdGUpO1xyXG5cclxuICAgIC8vIGNvZGVfY2hhbGxlbmdlIHdpdGggXCJTMjU2XCJcclxuICAgIGNvbnN0IGNvZGVWZXJpZmllciA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVDb2RlVmVyaWZpZXIoKTtcclxuICAgIGNvbnN0IGNvZGVDaGFsbGVuZ2UgPSB0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UuZ2VuZXJhdGVDb2RlQ2hhbGxlbmdlKGNvZGVWZXJpZmllcik7XHJcblxyXG4gICAgY29uc3Qgc2lsZW50UmVuZXdVcmwgPSB0aGlzLmdldFNpbGVudFJlbmV3VXJsKCk7XHJcblxyXG4gICAgaWYgKCFzaWxlbnRSZW5ld1VybCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGlmIChhdXRoV2VsbEtub3duRW5kUG9pbnRzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUF1dGhvcml6ZVVybChjb2RlQ2hhbGxlbmdlLCBzaWxlbnRSZW5ld1VybCwgbm9uY2UsIHN0YXRlLCAnbm9uZScsIGN1c3RvbVBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlVXJsSW1wbGljaXRGbG93QXV0aG9yaXplKGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEV4aXN0aW5nT3JDcmVhdGVBdXRoU3RhdGVDb250cm9sKCdsb2dpbicpO1xyXG4gICAgY29uc3Qgbm9uY2UgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlTm9uY2UoKTtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQXV0aG9yaXplIGNyZWF0ZWQuIGFkZGluZyBteWF1dG9zdGF0ZTogJyArIHN0YXRlKTtcclxuXHJcbiAgICBjb25zdCByZWRpcmVjdFVybCA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcclxuXHJcbiAgICBpZiAoIXJlZGlyZWN0VXJsKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG4gICAgaWYgKGF1dGhXZWxsS25vd25FbmRQb2ludHMpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQXV0aG9yaXplVXJsKCcnLCByZWRpcmVjdFVybCwgbm9uY2UsIHN0YXRlLCBudWxsLCBjdXN0b21QYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVVcmxDb2RlRmxvd0F1dGhvcml6ZShjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgnbG9naW4nKTtcclxuICAgIGNvbnN0IG5vbmNlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZU5vbmNlKCk7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0F1dGhvcml6ZSBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcgKyBzdGF0ZSk7XHJcblxyXG4gICAgY29uc3QgcmVkaXJlY3RVcmwgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XHJcblxyXG4gICAgaWYgKCFyZWRpcmVjdFVybCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjb2RlX2NoYWxsZW5nZSB3aXRoIFwiUzI1NlwiXHJcbiAgICBjb25zdCBjb2RlVmVyaWZpZXIgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlQ29kZVZlcmlmaWVyKCk7XHJcbiAgICBjb25zdCBjb2RlQ2hhbGxlbmdlID0gdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLmdlbmVyYXRlQ29kZUNoYWxsZW5nZShjb2RlVmVyaWZpZXIpO1xyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG4gICAgaWYgKGF1dGhXZWxsS25vd25FbmRQb2ludHMpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQXV0aG9yaXplVXJsKGNvZGVDaGFsbGVuZ2UsIHJlZGlyZWN0VXJsLCBub25jZSwgc3RhdGUsIG51bGwsIGN1c3RvbVBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFJlZGlyZWN0VXJsKCkge1xyXG4gICAgY29uc3QgcmVkaXJlY3RVcmwgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uPy5yZWRpcmVjdFVybDtcclxuXHJcbiAgICBpZiAoIXJlZGlyZWN0VXJsKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgY291bGQgbm90IGdldCByZWRpcmVjdFVybCwgd2FzOiBgLCByZWRpcmVjdFVybCk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByZWRpcmVjdFVybDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0U2lsZW50UmVuZXdVcmwoKSB7XHJcbiAgICBjb25zdCBzaWxlbnRSZW5ld1VybCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LnNpbGVudFJlbmV3VXJsO1xyXG5cclxuICAgIGlmICghc2lsZW50UmVuZXdVcmwpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjb3VsZCBub3QgZ2V0IHNpbGVudFJlbmV3VXJsLCB3YXM6IGAsIHNpbGVudFJlbmV3VXJsKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHNpbGVudFJlbmV3VXJsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRQb3N0TG9nb3V0UmVkaXJlY3RVcmwoKSB7XHJcbiAgICBjb25zdCBwb3N0TG9nb3V0UmVkaXJlY3RVcmkgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uPy5wb3N0TG9nb3V0UmVkaXJlY3RVcmk7XHJcbiAgICBpZiAoIXBvc3RMb2dvdXRSZWRpcmVjdFVyaSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNvdWxkIG5vdCBnZXQgcG9zdExvZ291dFJlZGlyZWN0VXJpLCB3YXM6IGAsIHBvc3RMb2dvdXRSZWRpcmVjdFVyaSk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBwb3N0TG9nb3V0UmVkaXJlY3RVcmk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldENsaWVudElkKCkge1xyXG4gICAgY29uc3QgY2xpZW50SWQgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uPy5jbGllbnRJZDtcclxuICAgIGlmICghY2xpZW50SWQpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjb3VsZCBub3QgZ2V0IGNsaWVudElkLCB3YXM6IGAsIGNsaWVudElkKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNsaWVudElkO1xyXG4gIH1cclxufVxyXG4iXX0=