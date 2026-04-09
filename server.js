import express from 'express';
import mongoose from 'mongoose';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve} from 'path';

const argv = yargs(hideBin(process.argv))
	.option('port', {
		alias: 'p',
		type: 'number',
		description: 'The port at which the server should run. Defaults to 3000.'
	})
	.option('response-html-path', {
		alias: 'v',
		type: 'string',
		description: 'The path to the html view that will be returned. Defaults to "response.html"'
	})
	.option('mongodb-url', {
		alias: 'u',
		type: 'string',
		description: 'The full url of the mongodb instance. Defaults to the full url of the MongoDB instance that will receive the form data. Defaults to "mongodb://localhost:27017/formsdb"'
	})
	.option('schema', {
		alias: 's',
		type: 'string',
		coerce: arg => JSON.parse(arg),
		description: 'A MongoDB schema (in Json) that the server should enforce against upcoming form posts. Defaults to nothing, meaning that any form data sent will be saved.'
	})
	.option('model-name', {
		alias: 'm',
		type: 'string',
		description: 'The name (in Mongoose) of the MongoDB model in which the form data will be saved. Defaults to FormSubmission, which creates a formSubmissions collection.'
	})
	.option('https', {
		alias: 't',
		type: 'boolean',
		description: 'Runs the server in https mode. You will need to specify the path of the ssl certificate and its key, using --ssl-cert-path and --ssl-cert-key, respectively.'
	})
	.option('ssl-key-path', {
		alias: 'k',
		type: 'string',
		description: 'If using https: The path to the certificate key file. Defaults to "server.key"'
	})
	.option('ssl-cert-path', {
		alias: 'c',
		type: 'string',
		description: 'If using https: The path to the certificate file. Defaults to "server.crt"'
	})
	.help()
	.group(['port', 'response-html-path'], 'Server Options:')
	.group(['mongodb-url', 'schema', 'model-name'], 'MongoDB Options:')
	.group(['https', 'ssl-key-path', 'ssl-cert-path'], 'HTTPS Options:')
	.implies('ssl-key-path', ['https'])
	.implies('ssl-cert-path', ['https'])
	.parse();

console.log("FormsDB")
const app = express();
const port = argv["port"] ?? 3000;
console.log(`Using port ${port}`)

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const mongodbUrl = argv["mongodb-url"] ?? "mongodb://localhost:27017/formsdb";
console.log(`Connecting to ${mongodbUrl}...`)
await mongoose.connect(mongodbUrl);
console.log(`Successfully connected.`)

let schema;
if (argv["schema"]) {
	const schemaJson = JSON.parse(argv["schema"]);
	console.log(`Using custom schema ${schemaJson}`)
	schema = new mongoose.Schema(schemaJson);
} else {
	console.log(`Using no schema`)
	schema = new mongoose.Schema({}, { strict: false });
}

const modelName = argv["model-name"] ?? "FormSubmission";
const FormSubmission = mongoose.model(modelName, schema);
console.log(`Using model ${modelName}`)

app.post("/submit", async (req, res) => {
	console.log(`Received form submission`);
	try {
		const submission = new FormSubmission(req.body);
		await submission.save();
		console.log(`Successfully saved form submission`);
	
		const responsePath = argv["response-html-path"] ?? 'response.html';
		console.log(`Sending response view located at path ${responsePath}`);
		res.sendFile(resolve(dirname(fileURLToPath(import.meta.url)), responsePath));
	
	} catch (err) {
		console.error(err);
		res.status(500).send("Could not save form data");
	}
});

console.log(`Setup done`)

const httpsMode = argv["https"]
if (httpsMode) {
	console.log(`Using HTTPS mode`)
	const sslKeyPath = argv["ssl-key-path"] ?? "server.key";
	const sslCertPath = argv["ssl-cert-path"] ?? "server.crt";
	console.log(`Using certificate at ${sslCertPath} with key at ${sslKeyPath}`)
	const sslOptions = {
		key: fs.readFileSync(sslKeyPath),
		cert: fs.readFileSync(sslCertPath)
	};
	await https.createServer(sslOptions, app).listen(port);
} else {
	console.log(`Using HTTP mode`)
	await app.listen(port);
}


console.log(`Server running at ${httpsMode ? 'https' : 'http'}://localhost:${port}`)