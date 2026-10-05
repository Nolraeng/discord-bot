const {
  EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder,
  PermissionFlagsBits, ChannelType, OverwriteType
} = require('discord.js');
const fs = require('fs');
const path = require('path');
 
const logPath = path.join(__dirname, 'verifylog.json');
const ticketLogPath = path.join(__dirname, 'ticketlog.json');
 
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
 
// ==================== 밴 ====================
async function 밴(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ 관리자만 사용할 수 있습니다.', ephemeral: true });
  }
 
  const target = interaction.options.getUser('유저');
  const reason = interaction.options.getString('사유') || '사유 없음';
 
  if (target.id === interaction.user.id) {
    return interaction.reply({ content: '❌ 자기 자신을 밴할 수 없습니다.', ephemeral: true });
  }
 
  const member = interaction.guild.members.cache.get(target.id);
  if (member && !member.bannable) {
    return interaction.reply({ content: '❌ 해당 유저를 밴할 권한이 없습니다. (봇의 역할이 더 높아야 합니다)', ephemeral: true });
  }
 
  try {
    await interaction.guild.members.ban(target.id, { reason });
    const embed = new EmbedBuilder()
      .setTitle('🔨 유저 밴')
      .addFields(
        { name: '유저', value: `${target.tag} (<@${target.id}>)`, inline: true },
        { name: '관리자', value: `${interaction.user.tag}`, inline: true },
        { name: '사유', value: reason }
      )
      .setColor(0xed4245)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: '❌ 밴 실패. 봇 권한을 확인해주세요.', ephemeral: true });
  }
}
 
// ==================== 킥 ====================
async function 킥(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ 관리자만 사용할 수 있습니다.', ephemeral: true });
  }
 
  const target = interaction.options.getUser('유저');
  const reason = interaction.options.getString('사유') || '사유 없음';
 
  if (target.id === interaction.user.id) {
    return interaction.reply({ content: '❌ 자기 자신을 킥할 수 없습니다.', ephemeral: true });
  }
 
  const member = interaction.guild.members.cache.get(target.id);
  if (!member) {
    return interaction.reply({ content: '❌ 해당 유저가 서버에 없습니다.', ephemeral: true });
  }
  if (!member.kickable) {
    return interaction.reply({ content: '❌ 해당 유저를 킥할 권한이 없습니다.', ephemeral: true });
  }
 
  try {
    await member.kick(reason);
    const embed = new EmbedBuilder()
      .setTitle('👢 유저 킥')
      .addFields(
        { name: '유저', value: `${target.tag} (<@${target.id}>)`, inline: true },
        { name: '관리자', value: `${interaction.user.tag}`, inline: true },
        { name: '사유', value: reason }
      )
      .setColor(0xfee75c)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: '❌ 킥 실패. 봇 권한을 확인해주세요.', ephemeral: true });
  }
}
 
// ==================== 타임아웃 ====================
async function 타임아웃(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ 관리자만 사용할 수 있습니다.', ephemeral: true });
  }
 
  const target = interaction.options.getUser('유저');
  const minutes = interaction.options.getInteger('시간');
  const reason = interaction.options.getString('사유') || '사유 없음';
 
  if (target.id === interaction.user.id) {
    return interaction.reply({ content: '❌ 자기 자신을 타임아웃할 수 없습니다.', ephemeral: true });
  }
 
  const member = interaction.guild.members.cache.get(target.id);
  if (!member) {
    return interaction.reply({ content: '❌ 해당 유저가 서버에 없습니다.', ephemeral: true });
  }
 
  try {
    const duration = minutes * 60 * 1000;
    await member.timeout(duration, reason);
    const embed = new EmbedBuilder()
      .setTitle('⏱️ 타임아웃')
      .addFields(
        { name: '유저', value: `${target.tag} (<@${target.id}>)`, inline: true },
        { name: '관리자', value: `${interaction.user.tag}`, inline: true },
        { name: '시간', value: `${minutes}분`, inline: true },
        { name: '사유', value: reason }
      )
      .setColor(0xffa500)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  } catch {
    await interaction.reply({ content: '❌ 타임아웃 실패. 봇 권한을 확인해주세요.', ephemeral: true });
  }
}
 
