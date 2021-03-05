import { isPlatformBrowser, DOCUMENT, CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse, HttpClientModule } from '@angular/common/http';
import { ɵɵinject, ɵɵdefineInjectable, ɵsetClassMetadata, Injectable, PLATFORM_ID, Inject, NgZone, RendererFactory2, ɵɵdefineNgModule, ɵɵdefineInjector, ɵɵsetNgModuleScope, NgModule } from '@angular/core';
import { ReplaySubject, BehaviorSubject, of, Observable, throwError, Subject, from, forkJoin, TimeoutError } from 'rxjs';
import { KEYUTIL, KJUR, hextob64u } from 'jsrsasign-reduced';
import { take, catchError, switchMap, map, tap, timeout } from 'rxjs/operators';
import { oneLineTrim } from 'common-tags';
import { Router } from '@angular/router';
import { BroadcastChannel, createLeaderElection } from 'broadcast-channel';

class HttpBaseService {
    constructor(http) {
        this.http = http;
    }
    get(url, params) {
        return this.http.get(url, params);
    }
    post(url, body, params) {
        return this.http.post(url, body, params);
    }
}
HttpBaseService.ɵfac = function HttpBaseService_Factory(t) { return new (t || HttpBaseService)(ɵɵinject(HttpClient)); };
HttpBaseService.ɵprov = ɵɵdefineInjectable({ token: HttpBaseService, factory: HttpBaseService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(HttpBaseService, [{
        type: Injectable
    }], function () { return [{ type: HttpClient }]; }, null); })();

class DataService {
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    get(url, token) {
        const headers = this.prepareHeaders(token);
        return this.httpClient.get(url, {
            headers,
        });
    }
    post(url, body, headersParams) {
        const headers = headersParams || this.prepareHeaders();
        return this.httpClient.post(url, body, { headers });
    }
    prepareHeaders(token) {
        let headers = new HttpHeaders();
        headers = headers.set('Accept', 'application/json');
        if (!!token) {
            headers = headers.set('Authorization', 'Bearer ' + decodeURIComponent(token));
        }
        return headers;
    }
}
DataService.ɵfac = function DataService_Factory(t) { return new (t || DataService)(ɵɵinject(HttpBaseService)); };
DataService.ɵprov = ɵɵdefineInjectable({ token: DataService, factory: DataService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(DataService, [{
        type: Injectable
    }], function () { return [{ type: HttpBaseService }]; }, null); })();

// eslint-disable-next-line no-shadow
var EventTypes;
(function (EventTypes) {
    /**
     *  This only works in the AppModule Constructor
     */
    EventTypes[EventTypes["ConfigLoaded"] = 0] = "ConfigLoaded";
    EventTypes[EventTypes["ConfigLoadingFailed"] = 1] = "ConfigLoadingFailed";
    EventTypes[EventTypes["CheckSessionReceived"] = 2] = "CheckSessionReceived";
    EventTypes[EventTypes["UserDataChanged"] = 3] = "UserDataChanged";
    EventTypes[EventTypes["NewAuthorizationResult"] = 4] = "NewAuthorizationResult";
    EventTypes[EventTypes["TokenExpired"] = 5] = "TokenExpired";
    EventTypes[EventTypes["IdTokenExpired"] = 6] = "IdTokenExpired";
    EventTypes[EventTypes["SilentRenewFinished"] = 7] = "SilentRenewFinished";
})(EventTypes || (EventTypes = {}));

/**
 * Implement this class-interface to create a custom storage.
 */
class AbstractSecurityStorage {
}
AbstractSecurityStorage.ɵfac = function AbstractSecurityStorage_Factory(t) { return new (t || AbstractSecurityStorage)(); };
AbstractSecurityStorage.ɵprov = ɵɵdefineInjectable({ token: AbstractSecurityStorage, factory: AbstractSecurityStorage.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(AbstractSecurityStorage, [{
        type: Injectable
    }], null, null); })();

// eslint-disable-next-line no-shadow
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["None"] = 0] = "None";
    LogLevel[LogLevel["Debug"] = 1] = "Debug";
    LogLevel[LogLevel["Warn"] = 2] = "Warn";
    LogLevel[LogLevel["Error"] = 3] = "Error";
})(LogLevel || (LogLevel = {}));

const DEFAULT_CONFIG = {
    stsServer: 'https://please_set',
    authWellknownEndpoint: '',
    redirectUrl: 'https://please_set',
    clientId: 'please_set',
    responseType: 'code',
    scope: 'openid email profile',
    hdParam: '',
    postLogoutRedirectUri: 'https://please_set',
    startCheckSession: false,
    silentRenew: false,
    silentRenewUrl: 'https://please_set',
    silentRenewTimeoutInSeconds: 20,
    renewTimeBeforeTokenExpiresInSeconds: 0,
    useRefreshToken: false,
    ignoreNonceAfterRefresh: false,
    postLoginRoute: '/',
    forbiddenRoute: '/forbidden',
    unauthorizedRoute: '/unauthorized',
    autoUserinfo: true,
    autoCleanStateAfterAuthentication: true,
    triggerAuthorizationResultEvent: false,
    logLevel: LogLevel.Warn,
    issValidationOff: false,
    historyCleanupOff: false,
    maxIdTokenIatOffsetAllowedInSeconds: 120,
    disableIatOffsetValidation: false,
    storage: typeof Storage !== 'undefined' ? sessionStorage : null,
    customParams: {},
    eagerLoadAuthWellKnownEndpoints: true,
    disableRefreshIdTokenAuthTimeValidation: false,
    tokenRefreshInSeconds: 4,
};

class PlatformProvider {
    constructor(platformId) {
        this.platformId = platformId;
    }
    get isBrowser() {
        return isPlatformBrowser(this.platformId);
    }
}
PlatformProvider.ɵfac = function PlatformProvider_Factory(t) { return new (t || PlatformProvider)(ɵɵinject(PLATFORM_ID)); };
PlatformProvider.ɵprov = ɵɵdefineInjectable({ token: PlatformProvider, factory: PlatformProvider.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(PlatformProvider, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [PLATFORM_ID]
            }] }]; }, null); })();

class ConfigurationProvider {
    constructor(platformProvider) {
        this.platformProvider = platformProvider;
    }
    get openIDConfiguration() {
        return this.openIdConfigurationInternal || null;
    }
    hasValidConfig() {
        return !!this.openIdConfigurationInternal;
    }
    setConfig(configuration) {
        this.openIdConfigurationInternal = Object.assign(Object.assign({}, DEFAULT_CONFIG), configuration);
        if (configuration === null || configuration === void 0 ? void 0 : configuration.storage) {
            console.warn(`PLEASE NOTE: The storage in the config will be deprecated in future versions:
                Please pass the custom storage in forRoot() as documented`);
        }
        this.setSpecialCases(this.openIdConfigurationInternal);
        return this.openIdConfigurationInternal;
    }
    setSpecialCases(currentConfig) {
        if (!this.platformProvider.isBrowser) {
            currentConfig.startCheckSession = false;
            currentConfig.silentRenew = false;
            currentConfig.useRefreshToken = false;
        }
    }
}
ConfigurationProvider.ɵfac = function ConfigurationProvider_Factory(t) { return new (t || ConfigurationProvider)(ɵɵinject(PlatformProvider)); };
ConfigurationProvider.ɵprov = ɵɵdefineInjectable({ token: ConfigurationProvider, factory: ConfigurationProvider.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(ConfigurationProvider, [{
        type: Injectable
    }], function () { return [{ type: PlatformProvider }]; }, null); })();

class StoragePersistanceService {
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
StoragePersistanceService.ɵfac = function StoragePersistanceService_Factory(t) { return new (t || StoragePersistanceService)(ɵɵinject(AbstractSecurityStorage), ɵɵinject(ConfigurationProvider)); };
StoragePersistanceService.ɵprov = ɵɵdefineInjectable({ token: StoragePersistanceService, factory: StoragePersistanceService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(StoragePersistanceService, [{
        type: Injectable
    }], function () { return [{ type: AbstractSecurityStorage }, { type: ConfigurationProvider }]; }, null); })();

class LoggerService {
    constructor(configurationProvider) {
        this.configurationProvider = configurationProvider;
    }
    logError(message, ...args) {
        if (this.loggingIsTurnedOff()) {
            return;
        }
        if (!!args && args.length) {
            console.error(message, ...args);
        }
        else {
            console.error(message);
        }
    }
    logWarning(message, ...args) {
        if (!this.logLevelIsSet()) {
            return;
        }
        if (this.loggingIsTurnedOff()) {
            return;
        }
        if (!this.currentLogLevelIsEqualOrSmallerThan(LogLevel.Warn)) {
            return;
        }
        if (!!args && args.length) {
            console.warn(message, ...args);
        }
        else {
            console.warn(message);
        }
    }
    logDebug(message, ...args) {
        if (!this.logLevelIsSet()) {
            return;
        }
        if (this.loggingIsTurnedOff()) {
            return;
        }
        if (!this.currentLogLevelIsEqualOrSmallerThan(LogLevel.Debug)) {
            return;
        }
        if (!!args && args.length) {
            console.log(message, ...args);
        }
        else {
            console.log(message);
        }
    }
    currentLogLevelIsEqualOrSmallerThan(logLevel) {
        return this.configurationProvider.openIDConfiguration.logLevel <= logLevel;
    }
    logLevelIsSet() {
        const { logLevel } = this.configurationProvider.openIDConfiguration || {};
        if (logLevel === null) {
            return false;
        }
        if (logLevel === undefined) {
            return false;
        }
        return true;
    }
    loggingIsTurnedOff() {
        var _a;
        return ((_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.logLevel) === LogLevel.None;
    }
}
LoggerService.ɵfac = function LoggerService_Factory(t) { return new (t || LoggerService)(ɵɵinject(ConfigurationProvider)); };
LoggerService.ɵprov = ɵɵdefineInjectable({ token: LoggerService, factory: LoggerService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(LoggerService, [{
        type: Injectable
    }], function () { return [{ type: ConfigurationProvider }]; }, null); })();

class PublicEventsService {
    constructor() {
        this.notify = new ReplaySubject(1);
    }
    fireEvent(type, value) {
        this.notify.next({ type, value });
    }
    registerForEvents() {
        return this.notify.asObservable();
    }
}
PublicEventsService.ɵfac = function PublicEventsService_Factory(t) { return new (t || PublicEventsService)(); };
PublicEventsService.ɵprov = ɵɵdefineInjectable({ token: PublicEventsService, factory: PublicEventsService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(PublicEventsService, [{
        type: Injectable
    }], null, null); })();

const PARTS_OF_TOKEN = 3;
class TokenHelperService {
    constructor(loggerService) {
        this.loggerService = loggerService;
    }
    getTokenExpirationDate(dataIdToken) {
        if (!dataIdToken.hasOwnProperty('exp')) {
            return new Date(new Date().toUTCString());
        }
        const date = new Date(0); // The 0 here is the key, which sets the date to the epoch
        date.setUTCSeconds(dataIdToken.exp);
        return date;
    }
    getHeaderFromToken(token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 0, encoded);
    }
    getPayloadFromToken(token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 1, encoded);
    }
    getSignatureFromToken(token, encoded) {
        if (!this.tokenIsValid(token)) {
            return {};
        }
        return this.getPartOfToken(token, 2, encoded);
    }
    getPartOfToken(token, index, encoded) {
        const partOfToken = this.extractPartOfToken(token, index);
        if (encoded) {
            return partOfToken;
        }
        const result = this.urlBase64Decode(partOfToken);
        return JSON.parse(result);
    }
    urlBase64Decode(str) {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw Error('Illegal base64url string!');
        }
        const decoded = typeof window !== 'undefined' ? window.atob(output) : Buffer.from(output, 'base64').toString('binary');
        try {
            // Going backwards: from bytestream, to percent-encoding, to original string.
            return decodeURIComponent(decoded
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''));
        }
        catch (err) {
            return decoded;
        }
    }
    tokenIsValid(token) {
        if (!token) {
            this.loggerService.logError(`token '${token}' is not valid --> token falsy`);
            return false;
        }
        if (!token.includes('.')) {
            this.loggerService.logError(`token '${token}' is not valid --> no dots included`);
            return false;
        }
        const parts = token.split('.');
        if (parts.length !== PARTS_OF_TOKEN) {
            this.loggerService.logError(`token '${token}' is not valid --> token has to have exactly ${PARTS_OF_TOKEN - 1} dots`);
            return false;
        }
        return true;
    }
    extractPartOfToken(token, index) {
        return token.split('.')[index];
    }
}
TokenHelperService.ɵfac = function TokenHelperService_Factory(t) { return new (t || TokenHelperService)(ɵɵinject(LoggerService)); };
TokenHelperService.ɵprov = ɵɵdefineInjectable({ token: TokenHelperService, factory: TokenHelperService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(TokenHelperService, [{
        type: Injectable
    }], function () { return [{ type: LoggerService }]; }, null); })();

