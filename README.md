# FormsDB

HTTP(S) server that redirects HTML form data (POST only) to a MongoDB instance.

## Usage

You can send your form's data to the server through the HTML `form`'s `method` and `action` properties.  
Example:

```
<form action="https://formsdb.com" method="post">
    <input name="name" value="John Johnson"/>
    <input type="submit"/>
</form>
```

When pressing the submit button, the server will forward the form's data to your MongoDB instance.  
You can then store, transform, export the data from your MongoDB instance as you wish.  
In the above's example, the data would be saved as such:

```json
// Under the collection "formsubmissions" per default, can be changed through the model name argument in setup.
{
    "name": "John Johnson"
}
```

### Schema

The server, per default, does **not** enforce any schema. You can change this in the setup arguments.

### Security

The server does **not** have any security features to prevent abuse or spam, apart from TLS and schema enforcement. It's on your end.

## Setup

Make sure you have a mongodb instance ready. Alternatively, the `docker-compose.yml` (for http) or `docker-compose-https.yml` (for https) that ship with the sources can be used to quickly spin up a working default setup of the server + database.

**Note:** If running in https mode, make sure you also have a certificate ready. Per default, the server will try to find the key and certificate in the same directory, under the names `server.key` and `server.crt`, respectively. This can be changed in the setup arguments.

### Docker

>```bash
>docker run formsdb:latest -e PORT=3000 -e MONGODB_URL=mongodb://localhost:27017/formsdb
> ```

The docker will run as user `formsdb` in directory `/home/formsdb/`. This will be where the default relative paths resolve to.

### From source

>```bash
>node server.js --port=3000 --mongodb-url=mongodb://localhost:27017/formsdb
>```

**Note:** In both cases, `port` and `mongodb-url` are optional parameters, and can be omitted in favor of default values.

### Arguments (cli, docker)
- General
    - `port`, `PORT`: The port at which the server should run. Defaults to `3000`.
    - `response-html-path`, `RESPONSE_HTML_PATH`: The path to the html view that will be returned. Defaults to `./response.html`.
- MongoDB
    - `mongodb-url`, `MONGODB_URL`: The full url of the MongoDB instance that will receive the form data. Defaults to `mongodb://localhost:27017/formsDB`.
    - `schema`, `SCHEMA`: A MongoDB schema (in Json) that the server should enforce against upcoming form posts. Defaults to nothing, meaning that any form data sent will be saved.
    - `model-name`, `MODEL_NAME`: The name (in Mongoose) of the MongoDB model in which the form data will be saved. Defaults to `FormSubmission`, which creates a `formsubmissions` collection.
- Https
    - `https`, `HTTPS`: Enables https mode. Defaults to `false`.
    - `ssl-cert-path`, `SSL_CERT_PATH`: (Https mode only) The path to the certificate file. Defaults to `./server.crt`.
    - `ssl-key-path`, `SSL_KEY_PATH`: (Https mode only) The path to the certificate key file. Defaults to `./server.key`.