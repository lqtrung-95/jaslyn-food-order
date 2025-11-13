# 异国小助手

专业的海外代点外卖服务平台，帮助您为在海外生活的朋友送上温暖。

## 🌍 支持地区

目前支持以下国家的主要城市（基于 Grab、Uber Eats 等主流平台覆盖范围）：

### 🇹🇭 泰国
- 曼谷（素坤逸、是隆、沙吞等主要区域）
- 清迈（古城、尼曼等）
- 普吉（芭东海滩、卡伦海滩等）
- 芭提雅（中天海滩、芭提雅海滩等）

### 🇸🇬 新加坡
- 全岛覆盖（中峇鲁、武吉知马、东海岸等）

### 🇲🇾 马来西亚
- 吉隆坡（武吉免登、安邦、孟沙等）
- 槟城（乔治市、峇都茅等）
- 新山（新山中央、地不佬等）

### 🇮🇩 印度尼西亚
- 雅加达（南雅加达、中雅加达等）
- 巴厘岛（库塔、水明漾、乌布等）
- 泗水（Gubeng、Sukolilo等）

### 🇻🇳 越南
- 胡志明市（第一郡、第三郡、平盛等）
- 河内（还剑湖、巴亭、西湖等）

### 🇩🇪 德国
- 柏林（米特区、克罗伊茨贝格等）
- 慕尼黑（老城、施瓦宾等）
- 法兰克福（老城、萨克森豪森等）

### 🇦🇺 澳大利亚
- 悉尼（CBD、岩石区、邦迪海滩等）
- 墨尔本（CBD、菲茨罗伊、圣基尔达等）
- 布里斯班（CBD、南岸、新农场等）

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖
```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd client
npm install
```

### 配置环境变量
创建 `.env` 文件：
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 启动开发服务器
```bash
# 启动后端服务器（端口 3000）
npm run dev

# 启动前端开发服务器（端口 3001）
cd client
npm run dev
```

### 生产部署
```bash
# 构建前端
npm run build

# 启动生产服务器
npm start
```

## 📱 功能特点

### 🤖 智能地址验证
- 自动验证地址是否在服务范围内
- 不支持区域自动驳回，节省沟通成本
- 支持多语言地址格式

### 📧 实时通知系统
- 新订单邮件通知
- 详细的订单信息展示
- 支持多种通知方式（可扩展微信企业号）

### 🎨 用户友好界面
- 响应式设计，支持移动端
- Material Design 风格
- 直观的表单填写流程

### 📊 订单管理
- 自动生成订单号
- 订单状态跟踪
- 历史订单查询

## 🔧 技术栈

### 后端
- **Node.js + Express** - 服务器框架
- **JSON文件存储** - 轻量级数据存储
- **Nodemailer** - 邮件通知
- **Axios** - HTTP客户端

### 前端
- **React + TypeScript** - 现代化前端框架
- **Bootstrap + React-Bootstrap** - UI组件库
- **Vite** - 快速构建工具
- **Axios** - API请求

## 📁 项目结构

```
foodorder/
├── server.js                 # 后端服务器入口
├── package.json              # 后端依赖配置
├── data/                     # 数据文件
│   ├── supported-cities.json # 支持的城市数据
│   └── orders.json          # 订单数据
├── client/                   # 前端项目
│   ├── src/
│   │   ├── App.tsx          # 主应用组件
│   │   ├── App.css          # 样式文件
│   │   └── main.tsx         # 入口文件
│   ├── package.json         # 前端依赖配置
│   └── vite.config.ts       # Vite配置
└── README.md                # 项目说明
```

## 🔐 安全考虑

- 输入验证和清理
- XSS防护
- CSRF保护
- 敏感信息环境变量配置

## 📈 扩展功能

### 计划中的功能
- [ ] 微信企业号通知集成
- [ ] 支付接口集成
- [ ] 订单状态实时更新
- [ ] 客户评价系统
- [ ] 数据统计和分析
- [ ] 多语言支持

### API接口

#### 地址验证
```
POST /api/validate-address
{
  "country": "泰国",
  "city": "曼谷",
  "district": "素坤逸"
}
```

#### 提交订单
```
POST /api/submit-order
{
  "customerName": "张三",
  "customerPhone": "13800138000",
  "country": "泰国",
  "city": "曼谷",
  "detailAddress": "素坤逸路18号",
  // ... 其他字段
}
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 联系我们

- 微信：your-wechat-id
- 电话：your-phone-number
- 邮箱：your-email@example.com

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！