class FlowHelper {
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
FlowHelper.ɵfac = function FlowHelper_Factory(t) { return new (t || FlowHelper)(ɵɵinject(ConfigurationProvider)); };
FlowHelper.ɵprov = ɵɵdefineInjectable({ token: FlowHelper, factory: FlowHelper.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(FlowHelper, [{
        type: Injectable
    }], function () { return [{ type: ConfigurationProvider }]; }, null); })();

// http://openid.net/specs/openid-connect-implicit-1_0.html
// id_token
// id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
// MUST exactly match the value of the iss (issuer) Claim.
//
// id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
// by the iss (issuer) Claim as an audience.The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience,
// or if it contains additional audiences not trusted by the Client.
//
// id_token C3: If the ID Token contains multiple audiences, the Client SHOULD verify that an azp Claim is present.
//
// id_token C4: If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
//
// id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the
// alg Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
//
// id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the OpenID Connect
// Core 1.0
// [OpenID.Core] specification.
//
// id_token C7: The current time MUST be before the time represented by the exp Claim (possibly allowing for some small leeway to account
// for clock skew).
//
// id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
// limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
//
// id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one that was sent
// in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.The precise method for detecting replay attacks
// is Client specific.
//
// id_token C10: If the acr Claim was requested, the Client SHOULD check that the asserted Claim Value is appropriate.
// The meaning and processing of acr Claim Values is out of scope for this document.
//
// id_token C11: When a max_age request is made, the Client SHOULD check the auth_time Claim value and request re- authentication
// if it determines too much time has elapsed since the last End- User authentication.
// Access Token Validation
// access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
// for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
// access_token C2: Take the left- most half of the hash and base64url- encode it.
// access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash is present
// in the ID Token.
class TokenValidationService {
    constructor(tokenHelperService, flowHelper, loggerService) {
        this.tokenHelperService = tokenHelperService;
        this.flowHelper = flowHelper;
        this.loggerService = loggerService;
        this.keyAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'PS256', 'PS384', 'PS512'];
    }
    // id_token C7: The current time MUST be before the time represented by the exp Claim
    // (possibly allowing for some small leeway to account for clock skew).
    hasIdTokenExpired(token, offsetSeconds) {
        const decoded = this.tokenHelperService.getPayloadFromToken(token, false);
        return !this.validateIdTokenExpNotExpired(decoded, offsetSeconds);
    }
    // id_token C7: The current time MUST be before the time represented by the exp Claim
    // (possibly allowing for some small leeway to account for clock skew).
    validateIdTokenExpNotExpired(decodedIdToken, offsetSeconds) {
        const tokenExpirationDate = this.tokenHelperService.getTokenExpirationDate(decodedIdToken);
        offsetSeconds = offsetSeconds || 0;
        if (!tokenExpirationDate) {
            return false;
        }
        const tokenExpirationValue = tokenExpirationDate.valueOf();
        const nowWithOffset = new Date(new Date().toUTCString()).valueOf() + offsetSeconds * 1000;
        const tokenNotExpired = tokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug(`Has id_token expired: ${!tokenNotExpired}, ${tokenExpirationValue} > ${nowWithOffset}`);
        // Token not expired?
        return tokenNotExpired;
    }
    validateAccessTokenNotExpired(accessTokenExpiresAt, offsetSeconds) {
        // value is optional, so if it does not exist, then it has not expired
        if (!accessTokenExpiresAt) {
            return true;
        }
        offsetSeconds = offsetSeconds || 0;
        const accessTokenExpirationValue = accessTokenExpiresAt.valueOf();
        const nowWithOffset = new Date(new Date().toUTCString()).valueOf() + offsetSeconds * 1000;
        const tokenNotExpired = accessTokenExpirationValue > nowWithOffset;
        this.loggerService.logDebug(`Has access_token expired: ${!tokenNotExpired}, ${accessTokenExpirationValue} > ${nowWithOffset}`);
        // access token not expired?
        return tokenNotExpired;
    }
    // iss
    // REQUIRED. Issuer Identifier for the Issuer of the response.The iss value is a case-sensitive URL using the
    // https scheme that contains scheme, host,
    // and optionally, port number and path components and no query or fragment components.
    //
    // sub
    // REQUIRED. Subject Identifier.Locally unique and never reassigned identifier within the Issuer for the End- User,
    // which is intended to be consumed by the Client, e.g., 24400320 or AItOawmwtWwcT0k51BayewNvutrJUqsvl6qs7A4.
    // It MUST NOT exceed 255 ASCII characters in length.The sub value is a case-sensitive string.
    //
    // aud
    // REQUIRED. Audience(s) that this ID Token is intended for. It MUST contain the OAuth 2.0 client_id of the Relying Party as an
    // audience value.
    // It MAY also contain identifiers for other audiences.In the general case, the aud value is an array of case-sensitive strings.
    // In the common special case when there is one audience, the aud value MAY be a single case-sensitive string.
    //
    // exp
    // REQUIRED. Expiration time on or after which the ID Token MUST NOT be accepted for processing.
    // The processing of this parameter requires that the current date/ time MUST be before the expiration date/ time listed in the value.
    // Implementers MAY provide for some small leeway, usually no more than a few minutes, to account for clock skew.
    // Its value is a JSON [RFC7159] number representing the number of seconds from 1970- 01 - 01T00: 00:00Z as measured in UTC until
    // the date/ time.
    // See RFC 3339 [RFC3339] for details regarding date/ times in general and UTC in particular.
    //
    // iat
    // REQUIRED. Time at which the JWT was issued. Its value is a JSON number representing the number of seconds from
    // 1970- 01 - 01T00: 00: 00Z as measured
    // in UTC until the date/ time.
    validateRequiredIdToken(dataIdToken) {
        let validated = true;
        if (!dataIdToken.hasOwnProperty('iss')) {
            validated = false;
            this.loggerService.logWarning('iss is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('sub')) {
            validated = false;
            this.loggerService.logWarning('sub is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('aud')) {
            validated = false;
            this.loggerService.logWarning('aud is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('exp')) {
            validated = false;
            this.loggerService.logWarning('exp is missing, this is required in the id_token');
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            validated = false;
            this.loggerService.logWarning('iat is missing, this is required in the id_token');
        }
        return validated;
    }
    // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
    // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
    validateIdTokenIatMaxOffset(dataIdToken, maxOffsetAllowedInSeconds, disableIatOffsetValidation) {
        if (disableIatOffsetValidation) {
            return true;
        }
        if (!dataIdToken.hasOwnProperty('iat')) {
            return false;
        }
        const dateTimeIatIdToken = new Date(0); // The 0 here is the key, which sets the date to the epoch
        dateTimeIatIdToken.setUTCSeconds(dataIdToken.iat);
        maxOffsetAllowedInSeconds = maxOffsetAllowedInSeconds || 0;
        const nowInUtc = new Date(new Date().toUTCString());
        const diff = nowInUtc.valueOf() - dateTimeIatIdToken.valueOf();
        const maxOffsetAllowedInMilliseconds = maxOffsetAllowedInSeconds * 1000;
        this.loggerService.logDebug(`validate id token iat max offset ${diff} < ${maxOffsetAllowedInMilliseconds}`);
        if (diff > 0) {
            return diff < maxOffsetAllowedInMilliseconds;
        }
        return -diff < maxOffsetAllowedInMilliseconds;
    }
    // id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one
    // that was sent in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.
    // The precise method for detecting replay attacks is Client specific.
    // However the nonce claim SHOULD not be present for the refresh_token grant type
    // https://bitbucket.org/openid/connect/issues/1025/ambiguity-with-how-nonce-is-handled-on
    // The current spec is ambiguous and Keycloak does send it.
    validateIdTokenNonce(dataIdToken, localNonce, ignoreNonceAfterRefresh) {
        const isFromRefreshToken = (dataIdToken.nonce === undefined || ignoreNonceAfterRefresh) && localNonce === TokenValidationService.refreshTokenNoncePlaceholder;
        if (!isFromRefreshToken && dataIdToken.nonce !== localNonce) {
            this.loggerService.logDebug('Validate_id_token_nonce failed, dataIdToken.nonce: ' + dataIdToken.nonce + ' local_nonce:' + localNonce);
            return false;
        }
        return true;
    }
    // id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
    // MUST exactly match the value of the iss (issuer) Claim.
    validateIdTokenIss(dataIdToken, authWellKnownEndpointsIssuer) {
        if (dataIdToken.iss !== authWellKnownEndpointsIssuer) {
            this.loggerService.logDebug('Validate_id_token_iss failed, dataIdToken.iss: ' +
                dataIdToken.iss +
                ' authWellKnownEndpoints issuer:' +
                authWellKnownEndpointsIssuer);
            return false;
        }
        return true;
    }
    // id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
    // by the iss (issuer) Claim as an audience.
    // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences
    // not trusted by the Client.
    validateIdTokenAud(dataIdToken, aud) {
        if (Array.isArray(dataIdToken.aud)) {
            const result = dataIdToken.aud.includes(aud);
            if (!result) {
                this.loggerService.logDebug('Validate_id_token_aud array failed, dataIdToken.aud: ' + dataIdToken.aud + ' client_id:' + aud);
                return false;
            }
            return true;
        }
        else if (dataIdToken.aud !== aud) {
            this.loggerService.logDebug('Validate_id_token_aud failed, dataIdToken.aud: ' + dataIdToken.aud + ' client_id:' + aud);
            return false;
        }
        return true;
    }
    validateIdTokenAzpExistsIfMoreThanOneAud(dataIdToken) {
        if (!dataIdToken) {
            return false;
        }
        if (Array.isArray(dataIdToken.aud) && dataIdToken.aud.length > 1 && !dataIdToken.azp) {
            return false;
        }
        return true;
    }
    // If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
    validateIdTokenAzpValid(dataIdToken, clientId) {
        if (!(dataIdToken === null || dataIdToken === void 0 ? void 0 : dataIdToken.azp)) {
            return true;
        }
        if (dataIdToken.azp === clientId) {
            return true;
        }
        return false;
    }
    validateStateFromHashCallback(state, localState) {
        if (state !== localState) {
            this.loggerService.logDebug('ValidateStateFromHashCallback failed, state: ' + state + ' local_state:' + localState);
            return false;
        }
        return true;
    }
    // id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the alg
    // Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
    // id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the
    // OpenID Connect Core 1.0 [OpenID.Core] specification.
    validateSignatureIdToken(idToken, jwtkeys) {
        if (!jwtkeys || !jwtkeys.keys) {
            return false;
        }
        const headerData = this.tokenHelperService.getHeaderFromToken(idToken, false);
        if (Object.keys(headerData).length === 0 && headerData.constructor === Object) {
            this.loggerService.logWarning('id token has no header data');
            return false;
        }
        const kid = headerData.kid;
        const alg = headerData.alg;
        if (!this.keyAlgorithms.includes(alg)) {
            this.loggerService.logWarning('alg not supported', alg);
            return false;
        }
        let jwtKtyToUse = 'RSA';
        if (alg.charAt(0) === 'E') {
            jwtKtyToUse = 'EC';
        }
        let isValid = false;
        if (!headerData.hasOwnProperty('kid')) {
            // exactly 1 key in the jwtkeys and no kid in the Jose header
            // kty	"RSA" or EC use "sig"
            let amountOfMatchingKeys = 0;
            for (const key of jwtkeys.keys) {
                if (key.kty === jwtKtyToUse && key.use === 'sig') {
                    amountOfMatchingKeys = amountOfMatchingKeys + 1;
                }
            }
            if (amountOfMatchingKeys === 0) {
                this.loggerService.logWarning('no keys found, incorrect Signature, validation failed for id_token');
                return false;
            }
            if (amountOfMatchingKeys > 1) {
                this.loggerService.logWarning('no ID Token kid claim in JOSE header and multiple supplied in jwks_uri');
                return false;
            }
            for (const key of jwtkeys.keys) {
                if (key.kty === jwtKtyToUse && key.use === 'sig') {
                    const publickey = KEYUTIL.getKey(key);
                    isValid = KJUR.jws.JWS.verify(idToken, publickey, [alg]);
                    if (!isValid) {
                        this.loggerService.logWarning('incorrect Signature, validation failed for id_token');
                    }
                    return isValid;
                }
            }
        }
        else {
            // kid in the Jose header of id_token
            for (const key of jwtkeys.keys) {
                if (key.kid === kid) {
                    const publicKey = KEYUTIL.getKey(key);
                    isValid = KJUR.jws.JWS.verify(idToken, publicKey, [alg]);
                    if (!isValid) {
                        this.loggerService.logWarning('incorrect Signature, validation failed for id_token');
                    }
                    return isValid;
                }
            }
        }
        return isValid;
    }
    hasConfigValidResponseType() {
        if (this.flowHelper.isCurrentFlowAnyImplicitFlow()) {
            return true;
        }
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            return true;
        }
        this.loggerService.logWarning('module configured incorrectly, invalid response_type. Check the responseType in the config');
        return false;
    }
    // Accepts ID Token without 'kid' claim in JOSE header if only one JWK supplied in 'jwks_url'
    //// private validate_no_kid_in_header_only_one_allowed_in_jwtkeys(header_data: any, jwtkeys: any): boolean {
    ////    this.oidcSecurityCommon.logDebug('amount of jwtkeys.keys: ' + jwtkeys.keys.length);
    ////    if (!header_data.hasOwnProperty('kid')) {
    ////        // no kid defined in Jose header
    ////        if (jwtkeys.keys.length != 1) {
    ////            this.oidcSecurityCommon.logDebug('jwtkeys.keys.length != 1 and no kid in header');
    ////            return false;
    ////        }
    ////    }
    ////    return true;
    //// }
    // Access Token Validation
    // access_token C1: Hash the octets of the ASCII representation of the access_token with the hash algorithm specified in JWA[JWA]
    // for the alg Header Parameter of the ID Token's JOSE Header. For instance, if the alg is RS256, the hash algorithm used is SHA-256.
    // access_token C2: Take the left- most half of the hash and base64url- encode it.
    // access_token C3: The value of at_hash in the ID Token MUST match the value produced in the previous step if at_hash
    // is present in the ID Token.
    validateIdTokenAtHash(accessToken, atHash, idTokenAlg) {
        this.loggerService.logDebug('at_hash from the server:' + atHash);
        // 'sha256' 'sha384' 'sha512'
        let sha = 'sha256';
        if (idTokenAlg.includes('384')) {
            sha = 'sha384';
        }
        else if (idTokenAlg.includes('512')) {
            sha = 'sha512';
        }
        const testData = this.generateAtHash('' + accessToken, sha);
        this.loggerService.logDebug('at_hash client validation not decoded:' + testData);
        if (testData === atHash) {
            return true; // isValid;
        }
        else {
            const testValue = this.generateAtHash('' + decodeURIComponent(accessToken), sha);
            this.loggerService.logDebug('-gen access--' + testValue);
            if (testValue === atHash) {
                return true; // isValid
            }
        }
        return false;
    }
    generateCodeChallenge(codeVerifier) {
        const hash = KJUR.crypto.Util.hashString(codeVerifier, 'sha256');
        const testData = hextob64u(hash);
        return testData;
    }
    generateAtHash(accessToken, sha) {
        const hash = KJUR.crypto.Util.hashString(accessToken, sha);
        const first128bits = hash.substr(0, hash.length / 2);
        const testData = hextob64u(first128bits);
        return testData;
    }
}
TokenValidationService.refreshTokenNoncePlaceholder = '--RefreshToken--';
TokenValidationService.ɵfac = function TokenValidationService_Factory(t) { return new (t || TokenValidationService)(ɵɵinject(TokenHelperService), ɵɵinject(FlowHelper), ɵɵinject(LoggerService)); };
TokenValidationService.ɵprov = ɵɵdefineInjectable({ token: TokenValidationService, factory: TokenValidationService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(TokenValidationService, [{
        type: Injectable
    }], function () { return [{ type: TokenHelperService }, { type: FlowHelper }, { type: LoggerService }]; }, null); })();

class AuthStateService {
    constructor(storagePersistanceService, loggerService, publicEventsService, configurationProvider, tokenValidationService) {
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.publicEventsService = publicEventsService;
        this.configurationProvider = configurationProvider;
        this.tokenValidationService = tokenValidationService;
        this.authorizedInternal$ = new BehaviorSubject(false);
    }
    get authorized$() {
        return this.authorizedInternal$.asObservable();
    }
    get isAuthorized() {
        return !!this.storagePersistanceService.getAccessToken() && !!this.storagePersistanceService.getIdToken();
    }
    setAuthorizedAndFireEvent() {
        this.authorizedInternal$.next(true);
    }
    setUnauthorizedAndFireEvent() {
        this.storagePersistanceService.resetAuthStateInStorage();
        this.authorizedInternal$.next(false);
    }
    updateAndPublishAuthState(authorizationResult) {
        this.publicEventsService.fireEvent(EventTypes.NewAuthorizationResult, authorizationResult);
    }
    setAuthorizationData(accessToken, authResult) {
        this.loggerService.logDebug(accessToken);
        this.loggerService.logDebug('storing the accessToken');
        this.storagePersistanceService.write('authzData', accessToken);
        this.persistAccessTokenExpirationTime(authResult);
        this.setAuthorizedAndFireEvent();
    }
    getAccessToken() {
        if (!this.isAuthorized) {
            return '';
        }
        const token = this.storagePersistanceService.getAccessToken();
        return this.decodeURIComponentSafely(token);
    }
    getIdToken() {
        if (!this.isAuthorized) {
            return '';
        }
        const token = this.storagePersistanceService.getIdToken();
        return this.decodeURIComponentSafely(token);
    }
    getRefreshToken() {
        if (!this.isAuthorized) {
            return '';
        }
        const token = this.storagePersistanceService.getRefreshToken();
        return this.decodeURIComponentSafely(token);
    }
    areAuthStorageTokensValid() {
        if (!this.isAuthorized) {
            return false;
        }
        if (this.hasIdTokenExpired()) {
            this.loggerService.logDebug('persisted id_token is expired');
            return false;
        }
        if (this.hasAccessTokenExpiredIfExpiryExists()) {
            this.loggerService.logDebug('persisted access_token is expired');
            return false;
        }
        this.loggerService.logDebug('persisted id_token and access token are valid');
        return true;
    }
    hasIdTokenExpired() {
        const tokenToCheck = this.storagePersistanceService.getIdToken();
        const idTokenExpired = this.tokenValidationService.hasIdTokenExpired(tokenToCheck, this.configurationProvider.openIDConfiguration.renewTimeBeforeTokenExpiresInSeconds);
        if (idTokenExpired) {
            this.publicEventsService.fireEvent(EventTypes.IdTokenExpired, idTokenExpired);
        }
        return idTokenExpired;
    }
    hasAccessTokenExpiredIfExpiryExists() {
        const accessTokenExpiresIn = this.storagePersistanceService.read('access_token_expires_at');
        const accessTokenHasNotExpired = this.tokenValidationService.validateAccessTokenNotExpired(accessTokenExpiresIn, this.configurationProvider.openIDConfiguration.renewTimeBeforeTokenExpiresInSeconds);
        const hasExpired = !accessTokenHasNotExpired;
        if (hasExpired) {
            this.publicEventsService.fireEvent(EventTypes.TokenExpired, hasExpired);
        }
        return hasExpired;
    }
    decodeURIComponentSafely(token) {
        if (token) {
            return decodeURIComponent(token);
        }
        else {
            return '';
        }
    }
    persistAccessTokenExpirationTime(authResult) {
        if (authResult === null || authResult === void 0 ? void 0 : authResult.expires_in) {
            const accessTokenExpiryTime = new Date(new Date().toUTCString()).valueOf() + authResult.expires_in * 1000;
            this.storagePersistanceService.write('access_token_expires_at', accessTokenExpiryTime);
        }
    }
}
AuthStateService.ɵfac = function AuthStateService_Factory(t) { return new (t || AuthStateService)(ɵɵinject(StoragePersistanceService), ɵɵinject(LoggerService), ɵɵinject(PublicEventsService), ɵɵinject(ConfigurationProvider), ɵɵinject(TokenValidationService)); };
AuthStateService.ɵprov = ɵɵdefineInjectable({ token: AuthStateService, factory: AuthStateService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(AuthStateService, [{
        type: Injectable
    }], function () { return [{ type: StoragePersistanceService }, { type: LoggerService }, { type: PublicEventsService }, { type: ConfigurationProvider }, { type: TokenValidationService }]; }, null); })();

class IFrameService {
    constructor(doc, loggerService) {
        this.doc = doc;
        this.loggerService = loggerService;
    }
    getExistingIFrame(identifier) {
        const iFrameOnParent = this.getIFrameFromParentWindow(identifier);
        if (this.isIFrameElement(iFrameOnParent)) {
            return iFrameOnParent;
        }
        const iFrameOnSelf = this.getIFrameFromWindow(identifier);
        if (this.isIFrameElement(iFrameOnSelf)) {
            return iFrameOnSelf;
        }
        return null;
    }
    addIFrameToWindowBody(identifier) {
        const sessionIframe = this.doc.createElement('iframe');
        sessionIframe.id = identifier;
        sessionIframe.title = identifier;
        this.loggerService.logDebug(sessionIframe);
        sessionIframe.style.display = 'none';
        this.doc.body.appendChild(sessionIframe);
        return sessionIframe;
    }
    getIFrameFromParentWindow(identifier) {
        try {
            const iFrameElement = this.doc.defaultView.parent.document.getElementById(identifier);
            if (this.isIFrameElement(iFrameElement)) {
                return iFrameElement;
            }
            return null;
        }
        catch (e) {
            return null;
        }
    }
    getIFrameFromWindow(identifier) {
        const iFrameElement = this.doc.getElementById(identifier);
        if (this.isIFrameElement(iFrameElement)) {
            return iFrameElement;
        }
        return null;
    }
    isIFrameElement(element) {
        return !!element && element instanceof HTMLIFrameElement;
    }
}
IFrameService.ɵfac = function IFrameService_Factory(t) { return new (t || IFrameService)(ɵɵinject(DOCUMENT), ɵɵinject(LoggerService)); };
IFrameService.ɵprov = ɵɵdefineInjectable({ token: IFrameService, factory: IFrameService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(IFrameService, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: LoggerService }]; }, null); })();

