import type { ResourcesConfig } from 'aws-amplify';

const awsExports: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
      identityPoolId: '',
    }
  }
};

export default awsExports;
