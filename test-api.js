const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAPI() {
    try {
        console.log('🧪 开始测试异国小助手API...\n');

        // 测试1: 获取支持的国家列表
        console.log('📍 测试1: 获取支持的国家列表');
        const countriesResponse = await axios.get(`${API_BASE}/supported-countries`);
        console.log('✅ 成功获取国家列表，数量:', countriesResponse.data.length);
        console.log('支持的国家:', countriesResponse.data.map(c => c.name).join(', '));
        console.log('');

        // 测试2: 验证支持的地址（越南胡志明）
        console.log('📍 测试2: 验证支持的地址（越南胡志明市）');
        const validAddressResponse = await axios.post(`${API_BASE}/validate-address`, {
            country: '越南',
            city: '胡志明市 Hồ Chí Minh',
            district: '第一郡'
        });
        console.log('✅ 地址验证结果:', validAddressResponse.data);
        console.log('');

        // 测试2b: 验证支持的地址（泰国曼谷）
        console.log('📍 测试2b: 验证支持的地址（泰国曼谷）');
        const validAddressResponse2 = await axios.post(`${API_BASE}/validate-address`, {
            country: '泰国',
            city: '曼谷 Bangkok',
            district: '素坤逸'
        });
        console.log('✅ 地址验证结果:', validAddressResponse2.data);
        console.log('');

        // 测试3: 验证不支持的地址
        console.log('📍 测试3: 验证不支持的地址（美国纽约）');
        try {
            const invalidAddressResponse = await axios.post(`${API_BASE}/validate-address`, {
                country: '美国',
                city: '纽约',
                district: '曼哈顿'
            });
            console.log('❌ 应该返回错误但却成功了');
        } catch (error) {
            console.log('✅ 正确拒绝了不支持的地址');
            console.log('错误信息:', error.response?.data || error.message);
        }
        console.log('');

        // 测试4: 提交测试订单
        console.log('📍 测试4: 提交测试订单');
        const testOrder = {
            customerName: '测试用户',
            customerPhone: '13800138000',
            customerWechat: 'test123',
            country: '泰国',
            city: '曼谷',
            district: '素坤逸',
            detailAddress: '素坤逸路18号测试地址',
            postalCode: '10110',
            restaurant: '麦当劳',
            budget: '100-200',
            deliveryTime: '今天晚上7点',
            notes: '测试订单，请忽略'
        };

        const orderResponse = await axios.post(`${API_BASE}/submit-order`, testOrder);
        console.log('✅ 订单提交成功');
        console.log('订单号:', orderResponse.data.orderId);
        console.log('消息:', orderResponse.data.message);
        console.log('');

        // 测试5: 查询订单状态
        console.log('📍 测试5: 查询订单状态');
        const orderStatusResponse = await axios.get(`${API_BASE}/order/${orderResponse.data.orderId}`);
        console.log('✅ 订单查询成功');
        console.log('订单状态:', orderStatusResponse.data.order.status);
        console.log('');

        console.log('🎉 所有测试通过！异国小助手API工作正常！');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        if (error.response) {
            console.error('响应数据:', error.response.data);
        }
    }
}

// 运行测试
testAPI();