const IFRAME_FOR_CHECK_SESSION_IDENTIFIER = 'myiFrameForCheckSession';
// http://openid.net/specs/openid-connect-session-1_0-ID4.html
class CheckSessionService {
    constructor(storagePersistanceService, loggerService, iFrameService, eventService, configurationProvider, zone) {
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.iFrameService = iFrameService;
        this.eventService = eventService;
        this.configurationProvider = configurationProvider;
        this.zone = zone;
        this.checkSessionReceived = false;
        this.lastIFrameRefresh = 0;
        this.outstandingMessages = 0;
        this.heartBeatInterval = 3000;
        this.iframeRefreshInterval = 60000;
        this.checkSessionChangedInternal$ = new BehaviorSubject(false);
    }
    get checkSessionChanged$() {
        return this.checkSessionChangedInternal$.asObservable();
    }
    isCheckSessionConfigured() {
        return this.configurationProvider.openIDConfiguration.startCheckSession;
    }
    start() {
        if (!!this.scheduledHeartBeatRunning) {
            return;
        }
        const clientId = this.configurationProvider.openIDConfiguration.clientId;
        this.pollServerSession(clientId);
    }
    stop() {
        if (!this.scheduledHeartBeatRunning) {
            return;
        }
        this.clearScheduledHeartBeat();
        this.checkSessionReceived = false;
    }
    serverStateChanged() {
        return this.configurationProvider.openIDConfiguration.startCheckSession && this.checkSessionReceived;
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
    }
    init() {
        if (this.lastIFrameRefresh + this.iframeRefreshInterval > Date.now()) {
            return of(undefined);
        }
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        if (!authWellKnownEndPoints) {
            this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined. Returning.');
            return of();
        }
        const existingIframe = this.getOrCreateIframe();
        const checkSessionIframe = authWellKnownEndPoints.checkSessionIframe;
        if (checkSessionIframe) {
            existingIframe.contentWindow.location.replace(checkSessionIframe);
        }
        else {
            this.loggerService.logWarning('init check session: checkSessionIframe is not configured to run');
        }
        return new Observable((observer) => {
            existingIframe.onload = () => {
                this.lastIFrameRefresh = Date.now();
                observer.next();
                observer.complete();
            };
        });
    }
    pollServerSession(clientId) {
        this.outstandingMessages = 0;
        const pollServerSessionRecur = () => {
            this.init()
                .pipe(take(1))
                .subscribe(() => {
                var _a;
                const existingIframe = this.getExistingIframe();
                if (existingIframe && clientId) {
                    this.loggerService.logDebug(existingIframe);
                    const sessionState = this.storagePersistanceService.read('session_state');
                    const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
                    if (sessionState && (authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.checkSessionIframe)) {
                        const iframeOrigin = (_a = new URL(authWellKnownEndPoints.checkSessionIframe)) === null || _a === void 0 ? void 0 : _a.origin;
                        this.outstandingMessages++;
                        existingIframe.contentWindow.postMessage(clientId + ' ' + sessionState, iframeOrigin);
                    }
                    else {
                        this.loggerService.logDebug(`OidcSecurityCheckSession pollServerSession session_state is '${sessionState}'`);
                        this.loggerService.logDebug(`AuthWellKnownEndPoints is '${JSON.stringify(authWellKnownEndPoints)}'`);
                        this.checkSessionChangedInternal$.next(true);
                    }
                }
                else {
                    this.loggerService.logWarning('OidcSecurityCheckSession pollServerSession checkSession IFrame does not exist');
                    this.loggerService.logDebug(clientId);
                    this.loggerService.logDebug(existingIframe);
                }
                // after sending three messages with no response, fail.
                if (this.outstandingMessages > 3) {
                    this.loggerService.logError(`OidcSecurityCheckSession not receiving check session response messages.
                            Outstanding messages: ${this.outstandingMessages}. Server unreachable?`);
                }
                this.zone.runOutsideAngular(() => {
                    this.scheduledHeartBeatRunning = setTimeout(() => this.zone.run(pollServerSessionRecur), this.heartBeatInterval);
                });
            });
        };
        pollServerSessionRecur();
    }
    clearScheduledHeartBeat() {
        clearTimeout(this.scheduledHeartBeatRunning);
        this.scheduledHeartBeatRunning = null;
    }
    messageHandler(e) {
        var _a;
        const existingIFrame = this.getExistingIframe();
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        const startsWith = !!((_a = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.checkSessionIframe) === null || _a === void 0 ? void 0 : _a.startsWith(e.origin));
        this.outstandingMessages = 0;
        if (existingIFrame && startsWith && e.source === existingIFrame.contentWindow) {
            if (e.data === 'error') {
                this.loggerService.logWarning('error from checksession messageHandler');
            }
            else if (e.data === 'changed') {
                this.loggerService.logDebug(e);
                this.checkSessionReceived = true;
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.checkSessionChangedInternal$.next(true);
            }
            else {
                this.eventService.fireEvent(EventTypes.CheckSessionReceived, e.data);
                this.loggerService.logDebug(e.data + ' from checksession messageHandler');
            }
        }
    }
    bindMessageEventToIframe() {
        const iframeMessageEvent = this.messageHandler.bind(this);
        window.addEventListener('message', iframeMessageEvent, false);
    }
    getOrCreateIframe() {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            const frame = this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
            this.bindMessageEventToIframe();
            return frame;
        }
        return existingIframe;
    }
}
CheckSessionService.ɵfac = function CheckSessionService_Factory(t) { return new (t || CheckSessionService)(ɵɵinject(StoragePersistanceService), ɵɵinject(LoggerService), ɵɵinject(IFrameService), ɵɵinject(PublicEventsService), ɵɵinject(ConfigurationProvider), ɵɵinject(NgZone)); };
CheckSessionService.ɵprov = ɵɵdefineInjectable({ token: CheckSessionService, factory: CheckSessionService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(CheckSessionService, [{
        type: Injectable
    }], function () { return [{ type: StoragePersistanceService }, { type: LoggerService }, { type: IFrameService }, { type: PublicEventsService }, { type: ConfigurationProvider }, { type: NgZone }]; }, null); })();

/* eslint-disable no-shadow */
var AuthorizedState;
(function (AuthorizedState) {
    AuthorizedState["Authorized"] = "Authorized";
    AuthorizedState["Unauthorized"] = "Unauthorized";
    AuthorizedState["Unknown"] = "Unknown";
})(AuthorizedState || (AuthorizedState = {}));

/* eslint-disable no-shadow */
var ValidationResult;
(function (ValidationResult) {
    ValidationResult["NotSet"] = "NotSet";
    ValidationResult["StatesDoNotMatch"] = "StatesDoNotMatch";
    ValidationResult["SignatureFailed"] = "SignatureFailed";
    ValidationResult["IncorrectNonce"] = "IncorrectNonce";
    ValidationResult["RequiredPropertyMissing"] = "RequiredPropertyMissing";
    ValidationResult["MaxOffsetExpired"] = "MaxOffsetExpired";
    ValidationResult["IssDoesNotMatchIssuer"] = "IssDoesNotMatchIssuer";
    ValidationResult["NoAuthWellKnownEndPoints"] = "NoAuthWellKnownEndPoints";
    ValidationResult["IncorrectAud"] = "IncorrectAud";
    ValidationResult["IncorrectIdTokenClaimsAfterRefresh"] = "IncorrectIdTokenClaimsAfterRefresh";
    ValidationResult["IncorrectAzp"] = "IncorrectAzp";
    ValidationResult["TokenExpired"] = "TokenExpired";
    ValidationResult["IncorrectAtHash"] = "IncorrectAtHash";
    ValidationResult["Ok"] = "Ok";
    ValidationResult["LoginRequired"] = "LoginRequired";
    ValidationResult["SecureTokenServerError"] = "SecureTokenServerError";
})(ValidationResult || (ValidationResult = {}));

class UriEncoder {
    encodeKey(key) {
        return encodeURIComponent(key);
    }
    encodeValue(value) {
        return encodeURIComponent(value);
    }
    decodeKey(key) {
        return decodeURIComponent(key);
    }
    decodeValue(value) {
        return decodeURIComponent(value);
    }
}

class RandomService {
    constructor(doc, loggerService) {
        this.doc = doc;
        this.loggerService = loggerService;
    }
    createRandom(requiredLength) {
        if (requiredLength <= 0) {
            return '';
        }
        if (requiredLength > 0 && requiredLength < 7) {
            this.loggerService.logWarning(`RandomService called with ${requiredLength} but 7 chars is the minimum, returning 10 chars`);
            requiredLength = 10;
        }
        const length = requiredLength - 6;
        const arr = new Uint8Array((length || length) / 2);
        if (this.getCrypto()) {
            this.getCrypto().getRandomValues(arr);
        }
        return Array.from(arr, this.toHex).join('') + this.randomString(7);
    }
    toHex(dec) {
        return ('0' + dec.toString(16)).substr(-2);
    }
    randomString(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = new Uint32Array(length);
        if (this.getCrypto()) {
            this.getCrypto().getRandomValues(values);
            for (let i = 0; i < length; i++) {
                result += characters[values[i] % characters.length];
            }
        }
        return result;
    }
    getCrypto() {
        // support for IE,  (window.crypto || window.msCrypto)
        return this.doc.defaultView.crypto || this.doc.defaultView.msCrypto;
    }
}
RandomService.ɵfac = function RandomService_Factory(t) { return new (t || RandomService)(ɵɵinject(DOCUMENT), ɵɵinject(LoggerService)); };
RandomService.ɵprov = ɵɵdefineInjectable({ token: RandomService, factory: RandomService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(RandomService, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: LoggerService }]; }, null); })();

