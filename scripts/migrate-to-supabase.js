#!/usr/bin/env node

/**
 * 数据迁移脚本：从 JSON 文件迁移到 Supabase
 * 使用方法：node scripts/migrate-to-supabase.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const supabase = require('../lib/supabase');

async function migrateOrders() {
  try {
    console.log('🚀 开始迁移订单数据到 Supabase...');

    // 读取现有订单数据
    const ordersFile = path.join(__dirname, '../data/orders.json');
    if (!fs.existsSync(ordersFile)) {
      console.log('⚠️  未找到订单数据文件，跳过订单迁移');
      return;
    }

    const ordersData = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
    console.log(`📊 发现 ${ordersData.length} 条订单记录`);

    if (ordersData.length === 0) {
      console.log('✅ 没有订单需要迁移');
      return;
    }

    // 转换数据格式以匹配 Supabase 表结构
    const migratedOrders = ordersData.map(order => ({
      order_id: order.orderId,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_wechat: order.customerWechat || null,
      country: order.country,
      city: order.city,
      district: order.district || null,
      detail_address: order.detailAddress,
      food_type: order.foodType,
      notes: order.notes || null,
      custom_country: order.customCountry || null,
      custom_city: order.customCity || null,
      status: order.status || 'pending',
      created_at: order.createdAt
    }));

    // 批量插入到 Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert(migratedOrders)
      .select();

    if (error) {
      console.error('❌ 迁移订单失败:', error);
      return;
    }

    console.log(`✅ 成功迁移 ${data.length} 条订单记录`);

    // 备份原始数据
    const backupFile = path.join(__dirname, '../data/orders.json.backup');
    fs.copyFileSync(ordersFile, backupFile);
    console.log(`💾 原始数据已备份到: ${backupFile}`);

  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error);
    process.exit(1);
  }
}

async function migrateSupportedCities() {
  try {
    console.log('🌍 开始迁移支持城市数据到 Supabase...');

    // 读取支持城市数据
    const citiesFile = path.join(__dirname, '../data/supported-cities.json');
    if (!fs.existsSync(citiesFile)) {
      console.log('⚠️  未找到支持城市数据文件');
      return;
    }

    const citiesData = JSON.parse(fs.readFileSync(citiesFile, 'utf8'));
    console.log(`📊 发现 ${citiesData.length} 个国家的城市数据`);

    // 检查是否已经有数据
    const { data: existingCountries } = await supabase
      .from('supported_countries')
      .select('code');

    if (existingCountries && existingCountries.length > 0) {
      console.log('✅ 支持城市数据已存在，跳过迁移');
      return;
    }

    // 插入国家数据
    const countries = citiesData.map(country => ({
      name: country.name,
      code: country.code,
      currency: country.currency,
      platforms: country.platforms
    }));

    const { data: insertedCountries, error: countriesError } = await supabase
      .from('supported_countries')
      .insert(countries)
      .select();

    if (countriesError) {
      console.error('❌ 插入国家数据失败:', countriesError);
      return;
    }

    console.log(`✅ 成功插入 ${insertedCountries.length} 个国家`);

    // 插入城市数据
    const allCities = [];
    for (const country of citiesData) {
      const countryRecord = insertedCountries.find(c => c.code === country.code);
      if (countryRecord && country.cities) {
        for (const city of country.cities) {
          allCities.push({
            country_id: countryRecord.id,
            name: city.name,
            aliases: city.aliases || [],
            districts: city.districts || []
          });
        }
      }
    }

    if (allCities.length > 0) {
      const { data: insertedCities, error: citiesError } = await supabase
        .from('supported_cities')
        .insert(allCities)
        .select();

      if (citiesError) {
        console.error('❌ 插入城市数据失败:', citiesError);
        return;
      }

      console.log(`✅ 成功插入 ${insertedCities.length} 个城市`);
    }

  } catch (error) {
    console.error('❌ 迁移支持城市数据时发生错误:', error);
  }
}

async function main() {
  console.log('🔄 开始数据迁移...\n');

  // 检查 Supabase 连接
  try {
    const { data, error } = await supabase.from('orders').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Supabase 连接成功\n');
  } catch (error) {
    console.error('❌ Supabase 连接失败:', error.message);
    console.log('请检查 SUPABASE_URL 和 SUPABASE_ANON_KEY 环境变量');
    process.exit(1);
  }

  // 执行迁移
  await migrateSupportedCities();
  console.log('');
  await migrateOrders();

  console.log('\n🎉 数据迁移完成！');
  console.log('💡 提示：您现在可以切换到 Supabase 版本的服务器');
  console.log('   运行: npm run dev');
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateOrders, migrateSupportedCities };