import { LogLevel } from '../logging/log-level';
export const DEFAULT_CONFIG = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdC1jb25maWcuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9jb25maWcvZGVmYXVsdC1jb25maWcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBR2hELE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBd0I7SUFDakQsU0FBUyxFQUFFLG9CQUFvQjtJQUMvQixxQkFBcUIsRUFBRSxFQUFFO0lBQ3pCLFdBQVcsRUFBRSxvQkFBb0I7SUFDakMsUUFBUSxFQUFFLFlBQVk7SUFDdEIsWUFBWSxFQUFFLE1BQU07SUFDcEIsS0FBSyxFQUFFLHNCQUFzQjtJQUM3QixPQUFPLEVBQUUsRUFBRTtJQUNYLHFCQUFxQixFQUFFLG9CQUFvQjtJQUMzQyxpQkFBaUIsRUFBRSxLQUFLO0lBQ3hCLFdBQVcsRUFBRSxLQUFLO0lBQ2xCLGNBQWMsRUFBRSxvQkFBb0I7SUFDcEMsMkJBQTJCLEVBQUUsRUFBRTtJQUMvQixvQ0FBb0MsRUFBRSxDQUFDO0lBQ3ZDLGVBQWUsRUFBRSxLQUFLO0lBQ3RCLHVCQUF1QixFQUFFLEtBQUs7SUFDOUIsY0FBYyxFQUFFLEdBQUc7SUFDbkIsY0FBYyxFQUFFLFlBQVk7SUFDNUIsaUJBQWlCLEVBQUUsZUFBZTtJQUNsQyxZQUFZLEVBQUUsSUFBSTtJQUNsQixpQ0FBaUMsRUFBRSxJQUFJO0lBQ3ZDLCtCQUErQixFQUFFLEtBQUs7SUFDdEMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJO0lBQ3ZCLGdCQUFnQixFQUFFLEtBQUs7SUFDdkIsaUJBQWlCLEVBQUUsS0FBSztJQUN4QixtQ0FBbUMsRUFBRSxHQUFHO0lBQ3hDLDBCQUEwQixFQUFFLEtBQUs7SUFDakMsT0FBTyxFQUFFLE9BQU8sT0FBTyxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJO0lBQy9ELFlBQVksRUFBRSxFQUFFO0lBQ2hCLCtCQUErQixFQUFFLElBQUk7SUFDckMsdUNBQXVDLEVBQUUsS0FBSztJQUM5QyxxQkFBcUIsRUFBRSxDQUFDO0NBQ3pCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2dMZXZlbCB9IGZyb20gJy4uL2xvZ2dpbmcvbG9nLWxldmVsJztcclxuaW1wb3J0IHsgT3BlbklkQ29uZmlndXJhdGlvbiB9IGZyb20gJy4vb3BlbmlkLWNvbmZpZ3VyYXRpb24nO1xyXG5cclxuZXhwb3J0IGNvbnN0IERFRkFVTFRfQ09ORklHOiBPcGVuSWRDb25maWd1cmF0aW9uID0ge1xyXG4gIHN0c1NlcnZlcjogJ2h0dHBzOi8vcGxlYXNlX3NldCcsXHJcbiAgYXV0aFdlbGxrbm93bkVuZHBvaW50OiAnJyxcclxuICByZWRpcmVjdFVybDogJ2h0dHBzOi8vcGxlYXNlX3NldCcsXHJcbiAgY2xpZW50SWQ6ICdwbGVhc2Vfc2V0JyxcclxuICByZXNwb25zZVR5cGU6ICdjb2RlJyxcclxuICBzY29wZTogJ29wZW5pZCBlbWFpbCBwcm9maWxlJyxcclxuICBoZFBhcmFtOiAnJyxcclxuICBwb3N0TG9nb3V0UmVkaXJlY3RVcmk6ICdodHRwczovL3BsZWFzZV9zZXQnLFxyXG4gIHN0YXJ0Q2hlY2tTZXNzaW9uOiBmYWxzZSxcclxuICBzaWxlbnRSZW5ldzogZmFsc2UsXHJcbiAgc2lsZW50UmVuZXdVcmw6ICdodHRwczovL3BsZWFzZV9zZXQnLFxyXG4gIHNpbGVudFJlbmV3VGltZW91dEluU2Vjb25kczogMjAsXHJcbiAgcmVuZXdUaW1lQmVmb3JlVG9rZW5FeHBpcmVzSW5TZWNvbmRzOiAwLFxyXG4gIHVzZVJlZnJlc2hUb2tlbjogZmFsc2UsXHJcbiAgaWdub3JlTm9uY2VBZnRlclJlZnJlc2g6IGZhbHNlLFxyXG4gIHBvc3RMb2dpblJvdXRlOiAnLycsXHJcbiAgZm9yYmlkZGVuUm91dGU6ICcvZm9yYmlkZGVuJyxcclxuICB1bmF1dGhvcml6ZWRSb3V0ZTogJy91bmF1dGhvcml6ZWQnLFxyXG4gIGF1dG9Vc2VyaW5mbzogdHJ1ZSxcclxuICBhdXRvQ2xlYW5TdGF0ZUFmdGVyQXV0aGVudGljYXRpb246IHRydWUsXHJcbiAgdHJpZ2dlckF1dGhvcml6YXRpb25SZXN1bHRFdmVudDogZmFsc2UsXHJcbiAgbG9nTGV2ZWw6IExvZ0xldmVsLldhcm4sXHJcbiAgaXNzVmFsaWRhdGlvbk9mZjogZmFsc2UsXHJcbiAgaGlzdG9yeUNsZWFudXBPZmY6IGZhbHNlLFxyXG4gIG1heElkVG9rZW5JYXRPZmZzZXRBbGxvd2VkSW5TZWNvbmRzOiAxMjAsXHJcbiAgZGlzYWJsZUlhdE9mZnNldFZhbGlkYXRpb246IGZhbHNlLFxyXG4gIHN0b3JhZ2U6IHR5cGVvZiBTdG9yYWdlICE9PSAndW5kZWZpbmVkJyA/IHNlc3Npb25TdG9yYWdlIDogbnVsbCxcclxuICBjdXN0b21QYXJhbXM6IHt9LFxyXG4gIGVhZ2VyTG9hZEF1dGhXZWxsS25vd25FbmRwb2ludHM6IHRydWUsXHJcbiAgZGlzYWJsZVJlZnJlc2hJZFRva2VuQXV0aFRpbWVWYWxpZGF0aW9uOiBmYWxzZSxcclxuICB0b2tlblJlZnJlc2hJblNlY29uZHM6IDQsXHJcbn07XHJcbiJdfQ==