'use strict';
let ariClient = require('ari-client'),
    autobahn = require('autobahn'),
    co = require('co');

module.exports = class ConfManagerApp {
    constructor() {
        this.logger = console; // TODO: Write powerful logger factory
        this.config = require('./config.js');
        //this.configureProcess();
        co(this.startInit.bind(this))
            .catch(e => this.logger.error(e));

    }

    //configureProcess() {
    //    process.stdin.resume();
    //    process.on('unhandledRejection', (reason, p) => this.logger.error('Unhandled Rejection', p, reason));
    //    process.on('uncaughtException', err => this.logger.error('Caught exception', err));
    //}

    *startInit() {
        yield this.initWamp();
        yield this.initAri();
        yield this.initApi();
    }

    *initWamp() {
        return new Promise(resolve => {
            function onchallenge(session, details, extra) {
                if (method === "wampcra") {
                    return autobahn.auth_cra.sign('secret974', extra.challenge);
                }
            }

            this.wamp = new autobahn.Connection({
                url: this.config.wamp.url,
                realm: this.config.wamp.realm,
                authmethods: this.config.wamp.authmethods,
                authid: this.config.wamp.authid,
                onchallenge: onchallenge
            });

            this.wamp.onconnection = () => {
                this.logger.info('Init: WAMP connected.');
                // TODO: Place WAMP actions here
                this.logger.info('Init: WAMP init complete.');
                resolve();
            }
        });
    }

    *initAri() {
        this.ari = yield ariClient.connect(this.config.ari.host, this.config.ari.username, this.config.ari.password);
        this.logger.info('Init: ARI Connected.');
        // TODO: Place event handlers here
        yield this.ari.start(this.config.ari.app);
        this.logger.info('Init: ARI init complete.');
    }

    *initApi() {
        //
    }

};
