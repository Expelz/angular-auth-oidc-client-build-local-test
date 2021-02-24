// eslint-disable-next-line no-shadow
export var EventTypes;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQtdHlwZXMuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vLi4vcHJvamVjdHMvYW5ndWxhci1hdXRoLW9pZGMtY2xpZW50L3NyYy8iLCJzb3VyY2VzIjpbImxpYi9wdWJsaWMtZXZlbnRzL2V2ZW50LXR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLHFDQUFxQztBQUNyQyxNQUFNLENBQU4sSUFBWSxVQVlYO0FBWkQsV0FBWSxVQUFVO0lBQ3BCOztPQUVHO0lBQ0gsMkRBQVksQ0FBQTtJQUNaLHlFQUFtQixDQUFBO0lBQ25CLDJFQUFvQixDQUFBO0lBQ3BCLGlFQUFlLENBQUE7SUFDZiwrRUFBc0IsQ0FBQTtJQUN0QiwyREFBWSxDQUFBO0lBQ1osK0RBQWMsQ0FBQTtJQUNkLHlFQUFtQixDQUFBO0FBQ3JCLENBQUMsRUFaVyxVQUFVLEtBQVYsVUFBVSxRQVlyQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zaGFkb3dcclxuZXhwb3J0IGVudW0gRXZlbnRUeXBlcyB7XHJcbiAgLyoqXHJcbiAgICogIFRoaXMgb25seSB3b3JrcyBpbiB0aGUgQXBwTW9kdWxlIENvbnN0cnVjdG9yXHJcbiAgICovXHJcbiAgQ29uZmlnTG9hZGVkLFxyXG4gIENvbmZpZ0xvYWRpbmdGYWlsZWQsXHJcbiAgQ2hlY2tTZXNzaW9uUmVjZWl2ZWQsXHJcbiAgVXNlckRhdGFDaGFuZ2VkLFxyXG4gIE5ld0F1dGhvcml6YXRpb25SZXN1bHQsXHJcbiAgVG9rZW5FeHBpcmVkLFxyXG4gIElkVG9rZW5FeHBpcmVkLFxyXG4gIFNpbGVudFJlbmV3RmluaXNoZWQsXHJcbn1cclxuIl19