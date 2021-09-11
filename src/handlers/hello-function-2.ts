import { APIGatewayProxyResult } from 'aws-lambda';
import mariadb = require('mariadb');

const SOME_SQL_QUERY = 'SELECT * FROM PEWPEW_ARENA_APP.CHARACTER';

var connectionPool : mariadb.Pool;

const initializeConnectionPool = async () => {
    console.log(`About to initialize pool, params are: ${process.env.DATABASE_HOST} ${process.env.DATABASE_USER} ${process.env.DATABASE_PASSWORD}`);
    connectionPool = mariadb.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        connectionLimit: 10    //TODO: not sure how to handle this
      });
}

export const handler = async (): Promise<APIGatewayProxyResult> => {
    console.log("About to connect");
    if(!connectionPool) {
        console.log(`Connection pool is not initialized, initializing it now`);
        await initializeConnectionPool();
    }
    return new Promise((resolve,reject)=>{
        connectionPool.getConnection()
        .then((connection)=>{
            connection.query(SOME_SQL_QUERY)
            .then((result)=>{
                console.debug(`All is well, got result: ${JSON.stringify(result)}`);
                resolve({ body: JSON.stringify({ message: result }), statusCode: 200 });
            })
            .catch((err)=>{
                console.error(`Problems executing query: ${err}`);
                resolve({ body: JSON.stringify({ message: err }), statusCode: 500 });
            })
            .finally(()=>{
                console.debug("Closing connection in the 'finally' block");
                connection.end();
            });
        })
        .catch((err)=>{
            console.error(`Not connected: ${err}`);
            resolve({ body: JSON.stringify({ message: err }), statusCode: 500 });
        });
    });
};