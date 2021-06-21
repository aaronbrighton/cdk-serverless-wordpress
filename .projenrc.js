const { AwsCdkTypeScriptApp, ProjectType } = require('projen');
const project = new AwsCdkTypeScriptApp({
  cdkVersion: '1.109.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-serverless-wordpress',
  stability: 'experimental',
  authorAddress: 'aaron@aaronbrighton.ca',
  authorName: 'Aaron Brighton',
  cdkDependencies: [
    '@aws-cdk/core',
  ],
  deps: [
    'cdk-serverless-php-mpa',
    'shx',
  ],
  projectType: ProjectType.APP,
  release: false,
});

project.tasks.addTask('install-wordpress', {
  name: 'install-wordpress',
  description: 'Use composer to retrieve latest Wordpress to src/app/public_html/ and configure wp-config.php.',
  exec: 'composer require johnpbloch/wordpress --working-dir=src/app/',
});
project.tasks.tryFind('install-wordpress').exec('shx mv src/app/wordpress src/app/public_html');
project.tasks.tryFind('install-wordpress').exec('composer require humanmade/s3-uploads --working-dir=src/app/public_html');
project.tasks.tryFind('install-wordpress').exec('node src/config-wordpress.js');

project.npmignore.removePatterns('!/src');
project.gitignore.removePatterns('!/src');
project.npmignore.addPatterns('!/src/app/php');
project.gitignore.addPatterns('!/src/app/php');
project.npmignore.exclude('/src/app');
project.gitignore.exclude('/src/app');

project.synth();