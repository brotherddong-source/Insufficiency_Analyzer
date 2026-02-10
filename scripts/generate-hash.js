const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== IPLAB Workstation - Password Hash Generator ===\n');

rl.question('해시할 패스워드를 입력하세요: ', async (password) => {
  if (!password) {
    console.error('❌ 패스워드를 입력해주세요.');
    rl.close();
    return;
  }

  try {
    console.log('\n⏳ 패스워드 해시 생성 중...\n');

    // bcrypt로 해시 생성 (salt rounds: 10)
    const hash = await bcrypt.hash(password, 10);

    console.log('✅ 해시 생성 완료!\n');
    console.log('아래 값을 .env 파일의 PASSWORD_HASH에 설정하세요:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(hash);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('예시:');
    console.log(`PASSWORD_HASH=${hash}\n`);
  } catch (error) {
    console.error('❌ 해시 생성 실패:', error.message);
  }

  rl.close();
});