class FlowsDataService {
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
    getAuthStateControlWithoutAnyCheck() {
        const json = this.storagePersistanceService.read('authStateControl');
        const storageObject = !!json ? JSON.parse(json) : null;
        this.loggerService.logDebug(`getAuthStateControlWithoutAnyCheck > currentTime: ${new Date().toTimeString()} > storageObject see inner details:`, storageObject);
        if (storageObject) {
            this.loggerService.logDebug(`getAuthStateControlWithoutAnyCheck > storageObject.lauchedFrom ${storageObject.lauchedFrom} > STATE SUCCESSFULLY RETURNED ${storageObject.state} > currentTime: ${new Date().toTimeString()}`);
            return storageObject.state;
        }
        this.loggerService.logWarning(`getAuthStateControlWithoutAnyCheck > storageObject IS NULL RETURN FALSE > currentTime: ${new Date().toTimeString()}`);
        return false;
    }
    getAuthStateControl(authStateLauchedType = null) {
        const json = this.storagePersistanceService.read('authStateControl');
        const storageObject = !!json ? JSON.parse(json) : null;
        this.loggerService.logDebug(`getAuthStateControl > currentTime: ${new Date().toTimeString()} > storageObject see inner details:`, storageObject);
        if (storageObject) {
            if (authStateLauchedType === 'login' && storageObject.lauchedFrom !== 'login') {
                this.loggerService.logWarning(`getAuthStateControl > STATE SHOULD BE RE-INITIALIZED FOR LOGIN FLOW > currentTime: ${new Date().toTimeString()}`);
                return false;
            }
            if (storageObject.lauchedFrom === 'silent-renew-code') {
                this.loggerService.logDebug(`getAuthStateControl > STATE LAUNCHED FROM SILENT RENEW: ${storageObject.state} > storageObject.lauchedFrom ${storageObject.lauchedFrom} >  currentTime: ${new Date().toTimeString()}`);
                const dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
                const currentDateUtc = Date.parse(new Date().toISOString());
                const elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
                const isProbablyStuck = elapsedTimeInMilliseconds > this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000;
                if (isProbablyStuck) {
                    this.loggerService.logWarning('getAuthStateControl -> silent renew process is probably stuck, AuthState will be reset.');
                    this.storagePersistanceService.write('authStateControl', '');
                    return false;
                }
            }
            this.loggerService.logDebug(`getAuthStateControl > storageObject.lauchedFrom ${storageObject.lauchedFrom} > STATE SUCCESSFULLY RETURNED ${storageObject.state} > currentTime: ${new Date().toTimeString()}`);
            return storageObject.state;
        }
        this.loggerService.logWarning(`getAuthStateControl > storageObject IS NULL RETURN FALSE > currentTime: ${new Date().toTimeString()}`);
        return false;
    }
    setAuthStateControl(authStateControl) {
        this.storagePersistanceService.write('authStateControl', authStateControl);
    }
    getExistingOrCreateAuthStateControl(authStateLauchedType) {
        let state = this.getAuthStateControl(authStateLauchedType);
        if (!state) {
            state = this.createAuthStateControl(authStateLauchedType);
        }
        return state;
    }
    createAuthStateControl(authStateLauchedType) {
        const state = this.randomService.createRandom(40);
        const storageObject = {
            state: state,
            dateOfLaunchedProcessUtc: new Date().toISOString(),
            lauchedFrom: authStateLauchedType,
        };
        this.storagePersistanceService.write('authStateControl', JSON.stringify(storageObject));
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
FlowsDataService.ɵfac = function FlowsDataService_Factory(t) { return new (t || FlowsDataService)(ɵɵinject(StoragePersistanceService), ɵɵinject(RandomService), ɵɵinject(ConfigurationProvider), ɵɵinject(LoggerService)); };
FlowsDataService.ɵprov = ɵɵdefineInjectable({ token: FlowsDataService, factory: FlowsDataService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(FlowsDataService, [{
        type: Injectable
    }], function () { return [{ type: StoragePersistanceService }, { type: RandomService }, { type: ConfigurationProvider }, { type: LoggerService }]; }, null); })();

const CALLBACK_PARAMS_TO_CHECK = ['code', 'state', 'token', 'id_token'];
class UrlService {
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
UrlService.ɵfac = function UrlService_Factory(t) { return new (t || UrlService)(ɵɵinject(ConfigurationProvider), ɵɵinject(LoggerService), ɵɵinject(FlowsDataService), ɵɵinject(FlowHelper), ɵɵinject(TokenValidationService), ɵɵinject(StoragePersistanceService)); };
UrlService.ɵprov = ɵɵdefineInjectable({ token: UrlService, factory: UrlService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(UrlService, [{
        type: Injectable
    }], function () { return [{ type: ConfigurationProvider }, { type: LoggerService }, { type: FlowsDataService }, { type: FlowHelper }, { type: TokenValidationService }, { type: StoragePersistanceService }]; }, null); })();

class SigninKeyDataService {
    constructor(storagePersistanceService, loggerService, dataService) {
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.dataService = dataService;
    }
    getSigningKeys() {
        const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        const jwksUri = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.jwksUri;
        if (!jwksUri) {
            const error = `getSigningKeys: authWellKnownEndpoints.jwksUri is: '${jwksUri}'`;
            this.loggerService.logWarning(error);
            return throwError(error);
        }
        this.loggerService.logDebug('Getting signinkeys from ', jwksUri);
        return this.dataService.get(jwksUri).pipe(catchError(this.handleErrorGetSigningKeys));
    }
    handleErrorGetSigningKeys(errorResponse) {
        let errMsg = '';
        if (errorResponse instanceof HttpResponse) {
            const body = errorResponse.body || {};
            const err = JSON.stringify(body);
            const { status, statusText } = errorResponse;
            errMsg = `${status || ''} - ${statusText || ''} ${err || ''}`;
        }
        else {
            const { message } = errorResponse;
            errMsg = !!message ? message : `${errorResponse}`;
        }
        this.loggerService.logError(errMsg);
        return throwError(new Error(errMsg));
    }
}
SigninKeyDataService.ɵfac = function SigninKeyDataService_Factory(t) { return new (t || SigninKeyDataService)(ɵɵinject(StoragePersistanceService), ɵɵinject(LoggerService), ɵɵinject(DataService)); };
SigninKeyDataService.ɵprov = ɵɵdefineInjectable({ token: SigninKeyDataService, factory: SigninKeyDataService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(SigninKeyDataService, [{
        type: Injectable
    }], function () { return [{ type: StoragePersistanceService }, { type: LoggerService }, { type: DataService }]; }, null); })();

class UserService {
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
UserService.ɵfac = function UserService_Factory(t) { return new (t || UserService)(ɵɵinject(DataService), ɵɵinject(StoragePersistanceService), ɵɵinject(PublicEventsService), ɵɵinject(LoggerService), ɵɵinject(TokenHelperService), ɵɵinject(FlowHelper), ɵɵinject(ConfigurationProvider)); };
UserService.ɵprov = ɵɵdefineInjectable({ token: UserService, factory: UserService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(UserService, [{
        type: Injectable
    }], function () { return [{ type: DataService }, { type: StoragePersistanceService }, { type: PublicEventsService }, { type: LoggerService }, { type: TokenHelperService }, { type: FlowHelper }, { type: ConfigurationProvider }]; }, null); })();

class StateValidationResult {
    constructor(accessToken = '', idToken = '', authResponseIsValid = false, decodedIdToken = {}, state = ValidationResult.NotSet) {
        this.accessToken = accessToken;
        this.idToken = idToken;
        this.authResponseIsValid = authResponseIsValid;
        this.decodedIdToken = decodedIdToken;
        this.state = state;
    }
}

class EqualityService {
    isStringEqualOrNonOrderedArrayEqual(value1, value2) {
        if (this.isNullOrUndefined(value1)) {
            return false;
        }
        if (this.isNullOrUndefined(value2)) {
            return false;
        }
        if (this.oneValueIsStringAndTheOtherIsArray(value1, value2)) {
            return false;
        }
        if (this.bothValuesAreStrings(value1, value2)) {
            return value1 === value2;
        }
        if (this.bothValuesAreArrays(value1, value2)) {
            return this.arraysHaveEqualContent(value1, value2);
        }
        return false;
    }
    areEqual(value1, value2) {
        if (!value1 || !value2) {
            return false;
        }
        if (this.bothValuesAreArrays(value1, value2)) {
            return this.arraysStrictEqual(value1, value2);
        }
        if (this.bothValuesAreStrings(value1, value2)) {
            return value1 === value2;
        }
        if (this.bothValuesAreObjects(value1, value2)) {
            return JSON.stringify(value1).toLowerCase() === JSON.stringify(value2).toLowerCase();
        }
        if (this.oneValueIsStringAndTheOtherIsArray(value1, value2)) {
            if (Array.isArray(value1) && this.valueIsString(value2)) {
                return value1[0] === value2;
            }
            if (Array.isArray(value2) && this.valueIsString(value1)) {
                return value2[0] === value1;
            }
        }
    }
    oneValueIsStringAndTheOtherIsArray(value1, value2) {
        return (Array.isArray(value1) && this.valueIsString(value2)) || (Array.isArray(value2) && this.valueIsString(value1));
    }
    bothValuesAreObjects(value1, value2) {
        return this.valueIsObject(value1) && this.valueIsObject(value2);
    }
    bothValuesAreStrings(value1, value2) {
        return this.valueIsString(value1) && this.valueIsString(value2);
    }
    bothValuesAreArrays(value1, value2) {
        return Array.isArray(value1) && Array.isArray(value2);
    }
    valueIsString(value) {
        return typeof value === 'string' || value instanceof String;
    }
    valueIsObject(value) {
        return typeof value === 'object';
    }
    arraysStrictEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        for (let i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i]) {
                return false;
            }
        }
        return true;
    }
    arraysHaveEqualContent(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        return arr1.some((v) => arr2.includes(v));
    }
    isNullOrUndefined(val) {
        return val === null || val === undefined;
    }
}
EqualityService.ɵfac = function EqualityService_Factory(t) { return new (t || EqualityService)(); };
EqualityService.ɵprov = ɵɵdefineInjectable({ token: EqualityService, factory: EqualityService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(EqualityService, [{
        type: Injectable
    }], null, null); })();

class StateValidationService {
    constructor(storagePersistanceService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, equalityService, flowHelper, flowsDataService) {
        this.storagePersistanceService = storagePersistanceService;
        this.tokenValidationService = tokenValidationService;
        this.tokenHelperService = tokenHelperService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.equalityService = equalityService;
        this.flowHelper = flowHelper;
        this.flowsDataService = flowsDataService;
    }
    getValidatedStateResult(callbackContext) {
        if (callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult.error) {
            return new StateValidationResult('', '', false, {});
        }
        return this.validateState(callbackContext);
    }
    validateState(callbackContext) {
        const toReturn = new StateValidationResult();
        const authStateControl = this.flowsDataService.getAuthStateControlWithoutAnyCheck();
        if (!this.tokenValidationService.validateStateFromHashCallback(callbackContext.authResult.state, authStateControl)) {
            this.loggerService.logWarning('authorizedCallback incorrect state');
            toReturn.state = ValidationResult.StatesDoNotMatch;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        const isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
        const isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
        if (isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow) {
            toReturn.accessToken = callbackContext.authResult.access_token;
        }
        if (callbackContext.authResult.id_token) {
            toReturn.idToken = callbackContext.authResult.id_token;
            toReturn.decodedIdToken = this.tokenHelperService.getPayloadFromToken(toReturn.idToken, false);
            if (!this.tokenValidationService.validateSignatureIdToken(toReturn.idToken, callbackContext.jwtKeys)) {
                this.loggerService.logDebug('authorizedCallback Signature validation failed id_token');
                toReturn.state = ValidationResult.SignatureFailed;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            const authNonce = this.storagePersistanceService.read('authNonce');
            if (!this.tokenValidationService.validateIdTokenNonce(toReturn.decodedIdToken, authNonce, this.configurationProvider.openIDConfiguration.ignoreNonceAfterRefresh)) {
                this.loggerService.logWarning('authorizedCallback incorrect nonce');
                toReturn.state = ValidationResult.IncorrectNonce;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateRequiredIdToken(toReturn.decodedIdToken)) {
                this.loggerService.logDebug('authorizedCallback Validation, one of the REQUIRED properties missing from id_token');
                toReturn.state = ValidationResult.RequiredPropertyMissing;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenIatMaxOffset(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.maxIdTokenIatOffsetAllowedInSeconds, this.configurationProvider.openIDConfiguration.disableIatOffsetValidation)) {
                this.loggerService.logWarning('authorizedCallback Validation, iat rejected id_token was issued too far away from the current time');
                toReturn.state = ValidationResult.MaxOffsetExpired;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            const authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (authWellKnownEndPoints) {
                if (this.configurationProvider.openIDConfiguration.issValidationOff) {
                    this.loggerService.logDebug('iss validation is turned off, this is not recommended!');
                }
                else if (!this.configurationProvider.openIDConfiguration.issValidationOff &&
                    !this.tokenValidationService.validateIdTokenIss(toReturn.decodedIdToken, authWellKnownEndPoints.issuer)) {
                    this.loggerService.logWarning('authorizedCallback incorrect iss does not match authWellKnownEndpoints issuer');
                    toReturn.state = ValidationResult.IssDoesNotMatchIssuer;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
            }
            else {
                this.loggerService.logWarning('authWellKnownEndpoints is undefined');
                toReturn.state = ValidationResult.NoAuthWellKnownEndPoints;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAud(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.clientId)) {
                this.loggerService.logWarning('authorizedCallback incorrect aud');
                toReturn.state = ValidationResult.IncorrectAud;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpExistsIfMoreThanOneAud(toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback missing azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenAzpValid(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.clientId)) {
                this.loggerService.logWarning('authorizedCallback incorrect azp');
                toReturn.state = ValidationResult.IncorrectAzp;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.isIdTokenAfterRefreshTokenRequestValid(callbackContext, toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback pre, post id_token claims do not match in refresh');
                toReturn.state = ValidationResult.IncorrectIdTokenClaimsAfterRefresh;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            if (!this.tokenValidationService.validateIdTokenExpNotExpired(toReturn.decodedIdToken)) {
                this.loggerService.logWarning('authorizedCallback id token expired');
                toReturn.state = ValidationResult.TokenExpired;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
        }
        else {
            this.loggerService.logDebug('No id_token found, skipping id_token validation');
        }
        // flow id_token
        if (!isCurrentFlowImplicitFlowWithAccessToken && !isCurrentFlowCodeFlow) {
            toReturn.authResponseIsValid = true;
            toReturn.state = ValidationResult.Ok;
            this.handleSuccessfulValidation();
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        const idTokenHeader = this.tokenHelperService.getHeaderFromToken(toReturn.idToken, false);
        // The at_hash is optional for the code flow
        if (isCurrentFlowCodeFlow && !toReturn.decodedIdToken.at_hash) {
            this.loggerService.logDebug('Code Flow active, and no at_hash in the id_token, skipping check!');
        }
        else if (!this.tokenValidationService.validateIdTokenAtHash(toReturn.accessToken, toReturn.decodedIdToken.at_hash, idTokenHeader.alg // 'RSA256'
        ) ||
            !toReturn.accessToken) {
            this.loggerService.logWarning('authorizedCallback incorrect at_hash');
            toReturn.state = ValidationResult.IncorrectAtHash;
            this.handleUnsuccessfulValidation();
            return toReturn;
        }
        toReturn.authResponseIsValid = true;
        toReturn.state = ValidationResult.Ok;
        this.handleSuccessfulValidation();
        return toReturn;
    }
    isIdTokenAfterRefreshTokenRequestValid(callbackContext, newIdToken) {
        if (!this.configurationProvider.openIDConfiguration.useRefreshToken) {
            return true;
        }
        if (!callbackContext.existingIdToken) {
            return true;
        }
        const decodedIdToken = this.tokenHelperService.getPayloadFromToken(callbackContext.existingIdToken, false);
        // Upon successful validation of the Refresh Token, the response body is the Token Response of Section 3.1.3.3
        // except that it might not contain an id_token.
        // If an ID Token is returned as a result of a token refresh request, the following requirements apply:
        // its iss Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.iss !== newIdToken.iss) {
            this.loggerService.logDebug(`iss do not match: ${decodedIdToken.iss} ${newIdToken.iss}`);
            return false;
        }
        // its azp Claim Value MUST be the same as in the ID Token issued when the original authentication occurred;
        //   if no azp Claim was present in the original ID Token, one MUST NOT be present in the new ID Token, and
        // otherwise, the same rules apply as apply when issuing an ID Token at the time of the original authentication.
        if (decodedIdToken.azp !== newIdToken.azp) {
            this.loggerService.logDebug(`azp do not match: ${decodedIdToken.azp} ${newIdToken.azp}`);
            return false;
        }
        // its sub Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (decodedIdToken.sub !== newIdToken.sub) {
            this.loggerService.logDebug(`sub do not match: ${decodedIdToken.sub} ${newIdToken.sub}`);
            return false;
        }
        // its aud Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
        if (!this.equalityService.isStringEqualOrNonOrderedArrayEqual(decodedIdToken === null || decodedIdToken === void 0 ? void 0 : decodedIdToken.aud, newIdToken === null || newIdToken === void 0 ? void 0 : newIdToken.aud)) {
            this.loggerService.logDebug(`aud in new id_token is not valid: '${decodedIdToken === null || decodedIdToken === void 0 ? void 0 : decodedIdToken.aud}' '${newIdToken.aud}'`);
            return false;
        }
        if (this.configurationProvider.openIDConfiguration.disableRefreshIdTokenAuthTimeValidation) {
            return true;
        }
        // its iat Claim MUST represent the time that the new ID Token is issued,
        // if the ID Token contains an auth_time Claim, its value MUST represent the time of the original authentication
        // - not the time that the new ID token is issued,
        if (decodedIdToken.auth_time !== newIdToken.auth_time) {
            this.loggerService.logDebug(`auth_time do not match: ${decodedIdToken.auth_time} ${newIdToken.auth_time}`);
            return false;
        }
        return true;
    }
    handleSuccessfulValidation() {
        this.storagePersistanceService.write('authNonce', '');
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.write('authStateControl', '');
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) validated, continue');
    }
    handleUnsuccessfulValidation() {
        this.storagePersistanceService.write('authNonce', '');
        if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
            this.storagePersistanceService.write('authStateControl', '');
        }
        this.loggerService.logDebug('AuthorizedCallback token(s) invalid');
    }
}
StateValidationService.ɵfac = function StateValidationService_Factory(t) { return new (t || StateValidationService)(ɵɵinject(StoragePersistanceService), ɵɵinject(TokenValidationService), ɵɵinject(TokenHelperService), ɵɵinject(LoggerService), ɵɵinject(ConfigurationProvider), ɵɵinject(EqualityService), ɵɵinject(FlowHelper), ɵɵinject(FlowsDataService)); };
StateValidationService.ɵprov = ɵɵdefineInjectable({ token: StateValidationService, factory: StateValidationService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(StateValidationService, [{
        type: Injectable
    }], function () { return [{ type: StoragePersistanceService }, { type: TokenValidationService }, { type: TokenHelperService }, { type: LoggerService }, { type: ConfigurationProvider }, { type: EqualityService }, { type: FlowHelper }, { type: FlowsDataService }]; }, null); })();

class FlowsService {
    constructor(urlService, loggerService, tokenValidationService, configurationProvider, authStateService, flowsDataService, signinKeyDataService, dataService, userService, stateValidationService, storagePersistanceService) {
        this.urlService = urlService;
        this.loggerService = loggerService;
        this.tokenValidationService = tokenValidationService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.signinKeyDataService = signinKeyDataService;
        this.dataService = dataService;
        this.userService = userService;
        this.stateValidationService = stateValidationService;
        this.storagePersistanceService = storagePersistanceService;
    }
    resetAuthorizationData() {
        if (this.configurationProvider.openIDConfiguration.autoUserinfo) {
            // Clear user data. Fixes #97.
            this.userService.resetUserDataInStore();
        }
        this.flowsDataService.resetStorageFlowData();
        this.authStateService.setUnauthorizedAndFireEvent();
    }
    processCodeFlowCallback(urlToCheck) {
        return this.codeFlowCallback(urlToCheck).pipe(switchMap((callbackContext) => this.codeFlowCodeRequest(callbackContext)), switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processSilentRenewCodeFlowCallback(firstContext) {
        return this.codeFlowCodeRequestOnlyForSilentRenew(firstContext).pipe(switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processImplicitFlowCallback(hash) {
        return this.implicitFlowCallback(hash).pipe(switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    processRefreshToken(customParams) {
        return this.refreshSessionWithRefreshTokens().pipe(switchMap((callbackContext) => this.refreshTokensRequestTokens(callbackContext, customParams)), switchMap((callbackContext) => this.callbackHistoryAndResetJwtKeys(callbackContext)), switchMap((callbackContext) => this.callbackStateValidation(callbackContext)), switchMap((callbackContext) => this.callbackUser(callbackContext)));
    }
    // STEP 1 Code Flow
    codeFlowCallback(urlToCheck) {
        const code = this.urlService.getUrlParameter(urlToCheck, 'code');
        const state = this.urlService.getUrlParameter(urlToCheck, 'state');
        const sessionState = this.urlService.getUrlParameter(urlToCheck, 'session_state') || null;
        if (!state) {
            this.loggerService.logDebug('no state in url');
            return throwError('no state in url');
        }
        if (!code) {
            this.loggerService.logDebug('no code in url');
            return throwError('no code in url');
        }
        this.loggerService.logDebug('running validation for callback', urlToCheck);
        const initialCallbackContext = {
            code,
            refreshToken: null,
            state,
            sessionState,
            authResult: null,
            isRenewProcess: false,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(initialCallbackContext);
    }
    // STEP 1 Implicit Flow
    implicitFlowCallback(hash) {
        const isRenewProcessData = this.flowsDataService.isSilentRenewRunning();
        this.loggerService.logDebug('BEGIN authorizedCallback, no auth data');
        if (!isRenewProcessData) {
            this.resetAuthorizationData();
        }
        hash = hash || window.location.hash.substr(1);
        const authResult = hash.split('&').reduce((resultData, item) => {
            const parts = item.split('=');
            resultData[parts.shift()] = parts.join('=');
            return resultData;
        }, {});
        const callbackContext = {
            code: null,
            refreshToken: null,
            state: null,
            sessionState: null,
            authResult,
            isRenewProcess: isRenewProcessData,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return of(callbackContext);
    }
    // STEP 1 Refresh session
    refreshSessionWithRefreshTokens() {
        const stateData = this.flowsDataService.getExistingOrCreateAuthStateControl('refresh-token');
        this.loggerService.logDebug('RefreshSession created. adding myautostate: ' + stateData);
        const refreshToken = this.authStateService.getRefreshToken();
        const idToken = this.authStateService.getIdToken();
        if (refreshToken) {
            const callbackContext = {
                code: null,
                refreshToken,
                state: stateData,
                sessionState: null,
                authResult: null,
                isRenewProcess: true,
                jwtKeys: null,
                validationResult: null,
                existingIdToken: idToken,
            };
            this.loggerService.logDebug('found refresh code, obtaining new credentials with refresh code');
            // Nonce is not used with refresh tokens; but Keycloak may send it anyway
            this.flowsDataService.setNonce(TokenValidationService.refreshTokenNoncePlaceholder);
            return of(callbackContext);
        }
        else {
            const errorMessage = 'no refresh token found, please login';
            this.loggerService.logError(errorMessage);
            return throwError(errorMessage);
        }
    }
    // STEP 2 Refresh Token
    refreshTokensRequestTokens(callbackContext, customParams) {
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const authWellKnown = this.storagePersistanceService.read('authWellKnownEndPoints');
        const tokenEndpoint = authWellKnown === null || authWellKnown === void 0 ? void 0 : authWellKnown.tokenEndpoint;
        if (!tokenEndpoint) {
            return throwError('Token Endpoint not defined');
        }
        const data = this.urlService.createBodyForCodeFlowRefreshTokensRequest(callbackContext.refreshToken, customParams);
        return this.dataService.post(tokenEndpoint, data, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('token refresh response: ', response);
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError((error) => {
            const errorMessage = `OidcService code request ${this.configurationProvider.openIDConfiguration.stsServer}`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    // STEP 2 Code Flow //  Code Flow Silent Renew starts here
    codeFlowCodeRequest(callbackContext) {
        const isStateCorrect = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, this.flowsDataService.getAuthStateControl());
        if (!isStateCorrect) {
            this.loggerService.logWarning('codeFlowCodeRequest incorrect state');
            return throwError('codeFlowCodeRequest incorrect state');
        }
        const authWellKnown = this.storagePersistanceService.read('authWellKnownEndPoints');
        const tokenEndpoint = authWellKnown === null || authWellKnown === void 0 ? void 0 : authWellKnown.tokenEndpoint;
        if (!tokenEndpoint) {
            return throwError('Token Endpoint not defined');
        }
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const bodyForCodeFlow = this.urlService.createBodyForCodeFlowCodeRequest(callbackContext.code);
        return this.dataService.post(tokenEndpoint, bodyForCodeFlow, headers).pipe(switchMap((response) => {
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            authResult.session_state = callbackContext.sessionState;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError((error) => {
            const errorMessage = `OidcService code request ${this.configurationProvider.openIDConfiguration.stsServer}`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    // STEP 2 Code Flow Silent Renew starts here OUR FLOW
    codeFlowCodeRequestOnlyForSilentRenew(callbackContext) {
        const isStateCorrect = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, this.flowsDataService.getAuthStateControl());
        if (!isStateCorrect) {
            this.loggerService.logWarning('codeFlowCodeRequest incorrect state');
            return throwError('codeFlowCodeRequest incorrect state');
        }
        const authWellKnown = this.storagePersistanceService.read('authWellKnownEndPoints');
        const tokenEndpoint = authWellKnown === null || authWellKnown === void 0 ? void 0 : authWellKnown.tokenEndpoint;
        if (!tokenEndpoint) {
            return throwError('Token Endpoint not defined');
        }
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        const bodyForCodeFlow = this.urlService.createBodyForCodeFlowCodeRequest(callbackContext.code);
        return this.dataService.post(tokenEndpoint, bodyForCodeFlow, headers).pipe(switchMap((response) => {
            const currentState = this.flowsDataService.getAuthStateControl();
            const isStateCorrectAfterTokenRequest = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, currentState);
            if (!isStateCorrectAfterTokenRequest) {
                this.loggerService.logError(`silentRenewEventHandler > AFTER code request callback > states don't match stateFromUrl: ${callbackContext.state} currentState: ${currentState}`);
                callbackContext.validationResult = {
                    accessToken: null,
                    authResponseIsValid: null,
                    decodedIdToken: null,
                    idToken: null,
                    state: ValidationResult.StatesDoNotMatch
                };
                return (of(callbackContext));
            }
            let authResult = new Object();
            authResult = response;
            authResult.state = callbackContext.state;
            authResult.session_state = callbackContext.sessionState;
            callbackContext.authResult = authResult;
            return of(callbackContext);
        }), catchError((error) => {
            const errorMessage = `OidcService code request ${this.configurationProvider.openIDConfiguration.stsServer}`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    // STEP 3 Code Flow, STEP 2 Implicit Flow, STEP 3 Refresh Token
    callbackHistoryAndResetJwtKeys(callbackContext) {
        this.storagePersistanceService.write('authnResult', callbackContext.authResult);
        if (this.historyCleanUpTurnedOn() && !callbackContext.isRenewProcess) {
            this.resetBrowserHistory();
        }
        else {
            this.loggerService.logDebug('history clean up inactive');
        }
        if (callbackContext.authResult.error) {
            const errorMessage = `authorizedCallbackProcedure came with error: ${callbackContext.authResult.error}`;
            this.loggerService.logDebug(errorMessage);
            this.resetAuthorizationData();
            this.flowsDataService.setNonce('');
            this.handleResultErrorFromCallback(callbackContext.authResult, callbackContext.isRenewProcess);
            return throwError(errorMessage);
        }
        this.loggerService.logDebug(callbackContext.authResult);
        this.loggerService.logDebug('authorizedCallback created, begin token validation');
        return this.signinKeyDataService.getSigningKeys().pipe(switchMap((jwtKeys) => {
            if (jwtKeys) {
                callbackContext.jwtKeys = jwtKeys;
                return of(callbackContext);
            }
            const errorMessage = `Failed to retrieve signing key`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }), catchError((err) => {
            const errorMessage = `Failed to retrieve signing key with error: ${err}`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }));
    }
    // STEP 4 All flows
    callbackStateValidation(callbackContext) {
        const validationResult = this.stateValidationService.getValidatedStateResult(callbackContext);
        callbackContext.validationResult = validationResult;
        if (validationResult.authResponseIsValid) {
            this.authStateService.setAuthorizationData(validationResult.accessToken, callbackContext.authResult);
            return of(callbackContext);
        }
        else {
            const errorMessage = `authorizedCallback, token(s) validation failed, resetting. Hash: ${window.location.hash}`;
            this.loggerService.logWarning(errorMessage);
            this.resetAuthorizationData();
            this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
            return throwError(errorMessage);
        }
    }
    // STEP 5 userData
    callbackUser(callbackContext) {
        if (!this.configurationProvider.openIDConfiguration.autoUserinfo) {
            if (!callbackContext.isRenewProcess) {
                // userData is set to the id_token decoded, auto get user data set to false
                this.userService.setUserDataToStore(callbackContext.validationResult.decodedIdToken);
            }
            this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
            return of(callbackContext);
        }
        return this.userService
            .getAndPersistUserDataInStore(callbackContext.isRenewProcess, callbackContext.validationResult.idToken, callbackContext.validationResult.decodedIdToken)
            .pipe(switchMap((userData) => {
            if (!!userData) {
                if (!callbackContext.refreshToken) {
                    this.flowsDataService.setSessionState(callbackContext.authResult.session_state);
                }
                this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                return of(callbackContext);
            }
            else {
                this.resetAuthorizationData();
                this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                const errorMessage = `Called for userData but they were ${userData}`;
                this.loggerService.logWarning(errorMessage);
                return throwError(errorMessage);
            }
        }), catchError((err) => {
            const errorMessage = `Failed to retrieve user info with error:  ${err}`;
            this.loggerService.logWarning(errorMessage);
            return throwError(errorMessage);
        }));
    }
    publishAuthorizedState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Authorized,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
    publishUnauthorizedState(stateValidationResult, isRenewProcess) {
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Unauthorized,
            validationResult: stateValidationResult.state,
            isRenewProcess,
        });
    }
    handleResultErrorFromCallback(result, isRenewProcess) {
        let validationResult = ValidationResult.SecureTokenServerError;
        if (result.error === 'login_required') {
            validationResult = ValidationResult.LoginRequired;
        }
        this.authStateService.updateAndPublishAuthState({
            authorizationState: AuthorizedState.Unauthorized,
            validationResult,
            isRenewProcess,
        });
    }
    historyCleanUpTurnedOn() {
        return !this.configurationProvider.openIDConfiguration.historyCleanupOff;
    }
    resetBrowserHistory() {
        window.history.replaceState({}, window.document.title, window.location.origin + window.location.pathname);
    }
}
FlowsService.ɵfac = function FlowsService_Factory(t) { return new (t || FlowsService)(ɵɵinject(UrlService), ɵɵinject(LoggerService), ɵɵinject(TokenValidationService), ɵɵinject(ConfigurationProvider), ɵɵinject(AuthStateService), ɵɵinject(FlowsDataService), ɵɵinject(SigninKeyDataService), ɵɵinject(DataService), ɵɵinject(UserService), ɵɵinject(StateValidationService), ɵɵinject(StoragePersistanceService)); };
FlowsService.ɵprov = ɵɵdefineInjectable({ token: FlowsService, factory: FlowsService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(FlowsService, [{
        type: Injectable
    }], function () { return [{ type: UrlService }, { type: LoggerService }, { type: TokenValidationService }, { type: ConfigurationProvider }, { type: AuthStateService }, { type: FlowsDataService }, { type: SigninKeyDataService }, { type: DataService }, { type: UserService }, { type: StateValidationService }, { type: StoragePersistanceService }]; }, null); })();

class IntervallService {
    constructor(zone) {
        this.zone = zone;
        this.runTokenValidationRunning = null;
    }
    stopPeriodicallTokenCheck() {
        if (this.runTokenValidationRunning) {
            this.runTokenValidationRunning.unsubscribe();
            this.runTokenValidationRunning = null;
        }
    }
    startPeriodicTokenCheck(repeatAfterSeconds) {
        const millisecondsDelayBetweenTokenCheck = repeatAfterSeconds * 1000;
        return new Observable((subscriber) => {
            let intervalId;
            this.zone.runOutsideAngular(() => {
                intervalId = setInterval(() => subscriber.next(), millisecondsDelayBetweenTokenCheck);
            });
            return () => {
                clearInterval(intervalId);
            };
        });
    }
}
IntervallService.ɵfac = function IntervallService_Factory(t) { return new (t || IntervallService)(ɵɵinject(NgZone)); };
IntervallService.ɵprov = ɵɵdefineInjectable({ token: IntervallService, factory: IntervallService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(IntervallService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: NgZone }]; }, null); })();

class ImplicitFlowCallbackService {
    constructor(flowsService, configurationProvider, router, flowsDataService, intervallService) {
        this.flowsService = flowsService;
        this.configurationProvider = configurationProvider;
        this.router = router;
        this.flowsDataService = flowsDataService;
        this.intervallService = intervallService;
    }
    authorizedImplicitFlowCallback(hash) {
        const isRenewProcess = this.flowsDataService.isSilentRenewRunning();
        return this.flowsService.processImplicitFlowCallback(hash).pipe(tap((callbackContext) => {
            if (!this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                this.router.navigate([this.configurationProvider.openIDConfiguration.postLoginRoute]);
            }
        }), catchError((error) => {
            this.flowsDataService.resetSilentRenewRunning();
            this.intervallService.stopPeriodicallTokenCheck();
            if (!this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !isRenewProcess) {
                this.router.navigate([this.configurationProvider.openIDConfiguration.unauthorizedRoute]);
            }
            return throwError(error);
        }));
    }
}
ImplicitFlowCallbackService.ɵfac = function ImplicitFlowCallbackService_Factory(t) { return new (t || ImplicitFlowCallbackService)(ɵɵinject(FlowsService), ɵɵinject(ConfigurationProvider), ɵɵinject(Router), ɵɵinject(FlowsDataService), ɵɵinject(IntervallService)); };
ImplicitFlowCallbackService.ɵprov = ɵɵdefineInjectable({ token: ImplicitFlowCallbackService, factory: ImplicitFlowCallbackService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(ImplicitFlowCallbackService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: FlowsService }, { type: ConfigurationProvider }, { type: Router }, { type: FlowsDataService }, { type: IntervallService }]; }, null); })();

class TabsSynchronizationService {
    constructor(configurationProvider, publicEventsService, loggerService) {
        this.configurationProvider = configurationProvider;
        this.publicEventsService = publicEventsService;
        this.loggerService = loggerService;
        this._isLeaderSubjectInitialized = false;
        this._isClosed = false;
        this._silentRenewFinished$ = new ReplaySubject(1);
        this._leaderSubjectInitialized$ = new ReplaySubject(1);
        this._currentRandomId = `${Math.random().toString(36).substr(2, 9)}_${new Date().getUTCMilliseconds()}`;
        this.Initialization();
    }
    get isClosed() {
        return this._isClosed;
    }
    isLeaderCheck() {
        this.loggerService.logDebug(`isLeaderCheck > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
        if (!this._isLeaderSubjectInitialized) {
            this.loggerService.logDebug(`isLeaderCheck > IS LEADER IS NOT INITIALIZED > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            return this._leaderSubjectInitialized$
                .asObservable()
                .pipe(take(1), switchMap(() => {
                return of(this._elector.isLeader);
            }))
                .toPromise();
        }
        this.loggerService.logDebug(`isLeaderCheck > IS LEADER IS ALREADY INITIALIZED > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
        return new Promise((resolve) => {
            const isLeaderResult = this._elector.isLeader;
            this.loggerService.logDebug(`isLeaderCheck > isLeader result = ${isLeaderResult} > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            resolve(isLeaderResult);
        });
    }
    getSilentRenewFinishedObservable() {
        return this._silentRenewFinished$.asObservable();
    }
    sendSilentRenewFinishedNotification() {
        if (!this._silentRenewFinishedChannel) {
            this._silentRenewFinishedChannel = new BroadcastChannel(`${this._prefix}_silent_renew_finished`);
        }
        this._silentRenewFinishedChannel.postMessage(`Silent renew finished by _currentRandomId ${this._currentRandomId}`);
    }
    closeTabSynchronization() {
        this.loggerService.logWarning(`Tab synchronization has been closed > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
        this._elector.die();
        this._silentRenewFinishedChannel.close();
        this._leaderChannel.close();
        this._isLeaderSubjectInitialized = false;
        this._isClosed = true;
    }
    reInitialize() {
        this.loggerService.logDebug('TabsSynchronizationService re-initialization process started...');
        if (!this._isClosed) {
            throw Error('TabsSynchronizationService cannot be re-initialized when it is not closed.');
        }
        this._silentRenewFinished$ = new ReplaySubject(1);
        this._leaderSubjectInitialized$ = new ReplaySubject(1);
        this.Initialization();
        this._isClosed = false;
    }
    Initialization() {
        var _a;
        this.loggerService.logDebug('TabsSynchronizationService > Initialization started');
        this._prefix = ((_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId) || '';
        this._leaderChannel = new BroadcastChannel(`${this._prefix}_leader`);
        this._elector = createLeaderElection(this._leaderChannel, {
            fallbackInterval: 2000,
            responseTime: 1000,
        });
        this._elector.applyOnce().then((isLeader) => {
            this.loggerService.logDebug('FIRST applyOnce finished...');
            this._isLeaderSubjectInitialized = true;
            this._leaderSubjectInitialized$.next(true);
            if (!isLeader) {
                this._elector.awaitLeadership().then(() => {
                    this.loggerService.logDebug(`FROM awaitLeadership > this tab is now leader > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
                });
            }
            else {
                this.loggerService.logDebug(`FROM INITIALIZATION FIRST applyOnce > this tab is now leader > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            }
        });
        this.initializeSilentRenewFinishedChannelWithHandler();
    }
    initializeSilentRenewFinishedChannelWithHandler() {
        this._silentRenewFinishedChannel = new BroadcastChannel(`${this._prefix}_silent_renew_finished`);
        this._silentRenewFinishedChannel.onmessage = () => {
            this.loggerService.logDebug(`FROM SILENT RENEW FINISHED RECIVED EVENT > prefix: ${this._prefix} > currentRandomId: ${this._currentRandomId}`);
            this._silentRenewFinished$.next(true);
            this.publicEventsService.fireEvent(EventTypes.SilentRenewFinished, true);
        };
    }
}
TabsSynchronizationService.ɵfac = function TabsSynchronizationService_Factory(t) { return new (t || TabsSynchronizationService)(ɵɵinject(ConfigurationProvider), ɵɵinject(PublicEventsService), ɵɵinject(LoggerService)); };
TabsSynchronizationService.ɵprov = ɵɵdefineInjectable({ token: TabsSynchronizationService, factory: TabsSynchronizationService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(TabsSynchronizationService, [{
        type: Injectable
    }], function () { return [{ type: ConfigurationProvider }, { type: PublicEventsService }, { type: LoggerService }]; }, null); })();

const IFRAME_FOR_SILENT_RENEW_IDENTIFIER = 'myiFrameForSilentRenew';
class SilentRenewService {
    constructor(configurationProvider, iFrameService, flowsService, flowsDataService, authStateService, loggerService, flowHelper, implicitFlowCallbackService, intervallService, tabsSynchronizationService) {
        this.configurationProvider = configurationProvider;
        this.iFrameService = iFrameService;
        this.flowsService = flowsService;
        this.flowsDataService = flowsDataService;
        this.authStateService = authStateService;
        this.loggerService = loggerService;
        this.flowHelper = flowHelper;
        this.implicitFlowCallbackService = implicitFlowCallbackService;
        this.intervallService = intervallService;
        this.tabsSynchronizationService = tabsSynchronizationService;
        this.refreshSessionWithIFrameCompletedInternal$ = new Subject();
    }
    get refreshSessionWithIFrameCompleted$() {
        return this.refreshSessionWithIFrameCompletedInternal$.asObservable();
    }
    getOrCreateIframe() {
        const existingIframe = this.getExistingIframe();
        if (!existingIframe) {
            return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
        }
        return existingIframe;
    }
    isSilentRenewConfigured() {
        return !this.configurationProvider.openIDConfiguration.useRefreshToken && this.configurationProvider.openIDConfiguration.silentRenew;
    }
    codeFlowCallbackSilentRenewIframe(urlParts) {
        const params = new HttpParams({
            fromString: urlParts[1],
        });
        const error = params.get('error');
        if (error) {
            this.authStateService.updateAndPublishAuthState({
                authorizationState: AuthorizedState.Unauthorized,
                validationResult: ValidationResult.LoginRequired,
                isRenewProcess: true,
            });
            this.flowsService.resetAuthorizationData();
            this.flowsDataService.setNonce('');
            this.intervallService.stopPeriodicallTokenCheck();
            return throwError(error);
        }
        const code = params.get('code');
        const state = params.get('state');
        const sessionState = params.get('session_state');
        const callbackContext = {
            code,
            refreshToken: null,
            state,
            sessionState,
            authResult: null,
            isRenewProcess: true,
            jwtKeys: null,
            validationResult: null,
            existingIdToken: null,
        };
        return this.flowsService.processSilentRenewCodeFlowCallback(callbackContext).pipe(catchError((errorFromFlow) => {
            this.intervallService.stopPeriodicallTokenCheck();
            this.flowsService.resetAuthorizationData();
            return throwError(errorFromFlow);
        }));
    }
    silentRenewEventHandler(e) {
        this.loggerService.logDebug('silentRenewEventHandler');
        if (!e.detail) {
            return;
        }
        const urlParts = e.detail.toString().split('?');
        const params = new HttpParams({
            fromString: urlParts[1],
        });
        const stateFromUrl = params.get('state');
        const currentState = this.flowsDataService.getAuthStateControl();
        if (stateFromUrl !== currentState) {
            this.loggerService.logError(`silentRenewEventHandler > states don't match stateFromUrl: ${stateFromUrl} currentState: ${currentState}`);
            return;
        }
        this.tabsSynchronizationService.isLeaderCheck().then((isLeader) => {
            if (!isLeader)
                return;
            let callback$ = of(null);
            const isCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
            if (isCodeFlow) {
                callback$ = this.codeFlowCallbackSilentRenewIframe(urlParts);
            }
            else {
                callback$ = this.implicitFlowCallbackService.authorizedImplicitFlowCallback(e.detail);
            }
            callback$.subscribe((callbackContext) => {
                var _a;
                if (((_a = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.validationResult) === null || _a === void 0 ? void 0 : _a.state) === ValidationResult.StatesDoNotMatch) {
                    this.loggerService.logError(`silentRenewEventHandler > inside subscribe for codeRequestCallback > states don't match stateFromUrl: ${stateFromUrl} currentState: ${currentState}`);
                    return;
                }
                this.refreshSessionWithIFrameCompletedInternal$.next(callbackContext);
                this.flowsDataService.resetSilentRenewRunning();
                this.tabsSynchronizationService.sendSilentRenewFinishedNotification();
            }, (err) => {
                this.loggerService.logError('Error: ' + err);
                this.refreshSessionWithIFrameCompletedInternal$.next(null);
                this.flowsDataService.resetSilentRenewRunning();
            });
        });
    }
    getExistingIframe() {
        return this.iFrameService.getExistingIFrame(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
    }
}
SilentRenewService.ɵfac = function SilentRenewService_Factory(t) { return new (t || SilentRenewService)(ɵɵinject(ConfigurationProvider), ɵɵinject(IFrameService), ɵɵinject(FlowsService), ɵɵinject(FlowsDataService), ɵɵinject(AuthStateService), ɵɵinject(LoggerService), ɵɵinject(FlowHelper), ɵɵinject(ImplicitFlowCallbackService), ɵɵinject(IntervallService), ɵɵinject(TabsSynchronizationService)); };
SilentRenewService.ɵprov = ɵɵdefineInjectable({ token: SilentRenewService, factory: SilentRenewService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(SilentRenewService, [{
        type: Injectable
    }], function () { return [{ type: ConfigurationProvider }, { type: IFrameService }, { type: FlowsService }, { type: FlowsDataService }, { type: AuthStateService }, { type: LoggerService }, { type: FlowHelper }, { type: ImplicitFlowCallbackService }, { type: IntervallService }, { type: TabsSynchronizationService }]; }, null); })();

class CodeFlowCallbackService {
    constructor(flowsService, flowsDataService, intervallService, configurationProvider, router) {
        this.flowsService = flowsService;
        this.flowsDataService = flowsDataService;
        this.intervallService = intervallService;
        this.configurationProvider = configurationProvider;
        this.router = router;
    }
    authorizedCallbackWithCode(urlToCheck) {
        const isRenewProcess = this.flowsDataService.isSilentRenewRunning();
        return this.flowsService.processCodeFlowCallback(urlToCheck).pipe(tap((callbackContext) => {
            if (!this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                this.router.navigate([this.configurationProvider.openIDConfiguration.postLoginRoute]);
            }
        }), catchError((error) => {
            this.flowsDataService.resetSilentRenewRunning();
            this.intervallService.stopPeriodicallTokenCheck();
            if (!this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !isRenewProcess) {
                this.router.navigate([this.configurationProvider.openIDConfiguration.unauthorizedRoute]);
            }
            return throwError(error);
        }));
    }
}
CodeFlowCallbackService.ɵfac = function CodeFlowCallbackService_Factory(t) { return new (t || CodeFlowCallbackService)(ɵɵinject(FlowsService), ɵɵinject(FlowsDataService), ɵɵinject(IntervallService), ɵɵinject(ConfigurationProvider), ɵɵinject(Router)); };
CodeFlowCallbackService.ɵprov = ɵɵdefineInjectable({ token: CodeFlowCallbackService, factory: CodeFlowCallbackService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(CodeFlowCallbackService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: FlowsService }, { type: FlowsDataService }, { type: IntervallService }, { type: ConfigurationProvider }, { type: Router }]; }, null); })();

class CallbackService {
    constructor(urlService, flowHelper, implicitFlowCallbackService, codeFlowCallbackService) {
        this.urlService = urlService;
        this.flowHelper = flowHelper;
        this.implicitFlowCallbackService = implicitFlowCallbackService;
        this.codeFlowCallbackService = codeFlowCallbackService;
        this.stsCallbackInternal$ = new Subject();
    }
    get stsCallback$() {
        return this.stsCallbackInternal$.asObservable();
    }
    isCallback(currentUrl) {
        return this.urlService.isCallbackFromSts(currentUrl);
    }
    handleCallbackAndFireEvents(currentCallbackUrl) {
        let callback$;
        if (this.flowHelper.isCurrentFlowCodeFlow()) {
            callback$ = this.codeFlowCallbackService.authorizedCallbackWithCode(currentCallbackUrl);
        }
        else if (this.flowHelper.isCurrentFlowAnyImplicitFlow()) {
            callback$ = this.implicitFlowCallbackService.authorizedImplicitFlowCallback();
        }
        return callback$.pipe(tap(() => this.stsCallbackInternal$.next()));
    }
}
CallbackService.ɵfac = function CallbackService_Factory(t) { return new (t || CallbackService)(ɵɵinject(UrlService), ɵɵinject(FlowHelper), ɵɵinject(ImplicitFlowCallbackService), ɵɵinject(CodeFlowCallbackService)); };
CallbackService.ɵprov = ɵɵdefineInjectable({ token: CallbackService, factory: CallbackService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(CallbackService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: UrlService }, { type: FlowHelper }, { type: ImplicitFlowCallbackService }, { type: CodeFlowCallbackService }]; }, null); })();

const WELL_KNOWN_SUFFIX = `/.well-known/openid-configuration`;
class AuthWellKnownDataService {
    constructor(http) {
        this.http = http;
    }
    getWellKnownEndPointsFromUrl(authWellknownEndpoint) {
        return this.getWellKnownDocument(authWellknownEndpoint).pipe(map((wellKnownEndpoints) => ({
            issuer: wellKnownEndpoints.issuer,
            jwksUri: wellKnownEndpoints.jwks_uri,
            authorizationEndpoint: wellKnownEndpoints.authorization_endpoint,
            tokenEndpoint: wellKnownEndpoints.token_endpoint,
            userinfoEndpoint: wellKnownEndpoints.userinfo_endpoint,
            endSessionEndpoint: wellKnownEndpoints.end_session_endpoint,
            checkSessionIframe: wellKnownEndpoints.check_session_iframe,
            revocationEndpoint: wellKnownEndpoints.revocation_endpoint,
            introspectionEndpoint: wellKnownEndpoints.introspection_endpoint,
        })));
    }
    getWellKnownDocument(wellKnownEndpoint) {
        let url = wellKnownEndpoint;
        if (!wellKnownEndpoint.includes(WELL_KNOWN_SUFFIX)) {
            url = `${wellKnownEndpoint}${WELL_KNOWN_SUFFIX}`;
        }
        return this.http.get(url);
    }
}
AuthWellKnownDataService.ɵfac = function AuthWellKnownDataService_Factory(t) { return new (t || AuthWellKnownDataService)(ɵɵinject(DataService)); };
AuthWellKnownDataService.ɵprov = ɵɵdefineInjectable({ token: AuthWellKnownDataService, factory: AuthWellKnownDataService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(AuthWellKnownDataService, [{
        type: Injectable
    }], function () { return [{ type: DataService }]; }, null); })();

class AuthWellKnownService {
    constructor(publicEventsService, dataService, storagePersistanceService) {
        this.publicEventsService = publicEventsService;
        this.dataService = dataService;
        this.storagePersistanceService = storagePersistanceService;
    }
    getAuthWellKnownEndPoints(authWellknownEndpoint) {
        const alreadySavedWellKnownEndpoints = this.storagePersistanceService.read('authWellKnownEndPoints');
        if (!!alreadySavedWellKnownEndpoints) {
            return of(alreadySavedWellKnownEndpoints);
        }
        return this.getWellKnownEndPointsFromUrl(authWellknownEndpoint).pipe(tap((mappedWellKnownEndpoints) => this.storeWellKnownEndpoints(mappedWellKnownEndpoints)), catchError((error) => {
            this.publicEventsService.fireEvent(EventTypes.ConfigLoadingFailed, null);
            return throwError(error);
        }));
    }
    storeWellKnownEndpoints(mappedWellKnownEndpoints) {
        this.storagePersistanceService.write('authWellKnownEndPoints', mappedWellKnownEndpoints);
    }
    getWellKnownEndPointsFromUrl(authWellknownEndpoint) {
        return this.dataService.getWellKnownEndPointsFromUrl(authWellknownEndpoint);
    }
}
AuthWellKnownService.ɵfac = function AuthWellKnownService_Factory(t) { return new (t || AuthWellKnownService)(ɵɵinject(PublicEventsService), ɵɵinject(AuthWellKnownDataService), ɵɵinject(StoragePersistanceService)); };
AuthWellKnownService.ɵprov = ɵɵdefineInjectable({ token: AuthWellKnownService, factory: AuthWellKnownService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(AuthWellKnownService, [{
        type: Injectable
    }], function () { return [{ type: PublicEventsService }, { type: AuthWellKnownDataService }, { type: StoragePersistanceService }]; }, null); })();

class RefreshSessionIframeService {
    constructor(doc, loggerService, urlService, silentRenewService, rendererFactory) {
        this.doc = doc;
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.silentRenewService = silentRenewService;
        this.renderer = rendererFactory.createRenderer(null, null);
    }
    refreshSessionWithIframe(customParams, authStateLauchedType) {
        this.loggerService.logDebug('BEGIN refresh session Authorize Iframe renew');
        const url = this.urlService.getRefreshSessionSilentRenewUrl(customParams, authStateLauchedType);
        return this.sendAuthorizeReqestUsingSilentRenew(url);
    }
    sendAuthorizeReqestUsingSilentRenew(url) {
        const sessionIframe = this.silentRenewService.getOrCreateIframe();
        this.initSilentRenewRequest();
        this.loggerService.logDebug('sendAuthorizeReqestUsingSilentRenew for URL:' + url);
        return new Observable((observer) => {
            const onLoadHandler = () => {
                sessionIframe.removeEventListener('load', onLoadHandler);
                this.loggerService.logDebug('removed event listener from IFrame');
                observer.next(true);
                observer.complete();
            };
            sessionIframe.addEventListener('load', onLoadHandler);
            sessionIframe.contentWindow.location.replace(url);
        });
    }
    initSilentRenewRequest() {
        const instanceId = Math.random();
        const initDestroyHandler = this.renderer.listen('window', 'oidc-silent-renew-init', (e) => {
            if (e.detail !== instanceId) {
                initDestroyHandler();
                renewDestroyHandler();
            }
        });
        const renewDestroyHandler = this.renderer.listen('window', 'oidc-silent-renew-message', (e) => this.silentRenewService.silentRenewEventHandler(e));
        this.doc.defaultView.dispatchEvent(new CustomEvent('oidc-silent-renew-init', {
            detail: instanceId,
        }));
    }
}
RefreshSessionIframeService.ɵfac = function RefreshSessionIframeService_Factory(t) { return new (t || RefreshSessionIframeService)(ɵɵinject(DOCUMENT), ɵɵinject(LoggerService), ɵɵinject(UrlService), ɵɵinject(SilentRenewService), ɵɵinject(RendererFactory2)); };
RefreshSessionIframeService.ɵprov = ɵɵdefineInjectable({ token: RefreshSessionIframeService, factory: RefreshSessionIframeService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(RefreshSessionIframeService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: LoggerService }, { type: UrlService }, { type: SilentRenewService }, { type: RendererFactory2 }]; }, null); })();

class RefreshSessionRefreshTokenService {
    constructor(loggerService, flowsService, intervallService) {
        this.loggerService = loggerService;
        this.flowsService = flowsService;
        this.intervallService = intervallService;
    }
    refreshSessionWithRefreshTokens(customParams) {
        this.loggerService.logDebug('BEGIN refresh session Authorize');
        return this.flowsService.processRefreshToken(customParams).pipe(catchError((error) => {
            this.intervallService.stopPeriodicallTokenCheck();
            this.flowsService.resetAuthorizationData();
            return throwError(error);
        }));
    }
}
RefreshSessionRefreshTokenService.ɵfac = function RefreshSessionRefreshTokenService_Factory(t) { return new (t || RefreshSessionRefreshTokenService)(ɵɵinject(LoggerService), ɵɵinject(FlowsService), ɵɵinject(IntervallService)); };
RefreshSessionRefreshTokenService.ɵprov = ɵɵdefineInjectable({ token: RefreshSessionRefreshTokenService, factory: RefreshSessionRefreshTokenService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(RefreshSessionRefreshTokenService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: LoggerService }, { type: FlowsService }, { type: IntervallService }]; }, null); })();

const MAX_RETRY_ATTEMPTS = 3;
class RefreshSessionService {
    constructor(flowHelper, configurationProvider, flowsDataService, loggerService, silentRenewService, authStateService, authWellKnownService, refreshSessionIframeService, refreshSessionRefreshTokenService, tabsSynchronizationService) {
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.flowsDataService = flowsDataService;
        this.loggerService = loggerService;
        this.silentRenewService = silentRenewService;
        this.authStateService = authStateService;
        this.authWellKnownService = authWellKnownService;
        this.refreshSessionIframeService = refreshSessionIframeService;
        this.refreshSessionRefreshTokenService = refreshSessionRefreshTokenService;
        this.tabsSynchronizationService = tabsSynchronizationService;
    }
    forceRefreshSession(customParams) {
        if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
            return this.startRefreshSession(customParams).pipe(map(() => {
                const isAuthenticated = this.authStateService.areAuthStorageTokensValid();
                if (isAuthenticated) {
                    return {
                        idToken: this.authStateService.getIdToken(),
                        accessToken: this.authStateService.getAccessToken(),
                    };
                }
                return null;
            }));
        }
        return this.silentRenewCase();
    }
    silentRenewCase(customParams, currentRetry) {
        this.loggerService.logDebug(`silentRenewCase CURRENT RETRY ATTEMPT #${currentRetry}`);
        if (currentRetry && currentRetry > MAX_RETRY_ATTEMPTS) {
            return throwError(new Error('Initializatin has been failed. Exceeded max retry attepmts.'));
        }
        return from(this.tabsSynchronizationService.isLeaderCheck()).pipe(timeout(2000), take(1), switchMap((isLeader) => {
            if (isLeader) {
                this.loggerService.logDebug(`forceRefreshSession WE ARE LEADER`);
                return forkJoin([
                    this.startRefreshSession(customParams),
                    this.silentRenewService.refreshSessionWithIFrameCompleted$.pipe(take(1)),
                ]).pipe(timeout(5000), map(([_, callbackContext]) => {
                    var _a, _b;
                    const isAuthenticated = this.authStateService.areAuthStorageTokensValid();
                    if (isAuthenticated) {
                        return {
                            idToken: (_a = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult) === null || _a === void 0 ? void 0 : _a.id_token,
                            accessToken: (_b = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult) === null || _b === void 0 ? void 0 : _b.access_token,
                        };
                    }
                    return null;
                }), catchError((error) => {
                    if (error instanceof TimeoutError) {
                        this.loggerService.logWarning(`forceRefreshSession WE ARE LEADER > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)`);
                        if (currentRetry) {
                            currentRetry++;
                        }
                        else {
                            currentRetry = 1;
                        }
                        return this.silentRenewCase(customParams, currentRetry).pipe(take(1));
                    }
                    throw error;
                }));
            }
            else {
                this.loggerService.logDebug(`forceRefreshSession WE ARE NOT NOT NOT LEADER`);
                return this.tabsSynchronizationService.getSilentRenewFinishedObservable().pipe(take(1), timeout(5000), map(() => {
                    const isAuthenticated = this.authStateService.areAuthStorageTokensValid();
                    this.loggerService.logDebug(`forceRefreshSession WE ARE NOT NOT NOT LEADER > getSilentRenewFinishedObservable EMMITS VALUE > isAuthenticated = ${isAuthenticated}`);
                    if (isAuthenticated) {
                        return {
                            idToken: this.authStateService.getIdToken(),
                            accessToken: this.authStateService.getAccessToken(),
                        };
                    }
                    this.loggerService.logError(`forceRefreshSession WE ARE NOT NOT NOT LEADER > getSilentRenewFinishedObservable EMMITS VALUE > isAuthenticated FALSE WE DONT KNOW WAHT TO DO WITH THIS`);
                    return null;
                }), catchError((error) => {
                    if (error instanceof TimeoutError) {
                        this.loggerService.logWarning(`forceRefreshSession WE ARE NOT NOT NOT LEADER > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)`);
                        if (currentRetry) {
                            currentRetry++;
                        }
                        else {
                            currentRetry = 1;
                        }
                        return this.silentRenewCase(customParams, currentRetry).pipe(take(1));
                    }
                    throw error;
                }));
            }
        }), catchError((error) => {
            if (error instanceof TimeoutError) {
                this.loggerService.logWarning(`forceRefreshSession > FROM isLeaderCheck > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)`);
                if (currentRetry) {
                    currentRetry++;
                }
                else {
                    currentRetry = 1;
                }
                return this.silentRenewCase(customParams, currentRetry);
            }
            throw error;
        }));
    }
    startRefreshSession(customParams) {
        var _a;
        const isSilentRenewRunning = this.flowsDataService.isSilentRenewRunning();
        this.loggerService.logDebug(`Checking: silentRenewRunning: ${isSilentRenewRunning}`);
        const shouldBeExecuted = !isSilentRenewRunning;
        if (!shouldBeExecuted) {
            return of(null);
        }
        const authWellknownEndpointAdress = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.authWellknownEndpoint;
        if (!authWellknownEndpointAdress) {
            this.loggerService.logError('no authwellknownendpoint given!');
            return of(null);
        }
        return this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpointAdress).pipe(switchMap(() => {
            this.flowsDataService.setSilentRenewRunning();
            if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                // Refresh Session using Refresh tokens
                return this.refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(customParams);
            }
            return this.refreshSessionIframeService.refreshSessionWithIframe(customParams, 'login');
        }));
    }
}
RefreshSessionService.ɵfac = function RefreshSessionService_Factory(t) { return new (t || RefreshSessionService)(ɵɵinject(FlowHelper), ɵɵinject(ConfigurationProvider), ɵɵinject(FlowsDataService), ɵɵinject(LoggerService), ɵɵinject(SilentRenewService), ɵɵinject(AuthStateService), ɵɵinject(AuthWellKnownService), ɵɵinject(RefreshSessionIframeService), ɵɵinject(RefreshSessionRefreshTokenService), ɵɵinject(TabsSynchronizationService)); };
RefreshSessionService.ɵprov = ɵɵdefineInjectable({ token: RefreshSessionService, factory: RefreshSessionService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(RefreshSessionService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: FlowHelper }, { type: ConfigurationProvider }, { type: FlowsDataService }, { type: LoggerService }, { type: SilentRenewService }, { type: AuthStateService }, { type: AuthWellKnownService }, { type: RefreshSessionIframeService }, { type: RefreshSessionRefreshTokenService }, { type: TabsSynchronizationService }]; }, null); })();

