### PART 1
## Get started
First, we will focus on implementing the Node.js API. For the following, it is assumed that you already got Node.js installed. Then create a project folder (e.g. mkdir aws-example) and initialize the project: npm init -y. Then we install some dependencies: npm i -S express body-parser morgan and next npm i -D nodemon. In the package.json file add the following line under the scripts entry: "start:dev": "nodemon app.js". Nodemon will now be able to restart automatically every time you make a code change (good for local development). Now create the entry file of our API. Call it e.g. app.js and add this code:

# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const http = require("http");
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");

const port = parseInt(process.env.PORT, 10) || 8000;

// Set up the express app
const app = express();
const server = http.createServer(app);

// Log requests to the console.
app.use(logger("dev"));

// Parse incoming requests data (https://github.com/expressjs/body-parser)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get("*", (req, res) =>
  res.status(200).send({
    message: "Init the API!"
  })
);

//module.exports = app;

app.set("port", port);

server.listen(port);


# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

## The initial app.js as the entry point for the API application
To test the app run npm run start:dev and visit http://localhost:8000. This is the first initialization of our API. The GET request listens to any endpoint (*). Next, it is time to model our item entities.

## The item entity and Sequelize
This section will set up the item entity or model for our API application. Therefore we will use sequelize.js. So install the sequelize command line interface globally: npm i -g sequelize-cli . Next, create the .sequelizerc file in your root project folder. Add the following configurations into that file:

# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const path = require('path');

module.exports = {
  "config": path.resolve('./server/config', 'config.json'),
  "models-path": path.resolve('./server/models'),
  "seeders-path": path.resolve('./server/seeders'),
  "migrations-path": path.resolve('./server/migrations')
}; 
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

## Folder path configuration for the sequelize framework
This defines necessary folders and paths used for the Object-Relational Mapping (ORM) in the Node.js framework. Now it is time to install sequelize and postgres with npm i --save sequelize pg pg-hstore. This allows us to initialize the folder structure defined by the .sequelizerc file. Thus run sequelize init in your root project folder.

We can now create our item model with the sequelize command line interface: sequelize model:create --name Item --attributes item_id:integer,name:string,weight:float. As you can see we gave it the attributes: item_id (integer), name (string) and weight (float). Sequelize will automatically add an id attribute, as well as createdAt and updatedAt attributes (both dates).

The item model entity can be found in …/server/models and …/server/migrations. The migrations part will create the item Table (notice the pluralization and capitalization to Items). The models part maps the internal items object to the database object (notice the capitalization to Item).

For more details on using sequelize and Node.js please go back to other tutorials, as this is just a small example project for an AWS deployment. You could e.g. also define associates (relations between different models, e.g. many-to-one). Hence, take a look into this article.

Now we have a basic application running and the item models created. In the next part of this tutorial series, we will setup a PostgreSQL DB and the actual API endpoints to test our application locally. In the last part of the series, we are going to deploy our app to the AWS ecosystem.



### ########################################################################################################### 
### PART 2

## The API Endpoint
We are now creating the API endpoints for the item entity. Therefore, we have to define the controller itemController and the routing. The itemController will handle the creation, updating, deletion and retrieving of the item entities in the PostgreSQL DB. Create a new folder controllers under …/server/controllers and add a file item.js. Insert the following code into that file:
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const Item = require("../models").Item;

module.exports = {
  create(req, res) {
    return Item.create({
      item_id: req.body.item_id,
      name: req.body.name,
      weight: req.body.weight
    })
      .then(item =>
        res
          .status(201)
          .send({
            success: true,
            message: "Successfully created an item entity.",
            item
          })
      )
      .catch(error => res.status(400).send(error));
  }
};
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

## API controller function for saving an item entity in the DB
To make the controller easily accessible within our app, we export it. Go and create a new file index.js in the …/server/controllers folder. Add this code:
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const item = require("./item");

module.exports = {
  item
};
# Index file to export all API controllers
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Now we need to route the incoming API request to the newly created controller function. Hence create the index.js file under …/server/routes. Insert this code:
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const itemController = require("../controllers").item;

module.exports = app => {
  app.get("/api", (req, res) =>
    res.status(200).send({
      message: "Welcome to the API!"
    })
  );

  app.post("/api/item", itemController.create);
};
# POST route to invoke the item controller
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

The new controller route has to be integrated into the entry file app.js of our API application. Therefore, import the routes by modifying the app.js file:
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const http = require("http");
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");

const port = parseInt(process.env.PORT, 10) || 8000;

// Set up the express app
const app = express();
const server = http.createServer(app);

