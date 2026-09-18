import json

def require_role(allowed_roles):
    """
    Decorator to enforce Cognito Group (Role) based access control on Lambda handlers.
    Requires the API Gateway to be configured with a Cognito Authorizer.
    """
    def decorator(func):
        def wrapper(event, context):
            # API Gateway injects the JWT claims into the event object
            claims = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
            
            # Extract groups. Cognito can return a comma-separated string or a list.
            user_groups = claims.get('cognito:groups', '')
            if isinstance(user_groups, str):
                user_groups = [g.strip('[] ') for g in user_groups.split(',') if g]
            
            # Admin always has access. Otherwise, check if user has one of the allowed roles.
            has_role = 'ADMIN' in user_groups or any(role in user_groups for role in allowed_roles)
            
            if not has_role:
                print(f"Authorization Failed. User groups: {user_groups}. Required: {allowed_roles}")
                return {
                    "statusCode": 403,
                    "headers": {
                        "Content-Type": "application/json",
                        "Access-Control-Allow-Origin": "*"
                    },
                    "body": json.dumps({
                        "message": "Forbidden: Insufficient privileges to perform this action."
                    })
                }
                
            return func(event, context)
        return wrapper
    return decorator
