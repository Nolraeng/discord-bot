const { REST, Routes } = require('discord.js');
const { token, clientId, guildId } = require('./config.json');
const announceCommand = require('./commands/announce');
 
const commands = [announceCommand.data];
 
const rest = new REST({ version: '10' }).setToken(token);
 
(async () => {
  try {
    console.log('⏳ 슬래시 커맨드 등록 중...');
 
    // guildId가 있으면 특정 서버에만 등록 (즉시 반영), 없으면 글로벌 등록 (최대 1시간 소요)
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log(`✅ 서버(${guildId})에 커맨드 등록 완료!`);
    } else {
      await rest.put(Routes.applicationCommands(clientId), { body: commands });
      console.log('✅ 글로벌 커맨드 등록 완료! (반영까지 최대 1시간 소요)');
    }
  } catch (err) {
    console.error('❌ 커맨드 등록 오류:', err);
  }
})();
 
