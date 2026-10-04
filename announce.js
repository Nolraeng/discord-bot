const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
 
module.exports = {
  data: {
    name: '공지',
    description: '지정한 채널에 임베드 공지를 전송합니다.',
    options: [
      {
        name: '채널',
        description: '공지를 보낼 채널',
        type: 7, // CHANNEL
        required: true,
      },
      {
        name: '제목',
        description: '공지 제목',
        type: 3, // STRING
        required: true,
      },
      {
        name: '메시지',
        description: '공지 내용',
        type: 3, // STRING
        required: true,
      },
    ],
  },
 
  async execute(interaction) {
    // 권한 체크 (관리자만 사용 가능)
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: '❌ 이 명령어는 관리자만 사용할 수 있습니다.',
        ephemeral: true,
      });
    }
 
    const channel = interaction.options.getChannel('채널');
    const title = interaction.options.getString('제목');
    const message = interaction.options.getString('메시지');
 
    // 텍스트 채널인지 확인
    if (!channel.isTextBased()) {
      return interaction.reply({
        content: '❌ 텍스트 채널을 선택해주세요.',
        ephemeral: true,
      });
    }
 
    const embed = new EmbedBuilder()
      .setTitle(`📢 ${title}`)
      .setDescription(message)
      .setColor(0x5865f2) // 디스코드 블루퍼플
      .setTimestamp()
      .setFooter({
        text: `공지 작성자: ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL(),
      });
 
    try {
      await channel.send({ embeds: [embed] });
      await interaction.reply({
        content: `✅ <#${channel.id}>에 공지를 전송했습니다!`,
        ephemeral: true,
      });
    } catch (err) {
      console.error('공지 전송 오류:', err);
      await interaction.reply({
        content: '❌ 공지 전송에 실패했습니다. 봇의 채널 권한을 확인해주세요.',
        ephemeral: true,
      });
    }
  },
};
 