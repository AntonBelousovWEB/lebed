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
const WebSocket = require('ws');
const chokidar = require("chokidar");
const http = require("http");

dotenv.config();

const MONGODB = process.env.MONGODB_KEY;

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");

const usersFilePath = path.join("./uploads/drawingUsers", "users.txt");
const uploadDirectory = path.join(__dirname, "uploads");

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
      Users: fs.readFileSync(usersFilePath, "utf8")
    }
    res.setHeader("Content-Type", "text/plain");
    res.send(data);
  } else {
    res.status(404).send("Файл не найден");
  }
});

app.use(express.static("public"));

app.post("/upload", async (req, res) => {
  const { user, position, dataURL } = JSON.parse(req.body);
  const textToWrite = dataURL;
  const filePath = path.join(uploadDirectory, "blob.txt");

  try {
    await writeFileAsync(filePath, textToWrite);

    // Чтение текущего содержимого файла usersFilePath
    let usersData = {};

    if (fs.existsSync(usersFilePath)) {
      const usersFileContent = fs.readFileSync(usersFilePath, "utf8");

      // Проверка, что файл не пустой
      if (usersFileContent.trim() !== "") {
        // Попытка преобразования содержимого файла в объект
        try {
          usersData = JSON.parse(usersFileContent);
        } catch (parseError) {
          console.error("Error parsing users file content:", parseError);
          res.sendStatus(500);
          return;
        }
      }
    }

    // Проверка наличия пользователя с тем же user_id
    if (usersData[user.user_id]) {
      // Если пользователь уже существует, обновите его позицию
      usersData[user.user_id].position = position;
    } else {
      // Если пользователя нет, добавьте его
      usersData[user.user_id] = { user, position };
    }

    // Запись обновленных данных в файл
    fs.writeFileSync(usersFilePath, JSON.stringify(usersData));

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

// ##########################################################

const wsserver = http.createServer(app);
const wss = new WebSocket.Server({ server: wsserver });
const watcher = chokidar.watch(uploadDirectory);

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    if (message === 'folderChange') {
      ws.send('Folder contents have changed.');
    }
  });
});

watcher.on("change", () => {
  const filePath = path.join(uploadDirectory, "blob.txt");
  if (filePath.endsWith("blob.txt")) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('folderChange');
      }
    });
  }
});

// ##########################################################

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