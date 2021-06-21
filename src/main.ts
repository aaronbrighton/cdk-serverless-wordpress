import { App, Construct, Stack, StackProps, CfnOutput } from '@aws-cdk/core';
import { Code, Network, Database, Cdn } from 'cdk-serverless-php-mpa';

export class CdkServerlessWordpressStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const network = new Network(this, 'ServerlessWordpressNetwork');

    const database = new Database(this, 'ServerlessWordpressDatabase', {
      network: network,
      name: 'wordpress_db',
    });

    const code = new Code(this, 'ServerlessWordpressCode', {
      src: 'src/app/',
      database: database,
      network: network,
      injectCreds: true,
      databaseLoader: true,
      additionalLayers: [
        'arn:aws:lambda:us-east-1:403367587399:layer:gd-php-80:11',
      ],
    });

    const cdn = new Cdn(this, 'ServerlessWordpressCdn', {
      code,
      customHeaders: [
        'X-WP-Nonce',
      ],
      network,
      permitAssetsBucketAccess: true,
    });

    new CfnOutput(this, 'PhpMpaCdnEndpoint', {
      description: 'CloudFront distribution endpoint for the Wordpress deployment.',
      value: `https://${cdn.distribution.domainName}/`,
    });
  }
}

const app = new App();

new CdkServerlessWordpressStack(app, 'cdk-serverless-wordpress');

app.synth();