// Log requests to the console.
app.use(logger("dev"));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Require our routes into the application.
require("./server/routes")(app);
app.get("*", (req, res) =>
  res.status(200).send({
    message: "Welcome!"
  })
);

app.set("port", port);

server.listen(port);
# Updated app.js with API endpoint routes
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Now our API has the endpoints POST /api/item (this will create an item entity) and GET /api (this will message Welcome to the API!) and GET * (this will message Welcome!). Before actually using the API, we have to set up and connect our PostgreSQL DB.

## The PostgreSQL DB
At first, we are going to set up the PostgreSQL locally to be able to test if everything is running. It is assumed that you already have installed PostgreSQL and the DB is running on http://127.0.0.1:5432. Furthermore, I assume that your PostgreSQL has the superuser postgres with an empty default password (null). You also have to set up a database. We will give it the name db-dev ( createdb db-dev -U postgres).

So let’s connect our application with the database by properly setting the config.js file in the …/server/config folder:
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

{
  "development": {
    "username": "postgres",
    "password": null,
    "database": "db-dev",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

## Sequelize configuration to connect with local PostgreSQL DB
We are only focusing on the development stage for the whole tutorial. Here we set the username to postgres, let password empty (null) and the database name to db-dev (as you already specified in the PostgreSQL DB). If the DB is running on the specified host URL, we can use the sequelize command line interface to set up the tables in the DB. Let’s persist the item model to the database with sequelize db:migrate.

## Testing the API endpoints
For testing our API endpoints we can use the postman tool. This lets you specify the POST request with a JSON body. We are trying to save e.g. the item entity: {"item_id": 1234, "name": "laptop", "weight": 1.2}. You can now go and connect with your local PostgreSQL DB and view the new item entry. Use e.g. pgadmin or the command line tool.
## // test with POSTMAN 


## POST /api/item request via postman
Define the remaining API endpoints
So far we have only built the POST API endpoint for saving an item entity in the DB. But with that foundation, we can easily complete the CRUD application.

Let’s go and add a GET endpoint to list all items and a single item by its ID. Therefore, go back to the …/server/controllers/item.js file and add the list function underneath the create function. We will also provide a function to retrieve a single item via GET /api/item/:itemId (e.g. /api/item/1). Notice, that this ID is not our own specified item_id. But you could also use our ID as well, or any other attribute for retrieval (use the query function findAll() with where constraint).

Next, add a PUT endpoint to update a single item (/api/item/:itemId). Hence add the update function to the other functions in the …/server/controllers/item.js file. Again, be aware of the item ID (!= item_id)!

Lastly, we build the DELETE endpoint (/api/item) by adding also the delete function. Again, be aware of the item ID (!= item_id)!

In the following code snippet, you can see the updated item.js file of our controller:
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const Item = require("../models").Item;

module.exports = {
  create(req, res) {
    return Item.create({
      item_id: req.body.item_id,
      name: req.body.name,
      weight: req.body.weight
    })
      .then(item =>
        res.status(201).send({
          success: true,
          message: "Successfully created an item entity.",
          item
        })
      )
      .catch(error => res.status(400).send(error));
  },

  list(req, res) {
    return Item.all()
      .then(items => res.status(200).send(items))
      .catch(error => res.status(400).send(error));
  },

  retrieve(req, res) {
    // Use findAll() with where to use our own specified ID
    /*
        return Item.findAll({
      where: {
        item_id: req.params.itemId
      }
    })
    */
    return Item.findById(req.params.itemId)
      .then(item => {
        if (!item) {
          return res.status(404).send({
            message: "Item Not Found"
          });
        }
        return res.status(200).send(item);
      })
      .catch(error => res.status(400).send(error));
  },

  update(req, res) {
    return Item.findById(req.params.itemId)
      .then(item => {
        if (!item) {
          return res.status(404).send({
            message: "Item Not Found"
          });
        }
        return item
          .update(req.body)
          .then(() => res.status(200).send(item))
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  },

  delete(req, res) {
    return Item.findById(req.params.itemId)
      .then(item => {
        if (!item) {
          return res.status(400).send({
            message: "Item Not Found"
          });
        }
        return item
          .destroy()
          .then(() =>
            res.status(204).send({ message: "Successfully deleted the item!" })
          )
          .catch(error => res.status(400).send(error));
      })
      .catch(error => res.status(400).send(error));
  }
};
# Updated API controller for the item entity with all CRUD operations
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Before we are finished, we also need to update our routes for the new endpoints. So update the code in the …/server/routes/index.js file:
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const itemController = require("../controllers").item;

module.exports = app => {
  app.get("/api", (req, res) =>
    res.status(200).send({
      message: "Welcome to the API!"
    })
  );

  // POST item
  app.post("/api/item", itemController.create);
  // GET list of all items
  app.get("/api/item", itemController.list);
  // GET a single item by ID
  app.get("/api/item/:itemId", itemController.retrieve);
  // UPDATE a single item by ID
  app.put("/api/item/:itemId", itemController.update);
  // DELETE a single item by ID
  app.delete("/api/item/:itemId", itemController.delete);
};
# Updated API routes with all CRUD operations for the item entity
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Go and test your new API endpoints… 🙌

Finally, our Node.js API application runs in our local environment. In the 3rd part, you will see how to easily deploy this app on Amazon’s AWS cloud infrastructure.

### ########################################################################################################### 

### PART 3

## Initialization of the AWS RDS PostgreSQL
You should first create an AWS RDS PostgreSQL instance at AWS. For further details please visit the AWS documentation. Do not forget to use the free tier option and leave all the default options. I created a database called awsdb with a user root and the password password. To test your connection with the AWS DB, you can replace the credentials and host URL from our local development configuration in the …/server/config/config.js file. But before using the API application, run again sequelize db:migrate.
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

{
  "development": {
    "username": "root",
    "password": "password",
    "database": "awsdb",
    "host": "db-dev.cbgy4xndorof.eu-central-1.rds.amazonaws.com",
    "dialect": "postgres"
  },
  "test": {
    "username": "root",
    "password": null,
    "database": "database_test",
    "host": "127.0.0.1",
    "dialect": "postgres"
  },
  "production": {
    "username": "root",
    "password": null,
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "postgres"
  }
}
## Updated config.js file to connect with the AWS RDS PostgreSQL DB (awsdb)
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

Notice that this is still in the development stage. The given AWS RDS instance is not running anymore, so please set up and connect to your own.

Now that the database is running and the connection is established, we can deploy our application as an AWS lambda function.

AWS lambda deployment
We will use the claudia.js framework for easy deployment. Specifically, we can use the aws-serverless-express module of claudia.js to translate the express.js requests to AWS API Gateway requests. The wrapper function will be generated automatically by a claudia command. Hence, I assume that you already got claudia.js installed.

First, we make some changes in our API entry file app.js and stop listening to the TCP port. Instead, we have to export the module by adding module.exports = app;.
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const http = require("http");
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");

const port = parseInt(process.env.PORT, 10) || 8000;

// Set up the express app
const app = express();
const server = http.createServer(app);

// Log requests to the console.
app.use(logger("dev"));

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Require our routes into the application.
require("./server/routes")(app);
app.get("*", (req, res) =>
  res.status(200).send({
    message: "Welcome!"
  })
);

// No need for aws lambda deployment
/*
app.set("port", port);
server.listen(port);
*/

module.exports = app;
## Remove port listener and export your app module
# !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

After that, we are ready to wrap our application and create a serverless proxy with the claudia command line interface: claudia generate-serverless-express-proxy --express-module app. If your main Node.js/express application file is called other than app, replace that name. This command will add the aws-serverless-express dependency and add a file (module) called lambda.js.

Now we can finally deploy our application as an AWS lambda function. Again use a claudia command: claudia create --handler lambda.handler --deploy-proxy-api --region eu-central-1. You can set the handler which consists of the currently created lambda module (default name) and an AWS region. The app will now be sent to AWS lambda. You will see the URL in the console. For further details, e.g. how to set limitations for the AWS lambda function, refer to the claudia documentation.

If you change the code of your application and you want to re-deploy it, then use the claudia update command.

## Final Test
That’s it! Your API application is finally deployed 🚀

You can once again test the endpoints by using e.g. the postman tool. Notice to use the right URL.

## USE POSTMAN Now to perform request with lambda function 
# POST request for an item entity to the AWS lambda function

If it should not work and you get a response like internal server error, you might have to change the security group configuration of your AWS RDS instance. Edit the inbound rules and set the source to Anywhere, so that every IP can reach your AWS RDS instance. This is due to the fact that the IP addresses of AWS lambda functions are dynamically created and not known beforehand. More to limitations on AWS lambda function in the Outro section.

Changing inbound rule for the AWS RDS instance to Anywhere

## Outro
This was just a basic API application. Do not refer to this as best practice in developing an API. The goal was to test how tools like express, sequelize, and claudia can be used for a fast Node.js API deployment in the AWS ecosystem. The advantage of claudia really kicks in, as you can simply build your normal Node.js/express API app. Then, with a few commands, you are able to deploy it as an AWS lambda function.