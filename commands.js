const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
 
const logPath = path.join(__dirname, 'verifylog.json');
 
// ==================== 공지 ====================
async function 공지(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ 관리자만 사용할 수 있습니다.', ephemeral: true });
  }
 
  const channel = interaction.options.getChannel('채널');
  const title = interaction.options.getString('제목');
  const message = interaction.options.getString('메시지');
 
  if (!channel.isTextBased()) {
    return interaction.reply({ content: '❌ 텍스트 채널을 선택해주세요.', ephemeral: true });
  }
 
  const embed = new EmbedBuilder()
    .setTitle(`📢 ${title}`)
    .setDescription(message)
    .setColor(0x5865f2)
    .setTimestamp()
    .setFooter({ text: `공지 작성자: ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() });
 
  try {
    await channel.send({ embeds: [embed] });
    await interaction.reply({ content: `✅ <#${channel.id}>에 공지를 전송했습니다!`, ephemeral: true });
  } catch {
    await interaction.reply({ content: '❌ 공지 전송 실패. 봇의 채널 권한을 확인해주세요.', ephemeral: true });
  }
}
 
// ==================== 버튼인증 ====================
async function 버튼인증(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ 관리자만 사용할 수 있습니다.', ephemeral: true });
  }
 
  const role = interaction.options.getRole('역할');
  const title = interaction.options.getString('제목') || '✅ 인증';
  const description = interaction.options.getString('설명') || '아래 버튼을 눌러 인증을 완료하세요.';
 
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x57f287)
    .setFooter({ text: `인증 역할: ${role.name}` })
    .setTimestamp();
 
  const button = new ButtonBuilder()
    .setCustomId(`verify_${role.id}`)
    .setLabel('✅ 인증하기')
    .setStyle(ButtonStyle.Success);
 
  const row = new ActionRowBuilder().addComponents(button);
 
  await interaction.channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({ content: '✅ 인증 메시지를 전송했습니다!', ephemeral: true });
}
 
// ==================== 버튼인증로그 ====================
async function 버튼인증로그(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ 관리자만 사용할 수 있습니다.', ephemeral: true });
  }
 
  if (!fs.existsSync(logPath)) {
    return interaction.reply({ content: '📋 아직 인증한 사람이 없습니다.', ephemeral: true });
  }
 
  const logs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
  if (logs.length === 0) {
    return interaction.reply({ content: '📋 아직 인증한 사람이 없습니다.', ephemeral: true });
  }
 
  const recent = logs.slice(-20).reverse();
  const description = recent
    .map((log, i) => `${i + 1}. <@${log.userId}> \`${log.username}\` — <t:${Math.floor(new Date(log.timestamp).getTime() / 1000)}:R>`)
    .join('\n');
 
  const embed = new EmbedBuilder()
    .setTitle('📋 인증 로그')
    .setDescription(description)
    .setColor(0x5865f2)
    .setFooter({ text: `총 ${logs.length}명 인증 완료` })
    .setTimestamp();
 
  await interaction.reply({ embeds: [embed], ephemeral: true });
}
 
// ==================== 버튼 클릭 처리 ====================
async function verifyButton(interaction) {
  const roleId = interaction.customId.replace('verify_', '');
  const member = interaction.member;
 
  if (member.roles.cache.has(roleId)) {
    return interaction.reply({ content: '✅ 이미 인증이 완료된 상태입니다.', ephemeral: true });
  }
 
  try {
    await member.roles.add(roleId);
 
    const logs = fs.existsSync(logPath) ? JSON.parse(fs.readFileSync(logPath, 'utf-8')) : [];
    logs.push({
      userId: member.id,
      username: member.user.tag,
      roleId,
      timestamp: new Date().toISOString(),
    });
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));
 
    await interaction.reply({ content: '✅ 인증이 완료되었습니다!', ephemeral: true });
  } catch {
    await interaction.reply({ content: '❌ 역할 부여 실패. 봇의 역할 권한을 확인해주세요.', ephemeral: true });
  }
}
 
module.exports = { 공지, 버튼인증, 버튼인증로그, verifyButton };
 
