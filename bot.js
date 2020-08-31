const https = require('https');
const Discord = require("discord.js");

const client = new Discord.Client();


// Discord bot configurations
const config = {
    "prefix": "<"
};


// Discord bot commands.
const ping = async (message) => {
    console.log(ping);
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
}

const help = async (message) => {
    console.log(help);
    await message.channel.send("<tiny> [attachment]\n<tiny> [URL]");
}

const tiny = async (message, args) => {
    console.log(tiny);

    const [longURL] = args;

    // If an attachment such as an image exists, use its URL, else use the supplied long URL
    const encodeURL = message.attachments.size ? message.attachments.first().url : longURL;

    const requestURL = "https://tinyurl.com/api-create.php?url=" + encodeURIComponent(encodeURL);

    https.get(requestURL, async (resp) => {
        if (resp.statusCode != 200)
            return await message.channel.send("There was an error creating your TinyURL.");

        let tinyURL = '';

        // A chunk of data has been recieved.
        resp.on("data", (chunk) => {
            tinyURL = tinyURL + chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", async () => {
            console.log(`TinyURL created for ${message.author.id}: ${tinyURL}`);
            await message.channel.send(tinyURL);
        });

    }).on("error", async (err) => {
        console.log("Error: " + err.message);
        await message.channel.send("Internal bot error! Please contact the developer < lamason#6347 >.");
    });
}


// Discord bot events.
client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`);
    client.user.setActivity("<help>");
});

client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.cache.size} servers`);
});

client.on("message", async message => {
    // Cease execution if the message author is a bot, or the message does not begin with the specified prefix.`
    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Separate our "command" name, and our "arguments" for the command. 
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    console.log(`COMMAND: <${command}`);

    switch (command) {
        case "ping>":
            ping(message);
            break;
        case "help>":
            help(message);
            break;
        case "tiny>":
            tiny(message, args);
            break;
    }
});


// Main script
const main = () => {
    // Discord bot login to discord.
    client.login(process.env.TOKEN);
}

main();
