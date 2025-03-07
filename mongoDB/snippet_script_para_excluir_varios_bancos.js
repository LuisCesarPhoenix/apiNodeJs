Mongo().getDBNames().forEach(function(db){
    if(['admin', 'config', 'local', 'servidor_A'].indexOf(db) < 0){
        Mongo().getDB(db).dropDatabase();
    }
});