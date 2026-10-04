const { Client, GatewayIntentBits } = require('discord.js');
const token = process.env.token;
const announce = require('./commands');
const http = require('http');
 
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
 
client.once('ready', () => {
  console.log(`✅ 봇 온라인: ${client.user.tag}`);
});
 
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === '공지') return announce.공지(interaction);
    if (interaction.commandName === '버튼인증') return announce.버튼인증(interaction);
    if (interaction.commandName === '버튼인증로그') return announce.버튼인증로그(interaction);
  }
  if (interaction.isButton()) {
    if (interaction.customId.startsWith('verify_')) return announce.verifyButton(interaction);
  }
});
 
http.createServer((req, res) => res.end('OK')).listen(3000);
client.login(token);
 
