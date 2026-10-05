const { REST, Routes } = require('discord.js');
const token = process.env.token;
const clientId = process.env.clientId;
 
const commands = [
  {
    name: '공지',
    description: '지정한 채널에 임베드 공지를 전송합니다.',
    options: [
      { name: '채널', description: '공지를 보낼 채널', type: 7, required: true },
      { name: '제목', description: '공지 제목', type: 3, required: true },
      { name: '메시지', description: '공지 내용', type: 3, required: true },
    ],
  },
  {
    name: '버튼인증',
    description: '버튼을 눌러 역할을 받을 수 있는 인증 메시지를 전송합니다.',
    options: [
      { name: '역할', description: '인증 시 부여할 역할', type: 8, required: true },
      { name: '제목', description: '인증 임베드 제목', type: 3, required: false },
      { name: '설명', description: '인증 임베드 설명', type: 3, required: false },
    ],
  },
  {
    name: '버튼인증로그',
    description: '인증한 사람들의 목록을 표시합니다.',
  },
  {
    name: '밴',
    description: '유저를 서버에서 밴합니다. (관리자 전용)',
    options: [
      { name: '유저', description: '밴할 유저', type: 6, required: true },
      { name: '사유', description: '밴 사유', type: 3, required: false },
    ],
  },
  {
    name: '킥',
    description: '유저를 서버에서 킥합니다. (관리자 전용)',
    options: [
      { name: '유저', description: '킥할 유저', type: 6, required: true },
      { name: '사유', description: '킥 사유', type: 3, required: false },
    ],
  },
  {
    name: '타임아웃',
    description: '유저에게 타임아웃을 적용합니다. (관리자 전용)',
    options: [
      { name: '유저', description: '타임아웃할 유저', type: 6, required: true },
      { name: '시간', description: '타임아웃 시간 (분)', type: 4, required: true },
      { name: '사유', description: '타임아웃 사유', type: 3, required: false },
    ],
  },
  {
    name: '티켓',
    description: '티켓 생성 패널을 현재 채널에 전송합니다. (관리자 전용)',
    options: [
      { name: '제목', description: '패널 임베드 제목', type: 3, required: true },
      { name: '내용', description: '패널 임베드 내용', type: 3, required: true },
      { name: '티켓제목', description: '티켓 채널 안에 뜨는 임베드 제목', type: 3, required: true },
      { name: '티켓내용', description: '티켓 채널 안에 뜨는 임베드 내용 ({user} 입력 시 멘션)', type: 3, required: true },
    ],
  },
];
 
const rest = new REST({ version: '10' }).setToken(token);
 
(async () => {
  try {
    console.log('⏳ 슬래시 커맨드 등록 중...');
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('✅ 글로벌 커맨드 등록 완료!');
  } catch (err) {
    console.error('❌ 커맨드 등록 오류:', err);
  }
})();
