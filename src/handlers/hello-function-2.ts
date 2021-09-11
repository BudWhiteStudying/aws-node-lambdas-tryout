import { APIGatewayProxyResult } from 'aws-lambda';
import mariadb = require('mariadb');

const SOME_SQL_QUERY = 'SELECT * FROM PEWPEW_ARENA_APP.CHARACTER';

const connectionPool = mariadb.createPool({
  host: "host",
  user: "user",
  password: "password",
  connectionLimit: 10    //TODO: not sure how to handle this
});

export const handler = async (): Promise<APIGatewayProxyResult> => {
    console.log("About to connect");
    return new Promise((resolve,reject)=>{
        connectionPool.getConnection()
        .then((connection)=>{
            connection.query(SOME_SQL_QUERY)
            .then((result)=>{
                console.debug(`All is well, got result: ${result}`);
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