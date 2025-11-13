require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const moment = require('moment');
const supabase = require('./lib/supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client/build')));

// Telegram配置
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_USER_IDS = process.env.TELEGRAM_USER_ID 
    ? process.env.TELEGRAM_USER_ID.split(',').map(id => id.trim())
    : [];

// 生成订单号
function generateOrderId() {
  return 'YX' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// 获取支持的城市数据 (从Supabase)
async function getSupportedCities() {
  try {
    const { data: countries, error: countriesError } = await supabase
      .from('supported_countries')
      .select('*');

    if (countriesError) throw countriesError;

    const { data: cities, error: citiesError } = await supabase
      .from('supported_cities')
      .select('*');

    if (citiesError) throw citiesError;

    // 组合数据结构
    const supportedCities = countries.map(country => ({
      name: country.name,
      code: country.code,
      currency: country.currency,
      platforms: country.platforms,
      cities: cities
        .filter(city => city.country_id === country.id)
        .map(city => ({
          name: city.name,
          aliases: city.aliases || [],
          districts: city.districts || []
        }))
    }));

    return supportedCities;
  } catch (error) {
    console.error('Error fetching supported cities:', error);
    // 如果Supabase失败，回退到本地JSON文件
    return require('./data/supported-cities.json');
  }
}

// 验证地址是否在支持范围内
async function validateAddress(country, city, district) {
  const supportedCities = await getSupportedCities();
  
  // 处理国家匹配 - 支持 "🇹🇭 泰国" 这样的格式
  let countryName = country.trim();
  // 移除国旗emoji
  countryName = countryName.replace(/^[\u1F1E6-\u1F1FF]{2}\s+/, '');

  const supportedCountry = supportedCities.find(c =>
    c.name.toLowerCase().replace(/^[\u1F1E6-\u1F1FF]{2}\s+/, '').includes(countryName.toLowerCase()) ||
    c.code.toLowerCase() === countryName.toLowerCase() ||
    c.name.toLowerCase() === countryName.toLowerCase()
  );

  if (!supportedCountry) {
    return { valid: false, message: '暂不支持该国家' };
  }

  // 对于越南和印尼，整个国家都支持，不需要验证城市
  if (supportedCountry.code === 'VN' || supportedCountry.code === 'ID') {
    return { valid: true, message: '✅ 地址验证通过，我们支持该地区' };
  }

  // 处理城市匹配 - 支持多种格式
  let cityName = city.trim();
  // 如果城市格式是 "曼谷 Bangkok"，取中文部分或英文部分
  const cityParts = cityName.split(/\s+/);

  const supportedCity = supportedCountry.cities.find(c => {
    const cityNameLower = c.name.toLowerCase();
    const cityNameChinese = cityNameLower.split(/\s+/)[0]; // 取中文部分
    const cityNameEnglish = cityNameLower.split(/\s+/)[1]; // 取英文部分

    return cityNameLower === cityName.toLowerCase() ||
           cityParts.some(part =>
               cityNameChinese === part.toLowerCase() ||
               cityNameEnglish === part.toLowerCase()
           ) ||
           (c.aliases && c.aliases.some(alias =>
               alias.toLowerCase() === cityName.toLowerCase() ||
               cityParts.some(part => alias.toLowerCase() === part.toLowerCase())
           ));
  });

  if (!supportedCity) {
    return { valid: false, message: `暂不支持${supportedCountry.name.replace(/^[\u1F1E6-\u1F1FF]{2}\s+/, '')}的${city}地区` };
  }

  // 对于其他国家，如果有区域限制，检查区域（只有当district不为空时才检查）
  if (supportedCity.districts && supportedCity.districts.length > 0 && district) {
    const districtSupported = supportedCity.districts.some(d =>
      d.toLowerCase() === district.toLowerCase()
    );

    if (!districtSupported) {
      return { valid: false, message: `暂不支持${city}的${district}区域` };
    }
  }

  return { valid: true, message: '✅ 地址验证通过，我们支持该地区' };
}

// 发送Telegram通知
async function sendTelegramNotification(order) {
  try {
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_USER_IDS.length === 0) {
      console.log('Telegram配置未设置，跳过通知');
      return true;
    }

    const message = `🍜 <b>新订单通知</b>

<b>📋 订单信息</b>
订单号: <code>${order.order_id}</code>
时间: ${moment(order.created_at).format('YYYY-MM-DD HH:mm:ss')}
收货人: ${order.customer_name}
电话: ${order.customer_phone}
微信: ${order.customer_wechat || '未提供'}

<b>📍 配送地址</b>
国家: ${order.country}
城市: ${order.city}
区域: ${order.district || '未指定'}
详细地址: ${order.detail_address}

<b>🍽️ 订单需求</b>
食物类型: ${order.food_type}
特殊需求: ${order.notes || '无'}`;

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    // 发送给所有配置的用户
    const sendPromises = TELEGRAM_USER_IDS.map(userId => 
      axios.post(url, {
        chat_id: userId,
        text: message,
        parse_mode: 'HTML'
      }).catch(error => {
        console.error(`发送给用户 ${userId} 失败:`, error.message);
        return null;
      })
    );

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r !== null).length;
    
    console.log(`Telegram通知发送成功: ${successCount}/${TELEGRAM_USER_IDS.length} 个用户`);
    return true;
  } catch (error) {
    console.error('Telegram通知发送失败:', error.message);
    return true; // 即使Telegram失败，订单仍保存成功
  }
}

