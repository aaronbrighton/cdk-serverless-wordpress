import '@aws-cdk/assert/jest';
import { App } from '@aws-cdk/core';
import { CdkServerlessWordpressStack } from '../src/main';

test('Full stack', () => {
  const app = new App();
  const stack = new CdkServerlessWordpressStack(app, 'test');

  expect(stack).toHaveResource('AWS::Lambda::Function');
  expect(stack).toHaveResource('AWS::ApiGatewayV2::Api');
  expect(stack).toHaveResource('AWS::EC2::VPC');
  expect(stack).toHaveResource('AWS::EC2::SecurityGroup');
  expect(stack).toHaveResource('AWS::SecretsManager::Secret');
  expect(stack).toHaveResource('AWS::RDS::DBCluster');
  expect(stack).toHaveResource('AWS::S3::Bucket');
  expect(stack).toHaveResource('Custom::CDKBucketDeployment');
  expect(stack).toHaveResource('AWS::CloudFront::CachePolicy');
  expect(stack).toHaveResource('AWS::CloudFront::OriginRequestPolicy');
  expect(stack).toHaveResource('AWS::CloudFront::Distribution');
});