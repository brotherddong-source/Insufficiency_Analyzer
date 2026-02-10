const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // POST만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: '비밀번호를 입력하세요' });
    }

    // 환경 변수에서 해시된 패스워드 가져오기
    const PASSWORD_HASH = process.env.PASSWORD_HASH;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!PASSWORD_HASH || !JWT_SECRET) {
      console.error('Environment variables not set');
      return res.status(500).json({ error: '서버 설정 오류' });
    }

    // 패스워드 검증
    const isValid = await bcrypt.compare(password, PASSWORD_HASH);

    if (!isValid) {
      return res.status(401).json({ error: '비밀번호가 올바르지 않습니다' });
    }

    // JWT 토큰 생성 (24시간 유효)
    const token = jwt.sign(
      { authenticated: true, timestamp: Date.now() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      token,
      message: '인증 성공'
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: '로그인 처리 중 오류가 발생했습니다' });
  }
};
