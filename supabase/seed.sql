-- Seed supported countries and cities data
-- This will populate the database with the current supported cities data

-- Insert supported countries
INSERT INTO supported_countries (name, code, currency, platforms) VALUES
  ('🇹🇭 泰国', 'TH', 'THB', '["Grab", "FoodPanda", "LineMan"]'),
  ('🇸🇬 新加坡', 'SG', 'SGD', '["Grab", "FoodPanda", "Deliveroo"]'),
  ('🇲🇾 马来西亚', 'MY', 'MYR', '["Grab", "FoodPanda"]'),
  ('🇮🇩 印度尼西亚', 'ID', 'IDR', '["Grab", "GoFood"]'),
  ('🇻🇳 越南', 'VN', 'VND', '["Grab", "ShopeeFood", "Baemin"]'),
  ('🇩🇪 德国', 'DE', 'EUR', '["Uber Eats", "Deliveroo", "Lieferando"]'),
  ('🇦🇺 澳大利亚', 'AU', 'AUD', '["Uber Eats", "Deliveroo", "Menulog"]'),
  ('🇰🇭 柬埔寨', 'KH', 'KHR', '["Grab", "FoodPanda"]'),
  ('🇵🇭 菲律宾', 'PH', 'PHP', '["Grab", "FoodPanda"]')
ON CONFLICT (code) DO NOTHING;

-- Insert cities for Thailand (TH)
INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '曼谷 Bangkok', '["Bangkok", "กรุงเทพมหานคร"]', '["素坤逸", "是隆", "沙吞", "暹罗", "乍都乍", "挽坤天", "巴吞旺", "隆披尼", "空堤", "三攀他旺", "帕那空", "律实"]'
FROM supported_countries WHERE code = 'TH';

INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '清迈 Chiang Mai', '["Chiang Mai", "เชียงใหม่"]', '["古城", "尼曼", "山甘烹", "湄林"]'
FROM supported_countries WHERE code = 'TH';

INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '普吉 Phuket', '["Phuket", "ภูเก็ต"]', '["芭东海滩", "卡伦海滩", "卡塔海滩", "普吉镇"]'
FROM supported_countries WHERE code = 'TH';

INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '芭提雅 Pattaya', '["Pattaya", "พัทยา"]', '["中天海滩", "芭提雅海滩", "纳库鲁阿", "春武里"]'
FROM supported_countries WHERE code = 'TH';

-- Insert cities for Singapore (SG)
INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '新加坡 Singapore', '["Singapore"]', '["中峇鲁", "武吉知马", "东海岸", "宏茂桥", "碧山", "芽笼", "加东", "小印度", "乌节路", "牛车水", "圣淘沙", "滨海湾"]'
FROM supported_countries WHERE code = 'SG';

-- Insert cities for Malaysia (MY)
INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '吉隆坡 Kuala Lumpur', '["Kuala Lumpur", "KL"]', '["武吉免登", "安邦", "孟沙", "白沙罗", "双威", "谷中城", "中央艺术坊", "独立广场", "双子塔", "阿罗街"]'
FROM supported_countries WHERE code = 'MY';

INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '槟城 Penang', '["Penang", "Pinang"]', '["乔治市", "峇都茅", "丹绒武雅", "牛汝莪"]'
FROM supported_countries WHERE code = 'MY';

-- Insert cities for Indonesia (ID)
INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '雅加达 Jakarta', '["Jakarta", "DKI Jakarta"]', '["南雅加达", "中雅加达", "西雅加达", "东雅加达", "北雅加达", "千岛群岛", "Kemang", "Senayan", "Menteng", "SCBD", "PIK"]'
FROM supported_countries WHERE code = 'ID';

INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '巴厘岛 Bali', '["Bali", "Denpasar"]', '["库塔", "水明漾", "努沙杜瓦", "乌布", "萨努尔", "金巴兰", "登巴萨", "苍古", "萨努尔", "新加拉惹"]'
FROM supported_countries WHERE code = 'ID';

-- Insert cities for Vietnam (VN)
INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '胡志明市 Hồ Chí Minh', '["Ho Chi Minh City", "Saigon", "TP.HCM", "Hồ Chí Minh"]', '["第一郡", "第三郡", "宾义", "平盛", "平新", "旧邑", "第七郡", "富美兴", "守添", "范五老", "新山一"]'
FROM supported_countries WHERE code = 'VN';

INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '河内 Hanoi', '["Hanoi", "Ha Noi"]', '["还剑湖", "二征夫人", "巴亭", "西湖", "栋多", "纸桥", "青春", "黄梅", "龙边", "嘉林", "东英", "朔山"]'
FROM supported_countries WHERE code = 'VN';

-- Insert cities for Germany (DE)
INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '柏林 Berlin', '["Berlin"]', '["米特区", "克罗伊茨贝格", "新克尔恩", "普伦茨劳贝格", "夏洛滕堡", "弗里德里希斯海因", "滕珀尔霍夫"]'
FROM supported_countries WHERE code = 'DE';

INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '慕尼黑 Munich', '["Munich", "München"]', '["老城", "施瓦宾", "森德灵", "马克斯近郊", "路德维希近郊"]'
FROM supported_countries WHERE code = 'DE';

-- Insert cities for Australia (AU)
INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '悉尼 Sydney', '["Sydney"]', '["CBD", "岩石区", "达令港", "萨里山", "纽镇", "帕丁顿", "邦迪", "曼利", "查茨伍德", "莱卡特"]'
FROM supported_countries WHERE code = 'AU';

INSERT INTO supported_cities (country_id, name, aliases, districts)
SELECT id, '墨尔本 Melbourne', '["Melbourne"]', '["CBD", "南岸", "菲茨罗伊", "卡尔顿", "圣基尔达", "南墨尔本", "里士满", "霍桑", "普拉兰"]'
FROM supported_countries WHERE code = 'AU';

-- Add more cities as needed...
-- Note: You can add the rest of the cities following the same pattern