import boto3
import os

client = boto3.client('cognito-idp', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

def lambda_handler(event, context):
    """
    AWS Cognito Post Confirmation Lambda Trigger
    Automatically adds newly confirmed users to the 'ANALYST' group.
    """
    user_pool_id = event.get('userPoolId')
    username = event.get('userName')
    
    if user_pool_id and username:
        try:
            # We add all new signups to the ANALYST group for the demo
            client.admin_add_user_to_group(
                UserPoolId=user_pool_id,
                Username=username,
                GroupName='ANALYST'
            )
            print(f"Successfully added {username} to the ANALYST group in {user_pool_id}")
        except Exception as e:
            print(f"Failed to add user to group: {str(e)}")
            # Do NOT raise the exception, otherwise Cognito will fail the sign-up process!
            
    # Cognito triggers MUST return the event unmodified so the auth flow continues
    return event
