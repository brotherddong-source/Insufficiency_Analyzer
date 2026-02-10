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

  // GET만 허용
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 클라이언트 IP 가져오기
    const clientIP =
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.headers['x-real-ip'] ||
      req.connection.remoteAddress;

    const ALLOWED_IP = process.env.ALLOWED_IP;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!ALLOWED_IP || !JWT_SECRET) {
      console.error('Environment variables not set');
      return res.status(500).json({ error: '서버 설정 오류' });
    }

    // IP 체크
    if (clientIP === ALLOWED_IP) {
      // 자동 인증 - JWT 토큰 발급
      const token = jwt.sign(
        { authenticated: true, autoLogin: true, timestamp: Date.now() },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        authenticated: true,
        autoLogin: true,
        token,
        ip: clientIP
      });
    }

    // IP가 일치하지 않으면 인증 필요
    return res.status(200).json({
      authenticated: false,
      autoLogin: false,
      ip: clientIP
    });
  } catch (error) {
    console.error('IP verification error:', error);
    return res.status(500).json({ error: 'IP 확인 중 오류가 발생했습니다' });
  }
};