class PeriodicallyTokenCheckService {
    constructor(flowsService, flowHelper, configurationProvider, flowsDataService, loggerService, userService, authStateService, refreshSessionIframeService, refreshSessionRefreshTokenService, intervalService, storagePersistanceService, tabsSynchronizationService) {
        this.flowsService = flowsService;
        this.flowHelper = flowHelper;
        this.configurationProvider = configurationProvider;
        this.flowsDataService = flowsDataService;
        this.loggerService = loggerService;
        this.userService = userService;
        this.authStateService = authStateService;
        this.refreshSessionIframeService = refreshSessionIframeService;
        this.refreshSessionRefreshTokenService = refreshSessionRefreshTokenService;
        this.intervalService = intervalService;
        this.storagePersistanceService = storagePersistanceService;
        this.tabsSynchronizationService = tabsSynchronizationService;
    }
    startTokenValidationPeriodically(repeatAfterSeconds) {
        if (!!this.intervalService.runTokenValidationRunning || !this.configurationProvider.openIDConfiguration.silentRenew) {
            return;
        }
        this.loggerService.logDebug(`starting token validation check every ${repeatAfterSeconds}s`);
        const periodicallyCheck$ = this.intervalService.startPeriodicTokenCheck(repeatAfterSeconds).pipe(switchMap(() => {
            const idToken = this.authStateService.getIdToken();
            const isSilentRenewRunning = this.flowsDataService.isSilentRenewRunning();
            const userDataFromStore = this.userService.getUserDataFromStore();
            this.loggerService.logDebug(`Checking: silentRenewRunning: ${isSilentRenewRunning} id_token: ${!!idToken} userData: ${!!userDataFromStore}`);
            const shouldBeExecuted = userDataFromStore && !isSilentRenewRunning && idToken;
            if (!shouldBeExecuted) {
                return of(null);
            }
            if (this.tabsSynchronizationService.isClosed) {
                this.loggerService.logWarning('startTokenValidationPeriodically > this.tabsSynchronizationService.isClosed = TRUE - so we re-initialize');
                this.tabsSynchronizationService.reInitialize();
            }
            const idTokenHasExpired = this.authStateService.hasIdTokenExpired();
            const accessTokenHasExpired = this.authStateService.hasAccessTokenExpiredIfExpiryExists();
            if (!idTokenHasExpired && !accessTokenHasExpired) {
                return of(null);
            }
            if (!this.configurationProvider.openIDConfiguration.silentRenew) {
                this.flowsService.resetAuthorizationData();
                return of(null);
            }
            this.loggerService.logDebug('starting silent renew...');
            return from(this.tabsSynchronizationService.isLeaderCheck()).pipe(take(1), switchMap((isLeader) => {
                if (isLeader && !this.flowsDataService.isSilentRenewRunning()) {
                    this.flowsDataService.setSilentRenewRunning();
                    // Retrieve Dynamically Set Custom Params
                    const customParams = this.storagePersistanceService.read('storageCustomRequestParams');
                    if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                        // Refresh Session using Refresh tokens
                        return this.refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(customParams);
                    }
                    return this.refreshSessionIframeService.refreshSessionWithIframe(customParams, 'silent-renew-code');
                }
                return of(null);
            }));
        }));
        this.intervalService.runTokenValidationRunning = periodicallyCheck$
            .pipe(catchError(() => {
            this.flowsDataService.resetSilentRenewRunning();
            return throwError('periodically check failed');
        }))
            .subscribe(() => {
            this.loggerService.logDebug('silent renew, periodic check finished!');
            if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                this.flowsDataService.resetSilentRenewRunning();
            }
        }, (err) => {
            this.loggerService.logError('silent renew failed!', err);
        });
    }
}
PeriodicallyTokenCheckService.ɵfac = function PeriodicallyTokenCheckService_Factory(t) { return new (t || PeriodicallyTokenCheckService)(ɵɵinject(FlowsService), ɵɵinject(FlowHelper), ɵɵinject(ConfigurationProvider), ɵɵinject(FlowsDataService), ɵɵinject(LoggerService), ɵɵinject(UserService), ɵɵinject(AuthStateService), ɵɵinject(RefreshSessionIframeService), ɵɵinject(RefreshSessionRefreshTokenService), ɵɵinject(IntervallService), ɵɵinject(StoragePersistanceService), ɵɵinject(TabsSynchronizationService)); };
PeriodicallyTokenCheckService.ɵprov = ɵɵdefineInjectable({ token: PeriodicallyTokenCheckService, factory: PeriodicallyTokenCheckService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(PeriodicallyTokenCheckService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: FlowsService }, { type: FlowHelper }, { type: ConfigurationProvider }, { type: FlowsDataService }, { type: LoggerService }, { type: UserService }, { type: AuthStateService }, { type: RefreshSessionIframeService }, { type: RefreshSessionRefreshTokenService }, { type: IntervallService }, { type: StoragePersistanceService }, { type: TabsSynchronizationService }]; }, null); })();

