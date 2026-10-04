const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const token = process.env.token;
const clientId = process.env.clientId;
const announceCommand = require('./commands/announce');
 
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
 
client.once('ready', () => {
  console.log(`✅ 봇 온라인: ${client.user.tag}`);
});
 
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
 
  if (interaction.commandName === '공지') {
    await announceCommand.execute(interaction);
  }
});
 
client.login(token);
 
