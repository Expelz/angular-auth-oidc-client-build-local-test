(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/common/http'), require('@angular/core'), require('rxjs'), require('jsrsasign-reduced'), require('rxjs/operators'), require('common-tags'), require('@angular/router'), require('broadcast-channel')) :
    typeof define === 'function' && define.amd ? define('angular-auth-oidc-client', ['exports', '@angular/common', '@angular/common/http', '@angular/core', 'rxjs', 'jsrsasign-reduced', 'rxjs/operators', 'common-tags', '@angular/router', 'broadcast-channel'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['angular-auth-oidc-client'] = {}, global.ng.common, global.ng.common.http, global.ng.core, global.rxjs, global['jsrsasign-reduced'], global.rxjs.operators, global['common-tags'], global.ng.router, global['broadcast-channel']));
}(this, (function (exports, common, i1, i0, rxjs, jsrsasignReduced, operators, commonTags, i3, broadcastChannel) { 'use strict';

    var HttpBaseService = /** @class */ (function () {
        function HttpBaseService(http) {
            this.http = http;
        }
        HttpBaseService.prototype.get = function (url, params) {
            return this.http.get(url, params);
        };
        HttpBaseService.prototype.post = function (url, body, params) {
            return this.http.post(url, body, params);
        };
        return HttpBaseService;
    }());
    HttpBaseService.ɵfac = function HttpBaseService_Factory(t) { return new (t || HttpBaseService)(i0.ɵɵinject(i1.HttpClient)); };
    HttpBaseService.ɵprov = i0.ɵɵdefineInjectable({ token: HttpBaseService, factory: HttpBaseService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(HttpBaseService, [{
                type: i0.Injectable
            }], function () { return [{ type: i1.HttpClient }]; }, null);
    })();

    var DataService = /** @class */ (function () {
        function DataService(httpClient) {
            this.httpClient = httpClient;
        }
        DataService.prototype.get = function (url, token) {
            var headers = this.prepareHeaders(token);
            return this.httpClient.get(url, {
                headers: headers,
            });
        };
        DataService.prototype.post = function (url, body, headersParams) {
            var headers = headersParams || this.prepareHeaders();
            return this.httpClient.post(url, body, { headers: headers });
        };
        DataService.prototype.prepareHeaders = function (token) {
            var headers = new i1.HttpHeaders();
            headers = headers.set('Accept', 'application/json');
            if (!!token) {
                headers = headers.set('Authorization', 'Bearer ' + decodeURIComponent(token));
            }
            return headers;
        };
        return DataService;
    }());
    DataService.ɵfac = function DataService_Factory(t) { return new (t || DataService)(i0.ɵɵinject(HttpBaseService)); };
    DataService.ɵprov = i0.ɵɵdefineInjectable({ token: DataService, factory: DataService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(DataService, [{
                type: i0.Injectable
            }], function () { return [{ type: HttpBaseService }]; }, null);
    })();

    // eslint-disable-next-line no-shadow
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
    })(exports.EventTypes || (exports.EventTypes = {}));

    /**
     * Implement this class-interface to create a custom storage.
     */
    var AbstractSecurityStorage = /** @class */ (function () {
        function AbstractSecurityStorage() {
        }
        return AbstractSecurityStorage;
    }());
    AbstractSecurityStorage.ɵfac = function AbstractSecurityStorage_Factory(t) { return new (t || AbstractSecurityStorage)(); };
    AbstractSecurityStorage.ɵprov = i0.ɵɵdefineInjectable({ token: AbstractSecurityStorage, factory: AbstractSecurityStorage.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AbstractSecurityStorage, [{
                type: i0.Injectable
            }], null, null);
    })();

    // eslint-disable-next-line no-shadow
    (function (LogLevel) {
        LogLevel[LogLevel["None"] = 0] = "None";
        LogLevel[LogLevel["Debug"] = 1] = "Debug";
        LogLevel[LogLevel["Warn"] = 2] = "Warn";
        LogLevel[LogLevel["Error"] = 3] = "Error";
    })(exports.LogLevel || (exports.LogLevel = {}));

    var DEFAULT_CONFIG = {
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
        logLevel: exports.LogLevel.Warn,
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

    var PlatformProvider = /** @class */ (function () {
        function PlatformProvider(platformId) {
            this.platformId = platformId;
        }
        Object.defineProperty(PlatformProvider.prototype, "isBrowser", {
            get: function () {
                return common.isPlatformBrowser(this.platformId);
            },
            enumerable: false,
            configurable: true
        });
        return PlatformProvider;
    }());
    PlatformProvider.ɵfac = function PlatformProvider_Factory(t) { return new (t || PlatformProvider)(i0.ɵɵinject(i0.PLATFORM_ID)); };
    PlatformProvider.ɵprov = i0.ɵɵdefineInjectable({ token: PlatformProvider, factory: PlatformProvider.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(PlatformProvider, [{
                type: i0.Injectable
            }], function () {
            return [{ type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [i0.PLATFORM_ID]
                        }] }];
        }, null);
    })();

    var ConfigurationProvider = /** @class */ (function () {
        function ConfigurationProvider(platformProvider) {
            this.platformProvider = platformProvider;
        }
        Object.defineProperty(ConfigurationProvider.prototype, "openIDConfiguration", {
            get: function () {
                return this.openIdConfigurationInternal || null;
            },
            enumerable: false,
            configurable: true
        });
        ConfigurationProvider.prototype.hasValidConfig = function () {
            return !!this.openIdConfigurationInternal;
        };
        ConfigurationProvider.prototype.setConfig = function (configuration) {
            this.openIdConfigurationInternal = Object.assign(Object.assign({}, DEFAULT_CONFIG), configuration);
            if (configuration === null || configuration === void 0 ? void 0 : configuration.storage) {
                console.warn("PLEASE NOTE: The storage in the config will be deprecated in future versions:\n                Please pass the custom storage in forRoot() as documented");
            }
            this.setSpecialCases(this.openIdConfigurationInternal);
            return this.openIdConfigurationInternal;
        };
        ConfigurationProvider.prototype.setSpecialCases = function (currentConfig) {
            if (!this.platformProvider.isBrowser) {
                currentConfig.startCheckSession = false;
                currentConfig.silentRenew = false;
                currentConfig.useRefreshToken = false;
            }
        };
        return ConfigurationProvider;
    }());
    ConfigurationProvider.ɵfac = function ConfigurationProvider_Factory(t) { return new (t || ConfigurationProvider)(i0.ɵɵinject(PlatformProvider)); };
    ConfigurationProvider.ɵprov = i0.ɵɵdefineInjectable({ token: ConfigurationProvider, factory: ConfigurationProvider.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(ConfigurationProvider, [{
                type: i0.Injectable
            }], function () { return [{ type: PlatformProvider }]; }, null);
    })();

    var StoragePersistanceService = /** @class */ (function () {
        function StoragePersistanceService(oidcSecurityStorage, configurationProvider) {
            this.oidcSecurityStorage = oidcSecurityStorage;
            this.configurationProvider = configurationProvider;
        }
        StoragePersistanceService.prototype.read = function (key) {
            var keyToRead = this.createKeyWithPrefix(key);
            return this.oidcSecurityStorage.read(keyToRead);
        };
        StoragePersistanceService.prototype.write = function (key, value) {
            var keyToStore = this.createKeyWithPrefix(key);
            this.oidcSecurityStorage.write(keyToStore, value);
        };
        StoragePersistanceService.prototype.remove = function (key) {
            var keyToStore = this.createKeyWithPrefix(key);
            this.oidcSecurityStorage.remove(keyToStore);
        };
        StoragePersistanceService.prototype.resetStorageFlowData = function () {
            this.remove('session_state');
            this.remove('storageSilentRenewRunning');
            this.remove('codeVerifier');
            this.remove('userData');
            this.remove('storageCustomRequestParams');
        };
        StoragePersistanceService.prototype.resetAuthStateInStorage = function () {
            this.remove('authzData');
            this.remove('authnResult');
        };
        StoragePersistanceService.prototype.getAccessToken = function () {
            return this.read('authzData');
        };
        StoragePersistanceService.prototype.getIdToken = function () {
            var _a;
            return (_a = this.read('authnResult')) === null || _a === void 0 ? void 0 : _a.id_token;
        };
        StoragePersistanceService.prototype.getRefreshToken = function () {
            var _a;
            return (_a = this.read('authnResult')) === null || _a === void 0 ? void 0 : _a.refresh_token;
        };
        StoragePersistanceService.prototype.createKeyWithPrefix = function (key) {
            var _a;
            var prefix = ((_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId) || '';
            return prefix + "_" + key;
        };
        return StoragePersistanceService;
    }());
    StoragePersistanceService.ɵfac = function StoragePersistanceService_Factory(t) { return new (t || StoragePersistanceService)(i0.ɵɵinject(AbstractSecurityStorage), i0.ɵɵinject(ConfigurationProvider)); };
    StoragePersistanceService.ɵprov = i0.ɵɵdefineInjectable({ token: StoragePersistanceService, factory: StoragePersistanceService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(StoragePersistanceService, [{
                type: i0.Injectable
            }], function () { return [{ type: AbstractSecurityStorage }, { type: ConfigurationProvider }]; }, null);
    })();

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b)
                if (Object.prototype.hasOwnProperty.call(b, p))
                    d[p] = b[p]; };
        return extendStatics(d, b);
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }
    var __assign = function () {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s)
                    if (Object.prototype.hasOwnProperty.call(s, p))
                        t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __rest(s, e) {
        var t = {};
        for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }
    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
            r = Reflect.decorate(decorators, target, key, desc);
        else
            for (var i = decorators.length - 1; i >= 0; i--)
                if (d = decorators[i])
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }
    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); };
    }
    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
            return Reflect.metadata(metadataKey, metadataValue);
    }
    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    var __createBinding = Object.create ? (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : (function (o, m, k, k2) {
        if (k2 === undefined)
            k2 = k;
        o[k2] = m[k];
    });
    function __exportStar(m, o) {
        for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
                __createBinding(o, m, p);
    }
    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m)
            return m.call(o);
        if (o && typeof o.length === "number")
            return {
                next: function () {
                    if (o && i >= o.length)
                        o = void 0;
                    return { value: o && o[i++], done: !o };
                }
            };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++)
            s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }
    ;
    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }
    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n])
            i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try {
            step(g[n](v));
        }
        catch (e) {
            settle(q[0][3], e);
        } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length)
            resume(q[0][0], q[0][1]); }
    }
    function __asyncDelegator(o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }
    function __asyncValues(o) {
        if (!Symbol.asyncIterator)
            throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function (v) { resolve({ value: v, done: d }); }, reject); }
    }
    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        }
        else {
            cooked.raw = raw;
        }
        return cooked;
    }
    ;
    var __setModuleDefault = Object.create ? (function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function (o, v) {
        o["default"] = v;
    };
    function __importStar(mod) {
        if (mod && mod.__esModule)
            return mod;
        var result = {};
        if (mod != null)
            for (var k in mod)
                if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
                    __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    }
    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }
    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }
    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    var LoggerService = /** @class */ (function () {
        function LoggerService(configurationProvider) {
            this.configurationProvider = configurationProvider;
        }
        LoggerService.prototype.logError = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this.loggingIsTurnedOff()) {
                return;
            }
            if (!!args && args.length) {
                console.error.apply(console, __spread([message], args));
            }
            else {
                console.error(message);
            }
        };
        LoggerService.prototype.logWarning = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!this.logLevelIsSet()) {
                return;
            }
            if (this.loggingIsTurnedOff()) {
                return;
            }
            if (!this.currentLogLevelIsEqualOrSmallerThan(exports.LogLevel.Warn)) {
                return;
            }
            if (!!args && args.length) {
                console.warn.apply(console, __spread([message], args));
            }
            else {
                console.warn(message);
            }
        };
        LoggerService.prototype.logDebug = function (message) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (!this.logLevelIsSet()) {
                return;
            }
            if (this.loggingIsTurnedOff()) {
                return;
            }
            if (!this.currentLogLevelIsEqualOrSmallerThan(exports.LogLevel.Debug)) {
                return;
            }
            if (!!args && args.length) {
                console.log.apply(console, __spread([message], args));
            }
            else {
                console.log(message);
            }
        };
        LoggerService.prototype.currentLogLevelIsEqualOrSmallerThan = function (logLevel) {
            return this.configurationProvider.openIDConfiguration.logLevel <= logLevel;
        };
        LoggerService.prototype.logLevelIsSet = function () {
            var logLevel = (this.configurationProvider.openIDConfiguration || {}).logLevel;
            if (logLevel === null) {
                return false;
            }
            if (logLevel === undefined) {
                return false;
            }
            return true;
        };
        LoggerService.prototype.loggingIsTurnedOff = function () {
            var _a;
            return ((_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.logLevel) === exports.LogLevel.None;
        };
        return LoggerService;
    }());
    LoggerService.ɵfac = function LoggerService_Factory(t) { return new (t || LoggerService)(i0.ɵɵinject(ConfigurationProvider)); };
    LoggerService.ɵprov = i0.ɵɵdefineInjectable({ token: LoggerService, factory: LoggerService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(LoggerService, [{
                type: i0.Injectable
            }], function () { return [{ type: ConfigurationProvider }]; }, null);
    })();

    var PublicEventsService = /** @class */ (function () {
        function PublicEventsService() {
            this.notify = new rxjs.ReplaySubject(1);
        }
        PublicEventsService.prototype.fireEvent = function (type, value) {
            this.notify.next({ type: type, value: value });
        };
        PublicEventsService.prototype.registerForEvents = function () {
            return this.notify.asObservable();
        };
        return PublicEventsService;
    }());
    PublicEventsService.ɵfac = function PublicEventsService_Factory(t) { return new (t || PublicEventsService)(); };
    PublicEventsService.ɵprov = i0.ɵɵdefineInjectable({ token: PublicEventsService, factory: PublicEventsService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(PublicEventsService, [{
                type: i0.Injectable
            }], null, null);
    })();

    var PARTS_OF_TOKEN = 3;
    var TokenHelperService = /** @class */ (function () {
        function TokenHelperService(loggerService) {
            this.loggerService = loggerService;
        }
        TokenHelperService.prototype.getTokenExpirationDate = function (dataIdToken) {
            if (!dataIdToken.hasOwnProperty('exp')) {
                return new Date(new Date().toUTCString());
            }
            var date = new Date(0); // The 0 here is the key, which sets the date to the epoch
            date.setUTCSeconds(dataIdToken.exp);
            return date;
        };
        TokenHelperService.prototype.getHeaderFromToken = function (token, encoded) {
            if (!this.tokenIsValid(token)) {
                return {};
            }
            return this.getPartOfToken(token, 0, encoded);
        };
        TokenHelperService.prototype.getPayloadFromToken = function (token, encoded) {
            if (!this.tokenIsValid(token)) {
                return {};
            }
            return this.getPartOfToken(token, 1, encoded);
        };
        TokenHelperService.prototype.getSignatureFromToken = function (token, encoded) {
            if (!this.tokenIsValid(token)) {
                return {};
            }
            return this.getPartOfToken(token, 2, encoded);
        };
        TokenHelperService.prototype.getPartOfToken = function (token, index, encoded) {
            var partOfToken = this.extractPartOfToken(token, index);
            if (encoded) {
                return partOfToken;
            }
            var result = this.urlBase64Decode(partOfToken);
            return JSON.parse(result);
        };
        TokenHelperService.prototype.urlBase64Decode = function (str) {
            var output = str.replace(/-/g, '+').replace(/_/g, '/');
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
            var decoded = typeof window !== 'undefined' ? window.atob(output) : Buffer.from(output, 'base64').toString('binary');
            try {
                // Going backwards: from bytestream, to percent-encoding, to original string.
                return decodeURIComponent(decoded
                    .split('')
                    .map(function (c) { return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2); })
                    .join(''));
            }
            catch (err) {
                return decoded;
            }
        };
        TokenHelperService.prototype.tokenIsValid = function (token) {
            if (!token) {
                this.loggerService.logError("token '" + token + "' is not valid --> token falsy");
                return false;
            }
            if (!token.includes('.')) {
                this.loggerService.logError("token '" + token + "' is not valid --> no dots included");
                return false;
            }
            var parts = token.split('.');
            if (parts.length !== PARTS_OF_TOKEN) {
                this.loggerService.logError("token '" + token + "' is not valid --> token has to have exactly " + (PARTS_OF_TOKEN - 1) + " dots");
                return false;
            }
            return true;
        };
        TokenHelperService.prototype.extractPartOfToken = function (token, index) {
            return token.split('.')[index];
        };
        return TokenHelperService;
    }());
    TokenHelperService.ɵfac = function TokenHelperService_Factory(t) { return new (t || TokenHelperService)(i0.ɵɵinject(LoggerService)); };
    TokenHelperService.ɵprov = i0.ɵɵdefineInjectable({ token: TokenHelperService, factory: TokenHelperService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(TokenHelperService, [{
                type: i0.Injectable
            }], function () { return [{ type: LoggerService }]; }, null);
    })();

    var FlowHelper = /** @class */ (function () {
        function FlowHelper(configurationProvider) {
            this.configurationProvider = configurationProvider;
        }
        FlowHelper.prototype.isCurrentFlowCodeFlow = function () {
            return this.currentFlowIs('code');
        };
        FlowHelper.prototype.isCurrentFlowAnyImplicitFlow = function () {
            return this.isCurrentFlowImplicitFlowWithAccessToken() || this.isCurrentFlowImplicitFlowWithoutAccessToken();
        };
        FlowHelper.prototype.isCurrentFlowCodeFlowWithRefreshTokens = function () {
            if (this.isCurrentFlowCodeFlow() && this.configurationProvider.openIDConfiguration.useRefreshToken) {
                return true;
            }
            return false;
        };
        FlowHelper.prototype.isCurrentFlowImplicitFlowWithAccessToken = function () {
            return this.currentFlowIs('id_token token');
        };
        FlowHelper.prototype.isCurrentFlowImplicitFlowWithoutAccessToken = function () {
            return this.currentFlowIs('id_token');
        };
        FlowHelper.prototype.currentFlowIs = function (flowTypes) {
            var currentFlow = this.configurationProvider.openIDConfiguration.responseType;
            if (Array.isArray(flowTypes)) {
                return flowTypes.some(function (x) { return currentFlow === x; });
            }
            return currentFlow === flowTypes;
        };
        return FlowHelper;
    }());
    FlowHelper.ɵfac = function FlowHelper_Factory(t) { return new (t || FlowHelper)(i0.ɵɵinject(ConfigurationProvider)); };
    FlowHelper.ɵprov = i0.ɵɵdefineInjectable({ token: FlowHelper, factory: FlowHelper.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(FlowHelper, [{
                type: i0.Injectable
            }], function () { return [{ type: ConfigurationProvider }]; }, null);
    })();

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
    var TokenValidationService = /** @class */ (function () {
        function TokenValidationService(tokenHelperService, flowHelper, loggerService) {
            this.tokenHelperService = tokenHelperService;
            this.flowHelper = flowHelper;
            this.loggerService = loggerService;
            this.keyAlgorithms = ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'PS256', 'PS384', 'PS512'];
        }
        // id_token C7: The current time MUST be before the time represented by the exp Claim
        // (possibly allowing for some small leeway to account for clock skew).
        TokenValidationService.prototype.hasIdTokenExpired = function (token, offsetSeconds) {
            var decoded = this.tokenHelperService.getPayloadFromToken(token, false);
            return !this.validateIdTokenExpNotExpired(decoded, offsetSeconds);
        };
        // id_token C7: The current time MUST be before the time represented by the exp Claim
        // (possibly allowing for some small leeway to account for clock skew).
        TokenValidationService.prototype.validateIdTokenExpNotExpired = function (decodedIdToken, offsetSeconds) {
            var tokenExpirationDate = this.tokenHelperService.getTokenExpirationDate(decodedIdToken);
            offsetSeconds = offsetSeconds || 0;
            if (!tokenExpirationDate) {
                return false;
            }
            var tokenExpirationValue = tokenExpirationDate.valueOf();
            var nowWithOffset = new Date(new Date().toUTCString()).valueOf() + offsetSeconds * 1000;
            var tokenNotExpired = tokenExpirationValue > nowWithOffset;
            this.loggerService.logDebug("Has id_token expired: " + !tokenNotExpired + ", " + tokenExpirationValue + " > " + nowWithOffset);
            // Token not expired?
            return tokenNotExpired;
        };
        TokenValidationService.prototype.validateAccessTokenNotExpired = function (accessTokenExpiresAt, offsetSeconds) {
            // value is optional, so if it does not exist, then it has not expired
            if (!accessTokenExpiresAt) {
                return true;
            }
            offsetSeconds = offsetSeconds || 0;
            var accessTokenExpirationValue = accessTokenExpiresAt.valueOf();
            var nowWithOffset = new Date(new Date().toUTCString()).valueOf() + offsetSeconds * 1000;
            var tokenNotExpired = accessTokenExpirationValue > nowWithOffset;
            this.loggerService.logDebug("Has access_token expired: " + !tokenNotExpired + ", " + accessTokenExpirationValue + " > " + nowWithOffset);
            // access token not expired?
            return tokenNotExpired;
        };
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
        TokenValidationService.prototype.validateRequiredIdToken = function (dataIdToken) {
            var validated = true;
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
        };
        // id_token C8: The iat Claim can be used to reject tokens that were issued too far away from the current time,
        // limiting the amount of time that nonces need to be stored to prevent attacks.The acceptable range is Client specific.
        TokenValidationService.prototype.validateIdTokenIatMaxOffset = function (dataIdToken, maxOffsetAllowedInSeconds, disableIatOffsetValidation) {
            if (disableIatOffsetValidation) {
                return true;
            }
            if (!dataIdToken.hasOwnProperty('iat')) {
                return false;
            }
            var dateTimeIatIdToken = new Date(0); // The 0 here is the key, which sets the date to the epoch
            dateTimeIatIdToken.setUTCSeconds(dataIdToken.iat);
            maxOffsetAllowedInSeconds = maxOffsetAllowedInSeconds || 0;
            var nowInUtc = new Date(new Date().toUTCString());
            var diff = nowInUtc.valueOf() - dateTimeIatIdToken.valueOf();
            var maxOffsetAllowedInMilliseconds = maxOffsetAllowedInSeconds * 1000;
            this.loggerService.logDebug("validate id token iat max offset " + diff + " < " + maxOffsetAllowedInMilliseconds);
            if (diff > 0) {
                return diff < maxOffsetAllowedInMilliseconds;
            }
            return -diff < maxOffsetAllowedInMilliseconds;
        };
        // id_token C9: The value of the nonce Claim MUST be checked to verify that it is the same value as the one
        // that was sent in the Authentication Request.The Client SHOULD check the nonce value for replay attacks.
        // The precise method for detecting replay attacks is Client specific.
        // However the nonce claim SHOULD not be present for the refresh_token grant type
        // https://bitbucket.org/openid/connect/issues/1025/ambiguity-with-how-nonce-is-handled-on
        // The current spec is ambiguous and Keycloak does send it.
        TokenValidationService.prototype.validateIdTokenNonce = function (dataIdToken, localNonce, ignoreNonceAfterRefresh) {
            var isFromRefreshToken = (dataIdToken.nonce === undefined || ignoreNonceAfterRefresh) && localNonce === TokenValidationService.refreshTokenNoncePlaceholder;
            if (!isFromRefreshToken && dataIdToken.nonce !== localNonce) {
                this.loggerService.logDebug('Validate_id_token_nonce failed, dataIdToken.nonce: ' + dataIdToken.nonce + ' local_nonce:' + localNonce);
                return false;
            }
            return true;
        };
        // id_token C1: The Issuer Identifier for the OpenID Provider (which is typically obtained during Discovery)
        // MUST exactly match the value of the iss (issuer) Claim.
        TokenValidationService.prototype.validateIdTokenIss = function (dataIdToken, authWellKnownEndpointsIssuer) {
            if (dataIdToken.iss !== authWellKnownEndpointsIssuer) {
                this.loggerService.logDebug('Validate_id_token_iss failed, dataIdToken.iss: ' +
                    dataIdToken.iss +
                    ' authWellKnownEndpoints issuer:' +
                    authWellKnownEndpointsIssuer);
                return false;
            }
            return true;
        };
        // id_token C2: The Client MUST validate that the aud (audience) Claim contains its client_id value registered at the Issuer identified
        // by the iss (issuer) Claim as an audience.
        // The ID Token MUST be rejected if the ID Token does not list the Client as a valid audience, or if it contains additional audiences
        // not trusted by the Client.
        TokenValidationService.prototype.validateIdTokenAud = function (dataIdToken, aud) {
            if (Array.isArray(dataIdToken.aud)) {
                var result = dataIdToken.aud.includes(aud);
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
        };
        TokenValidationService.prototype.validateIdTokenAzpExistsIfMoreThanOneAud = function (dataIdToken) {
            if (!dataIdToken) {
                return false;
            }
            if (Array.isArray(dataIdToken.aud) && dataIdToken.aud.length > 1 && !dataIdToken.azp) {
                return false;
            }
            return true;
        };
        // If an azp (authorized party) Claim is present, the Client SHOULD verify that its client_id is the Claim Value.
        TokenValidationService.prototype.validateIdTokenAzpValid = function (dataIdToken, clientId) {
            if (!(dataIdToken === null || dataIdToken === void 0 ? void 0 : dataIdToken.azp)) {
                return true;
            }
            if (dataIdToken.azp === clientId) {
                return true;
            }
            return false;
        };
        TokenValidationService.prototype.validateStateFromHashCallback = function (state, localState) {
            if (state !== localState) {
                this.loggerService.logDebug('ValidateStateFromHashCallback failed, state: ' + state + ' local_state:' + localState);
                return false;
            }
            return true;
        };
        // id_token C5: The Client MUST validate the signature of the ID Token according to JWS [JWS] using the algorithm specified in the alg
        // Header Parameter of the JOSE Header.The Client MUST use the keys provided by the Issuer.
        // id_token C6: The alg value SHOULD be RS256. Validation of tokens using other signing algorithms is described in the
        // OpenID Connect Core 1.0 [OpenID.Core] specification.
        TokenValidationService.prototype.validateSignatureIdToken = function (idToken, jwtkeys) {
            var e_1, _a, e_2, _b, e_3, _c;
            if (!jwtkeys || !jwtkeys.keys) {
                return false;
            }
            var headerData = this.tokenHelperService.getHeaderFromToken(idToken, false);
            if (Object.keys(headerData).length === 0 && headerData.constructor === Object) {
                this.loggerService.logWarning('id token has no header data');
                return false;
            }
            var kid = headerData.kid;
            var alg = headerData.alg;
            if (!this.keyAlgorithms.includes(alg)) {
                this.loggerService.logWarning('alg not supported', alg);
                return false;
            }
            var jwtKtyToUse = 'RSA';
            if (alg.charAt(0) === 'E') {
                jwtKtyToUse = 'EC';
            }
            var isValid = false;
            if (!headerData.hasOwnProperty('kid')) {
                // exactly 1 key in the jwtkeys and no kid in the Jose header
                // kty	"RSA" or EC use "sig"
                var amountOfMatchingKeys = 0;
                try {
                    for (var _d = __values(jwtkeys.keys), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var key = _e.value;
                        if (key.kty === jwtKtyToUse && key.use === 'sig') {
                            amountOfMatchingKeys = amountOfMatchingKeys + 1;
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                if (amountOfMatchingKeys === 0) {
                    this.loggerService.logWarning('no keys found, incorrect Signature, validation failed for id_token');
                    return false;
                }
                if (amountOfMatchingKeys > 1) {
                    this.loggerService.logWarning('no ID Token kid claim in JOSE header and multiple supplied in jwks_uri');
                    return false;
                }
                try {
                    for (var _f = __values(jwtkeys.keys), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var key = _g.value;
                        if (key.kty === jwtKtyToUse && key.use === 'sig') {
                            var publickey = jsrsasignReduced.KEYUTIL.getKey(key);
                            isValid = jsrsasignReduced.KJUR.jws.JWS.verify(idToken, publickey, [alg]);
                            if (!isValid) {
                                this.loggerService.logWarning('incorrect Signature, validation failed for id_token');
                            }
                            return isValid;
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            else {
                try {
                    // kid in the Jose header of id_token
                    for (var _h = __values(jwtkeys.keys), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var key = _j.value;
                        if (key.kid === kid) {
                            var publicKey = jsrsasignReduced.KEYUTIL.getKey(key);
                            isValid = jsrsasignReduced.KJUR.jws.JWS.verify(idToken, publicKey, [alg]);
                            if (!isValid) {
                                this.loggerService.logWarning('incorrect Signature, validation failed for id_token');
                            }
                            return isValid;
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_c = _h.return)) _c.call(_h);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
            }
            return isValid;
        };
        TokenValidationService.prototype.hasConfigValidResponseType = function () {
            if (this.flowHelper.isCurrentFlowAnyImplicitFlow()) {
                return true;
            }
            if (this.flowHelper.isCurrentFlowCodeFlow()) {
                return true;
            }
            this.loggerService.logWarning('module configured incorrectly, invalid response_type. Check the responseType in the config');
            return false;
        };
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
        TokenValidationService.prototype.validateIdTokenAtHash = function (accessToken, atHash, idTokenAlg) {
            this.loggerService.logDebug('at_hash from the server:' + atHash);
            // 'sha256' 'sha384' 'sha512'
            var sha = 'sha256';
            if (idTokenAlg.includes('384')) {
                sha = 'sha384';
            }
            else if (idTokenAlg.includes('512')) {
                sha = 'sha512';
            }
            var testData = this.generateAtHash('' + accessToken, sha);
            this.loggerService.logDebug('at_hash client validation not decoded:' + testData);
            if (testData === atHash) {
                return true; // isValid;
            }
            else {
                var testValue = this.generateAtHash('' + decodeURIComponent(accessToken), sha);
                this.loggerService.logDebug('-gen access--' + testValue);
                if (testValue === atHash) {
                    return true; // isValid
                }
            }
            return false;
        };
        TokenValidationService.prototype.generateCodeChallenge = function (codeVerifier) {
            var hash = jsrsasignReduced.KJUR.crypto.Util.hashString(codeVerifier, 'sha256');
            var testData = jsrsasignReduced.hextob64u(hash);
            return testData;
        };
        TokenValidationService.prototype.generateAtHash = function (accessToken, sha) {
            var hash = jsrsasignReduced.KJUR.crypto.Util.hashString(accessToken, sha);
            var first128bits = hash.substr(0, hash.length / 2);
            var testData = jsrsasignReduced.hextob64u(first128bits);
            return testData;
        };
        return TokenValidationService;
    }());
    TokenValidationService.refreshTokenNoncePlaceholder = '--RefreshToken--';
    TokenValidationService.ɵfac = function TokenValidationService_Factory(t) { return new (t || TokenValidationService)(i0.ɵɵinject(TokenHelperService), i0.ɵɵinject(FlowHelper), i0.ɵɵinject(LoggerService)); };
    TokenValidationService.ɵprov = i0.ɵɵdefineInjectable({ token: TokenValidationService, factory: TokenValidationService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(TokenValidationService, [{
                type: i0.Injectable
            }], function () { return [{ type: TokenHelperService }, { type: FlowHelper }, { type: LoggerService }]; }, null);
    })();

    var AuthStateService = /** @class */ (function () {
        function AuthStateService(storagePersistanceService, loggerService, publicEventsService, configurationProvider, tokenValidationService) {
            this.storagePersistanceService = storagePersistanceService;
            this.loggerService = loggerService;
            this.publicEventsService = publicEventsService;
            this.configurationProvider = configurationProvider;
            this.tokenValidationService = tokenValidationService;
            this.authorizedInternal$ = new rxjs.BehaviorSubject(false);
        }
        Object.defineProperty(AuthStateService.prototype, "authorized$", {
            get: function () {
                return this.authorizedInternal$.asObservable();
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(AuthStateService.prototype, "isAuthorized", {
            get: function () {
                return !!this.storagePersistanceService.getAccessToken() && !!this.storagePersistanceService.getIdToken();
            },
            enumerable: false,
            configurable: true
        });
        AuthStateService.prototype.setAuthorizedAndFireEvent = function () {
            this.authorizedInternal$.next(true);
        };
        AuthStateService.prototype.setUnauthorizedAndFireEvent = function () {
            this.storagePersistanceService.resetAuthStateInStorage();
            this.authorizedInternal$.next(false);
        };
        AuthStateService.prototype.updateAndPublishAuthState = function (authorizationResult) {
            this.publicEventsService.fireEvent(exports.EventTypes.NewAuthorizationResult, authorizationResult);
        };
        AuthStateService.prototype.setAuthorizationData = function (accessToken, authResult) {
            this.loggerService.logDebug(accessToken);
            this.loggerService.logDebug('storing the accessToken');
            this.storagePersistanceService.write('authzData', accessToken);
            this.persistAccessTokenExpirationTime(authResult);
            this.setAuthorizedAndFireEvent();
        };
        AuthStateService.prototype.getAccessToken = function () {
            if (!this.isAuthorized) {
                return '';
            }
            var token = this.storagePersistanceService.getAccessToken();
            return this.decodeURIComponentSafely(token);
        };
        AuthStateService.prototype.getIdToken = function () {
            if (!this.isAuthorized) {
                return '';
            }
            var token = this.storagePersistanceService.getIdToken();
            return this.decodeURIComponentSafely(token);
        };
        AuthStateService.prototype.getRefreshToken = function () {
            if (!this.isAuthorized) {
                return '';
            }
            var token = this.storagePersistanceService.getRefreshToken();
            return this.decodeURIComponentSafely(token);
        };
        AuthStateService.prototype.areAuthStorageTokensValid = function () {
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
        };
        AuthStateService.prototype.hasIdTokenExpired = function () {
            var tokenToCheck = this.storagePersistanceService.getIdToken();
            var idTokenExpired = this.tokenValidationService.hasIdTokenExpired(tokenToCheck, this.configurationProvider.openIDConfiguration.renewTimeBeforeTokenExpiresInSeconds);
            if (idTokenExpired) {
                this.publicEventsService.fireEvent(exports.EventTypes.IdTokenExpired, idTokenExpired);
            }
            return idTokenExpired;
        };
        AuthStateService.prototype.hasAccessTokenExpiredIfExpiryExists = function () {
            var accessTokenExpiresIn = this.storagePersistanceService.read('access_token_expires_at');
            var accessTokenHasNotExpired = this.tokenValidationService.validateAccessTokenNotExpired(accessTokenExpiresIn, this.configurationProvider.openIDConfiguration.renewTimeBeforeTokenExpiresInSeconds);
            var hasExpired = !accessTokenHasNotExpired;
            if (hasExpired) {
                this.publicEventsService.fireEvent(exports.EventTypes.TokenExpired, hasExpired);
            }
            return hasExpired;
        };
        AuthStateService.prototype.decodeURIComponentSafely = function (token) {
            if (token) {
                return decodeURIComponent(token);
            }
            else {
                return '';
            }
        };
        AuthStateService.prototype.persistAccessTokenExpirationTime = function (authResult) {
            if (authResult === null || authResult === void 0 ? void 0 : authResult.expires_in) {
                var accessTokenExpiryTime = new Date(new Date().toUTCString()).valueOf() + authResult.expires_in * 1000;
                this.storagePersistanceService.write('access_token_expires_at', accessTokenExpiryTime);
            }
        };
        return AuthStateService;
    }());
    AuthStateService.ɵfac = function AuthStateService_Factory(t) { return new (t || AuthStateService)(i0.ɵɵinject(StoragePersistanceService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(PublicEventsService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(TokenValidationService)); };
    AuthStateService.ɵprov = i0.ɵɵdefineInjectable({ token: AuthStateService, factory: AuthStateService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AuthStateService, [{
                type: i0.Injectable
            }], function () { return [{ type: StoragePersistanceService }, { type: LoggerService }, { type: PublicEventsService }, { type: ConfigurationProvider }, { type: TokenValidationService }]; }, null);
    })();

    var IFrameService = /** @class */ (function () {
        function IFrameService(doc, loggerService) {
            this.doc = doc;
            this.loggerService = loggerService;
        }
        IFrameService.prototype.getExistingIFrame = function (identifier) {
            var iFrameOnParent = this.getIFrameFromParentWindow(identifier);
            if (this.isIFrameElement(iFrameOnParent)) {
                return iFrameOnParent;
            }
            var iFrameOnSelf = this.getIFrameFromWindow(identifier);
            if (this.isIFrameElement(iFrameOnSelf)) {
                return iFrameOnSelf;
            }
            return null;
        };
        IFrameService.prototype.addIFrameToWindowBody = function (identifier) {
            var sessionIframe = this.doc.createElement('iframe');
            sessionIframe.id = identifier;
            sessionIframe.title = identifier;
            this.loggerService.logDebug(sessionIframe);
            sessionIframe.style.display = 'none';
            this.doc.body.appendChild(sessionIframe);
            return sessionIframe;
        };
        IFrameService.prototype.getIFrameFromParentWindow = function (identifier) {
            try {
                var iFrameElement = this.doc.defaultView.parent.document.getElementById(identifier);
                if (this.isIFrameElement(iFrameElement)) {
                    return iFrameElement;
                }
                return null;
            }
            catch (e) {
                return null;
            }
        };
        IFrameService.prototype.getIFrameFromWindow = function (identifier) {
            var iFrameElement = this.doc.getElementById(identifier);
            if (this.isIFrameElement(iFrameElement)) {
                return iFrameElement;
            }
            return null;
        };
        IFrameService.prototype.isIFrameElement = function (element) {
            return !!element && element instanceof HTMLIFrameElement;
        };
        return IFrameService;
    }());
    IFrameService.ɵfac = function IFrameService_Factory(t) { return new (t || IFrameService)(i0.ɵɵinject(common.DOCUMENT), i0.ɵɵinject(LoggerService)); };
    IFrameService.ɵprov = i0.ɵɵdefineInjectable({ token: IFrameService, factory: IFrameService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(IFrameService, [{
                type: i0.Injectable
            }], function () {
            return [{ type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [common.DOCUMENT]
                        }] }, { type: LoggerService }];
        }, null);
    })();

    var IFRAME_FOR_CHECK_SESSION_IDENTIFIER = 'myiFrameForCheckSession';
    // http://openid.net/specs/openid-connect-session-1_0-ID4.html
    var CheckSessionService = /** @class */ (function () {
        function CheckSessionService(storagePersistanceService, loggerService, iFrameService, eventService, configurationProvider, zone) {
            this.storagePersistanceService = storagePersistanceService;
            this.loggerService = loggerService;
            this.iFrameService = iFrameService;
            this.eventService = eventService;
            this.configurationProvider = configurationProvider;
            this.zone = zone;
            this.checkSessionReceived = false;
            this.lastIFrameRefresh = 0;
            this.outstandingMessages = 0;
            this.heartBeatInterval = 15000;
            this.iframeRefreshInterval = 300000;
            this.checkSessionChangedInternal$ = new rxjs.BehaviorSubject(false);
        }
        Object.defineProperty(CheckSessionService.prototype, "checkSessionChanged$", {
            get: function () {
                return this.checkSessionChangedInternal$.asObservable();
            },
            enumerable: false,
            configurable: true
        });
        CheckSessionService.prototype.isCheckSessionConfigured = function () {
            return this.configurationProvider.openIDConfiguration.startCheckSession;
        };
        CheckSessionService.prototype.start = function () {
            if (!!this.scheduledHeartBeatRunning) {
                return;
            }
            var clientId = this.configurationProvider.openIDConfiguration.clientId;
            this.pollServerSession(clientId);
        };
        CheckSessionService.prototype.stop = function () {
            if (!this.scheduledHeartBeatRunning) {
                return;
            }
            this.clearScheduledHeartBeat();
            this.checkSessionReceived = false;
        };
        CheckSessionService.prototype.serverStateChanged = function () {
            return this.configurationProvider.openIDConfiguration.startCheckSession && this.checkSessionReceived;
        };
        CheckSessionService.prototype.getExistingIframe = function () {
            return this.iFrameService.getExistingIFrame(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
        };
        CheckSessionService.prototype.init = function () {
            var _this = this;
            if (this.lastIFrameRefresh + this.iframeRefreshInterval > Date.now()) {
                return rxjs.of(undefined);
            }
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (!authWellKnownEndPoints) {
                this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined. Returning.');
                return rxjs.of();
            }
            var existingIframe = this.getOrCreateIframe();
            var checkSessionIframe = authWellKnownEndPoints.checkSessionIframe;
            if (checkSessionIframe) {
                existingIframe.contentWindow.location.replace(checkSessionIframe);
            }
            else {
                this.loggerService.logWarning('init check session: checkSessionIframe is not configured to run');
            }
            return new rxjs.Observable(function (observer) {
                existingIframe.onload = function () {
                    _this.lastIFrameRefresh = Date.now();
                    observer.next();
                    observer.complete();
                };
            });
        };
        CheckSessionService.prototype.pollServerSession = function (clientId) {
            var _this = this;
            this.outstandingMessages = 0;
            var pollServerSessionRecur = function () {
                _this.init()
                    .pipe(operators.take(1))
                    .subscribe(function () {
                    var _a;
                    var existingIframe = _this.getExistingIframe();
                    if (existingIframe && clientId) {
                        _this.loggerService.logDebug(existingIframe);
                        var sessionState = _this.storagePersistanceService.read('session_state');
                        var authWellKnownEndPoints = _this.storagePersistanceService.read('authWellKnownEndPoints');
                        if (sessionState && (authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.checkSessionIframe)) {
                            var iframeOrigin = (_a = new URL(authWellKnownEndPoints.checkSessionIframe)) === null || _a === void 0 ? void 0 : _a.origin;
                            _this.outstandingMessages++;
                            existingIframe.contentWindow.postMessage(clientId + ' ' + sessionState, iframeOrigin);
                        }
                        else {
                            _this.loggerService.logDebug("OidcSecurityCheckSession pollServerSession session_state is '" + sessionState + "'");
                            _this.loggerService.logDebug("AuthWellKnownEndPoints is '" + JSON.stringify(authWellKnownEndPoints) + "'");
                            _this.checkSessionChangedInternal$.next(true);
                        }
                    }
                    else {
                        _this.loggerService.logWarning('OidcSecurityCheckSession pollServerSession checkSession IFrame does not exist');
                        _this.loggerService.logDebug(clientId);
                        _this.loggerService.logDebug(existingIframe);
                    }
                    // after sending three messages with no response, fail.
                    if (_this.outstandingMessages > 3) {
                        _this.loggerService.logError("OidcSecurityCheckSession not receiving check session response messages.\n                            Outstanding messages: " + _this.outstandingMessages + ". Server unreachable?");
                    }
                    _this.zone.runOutsideAngular(function () {
                        _this.scheduledHeartBeatRunning = setTimeout(function () { return _this.zone.run(pollServerSessionRecur); }, _this.heartBeatInterval);
                    });
                });
            };
            pollServerSessionRecur();
        };
        CheckSessionService.prototype.clearScheduledHeartBeat = function () {
            clearTimeout(this.scheduledHeartBeatRunning);
            this.scheduledHeartBeatRunning = null;
        };
        CheckSessionService.prototype.messageHandler = function (e) {
            var _a;
            var existingIFrame = this.getExistingIframe();
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            var startsWith = !!((_a = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.checkSessionIframe) === null || _a === void 0 ? void 0 : _a.startsWith(e.origin));
            this.outstandingMessages = 0;
            if (existingIFrame && startsWith && e.source === existingIFrame.contentWindow) {
                if (e.data === 'error') {
                    this.loggerService.logWarning('error from checksession messageHandler');
                }
                else if (e.data === 'changed') {
                    this.loggerService.logDebug(e);
                    this.checkSessionReceived = true;
                    this.eventService.fireEvent(exports.EventTypes.CheckSessionReceived, e.data);
                    this.checkSessionChangedInternal$.next(true);
                }
                else {
                    this.eventService.fireEvent(exports.EventTypes.CheckSessionReceived, e.data);
                    this.loggerService.logDebug(e.data + ' from checksession messageHandler');
                }
            }
        };
        CheckSessionService.prototype.bindMessageEventToIframe = function () {
            var iframeMessageEvent = this.messageHandler.bind(this);
            window.addEventListener('message', iframeMessageEvent, false);
        };
        CheckSessionService.prototype.getOrCreateIframe = function () {
            var existingIframe = this.getExistingIframe();
            if (!existingIframe) {
                var frame = this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_CHECK_SESSION_IDENTIFIER);
                this.bindMessageEventToIframe();
                return frame;
            }
            return existingIframe;
        };
        return CheckSessionService;
    }());
    CheckSessionService.ɵfac = function CheckSessionService_Factory(t) { return new (t || CheckSessionService)(i0.ɵɵinject(StoragePersistanceService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(IFrameService), i0.ɵɵinject(PublicEventsService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(i0.NgZone)); };
    CheckSessionService.ɵprov = i0.ɵɵdefineInjectable({ token: CheckSessionService, factory: CheckSessionService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(CheckSessionService, [{
                type: i0.Injectable
            }], function () { return [{ type: StoragePersistanceService }, { type: LoggerService }, { type: IFrameService }, { type: PublicEventsService }, { type: ConfigurationProvider }, { type: i0.NgZone }]; }, null);
    })();

    /* eslint-disable no-shadow */
    (function (AuthorizedState) {
        AuthorizedState["Authorized"] = "Authorized";
        AuthorizedState["Unauthorized"] = "Unauthorized";
        AuthorizedState["Unknown"] = "Unknown";
    })(exports.AuthorizedState || (exports.AuthorizedState = {}));

    /* eslint-disable no-shadow */
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
    })(exports.ValidationResult || (exports.ValidationResult = {}));

    var UriEncoder = /** @class */ (function () {
        function UriEncoder() {
        }
        UriEncoder.prototype.encodeKey = function (key) {
            return encodeURIComponent(key);
        };
        UriEncoder.prototype.encodeValue = function (value) {
            return encodeURIComponent(value);
        };
        UriEncoder.prototype.decodeKey = function (key) {
            return decodeURIComponent(key);
        };
        UriEncoder.prototype.decodeValue = function (value) {
            return decodeURIComponent(value);
        };
        return UriEncoder;
    }());

    var RandomService = /** @class */ (function () {
        function RandomService(doc, loggerService) {
            this.doc = doc;
            this.loggerService = loggerService;
        }
        RandomService.prototype.createRandom = function (requiredLength) {
            if (requiredLength <= 0) {
                return '';
            }
            if (requiredLength > 0 && requiredLength < 7) {
                this.loggerService.logWarning("RandomService called with " + requiredLength + " but 7 chars is the minimum, returning 10 chars");
                requiredLength = 10;
            }
            var length = requiredLength - 6;
            var arr = new Uint8Array((length || length) / 2);
            if (this.getCrypto()) {
                this.getCrypto().getRandomValues(arr);
            }
            return Array.from(arr, this.toHex).join('') + this.randomString(7);
        };
        RandomService.prototype.toHex = function (dec) {
            return ('0' + dec.toString(16)).substr(-2);
        };
        RandomService.prototype.randomString = function (length) {
            var result = '';
            var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var values = new Uint32Array(length);
            if (this.getCrypto()) {
                this.getCrypto().getRandomValues(values);
                for (var i = 0; i < length; i++) {
                    result += characters[values[i] % characters.length];
                }
            }
            return result;
        };
        RandomService.prototype.getCrypto = function () {
            // support for IE,  (window.crypto || window.msCrypto)
            return this.doc.defaultView.crypto || this.doc.defaultView.msCrypto;
        };
        return RandomService;
    }());
    RandomService.ɵfac = function RandomService_Factory(t) { return new (t || RandomService)(i0.ɵɵinject(common.DOCUMENT), i0.ɵɵinject(LoggerService)); };
    RandomService.ɵprov = i0.ɵɵdefineInjectable({ token: RandomService, factory: RandomService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(RandomService, [{
                type: i0.Injectable
            }], function () {
            return [{ type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [common.DOCUMENT]
                        }] }, { type: LoggerService }];
        }, null);
    })();

    var FlowsDataService = /** @class */ (function () {
        function FlowsDataService(storagePersistanceService, randomService, configurationProvider, loggerService) {
            this.storagePersistanceService = storagePersistanceService;
            this.randomService = randomService;
            this.configurationProvider = configurationProvider;
            this.loggerService = loggerService;
        }
        FlowsDataService.prototype.createNonce = function () {
            var nonce = this.randomService.createRandom(40);
            this.setNonce(nonce);
            return nonce;
        };
        FlowsDataService.prototype.setNonce = function (nonce) {
            this.storagePersistanceService.write('authNonce', nonce);
        };
        FlowsDataService.prototype.getAuthStateControlWithoutAnyCheck = function () {
            var json = this.storagePersistanceService.read('authStateControl');
            var storageObject = !!json ? JSON.parse(json) : null;
            this.loggerService.logDebug("getAuthStateControlWithoutAnyCheck > currentTime: " + new Date().toTimeString() + " > storageObject see inner details:", storageObject);
            if (storageObject) {
                this.loggerService.logDebug("getAuthStateControlWithoutAnyCheck > storageObject.lauchedFrom " + storageObject.lauchedFrom + " > STATE SUCCESSFULLY RETURNED " + storageObject.state + " > currentTime: " + new Date().toTimeString());
                return storageObject.state;
            }
            this.loggerService.logWarning("getAuthStateControlWithoutAnyCheck > storageObject IS NULL RETURN FALSE > currentTime: " + new Date().toTimeString());
            return false;
        };
        FlowsDataService.prototype.getAuthStateControl = function (authStateLauchedType) {
            if (authStateLauchedType === void 0) { authStateLauchedType = null; }
            var json = this.storagePersistanceService.read('authStateControl');
            var storageObject = !!json ? JSON.parse(json) : null;
            this.loggerService.logDebug("getAuthStateControl > currentTime: " + new Date().toTimeString() + " > storageObject see inner details:", storageObject);
            if (storageObject) {
                if (authStateLauchedType === 'login' && storageObject.lauchedFrom !== 'login') {
                    this.loggerService.logWarning("getAuthStateControl > STATE SHOULD BE RE-INITIALIZED FOR LOGIN FLOW > currentTime: " + new Date().toTimeString());
                    return false;
                }
                if (storageObject.lauchedFrom === 'silent-renew-code') {
                    this.loggerService.logDebug("getAuthStateControl > STATE LAUNCHED FROM SILENT RENEW: " + storageObject.state + " > storageObject.lauchedFrom " + storageObject.lauchedFrom + " >  currentTime: " + new Date().toTimeString());
                    var dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
                    var currentDateUtc = Date.parse(new Date().toISOString());
                    var elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
                    var isProbablyStuck = elapsedTimeInMilliseconds > this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000;
                    if (isProbablyStuck) {
                        this.loggerService.logWarning('getAuthStateControl -> silent renew process is probably stuck, AuthState will be reset.');
                        this.storagePersistanceService.write('authStateControl', '');
                        return false;
                    }
                }
                this.loggerService.logDebug("getAuthStateControl > storageObject.lauchedFrom " + storageObject.lauchedFrom + " > STATE SUCCESSFULLY RETURNED " + storageObject.state + " > currentTime: " + new Date().toTimeString());
                return storageObject.state;
            }
            this.loggerService.logWarning("getAuthStateControl > storageObject IS NULL RETURN FALSE > currentTime: " + new Date().toTimeString());
            return false;
        };
        FlowsDataService.prototype.setAuthStateControl = function (authStateControl) {
            this.storagePersistanceService.write('authStateControl', authStateControl);
        };
        FlowsDataService.prototype.getExistingOrCreateAuthStateControl = function (authStateLauchedType) {
            var state = this.getAuthStateControl(authStateLauchedType);
            if (!state) {
                state = this.createAuthStateControl(authStateLauchedType);
            }
            return state;
        };
        FlowsDataService.prototype.createAuthStateControl = function (authStateLauchedType) {
            var state = this.randomService.createRandom(40);
            var storageObject = {
                state: state,
                dateOfLaunchedProcessUtc: new Date().toISOString(),
                lauchedFrom: authStateLauchedType,
            };
            this.storagePersistanceService.write('authStateControl', JSON.stringify(storageObject));
            return state;
        };
        FlowsDataService.prototype.setSessionState = function (sessionState) {
            this.storagePersistanceService.write('session_state', sessionState);
        };
        FlowsDataService.prototype.resetStorageFlowData = function () {
            this.storagePersistanceService.resetStorageFlowData();
        };
        FlowsDataService.prototype.getCodeVerifier = function () {
            return this.storagePersistanceService.read('codeVerifier');
        };
        FlowsDataService.prototype.createCodeVerifier = function () {
            var codeVerifier = this.randomService.createRandom(67);
            this.storagePersistanceService.write('codeVerifier', codeVerifier);
            return codeVerifier;
        };
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
        FlowsDataService.prototype.setSilentRenewRunning = function () {
            var storageObject = {
                state: 'running',
                dateOfLaunchedProcessUtc: new Date().toISOString(),
            };
            this.storagePersistanceService.write('storageSilentRenewRunning', JSON.stringify(storageObject));
        };
        FlowsDataService.prototype.resetSilentRenewRunning = function () {
            this.storagePersistanceService.write('storageSilentRenewRunning', '');
        };
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
        FlowsDataService.prototype.isSilentRenewRunning = function () {
            var json = this.storagePersistanceService.read('storageSilentRenewRunning');
            var storageObject = !!json ? JSON.parse(json) : null;
            if (storageObject) {
                var dateOfLaunchedProcessUtc = Date.parse(storageObject.dateOfLaunchedProcessUtc);
                var currentDateUtc = Date.parse(new Date().toISOString());
                var elapsedTimeInMilliseconds = Math.abs(currentDateUtc - dateOfLaunchedProcessUtc);
                var isProbablyStuck = elapsedTimeInMilliseconds > this.configurationProvider.openIDConfiguration.silentRenewTimeoutInSeconds * 1000;
                if (isProbablyStuck) {
                    this.loggerService.logDebug('silent renew process is probably stuck, state will be reset.');
                    this.resetSilentRenewRunning();
                    return false;
                }
                this.loggerService.logDebug("isSilentRenewRunning > currentTime: " + new Date().toTimeString());
                return storageObject.state === 'running';
            }
            return false;
        };
        return FlowsDataService;
    }());
    FlowsDataService.ɵfac = function FlowsDataService_Factory(t) { return new (t || FlowsDataService)(i0.ɵɵinject(StoragePersistanceService), i0.ɵɵinject(RandomService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(LoggerService)); };
    FlowsDataService.ɵprov = i0.ɵɵdefineInjectable({ token: FlowsDataService, factory: FlowsDataService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(FlowsDataService, [{
                type: i0.Injectable
            }], function () { return [{ type: StoragePersistanceService }, { type: RandomService }, { type: ConfigurationProvider }, { type: LoggerService }]; }, null);
    })();

    var CALLBACK_PARAMS_TO_CHECK = ['code', 'state', 'token', 'id_token'];
    var UrlService = /** @class */ (function () {
        function UrlService(configurationProvider, loggerService, flowsDataService, flowHelper, tokenValidationService, storagePersistanceService) {
            this.configurationProvider = configurationProvider;
            this.loggerService = loggerService;
            this.flowsDataService = flowsDataService;
            this.flowHelper = flowHelper;
            this.tokenValidationService = tokenValidationService;
            this.storagePersistanceService = storagePersistanceService;
        }
        UrlService.prototype.getUrlParameter = function (urlToCheck, name) {
            if (!urlToCheck) {
                return '';
            }
            if (!name) {
                return '';
            }
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(urlToCheck);
            return results === null ? '' : decodeURIComponent(results[1]);
        };
        UrlService.prototype.isCallbackFromSts = function (currentUrl) {
            var _this = this;
            var anyParameterIsGiven = CALLBACK_PARAMS_TO_CHECK.some(function (x) { return !!_this.getUrlParameter(currentUrl, x); });
            return anyParameterIsGiven;
        };
        UrlService.prototype.getRefreshSessionSilentRenewUrl = function (customParams, authStateLauchedType) {
            if (this.flowHelper.isCurrentFlowCodeFlow()) {
                return this.createUrlCodeFlowWithSilentRenew(customParams, authStateLauchedType);
            }
            return this.createUrlImplicitFlowWithSilentRenew(customParams) || '';
        };
        UrlService.prototype.getAuthorizeUrl = function (customParams) {
            if (this.flowHelper.isCurrentFlowCodeFlow()) {
                return this.createUrlCodeFlowAuthorize(customParams);
            }
            return this.createUrlImplicitFlowAuthorize(customParams) || '';
        };
        UrlService.prototype.createEndSessionUrl = function (idTokenHint) {
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            var endSessionEndpoint = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.endSessionEndpoint;
            if (!endSessionEndpoint) {
                return null;
            }
            var urlParts = endSessionEndpoint.split('?');
            var authorizationEndsessionUrl = urlParts[0];
            var params = new i1.HttpParams({
                fromString: urlParts[1],
                encoder: new UriEncoder(),
            });
            params = params.set('id_token_hint', idTokenHint);
            var postLogoutRedirectUri = this.getPostLogoutRedirectUrl();
            if (postLogoutRedirectUri) {
                params = params.append('post_logout_redirect_uri', postLogoutRedirectUri);
            }
            return authorizationEndsessionUrl + "?" + params;
        };
        UrlService.prototype.createRevocationEndpointBodyAccessToken = function (token) {
            var clientId = this.getClientId();
            if (!clientId) {
                return null;
            }
            return "client_id=" + clientId + "&token=" + token + "&token_type_hint=access_token";
        };
        UrlService.prototype.createRevocationEndpointBodyRefreshToken = function (token) {
            var clientId = this.getClientId();
            if (!clientId) {
                return null;
            }
            return "client_id=" + clientId + "&token=" + token + "&token_type_hint=refresh_token";
        };
        UrlService.prototype.getRevocationEndpointUrl = function () {
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            var revocationEndpoint = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.revocationEndpoint;
            if (!revocationEndpoint) {
                return null;
            }
            var urlParts = revocationEndpoint.split('?');
            var revocationEndpointUrl = urlParts[0];
            return revocationEndpointUrl;
        };
        UrlService.prototype.createBodyForCodeFlowCodeRequest = function (code) {
            var codeVerifier = this.flowsDataService.getCodeVerifier();
            if (!codeVerifier) {
                this.loggerService.logError("CodeVerifier is not set ", codeVerifier);
                return null;
            }
            var clientId = this.getClientId();
            if (!clientId) {
                return null;
            }
            var dataForBody = commonTags.oneLineTrim(templateObject_1 || (templateObject_1 = __makeTemplateObject(["grant_type=authorization_code\n            &client_id=", "\n            &code_verifier=", "\n            &code=", ""], ["grant_type=authorization_code\n            &client_id=", "\n            &code_verifier=", "\n            &code=", ""])), clientId, codeVerifier, code);
            var silentRenewUrl = this.getSilentRenewUrl();
            if (this.flowsDataService.isSilentRenewRunning() && silentRenewUrl) {
                return commonTags.oneLineTrim(templateObject_2 || (templateObject_2 = __makeTemplateObject(["", "&redirect_uri=", ""], ["", "&redirect_uri=", ""])), dataForBody, silentRenewUrl);
            }
            var redirectUrl = this.getRedirectUrl();
            if (!redirectUrl) {
                return null;
            }
            return commonTags.oneLineTrim(templateObject_3 || (templateObject_3 = __makeTemplateObject(["", "&redirect_uri=", ""], ["", "&redirect_uri=", ""])), dataForBody, redirectUrl);
        };
        UrlService.prototype.createBodyForCodeFlowCodeRequestOnlyForSilentRenew = function (code) {
            var codeVerifier = this.flowsDataService.getCodeVerifier();
            if (!codeVerifier) {
                this.loggerService.logError("CodeVerifier is not set ", codeVerifier);
                return null;
            }
            var clientId = this.getClientId();
            if (!clientId) {
                return null;
            }
            var dataForBody = commonTags.oneLineTrim(templateObject_4 || (templateObject_4 = __makeTemplateObject(["grant_type=authorization_code\n            &client_id=", "\n            &code_verifier=", "\n            &code=", ""], ["grant_type=authorization_code\n            &client_id=", "\n            &code_verifier=", "\n            &code=", ""])), clientId, codeVerifier, code);
            var silentRenewUrl = this.getSilentRenewUrl();
            var body = commonTags.oneLineTrim(templateObject_5 || (templateObject_5 = __makeTemplateObject(["", "&redirect_uri=", ""], ["", "&redirect_uri=", ""])), dataForBody, silentRenewUrl);
            this.loggerService.logDebug("From createBodyForCodeFlowCodeRequestOnlyForSilentRenew BODY IS: ", body);
            return body;
        };
        UrlService.prototype.createBodyForCodeFlowRefreshTokensRequest = function (refreshtoken, customParams) {
            var e_1, _b;
            var clientId = this.getClientId();
            if (!clientId) {
                return null;
            }
            var dataForBody = commonTags.oneLineTrim(templateObject_6 || (templateObject_6 = __makeTemplateObject(["grant_type=refresh_token\n            &client_id=", "\n            &refresh_token=", ""], ["grant_type=refresh_token\n            &client_id=", "\n            &refresh_token=", ""])), clientId, refreshtoken);
            if (customParams) {
                var customParamsToAdd = Object.assign({}, (customParams || {}));
                try {
                    for (var _c = __values(Object.entries(customParamsToAdd)), _d = _c.next(); !_d.done; _d = _c.next()) {
                        var _e = __read(_d.value, 2), key = _e[0], value = _e[1];
                        dataForBody = dataForBody.concat("&" + key + "=" + value.toString());
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_d && !_d.done && (_b = _c.return)) _b.call(_c);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return dataForBody;
        };
        UrlService.prototype.createAuthorizeUrl = function (codeChallenge, redirectUrl, nonce, state, prompt, customRequestParams) {
            var e_2, _b;
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            var authorizationEndpoint = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.authorizationEndpoint;
            if (!authorizationEndpoint) {
                this.loggerService.logError("Can not create an authorize url when authorizationEndpoint is '" + authorizationEndpoint + "'");
                return null;
            }
            var _c = this.configurationProvider.openIDConfiguration, clientId = _c.clientId, responseType = _c.responseType, scope = _c.scope, hdParam = _c.hdParam, customParams = _c.customParams;
            if (!clientId) {
                this.loggerService.logError("createAuthorizeUrl could not add clientId because it was: ", clientId);
                return null;
            }
            if (!responseType) {
                this.loggerService.logError("createAuthorizeUrl could not add responseType because it was: ", responseType);
                return null;
            }
            if (!scope) {
                this.loggerService.logError("createAuthorizeUrl could not add scope because it was: ", scope);
                return null;
            }
            var urlParts = authorizationEndpoint.split('?');
            var authorizationUrl = urlParts[0];
            var params = new i1.HttpParams({
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
                var customParamsToAdd = Object.assign(Object.assign({}, (customParams || {})), (customRequestParams || {}));
                try {
                    for (var _d = __values(Object.entries(customParamsToAdd)), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var _f = __read(_e.value, 2), key = _f[0], value = _f[1];
                        params = params.append(key, value.toString());
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_b = _d.return)) _b.call(_d);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            return authorizationUrl + "?" + params;
        };
        UrlService.prototype.createUrlImplicitFlowWithSilentRenew = function (customParams) {
            var state = this.flowsDataService.getExistingOrCreateAuthStateControl('silent-renew-code');
            var nonce = this.flowsDataService.createNonce();
            var silentRenewUrl = this.getSilentRenewUrl();
            if (!silentRenewUrl) {
                return null;
            }
            this.loggerService.logDebug('RefreshSession created. adding myautostate: ', state);
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (authWellKnownEndPoints) {
                return this.createAuthorizeUrl('', silentRenewUrl, nonce, state, 'none', customParams);
            }
            this.loggerService.logError('authWellKnownEndpoints is undefined');
            return null;
        };
        UrlService.prototype.createUrlCodeFlowWithSilentRenew = function (customParams, authStateLauchedType) {
            var state = authStateLauchedType === 'login'
                ? this.flowsDataService.getExistingOrCreateAuthStateControl(authStateLauchedType)
                : this.flowsDataService.createAuthStateControl(authStateLauchedType);
            var nonce = this.flowsDataService.createNonce();
            this.loggerService.logDebug('RefreshSession created. adding myautostate: ' + state);
            // code_challenge with "S256"
            var codeVerifier = this.flowsDataService.createCodeVerifier();
            var codeChallenge = this.tokenValidationService.generateCodeChallenge(codeVerifier);
            var silentRenewUrl = this.getSilentRenewUrl();
            if (!silentRenewUrl) {
                return null;
            }
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (authWellKnownEndPoints) {
                return this.createAuthorizeUrl(codeChallenge, silentRenewUrl, nonce, state, 'none', customParams);
            }
            this.loggerService.logWarning('authWellKnownEndpoints is undefined');
            return null;
        };
        UrlService.prototype.createUrlImplicitFlowAuthorize = function (customParams) {
            var state = this.flowsDataService.getExistingOrCreateAuthStateControl('login');
            var nonce = this.flowsDataService.createNonce();
            this.loggerService.logDebug('Authorize created. adding myautostate: ' + state);
            var redirectUrl = this.getRedirectUrl();
            if (!redirectUrl) {
                return null;
            }
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (authWellKnownEndPoints) {
                return this.createAuthorizeUrl('', redirectUrl, nonce, state, null, customParams);
            }
            this.loggerService.logError('authWellKnownEndpoints is undefined');
            return null;
        };
        UrlService.prototype.createUrlCodeFlowAuthorize = function (customParams) {
            var state = this.flowsDataService.getExistingOrCreateAuthStateControl('login');
            var nonce = this.flowsDataService.createNonce();
            this.loggerService.logDebug('Authorize created. adding myautostate: ' + state);
            var redirectUrl = this.getRedirectUrl();
            if (!redirectUrl) {
                return null;
            }
            // code_challenge with "S256"
            var codeVerifier = this.flowsDataService.createCodeVerifier();
            var codeChallenge = this.tokenValidationService.generateCodeChallenge(codeVerifier);
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (authWellKnownEndPoints) {
                return this.createAuthorizeUrl(codeChallenge, redirectUrl, nonce, state, null, customParams);
            }
            this.loggerService.logError('authWellKnownEndpoints is undefined');
            return null;
        };
        UrlService.prototype.getRedirectUrl = function () {
            var _a;
            var redirectUrl = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.redirectUrl;
            if (!redirectUrl) {
                this.loggerService.logError("could not get redirectUrl, was: ", redirectUrl);
                return null;
            }
            return redirectUrl;
        };
        UrlService.prototype.getSilentRenewUrl = function () {
            var _a;
            var silentRenewUrl = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.silentRenewUrl;
            if (!silentRenewUrl) {
                this.loggerService.logError("could not get silentRenewUrl, was: ", silentRenewUrl);
                return null;
            }
            return silentRenewUrl;
        };
        UrlService.prototype.getPostLogoutRedirectUrl = function () {
            var _a;
            var postLogoutRedirectUri = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.postLogoutRedirectUri;
            if (!postLogoutRedirectUri) {
                this.loggerService.logError("could not get postLogoutRedirectUri, was: ", postLogoutRedirectUri);
                return null;
            }
            return postLogoutRedirectUri;
        };
        UrlService.prototype.getClientId = function () {
            var _a;
            var clientId = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId;
            if (!clientId) {
                this.loggerService.logError("could not get clientId, was: ", clientId);
                return null;
            }
            return clientId;
        };
        return UrlService;
    }());
    UrlService.ɵfac = function UrlService_Factory(t) { return new (t || UrlService)(i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(LoggerService), i0.ɵɵinject(FlowsDataService), i0.ɵɵinject(FlowHelper), i0.ɵɵinject(TokenValidationService), i0.ɵɵinject(StoragePersistanceService)); };
    UrlService.ɵprov = i0.ɵɵdefineInjectable({ token: UrlService, factory: UrlService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(UrlService, [{
                type: i0.Injectable
            }], function () { return [{ type: ConfigurationProvider }, { type: LoggerService }, { type: FlowsDataService }, { type: FlowHelper }, { type: TokenValidationService }, { type: StoragePersistanceService }]; }, null);
    })();
    var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6;

    var SigninKeyDataService = /** @class */ (function () {
        function SigninKeyDataService(storagePersistanceService, loggerService, dataService) {
            this.storagePersistanceService = storagePersistanceService;
            this.loggerService = loggerService;
            this.dataService = dataService;
        }
        SigninKeyDataService.prototype.getSigningKeys = function () {
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            var jwksUri = authWellKnownEndPoints === null || authWellKnownEndPoints === void 0 ? void 0 : authWellKnownEndPoints.jwksUri;
            if (!jwksUri) {
                var error = "getSigningKeys: authWellKnownEndpoints.jwksUri is: '" + jwksUri + "'";
                this.loggerService.logWarning(error);
                return rxjs.throwError(error);
            }
            this.loggerService.logDebug('Getting signinkeys from ', jwksUri);
            return this.dataService.get(jwksUri).pipe(operators.catchError(this.handleErrorGetSigningKeys));
        };
        SigninKeyDataService.prototype.handleErrorGetSigningKeys = function (errorResponse) {
            var errMsg = '';
            if (errorResponse instanceof i1.HttpResponse) {
                var body = errorResponse.body || {};
                var err = JSON.stringify(body);
                var status = errorResponse.status, statusText = errorResponse.statusText;
                errMsg = (status || '') + " - " + (statusText || '') + " " + (err || '');
            }
            else {
                var message = errorResponse.message;
                errMsg = !!message ? message : "" + errorResponse;
            }
            this.loggerService.logError(errMsg);
            return rxjs.throwError(new Error(errMsg));
        };
        return SigninKeyDataService;
    }());
    SigninKeyDataService.ɵfac = function SigninKeyDataService_Factory(t) { return new (t || SigninKeyDataService)(i0.ɵɵinject(StoragePersistanceService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(DataService)); };
    SigninKeyDataService.ɵprov = i0.ɵɵdefineInjectable({ token: SigninKeyDataService, factory: SigninKeyDataService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(SigninKeyDataService, [{
                type: i0.Injectable
            }], function () { return [{ type: StoragePersistanceService }, { type: LoggerService }, { type: DataService }]; }, null);
    })();

    var UserService = /** @class */ (function () {
        function UserService(oidcDataService, storagePersistanceService, eventService, loggerService, tokenHelperService, flowHelper, configurationProvider) {
            this.oidcDataService = oidcDataService;
            this.storagePersistanceService = storagePersistanceService;
            this.eventService = eventService;
            this.loggerService = loggerService;
            this.tokenHelperService = tokenHelperService;
            this.flowHelper = flowHelper;
            this.configurationProvider = configurationProvider;
            this.userDataInternal$ = new rxjs.BehaviorSubject(null);
        }
        Object.defineProperty(UserService.prototype, "userData$", {
            get: function () {
                return this.userDataInternal$.asObservable();
            },
            enumerable: false,
            configurable: true
        });
        // TODO CHECK PARAMETERS
        //  validationResult.idToken can be the complete valudationResult
        UserService.prototype.getAndPersistUserDataInStore = function (isRenewProcess, idToken, decodedIdToken) {
            var _this = this;
            if (isRenewProcess === void 0) { isRenewProcess = false; }
            idToken = idToken || this.storagePersistanceService.getIdToken();
            decodedIdToken = decodedIdToken || this.tokenHelperService.getPayloadFromToken(idToken, false);
            var existingUserDataFromStorage = this.getUserDataFromStore();
            var haveUserData = !!existingUserDataFromStorage;
            var isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
            var isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
            var accessToken = this.storagePersistanceService.getAccessToken();
            if (!(isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow)) {
                this.loggerService.logDebug('authorizedCallback id_token flow');
                this.loggerService.logDebug('accessToken', accessToken);
                this.setUserDataToStore(decodedIdToken);
                return rxjs.of(decodedIdToken);
            }
            if (!isRenewProcess || this.configurationProvider.openIDConfiguration.renewUserInfoAfterTokenRenew || !haveUserData) {
                return this.getUserDataOidcFlowAndSave(decodedIdToken.sub).pipe(operators.switchMap(function (userData) {
                    _this.loggerService.logDebug('Received user data', userData);
                    if (!!userData) {
                        _this.loggerService.logDebug('accessToken', accessToken);
                        return rxjs.of(userData);
                    }
                    else {
                        return rxjs.throwError('no user data, request failed');
                    }
                }));
            }
            return rxjs.of(existingUserDataFromStorage);
        };
        UserService.prototype.getUserDataFromStore = function () {
            return this.storagePersistanceService.read('userData') || null;
        };
        UserService.prototype.publishUserDataIfExists = function () {
            var userData = this.getUserDataFromStore();
            if (userData) {
                this.userDataInternal$.next(userData);
                this.eventService.fireEvent(exports.EventTypes.UserDataChanged, userData);
            }
        };
        UserService.prototype.setUserDataToStore = function (value) {
            this.storagePersistanceService.write('userData', value);
            this.userDataInternal$.next(value);
            this.eventService.fireEvent(exports.EventTypes.UserDataChanged, value);
        };
        UserService.prototype.resetUserDataInStore = function () {
            this.storagePersistanceService.remove('userData');
            this.eventService.fireEvent(exports.EventTypes.UserDataChanged, null);
            this.userDataInternal$.next(null);
        };
        UserService.prototype.getUserDataOidcFlowAndSave = function (idTokenSub) {
            var _this = this;
            return this.getIdentityUserData().pipe(operators.map(function (data) {
                if (_this.validateUserDataSubIdToken(idTokenSub, data === null || data === void 0 ? void 0 : data.sub)) {
                    _this.setUserDataToStore(data);
                    return data;
                }
                else {
                    // something went wrong, userdata sub does not match that from id_token
                    _this.loggerService.logWarning('authorizedCallback, User data sub does not match sub in id_token');
                    _this.loggerService.logDebug('authorizedCallback, token(s) validation failed, resetting');
                    _this.resetUserDataInStore();
                    return null;
                }
            }));
        };
        UserService.prototype.getIdentityUserData = function () {
            var token = this.storagePersistanceService.getAccessToken();
            var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (!authWellKnownEndPoints) {
                this.loggerService.logWarning('init check session: authWellKnownEndpoints is undefined');
                return rxjs.throwError('authWellKnownEndpoints is undefined');
            }
            var userinfoEndpoint = authWellKnownEndPoints.userinfoEndpoint;
            if (!userinfoEndpoint) {
                this.loggerService.logError('init check session: authWellKnownEndpoints.userinfo_endpoint is undefined; set auto_userinfo = false in config');
                return rxjs.throwError('authWellKnownEndpoints.userinfo_endpoint is undefined');
            }
            return this.oidcDataService.get(userinfoEndpoint, token);
        };
        UserService.prototype.validateUserDataSubIdToken = function (idTokenSub, userdataSub) {
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
        };
        return UserService;
    }());
    UserService.ɵfac = function UserService_Factory(t) { return new (t || UserService)(i0.ɵɵinject(DataService), i0.ɵɵinject(StoragePersistanceService), i0.ɵɵinject(PublicEventsService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(TokenHelperService), i0.ɵɵinject(FlowHelper), i0.ɵɵinject(ConfigurationProvider)); };
    UserService.ɵprov = i0.ɵɵdefineInjectable({ token: UserService, factory: UserService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(UserService, [{
                type: i0.Injectable
            }], function () { return [{ type: DataService }, { type: StoragePersistanceService }, { type: PublicEventsService }, { type: LoggerService }, { type: TokenHelperService }, { type: FlowHelper }, { type: ConfigurationProvider }]; }, null);
    })();

    var StateValidationResult = /** @class */ (function () {
        function StateValidationResult(accessToken, idToken, authResponseIsValid, decodedIdToken, state) {
            if (accessToken === void 0) { accessToken = ''; }
            if (idToken === void 0) { idToken = ''; }
            if (authResponseIsValid === void 0) { authResponseIsValid = false; }
            if (decodedIdToken === void 0) { decodedIdToken = {}; }
            if (state === void 0) { state = exports.ValidationResult.NotSet; }
            this.accessToken = accessToken;
            this.idToken = idToken;
            this.authResponseIsValid = authResponseIsValid;
            this.decodedIdToken = decodedIdToken;
            this.state = state;
        }
        return StateValidationResult;
    }());

    var EqualityService = /** @class */ (function () {
        function EqualityService() {
        }
        EqualityService.prototype.isStringEqualOrNonOrderedArrayEqual = function (value1, value2) {
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
        };
        EqualityService.prototype.areEqual = function (value1, value2) {
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
        };
        EqualityService.prototype.oneValueIsStringAndTheOtherIsArray = function (value1, value2) {
            return (Array.isArray(value1) && this.valueIsString(value2)) || (Array.isArray(value2) && this.valueIsString(value1));
        };
        EqualityService.prototype.bothValuesAreObjects = function (value1, value2) {
            return this.valueIsObject(value1) && this.valueIsObject(value2);
        };
        EqualityService.prototype.bothValuesAreStrings = function (value1, value2) {
            return this.valueIsString(value1) && this.valueIsString(value2);
        };
        EqualityService.prototype.bothValuesAreArrays = function (value1, value2) {
            return Array.isArray(value1) && Array.isArray(value2);
        };
        EqualityService.prototype.valueIsString = function (value) {
            return typeof value === 'string' || value instanceof String;
        };
        EqualityService.prototype.valueIsObject = function (value) {
            return typeof value === 'object';
        };
        EqualityService.prototype.arraysStrictEqual = function (arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }
            for (var i = arr1.length; i--;) {
                if (arr1[i] !== arr2[i]) {
                    return false;
                }
            }
            return true;
        };
        EqualityService.prototype.arraysHaveEqualContent = function (arr1, arr2) {
            if (arr1.length !== arr2.length) {
                return false;
            }
            return arr1.some(function (v) { return arr2.includes(v); });
        };
        EqualityService.prototype.isNullOrUndefined = function (val) {
            return val === null || val === undefined;
        };
        return EqualityService;
    }());
    EqualityService.ɵfac = function EqualityService_Factory(t) { return new (t || EqualityService)(); };
    EqualityService.ɵprov = i0.ɵɵdefineInjectable({ token: EqualityService, factory: EqualityService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(EqualityService, [{
                type: i0.Injectable
            }], null, null);
    })();

    var StateValidationService = /** @class */ (function () {
        function StateValidationService(storagePersistanceService, tokenValidationService, tokenHelperService, loggerService, configurationProvider, equalityService, flowHelper, flowsDataService) {
            this.storagePersistanceService = storagePersistanceService;
            this.tokenValidationService = tokenValidationService;
            this.tokenHelperService = tokenHelperService;
            this.loggerService = loggerService;
            this.configurationProvider = configurationProvider;
            this.equalityService = equalityService;
            this.flowHelper = flowHelper;
            this.flowsDataService = flowsDataService;
        }
        StateValidationService.prototype.getValidatedStateResult = function (callbackContext) {
            if (callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult.error) {
                return new StateValidationResult('', '', false, {});
            }
            return this.validateState(callbackContext);
        };
        StateValidationService.prototype.validateState = function (callbackContext) {
            var toReturn = new StateValidationResult();
            var authStateControl = this.flowsDataService.getAuthStateControlWithoutAnyCheck();
            if (!this.tokenValidationService.validateStateFromHashCallback(callbackContext.authResult.state, authStateControl)) {
                this.loggerService.logWarning('authorizedCallback incorrect state');
                toReturn.state = exports.ValidationResult.StatesDoNotMatch;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            var isCurrentFlowImplicitFlowWithAccessToken = this.flowHelper.isCurrentFlowImplicitFlowWithAccessToken();
            var isCurrentFlowCodeFlow = this.flowHelper.isCurrentFlowCodeFlow();
            if (isCurrentFlowImplicitFlowWithAccessToken || isCurrentFlowCodeFlow) {
                toReturn.accessToken = callbackContext.authResult.access_token;
            }
            if (callbackContext.authResult.id_token) {
                toReturn.idToken = callbackContext.authResult.id_token;
                toReturn.decodedIdToken = this.tokenHelperService.getPayloadFromToken(toReturn.idToken, false);
                if (!this.tokenValidationService.validateSignatureIdToken(toReturn.idToken, callbackContext.jwtKeys)) {
                    this.loggerService.logDebug('authorizedCallback Signature validation failed id_token');
                    toReturn.state = exports.ValidationResult.SignatureFailed;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
                var authNonce = this.storagePersistanceService.read('authNonce');
                if (!this.tokenValidationService.validateIdTokenNonce(toReturn.decodedIdToken, authNonce, this.configurationProvider.openIDConfiguration.ignoreNonceAfterRefresh)) {
                    this.loggerService.logWarning('authorizedCallback incorrect nonce');
                    toReturn.state = exports.ValidationResult.IncorrectNonce;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
                if (!this.tokenValidationService.validateRequiredIdToken(toReturn.decodedIdToken)) {
                    this.loggerService.logDebug('authorizedCallback Validation, one of the REQUIRED properties missing from id_token');
                    toReturn.state = exports.ValidationResult.RequiredPropertyMissing;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
                if (!this.tokenValidationService.validateIdTokenIatMaxOffset(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.maxIdTokenIatOffsetAllowedInSeconds, this.configurationProvider.openIDConfiguration.disableIatOffsetValidation)) {
                    this.loggerService.logWarning('authorizedCallback Validation, iat rejected id_token was issued too far away from the current time');
                    toReturn.state = exports.ValidationResult.MaxOffsetExpired;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
                var authWellKnownEndPoints = this.storagePersistanceService.read('authWellKnownEndPoints');
                if (authWellKnownEndPoints) {
                    if (this.configurationProvider.openIDConfiguration.issValidationOff) {
                        this.loggerService.logDebug('iss validation is turned off, this is not recommended!');
                    }
                    else if (!this.configurationProvider.openIDConfiguration.issValidationOff &&
                        !this.tokenValidationService.validateIdTokenIss(toReturn.decodedIdToken, authWellKnownEndPoints.issuer)) {
                        this.loggerService.logWarning('authorizedCallback incorrect iss does not match authWellKnownEndpoints issuer');
                        toReturn.state = exports.ValidationResult.IssDoesNotMatchIssuer;
                        this.handleUnsuccessfulValidation();
                        return toReturn;
                    }
                }
                else {
                    this.loggerService.logWarning('authWellKnownEndpoints is undefined');
                    toReturn.state = exports.ValidationResult.NoAuthWellKnownEndPoints;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
                if (!this.tokenValidationService.validateIdTokenAud(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.clientId)) {
                    this.loggerService.logWarning('authorizedCallback incorrect aud');
                    toReturn.state = exports.ValidationResult.IncorrectAud;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
                if (!this.tokenValidationService.validateIdTokenAzpExistsIfMoreThanOneAud(toReturn.decodedIdToken)) {
                    this.loggerService.logWarning('authorizedCallback missing azp');
                    toReturn.state = exports.ValidationResult.IncorrectAzp;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
                if (!this.tokenValidationService.validateIdTokenAzpValid(toReturn.decodedIdToken, this.configurationProvider.openIDConfiguration.clientId)) {
                    this.loggerService.logWarning('authorizedCallback incorrect azp');
                    toReturn.state = exports.ValidationResult.IncorrectAzp;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
                if (!this.isIdTokenAfterRefreshTokenRequestValid(callbackContext, toReturn.decodedIdToken)) {
                    this.loggerService.logWarning('authorizedCallback pre, post id_token claims do not match in refresh');
                    toReturn.state = exports.ValidationResult.IncorrectIdTokenClaimsAfterRefresh;
                    this.handleUnsuccessfulValidation();
                    return toReturn;
                }
                if (!this.tokenValidationService.validateIdTokenExpNotExpired(toReturn.decodedIdToken)) {
                    this.loggerService.logWarning('authorizedCallback id token expired');
                    toReturn.state = exports.ValidationResult.TokenExpired;
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
                toReturn.state = exports.ValidationResult.Ok;
                this.handleSuccessfulValidation();
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            var idTokenHeader = this.tokenHelperService.getHeaderFromToken(toReturn.idToken, false);
            // The at_hash is optional for the code flow
            if (isCurrentFlowCodeFlow && !toReturn.decodedIdToken.at_hash) {
                this.loggerService.logDebug('Code Flow active, and no at_hash in the id_token, skipping check!');
            }
            else if (!this.tokenValidationService.validateIdTokenAtHash(toReturn.accessToken, toReturn.decodedIdToken.at_hash, idTokenHeader.alg // 'RSA256'
            ) ||
                !toReturn.accessToken) {
                this.loggerService.logWarning('authorizedCallback incorrect at_hash');
                toReturn.state = exports.ValidationResult.IncorrectAtHash;
                this.handleUnsuccessfulValidation();
                return toReturn;
            }
            toReturn.authResponseIsValid = true;
            toReturn.state = exports.ValidationResult.Ok;
            this.handleSuccessfulValidation();
            return toReturn;
        };
        StateValidationService.prototype.isIdTokenAfterRefreshTokenRequestValid = function (callbackContext, newIdToken) {
            if (!this.configurationProvider.openIDConfiguration.useRefreshToken) {
                return true;
            }
            if (!callbackContext.existingIdToken) {
                return true;
            }
            var decodedIdToken = this.tokenHelperService.getPayloadFromToken(callbackContext.existingIdToken, false);
            // Upon successful validation of the Refresh Token, the response body is the Token Response of Section 3.1.3.3
            // except that it might not contain an id_token.
            // If an ID Token is returned as a result of a token refresh request, the following requirements apply:
            // its iss Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
            if (decodedIdToken.iss !== newIdToken.iss) {
                this.loggerService.logDebug("iss do not match: " + decodedIdToken.iss + " " + newIdToken.iss);
                return false;
            }
            // its azp Claim Value MUST be the same as in the ID Token issued when the original authentication occurred;
            //   if no azp Claim was present in the original ID Token, one MUST NOT be present in the new ID Token, and
            // otherwise, the same rules apply as apply when issuing an ID Token at the time of the original authentication.
            if (decodedIdToken.azp !== newIdToken.azp) {
                this.loggerService.logDebug("azp do not match: " + decodedIdToken.azp + " " + newIdToken.azp);
                return false;
            }
            // its sub Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
            if (decodedIdToken.sub !== newIdToken.sub) {
                this.loggerService.logDebug("sub do not match: " + decodedIdToken.sub + " " + newIdToken.sub);
                return false;
            }
            // its aud Claim Value MUST be the same as in the ID Token issued when the original authentication occurred,
            if (!this.equalityService.isStringEqualOrNonOrderedArrayEqual(decodedIdToken === null || decodedIdToken === void 0 ? void 0 : decodedIdToken.aud, newIdToken === null || newIdToken === void 0 ? void 0 : newIdToken.aud)) {
                this.loggerService.logDebug("aud in new id_token is not valid: '" + (decodedIdToken === null || decodedIdToken === void 0 ? void 0 : decodedIdToken.aud) + "' '" + newIdToken.aud + "'");
                return false;
            }
            if (this.configurationProvider.openIDConfiguration.disableRefreshIdTokenAuthTimeValidation) {
                return true;
            }
            // its iat Claim MUST represent the time that the new ID Token is issued,
            // if the ID Token contains an auth_time Claim, its value MUST represent the time of the original authentication
            // - not the time that the new ID token is issued,
            if (decodedIdToken.auth_time !== newIdToken.auth_time) {
                this.loggerService.logDebug("auth_time do not match: " + decodedIdToken.auth_time + " " + newIdToken.auth_time);
                return false;
            }
            return true;
        };
        StateValidationService.prototype.handleSuccessfulValidation = function () {
            this.storagePersistanceService.write('authNonce', '');
            if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
                this.storagePersistanceService.write('authStateControl', '');
            }
            this.loggerService.logDebug('AuthorizedCallback token(s) validated, continue');
        };
        StateValidationService.prototype.handleUnsuccessfulValidation = function () {
            this.storagePersistanceService.write('authNonce', '');
            if (this.configurationProvider.openIDConfiguration.autoCleanStateAfterAuthentication) {
                this.storagePersistanceService.write('authStateControl', '');
            }
            this.loggerService.logDebug('AuthorizedCallback token(s) invalid');
        };
        return StateValidationService;
    }());
    StateValidationService.ɵfac = function StateValidationService_Factory(t) { return new (t || StateValidationService)(i0.ɵɵinject(StoragePersistanceService), i0.ɵɵinject(TokenValidationService), i0.ɵɵinject(TokenHelperService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(EqualityService), i0.ɵɵinject(FlowHelper), i0.ɵɵinject(FlowsDataService)); };
    StateValidationService.ɵprov = i0.ɵɵdefineInjectable({ token: StateValidationService, factory: StateValidationService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(StateValidationService, [{
                type: i0.Injectable
            }], function () { return [{ type: StoragePersistanceService }, { type: TokenValidationService }, { type: TokenHelperService }, { type: LoggerService }, { type: ConfigurationProvider }, { type: EqualityService }, { type: FlowHelper }, { type: FlowsDataService }]; }, null);
    })();

    var FlowsService = /** @class */ (function () {
        function FlowsService(urlService, loggerService, tokenValidationService, configurationProvider, authStateService, flowsDataService, signinKeyDataService, dataService, userService, stateValidationService, storagePersistanceService) {
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
        FlowsService.prototype.resetAuthorizationData = function () {
            if (this.configurationProvider.openIDConfiguration.autoUserinfo) {
                // Clear user data. Fixes #97.
                this.userService.resetUserDataInStore();
            }
            this.flowsDataService.resetStorageFlowData();
            this.authStateService.setUnauthorizedAndFireEvent();
        };
        FlowsService.prototype.processCodeFlowCallback = function (urlToCheck) {
            var _this = this;
            return this.codeFlowCallback(urlToCheck).pipe(operators.switchMap(function (callbackContext) { return _this.codeFlowCodeRequest(callbackContext); }), operators.switchMap(function (callbackContext) { return _this.callbackHistoryAndResetJwtKeys(callbackContext); }), operators.switchMap(function (callbackContext) { return _this.callbackStateValidation(callbackContext); }), operators.switchMap(function (callbackContext) { return _this.callbackUser(callbackContext); }));
        };
        FlowsService.prototype.processSilentRenewCodeFlowCallback = function (firstContext) {
            var _this = this;
            return this.codeFlowCodeRequestOnlyForSilentRenew(firstContext).pipe(operators.switchMap(function (callbackContext) {
                var _a;
                if (((_a = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.validationResult) === null || _a === void 0 ? void 0 : _a.state) === exports.ValidationResult.StatesDoNotMatch) {
                    _this.loggerService.logError("processSilentRenewCodeFlowCallback > AFTER TOKEN REQUEST STATES DONT MATCH VALIDATION RESULT = ValidationResult.StatesDoNotMatch");
                    return rxjs.of(callbackContext);
                }
                return rxjs.of(callbackContext).pipe(operators.switchMap(function (callbackContext) { return _this.callbackHistoryAndResetJwtKeys(callbackContext); }), operators.switchMap(function (callbackContext) { return _this.callbackStateValidation(callbackContext); }), operators.switchMap(function (callbackContext) { return _this.callbackUser(callbackContext); }));
            }));
        };
        FlowsService.prototype.processImplicitFlowCallback = function (hash) {
            var _this = this;
            return this.implicitFlowCallback(hash).pipe(operators.switchMap(function (callbackContext) { return _this.callbackHistoryAndResetJwtKeys(callbackContext); }), operators.switchMap(function (callbackContext) { return _this.callbackStateValidation(callbackContext); }), operators.switchMap(function (callbackContext) { return _this.callbackUser(callbackContext); }));
        };
        FlowsService.prototype.processRefreshToken = function (customParams) {
            var _this = this;
            return this.refreshSessionWithRefreshTokens().pipe(operators.switchMap(function (callbackContext) { return _this.refreshTokensRequestTokens(callbackContext, customParams); }), operators.switchMap(function (callbackContext) { return _this.callbackHistoryAndResetJwtKeys(callbackContext); }), operators.switchMap(function (callbackContext) { return _this.callbackStateValidation(callbackContext); }), operators.switchMap(function (callbackContext) { return _this.callbackUser(callbackContext); }));
        };
        // STEP 1 Code Flow
        FlowsService.prototype.codeFlowCallback = function (urlToCheck) {
            var code = this.urlService.getUrlParameter(urlToCheck, 'code');
            var state = this.urlService.getUrlParameter(urlToCheck, 'state');
            var sessionState = this.urlService.getUrlParameter(urlToCheck, 'session_state') || null;
            if (!state) {
                this.loggerService.logDebug('no state in url');
                return rxjs.throwError('no state in url');
            }
            if (!code) {
                this.loggerService.logDebug('no code in url');
                return rxjs.throwError('no code in url');
            }
            this.loggerService.logDebug('running validation for callback', urlToCheck);
            var initialCallbackContext = {
                code: code,
                refreshToken: null,
                state: state,
                sessionState: sessionState,
                authResult: null,
                isRenewProcess: false,
                jwtKeys: null,
                validationResult: null,
                existingIdToken: null,
            };
            return rxjs.of(initialCallbackContext);
        };
        // STEP 1 Implicit Flow
        FlowsService.prototype.implicitFlowCallback = function (hash) {
            var isRenewProcessData = this.flowsDataService.isSilentRenewRunning();
            this.loggerService.logDebug('BEGIN authorizedCallback, no auth data');
            if (!isRenewProcessData) {
                this.resetAuthorizationData();
            }
            hash = hash || window.location.hash.substr(1);
            var authResult = hash.split('&').reduce(function (resultData, item) {
                var parts = item.split('=');
                resultData[parts.shift()] = parts.join('=');
                return resultData;
            }, {});
            var callbackContext = {
                code: null,
                refreshToken: null,
                state: null,
                sessionState: null,
                authResult: authResult,
                isRenewProcess: isRenewProcessData,
                jwtKeys: null,
                validationResult: null,
                existingIdToken: null,
            };
            return rxjs.of(callbackContext);
        };
        // STEP 1 Refresh session
        FlowsService.prototype.refreshSessionWithRefreshTokens = function () {
            var stateData = this.flowsDataService.getExistingOrCreateAuthStateControl('refresh-token');
            this.loggerService.logDebug('RefreshSession created. adding myautostate: ' + stateData);
            var refreshToken = this.authStateService.getRefreshToken();
            var idToken = this.authStateService.getIdToken();
            if (refreshToken) {
                var callbackContext = {
                    code: null,
                    refreshToken: refreshToken,
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
                return rxjs.of(callbackContext);
            }
            else {
                var errorMessage = 'no refresh token found, please login';
                this.loggerService.logError(errorMessage);
                return rxjs.throwError(errorMessage);
            }
        };
        // STEP 2 Refresh Token
        FlowsService.prototype.refreshTokensRequestTokens = function (callbackContext, customParams) {
            var _this = this;
            var headers = new i1.HttpHeaders();
            headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
            var authWellKnown = this.storagePersistanceService.read('authWellKnownEndPoints');
            var tokenEndpoint = authWellKnown === null || authWellKnown === void 0 ? void 0 : authWellKnown.tokenEndpoint;
            if (!tokenEndpoint) {
                return rxjs.throwError('Token Endpoint not defined');
            }
            var data = this.urlService.createBodyForCodeFlowRefreshTokensRequest(callbackContext.refreshToken, customParams);
            return this.dataService.post(tokenEndpoint, data, headers).pipe(operators.switchMap(function (response) {
                _this.loggerService.logDebug('token refresh response: ', response);
                var authResult = new Object();
                authResult = response;
                authResult.state = callbackContext.state;
                callbackContext.authResult = authResult;
                return rxjs.of(callbackContext);
            }), operators.catchError(function (error) {
                var errorMessage = "OidcService code request " + _this.configurationProvider.openIDConfiguration.stsServer;
                _this.loggerService.logError(errorMessage, error);
                return rxjs.throwError(errorMessage);
            }));
        };
        // STEP 2 Code Flow //  Code Flow Silent Renew starts here
        FlowsService.prototype.codeFlowCodeRequest = function (callbackContext) {
            var _this = this;
            var isStateCorrect = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, this.flowsDataService.getAuthStateControl());
            if (!isStateCorrect) {
                this.loggerService.logWarning('codeFlowCodeRequest incorrect state');
                return rxjs.throwError('codeFlowCodeRequest incorrect state');
            }
            var authWellKnown = this.storagePersistanceService.read('authWellKnownEndPoints');
            var tokenEndpoint = authWellKnown === null || authWellKnown === void 0 ? void 0 : authWellKnown.tokenEndpoint;
            if (!tokenEndpoint) {
                return rxjs.throwError('Token Endpoint not defined');
            }
            var headers = new i1.HttpHeaders();
            headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
            var bodyForCodeFlow = this.urlService.createBodyForCodeFlowCodeRequest(callbackContext.code);
            return this.dataService.post(tokenEndpoint, bodyForCodeFlow, headers).pipe(operators.switchMap(function (response) {
                var authResult = new Object();
                authResult = response;
                authResult.state = callbackContext.state;
                authResult.session_state = callbackContext.sessionState;
                callbackContext.authResult = authResult;
                return rxjs.of(callbackContext);
            }), operators.catchError(function (error) {
                var errorMessage = "OidcService code request " + _this.configurationProvider.openIDConfiguration.stsServer;
                _this.loggerService.logError(errorMessage, error);
                return rxjs.throwError(errorMessage);
            }));
        };
        // STEP 2 Code Flow Silent Renew starts here OUR FLOW
        FlowsService.prototype.codeFlowCodeRequestOnlyForSilentRenew = function (callbackContext) {
            var _this = this;
            var isStateCorrect = this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, this.flowsDataService.getAuthStateControl());
            if (!isStateCorrect) {
                this.loggerService.logWarning('codeFlowCodeRequest incorrect state');
                return rxjs.throwError('codeFlowCodeRequest incorrect state');
            }
            var authWellKnown = this.storagePersistanceService.read('authWellKnownEndPoints');
            var tokenEndpoint = authWellKnown === null || authWellKnown === void 0 ? void 0 : authWellKnown.tokenEndpoint;
            if (!tokenEndpoint) {
                return rxjs.throwError('Token Endpoint not defined');
            }
            var headers = new i1.HttpHeaders();
            headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
            var bodyForCodeFlow = this.urlService.createBodyForCodeFlowCodeRequestOnlyForSilentRenew(callbackContext.code);
            return this.dataService.post(tokenEndpoint, bodyForCodeFlow, headers).pipe(operators.switchMap(function (response) {
                var currentState = _this.flowsDataService.getAuthStateControl();
                var isStateCorrectAfterTokenRequest = _this.tokenValidationService.validateStateFromHashCallback(callbackContext.state, currentState);
                if (!isStateCorrectAfterTokenRequest) {
                    _this.loggerService.logError("silentRenewEventHandler > AFTER code request callback > states don't match stateFromUrl: " + callbackContext.state + " currentState: " + currentState);
                    callbackContext.validationResult = {
                        accessToken: null,
                        authResponseIsValid: null,
                        decodedIdToken: null,
                        idToken: null,
                        state: exports.ValidationResult.StatesDoNotMatch,
                    };
                    return rxjs.of(callbackContext);
                }
                var authResult = new Object();
                authResult = response;
                authResult.state = callbackContext.state;
                authResult.session_state = callbackContext.sessionState;
                callbackContext.authResult = authResult;
                return rxjs.of(callbackContext);
            }), operators.catchError(function (error) {
                var errorMessage = "OidcService code request " + _this.configurationProvider.openIDConfiguration.stsServer;
                _this.loggerService.logError(errorMessage, error);
                return rxjs.throwError(errorMessage);
            }));
        };
        // STEP 3 Code Flow, STEP 2 Implicit Flow, STEP 3 Refresh Token
        FlowsService.prototype.callbackHistoryAndResetJwtKeys = function (callbackContext) {
            var _this = this;
            this.storagePersistanceService.write('authnResult', callbackContext.authResult);
            if (this.historyCleanUpTurnedOn() && !callbackContext.isRenewProcess) {
                this.resetBrowserHistory();
            }
            else {
                this.loggerService.logDebug('history clean up inactive');
            }
            if (callbackContext.authResult.error) {
                var errorMessage = "authorizedCallbackProcedure came with error: " + callbackContext.authResult.error;
                this.loggerService.logDebug(errorMessage);
                this.resetAuthorizationData();
                this.flowsDataService.setNonce('');
                this.handleResultErrorFromCallback(callbackContext.authResult, callbackContext.isRenewProcess);
                return rxjs.throwError(errorMessage);
            }
            this.loggerService.logDebug(callbackContext.authResult);
            this.loggerService.logDebug('authorizedCallback created, begin token validation');
            return this.signinKeyDataService.getSigningKeys().pipe(operators.switchMap(function (jwtKeys) {
                if (jwtKeys) {
                    callbackContext.jwtKeys = jwtKeys;
                    return rxjs.of(callbackContext);
                }
                var errorMessage = "Failed to retrieve signing key";
                _this.loggerService.logWarning(errorMessage);
                return rxjs.throwError(errorMessage);
            }), operators.catchError(function (err) {
                var errorMessage = "Failed to retrieve signing key with error: " + err;
                _this.loggerService.logWarning(errorMessage);
                return rxjs.throwError(errorMessage);
            }));
        };
        // STEP 4 All flows
        FlowsService.prototype.callbackStateValidation = function (callbackContext) {
            var validationResult = this.stateValidationService.getValidatedStateResult(callbackContext);
            callbackContext.validationResult = validationResult;
            if (validationResult.authResponseIsValid) {
                this.authStateService.setAuthorizationData(validationResult.accessToken, callbackContext.authResult);
                return rxjs.of(callbackContext);
            }
            else {
                var errorMessage = "authorizedCallback, token(s) validation failed, resetting. Hash: " + window.location.hash;
                this.loggerService.logWarning(errorMessage);
                this.resetAuthorizationData();
                this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                return rxjs.throwError(errorMessage);
            }
        };
        // STEP 5 userData
        FlowsService.prototype.callbackUser = function (callbackContext) {
            var _this = this;
            if (!this.configurationProvider.openIDConfiguration.autoUserinfo) {
                if (!callbackContext.isRenewProcess) {
                    // userData is set to the id_token decoded, auto get user data set to false
                    this.userService.setUserDataToStore(callbackContext.validationResult.decodedIdToken);
                }
                this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                return rxjs.of(callbackContext);
            }
            return this.userService
                .getAndPersistUserDataInStore(callbackContext.isRenewProcess, callbackContext.validationResult.idToken, callbackContext.validationResult.decodedIdToken)
                .pipe(operators.switchMap(function (userData) {
                if (!!userData) {
                    if (!callbackContext.refreshToken) {
                        _this.flowsDataService.setSessionState(callbackContext.authResult.session_state);
                    }
                    _this.publishAuthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                    return rxjs.of(callbackContext);
                }
                else {
                    _this.resetAuthorizationData();
                    _this.publishUnauthorizedState(callbackContext.validationResult, callbackContext.isRenewProcess);
                    var errorMessage = "Called for userData but they were " + userData;
                    _this.loggerService.logWarning(errorMessage);
                    return rxjs.throwError(errorMessage);
                }
            }), operators.catchError(function (err) {
                var errorMessage = "Failed to retrieve user info with error:  " + err;
                _this.loggerService.logWarning(errorMessage);
                return rxjs.throwError(errorMessage);
            }));
        };
        FlowsService.prototype.publishAuthorizedState = function (stateValidationResult, isRenewProcess) {
            this.authStateService.updateAndPublishAuthState({
                authorizationState: exports.AuthorizedState.Authorized,
                validationResult: stateValidationResult.state,
                isRenewProcess: isRenewProcess,
            });
        };
        FlowsService.prototype.publishUnauthorizedState = function (stateValidationResult, isRenewProcess) {
            this.authStateService.updateAndPublishAuthState({
                authorizationState: exports.AuthorizedState.Unauthorized,
                validationResult: stateValidationResult.state,
                isRenewProcess: isRenewProcess,
            });
        };
        FlowsService.prototype.handleResultErrorFromCallback = function (result, isRenewProcess) {
            var validationResult = exports.ValidationResult.SecureTokenServerError;
            if (result.error === 'login_required') {
                validationResult = exports.ValidationResult.LoginRequired;
            }
            this.authStateService.updateAndPublishAuthState({
                authorizationState: exports.AuthorizedState.Unauthorized,
                validationResult: validationResult,
                isRenewProcess: isRenewProcess,
            });
        };
        FlowsService.prototype.historyCleanUpTurnedOn = function () {
            return !this.configurationProvider.openIDConfiguration.historyCleanupOff;
        };
        FlowsService.prototype.resetBrowserHistory = function () {
            window.history.replaceState({}, window.document.title, window.location.origin + window.location.pathname);
        };
        return FlowsService;
    }());
    FlowsService.ɵfac = function FlowsService_Factory(t) { return new (t || FlowsService)(i0.ɵɵinject(UrlService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(TokenValidationService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(AuthStateService), i0.ɵɵinject(FlowsDataService), i0.ɵɵinject(SigninKeyDataService), i0.ɵɵinject(DataService), i0.ɵɵinject(UserService), i0.ɵɵinject(StateValidationService), i0.ɵɵinject(StoragePersistanceService)); };
    FlowsService.ɵprov = i0.ɵɵdefineInjectable({ token: FlowsService, factory: FlowsService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(FlowsService, [{
                type: i0.Injectable
            }], function () { return [{ type: UrlService }, { type: LoggerService }, { type: TokenValidationService }, { type: ConfigurationProvider }, { type: AuthStateService }, { type: FlowsDataService }, { type: SigninKeyDataService }, { type: DataService }, { type: UserService }, { type: StateValidationService }, { type: StoragePersistanceService }]; }, null);
    })();

    var IntervallService = /** @class */ (function () {
        function IntervallService(zone) {
            this.zone = zone;
            this.runTokenValidationRunning = null;
        }
        IntervallService.prototype.stopPeriodicallTokenCheck = function () {
            if (this.runTokenValidationRunning) {
                this.runTokenValidationRunning.unsubscribe();
                this.runTokenValidationRunning = null;
            }
        };
        IntervallService.prototype.startPeriodicTokenCheck = function (repeatAfterSeconds) {
            var _this = this;
            var millisecondsDelayBetweenTokenCheck = repeatAfterSeconds * 1000;
            return new rxjs.Observable(function (subscriber) {
                var intervalId;
                _this.zone.runOutsideAngular(function () {
                    intervalId = setInterval(function () { return subscriber.next(); }, millisecondsDelayBetweenTokenCheck);
                });
                return function () {
                    clearInterval(intervalId);
                };
            });
        };
        return IntervallService;
    }());
    IntervallService.ɵfac = function IntervallService_Factory(t) { return new (t || IntervallService)(i0.ɵɵinject(i0.NgZone)); };
    IntervallService.ɵprov = i0.ɵɵdefineInjectable({ token: IntervallService, factory: IntervallService.ɵfac, providedIn: 'root' });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(IntervallService, [{
                type: i0.Injectable,
                args: [{ providedIn: 'root' }]
            }], function () { return [{ type: i0.NgZone }]; }, null);
    })();

    var ImplicitFlowCallbackService = /** @class */ (function () {
        function ImplicitFlowCallbackService(flowsService, configurationProvider, router, flowsDataService, intervallService) {
            this.flowsService = flowsService;
            this.configurationProvider = configurationProvider;
            this.router = router;
            this.flowsDataService = flowsDataService;
            this.intervallService = intervallService;
        }
        ImplicitFlowCallbackService.prototype.authorizedImplicitFlowCallback = function (hash) {
            var _this = this;
            var isRenewProcess = this.flowsDataService.isSilentRenewRunning();
            return this.flowsService.processImplicitFlowCallback(hash).pipe(operators.tap(function (callbackContext) {
                if (!_this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                    _this.router.navigate([_this.configurationProvider.openIDConfiguration.postLoginRoute]);
                }
            }), operators.catchError(function (error) {
                _this.flowsDataService.resetSilentRenewRunning();
                _this.intervallService.stopPeriodicallTokenCheck();
                if (!_this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !isRenewProcess) {
                    _this.router.navigate([_this.configurationProvider.openIDConfiguration.unauthorizedRoute]);
                }
                return rxjs.throwError(error);
            }));
        };
        return ImplicitFlowCallbackService;
    }());
    ImplicitFlowCallbackService.ɵfac = function ImplicitFlowCallbackService_Factory(t) { return new (t || ImplicitFlowCallbackService)(i0.ɵɵinject(FlowsService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(i3.Router), i0.ɵɵinject(FlowsDataService), i0.ɵɵinject(IntervallService)); };
    ImplicitFlowCallbackService.ɵprov = i0.ɵɵdefineInjectable({ token: ImplicitFlowCallbackService, factory: ImplicitFlowCallbackService.ɵfac, providedIn: 'root' });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(ImplicitFlowCallbackService, [{
                type: i0.Injectable,
                args: [{ providedIn: 'root' }]
            }], function () { return [{ type: FlowsService }, { type: ConfigurationProvider }, { type: i3.Router }, { type: FlowsDataService }, { type: IntervallService }]; }, null);
    })();

    var TabsSynchronizationService = /** @class */ (function () {
        function TabsSynchronizationService(configurationProvider, publicEventsService, loggerService) {
            this.configurationProvider = configurationProvider;
            this.publicEventsService = publicEventsService;
            this.loggerService = loggerService;
            this._isLeaderSubjectInitialized = false;
            this._isClosed = false;
            this._silentRenewFinished$ = new rxjs.ReplaySubject(1);
            this._leaderSubjectInitialized$ = new rxjs.ReplaySubject(1);
            this._currentRandomId = Math.random().toString(36).substr(2, 9) + "_" + new Date().getUTCMilliseconds();
            this.Initialization();
        }
        Object.defineProperty(TabsSynchronizationService.prototype, "isClosed", {
            get: function () {
                return this._isClosed;
            },
            enumerable: false,
            configurable: true
        });
        TabsSynchronizationService.prototype.isLeaderCheck = function () {
            var _this = this;
            this.loggerService.logDebug("isLeaderCheck > prefix: " + this._prefix + " > currentRandomId: " + this._currentRandomId);
            if (!this._isLeaderSubjectInitialized) {
                this.loggerService.logDebug("isLeaderCheck > IS LEADER IS NOT INITIALIZED > prefix: " + this._prefix + " > currentRandomId: " + this._currentRandomId);
                return this._leaderSubjectInitialized$
                    .asObservable()
                    .pipe(operators.take(1), operators.switchMap(function () {
                    return rxjs.of(_this._elector.isLeader);
                }))
                    .toPromise();
            }
            this.loggerService.logDebug("isLeaderCheck > IS LEADER IS ALREADY INITIALIZED > prefix: " + this._prefix + " > currentRandomId: " + this._currentRandomId);
            return new Promise(function (resolve) {
                var isLeaderResult = _this._elector.isLeader;
                _this.loggerService.logDebug("isLeaderCheck > isLeader result = " + isLeaderResult + " > prefix: " + _this._prefix + " > currentRandomId: " + _this._currentRandomId);
                resolve(isLeaderResult);
            });
        };
        TabsSynchronizationService.prototype.getSilentRenewFinishedObservable = function () {
            return this._silentRenewFinished$.asObservable();
        };
        TabsSynchronizationService.prototype.sendSilentRenewFinishedNotification = function () {
            if (!this._silentRenewFinishedChannel) {
                this._silentRenewFinishedChannel = new broadcastChannel.BroadcastChannel(this._prefix + "_silent_renew_finished");
            }
            this._silentRenewFinishedChannel.postMessage("Silent renew finished by _currentRandomId " + this._currentRandomId);
        };
        TabsSynchronizationService.prototype.closeTabSynchronization = function () {
            this.loggerService.logWarning("Tab synchronization has been closed > prefix: " + this._prefix + " > currentRandomId: " + this._currentRandomId);
            this._elector.die();
            this._silentRenewFinishedChannel.close();
            this._leaderChannel.close();
            this._isLeaderSubjectInitialized = false;
            this._isClosed = true;
        };
        TabsSynchronizationService.prototype.reInitialize = function () {
            this.loggerService.logDebug('TabsSynchronizationService re-initialization process started...');
            if (!this._isClosed) {
                throw Error('TabsSynchronizationService cannot be re-initialized when it is not closed.');
            }
            this._silentRenewFinished$ = new rxjs.ReplaySubject(1);
            this._leaderSubjectInitialized$ = new rxjs.ReplaySubject(1);
            this.Initialization();
            this._isClosed = false;
        };
        TabsSynchronizationService.prototype.Initialization = function () {
            var _this = this;
            var _a;
            this.loggerService.logDebug('TabsSynchronizationService > Initialization started');
            this._prefix = ((_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.clientId) || '';
            this._leaderChannel = new broadcastChannel.BroadcastChannel(this._prefix + "_leader");
            this._elector = broadcastChannel.createLeaderElection(this._leaderChannel, {
                fallbackInterval: 2000,
                responseTime: 1000,
            });
            this._elector.applyOnce().then(function (isLeader) {
                _this.loggerService.logDebug('FIRST applyOnce finished...');
                _this._isLeaderSubjectInitialized = true;
                _this._leaderSubjectInitialized$.next(true);
                if (!isLeader) {
                    _this._elector.awaitLeadership().then(function () {
                        _this.loggerService.logDebug("FROM awaitLeadership > this tab is now leader > prefix: " + _this._prefix + " > currentRandomId: " + _this._currentRandomId);
                    });
                }
                else {
                    _this.loggerService.logDebug("FROM INITIALIZATION FIRST applyOnce > this tab is now leader > prefix: " + _this._prefix + " > currentRandomId: " + _this._currentRandomId);
                }
            });
            this.initializeSilentRenewFinishedChannelWithHandler();
        };
        TabsSynchronizationService.prototype.initializeSilentRenewFinishedChannelWithHandler = function () {
            var _this = this;
            this._silentRenewFinishedChannel = new broadcastChannel.BroadcastChannel(this._prefix + "_silent_renew_finished");
            this._silentRenewFinishedChannel.onmessage = function () {
                _this.loggerService.logDebug("FROM SILENT RENEW FINISHED RECIVED EVENT > prefix: " + _this._prefix + " > currentRandomId: " + _this._currentRandomId);
                _this._silentRenewFinished$.next(true);
                _this.publicEventsService.fireEvent(exports.EventTypes.SilentRenewFinished, true);
            };
        };
        return TabsSynchronizationService;
    }());
    TabsSynchronizationService.ɵfac = function TabsSynchronizationService_Factory(t) { return new (t || TabsSynchronizationService)(i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(PublicEventsService), i0.ɵɵinject(LoggerService)); };
    TabsSynchronizationService.ɵprov = i0.ɵɵdefineInjectable({ token: TabsSynchronizationService, factory: TabsSynchronizationService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(TabsSynchronizationService, [{
                type: i0.Injectable
            }], function () { return [{ type: ConfigurationProvider }, { type: PublicEventsService }, { type: LoggerService }]; }, null);
    })();

    var IFRAME_FOR_SILENT_RENEW_IDENTIFIER = 'myiFrameForSilentRenew';
    var SilentRenewService = /** @class */ (function () {
        function SilentRenewService(configurationProvider, iFrameService, flowsService, flowsDataService, authStateService, loggerService, flowHelper, implicitFlowCallbackService, intervallService, tabsSynchronizationService) {
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
            this.refreshSessionWithIFrameCompletedInternal$ = new rxjs.Subject();
        }
        Object.defineProperty(SilentRenewService.prototype, "refreshSessionWithIFrameCompleted$", {
            get: function () {
                return this.refreshSessionWithIFrameCompletedInternal$.asObservable();
            },
            enumerable: false,
            configurable: true
        });
        SilentRenewService.prototype.getOrCreateIframe = function () {
            var existingIframe = this.getExistingIframe();
            if (!existingIframe) {
                return this.iFrameService.addIFrameToWindowBody(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
            }
            return existingIframe;
        };
        SilentRenewService.prototype.isSilentRenewConfigured = function () {
            return !this.configurationProvider.openIDConfiguration.useRefreshToken && this.configurationProvider.openIDConfiguration.silentRenew;
        };
        SilentRenewService.prototype.codeFlowCallbackSilentRenewIframe = function (urlParts) {
            var _this = this;
            var params = new i1.HttpParams({
                fromString: urlParts[1],
            });
            var error = params.get('error');
            if (error) {
                this.authStateService.updateAndPublishAuthState({
                    authorizationState: exports.AuthorizedState.Unauthorized,
                    validationResult: exports.ValidationResult.LoginRequired,
                    isRenewProcess: true,
                });
                this.flowsService.resetAuthorizationData();
                this.flowsDataService.setNonce('');
                this.intervallService.stopPeriodicallTokenCheck();
                return rxjs.throwError(error);
            }
            var code = params.get('code');
            var state = params.get('state');
            var sessionState = params.get('session_state');
            var callbackContext = {
                code: code,
                refreshToken: null,
                state: state,
                sessionState: sessionState,
                authResult: null,
                isRenewProcess: true,
                jwtKeys: null,
                validationResult: null,
                existingIdToken: null,
            };
            return this.flowsService.processSilentRenewCodeFlowCallback(callbackContext).pipe(operators.catchError(function (errorFromFlow) {
                if (errorFromFlow instanceof i1.HttpErrorResponse && errorFromFlow.status === 504) {
                    _this.loggerService.logError('processSilentRenewCodeFlowCallback catchError statement re-throw error without any reset. Original error ' + errorFromFlow);
                    return rxjs.throwError(errorFromFlow);
                }
                _this.intervallService.stopPeriodicallTokenCheck();
                _this.flowsService.resetAuthorizationData();
                return rxjs.throwError(errorFromFlow);
            }));
        };
        SilentRenewService.prototype.silentRenewEventHandler = function (e) {
            var _this = this;
            this.loggerService.logDebug('silentRenewEventHandler');
            if (!e.detail) {
                return;
            }
            var urlParts = e.detail.toString().split('?');
            var params = new i1.HttpParams({
                fromString: urlParts[1],
            });
            var stateFromUrl = params.get('state');
            var currentState = this.flowsDataService.getAuthStateControl();
            if (stateFromUrl !== currentState) {
                this.loggerService.logError("silentRenewEventHandler > states don't match stateFromUrl: " + stateFromUrl + " currentState: " + currentState);
                return;
            }
            this.tabsSynchronizationService.isLeaderCheck().then(function (isLeader) {
                if (!isLeader)
                    return;
                var callback$ = rxjs.of(null);
                var isCodeFlow = _this.flowHelper.isCurrentFlowCodeFlow();
                if (isCodeFlow) {
                    callback$ = _this.codeFlowCallbackSilentRenewIframe(urlParts);
                }
                else {
                    callback$ = _this.implicitFlowCallbackService.authorizedImplicitFlowCallback(e.detail);
                }
                callback$.subscribe(function (callbackContext) {
                    var _a;
                    if (((_a = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.validationResult) === null || _a === void 0 ? void 0 : _a.state) === exports.ValidationResult.StatesDoNotMatch) {
                        _this.loggerService.logError("silentRenewEventHandler > inside subscribe for codeRequestCallback > states don't match stateFromUrl: " + stateFromUrl + " currentState: " + currentState);
                        return;
                    }
                    _this.refreshSessionWithIFrameCompletedInternal$.next(callbackContext);
                    _this.flowsDataService.resetSilentRenewRunning();
                    _this.tabsSynchronizationService.sendSilentRenewFinishedNotification();
                }, function (err) {
                    if (err instanceof i1.HttpErrorResponse && err.status === 504) {
                        _this.loggerService.logError('silentRenewEventHandler from Callback catch timeout error so we finish this process. Original error ' + err);
                        return;
                    }
                    _this.loggerService.logError('Error: ' + err);
                    _this.refreshSessionWithIFrameCompletedInternal$.next(null);
                    _this.flowsDataService.resetSilentRenewRunning();
                });
            });
        };
        SilentRenewService.prototype.getExistingIframe = function () {
            return this.iFrameService.getExistingIFrame(IFRAME_FOR_SILENT_RENEW_IDENTIFIER);
        };
        return SilentRenewService;
    }());
    SilentRenewService.ɵfac = function SilentRenewService_Factory(t) { return new (t || SilentRenewService)(i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(IFrameService), i0.ɵɵinject(FlowsService), i0.ɵɵinject(FlowsDataService), i0.ɵɵinject(AuthStateService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(FlowHelper), i0.ɵɵinject(ImplicitFlowCallbackService), i0.ɵɵinject(IntervallService), i0.ɵɵinject(TabsSynchronizationService)); };
    SilentRenewService.ɵprov = i0.ɵɵdefineInjectable({ token: SilentRenewService, factory: SilentRenewService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(SilentRenewService, [{
                type: i0.Injectable
            }], function () { return [{ type: ConfigurationProvider }, { type: IFrameService }, { type: FlowsService }, { type: FlowsDataService }, { type: AuthStateService }, { type: LoggerService }, { type: FlowHelper }, { type: ImplicitFlowCallbackService }, { type: IntervallService }, { type: TabsSynchronizationService }]; }, null);
    })();

    var CodeFlowCallbackService = /** @class */ (function () {
        function CodeFlowCallbackService(flowsService, flowsDataService, intervallService, configurationProvider, router) {
            this.flowsService = flowsService;
            this.flowsDataService = flowsDataService;
            this.intervallService = intervallService;
            this.configurationProvider = configurationProvider;
            this.router = router;
        }
        CodeFlowCallbackService.prototype.authorizedCallbackWithCode = function (urlToCheck) {
            var _this = this;
            var isRenewProcess = this.flowsDataService.isSilentRenewRunning();
            return this.flowsService.processCodeFlowCallback(urlToCheck).pipe(operators.tap(function (callbackContext) {
                if (!_this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !callbackContext.isRenewProcess) {
                    _this.router.navigate([_this.configurationProvider.openIDConfiguration.postLoginRoute]);
                }
            }), operators.catchError(function (error) {
                _this.flowsDataService.resetSilentRenewRunning();
                _this.intervallService.stopPeriodicallTokenCheck();
                if (!_this.configurationProvider.openIDConfiguration.triggerAuthorizationResultEvent && !isRenewProcess) {
                    _this.router.navigate([_this.configurationProvider.openIDConfiguration.unauthorizedRoute]);
                }
                return rxjs.throwError(error);
            }));
        };
        return CodeFlowCallbackService;
    }());
    CodeFlowCallbackService.ɵfac = function CodeFlowCallbackService_Factory(t) { return new (t || CodeFlowCallbackService)(i0.ɵɵinject(FlowsService), i0.ɵɵinject(FlowsDataService), i0.ɵɵinject(IntervallService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(i3.Router)); };
    CodeFlowCallbackService.ɵprov = i0.ɵɵdefineInjectable({ token: CodeFlowCallbackService, factory: CodeFlowCallbackService.ɵfac, providedIn: 'root' });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(CodeFlowCallbackService, [{
                type: i0.Injectable,
                args: [{ providedIn: 'root' }]
            }], function () { return [{ type: FlowsService }, { type: FlowsDataService }, { type: IntervallService }, { type: ConfigurationProvider }, { type: i3.Router }]; }, null);
    })();

    var CallbackService = /** @class */ (function () {
        function CallbackService(urlService, flowHelper, implicitFlowCallbackService, codeFlowCallbackService) {
            this.urlService = urlService;
            this.flowHelper = flowHelper;
            this.implicitFlowCallbackService = implicitFlowCallbackService;
            this.codeFlowCallbackService = codeFlowCallbackService;
            this.stsCallbackInternal$ = new rxjs.Subject();
        }
        Object.defineProperty(CallbackService.prototype, "stsCallback$", {
            get: function () {
                return this.stsCallbackInternal$.asObservable();
            },
            enumerable: false,
            configurable: true
        });
        CallbackService.prototype.isCallback = function (currentUrl) {
            return this.urlService.isCallbackFromSts(currentUrl);
        };
        CallbackService.prototype.handleCallbackAndFireEvents = function (currentCallbackUrl) {
            var _this = this;
            var callback$;
            if (this.flowHelper.isCurrentFlowCodeFlow()) {
                callback$ = this.codeFlowCallbackService.authorizedCallbackWithCode(currentCallbackUrl);
            }
            else if (this.flowHelper.isCurrentFlowAnyImplicitFlow()) {
                callback$ = this.implicitFlowCallbackService.authorizedImplicitFlowCallback();
            }
            return callback$.pipe(operators.tap(function () { return _this.stsCallbackInternal$.next(); }));
        };
        return CallbackService;
    }());
    CallbackService.ɵfac = function CallbackService_Factory(t) { return new (t || CallbackService)(i0.ɵɵinject(UrlService), i0.ɵɵinject(FlowHelper), i0.ɵɵinject(ImplicitFlowCallbackService), i0.ɵɵinject(CodeFlowCallbackService)); };
    CallbackService.ɵprov = i0.ɵɵdefineInjectable({ token: CallbackService, factory: CallbackService.ɵfac, providedIn: 'root' });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(CallbackService, [{
                type: i0.Injectable,
                args: [{ providedIn: 'root' }]
            }], function () { return [{ type: UrlService }, { type: FlowHelper }, { type: ImplicitFlowCallbackService }, { type: CodeFlowCallbackService }]; }, null);
    })();

    var WELL_KNOWN_SUFFIX = "/.well-known/openid-configuration";
    var AuthWellKnownDataService = /** @class */ (function () {
        function AuthWellKnownDataService(http) {
            this.http = http;
        }
        AuthWellKnownDataService.prototype.getWellKnownEndPointsFromUrl = function (authWellknownEndpoint) {
            return this.getWellKnownDocument(authWellknownEndpoint).pipe(operators.map(function (wellKnownEndpoints) { return ({
                issuer: wellKnownEndpoints.issuer,
                jwksUri: wellKnownEndpoints.jwks_uri,
                authorizationEndpoint: wellKnownEndpoints.authorization_endpoint,
                tokenEndpoint: wellKnownEndpoints.token_endpoint,
                userinfoEndpoint: wellKnownEndpoints.userinfo_endpoint,
                endSessionEndpoint: wellKnownEndpoints.end_session_endpoint,
                checkSessionIframe: wellKnownEndpoints.check_session_iframe,
                revocationEndpoint: wellKnownEndpoints.revocation_endpoint,
                introspectionEndpoint: wellKnownEndpoints.introspection_endpoint,
            }); }));
        };
        AuthWellKnownDataService.prototype.getWellKnownDocument = function (wellKnownEndpoint) {
            var url = wellKnownEndpoint;
            if (!wellKnownEndpoint.includes(WELL_KNOWN_SUFFIX)) {
                url = "" + wellKnownEndpoint + WELL_KNOWN_SUFFIX;
            }
            return this.http.get(url);
        };
        return AuthWellKnownDataService;
    }());
    AuthWellKnownDataService.ɵfac = function AuthWellKnownDataService_Factory(t) { return new (t || AuthWellKnownDataService)(i0.ɵɵinject(DataService)); };
    AuthWellKnownDataService.ɵprov = i0.ɵɵdefineInjectable({ token: AuthWellKnownDataService, factory: AuthWellKnownDataService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AuthWellKnownDataService, [{
                type: i0.Injectable
            }], function () { return [{ type: DataService }]; }, null);
    })();

    var AuthWellKnownService = /** @class */ (function () {
        function AuthWellKnownService(publicEventsService, dataService, storagePersistanceService) {
            this.publicEventsService = publicEventsService;
            this.dataService = dataService;
            this.storagePersistanceService = storagePersistanceService;
        }
        AuthWellKnownService.prototype.getAuthWellKnownEndPoints = function (authWellknownEndpoint) {
            var _this = this;
            var alreadySavedWellKnownEndpoints = this.storagePersistanceService.read('authWellKnownEndPoints');
            if (!!alreadySavedWellKnownEndpoints) {
                return rxjs.of(alreadySavedWellKnownEndpoints);
            }
            return this.getWellKnownEndPointsFromUrl(authWellknownEndpoint).pipe(operators.tap(function (mappedWellKnownEndpoints) { return _this.storeWellKnownEndpoints(mappedWellKnownEndpoints); }), operators.catchError(function (error) {
                _this.publicEventsService.fireEvent(exports.EventTypes.ConfigLoadingFailed, null);
                return rxjs.throwError(error);
            }));
        };
        AuthWellKnownService.prototype.storeWellKnownEndpoints = function (mappedWellKnownEndpoints) {
            this.storagePersistanceService.write('authWellKnownEndPoints', mappedWellKnownEndpoints);
        };
        AuthWellKnownService.prototype.getWellKnownEndPointsFromUrl = function (authWellknownEndpoint) {
            return this.dataService.getWellKnownEndPointsFromUrl(authWellknownEndpoint);
        };
        return AuthWellKnownService;
    }());
    AuthWellKnownService.ɵfac = function AuthWellKnownService_Factory(t) { return new (t || AuthWellKnownService)(i0.ɵɵinject(PublicEventsService), i0.ɵɵinject(AuthWellKnownDataService), i0.ɵɵinject(StoragePersistanceService)); };
    AuthWellKnownService.ɵprov = i0.ɵɵdefineInjectable({ token: AuthWellKnownService, factory: AuthWellKnownService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AuthWellKnownService, [{
                type: i0.Injectable
            }], function () { return [{ type: PublicEventsService }, { type: AuthWellKnownDataService }, { type: StoragePersistanceService }]; }, null);
    })();

    var RefreshSessionIframeService = /** @class */ (function () {
        function RefreshSessionIframeService(doc, loggerService, urlService, silentRenewService, rendererFactory) {
            this.doc = doc;
            this.loggerService = loggerService;
            this.urlService = urlService;
            this.silentRenewService = silentRenewService;
            this.renderer = rendererFactory.createRenderer(null, null);
        }
        RefreshSessionIframeService.prototype.refreshSessionWithIframe = function (customParams, authStateLauchedType) {
            this.loggerService.logDebug('BEGIN refresh session Authorize Iframe renew');
            var url = this.urlService.getRefreshSessionSilentRenewUrl(customParams, authStateLauchedType);
            return this.sendAuthorizeReqestUsingSilentRenew(url);
        };
        RefreshSessionIframeService.prototype.sendAuthorizeReqestUsingSilentRenew = function (url) {
            var _this = this;
            var sessionIframe = this.silentRenewService.getOrCreateIframe();
            this.initSilentRenewRequest();
            this.loggerService.logDebug('sendAuthorizeReqestUsingSilentRenew for URL:' + url);
            return new rxjs.Observable(function (observer) {
                var onLoadHandler = function () {
                    sessionIframe.removeEventListener('load', onLoadHandler);
                    _this.loggerService.logDebug('removed event listener from IFrame');
                    observer.next(true);
                    observer.complete();
                };
                sessionIframe.addEventListener('load', onLoadHandler);
                sessionIframe.contentWindow.location.replace(url);
            });
        };
        RefreshSessionIframeService.prototype.initSilentRenewRequest = function () {
            var _this = this;
            var instanceId = Math.random();
            var initDestroyHandler = this.renderer.listen('window', 'oidc-silent-renew-init', function (e) {
                if (e.detail !== instanceId) {
                    initDestroyHandler();
                    renewDestroyHandler();
                }
            });
            var renewDestroyHandler = this.renderer.listen('window', 'oidc-silent-renew-message', function (e) { return _this.silentRenewService.silentRenewEventHandler(e); });
            this.doc.defaultView.dispatchEvent(new CustomEvent('oidc-silent-renew-init', {
                detail: instanceId,
            }));
        };
        return RefreshSessionIframeService;
    }());
    RefreshSessionIframeService.ɵfac = function RefreshSessionIframeService_Factory(t) { return new (t || RefreshSessionIframeService)(i0.ɵɵinject(common.DOCUMENT), i0.ɵɵinject(LoggerService), i0.ɵɵinject(UrlService), i0.ɵɵinject(SilentRenewService), i0.ɵɵinject(i0.RendererFactory2)); };
    RefreshSessionIframeService.ɵprov = i0.ɵɵdefineInjectable({ token: RefreshSessionIframeService, factory: RefreshSessionIframeService.ɵfac, providedIn: 'root' });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(RefreshSessionIframeService, [{
                type: i0.Injectable,
                args: [{ providedIn: 'root' }]
            }], function () {
            return [{ type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [common.DOCUMENT]
                        }] }, { type: LoggerService }, { type: UrlService }, { type: SilentRenewService }, { type: i0.RendererFactory2 }];
        }, null);
    })();

    var RefreshSessionRefreshTokenService = /** @class */ (function () {
        function RefreshSessionRefreshTokenService(loggerService, flowsService, intervallService) {
            this.loggerService = loggerService;
            this.flowsService = flowsService;
            this.intervallService = intervallService;
        }
        RefreshSessionRefreshTokenService.prototype.refreshSessionWithRefreshTokens = function (customParams) {
            var _this = this;
            this.loggerService.logDebug('BEGIN refresh session Authorize');
            return this.flowsService.processRefreshToken(customParams).pipe(operators.catchError(function (error) {
                _this.intervallService.stopPeriodicallTokenCheck();
                _this.flowsService.resetAuthorizationData();
                return rxjs.throwError(error);
            }));
        };
        return RefreshSessionRefreshTokenService;
    }());
    RefreshSessionRefreshTokenService.ɵfac = function RefreshSessionRefreshTokenService_Factory(t) { return new (t || RefreshSessionRefreshTokenService)(i0.ɵɵinject(LoggerService), i0.ɵɵinject(FlowsService), i0.ɵɵinject(IntervallService)); };
    RefreshSessionRefreshTokenService.ɵprov = i0.ɵɵdefineInjectable({ token: RefreshSessionRefreshTokenService, factory: RefreshSessionRefreshTokenService.ɵfac, providedIn: 'root' });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(RefreshSessionRefreshTokenService, [{
                type: i0.Injectable,
                args: [{ providedIn: 'root' }]
            }], function () { return [{ type: LoggerService }, { type: FlowsService }, { type: IntervallService }]; }, null);
    })();

    var MAX_RETRY_ATTEMPTS = 3;
    var RefreshSessionService = /** @class */ (function () {
        function RefreshSessionService(flowHelper, configurationProvider, flowsDataService, loggerService, silentRenewService, authStateService, authWellKnownService, refreshSessionIframeService, refreshSessionRefreshTokenService, tabsSynchronizationService) {
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
        RefreshSessionService.prototype.forceRefreshSession = function (customParams) {
            var _this = this;
            if (this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                return this.startRefreshSession(customParams).pipe(operators.map(function () {
                    var isAuthenticated = _this.authStateService.areAuthStorageTokensValid();
                    if (isAuthenticated) {
                        return {
                            idToken: _this.authStateService.getIdToken(),
                            accessToken: _this.authStateService.getAccessToken(),
                        };
                    }
                    return null;
                }));
            }
            return this.silentRenewCase();
        };
        RefreshSessionService.prototype.silentRenewCase = function (customParams, currentRetry) {
            var _this = this;
            this.loggerService.logDebug("silentRenewCase CURRENT RETRY ATTEMPT #" + currentRetry);
            if (currentRetry && currentRetry > MAX_RETRY_ATTEMPTS) {
                return rxjs.throwError(new Error('Initializatin has been failed. Exceeded max retry attepmts.'));
            }
            return rxjs.from(this.tabsSynchronizationService.isLeaderCheck()).pipe(operators.timeout(2000), operators.take(1), operators.switchMap(function (isLeader) {
                if (isLeader) {
                    _this.loggerService.logDebug("forceRefreshSession WE ARE LEADER");
                    return rxjs.forkJoin([
                        _this.startRefreshSession(customParams),
                        _this.silentRenewService.refreshSessionWithIFrameCompleted$.pipe(operators.take(1)),
                    ]).pipe(operators.timeout(5000), operators.map(function (_c) {
                        var _d = __read(_c, 2), _ = _d[0], callbackContext = _d[1];
                        var _a, _b;
                        var isAuthenticated = _this.authStateService.areAuthStorageTokensValid();
                        if (isAuthenticated) {
                            return {
                                idToken: (_a = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult) === null || _a === void 0 ? void 0 : _a.id_token,
                                accessToken: (_b = callbackContext === null || callbackContext === void 0 ? void 0 : callbackContext.authResult) === null || _b === void 0 ? void 0 : _b.access_token,
                            };
                        }
                        return null;
                    }), operators.catchError(function (error) {
                        if (error instanceof rxjs.TimeoutError) {
                            _this.loggerService.logWarning("forceRefreshSession WE ARE LEADER > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)");
                            if (currentRetry) {
                                currentRetry++;
                            }
                            else {
                                currentRetry = 1;
                            }
                            return _this.silentRenewCase(customParams, currentRetry).pipe(operators.take(1));
                        }
                        throw error;
                    }));
                }
                else {
                    _this.loggerService.logDebug("forceRefreshSession WE ARE NOT NOT NOT LEADER");
                    return _this.tabsSynchronizationService.getSilentRenewFinishedObservable().pipe(operators.take(1), operators.timeout(5000), operators.map(function () {
                        var isAuthenticated = _this.authStateService.areAuthStorageTokensValid();
                        _this.loggerService.logDebug("forceRefreshSession WE ARE NOT NOT NOT LEADER > getSilentRenewFinishedObservable EMMITS VALUE > isAuthenticated = " + isAuthenticated);
                        if (isAuthenticated) {
                            return {
                                idToken: _this.authStateService.getIdToken(),
                                accessToken: _this.authStateService.getAccessToken(),
                            };
                        }
                        _this.loggerService.logError("forceRefreshSession WE ARE NOT NOT NOT LEADER > getSilentRenewFinishedObservable EMMITS VALUE > isAuthenticated FALSE WE DONT KNOW WAHT TO DO WITH THIS");
                        return null;
                    }), operators.catchError(function (error) {
                        if (error instanceof rxjs.TimeoutError) {
                            _this.loggerService.logWarning("forceRefreshSession WE ARE NOT NOT NOT LEADER > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)");
                            if (currentRetry) {
                                currentRetry++;
                            }
                            else {
                                currentRetry = 1;
                            }
                            return _this.silentRenewCase(customParams, currentRetry).pipe(operators.take(1));
                        }
                        throw error;
                    }));
                }
            }), operators.catchError(function (error) {
                if (error instanceof rxjs.TimeoutError) {
                    _this.loggerService.logWarning("forceRefreshSession > FROM isLeaderCheck > occured TIMEOUT ERROR SO WE RETRY: this.forceRefreshSession(customParams)");
                    if (currentRetry) {
                        currentRetry++;
                    }
                    else {
                        currentRetry = 1;
                    }
                    return _this.silentRenewCase(customParams, currentRetry);
                }
                throw error;
            }));
        };
        RefreshSessionService.prototype.startRefreshSession = function (customParams) {
            var _this = this;
            var _a;
            var isSilentRenewRunning = this.flowsDataService.isSilentRenewRunning();
            this.loggerService.logDebug("Checking: silentRenewRunning: " + isSilentRenewRunning);
            var shouldBeExecuted = !isSilentRenewRunning;
            if (!shouldBeExecuted) {
                return rxjs.of(null);
            }
            var authWellknownEndpointAdress = (_a = this.configurationProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.authWellknownEndpoint;
            if (!authWellknownEndpointAdress) {
                this.loggerService.logError('no authwellknownendpoint given!');
                return rxjs.of(null);
            }
            return this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpointAdress).pipe(operators.switchMap(function () {
                _this.flowsDataService.setSilentRenewRunning();
                if (_this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                    // Refresh Session using Refresh tokens
                    return _this.refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(customParams);
                }
                return _this.refreshSessionIframeService.refreshSessionWithIframe(customParams, 'login');
            }));
        };
        return RefreshSessionService;
    }());
    RefreshSessionService.ɵfac = function RefreshSessionService_Factory(t) { return new (t || RefreshSessionService)(i0.ɵɵinject(FlowHelper), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(FlowsDataService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(SilentRenewService), i0.ɵɵinject(AuthStateService), i0.ɵɵinject(AuthWellKnownService), i0.ɵɵinject(RefreshSessionIframeService), i0.ɵɵinject(RefreshSessionRefreshTokenService), i0.ɵɵinject(TabsSynchronizationService)); };
    RefreshSessionService.ɵprov = i0.ɵɵdefineInjectable({ token: RefreshSessionService, factory: RefreshSessionService.ɵfac, providedIn: 'root' });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(RefreshSessionService, [{
                type: i0.Injectable,
                args: [{ providedIn: 'root' }]
            }], function () { return [{ type: FlowHelper }, { type: ConfigurationProvider }, { type: FlowsDataService }, { type: LoggerService }, { type: SilentRenewService }, { type: AuthStateService }, { type: AuthWellKnownService }, { type: RefreshSessionIframeService }, { type: RefreshSessionRefreshTokenService }, { type: TabsSynchronizationService }]; }, null);
    })();

    var PeriodicallyTokenCheckService = /** @class */ (function () {
        function PeriodicallyTokenCheckService(flowsService, flowHelper, configurationProvider, flowsDataService, loggerService, userService, authStateService, refreshSessionIframeService, refreshSessionRefreshTokenService, intervalService, storagePersistanceService, tabsSynchronizationService) {
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
        PeriodicallyTokenCheckService.prototype.startTokenValidationPeriodically = function (repeatAfterSeconds) {
            var _this = this;
            if (!!this.intervalService.runTokenValidationRunning || !this.configurationProvider.openIDConfiguration.silentRenew) {
                return;
            }
            this.loggerService.logDebug("starting token validation check every " + repeatAfterSeconds + "s");
            var periodicallyCheck$ = this.intervalService.startPeriodicTokenCheck(repeatAfterSeconds).pipe(operators.switchMap(function () {
                var idToken = _this.authStateService.getIdToken();
                var isSilentRenewRunning = _this.flowsDataService.isSilentRenewRunning();
                var userDataFromStore = _this.userService.getUserDataFromStore();
                _this.loggerService.logDebug("Checking: silentRenewRunning: " + isSilentRenewRunning + " id_token: " + !!idToken + " userData: " + !!userDataFromStore);
                var shouldBeExecuted = userDataFromStore && !isSilentRenewRunning && idToken;
                if (!shouldBeExecuted) {
                    return rxjs.of(null);
                }
                if (_this.tabsSynchronizationService.isClosed) {
                    _this.loggerService.logWarning('startTokenValidationPeriodically > this.tabsSynchronizationService.isClosed = TRUE - so we re-initialize');
                    _this.tabsSynchronizationService.reInitialize();
                }
                var idTokenHasExpired = _this.authStateService.hasIdTokenExpired();
                var accessTokenHasExpired = _this.authStateService.hasAccessTokenExpiredIfExpiryExists();
                if (!idTokenHasExpired && !accessTokenHasExpired) {
                    return rxjs.of(null);
                }
                if (!_this.configurationProvider.openIDConfiguration.silentRenew) {
                    _this.flowsService.resetAuthorizationData();
                    return rxjs.of(null);
                }
                _this.loggerService.logDebug('starting silent renew...');
                return rxjs.from(_this.tabsSynchronizationService.isLeaderCheck()).pipe(operators.take(1), operators.switchMap(function (isLeader) {
                    if (isLeader && !_this.flowsDataService.isSilentRenewRunning()) {
                        _this.flowsDataService.setSilentRenewRunning();
                        // Retrieve Dynamically Set Custom Params
                        var customParams = _this.storagePersistanceService.read('storageCustomRequestParams');
                        if (_this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                            // Refresh Session using Refresh tokens
                            return _this.refreshSessionRefreshTokenService.refreshSessionWithRefreshTokens(customParams);
                        }
                        return _this.refreshSessionIframeService.refreshSessionWithIframe(customParams, 'silent-renew-code');
                    }
                    return rxjs.of(null);
                }));
            }));
            this.intervalService.runTokenValidationRunning = periodicallyCheck$
                .pipe(operators.catchError(function () {
                _this.flowsDataService.resetSilentRenewRunning();
                return rxjs.throwError('periodically check failed');
            }))
                .subscribe(function () {
                _this.loggerService.logDebug('silent renew, periodic check finished!');
                if (_this.flowHelper.isCurrentFlowCodeFlowWithRefreshTokens()) {
                    _this.flowsDataService.resetSilentRenewRunning();
                }
            }, function (err) {
                _this.loggerService.logError('silent renew failed!', err);
            });
        };
        return PeriodicallyTokenCheckService;
    }());
    PeriodicallyTokenCheckService.ɵfac = function PeriodicallyTokenCheckService_Factory(t) { return new (t || PeriodicallyTokenCheckService)(i0.ɵɵinject(FlowsService), i0.ɵɵinject(FlowHelper), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(FlowsDataService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(UserService), i0.ɵɵinject(AuthStateService), i0.ɵɵinject(RefreshSessionIframeService), i0.ɵɵinject(RefreshSessionRefreshTokenService), i0.ɵɵinject(IntervallService), i0.ɵɵinject(StoragePersistanceService), i0.ɵɵinject(TabsSynchronizationService)); };
    PeriodicallyTokenCheckService.ɵprov = i0.ɵɵdefineInjectable({ token: PeriodicallyTokenCheckService, factory: PeriodicallyTokenCheckService.ɵfac, providedIn: 'root' });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(PeriodicallyTokenCheckService, [{
                type: i0.Injectable,
                args: [{ providedIn: 'root' }]
            }], function () { return [{ type: FlowsService }, { type: FlowHelper }, { type: ConfigurationProvider }, { type: FlowsDataService }, { type: LoggerService }, { type: UserService }, { type: AuthStateService }, { type: RefreshSessionIframeService }, { type: RefreshSessionRefreshTokenService }, { type: IntervallService }, { type: StoragePersistanceService }, { type: TabsSynchronizationService }]; }, null);
    })();

    var PopUpService = /** @class */ (function () {
        function PopUpService() {
            this.receivedUrlInternal$ = new rxjs.Subject();
        }
        Object.defineProperty(PopUpService.prototype, "receivedUrl$", {
            get: function () {
                return this.receivedUrlInternal$.asObservable();
            },
            enumerable: false,
            configurable: true
        });
        PopUpService.prototype.isCurrentlyInPopup = function () {
            return !!window.opener && window.opener !== window;
        };
        PopUpService.prototype.openPopUp = function (url, popupOptions) {
            var _this = this;
            var optionsToPass = this.getOptions(popupOptions);
            this.popUp = window.open(url, '_blank', optionsToPass);
            var listener = function (event) {
                if (!(event === null || event === void 0 ? void 0 : event.data) || typeof event.data !== 'string') {
                    return;
                }
                _this.receivedUrlInternal$.next(event.data);
                _this.cleanUp(listener);
            };
            window.addEventListener('message', listener, false);
        };
        PopUpService.prototype.sendMessageToMainWindow = function (url) {
            if (window.opener) {
                this.sendMessage(url, window.location.href);
            }
        };
        PopUpService.prototype.cleanUp = function (listener) {
            window.removeEventListener('message', listener, false);
            if (this.popUp) {
                this.popUp.close();
                this.popUp = null;
            }
        };
        PopUpService.prototype.sendMessage = function (url, href) {
            window.opener.postMessage(url, href);
        };
        PopUpService.prototype.getOptions = function (popupOptions) {
            var popupDefaultOptions = { width: 500, height: 500, left: 50, top: 50 };
            var options = Object.assign(Object.assign({}, popupDefaultOptions), (popupOptions || {}));
            return Object.entries(options)
                .map(function (_a) {
                var _b = __read(_a, 2), key = _b[0], value = _b[1];
                return encodeURIComponent(key) + "=" + encodeURIComponent(value);
            })
                .join(',');
        };
        return PopUpService;
    }());
    PopUpService.ɵfac = function PopUpService_Factory(t) { return new (t || PopUpService)(); };
    PopUpService.ɵprov = i0.ɵɵdefineInjectable({ token: PopUpService, factory: PopUpService.ɵfac, providedIn: 'root' });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(PopUpService, [{
                type: i0.Injectable,
                args: [{ providedIn: 'root' }]
            }], null, null);
    })();

    var CheckAuthService = /** @class */ (function () {
        function CheckAuthService(doc, checkSessionService, silentRenewService, userService, loggerService, configurationProvider, authStateService, callbackService, refreshSessionService, periodicallyTokenCheckService, popupService) {
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
        CheckAuthService.prototype.checkAuth = function (url) {
            var _this = this;
            if (!this.configurationProvider.hasValidConfig()) {
                this.loggerService.logError('Please provide a configuration before setting up the module');
                return rxjs.of(false);
            }
            this.loggerService.logDebug('STS server: ' + this.configurationProvider.openIDConfiguration.stsServer);
            var currentUrl = url || this.doc.defaultView.location.toString();
            if (this.popupService.isCurrentlyInPopup()) {
                this.popupService.sendMessageToMainWindow(currentUrl);
                return rxjs.of(null);
            }
            var isCallback = this.callbackService.isCallback(currentUrl);
            this.loggerService.logDebug('currentUrl to check auth with: ', currentUrl);
            var callback$ = isCallback ? this.callbackService.handleCallbackAndFireEvents(currentUrl) : rxjs.of(null);
            return callback$.pipe(operators.map(function () {
                var isAuthenticated = _this.authStateService.areAuthStorageTokensValid();
                if (isAuthenticated) {
                    _this.startCheckSessionAndValidation();
                    if (!isCallback) {
                        _this.authStateService.setAuthorizedAndFireEvent();
                        _this.userService.publishUserDataIfExists();
                    }
                }
                _this.loggerService.logDebug('checkAuth completed fired events, auth: ' + isAuthenticated);
                return isAuthenticated;
            }), operators.catchError(function () { return rxjs.of(false); }));
        };
        CheckAuthService.prototype.checkAuthIncludingServer = function () {
            var _this = this;
            return this.checkAuth().pipe(operators.switchMap(function (isAuthenticated) {
                if (isAuthenticated) {
                    return rxjs.of(isAuthenticated);
                }
                return _this.refreshSessionService.forceRefreshSession().pipe(operators.map(function (result) { return !!(result === null || result === void 0 ? void 0 : result.idToken) && !!(result === null || result === void 0 ? void 0 : result.accessToken); }), operators.switchMap(function (isAuth) {
                    if (isAuth) {
                        _this.startCheckSessionAndValidation();
                    }
                    return rxjs.of(isAuth);
                }));
            }));
        };
        CheckAuthService.prototype.startCheckSessionAndValidation = function () {
            if (this.checkSessionService.isCheckSessionConfigured()) {
                this.checkSessionService.start();
            }
            this.periodicallyTokenCheckService.startTokenValidationPeriodically(this.configurationProvider.openIDConfiguration.tokenRefreshInSeconds);
            if (this.silentRenewService.isSilentRenewConfigured()) {
                this.silentRenewService.getOrCreateIframe();
            }
        };
        return CheckAuthService;
    }());
    CheckAuthService.ɵfac = function CheckAuthService_Factory(t) { return new (t || CheckAuthService)(i0.ɵɵinject(common.DOCUMENT), i0.ɵɵinject(CheckSessionService), i0.ɵɵinject(SilentRenewService), i0.ɵɵinject(UserService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(AuthStateService), i0.ɵɵinject(CallbackService), i0.ɵɵinject(RefreshSessionService), i0.ɵɵinject(PeriodicallyTokenCheckService), i0.ɵɵinject(PopUpService)); };
    CheckAuthService.ɵprov = i0.ɵɵdefineInjectable({ token: CheckAuthService, factory: CheckAuthService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(CheckAuthService, [{
                type: i0.Injectable
            }], function () {
            return [{ type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [common.DOCUMENT]
                        }] }, { type: CheckSessionService }, { type: SilentRenewService }, { type: UserService }, { type: LoggerService }, { type: ConfigurationProvider }, { type: AuthStateService }, { type: CallbackService }, { type: RefreshSessionService }, { type: PeriodicallyTokenCheckService }, { type: PopUpService }];
        }, null);
    })();

    var POSITIVE_VALIDATION_RESULT = {
        result: true,
        messages: [],
        level: null,
    };

    var ensureClientId = function (passedConfig) {
        if (!passedConfig.clientId) {
            return {
                result: false,
                messages: ['The clientId is required and missing from your config!'],
                level: 'error',
            };
        }
        return POSITIVE_VALIDATION_RESULT;
    };

    var ensureRedirectRule = function (passedConfig) {
        if (!passedConfig.redirectUrl) {
            return {
                result: false,
                messages: ['The redirectURL is required and missing from your config'],
                level: 'error',
            };
        }
        return POSITIVE_VALIDATION_RESULT;
    };

    var ensureSilentRenewUrlWhenNoRefreshTokenUsed = function (passedConfig) {
        var usesSilentRenew = passedConfig.silentRenew;
        var usesRefreshToken = passedConfig.useRefreshToken;
        var hasSilentRenewUrl = passedConfig.silentRenewUrl;
        if (usesSilentRenew && !usesRefreshToken && !hasSilentRenewUrl) {
            return {
                result: false,
                messages: ['Please provide a silent renew URL if using renew and not refresh tokens'],
                level: 'error',
            };
        }
        return POSITIVE_VALIDATION_RESULT;
    };

    var ensureStsServer = function (passedConfig) {
        if (!passedConfig.stsServer) {
            return {
                result: false,
                messages: ['The STS URL MUST be provided in the configuration!'],
                level: 'error',
            };
        }
        return POSITIVE_VALIDATION_RESULT;
    };

    var useOfflineScopeWithSilentRenew = function (passedConfig) {
        var hasRefreshToken = passedConfig.useRefreshToken;
        var hasSilentRenew = passedConfig.silentRenew;
        var scope = passedConfig.scope || '';
        var hasOfflineScope = scope.split(' ').includes('offline_access');
        if (hasRefreshToken && hasSilentRenew && !hasOfflineScope) {
            return {
                result: false,
                messages: ['When using silent renew and refresh tokens please set the `offline_access` scope'],
                level: 'error',
            };
        }
        return POSITIVE_VALIDATION_RESULT;
    };

    var allRules = [
        ensureStsServer,
        useOfflineScopeWithSilentRenew,
        ensureRedirectRule,
        ensureClientId,
        ensureSilentRenewUrlWhenNoRefreshTokenUsed,
    ];

    var ConfigValidationService = /** @class */ (function () {
        function ConfigValidationService(loggerService) {
            this.loggerService = loggerService;
        }
        ConfigValidationService.prototype.validateConfig = function (passedConfig) {
            var _this = this;
            var allValidationResults = allRules.map(function (rule) { return rule(passedConfig); });
            var allMessages = allValidationResults.filter(function (x) { return x.messages.length > 0; });
            var allErrorMessages = this.getAllMessagesOfType('error', allMessages);
            var allWarnings = this.getAllMessagesOfType('warning', allMessages);
            allErrorMessages.map(function (message) { return _this.loggerService.logError(message); });
            allWarnings.map(function (message) { return _this.loggerService.logWarning(message); });
            return allErrorMessages.length === 0;
        };
        ConfigValidationService.prototype.getAllMessagesOfType = function (type, results) {
            var allMessages = results.filter(function (x) { return x.level === type; }).map(function (result) { return result.messages; });
            return allMessages.reduce(function (acc, val) { return acc.concat(val); }, []);
        };
        return ConfigValidationService;
    }());
    ConfigValidationService.ɵfac = function ConfigValidationService_Factory(t) { return new (t || ConfigValidationService)(i0.ɵɵinject(LoggerService)); };
    ConfigValidationService.ɵprov = i0.ɵɵdefineInjectable({ token: ConfigValidationService, factory: ConfigValidationService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(ConfigValidationService, [{
                type: i0.Injectable
            }], function () { return [{ type: LoggerService }]; }, null);
    })();

    var OidcConfigService = /** @class */ (function () {
        function OidcConfigService(loggerService, publicEventsService, configurationProvider, authWellKnownService, storagePersistanceService, configValidationService) {
            this.loggerService = loggerService;
            this.publicEventsService = publicEventsService;
            this.configurationProvider = configurationProvider;
            this.authWellKnownService = authWellKnownService;
            this.storagePersistanceService = storagePersistanceService;
            this.configValidationService = configValidationService;
        }
        OidcConfigService.prototype.withConfig = function (passedConfig, passedAuthWellKnownEndpoints) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                if (!_this.configValidationService.validateConfig(passedConfig)) {
                    _this.loggerService.logError('Validation of config rejected with errors. Config is NOT set.');
                    resolve();
                }
                if (!passedConfig.authWellknownEndpoint) {
                    passedConfig.authWellknownEndpoint = passedConfig.stsServer;
                }
                var usedConfig = _this.configurationProvider.setConfig(passedConfig);
                var alreadyExistingAuthWellKnownEndpoints = _this.storagePersistanceService.read('authWellKnownEndPoints');
                if (!!alreadyExistingAuthWellKnownEndpoints) {
                    _this.publicEventsService.fireEvent(exports.EventTypes.ConfigLoaded, {
                        configuration: passedConfig,
                        wellknown: alreadyExistingAuthWellKnownEndpoints,
                    });
                    resolve();
                }
                if (!!passedAuthWellKnownEndpoints) {
                    _this.authWellKnownService.storeWellKnownEndpoints(passedAuthWellKnownEndpoints);
                    _this.publicEventsService.fireEvent(exports.EventTypes.ConfigLoaded, {
                        configuration: passedConfig,
                        wellknown: passedAuthWellKnownEndpoints,
                    });
                    resolve();
                }
                if (usedConfig.eagerLoadAuthWellKnownEndpoints) {
                    _this.authWellKnownService
                        .getAuthWellKnownEndPoints(usedConfig.authWellknownEndpoint)
                        .pipe(operators.catchError(function (error) {
                        _this.loggerService.logError('Getting auth well known endpoints failed on start', error);
                        return rxjs.throwError(error);
                    }), operators.tap(function (wellknownEndPoints) { return _this.publicEventsService.fireEvent(exports.EventTypes.ConfigLoaded, {
                        configuration: passedConfig,
                        wellknown: wellknownEndPoints,
                    }); }))
                        .subscribe(function () { return resolve(); }, function () { return reject(); });
                }
                else {
                    _this.publicEventsService.fireEvent(exports.EventTypes.ConfigLoaded, {
                        configuration: passedConfig,
                        wellknown: null,
                    });
                    resolve();
                }
            });
        };
        return OidcConfigService;
    }());
    OidcConfigService.ɵfac = function OidcConfigService_Factory(t) { return new (t || OidcConfigService)(i0.ɵɵinject(LoggerService), i0.ɵɵinject(PublicEventsService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(AuthWellKnownService), i0.ɵɵinject(StoragePersistanceService), i0.ɵɵinject(ConfigValidationService)); };
    OidcConfigService.ɵprov = i0.ɵɵdefineInjectable({ token: OidcConfigService, factory: OidcConfigService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(OidcConfigService, [{
                type: i0.Injectable
            }], function () { return [{ type: LoggerService }, { type: PublicEventsService }, { type: ConfigurationProvider }, { type: AuthWellKnownService }, { type: StoragePersistanceService }, { type: ConfigValidationService }]; }, null);
    })();

    var RedirectService = /** @class */ (function () {
        function RedirectService(doc) {
            this.doc = doc;
        }
        RedirectService.prototype.redirectTo = function (url) {
            this.doc.location.href = url;
        };
        return RedirectService;
    }());
    RedirectService.ɵfac = function RedirectService_Factory(t) { return new (t || RedirectService)(i0.ɵɵinject(common.DOCUMENT)); };
    RedirectService.ɵprov = i0.ɵɵdefineInjectable({ token: RedirectService, factory: RedirectService.ɵfac, providedIn: 'root' });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(RedirectService, [{
                type: i0.Injectable,
                args: [{ providedIn: 'root' }]
            }], function () {
            return [{ type: undefined, decorators: [{
                            type: i0.Inject,
                            args: [common.DOCUMENT]
                        }] }];
        }, null);
    })();

    var LoginService = /** @class */ (function () {
        function LoginService(loggerService, tokenValidationService, urlService, redirectService, configurationProvider, authWellKnownService, popupService, checkAuthService, userService, authStateService) {
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
        LoginService.prototype.login = function (authOptions) {
            var _this = this;
            if (!this.tokenValidationService.hasConfigValidResponseType()) {
                this.loggerService.logError('Invalid response type!');
                return;
            }
            var authWellknownEndpoint = this.configurationProvider.openIDConfiguration.authWellknownEndpoint;
            if (!authWellknownEndpoint) {
                this.loggerService.logError('no authWellknownEndpoint given!');
                return;
            }
            this.loggerService.logDebug('BEGIN Authorize OIDC Flow, no auth data');
            this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpoint).subscribe(function () {
                var _a = authOptions || {}, urlHandler = _a.urlHandler, customParams = _a.customParams;
                var url = _this.urlService.getAuthorizeUrl(customParams);
                if (!url) {
                    _this.loggerService.logError('Could not create url', url);
                    return;
                }
                if (urlHandler) {
                    urlHandler(url);
                }
                else {
                    _this.redirectService.redirectTo(url);
                }
            });
        };
        LoginService.prototype.loginWithPopUp = function (authOptions, popupOptions) {
            var _this = this;
            if (!this.tokenValidationService.hasConfigValidResponseType()) {
                this.loggerService.logError('Invalid response type!');
                return;
            }
            var authWellknownEndpoint = this.configurationProvider.openIDConfiguration.authWellknownEndpoint;
            if (!authWellknownEndpoint) {
                this.loggerService.logError('no authWellknownEndpoint given!');
                return;
            }
            this.loggerService.logDebug('BEGIN Authorize OIDC Flow with popup, no auth data');
            return this.authWellKnownService.getAuthWellKnownEndPoints(authWellknownEndpoint).pipe(operators.switchMap(function () {
                var customParams = (authOptions || {}).customParams;
                var authUrl = _this.urlService.getAuthorizeUrl(customParams);
                _this.popupService.openPopUp(authUrl, popupOptions);
                return _this.popupService.receivedUrl$.pipe(operators.switchMap(function (url) { return _this.checkAuthService.checkAuth(url); }), operators.map(function (isAuthenticated) { return ({
                    isAuthenticated: isAuthenticated,
                    userData: _this.userService.getUserDataFromStore(),
                    accessToken: _this.authStateService.getAccessToken(),
                }); }));
            }));
        };
        return LoginService;
    }());
    LoginService.ɵfac = function LoginService_Factory(t) { return new (t || LoginService)(i0.ɵɵinject(LoggerService), i0.ɵɵinject(TokenValidationService), i0.ɵɵinject(UrlService), i0.ɵɵinject(RedirectService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(AuthWellKnownService), i0.ɵɵinject(PopUpService), i0.ɵɵinject(CheckAuthService), i0.ɵɵinject(UserService), i0.ɵɵinject(AuthStateService)); };
    LoginService.ɵprov = i0.ɵɵdefineInjectable({ token: LoginService, factory: LoginService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(LoginService, [{
                type: i0.Injectable
            }], function () { return [{ type: LoggerService }, { type: TokenValidationService }, { type: UrlService }, { type: RedirectService }, { type: ConfigurationProvider }, { type: AuthWellKnownService }, { type: PopUpService }, { type: CheckAuthService }, { type: UserService }, { type: AuthStateService }]; }, null);
    })();

    var LogoffRevocationService = /** @class */ (function () {
        function LogoffRevocationService(dataService, storagePersistanceService, loggerService, urlService, checkSessionService, flowsService, redirectService, tabsSynchronizationService) {
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
        LogoffRevocationService.prototype.logoff = function (urlHandler) {
            this.loggerService.logDebug('logoff, remove auth ');
            this.tabsSynchronizationService.closeTabSynchronization();
            var endSessionUrl = this.getEndSessionUrl();
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
        };
        LogoffRevocationService.prototype.logoffLocal = function () {
            this.tabsSynchronizationService.closeTabSynchronization();
            this.flowsService.resetAuthorizationData();
        };
        // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
        // only the access token is revoked. Then the logout run.
        LogoffRevocationService.prototype.logoffAndRevokeTokens = function (urlHandler) {
            var _this = this;
            var _a;
            if (!((_a = this.storagePersistanceService.read('authWellKnownEndPoints')) === null || _a === void 0 ? void 0 : _a.revocationEndpoint)) {
                this.loggerService.logDebug('revocation endpoint not supported');
                this.logoff(urlHandler);
            }
            if (this.storagePersistanceService.getRefreshToken()) {
                return this.revokeRefreshToken().pipe(operators.switchMap(function (result) { return _this.revokeAccessToken(result); }), operators.catchError(function (error) {
                    var errorMessage = "revoke token failed";
                    _this.loggerService.logError(errorMessage, error);
                    return rxjs.throwError(errorMessage);
                }), operators.tap(function () { return _this.logoff(urlHandler); }));
            }
            else {
                return this.revokeAccessToken().pipe(operators.catchError(function (error) {
                    var errorMessage = "revoke access token failed";
                    _this.loggerService.logError(errorMessage, error);
                    return rxjs.throwError(errorMessage);
                }), operators.tap(function () { return _this.logoff(urlHandler); }));
            }
        };
        // https://tools.ietf.org/html/rfc7009
        // revokes an access token on the STS. If no token is provided, then the token from
        // the storage is revoked. You can pass any token to revoke. This makes it possible to
        // manage your own tokens. The is a public API.
        LogoffRevocationService.prototype.revokeAccessToken = function (accessToken) {
            var _this = this;
            var accessTok = accessToken || this.storagePersistanceService.getAccessToken();
            var body = this.urlService.createRevocationEndpointBodyAccessToken(accessTok);
            var url = this.urlService.getRevocationEndpointUrl();
            var headers = new i1.HttpHeaders();
            headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
            return this.dataService.post(url, body, headers).pipe(operators.switchMap(function (response) {
                _this.loggerService.logDebug('revocation endpoint post response: ', response);
                return rxjs.of(response);
            }), operators.catchError(function (error) {
                var errorMessage = "Revocation request failed";
                _this.loggerService.logError(errorMessage, error);
                return rxjs.throwError(errorMessage);
            }));
        };
        // https://tools.ietf.org/html/rfc7009
        // revokes an refresh token on the STS. This is only required in the code flow with refresh tokens.
        // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
        // This makes it possible to manage your own tokens.
        LogoffRevocationService.prototype.revokeRefreshToken = function (refreshToken) {
            var _this = this;
            var refreshTok = refreshToken || this.storagePersistanceService.getRefreshToken();
            var body = this.urlService.createRevocationEndpointBodyRefreshToken(refreshTok);
            var url = this.urlService.getRevocationEndpointUrl();
            var headers = new i1.HttpHeaders();
            headers = headers.set('Content-Type', 'application/x-www-form-urlencoded');
            return this.dataService.post(url, body, headers).pipe(operators.switchMap(function (response) {
                _this.loggerService.logDebug('revocation endpoint post response: ', response);
                return rxjs.of(response);
            }), operators.catchError(function (error) {
                var errorMessage = "Revocation request failed";
                _this.loggerService.logError(errorMessage, error);
                return rxjs.throwError(errorMessage);
            }));
        };
        LogoffRevocationService.prototype.getEndSessionUrl = function () {
            var idToken = this.storagePersistanceService.getIdToken();
            return this.urlService.createEndSessionUrl(idToken);
        };
        return LogoffRevocationService;
    }());
    LogoffRevocationService.ɵfac = function LogoffRevocationService_Factory(t) { return new (t || LogoffRevocationService)(i0.ɵɵinject(DataService), i0.ɵɵinject(StoragePersistanceService), i0.ɵɵinject(LoggerService), i0.ɵɵinject(UrlService), i0.ɵɵinject(CheckSessionService), i0.ɵɵinject(FlowsService), i0.ɵɵinject(RedirectService), i0.ɵɵinject(TabsSynchronizationService)); };
    LogoffRevocationService.ɵprov = i0.ɵɵdefineInjectable({ token: LogoffRevocationService, factory: LogoffRevocationService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(LogoffRevocationService, [{
                type: i0.Injectable
            }], function () { return [{ type: DataService }, { type: StoragePersistanceService }, { type: LoggerService }, { type: UrlService }, { type: CheckSessionService }, { type: FlowsService }, { type: RedirectService }, { type: TabsSynchronizationService }]; }, null);
    })();

    var OidcSecurityService = /** @class */ (function () {
        function OidcSecurityService(checkSessionService, checkAuthService, userService, tokenHelperService, configurationProvider, authStateService, flowsDataService, callbackService, logoffRevocationService, loginService, storagePersistanceService, refreshSessionService) {
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
        Object.defineProperty(OidcSecurityService.prototype, "configuration", {
            get: function () {
                return {
                    configuration: this.configurationProvider.openIDConfiguration,
                    wellknown: this.storagePersistanceService.read('authWellKnownEndPoints'),
                };
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OidcSecurityService.prototype, "userData$", {
            get: function () {
                return this.userService.userData$;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OidcSecurityService.prototype, "isAuthenticated$", {
            get: function () {
                return this.authStateService.authorized$;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OidcSecurityService.prototype, "checkSessionChanged$", {
            get: function () {
                return this.checkSessionService.checkSessionChanged$;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(OidcSecurityService.prototype, "stsCallback$", {
            get: function () {
                return this.callbackService.stsCallback$;
            },
            enumerable: false,
            configurable: true
        });
        OidcSecurityService.prototype.checkAuth = function (url) {
            return this.checkAuthService.checkAuth(url);
        };
        OidcSecurityService.prototype.checkAuthIncludingServer = function () {
            return this.checkAuthService.checkAuthIncludingServer();
        };
        OidcSecurityService.prototype.getToken = function () {
            return this.authStateService.getAccessToken();
        };
        OidcSecurityService.prototype.getIdToken = function () {
            return this.authStateService.getIdToken();
        };
        OidcSecurityService.prototype.getRefreshToken = function () {
            return this.authStateService.getRefreshToken();
        };
        OidcSecurityService.prototype.getPayloadFromIdToken = function (encode) {
            if (encode === void 0) { encode = false; }
            var token = this.getIdToken();
            return this.tokenHelperService.getPayloadFromToken(token, encode);
        };
        OidcSecurityService.prototype.setState = function (state) {
            this.flowsDataService.setAuthStateControl(state);
        };
        OidcSecurityService.prototype.getState = function () {
            return this.flowsDataService.getAuthStateControl();
        };
        // Code Flow with PCKE or Implicit Flow
        OidcSecurityService.prototype.authorize = function (authOptions) {
            if (authOptions === null || authOptions === void 0 ? void 0 : authOptions.customParams) {
                this.storagePersistanceService.write('storageCustomRequestParams', authOptions.customParams);
            }
            this.loginService.login(authOptions);
        };
        OidcSecurityService.prototype.authorizeWithPopUp = function (authOptions) {
            if (authOptions === null || authOptions === void 0 ? void 0 : authOptions.customParams) {
                this.storagePersistanceService.write('storageCustomRequestParams', authOptions.customParams);
            }
            return this.loginService.loginWithPopUp(authOptions);
        };
        OidcSecurityService.prototype.forceRefreshSession = function (customParams) {
            if (customParams) {
                this.storagePersistanceService.write('storageCustomRequestParams', customParams);
            }
            return this.refreshSessionService.forceRefreshSession(customParams);
        };
        // The refresh token and and the access token are revoked on the server. If the refresh token does not exist
        // only the access token is revoked. Then the logout run.
        OidcSecurityService.prototype.logoffAndRevokeTokens = function (urlHandler) {
            return this.logoffRevocationService.logoffAndRevokeTokens(urlHandler);
        };
        // Logs out on the server and the local client.
        // If the server state has changed, checksession, then only a local logout.
        OidcSecurityService.prototype.logoff = function (urlHandler) {
            return this.logoffRevocationService.logoff(urlHandler);
        };
        OidcSecurityService.prototype.logoffLocal = function () {
            return this.logoffRevocationService.logoffLocal();
        };
        // https://tools.ietf.org/html/rfc7009
        // revokes an access token on the STS. This is only required in the code flow with refresh tokens.
        // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
        // This makes it possible to manage your own tokens.
        OidcSecurityService.prototype.revokeAccessToken = function (accessToken) {
            return this.logoffRevocationService.revokeAccessToken(accessToken);
        };
        // https://tools.ietf.org/html/rfc7009
        // revokes a refresh token on the STS. This is only required in the code flow with refresh tokens.
        // If no token is provided, then the token from the storage is revoked. You can pass any token to revoke.
        // This makes it possible to manage your own tokens.
        OidcSecurityService.prototype.revokeRefreshToken = function (refreshToken) {
            return this.logoffRevocationService.revokeRefreshToken(refreshToken);
        };
        OidcSecurityService.prototype.getEndSessionUrl = function () {
            return this.logoffRevocationService.getEndSessionUrl();
        };
        return OidcSecurityService;
    }());
    OidcSecurityService.ɵfac = function OidcSecurityService_Factory(t) { return new (t || OidcSecurityService)(i0.ɵɵinject(CheckSessionService), i0.ɵɵinject(CheckAuthService), i0.ɵɵinject(UserService), i0.ɵɵinject(TokenHelperService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(AuthStateService), i0.ɵɵinject(FlowsDataService), i0.ɵɵinject(CallbackService), i0.ɵɵinject(LogoffRevocationService), i0.ɵɵinject(LoginService), i0.ɵɵinject(StoragePersistanceService), i0.ɵɵinject(RefreshSessionService)); };
    OidcSecurityService.ɵprov = i0.ɵɵdefineInjectable({ token: OidcSecurityService, factory: OidcSecurityService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(OidcSecurityService, [{
                type: i0.Injectable
            }], function () { return [{ type: CheckSessionService }, { type: CheckAuthService }, { type: UserService }, { type: TokenHelperService }, { type: ConfigurationProvider }, { type: AuthStateService }, { type: FlowsDataService }, { type: CallbackService }, { type: LogoffRevocationService }, { type: LoginService }, { type: StoragePersistanceService }, { type: RefreshSessionService }]; }, null);
    })();

    var BrowserStorageService = /** @class */ (function () {
        function BrowserStorageService(configProvider, loggerService) {
            this.configProvider = configProvider;
            this.loggerService = loggerService;
        }
        BrowserStorageService.prototype.read = function (key) {
            var _a;
            if (!this.hasStorage()) {
                this.loggerService.logDebug("Wanted to read '" + key + "' but Storage was undefined");
                return false;
            }
            var item = (_a = this.getStorage()) === null || _a === void 0 ? void 0 : _a.getItem(key);
            if (!item) {
                this.loggerService.logDebug("Wanted to read '" + key + "' but nothing was found");
                return null;
            }
            return JSON.parse(item);
        };
        BrowserStorageService.prototype.write = function (key, value) {
            if (!this.hasStorage()) {
                this.loggerService.logDebug("Wanted to write '" + key + "/" + value + "' but Storage was falsy");
                return false;
            }
            var storage = this.getStorage();
            if (!storage) {
                this.loggerService.logDebug("Wanted to write '" + key + "/" + value + "' but Storage was falsy");
                return false;
            }
            value = value || null;
            storage.setItem("" + key, JSON.stringify(value));
            return true;
        };
        BrowserStorageService.prototype.remove = function (key) {
            if (!this.hasStorage()) {
                this.loggerService.logDebug("Wanted to remove '" + key + "' but Storage was falsy");
                return false;
            }
            var storage = this.getStorage();
            if (!storage) {
                this.loggerService.logDebug("Wanted to write '" + key + "' but Storage was falsy");
                return false;
            }
            storage.removeItem("" + key);
            return true;
        };
        BrowserStorageService.prototype.getStorage = function () {
            var _a;
            return (_a = this.configProvider.openIDConfiguration) === null || _a === void 0 ? void 0 : _a.storage;
        };
        BrowserStorageService.prototype.hasStorage = function () {
            return typeof Storage !== 'undefined';
        };
        return BrowserStorageService;
    }());
    BrowserStorageService.ɵfac = function BrowserStorageService_Factory(t) { return new (t || BrowserStorageService)(i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(LoggerService)); };
    BrowserStorageService.ɵprov = i0.ɵɵdefineInjectable({ token: BrowserStorageService, factory: BrowserStorageService.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(BrowserStorageService, [{
                type: i0.Injectable
            }], function () { return [{ type: ConfigurationProvider }, { type: LoggerService }]; }, null);
    })();

    var AuthModule = /** @class */ (function () {
        function AuthModule() {
        }
        AuthModule.forRoot = function (token) {
            if (token === void 0) { token = {}; }
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
        };
        return AuthModule;
    }());
    AuthModule.ɵmod = i0.ɵɵdefineNgModule({ type: AuthModule });
    AuthModule.ɵinj = i0.ɵɵdefineInjector({ factory: function AuthModule_Factory(t) { return new (t || AuthModule)(); }, imports: [[common.CommonModule, i1.HttpClientModule]] });
    (function () { (typeof ngJitMode === "undefined" || ngJitMode) && i0.ɵɵsetNgModuleScope(AuthModule, { imports: [common.CommonModule, i1.HttpClientModule] }); })();
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AuthModule, [{
                type: i0.NgModule,
                args: [{
                        imports: [common.CommonModule, i1.HttpClientModule],
                        declarations: [],
                        exports: [],
                    }]
            }], null, null);
    })();

    var AuthInterceptor = /** @class */ (function () {
        function AuthInterceptor(authStateService, configurationProvider, loggerService) {
            this.authStateService = authStateService;
            this.configurationProvider = configurationProvider;
            this.loggerService = loggerService;
        }
        AuthInterceptor.prototype.intercept = function (req, next) {
            // Ensure we send the token only to routes which are secured
            var secureRoutes = this.configurationProvider.openIDConfiguration.secureRoutes;
            if (!secureRoutes) {
                this.loggerService.logDebug("No routes to check configured");
                return next.handle(req);
            }
            var matchingRoute = secureRoutes.find(function (x) { return req.url.startsWith(x); });
            if (!matchingRoute) {
                this.loggerService.logDebug("Did not find matching route for " + req.url);
                return next.handle(req);
            }
            this.loggerService.logDebug("'" + req.url + "' matches configured route '" + matchingRoute + "'");
            var token = this.authStateService.getAccessToken();
            if (!token) {
                this.loggerService.logDebug("Wanted to add token to " + req.url + " but found no token: '" + token + "'");
                return next.handle(req);
            }
            this.loggerService.logDebug("'" + req.url + "' matches configured route '" + matchingRoute + "', adding token");
            req = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + token),
            });
            return next.handle(req);
        };
        return AuthInterceptor;
    }());
    AuthInterceptor.ɵfac = function AuthInterceptor_Factory(t) { return new (t || AuthInterceptor)(i0.ɵɵinject(AuthStateService), i0.ɵɵinject(ConfigurationProvider), i0.ɵɵinject(LoggerService)); };
    AuthInterceptor.ɵprov = i0.ɵɵdefineInjectable({ token: AuthInterceptor, factory: AuthInterceptor.ɵfac });
    /*@__PURE__*/ (function () {
        i0.ɵsetClassMetadata(AuthInterceptor, [{
                type: i0.Injectable
            }], function () { return [{ type: AuthStateService }, { type: ConfigurationProvider }, { type: LoggerService }]; }, null);
    })();

    var JwtKeys = /** @class */ (function () {
        function JwtKeys() {
            this.keys = [];
        }
        return JwtKeys;
    }());
    var JwtKey = /** @class */ (function () {
        function JwtKey() {
            this.kty = '';
            this.use = '';
            this.kid = '';
            this.x5t = '';
            this.e = '';
            this.n = '';
            this.x5c = [];
        }
        return JwtKey;
    }());

    // Public classes.

    /*
     * Public API Surface of angular-auth-oidc-client
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.AbstractSecurityStorage = AbstractSecurityStorage;
    exports.AuthInterceptor = AuthInterceptor;
    exports.AuthModule = AuthModule;
    exports.JwtKey = JwtKey;
    exports.JwtKeys = JwtKeys;
    exports.LoggerService = LoggerService;
    exports.OidcConfigService = OidcConfigService;
    exports.OidcSecurityService = OidcSecurityService;
    exports.PublicEventsService = PublicEventsService;
    exports.StateValidationResult = StateValidationResult;
    exports.TokenHelperService = TokenHelperService;
    exports.TokenValidationService = TokenValidationService;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=angular-auth-oidc-client.umd.js.map
