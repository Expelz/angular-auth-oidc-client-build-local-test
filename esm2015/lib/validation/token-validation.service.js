import { Injectable } from '@angular/core';
import { hextob64u, KEYUTIL, KJUR } from 'jsrsasign-reduced';
import * as i0 from "@angular/core";
import * as i1 from "../utils/tokenHelper/oidc-token-helper.service";
import * as i2 from "../utils/flowHelper/flow-helper.service";
import * as i3 from "../logging/logger.service";
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
export class TokenValidationService {
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
TokenValidationService.ɵfac = function TokenValidationService_Factory(t) { return new (t || TokenValidationService)(i0.ɵɵinject(i1.TokenHelperService), i0.ɵɵinject(i2.FlowHelper), i0.ɵɵinject(i3.LoggerService)); };
TokenValidationService.ɵprov = i0.ɵɵdefineInjectable({ token: TokenValidationService, factory: TokenValidationService.ɵfac });
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(TokenValidationService, [{
        type: Injectable
    }], function () { return [{ type: i1.TokenHelperService }, { type: i2.FlowHelper }, { type: i3.LoggerService }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9rZW4tdmFsaWRhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Ii4uLy4uLy4uL3Byb2plY3RzL2FuZ3VsYXItYXV0aC1vaWRjLWNsaWVudC9zcmMvIiwic291cmNlcyI6WyJsaWIvdmFsaWRhdGlvbi90b2tlbi12YWxpZGF0aW9uLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQzs7Ozs7QUFLN0QsMkRBQTJEO0FBRTNELFdBQVc7QUFDWCw0R0FBNEc7QUFDNUcsMERBQTBEO0FBQzFELEVBQUU7QUFDRix1SUFBdUk7QUFDdkksdUlBQXVJO0FBQ3ZJLG9FQUFvRTtBQUNwRSxFQUFFO0FBQ0YsbUhBQW1IO0FBQ25ILEVBQUU7QUFDRiw4SEFBOEg7QUFDOUgsRUFBRTtBQUNGLGtJQUFrSTtBQUNsSSwrRkFBK0Y7QUFDL0YsRUFBRTtBQUNGLHFJQUFxSTtBQUNySSxXQUFXO0FBQ1gsK0JBQStCO0FBQy9CLEVBQUU7QUFDRix5SUFBeUk7QUFDekksbUJBQW1CO0FBQ25CLEVBQUU7QUFDRiwrR0FBK0c7QUFDL0csd0hBQXdIO0FBQ3hILEVBQUU7QUFDRix5SEFBeUg7QUFDekgsMklBQTJJO0FBQzNJLHNCQUFzQjtBQUN0QixFQUFFO0FBQ0Ysc0hBQXNIO0FBQ3RILG9GQUFvRjtBQUNwRixFQUFFO0FBQ0YsaUlBQWlJO0FBQ2pJLHNGQUFzRjtBQUV0RiwwQkFBMEI7QUFDMUIsaUlBQWlJO0FBQ2pJLHFJQUFxSTtBQUNySSxrRkFBa0Y7QUFDbEYsaUlBQWlJO0FBQ2pJLG1CQUFtQjtBQUduQixNQUFNLE9BQU8sc0JBQXNCO0lBSWpDLFlBQW9CLGtCQUFzQyxFQUFVLFVBQXNCLEVBQVUsYUFBNEI7UUFBNUcsdUJBQWtCLEdBQWxCLGtCQUFrQixDQUFvQjtRQUFVLGVB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TSxRQUFRLEdBQUcsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXpDLE9BQU8sUUFBUSxDQUFDO0lBQ2xCLENBQUM7O0FBelhNLG1EQUE0QixHQUFHLGtCQUFrQixDQUFDOzRGQUQ5QyxzQkFBc0I7OERBQXRCLHNCQUFzQixXQUF0QixzQkFBc0I7a0RBQXRCLHNCQUFzQjtjQURsQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xyXG5pbXBvcnQgeyBoZXh0b2I2NHUsIEtFWVVUSUwsIEtKVVIgfSBmcm9tICdqc3JzYXNpZ24tcmVkdWNlZCc7XHJcbmltcG9ydCB7IExvZ2dlclNlcnZpY2UgfSBmcm9tICcuLi9sb2dnaW5nL2xvZ2dlci5zZXJ2aWNlJztcclxuaW1wb3J0IHsgRmxvd0hlbHBlciB9IGZyb20gJy4uL3V0aWxzL2Zsb3dIZWxwZXIvZmxvdy1oZWxwZXIuc2VydmljZSc7XHJcbmltcG9ydCB7IFRva2VuSGVscGVyU2VydmljZSB9IGZyb20gJy4uL3V0aWxzL3Rva2VuSGVscGVyL29pZGMtdG9rZW4taGVscGVyLnNlcnZpY2UnO1xyXG5cclxuLy8gaHR0cDovL29wZW5pZC5uZXQvc3BlY3Mvb3BlbmlkLWNvbm5lY3QtaW1wbGljaXQtMV8wLmh0bWxcclxuXHJcbi8vIGlkX3Rva2VuXHJcbi8vIGlkX3Rva2VuIEMxOiBUaGUgSXNzdWVyIElkZW50aWZpZXIgZm9yIHRoZSBPcGVuSUQgUHJvdmlkZXIgKHdoaWNoIGlzIHR5cGljYWxseSBvYnRhaW5lZCBkdXJpbmcgRGlzY292ZXJ5KVxyXG4vLyBNVVNUIGV4YWN0bHkgbWF0Y2ggdGhlIHZhbHVlIG9mIHRoZSBpc3MgKGlzc3VlcikgQ2xhaW0uXHJcbi8vXHJcbi8vIGlkX3Rva2VuIEMyOiBUaGUgQ2xpZW50IE1VU1QgdmFsaWRhdGUgdGhhdCB0aGUgYXVkIChhdWRpZW5jZSkgQ2xhaW0gY29udGFpbnMgaXRzIGNsaWVudF9pZCB2YWx1ZSByZWdpc3RlcmVkIGF0IHRoZSBJc3N1ZXIgaWRlbnRpZmllZFxyXG4vLyBieSB0aGUgaXNzIChpc3N1ZXIpIENsYWltIGFzIGFuIGF1ZGllbmNlLlRoZSBJRCBUb2tlbiBNVVNUIGJlIHJlamVjdGVkIGlmIHRoZSBJRCBUb2tlbiBkb2VzIG5vdCBsaXN0IHRoZSBDbGllbnQgYXMgYSB2YWxpZCBhdWRpZW5jZSxcclxuLy8gb3IgaWYgaXQgY29udGFpbnMgYWRkaXRpb25hbCBhdWRpZW5jZXMgbm90IHRydXN0ZWQgYnkgdGhlIENsaWVudC5cclxuLy9cclxuLy8gaWRfdG9rZW4gQzM6IElmIHRoZSBJRCBUb2tlbiBjb250YWlucyBtdWx0aXBsZSBhdWRpZW5jZXMsIHRoZSBDbGllbnQgU0hPVUxEIHZlcmlmeSB0aGF0IGFuIGF6cCBDbGFpbSBpcyBwcmVzZW50LlxyXG4vL1xyXG4vLyBpZF90b2tlbiBDNDogSWYgYW4gYXpwIChhdXRob3JpemVkIHBhcnR5KSBDbGFpbSBpcyBwcmVzZW50LCB0aGUgQ2xpZW50IFNIT1VMRCB2ZXJpZnkgdGhhdCBpdHMgY2xpZW50X2lkIGlzIHRoZSBDbGFpbSBWYWx1ZS5cclxuLy9cclxuLy8gaWRfdG9rZW4gQzU6IFRoZSBDbGllbnQgTVVTVCB2YWxpZGF0ZSB0aGUgc2lnbmF0dXJlIG9mIHRoZSBJRCBUb2tlbiBhY2NvcmRpbmcgdG8gSldTIFtKV1NdIHVzaW5nIHRoZSBhbGdvcml0aG0gc3BlY2lmaWVkIGluIHRoZVxyXG4vLyBhbGcgSGVhZGVyIFBhcmFtZXRlciBvZiB0aGUgSk9TRSBIZWFkZXIuVGhlIENsaWVudCBNVVNUIHVzZSB0aGUga2V5cyBwcm92aWRlZCBieSB0aGUgSXNzdWVyLlxyXG4vL1xyXG4vLyBpZF90b2tlbiBDNjogVGhlIGFsZyB2YWx1ZSBTSE9VTEQgYmUgUlMyNTYuIFZhbGlkYXRpb24gb2YgdG9rZW5zIHVzaW5nIG90aGVyIHNpZ25pbmcgYWxnb3JpdGhtcyBpcyBkZXNjcmliZWQgaW4gdGhlIE9wZW5JRCBDb25uZWN0XHJcbi8vIENvcmUgMS4wXHJcbi8vIFtPcGVuSUQuQ29yZV0gc3BlY2lmaWNhdGlvbi5cclxuLy9cclxuLy8gaWRfdG9rZW4gQzc6IFRoZSBjdXJyZW50IHRpbWUgTVVTVCBiZSBiZWZvcmUgdGhlIHRpbWUgcmVwcmVzZW50ZWQgYnkgdGhlIGV4cCBDbGFpbSAocG9zc2libHkgYWxsb3dpbmcgZm9yIHNvbWUgc21hbGwgbGVld2F5IHRvIGFjY291bnRcclxuLy8gZm9yIGNsb2NrIHNrZXcpLlxyXG4vL1xyXG4vLyBpZF90b2tlbiBDODogVGhlIGlhdCBDbGFpbSBjYW4gYmUgdXNlZCB0byByZWplY3QgdG9rZW5zIHRoYXQgd2VyZSBpc3N1ZWQgdG9vIGZhciBhd2F5IGZyb20gdGhlIGN1cnJlbnQgdGltZSxcclxuLy8gbGltaXRpbmcgdGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgbm9uY2VzIG5lZWQgdG8gYmUgc3RvcmVkIHRvIHByZXZlbnQgYXR0YWNrcy5UaGUgYWNjZXB0YWJsZSByYW5nZSBpcyBDbGllbnQgc3BlY2lmaWMuXHJcbi8vXHJcbi8vIGlkX3Rva2VuIEM5OiBUaGUgdmFsdWUgb2YgdGhlIG5vbmNlIENsYWltIE1VU1QgYmUgY2hlY2tlZCB0byB2ZXJpZnkgdGhhdCBpdCBpcyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgb25lIHRoYXQgd2FzIHNlbnRcclxuLy8gaW4gdGhlIEF1dGhlbnRpY2F0aW9uIFJlcXVlc3QuVGhlIENsaWVudCBTSE9VTEQgY2hlY2sgdGhlIG5vbmNlIHZhbHVlIGZvciByZXBsYXkgYXR0YWNrcy5UaGUgcHJlY2lzZSBtZXRob2QgZm9yIGRldGVjdGluZyByZXBsYXkgYXR0YWNrc1xyXG4vLyBpcyBDbGllbnQgc3BlY2lmaWMuXHJcbi8vXHJcbi8vIGlkX3Rva2VuIEMxMDogSWYgdGhlIGFjciBDbGFpbSB3YXMgcmVxdWVzdGVkLCB0aGUgQ2xpZW50IFNIT1VMRCBjaGVjayB0aGF0IHRoZSBhc3NlcnRlZCBDbGFpbSBWYWx1ZSBpcyBhcHByb3ByaWF0ZS5cclxuLy8gVGhlIG1lYW5pbmcgYW5kIHByb2Nlc3Npbmcgb2YgYWNyIENsYWltIFZhbHVlcyBpcyBvdXQgb2Ygc2NvcGUgZm9yIHRoaXMgZG9jdW1lbnQuXHJcbi8vXHJcbi8vIGlkX3Rva2VuIEMxMTogV2hlbiBhIG1heF9hZ2UgcmVxdWVzdCBpcyBtYWRlLCB0aGUgQ2xpZW50IFNIT1VMRCBjaGVjayB0aGUgYXV0aF90aW1lIENsYWltIHZhbHVlIGFuZCByZXF1ZXN0IHJlLSBhdXRoZW50aWNhdGlvblxyXG4vLyBpZiBpdCBkZXRlcm1pbmVzIHRvbyBtdWNoIHRpbWUgaGFzIGVsYXBzZWQgc2luY2UgdGhlIGxhc3QgRW5kLSBVc2VyIGF1dGhlbnRpY2F0aW9uLlxyXG5cclxuLy8gQWNjZXNzIFRva2VuIFZhbGlkYXRpb25cclxuLy8gYWNjZXNzX3Rva2VuIEMxOiBIYXNoIHRoZSBvY3RldHMgb2YgdGhlIEFTQ0lJIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBhY2Nlc3NfdG9rZW4gd2l0aCB0aGUgaGFzaCBhbGdvcml0aG0gc3BlY2lmaWVkIGluIEpXQVtKV0FdXHJcbi8vIGZvciB0aGUgYWxnIEhlYWRlciBQYXJhbWV0ZXIgb2YgdGhlIElEIFRva2VuJ3MgSk9TRSBIZWFkZXIuIEZvciBpbnN0YW5jZSwgaWYgdGhlIGFsZyBpcyBSUzI1NiwgdGhlIGhhc2ggYWxnb3JpdGhtIHVzZWQgaXMgU0hBLTI1Ni5cclxuLy8gYWNjZXNzX3Rva2VuIEMyOiBUYWtlIHRoZSBsZWZ0LSBtb3N0IGhhbGYgb2YgdGhlIGhhc2ggYW5kIGJhc2U2NHVybC0gZW5jb2RlIGl0LlxyXG4vLyBhY2Nlc3NfdG9rZW4gQzM6IFRoZSB2YWx1ZSBvZiBhdF9oYXNoIGluIHRoZSBJRCBUb2tlbiBNVVNUIG1hdGNoIHRoZSB2YWx1ZSBwcm9kdWNlZCBpbiB0aGUgcHJldmlvdXMgc3RlcCBpZiBhdF9oYXNoIGlzIHByZXNlbnRcclxuLy8gaW4gdGhlIElEIFRva2VuLlxyXG5cclxuQEluamVjdGFibGUoKVxyXG5leHBvcnQgY2xhc3MgVG9rZW5WYWxpZGF0aW9uU2VydmljZSB7XHJcbiAgc3RhdGljIHJlZnJlc2hUb2tlbk5vbmNlUGxhY2Vob2xkZXIgPSAnLS1SZWZyZXNoVG9rZW4tLSc7XHJcbiAga2V5QWxnb3JpdGhtczogc3RyaW5nW10gPSBbJ0hTMjU2JywgJ0hTMzg0JywgJ0hTNTEyJywgJ1JTMjU2JywgJ1JTMzg0JywgJ1JTNTEyJywgJ0VTMjU2JywgJ0VTMzg0JywgJ1BTMjU2JywgJ1BTMzg0JywgJ1BTNTEyJ107XHJcblxyXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgdG9rZW5IZWxwZXJTZXJ2aWNlOiBUb2tlbkhlbHBlclNlcnZpY2UsIHByaXZhdGUgZmxvd0hlbHBlcjogRmxvd0hlbHBlciwgcHJpdmF0ZSBsb2dnZXJTZXJ2aWNlOiBMb2dnZXJTZXJ2aWNlKSB7fVxyXG5cclxuICAvLyBpZF90b2tlbiBDNzogVGhlIGN1cnJlbnQgdGltZSBNVVNUIGJlIGJlZm9yZSB0aGUgdGltZSByZXByZXNlbnRlZCBieSB0aGUgZXhwIENsYWltXHJcbiAgLy8gKHBvc3NpYmx5IGFsbG93aW5nIGZvciBzb21lIHNtYWxsIGxlZXdheSB0byBhY2NvdW50IGZvciBjbG9jayBza2V3KS5cclxuICBoYXNJZFRva2VuRXhwaXJlZCh0b2tlbjogc3RyaW5nLCBvZmZzZXRTZWNvbmRzPzogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBkZWNvZGVkID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0UGF5bG9hZEZyb21Ub2tlbih0b2tlbiwgZmFsc2UpO1xyXG5cclxuICAgIHJldHVybiAhdGhpcy52YWxpZGF0ZUlkVG9rZW5FeHBOb3RFeHBpcmVkKGRlY29kZWQsIG9mZnNldFNlY29uZHMpO1xyXG4gIH1cclxuXHJcbiAgLy8gaWRfdG9rZW4gQzc6IFRoZSBjdXJyZW50IHRpbWUgTVVTVCBiZSBiZWZvcmUgdGhlIHRpbWUgcmVwcmVzZW50ZWQgYnkgdGhlIGV4cCBDbGFpbVxyXG4gIC8vIChwb3NzaWJseSBhbGxvd2luZyBmb3Igc29tZSBzbWFsbCBsZWV3YXkgdG8gYWNjb3VudCBmb3IgY2xvY2sgc2tldykuXHJcbiAgdmFsaWRhdGVJZFRva2VuRXhwTm90RXhwaXJlZChkZWNvZGVkSWRUb2tlbjogc3RyaW5nLCBvZmZzZXRTZWNvbmRzPzogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCB0b2tlbkV4cGlyYXRpb25EYXRlID0gdGhpcy50b2tlbkhlbHBlclNlcnZpY2UuZ2V0VG9rZW5FeHBpcmF0aW9uRGF0ZShkZWNvZGVkSWRUb2tlbik7XHJcbiAgICBvZmZzZXRTZWNvbmRzID0gb2Zmc2V0U2Vjb25kcyB8fCAwO1xyXG5cclxuICAgIGlmICghdG9rZW5FeHBpcmF0aW9uRGF0ZSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdG9rZW5FeHBpcmF0aW9uVmFsdWUgPSB0b2tlbkV4cGlyYXRpb25EYXRlLnZhbHVlT2YoKTtcclxuICAgIGNvbnN0IG5vd1dpdGhPZmZzZXQgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpLnRvVVRDU3RyaW5nKCkpLnZhbHVlT2YoKSArIG9mZnNldFNlY29uZHMgKiAxMDAwO1xyXG4gICAgY29uc3QgdG9rZW5Ob3RFeHBpcmVkID0gdG9rZW5FeHBpcmF0aW9uVmFsdWUgPiBub3dXaXRoT2Zmc2V0O1xyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgSGFzIGlkX3Rva2VuIGV4cGlyZWQ6ICR7IXRva2VuTm90RXhwaXJlZH0sICR7dG9rZW5FeHBpcmF0aW9uVmFsdWV9ID4gJHtub3dXaXRoT2Zmc2V0fWApO1xyXG5cclxuICAgIC8vIFRva2VuIG5vdCBleHBpcmVkP1xyXG4gICAgcmV0dXJuIHRva2VuTm90RXhwaXJlZDtcclxuICB9XHJcblxyXG4gIHZhbGlkYXRlQWNjZXNzVG9rZW5Ob3RFeHBpcmVkKGFjY2Vzc1Rva2VuRXhwaXJlc0F0OiBEYXRlLCBvZmZzZXRTZWNvbmRzPzogbnVtYmVyKTogYm9vbGVhbiB7XHJcbiAgICAvLyB2YWx1ZSBpcyBvcHRpb25hbCwgc28gaWYgaXQgZG9lcyBub3QgZXhpc3QsIHRoZW4gaXQgaGFzIG5vdCBleHBpcmVkXHJcbiAgICBpZiAoIWFjY2Vzc1Rva2VuRXhwaXJlc0F0KSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIG9mZnNldFNlY29uZHMgPSBvZmZzZXRTZWNvbmRzIHx8IDA7XHJcbiAgICBjb25zdCBhY2Nlc3NUb2tlbkV4cGlyYXRpb25WYWx1ZSA9IGFjY2Vzc1Rva2VuRXhwaXJlc0F0LnZhbHVlT2YoKTtcclxuICAgIGNvbnN0IG5vd1dpdGhPZmZzZXQgPSBuZXcgRGF0ZShuZXcgRGF0ZSgpLnRvVVRDU3RyaW5nKCkpLnZhbHVlT2YoKSArIG9mZnNldFNlY29uZHMgKiAxMDAwO1xyXG4gICAgY29uc3QgdG9rZW5Ob3RFeHBpcmVkID0gYWNjZXNzVG9rZW5FeHBpcmF0aW9uVmFsdWUgPiBub3dXaXRoT2Zmc2V0O1xyXG5cclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZyhgSGFzIGFjY2Vzc190b2tlbiBleHBpcmVkOiAkeyF0b2tlbk5vdEV4cGlyZWR9LCAke2FjY2Vzc1Rva2VuRXhwaXJhdGlvblZhbHVlfSA+ICR7bm93V2l0aE9mZnNldH1gKTtcclxuXHJcbiAgICAvLyBhY2Nlc3MgdG9rZW4gbm90IGV4cGlyZWQ/XHJcbiAgICByZXR1cm4gdG9rZW5Ob3RFeHBpcmVkO1xyXG4gIH1cclxuXHJcbiAgLy8gaXNzXHJcbiAgLy8gUkVRVUlSRUQuIElzc3VlciBJZGVudGlmaWVyIGZvciB0aGUgSXNzdWVyIG9mIHRoZSByZXNwb25zZS5UaGUgaXNzIHZhbHVlIGlzIGEgY2FzZS1zZW5zaXRpdmUgVVJMIHVzaW5nIHRoZVxyXG4gIC8vIGh0dHBzIHNjaGVtZSB0aGF0IGNvbnRhaW5zIHNjaGVtZSwgaG9zdCxcclxuICAvLyBhbmQgb3B0aW9uYWxseSwgcG9ydCBudW1iZXIgYW5kIHBhdGggY29tcG9uZW50cyBhbmQgbm8gcXVlcnkgb3IgZnJhZ21lbnQgY29tcG9uZW50cy5cclxuICAvL1xyXG4gIC8vIHN1YlxyXG4gIC8vIFJFUVVJUkVELiBTdWJqZWN0IElkZW50aWZpZXIuTG9jYWxseSB1bmlxdWUgYW5kIG5ldmVyIHJlYXNzaWduZWQgaWRlbnRpZmllciB3aXRoaW4gdGhlIElzc3VlciBmb3IgdGhlIEVuZC0gVXNlcixcclxuICAvLyB3aGljaCBpcyBpbnRlbmRlZCB0byBiZSBjb25zdW1lZCBieSB0aGUgQ2xpZW50LCBlLmcuLCAyNDQwMDMyMCBvciBBSXRPYXdtd3RXd2NUMGs1MUJheWV3TnZ1dHJKVXFzdmw2cXM3QTQuXHJcbiAgLy8gSXQgTVVTVCBOT1QgZXhjZWVkIDI1NSBBU0NJSSBjaGFyYWN0ZXJzIGluIGxlbmd0aC5UaGUgc3ViIHZhbHVlIGlzIGEgY2FzZS1zZW5zaXRpdmUgc3RyaW5nLlxyXG4gIC8vXHJcbiAgLy8gYXVkXHJcbiAgLy8gUkVRVUlSRUQuIEF1ZGllbmNlKHMpIHRoYXQgdGhpcyBJRCBUb2tlbiBpcyBpbnRlbmRlZCBmb3IuIEl0IE1VU1QgY29udGFpbiB0aGUgT0F1dGggMi4wIGNsaWVudF9pZCBvZiB0aGUgUmVseWluZyBQYXJ0eSBhcyBhblxyXG4gIC8vIGF1ZGllbmNlIHZhbHVlLlxyXG4gIC8vIEl0IE1BWSBhbHNvIGNvbnRhaW4gaWRlbnRpZmllcnMgZm9yIG90aGVyIGF1ZGllbmNlcy5JbiB0aGUgZ2VuZXJhbCBjYXNlLCB0aGUgYXVkIHZhbHVlIGlzIGFuIGFycmF5IG9mIGNhc2Utc2Vuc2l0aXZlIHN0cmluZ3MuXHJcbiAgLy8gSW4gdGhlIGNvbW1vbiBzcGVjaWFsIGNhc2Ugd2hlbiB0aGVyZSBpcyBvbmUgYXVkaWVuY2UsIHRoZSBhdWQgdmFsdWUgTUFZIGJlIGEgc2luZ2xlIGNhc2Utc2Vuc2l0aXZlIHN0cmluZy5cclxuICAvL1xyXG4gIC8vIGV4cFxyXG4gIC8vIFJFUVVJUkVELiBFeHBpcmF0aW9uIHRpbWUgb24gb3IgYWZ0ZXIgd2hpY2ggdGhlIElEIFRva2VuIE1VU1QgTk9UIGJlIGFjY2VwdGVkIGZvciBwcm9jZXNzaW5nLlxyXG4gIC8vIFRoZSBwcm9jZXNzaW5nIG9mIHRoaXMgcGFyYW1ldGVyIHJlcXVpcmVzIHRoYXQgdGhlIGN1cnJlbnQgZGF0ZS8gdGltZSBNVVNUIGJlIGJlZm9yZSB0aGUgZXhwaXJhdGlvbiBkYXRlLyB0aW1lIGxpc3RlZCBpbiB0aGUgdmFsdWUuXHJcbiAgLy8gSW1wbGVtZW50ZXJzIE1BWSBwcm92aWRlIGZvciBzb21lIHNtYWxsIGxlZXdheSwgdXN1YWxseSBubyBtb3JlIHRoYW4gYSBmZXcgbWludXRlcywgdG8gYWNjb3VudCBmb3IgY2xvY2sgc2tldy5cclxuICAvLyBJdHMgdmFsdWUgaXMgYSBKU09OIFtSRkM3MTU5XSBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyBmcm9tIDE5NzAtIDAxIC0gMDFUMDA6IDAwOjAwWiBhcyBtZWFzdXJlZCBpbiBVVEMgdW50aWxcclxuICAvLyB0aGUgZGF0ZS8gdGltZS5cclxuICAvLyBTZWUgUkZDIDMzMzkgW1JGQzMzMzldIGZvciBkZXRhaWxzIHJlZ2FyZGluZyBkYXRlLyB0aW1lcyBpbiBnZW5lcmFsIGFuZCBVVEMgaW4gcGFydGljdWxhci5cclxuICAvL1xyXG4gIC8vIGlhdFxyXG4gIC8vIFJFUVVJUkVELiBUaW1lIGF0IHdoaWNoIHRoZSBKV1Qgd2FzIGlzc3VlZC4gSXRzIHZhbHVlIGlzIGEgSlNPTiBudW1iZXIgcmVwcmVzZW50aW5nIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyBmcm9tXHJcbiAgLy8gMTk3MC0gMDEgLSAwMVQwMDogMDA6IDAwWiBhcyBtZWFzdXJlZFxyXG4gIC8vIGluIFVUQyB1bnRpbCB0aGUgZGF0ZS8gdGltZS5cclxuICB2YWxpZGF0ZVJlcXVpcmVkSWRUb2tlbihkYXRhSWRUb2tlbjogYW55KTogYm9vbGVhbiB7XHJcbiAgICBsZXQgdmFsaWRhdGVkID0gdHJ1ZTtcclxuICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ2lzcycpKSB7XHJcbiAgICAgIHZhbGlkYXRlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnaXNzIGlzIG1pc3NpbmcsIHRoaXMgaXMgcmVxdWlyZWQgaW4gdGhlIGlkX3Rva2VuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnc3ViJykpIHtcclxuICAgICAgdmFsaWRhdGVkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdzdWIgaXMgbWlzc2luZywgdGhpcyBpcyByZXF1aXJlZCBpbiB0aGUgaWRfdG9rZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRhdGFJZFRva2VuLmhhc093blByb3BlcnR5KCdhdWQnKSkge1xyXG4gICAgICB2YWxpZGF0ZWQgPSBmYWxzZTtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2F1ZCBpcyBtaXNzaW5nLCB0aGlzIGlzIHJlcXVpcmVkIGluIHRoZSBpZF90b2tlbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghZGF0YUlkVG9rZW4uaGFzT3duUHJvcGVydHkoJ2V4cCcpKSB7XHJcbiAgICAgIHZhbGlkYXRlZCA9IGZhbHNlO1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnZXhwIGlzIG1pc3NpbmcsIHRoaXMgaXMgcmVxdWlyZWQgaW4gdGhlIGlkX3Rva2VuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFkYXRhSWRUb2tlbi5oYXNPd25Qcm9wZXJ0eSgnaWF0JykpIHtcclxuICAgICAgdmFsaWRhdGVkID0gZmFsc2U7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpYXQgaXMgbWlzc2luZywgdGhpcyBpcyByZXF1aXJlZCBpbiB0aGUgaWRfdG9rZW4nKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdmFsaWRhdGVkO1xyXG4gIH1cclxuXHJcbiAgLy8gaWRfdG9rZW4gQzg6IFRoZSBpYXQgQ2xhaW0gY2FuIGJlIHVzZWQgdG8gcmVqZWN0IHRva2VucyB0aGF0IHdlcmUgaXNzdWVkIHRvbyBmYXIgYXdheSBmcm9tIHRoZSBjdXJyZW50IHRpbWUsXHJcbiAgLy8gbGltaXRpbmcgdGhlIGFtb3VudCBvZiB0aW1lIHRoYXQgbm9uY2VzIG5lZWQgdG8gYmUgc3RvcmVkIHRvIHByZXZlbnQgYXR0YWNrcy5UaGUgYWNjZXB0YWJsZSByYW5nZSBpcyBDbGllbnQgc3BlY2lmaWMuXHJcbiAgdmFsaWRhdGVJZFRva2VuSWF0TWF4T2Zmc2V0KGRhdGFJZFRva2VuOiBhbnksIG1heE9mZnNldEFsbG93ZWRJblNlY29uZHM6IG51bWJlciwgZGlzYWJsZUlhdE9mZnNldFZhbGlkYXRpb246IGJvb2xlYW4pOiBib29sZWFuIHtcclxuICAgIGlmIChkaXNhYmxlSWF0T2Zmc2V0VmFsaWRhdGlvbikge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWRhdGFJZFRva2VuLmhhc093blByb3BlcnR5KCdpYXQnKSkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZGF0ZVRpbWVJYXRJZFRva2VuID0gbmV3IERhdGUoMCk7IC8vIFRoZSAwIGhlcmUgaXMgdGhlIGtleSwgd2hpY2ggc2V0cyB0aGUgZGF0ZSB0byB0aGUgZXBvY2hcclxuICAgIGRhdGVUaW1lSWF0SWRUb2tlbi5zZXRVVENTZWNvbmRzKGRhdGFJZFRva2VuLmlhdCk7XHJcbiAgICBtYXhPZmZzZXRBbGxvd2VkSW5TZWNvbmRzID0gbWF4T2Zmc2V0QWxsb3dlZEluU2Vjb25kcyB8fCAwO1xyXG5cclxuICAgIGNvbnN0IG5vd0luVXRjID0gbmV3IERhdGUobmV3IERhdGUoKS50b1VUQ1N0cmluZygpKTtcclxuICAgIGNvbnN0IGRpZmYgPSBub3dJblV0Yy52YWx1ZU9mKCkgLSBkYXRlVGltZUlhdElkVG9rZW4udmFsdWVPZigpO1xyXG4gICAgY29uc3QgbWF4T2Zmc2V0QWxsb3dlZEluTWlsbGlzZWNvbmRzID0gbWF4T2Zmc2V0QWxsb3dlZEluU2Vjb25kcyAqIDEwMDA7XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKGB2YWxpZGF0ZSBpZCB0b2tlbiBpYXQgbWF4IG9mZnNldCAke2RpZmZ9IDwgJHttYXhPZmZzZXRBbGxvd2VkSW5NaWxsaXNlY29uZHN9YCk7XHJcblxyXG4gICAgaWYgKGRpZmYgPiAwKSB7XHJcbiAgICAgIHJldHVybiBkaWZmIDwgbWF4T2Zmc2V0QWxsb3dlZEluTWlsbGlzZWNvbmRzO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiAtZGlmZiA8IG1heE9mZnNldEFsbG93ZWRJbk1pbGxpc2Vjb25kcztcclxuICB9XHJcblxyXG4gIC8vIGlkX3Rva2VuIEM5OiBUaGUgdmFsdWUgb2YgdGhlIG5vbmNlIENsYWltIE1VU1QgYmUgY2hlY2tlZCB0byB2ZXJpZnkgdGhhdCBpdCBpcyB0aGUgc2FtZSB2YWx1ZSBhcyB0aGUgb25lXHJcbiAgLy8gdGhhdCB3YXMgc2VudCBpbiB0aGUgQXV0aGVudGljYXRpb24gUmVxdWVzdC5UaGUgQ2xpZW50IFNIT1VMRCBjaGVjayB0aGUgbm9uY2UgdmFsdWUgZm9yIHJlcGxheSBhdHRhY2tzLlxyXG4gIC8vIFRoZSBwcmVjaXNlIG1ldGhvZCBmb3IgZGV0ZWN0aW5nIHJlcGxheSBhdHRhY2tzIGlzIENsaWVudCBzcGVjaWZpYy5cclxuXHJcbiAgLy8gSG93ZXZlciB0aGUgbm9uY2UgY2xhaW0gU0hPVUxEIG5vdCBiZSBwcmVzZW50IGZvciB0aGUgcmVmcmVzaF90b2tlbiBncmFudCB0eXBlXHJcbiAgLy8gaHR0cHM6Ly9iaXRidWNrZXQub3JnL29wZW5pZC9jb25uZWN0L2lzc3Vlcy8xMDI1L2FtYmlndWl0eS13aXRoLWhvdy1ub25jZS1pcy1oYW5kbGVkLW9uXHJcbiAgLy8gVGhlIGN1cnJlbnQgc3BlYyBpcyBhbWJpZ3VvdXMgYW5kIEtleWNsb2FrIGRvZXMgc2VuZCBpdC5cclxuICB2YWxpZGF0ZUlkVG9rZW5Ob25jZShkYXRhSWRUb2tlbjogYW55LCBsb2NhbE5vbmNlOiBhbnksIGlnbm9yZU5vbmNlQWZ0ZXJSZWZyZXNoOiBib29sZWFuKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBpc0Zyb21SZWZyZXNoVG9rZW4gPVxyXG4gICAgICAoZGF0YUlkVG9rZW4ubm9uY2UgPT09IHVuZGVmaW5lZCB8fCBpZ25vcmVOb25jZUFmdGVyUmVmcmVzaCkgJiYgbG9jYWxOb25jZSA9PT0gVG9rZW5WYWxpZGF0aW9uU2VydmljZS5yZWZyZXNoVG9rZW5Ob25jZVBsYWNlaG9sZGVyO1xyXG4gICAgaWYgKCFpc0Zyb21SZWZyZXNoVG9rZW4gJiYgZGF0YUlkVG9rZW4ubm9uY2UgIT09IGxvY2FsTm9uY2UpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdWYWxpZGF0ZV9pZF90b2tlbl9ub25jZSBmYWlsZWQsIGRhdGFJZFRva2VuLm5vbmNlOiAnICsgZGF0YUlkVG9rZW4ubm9uY2UgKyAnIGxvY2FsX25vbmNlOicgKyBsb2NhbE5vbmNlKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLy8gaWRfdG9rZW4gQzE6IFRoZSBJc3N1ZXIgSWRlbnRpZmllciBmb3IgdGhlIE9wZW5JRCBQcm92aWRlciAod2hpY2ggaXMgdHlwaWNhbGx5IG9idGFpbmVkIGR1cmluZyBEaXNjb3ZlcnkpXHJcbiAgLy8gTVVTVCBleGFjdGx5IG1hdGNoIHRoZSB2YWx1ZSBvZiB0aGUgaXNzIChpc3N1ZXIpIENsYWltLlxyXG4gIHZhbGlkYXRlSWRUb2tlbklzcyhkYXRhSWRUb2tlbjogYW55LCBhdXRoV2VsbEtub3duRW5kcG9pbnRzSXNzdWVyOiBhbnkpOiBib29sZWFuIHtcclxuICAgIGlmICgoZGF0YUlkVG9rZW4uaXNzIGFzIHN0cmluZykgIT09IChhdXRoV2VsbEtub3duRW5kcG9pbnRzSXNzdWVyIGFzIHN0cmluZykpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKFxyXG4gICAgICAgICdWYWxpZGF0ZV9pZF90b2tlbl9pc3MgZmFpbGVkLCBkYXRhSWRUb2tlbi5pc3M6ICcgK1xyXG4gICAgICAgICAgZGF0YUlkVG9rZW4uaXNzICtcclxuICAgICAgICAgICcgYXV0aFdlbGxLbm93bkVuZHBvaW50cyBpc3N1ZXI6JyArXHJcbiAgICAgICAgICBhdXRoV2VsbEtub3duRW5kcG9pbnRzSXNzdWVyXHJcbiAgICAgICk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcblxyXG4gIC8vIGlkX3Rva2VuIEMyOiBUaGUgQ2xpZW50IE1VU1QgdmFsaWRhdGUgdGhhdCB0aGUgYXVkIChhdWRpZW5jZSkgQ2xhaW0gY29udGFpbnMgaXRzIGNsaWVudF9pZCB2YWx1ZSByZWdpc3RlcmVkIGF0IHRoZSBJc3N1ZXIgaWRlbnRpZmllZFxyXG4gIC8vIGJ5IHRoZSBpc3MgKGlzc3VlcikgQ2xhaW0gYXMgYW4gYXVkaWVuY2UuXHJcbiAgLy8gVGhlIElEIFRva2VuIE1VU1QgYmUgcmVqZWN0ZWQgaWYgdGhlIElEIFRva2VuIGRvZXMgbm90IGxpc3QgdGhlIENsaWVudCBhcyBhIHZhbGlkIGF1ZGllbmNlLCBvciBpZiBpdCBjb250YWlucyBhZGRpdGlvbmFsIGF1ZGllbmNlc1xyXG4gIC8vIG5vdCB0cnVzdGVkIGJ5IHRoZSBDbGllbnQuXHJcbiAgdmFsaWRhdGVJZFRva2VuQXVkKGRhdGFJZFRva2VuOiBhbnksIGF1ZDogYW55KTogYm9vbGVhbiB7XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShkYXRhSWRUb2tlbi5hdWQpKSB7XHJcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGRhdGFJZFRva2VuLmF1ZC5pbmNsdWRlcyhhdWQpO1xyXG5cclxuICAgICAgaWYgKCFyZXN1bHQpIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1ZhbGlkYXRlX2lkX3Rva2VuX2F1ZCBhcnJheSBmYWlsZWQsIGRhdGFJZFRva2VuLmF1ZDogJyArIGRhdGFJZFRva2VuLmF1ZCArICcgY2xpZW50X2lkOicgKyBhdWQpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKGRhdGFJZFRva2VuLmF1ZCAhPT0gYXVkKSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnVmFsaWRhdGVfaWRfdG9rZW5fYXVkIGZhaWxlZCwgZGF0YUlkVG9rZW4uYXVkOiAnICsgZGF0YUlkVG9rZW4uYXVkICsgJyBjbGllbnRfaWQ6JyArIGF1ZCk7XHJcblxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZUlkVG9rZW5BenBFeGlzdHNJZk1vcmVUaGFuT25lQXVkKGRhdGFJZFRva2VuOiBhbnkpOiBib29sZWFuIHtcclxuICAgIGlmICghZGF0YUlkVG9rZW4pIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGFJZFRva2VuLmF1ZCkgJiYgZGF0YUlkVG9rZW4uYXVkLmxlbmd0aCA+IDEgJiYgIWRhdGFJZFRva2VuLmF6cCkge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAvLyBJZiBhbiBhenAgKGF1dGhvcml6ZWQgcGFydHkpIENsYWltIGlzIHByZXNlbnQsIHRoZSBDbGllbnQgU0hPVUxEIHZlcmlmeSB0aGF0IGl0cyBjbGllbnRfaWQgaXMgdGhlIENsYWltIFZhbHVlLlxyXG4gIHZhbGlkYXRlSWRUb2tlbkF6cFZhbGlkKGRhdGFJZFRva2VuOiBhbnksIGNsaWVudElkOiBzdHJpbmcpOiBib29sZWFuIHtcclxuICAgIGlmICghZGF0YUlkVG9rZW4/LmF6cCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZGF0YUlkVG9rZW4uYXpwID09PSBjbGllbnRJZCkge1xyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICB2YWxpZGF0ZVN0YXRlRnJvbUhhc2hDYWxsYmFjayhzdGF0ZTogYW55LCBsb2NhbFN0YXRlOiBhbnkpOiBib29sZWFuIHtcclxuICAgIGlmICgoc3RhdGUgYXMgc3RyaW5nKSAhPT0gKGxvY2FsU3RhdGUgYXMgc3RyaW5nKSkge1xyXG4gICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nRGVidWcoJ1ZhbGlkYXRlU3RhdGVGcm9tSGFzaENhbGxiYWNrIGZhaWxlZCwgc3RhdGU6ICcgKyBzdGF0ZSArICcgbG9jYWxfc3RhdGU6JyArIGxvY2FsU3RhdGUpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHRydWU7XHJcbiAgfVxyXG5cclxuICAvLyBpZF90b2tlbiBDNTogVGhlIENsaWVudCBNVVNUIHZhbGlkYXRlIHRoZSBzaWduYXR1cmUgb2YgdGhlIElEIFRva2VuIGFjY29yZGluZyB0byBKV1MgW0pXU10gdXNpbmcgdGhlIGFsZ29yaXRobSBzcGVjaWZpZWQgaW4gdGhlIGFsZ1xyXG4gIC8vIEhlYWRlciBQYXJhbWV0ZXIgb2YgdGhlIEpPU0UgSGVhZGVyLlRoZSBDbGllbnQgTVVTVCB1c2UgdGhlIGtleXMgcHJvdmlkZWQgYnkgdGhlIElzc3Vlci5cclxuICAvLyBpZF90b2tlbiBDNjogVGhlIGFsZyB2YWx1ZSBTSE9VTEQgYmUgUlMyNTYuIFZhbGlkYXRpb24gb2YgdG9rZW5zIHVzaW5nIG90aGVyIHNpZ25pbmcgYWxnb3JpdGhtcyBpcyBkZXNjcmliZWQgaW4gdGhlXHJcbiAgLy8gT3BlbklEIENvbm5lY3QgQ29yZSAxLjAgW09wZW5JRC5Db3JlXSBzcGVjaWZpY2F0aW9uLlxyXG4gIHZhbGlkYXRlU2lnbmF0dXJlSWRUb2tlbihpZFRva2VuOiBhbnksIGp3dGtleXM6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFqd3RrZXlzIHx8ICFqd3RrZXlzLmtleXMpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGhlYWRlckRhdGEgPSB0aGlzLnRva2VuSGVscGVyU2VydmljZS5nZXRIZWFkZXJGcm9tVG9rZW4oaWRUb2tlbiwgZmFsc2UpO1xyXG5cclxuICAgIGlmIChPYmplY3Qua2V5cyhoZWFkZXJEYXRhKS5sZW5ndGggPT09IDAgJiYgaGVhZGVyRGF0YS5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XHJcbiAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpZCB0b2tlbiBoYXMgbm8gaGVhZGVyIGRhdGEnKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGtpZCA9IGhlYWRlckRhdGEua2lkO1xyXG4gICAgY29uc3QgYWxnID0gaGVhZGVyRGF0YS5hbGc7XHJcblxyXG4gICAgaWYgKCF0aGlzLmtleUFsZ29yaXRobXMuaW5jbHVkZXMoYWxnIGFzIHN0cmluZykpIHtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2FsZyBub3Qgc3VwcG9ydGVkJywgYWxnKTtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBqd3RLdHlUb1VzZSA9ICdSU0EnO1xyXG4gICAgaWYgKChhbGcgYXMgc3RyaW5nKS5jaGFyQXQoMCkgPT09ICdFJykge1xyXG4gICAgICBqd3RLdHlUb1VzZSA9ICdFQyc7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IGlzVmFsaWQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoIWhlYWRlckRhdGEuaGFzT3duUHJvcGVydHkoJ2tpZCcpKSB7XHJcbiAgICAgIC8vIGV4YWN0bHkgMSBrZXkgaW4gdGhlIGp3dGtleXMgYW5kIG5vIGtpZCBpbiB0aGUgSm9zZSBoZWFkZXJcclxuICAgICAgLy8ga3R5XHRcIlJTQVwiIG9yIEVDIHVzZSBcInNpZ1wiXHJcbiAgICAgIGxldCBhbW91bnRPZk1hdGNoaW5nS2V5cyA9IDA7XHJcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGp3dGtleXMua2V5cykge1xyXG4gICAgICAgIGlmICgoa2V5Lmt0eSBhcyBzdHJpbmcpID09PSBqd3RLdHlUb1VzZSAmJiAoa2V5LnVzZSBhcyBzdHJpbmcpID09PSAnc2lnJykge1xyXG4gICAgICAgICAgYW1vdW50T2ZNYXRjaGluZ0tleXMgPSBhbW91bnRPZk1hdGNoaW5nS2V5cyArIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW1vdW50T2ZNYXRjaGluZ0tleXMgPT09IDApIHtcclxuICAgICAgICB0aGlzLmxvZ2dlclNlcnZpY2UubG9nV2FybmluZygnbm8ga2V5cyBmb3VuZCwgaW5jb3JyZWN0IFNpZ25hdHVyZSwgdmFsaWRhdGlvbiBmYWlsZWQgZm9yIGlkX3Rva2VuJyk7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoYW1vdW50T2ZNYXRjaGluZ0tleXMgPiAxKSB7XHJcbiAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ25vIElEIFRva2VuIGtpZCBjbGFpbSBpbiBKT1NFIGhlYWRlciBhbmQgbXVsdGlwbGUgc3VwcGxpZWQgaW4gandrc191cmknKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZvciAoY29uc3Qga2V5IG9mIGp3dGtleXMua2V5cykge1xyXG4gICAgICAgIGlmICgoa2V5Lmt0eSBhcyBzdHJpbmcpID09PSBqd3RLdHlUb1VzZSAmJiAoa2V5LnVzZSBhcyBzdHJpbmcpID09PSAnc2lnJykge1xyXG4gICAgICAgICAgY29uc3QgcHVibGlja2V5ID0gS0VZVVRJTC5nZXRLZXkoa2V5KTtcclxuICAgICAgICAgIGlzVmFsaWQgPSBLSlVSLmp3cy5KV1MudmVyaWZ5KGlkVG9rZW4sIHB1YmxpY2tleSwgW2FsZ10pO1xyXG4gICAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dXYXJuaW5nKCdpbmNvcnJlY3QgU2lnbmF0dXJlLCB2YWxpZGF0aW9uIGZhaWxlZCBmb3IgaWRfdG9rZW4nKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBpc1ZhbGlkO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8ga2lkIGluIHRoZSBKb3NlIGhlYWRlciBvZiBpZF90b2tlblxyXG4gICAgICBmb3IgKGNvbnN0IGtleSBvZiBqd3RrZXlzLmtleXMpIHtcclxuICAgICAgICBpZiAoKGtleS5raWQgYXMgc3RyaW5nKSA9PT0gKGtpZCBhcyBzdHJpbmcpKSB7XHJcbiAgICAgICAgICBjb25zdCBwdWJsaWNLZXkgPSBLRVlVVElMLmdldEtleShrZXkpO1xyXG4gICAgICAgICAgaXNWYWxpZCA9IEtKVVIuandzLkpXUy52ZXJpZnkoaWRUb2tlbiwgcHVibGljS2V5LCBbYWxnXSk7XHJcbiAgICAgICAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ2luY29ycmVjdCBTaWduYXR1cmUsIHZhbGlkYXRpb24gZmFpbGVkIGZvciBpZF90b2tlbicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGlzVmFsaWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGlzVmFsaWQ7XHJcbiAgfVxyXG5cclxuICBoYXNDb25maWdWYWxpZFJlc3BvbnNlVHlwZSgpOiBib29sZWFuIHtcclxuICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0FueUltcGxpY2l0RmxvdygpKSB7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmZsb3dIZWxwZXIuaXNDdXJyZW50Rmxvd0NvZGVGbG93KCkpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ1dhcm5pbmcoJ21vZHVsZSBjb25maWd1cmVkIGluY29ycmVjdGx5LCBpbnZhbGlkIHJlc3BvbnNlX3R5cGUuIENoZWNrIHRoZSByZXNwb25zZVR5cGUgaW4gdGhlIGNvbmZpZycpO1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gQWNjZXB0cyBJRCBUb2tlbiB3aXRob3V0ICdraWQnIGNsYWltIGluIEpPU0UgaGVhZGVyIGlmIG9ubHkgb25lIEpXSyBzdXBwbGllZCBpbiAnandrc191cmwnXHJcbiAgLy8vLyBwcml2YXRlIHZhbGlkYXRlX25vX2tpZF9pbl9oZWFkZXJfb25seV9vbmVfYWxsb3dlZF9pbl9qd3RrZXlzKGhlYWRlcl9kYXRhOiBhbnksIGp3dGtleXM6IGFueSk6IGJvb2xlYW4ge1xyXG4gIC8vLy8gICAgdGhpcy5vaWRjU2VjdXJpdHlDb21tb24ubG9nRGVidWcoJ2Ftb3VudCBvZiBqd3RrZXlzLmtleXM6ICcgKyBqd3RrZXlzLmtleXMubGVuZ3RoKTtcclxuICAvLy8vICAgIGlmICghaGVhZGVyX2RhdGEuaGFzT3duUHJvcGVydHkoJ2tpZCcpKSB7XHJcbiAgLy8vLyAgICAgICAgLy8gbm8ga2lkIGRlZmluZWQgaW4gSm9zZSBoZWFkZXJcclxuICAvLy8vICAgICAgICBpZiAoand0a2V5cy5rZXlzLmxlbmd0aCAhPSAxKSB7XHJcbiAgLy8vLyAgICAgICAgICAgIHRoaXMub2lkY1NlY3VyaXR5Q29tbW9uLmxvZ0RlYnVnKCdqd3RrZXlzLmtleXMubGVuZ3RoICE9IDEgYW5kIG5vIGtpZCBpbiBoZWFkZXInKTtcclxuICAvLy8vICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gIC8vLy8gICAgICAgIH1cclxuICAvLy8vICAgIH1cclxuXHJcbiAgLy8vLyAgICByZXR1cm4gdHJ1ZTtcclxuICAvLy8vIH1cclxuXHJcbiAgLy8gQWNjZXNzIFRva2VuIFZhbGlkYXRpb25cclxuICAvLyBhY2Nlc3NfdG9rZW4gQzE6IEhhc2ggdGhlIG9jdGV0cyBvZiB0aGUgQVNDSUkgcmVwcmVzZW50YXRpb24gb2YgdGhlIGFjY2Vzc190b2tlbiB3aXRoIHRoZSBoYXNoIGFsZ29yaXRobSBzcGVjaWZpZWQgaW4gSldBW0pXQV1cclxuICAvLyBmb3IgdGhlIGFsZyBIZWFkZXIgUGFyYW1ldGVyIG9mIHRoZSBJRCBUb2tlbidzIEpPU0UgSGVhZGVyLiBGb3IgaW5zdGFuY2UsIGlmIHRoZSBhbGcgaXMgUlMyNTYsIHRoZSBoYXNoIGFsZ29yaXRobSB1c2VkIGlzIFNIQS0yNTYuXHJcbiAgLy8gYWNjZXNzX3Rva2VuIEMyOiBUYWtlIHRoZSBsZWZ0LSBtb3N0IGhhbGYgb2YgdGhlIGhhc2ggYW5kIGJhc2U2NHVybC0gZW5jb2RlIGl0LlxyXG4gIC8vIGFjY2Vzc190b2tlbiBDMzogVGhlIHZhbHVlIG9mIGF0X2hhc2ggaW4gdGhlIElEIFRva2VuIE1VU1QgbWF0Y2ggdGhlIHZhbHVlIHByb2R1Y2VkIGluIHRoZSBwcmV2aW91cyBzdGVwIGlmIGF0X2hhc2hcclxuICAvLyBpcyBwcmVzZW50IGluIHRoZSBJRCBUb2tlbi5cclxuICB2YWxpZGF0ZUlkVG9rZW5BdEhhc2goYWNjZXNzVG9rZW46IGFueSwgYXRIYXNoOiBhbnksIGlkVG9rZW5BbGc6IHN0cmluZyk6IGJvb2xlYW4ge1xyXG4gICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCdhdF9oYXNoIGZyb20gdGhlIHNlcnZlcjonICsgYXRIYXNoKTtcclxuXHJcbiAgICAvLyAnc2hhMjU2JyAnc2hhMzg0JyAnc2hhNTEyJ1xyXG4gICAgbGV0IHNoYSA9ICdzaGEyNTYnO1xyXG4gICAgaWYgKGlkVG9rZW5BbGcuaW5jbHVkZXMoJzM4NCcpKSB7XHJcbiAgICAgIHNoYSA9ICdzaGEzODQnO1xyXG4gICAgfSBlbHNlIGlmIChpZFRva2VuQWxnLmluY2x1ZGVzKCc1MTInKSkge1xyXG4gICAgICBzaGEgPSAnc2hhNTEyJztcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0ZXN0RGF0YSA9IHRoaXMuZ2VuZXJhdGVBdEhhc2goJycgKyBhY2Nlc3NUb2tlbiwgc2hhKTtcclxuICAgIHRoaXMubG9nZ2VyU2VydmljZS5sb2dEZWJ1ZygnYXRfaGFzaCBjbGllbnQgdmFsaWRhdGlvbiBub3QgZGVjb2RlZDonICsgdGVzdERhdGEpO1xyXG4gICAgaWYgKHRlc3REYXRhID09PSAoYXRIYXNoIGFzIHN0cmluZykpIHtcclxuICAgICAgcmV0dXJuIHRydWU7IC8vIGlzVmFsaWQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCB0ZXN0VmFsdWUgPSB0aGlzLmdlbmVyYXRlQXRIYXNoKCcnICsgZGVjb2RlVVJJQ29tcG9uZW50KGFjY2Vzc1Rva2VuKSwgc2hhKTtcclxuICAgICAgdGhpcy5sb2dnZXJTZXJ2aWNlLmxvZ0RlYnVnKCctZ2VuIGFjY2Vzcy0tJyArIHRlc3RWYWx1ZSk7XHJcbiAgICAgIGlmICh0ZXN0VmFsdWUgPT09IChhdEhhc2ggYXMgc3RyaW5nKSkge1xyXG4gICAgICAgIHJldHVybiB0cnVlOyAvLyBpc1ZhbGlkXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBnZW5lcmF0ZUNvZGVDaGFsbGVuZ2UoY29kZVZlcmlmaWVyOiBhbnkpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgaGFzaCA9IEtKVVIuY3J5cHRvLlV0aWwuaGFzaFN0cmluZyhjb2RlVmVyaWZpZXIsICdzaGEyNTYnKTtcclxuICAgIGNvbnN0IHRlc3REYXRhID0gaGV4dG9iNjR1KGhhc2gpO1xyXG5cclxuICAgIHJldHVybiB0ZXN0RGF0YTtcclxuICB9XHJcblxyXG4gIHByaXZhdGUgZ2VuZXJhdGVBdEhhc2goYWNjZXNzVG9rZW46IGFueSwgc2hhOiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgY29uc3QgaGFzaCA9IEtKVVIuY3J5cHRvLlV0aWwuaGFzaFN0cmluZyhhY2Nlc3NUb2tlbiwgc2hhKTtcclxuICAgIGNvbnN0IGZpcnN0MTI4Yml0cyA9IGhhc2guc3Vic3RyKDAsIGhhc2gubGVuZ3RoIC8gMik7XHJcbiAgICBjb25zdCB0ZXN0RGF0YSA9IGhleHRvYjY0dShmaXJzdDEyOGJpdHMpO1xyXG5cclxuICAgIHJldHVybiB0ZXN0RGF0YTtcclxuICB9XHJcbn1cclxuIl19