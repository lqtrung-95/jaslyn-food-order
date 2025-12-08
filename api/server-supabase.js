require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const moment = require('moment');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, '../client/build'), {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    if (path.extname(filePath) === '.html') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Telegram配置
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_USER_IDS = process.env.TELEGRAM_USER_ID 
    ? process.env.TELEGRAM_USER_ID.split(',').map(id => id.trim())
    : [];

// 生成订单号
function generateOrderId() {
  return 'YX' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// 支持的城市数据 (使用JSON文件)
const supportedCities = require('../data/supported-cities.json');
const supportedShoppingCities = require('../data/supported-cities-shopping.json');

// 验证地址是否在支持范围内
function validateAddress(country, city, district) {
  
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

    // 发送给所有配置的用户
    for (const userId of TELEGRAM_USER_IDS) {
      try {
        const messageUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const sendPhotoUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        const mediaGroupUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMediaGroup`;

        // If there are product images, send them as a single album with the full caption on the first photo
        if (order.product_images && order.product_images.length > 0) {
          const FormData = require('form-data');
          const images = order.product_images;

          if (images.length === 1) {
            const base64Data = images[0].replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');

            const form = new FormData();
            form.append('chat_id', userId);
            form.append('photo', imageBuffer, {
              filename: 'product_1.jpg',
              contentType: 'image/jpeg'
            });
            form.append('caption', message);
            form.append('parse_mode', 'HTML');

            await axios.post(sendPhotoUrl, form, {
              headers: form.getHeaders()
            });
          } else {
            const form = new FormData();
            form.append('chat_id', userId);

            const media = images.map((base64Image, index) => {
              const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
              const imageBuffer = Buffer.from(base64Data, 'base64');
              const attachmentName = `photo${index}`;

              form.append(attachmentName, imageBuffer, {
                filename: `product_${index + 1}.jpg`,
                contentType: 'image/jpeg'
              });

              // Only first item carries the full caption so Telegram shows it under the album
              if (index === 0) {
                return {
                  type: 'photo',
                  media: `attach://${attachmentName}`,
                  caption: message,
                  parse_mode: 'HTML'
                };
              }

              return {
                type: 'photo',
                media: `attach://${attachmentName}`
              };
            });

            form.append('media', JSON.stringify(media));

            await axios.post(mediaGroupUrl, form, {
              headers: form.getHeaders()
            });
          }
        } else {
          // No images, send text message only
          await axios.post(messageUrl, {
            chat_id: userId,
            text: message,
            parse_mode: 'HTML'
          });
        }
        
        console.log(`✅ 通知发送成功给用户 ${userId}`);
      } catch (error) {
        console.error(`❌ 发送给用户 ${userId} 失败:`, error.message);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Telegram通知发送失败:', error.message);
    return true; // 即使Telegram失败，订单仍保存成功
  }
}

// API路由

// 验证地址
app.post('/api/validate-address', (req, res) => {
  const { country, city, district } = req.body;

  if (!country || !city) {
    return res.status(400).json({
      valid: false,
      message: '请填写国家和城市'
    });
  }

  try {
    const validation = validateAddress(country, city, district || '');
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
app.get('/api/supported-countries', (req, res) => {
  try {
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

// 获取购物支持的国家列表
app.get('/api/supported-countries/shopping', (req, res) => {
  try {
    const countries = supportedShoppingCities.map(country => ({
      name: country.name,
      code: country.code,
      cities: country.cities.map(city => city.name)
    }));
    res.json(countries);
  } catch (error) {
    console.error('获取购物支持国家列表错误:', error);
    res.status(500).json({
      error: '获取购物支持国家列表失败'
    });
  }
});

// 提交订单
app.post('/api/submit-order', async (req, res) => {
  try {
    const orderData = req.body;
    console.log('接收到订单数据:', orderData);

    // 验证地址（允许自定义城市/国家跳过校验）
    const isCustomAddress = Boolean(
      orderData.country === 'custom' ||
      (orderData.customCountry && orderData.customCountry.trim()) ||
      (orderData.customCity && orderData.customCity.trim())
    );

    const validation = isCustomAddress
      ? {
          valid: true,
          message: '✅ 已记录您的地址，我们会尽快人工确认是否支持该地区配送'
        }
      : validateAddress(
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
      detail_address: orderData.detailAddress || orderData.detailedAddress, // Support both naming conventions
      food_type: orderData.foodType,
      notes: orderData.notes || null,
      custom_country: orderData.customCountry || null,
      custom_city: orderData.customCity || null,
      product_images: orderData.productImages || null,
      status: 'pending'
    };

    // 添加创建时间
    orderRecord.created_at = new Date().toISOString();

    // 发送Telegram通知
    await sendTelegramNotification(orderRecord);

    res.json({
      success: true,
      message: '订单提交成功！我们会尽快联系您',
      orderId: orderRecord.order_id
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

    console.log(`订单查询请求（无持久化）: ${orderId}`);
    return res.status(404).json({
      success: false,
      message: '当前部署未存储订单'
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
    console.log('管理员订单列表请求（无持久化）');
    res.json([]);
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
    database: 'none'
  });
});

// 静态文件服务
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  const acceptsHtml = Boolean(req.accepts('html'));
  const isStaticAsset = path.extname(req.path) !== '';

  if (!acceptsHtml || isStaticAsset) {
    return next(); // let express send proper 404s for missing assets
  }

  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🍜 异国小助手服务器运行在端口 ${PORT}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}`);
  console.log('📊 数据库: 无持久化，仅发送通知');
});

module.exports = app;
