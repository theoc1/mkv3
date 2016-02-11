'use strict';
let ariClient = require('ari-client'),
    autobahn = require('autobahn'),
    co = require('co'),
    mysql = require('promise-mysql');

module.exports = class ConfManagerApp {
    constructor() {
        this.logger = console; // TODO: Write powerful logger factory
        this.config = require('./config.js');
        this.wampFunctions = require('./WampFunctions.js');
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
        yield this.initMysql();
    }

    *initWamp() {
        return new Promise(resolve => {
            this.wamp = new autobahn.Connection({
                url: this.config.wamp.url,
                realm: this.config.wamp.realm,
                authmethods: this.config.wamp.authmethods,
                authid: this.config.wamp.authid,
                onchallenge: (session, details, extra) => {
                    if (method === "wampcra") {
                        return autobahn.auth_cra.sign(this.config.wamp.password, extra.challenge);
                    }
                }
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
        // TODO: Make a cool RESTful API for phonebook
    }

    *initMysql() {

        yield this.mysql = mysql.createConnection({
            host : this.config.mysql.host,
            user : this.config.mysql.user,
            password : this.config.mysql.password,
            database : this.config.mysql.database,
            charset : this.config.mysql.charset
        });

        this.logger.info('Init: Connected to Mysql Database.');

        setInterval(() => {
            this.mysql.query('SELECT 1');
        }, 5000);

    }

};
