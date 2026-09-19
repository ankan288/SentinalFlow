def lambda_handler(event, context):
    # Auto-confirm the user and auto-verify their email address
    # This prevents Cognito from sending the 6-digit verification code email.
    event['response']['autoConfirmUser'] = True
    event['response']['autoVerifyEmail'] = True
    return event
