const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dotenv = require('dotenv');
const cors = require('cors');
const WebSocket = require( "ws");
const bodyParser = require("body-parser");
const util = require("util");

dotenv.config();

const MONGODB = process.env.MONGODB_KEY;

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const usersFilePath = path.join("./uploads/drawingUsers", "users.json");

const writeFileAsync = util.promisify(fs.writeFile);
const app = express();
app.use(express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.text({ type: "text/plain", limit: "50mb" }));
app.use(cors());

app.get("/download", (req, res) => {
  const filePath = path.join(uploadDirectory, "blob.txt");

  if (fs.existsSync(filePath)) {
    const data = {
      Canvas: fs.readFileSync(filePath, "utf8"),
      Users: JSON.parse(fs.readFileSync(usersFilePath))
    }
    res.setHeader("Content-Type", "text/plain");
    res.send(data);
  } else {
    res.status(404).send("Файл не найден");
  }
});

app.use(express.static("public"));

const uploadDirectory = path.join(__dirname, "uploads");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post("/upload", async (req, res) => {
  const { user, position, dataURL } = req.body;
  const textToWrite = dataURL;
  const filePath = path.join(uploadDirectory, "blob.txt");

  try {
    await writeFileAsync(filePath, textToWrite);
    const userPositionData = { user, position };
    const existingData = JSON.parse(fs.readFileSync(usersFilePath));
    existingData.push(userPositionData);
    fs.writeFileSync(usersFilePath, JSON.stringify(existingData));
    res.sendStatus(200);
  } catch (error) {
    console.error("Failed to write text to file:", error);
    res.sendStatus(500);
  }
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app });

const httpServer = createServer(app);

mongoose.connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB connection successful");
    httpServer.listen({ port: 3000 }, () => {
      console.log(`Server running at http://localhost:3000${server.graphqlPath}`);
      new SubscriptionServer(
        {
          execute,
          subscribe,
          schema: server.schema,
        },
        {
          server: httpServer,
          path: server.graphqlPath,
        },
      );
    });
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
  });

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory);
}