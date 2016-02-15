'use strict';

let ariClient = require('ari-client'),
    autobahn = require('autobahn'),
    co = require('co'),
    mysqlDriver = require('promise-mysql');

module.exports = class ConfManagerApp {
    constructor() {
        this.logger = console; // TODO: Write powerful logger factory
        this.config = require('./config.js');
        //this.wampFunctions = require('./WampFunctions.js');
        //this.configureProcess();
        co(this.startInit.bind(this))
            .then(() => this.logger.log('Init: Initialization complete'))
            .catch(error => {
                this.logger.error('Error init mkv3: ', error);
                process.exit();
            });

    }

    //configureProcess() {
    //    process.stdin.resume();
    //    process.on('unhandledRejection', (reason, p) => this.logger.error('Unhandled Rejection', p, reason));
    //    process.on('uncaughtException', err => this.logger.error('Caught exception', err));
    //}

    *startInit() {
        this.ari = yield this.initAri();
        this.wamp = yield this.initWamp();
        this.api = yield this.initApi();
        this.mysql = yield this.initMysql();
    }

    *initWamp() {
        return new Promise((resolve, reject) => {
            let wampConnection = new autobahn.Connection({
                url: this.config.wamp.url,
                realm: this.config.wamp.realm,
                authmethods: this.config.wamp.authmethods,
                authid: this.config.wamp.authid,
                use_es6_promises: true,
                onchallenge: (session, method, extra) => {
                    if (method === "wampcra") {
                        return autobahn.auth_cra.sign(this.config.wamp.password, extra.challenge);
                    }
                }
            });

            wampConnection.onclose = (reason) => {
                if (reason === 'unreachable') {
                    reject(new Error('Wamp connection error. Reason: ' + reason));
                } else {
                    this.logger.warn('WAMP disconnected. Trying to reconnect.');
                }
            };

            wampConnection.onopen = (session) => {
                this.logger.info('Init: WAMP connected.');
                // TODO: Place WAMP actions here
                this.logger.info('Init: WAMP init complete.');
                resolve(session);
            };

            wampConnection.open();
        });
    }

    *initAri() {
        try {
            let ari = yield ariClient.connect(this.config.ari.host, this.config.ari.username, this.config.ari.password);
            this.logger.info('Init: ARI Connected.');
            yield ari.start(this.config.ari.app);
            // TODO: Place event handlers here
            ari.on('StasisStart', this.handleCall);
            this.logger.info('Init: ARI init complete.');
            return ari;
        } catch (error) {
            throw error;
        }
    }

    *initApi() {
        // TODO: Make a cool RESTful API for phonebook
    }

    *initMysql() {

        try {
            let mysql = yield mysqlDriver.createConnection({
                host: this.config.mysql.host,
                user: this.config.mysql.user,
                password: this.config.mysql.password,
                database: this.config.mysql.database,
                charset: this.config.mysql.charset
            });

            this.logger.info('Init: Connected to Mysql Database.');

            setInterval(() => {
                this.mysql.query('SELECT 1');
            }, 5000);
            return mysql;

        } catch (error) {
            throw error;
        }
    }

    handleCall() {
        //
    }

};