class PopUpService {
    constructor() {
        this.receivedUrlInternal$ = new Subject();
    }
    get receivedUrl$() {
        return this.receivedUrlInternal$.asObservable();
    }
    isCurrentlyInPopup() {
        return !!window.opener && window.opener !== window;
    }
    openPopUp(url, popupOptions) {
        const optionsToPass = this.getOptions(popupOptions);
        this.popUp = window.open(url, '_blank', optionsToPass);
        const listener = (event) => {
            if (!(event === null || event === void 0 ? void 0 : event.data) || typeof event.data !== 'string') {
                return;
            }
            this.receivedUrlInternal$.next(event.data);
            this.cleanUp(listener);
        };
        window.addEventListener('message', listener, false);
    }
    sendMessageToMainWindow(url) {
        if (window.opener) {
            this.sendMessage(url, window.location.href);
        }
    }
    cleanUp(listener) {
        window.removeEventListener('message', listener, false);
        if (this.popUp) {
            this.popUp.close();
            this.popUp = null;
        }
    }
    sendMessage(url, href) {
        window.opener.postMessage(url, href);
    }
    getOptions(popupOptions) {
        const popupDefaultOptions = { width: 500, height: 500, left: 50, top: 50 };
        const options = Object.assign(Object.assign({}, popupDefaultOptions), (popupOptions || {}));
        return Object.entries(options)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join(',');
    }
}
PopUpService.ɵfac = function PopUpService_Factory(t) { return new (t || PopUpService)(); };
PopUpService.ɵprov = ɵɵdefineInjectable({ token: PopUpService, factory: PopUpService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(PopUpService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();

class CheckAuthService {
    constructor(doc, checkSessionService, silentRenewService, userService, loggerService, configurationProvider, authStateService, callbackService, refreshSessionService, periodicallyTokenCheckService, popupService) {
        this.doc = doc;
        this.checkSessionService = checkSessionService;
        this.silentRenewService = silentRenewService;
        this.userService = userService;
        this.loggerService = loggerService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.callbackService = callbackService;
        this.refreshSessionService = refreshSessionService;
        this.periodicallyTokenCheckService = periodicallyTokenCheckService;
        this.popupService = popupService;
    }
    checkAuth(url) {
        if (!this.configurationProvider.hasValidConfig()) {
            this.loggerService.logError('Please provide a configuration before setting up the module');
            return of(false);
        }
        this.loggerService.logDebug('STS server: ' + this.configurationProvider.openIDConfiguration.stsServer);
        const currentUrl = url || this.doc.defaultView.location.toString();
        if (this.popupService.isCurrentlyInPopup()) {
            this.popupService.sendMessageToMainWindow(currentUrl);
            return of(null);
        }
        const isCallback = this.callbackService.isCallback(currentUrl);
        this.loggerService.logDebug('currentUrl to check auth with: ', currentUrl);
        const callback$ = isCallback ? this.callbackService.handleCallbackAndFireEvents(currentUrl) : of(null);
        return callback$.pipe(map(() => {
            const isAuthenticated = this.authStateService.areAuthStorageTokensValid();
            if (isAuthenticated) {
                this.startCheckSessionAndValidation();
                if (!isCallback) {
                    this.authStateService.setAuthorizedAndFireEvent();
                    this.userService.publishUserDataIfExists();
                }
            }
            this.loggerService.logDebug('checkAuth completed fired events, auth: ' + isAuthenticated);
            return isAuthenticated;
        }), catchError(() => of(false)));
    }
    checkAuthIncludingServer() {
        return this.checkAuth().pipe(switchMap((isAuthenticated) => {
            if (isAuthenticated) {
                return of(isAuthenticated);
            }
            return this.refreshSessionService.forceRefreshSession().pipe(map((result) => !!(result === null || result === void 0 ? void 0 : result.idToken) && !!(result === null || result === void 0 ? void 0 : result.accessToken)), switchMap((isAuth) => {
                if (isAuth) {
                    this.startCheckSessionAndValidation();
                }
                return of(isAuth);
            }));
        }));
    }
    startCheckSessionAndValidation() {
        if (this.checkSessionService.isCheckSessionConfigured()) {
            this.checkSessionService.start();
        }
        this.periodicallyTokenCheckService.startTokenValidationPeriodically(this.configurationProvider.openIDConfiguration.tokenRefreshInSeconds);
        if (this.silentRenewService.isSilentRenewConfigured()) {
            this.silentRenewService.getOrCreateIframe();
        }
    }
}
CheckAuthService.ɵfac = function CheckAuthService_Factory(t) { return new (t || CheckAuthService)(ɵɵinject(DOCUMENT), ɵɵinject(CheckSessionService), ɵɵinject(SilentRenewService), ɵɵinject(UserService), ɵɵinject(LoggerService), ɵɵinject(ConfigurationProvider), ɵɵinject(AuthStateService), ɵɵinject(CallbackService), ɵɵinject(RefreshSessionService), ɵɵinject(PeriodicallyTokenCheckService), ɵɵinject(PopUpService)); };
CheckAuthService.ɵprov = ɵɵdefineInjectable({ token: CheckAuthService, factory: CheckAuthService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(CheckAuthService, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }, { type: CheckSessionService }, { type: SilentRenewService }, { type: UserService }, { type: LoggerService }, { type: ConfigurationProvider }, { type: AuthStateService }, { type: CallbackService }, { type: RefreshSessionService }, { type: PeriodicallyTokenCheckService }, { type: PopUpService }]; }, null); })();

