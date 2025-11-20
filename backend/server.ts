import express from "express";
import cors from "cors";
import router from "./calculate/router";

const server = express();
server.use(express.json());
server.use(cors())
server.use('/api', router);

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`App running on port ${port}`);
})