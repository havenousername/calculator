import express from "express";
import router from "./calculate/router";

const server = express();
server.use(express.json());
server.use('/api', router);

const port = 3333;

server.listen(port, () => {
  console.log(`App running on port ${port}`);
})