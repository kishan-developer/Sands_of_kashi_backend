const express = require("express");
const channalrouter = express.Router();

const {
 createChannel,
 getChannels,
 updateChannel,
 deleteChannel
} = require("../controllers/admin/channel.controller");

channalrouter.post("/",createChannel);

channalrouter.get("/",getChannels);

channalrouter.put("/:id",updateChannel);

channalrouter.delete("/:id",deleteChannel);

module.exports = channalrouter;
