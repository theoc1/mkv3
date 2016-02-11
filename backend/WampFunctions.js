

module.exports = {
    authenticate: (args, kwargs, details) => {
        this.logger.info('Auth from origin: ' + args[2].transport.http_headers_received.origin + ' from ' + args[2].transport.peer + '. User - ' + args[1]);
        var authid = args[1];
        var d = when.defer();
        var result =[];
        let myquery = "SELECT password FROM users WHERE username='" + authid + "'";
        var query = this.mysql.query(myquery);
        query.on('result', function(row){
            result.push(row);
        });

        query.on('end', function(){
            logger.info('user result: ' + JSON.stringify(result));
            d.resolve( { 'secret': result[0].password, 'role': 'frontend' } );
            //TODO: handle incorrect login name
        });

        return d.promise;
    }
}