const POSITIVE_VALIDATION_RESULT = {
    result: true,
    messages: [],
    level: null,
};

const ensureClientId = (passedConfig) => {
    if (!passedConfig.clientId) {
        return {
            result: false,
            messages: ['The clientId is required and missing from your config!'],
            level: 'error',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const ensureRedirectRule = (passedConfig) => {
    if (!passedConfig.redirectUrl) {
        return {
            result: false,
            messages: ['The redirectURL is required and missing from your config'],
            level: 'error',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const ensureSilentRenewUrlWhenNoRefreshTokenUsed = (passedConfig) => {
    const usesSilentRenew = passedConfig.silentRenew;
    const usesRefreshToken = passedConfig.useRefreshToken;
    const hasSilentRenewUrl = passedConfig.silentRenewUrl;
    if (usesSilentRenew && !usesRefreshToken && !hasSilentRenewUrl) {
        return {
            result: false,
            messages: ['Please provide a silent renew URL if using renew and not refresh tokens'],
            level: 'error',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const ensureStsServer = (passedConfig) => {
    if (!passedConfig.stsServer) {
        return {
            result: false,
            messages: ['The STS URL MUST be provided in the configuration!'],
            level: 'error',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const useOfflineScopeWithSilentRenew = (passedConfig) => {
    const hasRefreshToken = passedConfig.useRefreshToken;
    const hasSilentRenew = passedConfig.silentRenew;
    const scope = passedConfig.scope || '';
    const hasOfflineScope = scope.split(' ').includes('offline_access');
    if (hasRefreshToken && hasSilentRenew && !hasOfflineScope) {
        return {
            result: false,
            messages: ['When using silent renew and refresh tokens please set the `offline_access` scope'],
            level: 'error',
        };
    }
    return POSITIVE_VALIDATION_RESULT;
};

const allRules = [
    ensureStsServer,
    useOfflineScopeWithSilentRenew,
    ensureRedirectRule,
    ensureClientId,
    ensureSilentRenewUrlWhenNoRefreshTokenUsed,
];

class ConfigValidationService {
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
ConfigValidationService.ɵfac = function ConfigValidationService_Factory(t) { return new (t || ConfigValidationService)(ɵɵinject(LoggerService)); };
ConfigValidationService.ɵprov = ɵɵdefineInjectable({ token: ConfigValidationService, factory: ConfigValidationService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(ConfigValidationService, [{
        type: Injectable
    }], function () { return [{ type: LoggerService }]; }, null); })();

class OidcConfigService {
    constructor(loggerService, publicEventsService, configurationProvider, authWellKnownService, storagePersistanceService, configValidationService) {
        this.loggerService = loggerService;
        this.publicEventsService = publicEventsService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
        this.storagePersistanceService = storagePersistanceService;
        this.configValidationService = configValidationService;
    }
    withConfig(passedConfig, passedAuthWellKnownEndpoints) {
        return new Promise((resolve, reject) => {
            if (!this.configValidationService.validateConfig(passedConfig)) {
                this.loggerService.logError('Validation of config rejected with errors. Config is NOT set.');
                resolve();
            }
            if (!passedConfig.authWellknownEndpoint) {
                passedConfig.authWellknownEndpoint = passedConfig.stsServer;
            }
            const usedConfig = this.configurationProvider.setConfig(passedConfig);
            const alreadyExistingAuthWellKnownEndpoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (!!alreadyExistingAuthWellKnownEndpoints) {
                this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, {
                    configuration: passedConfig,
                    wellknown: alreadyExistingAuthWellKnownEndpoints,
                });
                resolve();
            }
            if (!!passedAuthWellKnownEndpoints) {
                this.authWellKnownService.storeWellKnownEndpoints(passedAuthWellKnownEndpoints);
                this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, {
                    configuration: passedConfig,
                    wellknown: passedAuthWellKnownEndpoints,
                });
                resolve();
            }
            if (usedConfig.eagerLoadAuthWellKnownEndpoints) {
                this.authWellKnownService
                    .getAuthWellKnownEndPoints(usedConfig.authWellknownEndpoint)
                    .pipe(catchError((error) => {
                    this.loggerService.logError('Getting auth well known endpoints failed on start', error);
                    return throwError(error);
                }), tap((wellknownEndPoints) => this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, {
                    configuration: passedConfig,
                    wellknown: wellknownEndPoints,
                })))
                    .subscribe(() => resolve(), () => reject());
            }
            else {
                this.publicEventsService.fireEvent(EventTypes.ConfigLoaded, {
                    configuration: passedConfig,
                    wellknown: null,
                });
                resolve();
            }
        });
    }
}
OidcConfigService.ɵfac = function OidcConfigService_Factory(t) { return new (t || OidcConfigService)(ɵɵinject(LoggerService), ɵɵinject(PublicEventsService), ɵɵinject(ConfigurationProvider), ɵɵinject(AuthWellKnownService), ɵɵinject(StoragePersistanceService), ɵɵinject(ConfigValidationService)); };
OidcConfigService.ɵprov = ɵɵdefineInjectable({ token: OidcConfigService, factory: OidcConfigService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(OidcConfigService, [{
        type: Injectable
    }], function () { return [{ type: LoggerService }, { type: PublicEventsService }, { type: ConfigurationProvider }, { type: AuthWellKnownService }, { type: StoragePersistanceService }, { type: ConfigValidationService }]; }, null); })();

class RedirectService {
    constructor(doc) {
        this.doc = doc;
    }
    redirectTo(url) {
        this.doc.location.href = url;
    }
}
RedirectService.ɵfac = function RedirectService_Factory(t) { return new (t || RedirectService)(ɵɵinject(DOCUMENT)); };
RedirectService.ɵprov = ɵɵdefineInjectable({ token: RedirectService, factory: RedirectService.ɵfac, providedIn: 'root' });
/*@__PURE__*/ (function () { ɵsetClassMetadata(RedirectService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [DOCUMENT]
            }] }]; }, null); })();

class LoginService {
    constructor(loggerService, tokenValidationService, urlService, redirectService, configurationProvider, authWellKnownService, popupService, checkAuthService, userService, authStateService) {
        this.loggerService = loggerService;
        this.tokenValidationService = tokenValidationService;
        this.urlService = urlService;
        this.redirectService = redirectService;
        this.configurationProvider = configurationProvider;
        this.authWellKnownService = authWellKnownService;
        this.popupService = popupService;
        this.checkAuthService = checkAuthService;
        this.userService = userService;
        this.authStateService = authStateService;
    }
    login(authOptions) {
        if (!this.tokenValidationService.hasConfigValidResponseType()) {
            this.loggerService.logError('Invalid response type!');
            return;
        }
        const authWellknownEndpoint = this.configurationProvider.openIDConfiguration.authWellknownEndpoint;
        if (!authWellknownEndpoint) {
            this.loggerService.logError('no authWellknownEndpoint given!');
            return;
        }
        this.loggerService.logDebug('BEGIN Authorize OIDC Flow, no auth data');
        this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpoint).subscribe(() => {
            const { urlHandler, customParams } = authOptions || {};
            const url = this.urlService.getAuthorizeUrl(customParams);
            if (!url) {
                this.loggerService.logError('Could not create url', url);
                return;
            }
            if (urlHandler) {
                urlHandler(url);
            }
            else {
                this.redirectService.redirectTo(url);
            }
        });
    }
    loginWithPopUp(authOptions, popupOptions) {
        if (!this.tokenValidationService.hasConfigValidResponseType()) {
            this.loggerService.logError('Invalid response type!');
            return;
        }
        const authWellknownEndpoint = this.configurationProvider.openIDConfiguration.authWellknownEndpoint;
        if (!authWellknownEndpoint) {
            this.loggerService.logError('no authWellknownEndpoint given!');
            return;
        }
        this.loggerService.logDebug('BEGIN Authorize OIDC Flow with popup, no auth data');
        return this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpoint).pipe(switchMap(() => {
            const { customParams } = authOptions || {};
            const authUrl = this.urlService.getAuthorizeUrl(customParams);
            this.popupService.openPopUp(authUrl, popupOptions);
            return this.popupService.receivedUrl$.pipe(switchMap((url) => this.checkAuthService.checkAuth(url)), map((isAuthenticated) => ({
                isAuthenticated,
                userData: this.userService.getUserDataFromStore(),
                accessToken: this.authStateService.getAccessToken(),
            })));
        }));
    }
}
LoginService.ɵfac = function LoginService_Factory(t) { return new (t || LoginService)(ɵɵinject(LoggerService), ɵɵinject(TokenValidationService), ɵɵinject(UrlService), ɵɵinject(RedirectService), ɵɵinject(ConfigurationProvider), ɵɵinject(AuthWellKnownService), ɵɵinject(PopUpService), ɵɵinject(CheckAuthService), ɵɵinject(UserService), ɵɵinject(AuthStateService)); };
LoginService.ɵprov = ɵɵdefineInjectable({ token: LoginService, factory: LoginService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(LoginService, [{
        type: Injectable
    }], function () { return [{ type: LoggerService }, { type: TokenValidationService }, { type: UrlService }, { type: RedirectService }, { type: ConfigurationProvider }, { type: AuthWellKnownService }, { type: PopUpService }, { type: CheckAuthService }, { type: UserService }, { type: AuthStateService }]; }, null); })();

class LogoffRevocationService {
    constructor(dataService, storagePersistanceService, loggerService, urlService, checkSessionService, flowsService, redirectService, tabsSynchronizationService) {
        this.dataService = dataService;
        this.storagePersistanceService = storagePersistanceService;
        this.loggerService = loggerService;
        this.urlService = urlService;
        this.checkSessionService = checkSessionService;
        this.flowsService = flowsService;
        this.redirectService = redirectService;
        this.tabsSynchronizationService = tabsSynchronizationService;
    }
    // Logs out on the server and the local client.
    // If the server state has changed, checksession, then only a local logout.
    logoff(urlHandler) {
        this.loggerService.logDebug('logoff, remove auth ');
        this.tabsSynchronizationService.closeTabSynchronization();
        const endSessionUrl = this.getEndSessionUrl();
        this.flowsService.resetAuthorizationData();
        if (!endSessionUrl) {
            this.loggerService.logDebug('only local login cleaned up, no end_session_endpoint');
            return;
        }
        if (this.checkSessionService.serverStateChanged()) {
            this.loggerService.logDebug('only local login cleaned up, server session has changed');
        }
        else if (urlHandler) {
            urlHandler(endSessionUrl);
        }
        else {
            this.redirectService.redirectTo(endSessionUrl);
        }
    }
    logoffLocal() {
        this.tabsSynchronizationService.closeTabSynchronization();
        this.flowsService.resetAuthorizationData();
    }
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    logoffAndRevokeTokens(urlHandler) {
        var _a;
        if (!((_a = this.storagePersistanceService.read('authWellKnownEndPoints')) === null || _a === void 0 ? void 0 : _a.revocationEndpoint)) {
            this.loggerService.logDebug('revocation endpoint not supported');
            this.logoff(urlHandler);
        }
        if (this.storagePersistanceService.getRefreshToken()) {
            return this.revokeRefreshToken().pipe(switchMap((result) => this.revokeAccessToken(result)), catchError((error) => {
                const errorMessage = `revoke token failed`;
                this.loggerService.logError(errorMessage, error);
                return throwError(errorMessage);
            }), tap(() => this.logoff(urlHandler)));
        }
        else {
            return this.revokeAccessToken().pipe(catchError((error) => {
                const errorMessage = `revoke access token failed`;
                this.loggerService.logError(errorMessage, error);
                return throwError(errorMessage);
            }), tap(() => this.logoff(urlHandler)));
        }
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. If no token is provided, then the token from
    // the storage is revoked. You can pass any token to revoke. This makes it possible to
    // manage your own tokens. The is a public API.
    revokeAccessToken(accessToken) {
        const accessTok = accessToken || this.storagePersistanceService.getAccessToken();
        const body = this.urlService.createRevocationEndpointBodyAccessToken(accessTok);
        const url = this.urlService.getRevocationEndpointUrl();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError((error) => {
            const errorMessage = `Revocation request failed`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeRefreshToken(refreshToken) {
        const refreshTok = refreshToken || this.storagePersistanceService.getRefreshToken();
        const body = this.urlService.createRevocationEndpointBodyRefreshToken(refreshTok);
        const url = this.urlService.getRevocationEndpointUrl();
        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
        return this.dataService.post(url, body, headers).pipe(switchMap((response) => {
            this.loggerService.logDebug('revocation endpoint post response: ', response);
            return of(response);
        }), catchError((error) => {
            const errorMessage = `Revocation request failed`;
            this.loggerService.logError(errorMessage, error);
            return throwError(errorMessage);
        }));
    }
    getEndSessionUrl() {
        const idToken = this.storagePersistanceService.getIdToken();
        return this.urlService.createEndSessionUrl(idToken);
    }
}
LogoffRevocationService.ɵfac = function LogoffRevocationService_Factory(t) { return new (t || LogoffRevocationService)(ɵɵinject(DataService), ɵɵinject(StoragePersistanceService), ɵɵinject(LoggerService), ɵɵinject(UrlService), ɵɵinject(CheckSessionService), ɵɵinject(FlowsService), ɵɵinject(RedirectService), ɵɵinject(TabsSynchronizationService)); };
LogoffRevocationService.ɵprov = ɵɵdefineInjectable({ token: LogoffRevocationService, factory: LogoffRevocationService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(LogoffRevocationService, [{
        type: Injectable
    }], function () { return [{ type: DataService }, { type: StoragePersistanceService }, { type: LoggerService }, { type: UrlService }, { type: CheckSessionService }, { type: FlowsService }, { type: RedirectService }, { type: TabsSynchronizationService }]; }, null); })();

class OidcSecurityService {
    constructor(checkSessionService, checkAuthService, userService, tokenHelperService, configurationProvider, authStateService, flowsDataService, callbackService, logoffRevocationService, loginService, storagePersistanceService, refreshSessionService) {
        this.checkSessionService = checkSessionService;
        this.checkAuthService = checkAuthService;
        this.userService = userService;
        this.tokenHelperService = tokenHelperService;
        this.configurationProvider = configurationProvider;
        this.authStateService = authStateService;
        this.flowsDataService = flowsDataService;
        this.callbackService = callbackService;
        this.logoffRevocationService = logoffRevocationService;
        this.loginService = loginService;
        this.storagePersistanceService = storagePersistanceService;
        this.refreshSessionService = refreshSessionService;
    }
    get configuration() {
        return {
            configuration: this.configurationProvider.openIDConfiguration,
            wellknown: this.storagePersistanceService.read('authWellKnownEndPoints'),
        };
    }
    get userData$() {
        return this.userService.userData$;
    }
    get isAuthenticated$() {
        return this.authStateService.authorized$;
    }
    get checkSessionChanged$() {
        return this.checkSessionService.checkSessionChanged$;
    }
    get stsCallback$() {
        return this.callbackService.stsCallback$;
    }
    checkAuth(url) {
        return this.checkAuthService.checkAuth(url);
    }
    checkAuthIncludingServer() {
        return this.checkAuthService.checkAuthIncludingServer();
    }
    getToken() {
        return this.authStateService.getAccessToken();
    }
    getIdToken() {
        return this.authStateService.getIdToken();
    }
    getRefreshToken() {
        return this.authStateService.getRefreshToken();
    }
    getPayloadFromIdToken(encode = false) {
        const token = this.getIdToken();
        return this.tokenHelperService.getPayloadFromToken(token, encode);
    }
    setState(state) {
        this.flowsDataService.setAuthStateControl(state);
    }
    getState() {
        return this.flowsDataService.getAuthStateControl();
    }
    // Code Flow with PCKE or Implicit Flow
    authorize(authOptions) {
        if (authOptions === null || authOptions === void 0 ? void 0 : authOptions.customParams) {
            this.storagePersistanceService.write('storageCustomRequestParams', authOptions.customParams);
        }
        this.loginService.login(authOptions);
    }
    authorizeWithPopUp(authOptions) {
        if (authOptions === null || authOptions === void 0 ? void 0 : authOptions.customParams) {
            this.storagePersistanceService.write('storageCustomRequestParams', authOptions.customParams);
        }
        return this.loginService.loginWithPopUp(authOptions);
    }
    forceRefreshSession(customParams) {
        if (customParams) {
            this.storagePersistanceService.write('storageCustomRequestParams', customParams);
        }
        return this.refreshSessionService.forceRefreshSession(customParams);
    }
    // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
    // only the access token is revoked. Then the logout run.
    logoffAndRevokeTokens(urlHandler) {
        return this.logoffRevocationService.logoffAndRevokeTokens(urlHandler);
    }
    // Logs out on the server and the local client.
    // If the server state has changed, checksession, then only a local logout.
    logoff(urlHandler) {
        return this.logoffRevocationService.logoff(urlHandler);
    }
    logoffLocal() {
        return this.logoffRevocationService.logoffLocal();
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes an access token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeAccessToken(accessToken) {
        return this.logoffRevocationService.revokeAccessToken(accessToken);
    }
    // https://tools.ietf.org/html/rfc7009
    // revokes a refresh token on the STS. This is only required in the code flow with refresh tokens.
    // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
    // This makes it possible to manage your own tokens.
    revokeRefreshToken(refreshToken) {
        return this.logoffRevocationService.revokeRefreshToken(refreshToken);
    }
    getEndSessionUrl() {
        return this.logoffRevocationService.getEndSessionUrl();
    }
}
OidcSecurityService.ɵfac = function OidcSecurityService_Factory(t) { return new (t || OidcSecurityService)(ɵɵinject(CheckSessionService), ɵɵinject(CheckAuthService), ɵɵinject(UserService), ɵɵinject(TokenHelperService), ɵɵinject(ConfigurationProvider), ɵɵinject(AuthStateService), ɵɵinject(FlowsDataService), ɵɵinject(CallbackService), ɵɵinject(LogoffRevocationService), ɵɵinject(LoginService), ɵɵinject(StoragePersistanceService), ɵɵinject(RefreshSessionService)); };
OidcSecurityService.ɵprov = ɵɵdefineInjectable({ token: OidcSecurityService, factory: OidcSecurityService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(OidcSecurityService, [{
        type: Injectable
    }], function () { return [{ type: CheckSessionService }, { type: CheckAuthService }, { type: UserService }, { type: TokenHelperService }, { type: ConfigurationProvider }, { type: AuthStateService }, { type: FlowsDataService }, { type: CallbackService }, { type: LogoffRevocationService }, { type: LoginService }, { type: StoragePersistanceService }, { type: RefreshSessionService }]; }, null); })();

class BrowserStorageService {
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
BrowserStorageService.ɵfac = function BrowserStorageService_Factory(t) { return new (t || BrowserStorageService)(ɵɵinject(ConfigurationProvider), ɵɵinject(LoggerService)); };
BrowserStorageService.ɵprov = ɵɵdefineInjectable({ token: BrowserStorageService, factory: BrowserStorageService.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(BrowserStorageService, [{
        type: Injectable
    }], function () { return [{ type: ConfigurationProvider }, { type: LoggerService }]; }, null); })();

class AuthModule {
    static forRoot(token = {}) {
        return {
            ngModule: AuthModule,
            providers: [
                OidcConfigService,
                PublicEventsService,
                FlowHelper,
                OidcSecurityService,
                TokenValidationService,
                PlatformProvider,
                CheckSessionService,
                FlowsDataService,
                FlowsService,
                SilentRenewService,
                ConfigurationProvider,
                LogoffRevocationService,
                UserService,
                RandomService,
                HttpBaseService,
                UrlService,
                AuthStateService,
                SigninKeyDataService,
                StoragePersistanceService,
                TokenHelperService,
                LoggerService,
                IFrameService,
                EqualityService,
                LoginService,
                AuthWellKnownDataService,
                AuthWellKnownService,
                DataService,
                StateValidationService,
                ConfigValidationService,
                CheckAuthService,
                {
                    provide: AbstractSecurityStorage,
                    useClass: token.storage || BrowserStorageService,
                },
                TabsSynchronizationService,
            ],
        };
    }
}
AuthModule.ɵmod = ɵɵdefineNgModule({ type: AuthModule });
AuthModule.ɵinj = ɵɵdefineInjector({ factory: function AuthModule_Factory(t) { return new (t || AuthModule)(); }, imports: [[CommonModule, HttpClientModule]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && ɵɵsetNgModuleScope(AuthModule, { imports: [CommonModule, HttpClientModule] }); })();
/*@__PURE__*/ (function () { ɵsetClassMetadata(AuthModule, [{
        type: NgModule,
        args: [{
                imports: [CommonModule, HttpClientModule],
                declarations: [],
                exports: [],
            }]
    }], null, null); })();

class AuthInterceptor {
    constructor(authStateService, configurationProvider, loggerService) {
        this.authStateService = authStateService;
        this.configurationProvider = configurationProvider;
        this.loggerService = loggerService;
    }
    intercept(req, next) {
        // Ensure we send the token only to routes which are secured
        const { secureRoutes } = this.configurationProvider.openIDConfiguration;
        if (!secureRoutes) {
            this.loggerService.logDebug(`No routes to check configured`);
            return next.handle(req);
        }
        const matchingRoute = secureRoutes.find((x) => req.url.startsWith(x));
        if (!matchingRoute) {
            this.loggerService.logDebug(`Did not find matching route for ${req.url}`);
            return next.handle(req);
        }
        this.loggerService.logDebug(`'${req.url}' matches configured route '${matchingRoute}'`);
        const token = this.authStateService.getAccessToken();
        if (!token) {
            this.loggerService.logDebug(`Wanted to add token to ${req.url} but found no token: '${token}'`);
            return next.handle(req);
        }
        this.loggerService.logDebug(`'${req.url}' matches configured route '${matchingRoute}', adding token`);
        req = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + token),
        });
        return next.handle(req);
    }
}
AuthInterceptor.ɵfac = function AuthInterceptor_Factory(t) { return new (t || AuthInterceptor)(ɵɵinject(AuthStateService), ɵɵinject(ConfigurationProvider), ɵɵinject(LoggerService)); };
AuthInterceptor.ɵprov = ɵɵdefineInjectable({ token: AuthInterceptor, factory: AuthInterceptor.ɵfac });
/*@__PURE__*/ (function () { ɵsetClassMetadata(AuthInterceptor, [{
        type: Injectable
    }], function () { return [{ type: AuthStateService }, { type: ConfigurationProvider }, { type: LoggerService }]; }, null); })();

class JwtKeys {
    constructor() {
        this.keys = [];
    }
}
class JwtKey {
    constructor() {
        this.kty = '';
        this.use = '';
        this.kid = '';
        this.x5t = '';
        this.e = '';
        this.n = '';
        this.x5c = [];
    }
}

// Public classes.

/*
 * Public API Surface of angular-auth-oidc-client
 */

/**
 * Generated bundle index. Do not edit.
 */

export { AbstractSecurityStorage, AuthInterceptor, AuthModule, AuthorizedState, EventTypes, JwtKey, JwtKeys, LogLevel, LoggerService, OidcConfigService, OidcSecurityService, PublicEventsService, StateValidationResult, TokenHelperService, TokenValidationService, ValidationResult };
//# sourceMappingURL=angular-auth-oidc-client.js.map
