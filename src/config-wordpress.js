const { existsSync, copyFileSync, readFileSync, writeFileSync } = require('fs');
const https = require('https');

const sampleConfigFile = 'src/app/public_html/wp-config-sample.php';
const targetConfigFile = 'src/app/public_html/wp-config.php';

const targetConfigValueReplacement = {
    'DB_NAME': "define( 'DB_NAME', $GLOBALS['RDS_CREDS']['RDS_DATABASE'] );",
    'DB_USER': "define( 'DB_USER', $GLOBALS['RDS_CREDS']['RDS_USERNAME'] );",
    'DB_PASSWORD': "define( 'DB_PASSWORD', $GLOBALS['RDS_CREDS']['RDS_PASSWORD'] );",
    'DB_HOST': "define( 'DB_HOST', $GLOBALS['RDS_CREDS']['RDS_HOST'] );",
    'wp-settings.php': `require_once __DIR__ . '/vendor/autoload.php';
    define( 'S3_UPLOADS_BUCKET', $_ENV['ASSETS_BUCKET'] );
    define( 'S3_UPLOADS_REGION', $_ENV['AWS_REGION'] ); // the s3 bucket region (excluding the rest of the URL)
    define( 'S3_UPLOADS_USE_INSTANCE_PROFILE', true );
    define('S3_UPLOADS_OBJECT_ACL', 'private');
    define( 'S3_UPLOADS_HTTP_CACHE_CONTROL', 0 );
    define( 'S3_UPLOADS_BUCKET_URL', 'https://'.$_SERVER['HTTP_X_FORWARDED_HOST'] );
    
    /** Sets up WordPress vars and included files. */
    require_once ABSPATH . 'wp-settings.php';`
};

https.get('https://api.wordpress.org/secret-key/1.1/salt/', (res) => {
    res.setEncoding('utf8');
    res.on('data', (d) => {
        d.split('\n').forEach((line) => {
            key = line.split("'")[1];
            value = line.split("'")[3];
            if (key)
            {
                targetConfigValueReplacement[key] = "define( 'AUTH_KEY', '"+value+"' );";
            }
        });
        
        if (!existsSync(targetConfigFile))
        {
            let targetConfigFileData = readFileSync(sampleConfigFile, {encoding:'utf8', flag:'r'});
            for (let key in targetConfigValueReplacement) {
                targetConfigFileData = targetConfigFileData.replace(new RegExp(`^.*${key}.*$`, 'm'), targetConfigValueReplacement[key]);
            }
            writeFileSync(targetConfigFile, targetConfigFileData);
            console.error('Wordpress config file ('+targetConfigFile+') has been configured...');
        }
        else
        {
            console.error('Wordpress config file ('+targetConfigFile+') already exists, doing nothing...');
            process.exit(1);
        }
    });
}).on('error', (e) => {
    console.error(e);
});

