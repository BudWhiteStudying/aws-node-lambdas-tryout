import { APIGatewayProxyResult } from 'aws-lambda';
import mysql = require('mysql');

const connection = mysql.createConnection({
  host: "host",
  user: "user",
  password: "password"
});

export const handler = async (): Promise<APIGatewayProxyResult> => {
    console.log("About to connect");
    return new Promise((resolve,reject)=>{
        connection.connect(function(err : any) {
            if (err) {
                console.error(`Problems! ${err}`);
                resolve({ body: JSON.stringify({ message: err }), statusCode: 500 });
            }
            else {
                console.log("Connected!");
                resolve({ body: JSON.stringify({ message: 'Hello F2?' }), statusCode: 200 });
            }
          });
    });
};