// API路由

// 验证地址
app.post('/api/validate-address', async (req, res) => {
  const { country, city, district } = req.body;

  if (!country || !city) {
    return res.status(400).json({
      valid: false,
      message: '请填写国家和城市'
    });
  }

  try {
    const validation = await validateAddress(country, city, district || '');
    res.json(validation);
  } catch (error) {
    console.error('地址验证错误:', error);
    res.status(500).json({
      valid: false,
      message: '地址验证服务暂时不可用'
    });
  }
});

// 获取支持的国家列表
app.get('/api/supported-countries', async (req, res) => {
  try {
    const supportedCities = await getSupportedCities();
    const countries = supportedCities.map(country => ({
      name: country.name,
      code: country.code,
      cities: country.cities.map(city => city.name)
    }));
    res.json(countries);
  } catch (error) {
    console.error('获取支持国家列表错误:', error);
    res.status(500).json({
      error: '获取支持国家列表失败'
    });
  }
});

// 提交订单
app.post('/api/submit-order', async (req, res) => {
  try {
    const orderData = req.body;
    console.log('接收到订单数据:', orderData);

    // 验证地址
    const validation = await validateAddress(
      orderData.country,
      orderData.city,
      orderData.district
    );

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }

    // 生成订单号
    const orderId = generateOrderId();

    // 创建订单对象
    const orderRecord = {
      order_id: orderId,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      customer_wechat: orderData.customerWechat || null,
      country: orderData.country,
      city: orderData.city,
      district: orderData.district || null,
      detail_address: orderData.detailAddress,
      food_type: orderData.foodType,
      notes: orderData.notes || null,
      custom_country: orderData.customCountry || null,
      custom_city: orderData.customCity || null,
      status: 'pending'
    };

    // 保存订单到Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert([orderRecord])
      .select()
      .single();

    if (error) {
      console.error('保存订单到Supabase失败:', error);
      return res.status(500).json({
        success: false,
        message: '订单保存失败，请重试'
      });
    }

    // 发送Telegram通知
    await sendTelegramNotification(data);

    res.json({
      success: true,
      message: '订单提交成功！我们会尽快联系您',
      orderId: data.order_id
    });

  } catch (error) {
    console.error('提交订单错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误，请重试'
    });
  }
});

// 查询订单状态
app.get('/api/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      order: {
        orderId: data.order_id,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        customerWechat: data.customer_wechat,
        country: data.country,
        city: data.city,
        district: data.district,
        detailAddress: data.detail_address,
        foodType: data.food_type,
        notes: data.notes,
        customCountry: data.custom_country,
        customCity: data.custom_city,
        status: data.status,
        createdAt: data.created_at
      }
    });

  } catch (error) {
    console.error('查询订单错误:', error);
    res.status(500).json({
      success: false,
      message: '查询订单失败'
    });
  }
});

// 管理员接口 - 获取订单列表
app.get('/api/admin/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // 转换数据格式以保持与前端的兼容性
    const orders = data.map(order => ({
      orderId: order.order_id,
      customerName: order.customer_name,
      customerPhone: order.customer_phone,
      customerWechat: order.customer_wechat,
      country: order.country,
      city: order.city,
      district: order.district,
      detailAddress: order.detail_address,
      foodType: order.food_type,
      notes: order.notes,
      customCountry: order.custom_country,
      customCity: order.custom_city,
      status: order.status,
      createdAt: order.created_at
    }));

    res.json(orders);
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      error: '获取订单列表失败'
    });
  }
});

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'supabase'
  });
});

// 静态文件服务
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🍜 异国小助手服务器运行在端口 ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log(`📊 数据库: Supabase`);
});

module.exports = app;