// ==================== 티켓 열기 ====================
async function 티켓열기(interaction) {
  const guild = interaction.guild;
  const user = interaction.user;
  const channelName = `티켓-${user.username.toLowerCase().replace(/[^a-z0-9가-힣]/g, '')}`;
 
  // 이미 열린 티켓 확인
  const existing = guild.channels.cache.find(c => c.name === channelName);
  if (existing) {
    return interaction.reply({ content: `❌ 이미 열린 티켓이 있습니다: <#${existing.id}>`, ephemeral: true });
  }
 
  try {
    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: user.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory],
        },
        {
          id: guild.members.me.id,
          allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageChannels],
        },
        // 관리자는 자동으로 볼 수 있음
      ],
    });
 
    const embed = new EmbedBuilder()
      .setTitle('🎫 티켓이 생성되었습니다')
      .setDescription(`안녕하세요 <@${user.id}>님!\n문의 내용을 입력해주세요. 관리자가 곧 답변드릴게요.`)
      .setColor(0x5865f2)
      .setTimestamp();
 
    const closeButton = new ButtonBuilder()
      .setCustomId('ticket_close')
      .setLabel('🔒 티켓 닫기')
      .setStyle(ButtonStyle.Danger);
 
    const row = new ActionRowBuilder().addComponents(closeButton);
 
    await ticketChannel.send({ content: `<@${user.id}>`, embeds: [embed], components: [row] });
    await interaction.reply({ content: `✅ 티켓이 생성되었습니다: <#${ticketChannel.id}>`, ephemeral: true });
 
    // 티켓 로그 저장
    const logs = fs.existsSync(ticketLogPath) ? JSON.parse(fs.readFileSync(ticketLogPath, 'utf-8')) : [];
    logs.push({
      userId: user.id,
      username: user.tag,
      channelId: ticketChannel.id,
      channelName,
      openedAt: new Date().toISOString(),
      status: 'open',
    });
    fs.writeFileSync(ticketLogPath, JSON.stringify(logs, null, 2));
 
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: '❌ 티켓 생성 실패. 봇 권한을 확인해주세요.', ephemeral: true });
  }
}
 
// ==================== 티켓 패널 (관리자) ====================
async function 티켓(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    return interaction.reply({ content: '❌ 관리자만 사용할 수 있습니다.', ephemeral: true });
  }
 
  const title = interaction.options.getString('제목') || '🎫 티켓 시스템';
  const description = interaction.options.getString('내용') || '아래 버튼을 눌러 문의 티켓을 생성하세요.\n관리자가 확인 후 답변드릴게요.';
 
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0x5865f2)
    .setTimestamp();
 
  const button = new ButtonBuilder()
    .setCustomId('ticket_open')
    .setLabel('🎫 티켓 열기')
    .setStyle(ButtonStyle.Primary);
 
  const row = new ActionRowBuilder().addComponents(button);
 
  await interaction.channel.send({ embeds: [embed], components: [row] });
  await interaction.reply({ content: '✅ 티켓 패널을 전송했습니다!', ephemeral: true });
}
 
// ==================== 티켓 닫기 버튼 처리 ====================
async function ticketCloseButton(interaction) {
  const channel = interaction.channel;
 
  // 관리자 또는 채널 이름에 본인 이름이 있는 경우만 닫기 가능
  const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);
  const isOwner = channel.name.includes(interaction.user.username.toLowerCase().replace(/[^a-z0-9가-힣]/g, ''));
 
  if (!isAdmin && !isOwner) {
    return interaction.reply({ content: '❌ 티켓 소유자 또는 관리자만 닫을 수 있습니다.', ephemeral: true });
  }
 
  const embed = new EmbedBuilder()
    .setTitle('🔒 티켓 닫힘')
    .setDescription(`<@${interaction.user.id}>님이 티켓을 닫았습니다.\n5초 후 채널이 삭제됩니다.`)
    .setColor(0xed4245)
    .setTimestamp();
 
  await interaction.reply({ embeds: [embed] });
 
  // 로그 업데이트
  if (fs.existsSync(ticketLogPath)) {
    const logs = JSON.parse(fs.readFileSync(ticketLogPath, 'utf-8'));
    const idx = logs.findIndex(l => l.channelId === channel.id);
    if (idx !== -1) {
      logs[idx].status = 'closed';
      logs[idx].closedAt = new Date().toISOString();
      logs[idx].closedBy = interaction.user.tag;
      fs.writeFileSync(ticketLogPath, JSON.stringify(logs, null, 2));
    }
  }
 
  setTimeout(() => channel.delete().catch(() => {}), 5000);
}
 
module.exports = { 공지, 버튼인증, 버튼인증로그, verifyButton, 밴, 킥, 타임아웃, 티켓, 티켓열기, ticketCloseButton };
 
