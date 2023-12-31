const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const { createServer } = require('http');
const { execute, subscribe } = require('graphql');
const { SubscriptionServer } = require('subscriptions-transport-ws');
const path = require("path");
const fs = require("fs");
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require("body-parser");
const util = require("util");
const expressWs = require("express-ws");
const chokidar = require("chokidar");

dotenv.config();

const MONGODB = process.env.MONGODB_KEY;

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const usersFilePath = path.join("./uploads/drawingUsers", "users.txt");
const uploadDirectory = path.join(__dirname, "uploads");
const filePath = path.join(uploadDirectory, "blob.txt");

const writeFileAsync = util.promisify(fs.writeFile);
const app = express();
expressWs(app);
app.use(express.static(path.join(__dirname, "uploads")));
app.use(bodyParser.text({ type: "text/plain", limit: "50mb" }));
app.use(cors());

app.ws("/download", (ws, req) => {
    try {
      ws.on("message", () => {
        if (fs.existsSync(filePath)) {
          const data = {
            Canvas: fs.readFileSync(filePath, "utf8"),
            Users: fs.readFileSync(usersFilePath, "utf8")
          }
          ws.send(JSON.stringify(data));
        } else {
          ws.send(JSON.stringify({ error: "Файл не найден" }));
        }
      });
    } catch(err) {
      console.log(err)
    }
});

app.use(express.static("public"));

app.ws("/upload", async (ws, req) => {
  ws.on("message", async (message) => {
    try {
      const { user, position, dataURL } = JSON.parse(message);
      const textToWrite = dataURL;

      await writeFileAsync(filePath, textToWrite);
      let usersData = {};
      if (fs.existsSync(usersFilePath)) {
        const usersFileContent = fs.readFileSync(usersFilePath, "utf8");
        if (usersFileContent.trim() !== "") {
          try {
            usersData = JSON.parse(usersFileContent);
          } catch (parseError) {
            console.error("Error parsing users file content:", parseError);
            res.sendStatus(500);
            return;
          }
        }
      }
      if (usersData[user.user_id]) {
        usersData[user.user_id].position = position;
      } else {
        usersData[user.user_id] = { user, position };
      }
      fs.writeFileSync(usersFilePath, JSON.stringify(usersData));
    } catch (error) {
      console.error("Failed to write text to file:", error);
      res.sendStatus(500);
    }
  });
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

app.ws("/blob", (ws, req) => {
  ws.send("Успешное Подключение");
  const watcher = chokidar.watch(filePath);
  watcher.on("change", () => {
    ws.send("fileChanged");
  });
});
app.listen(5000)

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
