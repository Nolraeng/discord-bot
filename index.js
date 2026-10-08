const { Client, GatewayIntentBits } = require('discord.js');
const token = process.env.token;
const cmd = require('./commands');
const http = require('http');
 
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
 
client.once('ready', () => {
  console.log(`✅ 봇 온라인: ${client.user.tag}`);
});
 
client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {
    if (interaction.commandName === '공지') return cmd.공지(interaction);
    if (interaction.commandName === '버튼인증') return cmd.버튼인증(interaction);
    if (interaction.commandName === '버튼인증로그') return cmd.버튼인증로그(interaction);
    if (interaction.commandName === '밴') return cmd.밴(interaction);
    if (interaction.commandName === '킥') return cmd.킥(interaction);
    if (interaction.commandName === '타임아웃') return cmd.타임아웃(interaction);
    if (interaction.commandName === '티켓') return cmd.티켓(interaction);
  }
 
  if (interaction.isButton()) {
    if (interaction.customId.startsWith('verify_')) return cmd.verifyButton(interaction);
    if (interaction.customId === 'ticket_open') return cmd.티켓열기(interaction);
    if (interaction.customId === 'ticket_close') return cmd.ticketCloseButton(interaction);
  }
});
 
http.createServer((req, res) => res.end('OK')).listen(3000);
client.login(token);
 
