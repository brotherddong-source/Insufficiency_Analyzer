const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: '토큰이 필요합니다' });
    }

    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('JWT_SECRET not set');
      return res.status(500).json({ error: '서버 설정 오류' });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.authenticated) {
      return res.status(200).json({
        valid: true,
        authenticated: true,
        message: '유효한 토큰입니다'
      });
    }

    return res.status(401).json({ valid: false, error: '유효하지 않은 토큰입니다' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ valid: false, error: '토큰이 만료되었습니다' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ valid: false, error: '유효하지 않은 토큰입니다' });
    }
    console.error('Token verification error:', error);
    return res.status(500).json({ error: '토큰 검증 중 오류가 발생했습니다' });
  }
};
