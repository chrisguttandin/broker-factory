module.exports = (config) => {

    config.set({

        concurrency: 2,

        files: [
            {
                included: false,
                pattern: '../../src/**',
                served: true,
                watched: true
            },
            '../../test/unit/**/*.js'
        ],

        frameworks: [
            'leche',
            'mocha',
            'sinon-chai'
        ],

        preprocessors: {
            '../../test/unit/**/*.js': 'webpack'
        },

        webpack: {
            mode: 'development',
            module: {
                rules: [ {
                    test: /\.ts?$/,
                    use: {
                        loader: 'ts-loader'
                    }
                } ]
            },
            resolve: {
                extensions: [ '.js', '.ts' ]
            }
        },

        webpackMiddleware: {
            noInfo: true
        }

    });

    if (process.env.TRAVIS) {

        config.set({

            browsers: [
                'ChromeSauceLabs',
                'FirefoxSauceLabs',
                'SafariSauceLabs'
            ],

            captureTimeout: 120000,

            customLaunchers: {
                ChromeSauceLabs: {
                    base: 'SauceLabs',
                    browserName: 'chrome',
                    platform: 'OS X 10.12'
                },
                FirefoxSauceLabs: {
                    base: 'SauceLabs',
                    browserName: 'firefox',
                    platform: 'OS X 10.12'
                },
                SafariSauceLabs: {
                    base: 'SauceLabs',
                    browserName: 'safari',
                    platform: 'OS X 10.12'
                }
            },

            tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER

        });

    } else {

        config.set({

            browsers: [
                'ChromeHeadless',
                'ChromeCanaryHeadless',
                'FirefoxHeadless',
                'FirefoxDeveloperHeadless',
                'Safari'
            ]

        });

    }

};
