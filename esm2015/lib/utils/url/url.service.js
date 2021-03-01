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
    getRefreshSessionSilentRenewUrl(customParams) {
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            return this.createUrlCodeFlowWithSilentRenew(customParams);
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
    createUrlCodeFlowWithSilentRenew(customParams) {
        const state = this.flowsDataService.createAuthStateControl('silent-renew-code');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi91dGlscy91cmwvdXJsLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQU8xQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7Ozs7OztBQUUzQyxNQUFNLHdCQUF3QixHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFeEUsTUFBTSxPQUFPLFVBQVU7SUFDckIsWUFDbUIscUJBQTRDLEVBQzVDLGFBQTRCLEVBQzVCLGdCQUFrQyxFQUNsQyxVQUFzQixFQUMvQixzQkFBOEMsRUFDOUMseUJBQW9EO1FBTDNDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQy9CLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7UUFDOUMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtJQUMzRCxDQUFDO0lBRUosZUFBZSxDQUFDLFVBQWUsRUFBRSxJQUFTO1FBQ3hDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDZixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FB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LENBQUMsQ0FBQztZQUN2RSxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQzs7b0VBNVdVLFVBQVU7a0RBQVYsVUFBVSxXQUFWLFVBQVU7a0RBQVYsVUFBVTtjQUR0QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cFBhcmFtcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBvbmVMaW5lVHJpbSB9IGZyb20gJ2NvbW1vbi10YWdzJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IEZsb3dzRGF0YVNlcnZpY2UgfSBmcm9tICcuLi8uLi9mbG93cy9mbG93cy1kYXRhLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBMb2dnZXJTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vbG9nZ2luZy9sb2dnZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UgfSBmcm9tICcuLi8uLi9zdG9yYWdlL3N0b3JhZ2UtcGVyc2lzdGFuY2Uuc2VydmljZSc7XHJcbmltcG9ydCB7IFRva2VuVmFsaWRhdGlvblNlcnZpY2UgfSBmcm9tICcuLi8uLi92YWxpZGF0aW9uL3Rva2VuLXZhbGlkYXRpb24uc2VydmljZSc7XHJcbmltcG9ydCB7IEZsb3dIZWxwZXIgfSBmcm9tICcuLi9mbG93SGVscGVyL2Zsb3ctaGVscGVyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBVcmlFbmNvZGVyIH0gZnJvbSAnLi91cmktZW5jb2Rlcic7XHJcblxyXG5jb25zdCBDQUxMQkFDS19QQVJBTVNfVE9fQ0hFQ0sgPSBbJ2NvZGUnLCAnc3RhdGUnLCAndG9rZW4nLCAnaWRfdG9rZW4nXTtcclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgVXJsU2VydmljZSB7XHJcbiAgY29uc3RydWN0b3IoXHJcbiAgICBwcml2YXRlIHJlYWRvbmx5IGNvbmZpZ3VyYXRpb25Qcm92aWRlcjogQ29uZmlndXJhdGlvblByb3ZpZGVyLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBmbG93c0RhdGFTZXJ2aWNlOiBGbG93c0RhdGFTZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBmbG93SGVscGVyOiBGbG93SGVscGVyLFxyXG4gICAgcHJpdmF0ZSB0b2tlblZhbGlkYXRpb25TZXJ2aWNlOiBUb2tlblZhbGlkYXRpb25TZXJ2aWNlLFxyXG4gICAgcHJpdmF0ZSBzdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlOiBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlXHJcbiAgKSB7fVxyXG5cclxuICBnZXRVcmxQYXJhbWV0ZXIodXJsVG9DaGVjazogYW55LCBuYW1lOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgaWYgKCF1cmxUb0NoZWNrKSB7XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIW5hbWUpIHtcclxuICAgICAgcmV0dXJuICcnO1xyXG4gICAgfVxyXG5cclxuICAgIG5hbWUgPSBuYW1lLnJlcGxhY2UoL1tcXFtdLywgJ1xcXFxbJykucmVwbGFjZSgvW1xcXV0vLCAnXFxcXF0nKTtcclxuICAgIGNvbnN0IHJlZ2V4ID0gbmV3IFJlZ0V4cCgnW1xcXFw/Jl0nICsgbmFtZSArICc9KFteJiNdKiknKTtcclxuICAgIGNvbnN0IHJlc3VsdHMgPSByZWdleC5leGVjKHVybFRvQ2hlY2spO1xyXG4gICAgcmV0dXJuIHJlc3VsdHMgPT09IG51bGwgPyAnJyA6IGRlY29kZVVSSUNvbXBvbmVudChyZXN1bHRzWzFdKTtcclxuICB9XHJcblxyXG4gIGlzQ2FsbGJhY2tGcm9tU3RzKGN1cnJlbnRVcmw6IHN0cmluZykge1xyXG4gICAgY29uc3QgYW55UGFyYW1ldGVySXNHaXZlbiA9IENBTExCQUNLX1BBUkFNU19UT19DSEVDSy5zb21lKCh4KSA9PiAhIXRoaXMuZ2V0VXJsUGFyYW1ldGVyKGN1cnJlbnRVcmwsIHgpKTtcclxuICAgIHJldHVybiBhbnlQYXJhbWV0ZXJJc0dpdmVuO1xyXG4gIH1cclxuXHJcbiAgZ2V0UmVmcmVzaFNlc3Npb25TaWxlbnRSZW5ld1VybChjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVVybENvZGVGbG93V2l0aFNpbGVudFJlbmV3KGN1c3RvbVBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlVXJsSW1wbGljaXRGbG93V2l0aFNpbGVudFJlbmV3KGN1c3RvbVBhcmFtcykgfHwgJyc7XHJcbiAgfVxyXG5cclxuICBnZXRBdXRob3JpemVVcmwoY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxDb2RlRmxvd0F1dGhvcml6ZShjdXN0b21QYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0aGlzLmNyZWF0ZVVybEltcGxpY2l0Rmxvd0F1dGhvcml6ZShjdXN0b21QYXJhbXMpIHx8ICcnO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlRW5kU2Vzc2lvblVybChpZFRva2VuSGludDogc3RyaW5nKSB7XHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGNvbnN0IGVuZFNlc3Npb25FbmRwb2ludCA9IGF1dGhXZWxsS25vd25FbmRQb2ludHM/LmVuZFNlc3Npb25FbmRwb2ludDtcclxuXHJcbiAgICBpZiAoIWVuZFNlc3Npb25FbmRwb2ludCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB1cmxQYXJ0cyA9IGVuZFNlc3Npb25FbmRwb2ludC5zcGxpdCgnPycpO1xyXG5cclxuICAgIGNvbnN0IGF1dGhvcml6YXRpb25FbmRzZXNzaW9uVXJsID0gdXJsUGFydHNbMF07XHJcblxyXG4gICAgbGV0IHBhcmFtcyA9IG5ldyBIdHRwUGFyYW1zKHtcclxuICAgICAgZnJvbVN0cmluZzogdXJsUGFydHNbMV0sXHJcbiAgICAgIGVuY29kZXI6IG5ldyBVcmlFbmNvZGVyKCksXHJcbiAgICB9KTtcclxuICAgIHBhcmFtcyA9IHBhcmFtcy5zZXQoJ2lkX3Rva2VuX2hpbnQnLCBpZFRva2VuSGludCk7XHJcblxyXG4gICAgY29uc3QgcG9zdExvZ291dFJlZGlyZWN0VXJpID0gdGhpcy5nZXRQb3N0TG9nb3V0UmVkaXJlY3RVcmwoKTtcclxuXHJcbiAgICBpZiAocG9zdExvZ291dFJlZGlyZWN0VXJpKSB7XHJcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3Bvc3RfbG9nb3V0X3JlZGlyZWN0X3VyaScsIHBvc3RMb2dvdXRSZWRpcmVjdFVyaSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGAke2F1dGhvcml6YXRpb25FbmRzZXNzaW9uVXJsfT8ke3BhcmFtc31gO1xyXG4gIH1cclxuXHJcbiAgY3JlYXRlUmV2b2NhdGlvbkVuZHBvaW50Qm9keUFjY2Vzc1Rva2VuKHRva2VuOiBhbnkpIHtcclxuICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZCgpO1xyXG5cclxuICAgIGlmICghY2xpZW50SWQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGBjbGllbnRfaWQ9JHtjbGllbnRJZH0mdG9rZW49JHt0b2tlbn0mdG9rZW5fdHlwZV9oaW50PWFjY2Vzc190b2tlbmA7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVSZXZvY2F0aW9uRW5kcG9pbnRCb2R5UmVmcmVzaFRva2VuKHRva2VuOiBhbnkpIHtcclxuICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZCgpO1xyXG5cclxuICAgIGlmICghY2xpZW50SWQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGBjbGllbnRfaWQ9JHtjbGllbnRJZH0mdG9rZW49JHt0b2tlbn0mdG9rZW5fdHlwZV9oaW50PXJlZnJlc2hfdG9rZW5gO1xyXG4gIH1cclxuXHJcbiAgZ2V0UmV2b2NhdGlvbkVuZHBvaW50VXJsKCkge1xyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBjb25zdCByZXZvY2F0aW9uRW5kcG9pbnQgPSBhdXRoV2VsbEtub3duRW5kUG9pbnRzPy5yZXZvY2F0aW9uRW5kcG9pbnQ7XHJcblxyXG4gICAgaWYgKCFyZXZvY2F0aW9uRW5kcG9pbnQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXJsUGFydHMgPSByZXZvY2F0aW9uRW5kcG9pbnQuc3BsaXQoJz8nKTtcclxuXHJcbiAgICBjb25zdCByZXZvY2F0aW9uRW5kcG9pbnRVcmwgPSB1cmxQYXJ0c1swXTtcclxuICAgIHJldHVybiByZXZvY2F0aW9uRW5kcG9pbnRVcmw7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVCb2R5Rm9yQ29kZUZsb3dDb2RlUmVxdWVzdChjb2RlOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldENvZGVWZXJpZmllcigpO1xyXG4gICAgaWYgKCFjb2RlVmVyaWZpZXIpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBDb2RlVmVyaWZpZXIgaXMgbm90IHNldCBgLCBjb2RlVmVyaWZpZXIpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjbGllbnRJZCA9IHRoaXMuZ2V0Q2xpZW50SWQoKTtcclxuXHJcbiAgICBpZiAoIWNsaWVudElkKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGRhdGFGb3JCb2R5ID0gb25lTGluZVRyaW1gZ3JhbnRfdHlwZT1hdXRob3JpemF0aW9uX2NvZGVcclxuICAgICAgICAgICAgJmNsaWVudF9pZD0ke2NsaWVudElkfVxyXG4gICAgICAgICAgICAmY29kZV92ZXJpZmllcj0ke2NvZGVWZXJpZmllcn1cclxuICAgICAgICAgICAgJmNvZGU9JHtjb2RlfWA7XHJcblxyXG4gICAgY29uc3Qgc2lsZW50UmVuZXdVcmwgPSB0aGlzLmdldFNpbGVudFJlbmV3VXJsKCk7XHJcblxyXG4gICAgaWYgKHRoaXMuZmxvd3NEYXRhU2VydmljZS5pc1NpbGVudFJlbmV3UnVubmluZygpICYmIHNpbGVudFJlbmV3VXJsKSB7XHJcbiAgICAgIHJldHVybiBvbmVMaW5lVHJpbWAke2RhdGFGb3JCb2R5fSZyZWRpcmVjdF91cmk9JHtzaWxlbnRSZW5ld1VybH1gO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xyXG5cclxuICAgIGlmICghcmVkaXJlY3RVcmwpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG9uZUxpbmVUcmltYCR7ZGF0YUZvckJvZHl9JnJlZGlyZWN0X3VyaT0ke3JlZGlyZWN0VXJsfWA7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVCb2R5Rm9yQ29kZUZsb3dSZWZyZXNoVG9rZW5zUmVxdWVzdChyZWZyZXNodG9rZW46IHN0cmluZywgY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgY29uc3QgY2xpZW50SWQgPSB0aGlzLmdldENsaWVudElkKCk7XHJcblxyXG4gICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgZGF0YUZvckJvZHkgPSBvbmVMaW5lVHJpbWBncmFudF90eXBlPXJlZnJlc2hfdG9rZW5cclxuICAgICAgICAgICAgJmNsaWVudF9pZD0ke2NsaWVudElkfVxyXG4gICAgICAgICAgICAmcmVmcmVzaF90b2tlbj0ke3JlZnJlc2h0b2tlbn1gO1xyXG5cclxuICAgIGlmIChjdXN0b21QYXJhbXMpIHtcclxuICAgICAgY29uc3QgY3VzdG9tUGFyYW1zVG9BZGQgPSB7IC4uLihjdXN0b21QYXJhbXMgfHwge30pIH07XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjdXN0b21QYXJhbXNUb0FkZCkpIHtcclxuICAgICAgICBkYXRhRm9yQm9keSA9IGRhdGFGb3JCb2R5LmNvbmNhdChgJiR7a2V5fT0ke3ZhbHVlLnRvU3RyaW5nKCl9YCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZGF0YUZvckJvZHk7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZUF1dGhvcml6ZVVybChcclxuICAgIGNvZGVDaGFsbGVuZ2U6IHN0cmluZyxcclxuICAgIHJlZGlyZWN0VXJsOiBzdHJpbmcsXHJcbiAgICBub25jZTogc3RyaW5nLFxyXG4gICAgc3RhdGU6IHN0cmluZyxcclxuICAgIHByb21wdD86IHN0cmluZyxcclxuICAgIGN1c3RvbVJlcXVlc3RQYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfVxyXG4gICk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGNvbnN0IGF1dGhvcml6YXRpb25FbmRwb2ludCA9IGF1dGhXZWxsS25vd25FbmRQb2ludHM/LmF1dGhvcml6YXRpb25FbmRwb2ludDtcclxuXHJcbiAgICBpZiAoIWF1dGhvcml6YXRpb25FbmRwb2ludCkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYENhbiBub3QgY3JlYXRlIGFuIGF1dGhvcml6ZSB1cmwgd2hlbiBhdXRob3JpemF0aW9uRW5kcG9pbnQgaXMgJyR7YXV0aG9yaXphdGlvbkVuZHBvaW50fSdgKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgeyBjbGllbnRJZCwgcmVzcG9uc2VUeXBlLCBzY29wZSwgaGRQYXJhbSwgY3VzdG9tUGFyYW1zIH0gPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uO1xyXG5cclxuICAgIGlmICghY2xpZW50SWQpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjcmVhdGVBdXRob3JpemVVcmwgY291bGQgbm90IGFkZCBjbGllbnRJZCBiZWNhdXNlIGl0IHdhczogYCwgY2xpZW50SWQpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlVHlwZSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNyZWF0ZUF1dGhvcml6ZVVybCBjb3VsZCBub3QgYWRkIHJlc3BvbnNlVHlwZSBiZWNhdXNlIGl0IHdhczogYCwgcmVzcG9uc2VUeXBlKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFzY29wZSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNyZWF0ZUF1dGhvcml6ZVVybCBjb3VsZCBub3QgYWRkIHNjb3BlIGJlY2F1c2UgaXQgd2FzOiBgLCBzY29wZSk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVybFBhcnRzID0gYXV0aG9yaXphdGlvbkVuZHBvaW50LnNwbGl0KCc/Jyk7XHJcbiAgICBjb25zdCBhdXRob3JpemF0aW9uVXJsID0gdXJsUGFydHNbMF07XHJcblxyXG4gICAgbGV0IHBhcmFtcyA9IG5ldyBIdHRwUGFyYW1zKHtcclxuICAgICAgZnJvbVN0cmluZzogdXJsUGFydHNbMV0sXHJcbiAgICAgIGVuY29kZXI6IG5ldyBVcmlFbmNvZGVyKCksXHJcbiAgICB9KTtcclxuXHJcbiAgICBwYXJhbXMgPSBwYXJhbXMuc2V0KCdjbGllbnRfaWQnLCBjbGllbnRJZCk7XHJcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdyZWRpcmVjdF91cmknLCByZWRpcmVjdFVybCk7XHJcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdyZXNwb25zZV90eXBlJywgcmVzcG9uc2VUeXBlKTtcclxuICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3Njb3BlJywgc2NvcGUpO1xyXG4gICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgnbm9uY2UnLCBub25jZSk7XHJcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdzdGF0ZScsIHN0YXRlKTtcclxuXHJcbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpKSB7XHJcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2NvZGVfY2hhbGxlbmdlJywgY29kZUNoYWxsZW5nZSk7XHJcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2NvZGVfY2hhbGxlbmdlX21ldGhvZCcsICdTMjU2Jyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHByb21wdCkge1xyXG4gICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdwcm9tcHQnLCBwcm9tcHQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChoZFBhcmFtKSB7XHJcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ2hkJywgaGRQYXJhbSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGN1c3RvbVBhcmFtcyB8fCBjdXN0b21SZXF1ZXN0UGFyYW1zKSB7XHJcbiAgICAgIGNvbnN0IGN1c3RvbVBhcmFtc1RvQWRkID0geyAuLi4oY3VzdG9tUGFyYW1zIHx8IHt9KSwgLi4uKGN1c3RvbVJlcXVlc3RQYXJhbXMgfHwge30pIH07XHJcblxyXG4gICAgICBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhjdXN0b21QYXJhbXNUb0FkZCkpIHtcclxuICAgICAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKGtleSwgdmFsdWUudG9TdHJpbmcoKSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYCR7YXV0aG9yaXphdGlvblVybH0/JHtwYXJhbXN9YDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlVXJsSW1wbGljaXRGbG93V2l0aFNpbGVudFJlbmV3KGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEV4aXN0aW5nT3JDcmVhdGVBdXRoU3RhdGVDb250cm9sKCdzaWxlbnQtcmVuZXctY29kZScpO1xyXG4gICAgY29uc3Qgbm9uY2UgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlTm9uY2UoKTtcclxuXHJcbiAgICBjb25zdCBzaWxlbnRSZW5ld1VybCA9IHRoaXMuZ2V0U2lsZW50UmVuZXdVcmwoKTtcclxuXHJcbiAgICBpZiAoIXNpbGVudFJlbmV3VXJsKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnUmVmcmVzaFNlc3Npb24gY3JlYXRlZC4gYWRkaW5nIG15YXV0b3N0YXRlOiAnLCBzdGF0ZSk7XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBpZiAoYXV0aFdlbGxLbm93bkVuZFBvaW50cykge1xyXG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdXRob3JpemVVcmwoJycsIHNpbGVudFJlbmV3VXJsLCBub25jZSwgc3RhdGUsICdub25lJywgY3VzdG9tUGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlVXJsQ29kZUZsb3dXaXRoU2lsZW50UmVuZXcoY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlQXV0aFN0YXRlQ29udHJvbCgnc2lsZW50LXJlbmV3LWNvZGUnKTtcclxuICAgIGNvbnN0IG5vbmNlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZU5vbmNlKCk7XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdSZWZyZXNoU2Vzc2lvbiBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcgKyBzdGF0ZSk7XHJcblxyXG4gICAgLy8gY29kZV9jaGFsbGVuZ2Ugd2l0aCBcIlMyNTZcIlxyXG4gICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZUNvZGVWZXJpZmllcigpO1xyXG4gICAgY29uc3QgY29kZUNoYWxsZW5nZSA9IHRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS5nZW5lcmF0ZUNvZGVDaGFsbGVuZ2UoY29kZVZlcmlmaWVyKTtcclxuXHJcbiAgICBjb25zdCBzaWxlbnRSZW5ld1VybCA9IHRoaXMuZ2V0U2lsZW50UmVuZXdVcmwoKTtcclxuXHJcbiAgICBpZiAoIXNpbGVudFJlbmV3VXJsKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG4gICAgaWYgKGF1dGhXZWxsS25vd25FbmRQb2ludHMpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuY3JlYXRlQXV0aG9yaXplVXJsKGNvZGVDaGFsbGVuZ2UsIHNpbGVudFJlbmV3VXJsLCBub25jZSwgc3RhdGUsICdub25lJywgY3VzdG9tUGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVVcmxJbXBsaWNpdEZsb3dBdXRob3JpemUoY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woJ2xvZ2luJyk7XHJcbiAgICBjb25zdCBub25jZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVOb25jZSgpO1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdBdXRob3JpemUgY3JlYXRlZC4gYWRkaW5nIG15YXV0b3N0YXRlOiAnICsgc3RhdGUpO1xyXG5cclxuICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xyXG5cclxuICAgIGlmICghcmVkaXJlY3RVcmwpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBpZiAoYXV0aFdlbGxLbm93bkVuZFBvaW50cykge1xyXG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdXRob3JpemVVcmwoJycsIHJlZGlyZWN0VXJsLCBub25jZSwgc3RhdGUsIG51bGwsIGN1c3RvbVBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZVVybENvZGVGbG93QXV0aG9yaXplKGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9KTogc3RyaW5nIHtcclxuICAgIGNvbnN0IHN0YXRlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmdldEV4aXN0aW5nT3JDcmVhdGVBdXRoU3RhdGVDb250cm9sKCdsb2dpbicpO1xyXG4gICAgY29uc3Qgbm9uY2UgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlTm9uY2UoKTtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnQXV0aG9yaXplIGNyZWF0ZWQuIGFkZGluZyBteWF1dG9zdGF0ZTogJyArIHN0YXRlKTtcclxuXHJcbiAgICBjb25zdCByZWRpcmVjdFVybCA9IHRoaXMuZ2V0UmVkaXJlY3RVcmwoKTtcclxuXHJcbiAgICBpZiAoIXJlZGlyZWN0VXJsKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIGNvZGVfY2hhbGxlbmdlIHdpdGggXCJTMjU2XCJcclxuICAgIGNvbnN0IGNvZGVWZXJpZmllciA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVDb2RlVmVyaWZpZXIoKTtcclxuICAgIGNvbnN0IGNvZGVDaGFsbGVuZ2UgPSB0aGlzLnRva2VuVmFsaWRhdGlvblNlcnZpY2UuZ2VuZXJhdGVDb2RlQ2hhbGxlbmdlKGNvZGVWZXJpZmllcik7XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBpZiAoYXV0aFdlbGxLbm93bkVuZFBvaW50cykge1xyXG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdXRob3JpemVVcmwoY29kZUNoYWxsZW5nZSwgcmVkaXJlY3RVcmwsIG5vbmNlLCBzdGF0ZSwgbnVsbCwgY3VzdG9tUGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0UmVkaXJlY3RVcmwoKSB7XHJcbiAgICBjb25zdCByZWRpcmVjdFVybCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LnJlZGlyZWN0VXJsO1xyXG5cclxuICAgIGlmICghcmVkaXJlY3RVcmwpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjb3VsZCBub3QgZ2V0IHJlZGlyZWN0VXJsLCB3YXM6IGAsIHJlZGlyZWN0VXJsKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHJlZGlyZWN0VXJsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRTaWxlbnRSZW5ld1VybCgpIHtcclxuICAgIGNvbnN0IHNpbGVudFJlbmV3VXJsID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uc2lsZW50UmVuZXdVcmw7XHJcblxyXG4gICAgaWYgKCFzaWxlbnRSZW5ld1VybCkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNvdWxkIG5vdCBnZXQgc2lsZW50UmVuZXdVcmwsIHdhczogYCwgc2lsZW50UmVuZXdVcmwpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc2lsZW50UmVuZXdVcmw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFBvc3RMb2dvdXRSZWRpcmVjdFVybCgpIHtcclxuICAgIGNvbnN0IHBvc3RMb2dvdXRSZWRpcmVjdFVyaSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LnBvc3RMb2dvdXRSZWRpcmVjdFVyaTtcclxuICAgIGlmICghcG9zdExvZ291dFJlZGlyZWN0VXJpKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgY291bGQgbm90IGdldCBwb3N0TG9nb3V0UmVkaXJlY3RVcmksIHdhczogYCwgcG9zdExvZ291dFJlZGlyZWN0VXJpKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHBvc3RMb2dvdXRSZWRpcmVjdFVyaTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0Q2xpZW50SWQoKSB7XHJcbiAgICBjb25zdCBjbGllbnRJZCA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb24/LmNsaWVudElkO1xyXG4gICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNvdWxkIG5vdCBnZXQgY2xpZW50SWQsIHdhczogYCwgY2xpZW50SWQpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY2xpZW50SWQ7XHJcbiAgfVxyXG59XHJcbiJdfQ==