export const handler = (event : any, context : any, callback : any) => {
	console.log("Executing the event handler");
	callback(null, {statusCode : 200, body : JSON.stringify({message : "Hello F2"})});
}