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
        const state = authStateLauchedType === 'login'
            ? this.flowsDataService.getExistingOrCreateAuthStateControl(authStateLauchedType)
            : this.flowsDataService.createAuthStateControl(authStateLauchedType);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXJsLnNlcnZpY2UuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi91dGlscy91cmwvdXJsLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDM0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQU8xQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOzs7Ozs7OztBQUUzQyxNQUFNLHdCQUF3QixHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFFeEUsTUFBTSxPQUFPLFVBQVU7SUFDckIsWUFDbUIscUJBQTRDLEVBQzVDLGFBQTRCLEVBQzVCLGdCQUFrQyxFQUNsQyxVQUFzQixFQUMvQixzQkFBOEMsRUFDOUMseUJBQW9EO1FBTDNDLDBCQUFxQixHQUFyQixxQkFBcUIsQ0FBdUI7UUFDNUMsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFrQjtRQUNsQyxlQUFVLEdBQVYsVUFBVSxDQUFZO1FBQy9CLDJCQUFzQixHQUF0QixzQkFBc0IsQ0FBd0I7UUFDOUMsOEJBQXlCLEdBQXpCLHlCQUF5QixDQUEyQjtJQUMzRCxDQUFDO0lBRUosZUFBZSxDQUFDLFVBQWUsRUFBRSxJQUFTO1FBQ3hDLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDZixPQUFPLEVBQUUsQ0FBQztTQUNYO1FBRUQsSUFBSSxDQUFDLElBQUksRUFBRTtZQUNULE9BQU8sRUFBRSxDQUFDO1NBQ1g7UUFFRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUMsT0FB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QU0sUUFBUSxTQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxtQkFBbUIsMENBQUUsUUFBUSxDQUFDO1FBQzFFLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDYixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUN2RSxPQUFPLElBQUksQ0FBQztTQUNiO1FBRUQsT0FBTyxRQUFRLENBQUM7SUFDbEIsQ0FBQzs7b0VBdFhVLFVBQVU7a0RBQVYsVUFBVSxXQUFWLFVBQVU7a0RBQVYsVUFBVTtjQUR0QixVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSHR0cFBhcmFtcyB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcclxuaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBvbmVMaW5lVHJpbSB9IGZyb20gJ2NvbW1vbi10YWdzJztcclxuaW1wb3J0IHsgQ29uZmlndXJhdGlvblByb3ZpZGVyIH0gZnJvbSAnLi4vLi4vY29uZmlnL2NvbmZpZy5wcm92aWRlcic7XHJcbmltcG9ydCB7IEF1dGhTdGF0ZUxhdWNoZWRUeXBlLCBGbG93c0RhdGFTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vZmxvd3MvZmxvd3MtZGF0YS5zZXJ2aWNlJztcclxuaW1wb3J0IHsgTG9nZ2VyU2VydmljZSB9IGZyb20gJy4uLy4uL2xvZ2dpbmcvbG9nZ2VyLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBTdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlIH0gZnJvbSAnLi4vLi4vc3RvcmFnZS9zdG9yYWdlLXBlcnNpc3RhbmNlLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBUb2tlblZhbGlkYXRpb25TZXJ2aWNlIH0gZnJvbSAnLi4vLi4vdmFsaWRhdGlvbi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UnO1xyXG5pbXBvcnQgeyBGbG93SGVscGVyIH0gZnJvbSAnLi4vZmxvd0hlbHBlci9mbG93LWhlbHBlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgVXJpRW5jb2RlciB9IGZyb20gJy4vdXJpLWVuY29kZXInO1xyXG5cclxuY29uc3QgQ0FMTEJBQ0tfUEFSQU1TX1RPX0NIRUNLID0gWydjb2RlJywgJ3N0YXRlJywgJ3Rva2VuJywgJ2lkX3Rva2VuJ107XHJcbkBJbmplY3RhYmxlKClcclxuZXhwb3J0IGNsYXNzIFVybFNlcnZpY2Uge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHJpdmF0ZSByZWFkb25seSBjb25maWd1cmF0aW9uUHJvdmlkZXI6IENvbmZpZ3VyYXRpb25Qcm92aWRlcixcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgbG9nZ2VyU2VydmljZTogTG9nZ2VyU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd3NEYXRhU2VydmljZTogRmxvd3NEYXRhU2VydmljZSxcclxuICAgIHByaXZhdGUgcmVhZG9ubHkgZmxvd0hlbHBlcjogRmxvd0hlbHBlcixcclxuICAgIHByaXZhdGUgdG9rZW5WYWxpZGF0aW9uU2VydmljZTogVG9rZW5WYWxpZGF0aW9uU2VydmljZSxcclxuICAgIHByaXZhdGUgc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZTogU3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZVxyXG4gICkge31cclxuXHJcbiAgZ2V0VXJsUGFyYW1ldGVyKHVybFRvQ2hlY2s6IGFueSwgbmFtZTogYW55KTogc3RyaW5nIHtcclxuICAgIGlmICghdXJsVG9DaGVjaykge1xyXG4gICAgICByZXR1cm4gJyc7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFuYW1lKSB7XHJcbiAgICAgIHJldHVybiAnJztcclxuICAgIH1cclxuXHJcbiAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9bXFxbXS8sICdcXFxcWycpLnJlcGxhY2UoL1tcXF1dLywgJ1xcXFxdJyk7XHJcbiAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAoJ1tcXFxcPyZdJyArIG5hbWUgKyAnPShbXiYjXSopJyk7XHJcbiAgICBjb25zdCByZXN1bHRzID0gcmVnZXguZXhlYyh1cmxUb0NoZWNrKTtcclxuICAgIHJldHVybiByZXN1bHRzID09PSBudWxsID8gJycgOiBkZWNvZGVVUklDb21wb25lbnQocmVzdWx0c1sxXSk7XHJcbiAgfVxyXG5cclxuICBpc0NhbGxiYWNrRnJvbVN0cyhjdXJyZW50VXJsOiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGFueVBhcmFtZXRlcklzR2l2ZW4gPSBDQUxMQkFDS19QQVJBTVNfVE9fQ0hFQ0suc29tZSgoeCkgPT4gISF0aGlzLmdldFVybFBhcmFtZXRlcihjdXJyZW50VXJsLCB4KSk7XHJcbiAgICByZXR1cm4gYW55UGFyYW1ldGVySXNHaXZlbjtcclxuICB9XHJcblxyXG4gIGdldFJlZnJlc2hTZXNzaW9uU2lsZW50UmVuZXdVcmwoXHJcbiAgICBjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSxcclxuICAgIGF1dGhTdGF0ZUxhdWNoZWRUeXBlPzogQXV0aFN0YXRlTGF1Y2hlZFR5cGVcclxuICApOiBzdHJpbmcge1xyXG4gICAgaWYgKHRoaXMuZmxvd0hlbHBlci5pc0N1cnJlbnRGbG93Q29kZUZsb3coKSkge1xyXG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxDb2RlRmxvd1dpdGhTaWxlbnRSZW5ldyhjdXN0b21QYXJhbXMsIGF1dGhTdGF0ZUxhdWNoZWRUeXBlKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVVcmxJbXBsaWNpdEZsb3dXaXRoU2lsZW50UmVuZXcoY3VzdG9tUGFyYW1zKSB8fCAnJztcclxuICB9XHJcblxyXG4gIGdldEF1dGhvcml6ZVVybChjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IHN0cmluZyB7XHJcbiAgICBpZiAodGhpcy5mbG93SGVscGVyLmlzQ3VycmVudEZsb3dDb2RlRmxvdygpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZVVybENvZGVGbG93QXV0aG9yaXplKGN1c3RvbVBhcmFtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlVXJsSW1wbGljaXRGbG93QXV0aG9yaXplKGN1c3RvbVBhcmFtcykgfHwgJyc7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVFbmRTZXNzaW9uVXJsKGlkVG9rZW5IaW50OiBzdHJpbmcpIHtcclxuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG4gICAgY29uc3QgZW5kU2Vzc2lvbkVuZHBvaW50ID0gYXV0aFdlbGxLbm93bkVuZFBvaW50cz8uZW5kU2Vzc2lvbkVuZHBvaW50O1xyXG5cclxuICAgIGlmICghZW5kU2Vzc2lvbkVuZHBvaW50KSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVybFBhcnRzID0gZW5kU2Vzc2lvbkVuZHBvaW50LnNwbGl0KCc/Jyk7XHJcblxyXG4gICAgY29uc3QgYXV0aG9yaXphdGlvbkVuZHNlc3Npb25VcmwgPSB1cmxQYXJ0c1swXTtcclxuXHJcbiAgICBsZXQgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoe1xyXG4gICAgICBmcm9tU3RyaW5nOiB1cmxQYXJ0c1sxXSxcclxuICAgICAgZW5jb2RlcjogbmV3IFVyaUVuY29kZXIoKSxcclxuICAgIH0pO1xyXG4gICAgcGFyYW1zID0gcGFyYW1zLnNldCgnaWRfdG9rZW5faGludCcsIGlkVG9rZW5IaW50KTtcclxuXHJcbiAgICBjb25zdCBwb3N0TG9nb3V0UmVkaXJlY3RVcmkgPSB0aGlzLmdldFBvc3RMb2dvdXRSZWRpcmVjdFVybCgpO1xyXG5cclxuICAgIGlmIChwb3N0TG9nb3V0UmVkaXJlY3RVcmkpIHtcclxuICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgncG9zdF9sb2dvdXRfcmVkaXJlY3RfdXJpJywgcG9zdExvZ291dFJlZGlyZWN0VXJpKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYCR7YXV0aG9yaXphdGlvbkVuZHNlc3Npb25Vcmx9PyR7cGFyYW1zfWA7XHJcbiAgfVxyXG5cclxuICBjcmVhdGVSZXZvY2F0aW9uRW5kcG9pbnRCb2R5QWNjZXNzVG9rZW4odG9rZW46IGFueSkge1xyXG4gICAgY29uc3QgY2xpZW50SWQgPSB0aGlzLmdldENsaWVudElkKCk7XHJcblxyXG4gICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYGNsaWVudF9pZD0ke2NsaWVudElkfSZ0b2tlbj0ke3Rva2VufSZ0b2tlbl90eXBlX2hpbnQ9YWNjZXNzX3Rva2VuYDtcclxuICB9XHJcblxyXG4gIGNyZWF0ZVJldm9jYXRpb25FbmRwb2ludEJvZHlSZWZyZXNoVG9rZW4odG9rZW46IGFueSkge1xyXG4gICAgY29uc3QgY2xpZW50SWQgPSB0aGlzLmdldENsaWVudElkKCk7XHJcblxyXG4gICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gYGNsaWVudF9pZD0ke2NsaWVudElkfSZ0b2tlbj0ke3Rva2VufSZ0b2tlbl90eXBlX2hpbnQ9cmVmcmVzaF90b2tlbmA7XHJcbiAgfVxyXG5cclxuICBnZXRSZXZvY2F0aW9uRW5kcG9pbnRVcmwoKSB7XHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGNvbnN0IHJldm9jYXRpb25FbmRwb2ludCA9IGF1dGhXZWxsS25vd25FbmRQb2ludHM/LnJldm9jYXRpb25FbmRwb2ludDtcclxuXHJcbiAgICBpZiAoIXJldm9jYXRpb25FbmRwb2ludCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB1cmxQYXJ0cyA9IHJldm9jYXRpb25FbmRwb2ludC5zcGxpdCgnPycpO1xyXG5cclxuICAgIGNvbnN0IHJldm9jYXRpb25FbmRwb2ludFVybCA9IHVybFBhcnRzWzBdO1xyXG4gICAgcmV0dXJuIHJldm9jYXRpb25FbmRwb2ludFVybDtcclxuICB9XHJcblxyXG4gIGNyZWF0ZUJvZHlGb3JDb2RlRmxvd0NvZGVSZXF1ZXN0KGNvZGU6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBjb2RlVmVyaWZpZXIgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0Q29kZVZlcmlmaWVyKCk7XHJcbiAgICBpZiAoIWNvZGVWZXJpZmllcikge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYENvZGVWZXJpZmllciBpcyBub3Qgc2V0IGAsIGNvZGVWZXJpZmllcik7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5nZXRDbGllbnRJZCgpO1xyXG5cclxuICAgIGlmICghY2xpZW50SWQpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0YUZvckJvZHkgPSBvbmVMaW5lVHJpbWBncmFudF90eXBlPWF1dGhvcml6YXRpb25fY29kZVxyXG4gICAgICAgICAgICAmY2xpZW50X2lkPSR7Y2xpZW50SWR9XHJcbiAgICAgICAgICAgICZjb2RlX3ZlcmlmaWVyPSR7Y29kZVZlcmlmaWVyfVxyXG4gICAgICAgICAgICAmY29kZT0ke2NvZGV9YDtcclxuXHJcbiAgICBjb25zdCBzaWxlbnRSZW5ld1VybCA9IHRoaXMuZ2V0U2lsZW50UmVuZXdVcmwoKTtcclxuXHJcbiAgICBpZiAodGhpcy5mbG93c0RhdGFTZXJ2aWNlLmlzU2lsZW50UmVuZXdSdW5uaW5nKCkgJiYgc2lsZW50UmVuZXdVcmwpIHtcclxuICAgICAgcmV0dXJuIG9uZUxpbmVUcmltYCR7ZGF0YUZvckJvZHl9JnJlZGlyZWN0X3VyaT0ke3NpbGVudFJlbmV3VXJsfWA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVkaXJlY3RVcmwgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XHJcblxyXG4gICAgaWYgKCFyZWRpcmVjdFVybCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gb25lTGluZVRyaW1gJHtkYXRhRm9yQm9keX0mcmVkaXJlY3RfdXJpPSR7cmVkaXJlY3RVcmx9YDtcclxuICB9XHJcblxyXG4gIGNyZWF0ZUJvZHlGb3JDb2RlRmxvd1JlZnJlc2hUb2tlbnNSZXF1ZXN0KHJlZnJlc2h0b2tlbjogc3RyaW5nLCBjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBjbGllbnRJZCA9IHRoaXMuZ2V0Q2xpZW50SWQoKTtcclxuXHJcbiAgICBpZiAoIWNsaWVudElkKSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBkYXRhRm9yQm9keSA9IG9uZUxpbmVUcmltYGdyYW50X3R5cGU9cmVmcmVzaF90b2tlblxyXG4gICAgICAgICAgICAmY2xpZW50X2lkPSR7Y2xpZW50SWR9XHJcbiAgICAgICAgICAgICZyZWZyZXNoX3Rva2VuPSR7cmVmcmVzaHRva2VufWA7XHJcblxyXG4gICAgaWYgKGN1c3RvbVBhcmFtcykge1xyXG4gICAgICBjb25zdCBjdXN0b21QYXJhbXNUb0FkZCA9IHsgLi4uKGN1c3RvbVBhcmFtcyB8fCB7fSkgfTtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGN1c3RvbVBhcmFtc1RvQWRkKSkge1xyXG4gICAgICAgIGRhdGFGb3JCb2R5ID0gZGF0YUZvckJvZHkuY29uY2F0KGAmJHtrZXl9PSR7dmFsdWUudG9TdHJpbmcoKX1gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBkYXRhRm9yQm9keTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlQXV0aG9yaXplVXJsKFxyXG4gICAgY29kZUNoYWxsZW5nZTogc3RyaW5nLFxyXG4gICAgcmVkaXJlY3RVcmw6IHN0cmluZyxcclxuICAgIG5vbmNlOiBzdHJpbmcsXHJcbiAgICBzdGF0ZTogc3RyaW5nLFxyXG4gICAgcHJvbXB0Pzogc3RyaW5nLFxyXG4gICAgY3VzdG9tUmVxdWVzdFBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9XHJcbiAgKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGF1dGhXZWxsS25vd25FbmRQb2ludHMgPSB0aGlzLnN0b3JhZ2VQZXJzaXN0YW5jZVNlcnZpY2UucmVhZCgnYXV0aFdlbGxLbm93bkVuZFBvaW50cycpO1xyXG4gICAgY29uc3QgYXV0aG9yaXphdGlvbkVuZHBvaW50ID0gYXV0aFdlbGxLbm93bkVuZFBvaW50cz8uYXV0aG9yaXphdGlvbkVuZHBvaW50O1xyXG5cclxuICAgIGlmICghYXV0aG9yaXphdGlvbkVuZHBvaW50KSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgQ2FuIG5vdCBjcmVhdGUgYW4gYXV0aG9yaXplIHVybCB3aGVuIGF1dGhvcml6YXRpb25FbmRwb2ludCBpcyAnJHthdXRob3JpemF0aW9uRW5kcG9pbnR9J2ApO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB7IGNsaWVudElkLCByZXNwb25zZVR5cGUsIHNjb3BlLCBoZFBhcmFtLCBjdXN0b21QYXJhbXMgfSA9IHRoaXMuY29uZmlndXJhdGlvblByb3ZpZGVyLm9wZW5JRENvbmZpZ3VyYXRpb247XHJcblxyXG4gICAgaWYgKCFjbGllbnRJZCkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNyZWF0ZUF1dGhvcml6ZVVybCBjb3VsZCBub3QgYWRkIGNsaWVudElkIGJlY2F1c2UgaXQgd2FzOiBgLCBjbGllbnRJZCk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcmVzcG9uc2VUeXBlKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgY3JlYXRlQXV0aG9yaXplVXJsIGNvdWxkIG5vdCBhZGQgcmVzcG9uc2VUeXBlIGJlY2F1c2UgaXQgd2FzOiBgLCByZXNwb25zZVR5cGUpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXNjb3BlKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgY3JlYXRlQXV0aG9yaXplVXJsIGNvdWxkIG5vdCBhZGQgc2NvcGUgYmVjYXVzZSBpdCB3YXM6IGAsIHNjb3BlKTtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXJsUGFydHMgPSBhdXRob3JpemF0aW9uRW5kcG9pbnQuc3BsaXQoJz8nKTtcclxuICAgIGNvbnN0IGF1dGhvcml6YXRpb25VcmwgPSB1cmxQYXJ0c1swXTtcclxuXHJcbiAgICBsZXQgcGFyYW1zID0gbmV3IEh0dHBQYXJhbXMoe1xyXG4gICAgICBmcm9tU3RyaW5nOiB1cmxQYXJ0c1sxXSxcclxuICAgICAgZW5jb2RlcjogbmV3IFVyaUVuY29kZXIoKSxcclxuICAgIH0pO1xyXG5cclxuICAgIHBhcmFtcyA9IHBhcmFtcy5zZXQoJ2NsaWVudF9pZCcsIGNsaWVudElkKTtcclxuICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3JlZGlyZWN0X3VyaScsIHJlZGlyZWN0VXJsKTtcclxuICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3Jlc3BvbnNlX3R5cGUnLCByZXNwb25zZVR5cGUpO1xyXG4gICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgnc2NvcGUnLCBzY29wZSk7XHJcbiAgICBwYXJhbXMgPSBwYXJhbXMuYXBwZW5kKCdub25jZScsIG5vbmNlKTtcclxuICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3N0YXRlJywgc3RhdGUpO1xyXG5cclxuICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCkpIHtcclxuICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgnY29kZV9jaGFsbGVuZ2UnLCBjb2RlQ2hhbGxlbmdlKTtcclxuICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgnY29kZV9jaGFsbGVuZ2VfbWV0aG9kJywgJ1MyNTYnKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocHJvbXB0KSB7XHJcbiAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoJ3Byb21wdCcsIHByb21wdCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGhkUGFyYW0pIHtcclxuICAgICAgcGFyYW1zID0gcGFyYW1zLmFwcGVuZCgnaGQnLCBoZFBhcmFtKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoY3VzdG9tUGFyYW1zIHx8IGN1c3RvbVJlcXVlc3RQYXJhbXMpIHtcclxuICAgICAgY29uc3QgY3VzdG9tUGFyYW1zVG9BZGQgPSB7IC4uLihjdXN0b21QYXJhbXMgfHwge30pLCAuLi4oY3VzdG9tUmVxdWVzdFBhcmFtcyB8fCB7fSkgfTtcclxuXHJcbiAgICAgIGZvciAoY29uc3QgW2tleSwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKGN1c3RvbVBhcmFtc1RvQWRkKSkge1xyXG4gICAgICAgIHBhcmFtcyA9IHBhcmFtcy5hcHBlbmQoa2V5LCB2YWx1ZS50b1N0cmluZygpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBgJHthdXRob3JpemF0aW9uVXJsfT8ke3BhcmFtc31gO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVVcmxJbXBsaWNpdEZsb3dXaXRoU2lsZW50UmVuZXcoY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woJ3NpbGVudC1yZW5ldy1jb2RlJyk7XHJcbiAgICBjb25zdCBub25jZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVOb25jZSgpO1xyXG5cclxuICAgIGNvbnN0IHNpbGVudFJlbmV3VXJsID0gdGhpcy5nZXRTaWxlbnRSZW5ld1VybCgpO1xyXG5cclxuICAgIGlmICghc2lsZW50UmVuZXdVcmwpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdSZWZyZXNoU2Vzc2lvbiBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcsIHN0YXRlKTtcclxuXHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGlmIChhdXRoV2VsbEtub3duRW5kUG9pbnRzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUF1dGhvcml6ZVVybCgnJywgc2lsZW50UmVuZXdVcmwsIG5vbmNlLCBzdGF0ZSwgJ25vbmUnLCBjdXN0b21QYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVVcmxDb2RlRmxvd1dpdGhTaWxlbnRSZW5ldyhcclxuICAgIGN1c3RvbVBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB9LFxyXG4gICAgYXV0aFN0YXRlTGF1Y2hlZFR5cGU/OiBBdXRoU3RhdGVMYXVjaGVkVHlwZVxyXG4gICk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBzdGF0ZSA9XHJcbiAgICAgIGF1dGhTdGF0ZUxhdWNoZWRUeXBlID09PSAnbG9naW4nXHJcbiAgICAgICAgPyB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woYXV0aFN0YXRlTGF1Y2hlZFR5cGUpXHJcbiAgICAgICAgOiB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlQXV0aFN0YXRlQ29udHJvbChhdXRoU3RhdGVMYXVjaGVkVHlwZSk7XHJcblxyXG4gICAgY29uc3Qgbm9uY2UgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlTm9uY2UoKTtcclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1JlZnJlc2hTZXNzaW9uIGNyZWF0ZWQuIGFkZGluZyBteWF1dG9zdGF0ZTogJyArIHN0YXRlKTtcclxuXHJcbiAgICAvLyBjb2RlX2NoYWxsZW5nZSB3aXRoIFwiUzI1NlwiXHJcbiAgICBjb25zdCBjb2RlVmVyaWZpZXIgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuY3JlYXRlQ29kZVZlcmlmaWVyKCk7XHJcbiAgICBjb25zdCBjb2RlQ2hhbGxlbmdlID0gdGhpcy50b2tlblZhbGlkYXRpb25TZXJ2aWNlLmdlbmVyYXRlQ29kZUNoYWxsZW5nZShjb2RlVmVyaWZpZXIpO1xyXG5cclxuICAgIGNvbnN0IHNpbGVudFJlbmV3VXJsID0gdGhpcy5nZXRTaWxlbnRSZW5ld1VybCgpO1xyXG5cclxuICAgIGlmICghc2lsZW50UmVuZXdVcmwpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgYXV0aFdlbGxLbm93bkVuZFBvaW50cyA9IHRoaXMuc3RvcmFnZVBlcnNpc3RhbmNlU2VydmljZS5yZWFkKCdhdXRoV2VsbEtub3duRW5kUG9pbnRzJyk7XHJcbiAgICBpZiAoYXV0aFdlbGxLbm93bkVuZFBvaW50cykge1xyXG4gICAgICByZXR1cm4gdGhpcy5jcmVhdGVBdXRob3JpemVVcmwoY29kZUNoYWxsZW5nZSwgc2lsZW50UmVuZXdVcmwsIG5vbmNlLCBzdGF0ZSwgJ25vbmUnLCBjdXN0b21QYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdhdXRoV2VsbEtub3duRW5kcG9pbnRzIGlzIHVuZGVmaW5lZCcpO1xyXG4gICAgcmV0dXJuIG51bGw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGNyZWF0ZVVybEltcGxpY2l0Rmxvd0F1dGhvcml6ZShjdXN0b21QYXJhbXM/OiB7IFtrZXk6IHN0cmluZ106IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4gfSk6IHN0cmluZyB7XHJcbiAgICBjb25zdCBzdGF0ZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5nZXRFeGlzdGluZ09yQ3JlYXRlQXV0aFN0YXRlQ29udHJvbCgnbG9naW4nKTtcclxuICAgIGNvbnN0IG5vbmNlID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZU5vbmNlKCk7XHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ0F1dGhvcml6ZSBjcmVhdGVkLiBhZGRpbmcgbXlhdXRvc3RhdGU6ICcgKyBzdGF0ZSk7XHJcblxyXG4gICAgY29uc3QgcmVkaXJlY3RVcmwgPSB0aGlzLmdldFJlZGlyZWN0VXJsKCk7XHJcblxyXG4gICAgaWYgKCFyZWRpcmVjdFVybCkge1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGlmIChhdXRoV2VsbEtub3duRW5kUG9pbnRzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUF1dGhvcml6ZVVybCgnJywgcmVkaXJlY3RVcmwsIG5vbmNlLCBzdGF0ZSwgbnVsbCwgY3VzdG9tUGFyYW1zKTtcclxuICAgIH1cclxuXHJcbiAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoJ2F1dGhXZWxsS25vd25FbmRwb2ludHMgaXMgdW5kZWZpbmVkJyk7XHJcbiAgICByZXR1cm4gbnVsbDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgY3JlYXRlVXJsQ29kZUZsb3dBdXRob3JpemUoY3VzdG9tUGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIH0pOiBzdHJpbmcge1xyXG4gICAgY29uc3Qgc3RhdGUgPSB0aGlzLmZsb3dzRGF0YVNlcnZpY2UuZ2V0RXhpc3RpbmdPckNyZWF0ZUF1dGhTdGF0ZUNvbnRyb2woJ2xvZ2luJyk7XHJcbiAgICBjb25zdCBub25jZSA9IHRoaXMuZmxvd3NEYXRhU2VydmljZS5jcmVhdGVOb25jZSgpO1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdBdXRob3JpemUgY3JlYXRlZC4gYWRkaW5nIG15YXV0b3N0YXRlOiAnICsgc3RhdGUpO1xyXG5cclxuICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gdGhpcy5nZXRSZWRpcmVjdFVybCgpO1xyXG5cclxuICAgIGlmICghcmVkaXJlY3RVcmwpIHtcclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY29kZV9jaGFsbGVuZ2Ugd2l0aCBcIlMyNTZcIlxyXG4gICAgY29uc3QgY29kZVZlcmlmaWVyID0gdGhpcy5mbG93c0RhdGFTZXJ2aWNlLmNyZWF0ZUNvZGVWZXJpZmllcigpO1xyXG4gICAgY29uc3QgY29kZUNoYWxsZW5nZSA9IHRoaXMudG9rZW5WYWxpZGF0aW9uU2VydmljZS5nZW5lcmF0ZUNvZGVDaGFsbGVuZ2UoY29kZVZlcmlmaWVyKTtcclxuXHJcbiAgICBjb25zdCBhdXRoV2VsbEtub3duRW5kUG9pbnRzID0gdGhpcy5zdG9yYWdlUGVyc2lzdGFuY2VTZXJ2aWNlLnJlYWQoJ2F1dGhXZWxsS25vd25FbmRQb2ludHMnKTtcclxuICAgIGlmIChhdXRoV2VsbEtub3duRW5kUG9pbnRzKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNyZWF0ZUF1dGhvcml6ZVVybChjb2RlQ2hhbGxlbmdlLCByZWRpcmVjdFVybCwgbm9uY2UsIHN0YXRlLCBudWxsLCBjdXN0b21QYXJhbXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcignYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpcyB1bmRlZmluZWQnKTtcclxuICAgIHJldHVybiBudWxsO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRSZWRpcmVjdFVybCgpIHtcclxuICAgIGNvbnN0IHJlZGlyZWN0VXJsID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8ucmVkaXJlY3RVcmw7XHJcblxyXG4gICAgaWYgKCFyZWRpcmVjdFVybCkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRXJyb3IoYGNvdWxkIG5vdCBnZXQgcmVkaXJlY3RVcmwsIHdhczogYCwgcmVkaXJlY3RVcmwpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcmVkaXJlY3RVcmw7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGdldFNpbGVudFJlbmV3VXJsKCkge1xyXG4gICAgY29uc3Qgc2lsZW50UmVuZXdVcmwgPSB0aGlzLmNvbmZpZ3VyYXRpb25Qcm92aWRlci5vcGVuSURDb25maWd1cmF0aW9uPy5zaWxlbnRSZW5ld1VybDtcclxuXHJcbiAgICBpZiAoIXNpbGVudFJlbmV3VXJsKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgY291bGQgbm90IGdldCBzaWxlbnRSZW5ld1VybCwgd2FzOiBgLCBzaWxlbnRSZW5ld1VybCk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzaWxlbnRSZW5ld1VybDtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2V0UG9zdExvZ291dFJlZGlyZWN0VXJsKCkge1xyXG4gICAgY29uc3QgcG9zdExvZ291dFJlZGlyZWN0VXJpID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8ucG9zdExvZ291dFJlZGlyZWN0VXJpO1xyXG4gICAgaWYgKCFwb3N0TG9nb3V0UmVkaXJlY3RVcmkpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0Vycm9yKGBjb3VsZCBub3QgZ2V0IHBvc3RMb2dvdXRSZWRpcmVjdFVyaSwgd2FzOiBgLCBwb3N0TG9nb3V0UmVkaXJlY3RVcmkpO1xyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gcG9zdExvZ291dFJlZGlyZWN0VXJpO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBnZXRDbGllbnRJZCgpIHtcclxuICAgIGNvbnN0IGNsaWVudElkID0gdGhpcy5jb25maWd1cmF0aW9uUHJvdmlkZXIub3BlbklEQ29uZmlndXJhdGlvbj8uY2xpZW50SWQ7XHJcbiAgICBpZiAoIWNsaWVudElkKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dFcnJvcihgY291bGQgbm90IGdldCBjbGllbnRJZCwgd2FzOiBgLCBjbGllbnRJZCk7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjbGllbnRJZDtcclxuICB9XHJcbn1cclxuIl19