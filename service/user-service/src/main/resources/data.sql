-- 사용자 초기 데이터 삽입
-- 기존 데이터가 있으면 무시 (ON CONFLICT DO NOTHING)
-- ID 시퀀스도 함께 조정

-- 기존 데이터 삭제 (선택사항 - 주석 해제하면 기존 데이터 삭제 후 재삽입)
-- DELETE FROM users;

-- 사용자 데이터 삽입 (users.csv에서 가져온 데이터)
INSERT INTO users (id, name, email, password) VALUES
(1, '장호현', 'admin@a.com', '1234'),
(2, '박효진', 'admin1@a.com', '1234'),
(3, '김다윗', 'admin2@a.com', '1234'),
(4, '김민지', 'admin3@a.com', '1234'),
(5, '김민지', 'admin4@a.com', '1234')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  password = EXCLUDED.password;

-- ID 시퀀스 조정 (다음 INSERT 시 11부터 시작)
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

