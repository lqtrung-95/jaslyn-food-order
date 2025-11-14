export type Language = 'zh' | 'en';

const zhTranslations = {
    // Header
    headerTitle: "J's Global Link",
    headerSubtitle: "Global Bites & Buys, Handled by J.",
    navDelivery: "外卖代点",
    navShopping: "网购代下",
    navGuide: "使用说明",
    navAbout: "关于我们",

    // Address Section
    addressSectionTitle: "📍 收货地址",
    supportedAreasTitle: "🌍 支持地区",
    supportedAreasDelivery: "目前支持：泰国、新加坡、马来西亚、印尼、越南、德国、澳大利亚、柬埔寨、菲律宾",
    supportedAreasDeliveryNote: "基于 Grab、Uber Eats 等主流平台覆盖范围",
    supportedAreasShopping: "目前仅支持东南亚地区：泰国、新加坡、马来西亚、印尼、越南、柬埔寨、菲律宾",

    // Form Fields
    countryLabel: "国家 *",
    selectCountry: "请选择国家",
    customCountry: "其他（需要人工确认）",
    customCountryInput: "请输入国家名称",
    cityLabel: "城市 *",
    selectCity: "请选择城市",
    customCityInput: "请输入城市名称",
    detailAddressLabel: "详细地址 *",
    detailAddressPlaceholder: "请输入详细地址，包括街道、门牌号等",
    cityNote: "注：如果都不在以上城市，先随便选一个，再填写详细地址",

    // Address Preview
    addressPreview: "收货地址",

    // Order Form
    deliveryTitle: "📝 外卖代点订单",
    shoppingTitle: "📦 网购代下订单",
    orderRequirementsTitle: "🍽️ 订单需求",
    shoppingRequirementsTitle: "🛍️ 代购需求",
    foodTypeLabel: "食物类型 *",
    selectFoodType: "请选择食物类型",
    requirementsLabel: "您有什么需求吗？",
    deliveryRequirementsPlaceholder: "选填，例如：\n• 想点的餐厅或店铺名称\n• 需要加快配送\n• 特殊要求或过敏信息",
    shoppingRequirementsPlaceholder: "选填，例如：\n• 想买的商品名称与链接\n• 特殊要求或尺码信息",

    // Food Types
    milkTea: "🥤 奶茶",
    pizza: "🍕 披萨",
    burger: "🍔 汉堡",
    supermarket: "🛒 商超",
    chineseFood: "🥢 中餐",
    westernFood: "🍽️ 西餐",
    japaneseFood: "🍱 日料",
    koreanFood: "🍖 韩料",
    thaiFood: "🍛 泰餐",
    vietnameseFood: "🥣 越南菜",
    indonesianFood: "🍲 印尼菜",
    malaysianFood: "🍛 马来菜",
    fastFood: "🍟 快餐",
    bbq: "🍢 烧烤",
    dessert: "🍰 甜品",
    other: "🍱 其他",

    // Shopping Categories
    clothing: "👕 服装",
    cosmetics: "💄 美妆",
    electronics: "📱 电子产品",
    food: "🍫 食品",
    dailySupplies: "🧴 日用品",
    outdoor: "🎒 户外用品",

    // Contact Section
    contactTitle: "📞 联系方式",
    recipientName: "收货人姓名 *",
    recipientNamePlaceholder: "请输入收货人姓名",
    recipientPhone: "收货人电话 *",
    recipientPhonePlaceholder: "请输入收货人电话",
    wechatLabel: "微信号",
    deliveryWechatLabel: "订餐人微信号",
    shoppingWechatLabel: "订购人微信号",
    wechatPlaceholder: "选填，方便联系",

    // Buttons
    validateAddress: "📍 验证地址是否在服务范围内",
    submitOrder: "📤 提交订单",
    submitting: "提交中...",

    // Alerts
    pleaseSelectCountry: "请填写国家和城市",
    validateAddressPlease: "⚠️ 请先填写详细地址，然后验证地址是否在服务范围内",
    selectCountryFirst: "⚠️ 请先填写国家和城市",
    validateBeforeSubmit: "🚫 请先验证收货地址是否在服务范围内，验证成功后才能提交订单",
    validationFailed: "地址验证失败，请重试",
    submissionFailed: "提交失败，请重试",

    // Guide
    guideTitle: "📖 使用说明",
    guideSection1Title: "1、关于下单",
    guideSection1: "本网站仅用于收集您的代点需求，目前暂不支持直接在线下单。请在提交表单时务必留下微信/手机号等联系方式，方便我们及时与您沟通。",
    guideSection2Title: "2、地址可达性验证",
    guideSection2: "填写送餐或收货地址后，请您进行地址可达性验证。因各国配送覆盖范围不同，并非所有地区都能下单。如提示\"不支持\"，通常表示该地点无法配送，敬请谅解。",
    guideSection3Title: "3、订单处理流程",
    guideSection3: "表单提交后，我们会在短时间内主动联系您，确认订单详情。请保持通信畅通，我们会尽快为您处理。",

    // About
    aboutTitle: "ℹ️ 关于我们",
    aboutSection1: "我们是一支面向中国用户提供海外外卖代点与网购代下服务的小型团队。",
    aboutSection2: "常为客户处理跨国下单相关需求，对各国的下单流程、配送规则与常见问题均有充分的了解。",
    aboutSection3: "我们坚持以规范、准确、及时为服务标准，在确认地址、核实配送范围、与商家沟通等环节中保持严谨态度，确保订单信息准确无误、服务流程顺畅可控。",
    aboutSection4: "我们的目标是为用户提供可靠、省心、透明的代点体验，让您在海外下单变得更简单、更安心。",

    // Footer
    footerText: "© 2025 异国小助手. All rights reserved.",

    // Validation Results
    customCountryConfirm: "✅ 已记录您的地址，我们会尽快人工确认是否支持该地区配送",
    addressNotSupported: "❌ 此地址暂不支持。",
    addressSupported: "✅ 此地址支持！",
    pleaseValidateBeforeSubmit: "请先验证地址是否在服务范围内",
    submitSuccess: "订单提交成功！",
    orderNumber: "订单号：",
} as const;

type TranslationKey = keyof typeof zhTranslations;
type TranslationMap = Record<TranslationKey, string>;

const enTranslations: TranslationMap = {
    // Header
    headerTitle: "J's Global Link",
    headerSubtitle: "Global Bites & Buys, Handled by J.",
    navDelivery: "Food Delivery",
    navShopping: "Online Shopping",
    navGuide: "Instructions",
    navAbout: "About Us",

    // Address Section
    addressSectionTitle: "📍 Delivery Address",
    supportedAreasTitle: "🌍 Supported Areas",
    supportedAreasDelivery: "Currently supported: Thailand, Singapore, Malaysia, Indonesia, Vietnam, Germany, Australia, Cambodia, Philippines",
    supportedAreasDeliveryNote: "Based on coverage of major platforms like Grab, Uber Eats, etc.",
    supportedAreasShopping: "Currently only supported in Southeast Asia: Thailand, Singapore, Malaysia, Indonesia, Vietnam, Cambodia, Philippines",

    // Form Fields
    countryLabel: "Country *",
    selectCountry: "Please select country",
    customCountry: "Other (manual confirmation required)",
    customCountryInput: "Please enter country name",
    cityLabel: "City *",
    selectCity: "Please select city",
    customCityInput: "Please enter city name",
    detailAddressLabel: "Detailed Address *",
    detailAddressPlaceholder: "Please enter detailed address, including street, door number, etc.",
    cityNote: "Note: If the city is not listed above, select any city first, then fill in the detailed address",

    // Address Preview
    addressPreview: "Delivery Address",

    // Order Form
    deliveryTitle: "📝 Food Delivery",
    shoppingTitle: "📦 Online Shopping",
    orderRequirementsTitle: "🍽️ Order Requirements",
    shoppingRequirementsTitle: "🛍️ Shopping Requirements",
    foodTypeLabel: "Food Type *",
    selectFoodType: "Please select food type",
    requirementsLabel: "Do you have any requirements?",
    deliveryRequirementsPlaceholder: "Optional, for example:\n• Restaurant or store name you want to order from\n• Need faster delivery\n• Special requirements or allergy information",
    shoppingRequirementsPlaceholder: "Optional, for example:\n• Product names and links you want to buy\n• Special requests or size information",

    // Food Types
    milkTea: "🥤 Milk Tea",
    pizza: "🍕 Pizza",
    burger: "🍔 Burger",
    supermarket: "🛒 Supermarket",
    chineseFood: "🥢 Chinese Food",
    westernFood: "🍽️ Western Food",
    japaneseFood: "🍱 Japanese Food",
    koreanFood: "🍖 Korean Food",
    thaiFood: "🍛 Thai Food",
    vietnameseFood: "🥣 Vietnamese Food",
    indonesianFood: "🍲 Indonesian Food",
    malaysianFood: "🍛 Malaysian Food",
    fastFood: "🍟 Fast Food",
    bbq: "🍢 BBQ",
    dessert: "🍰 Dessert",
    other: "🍱 Other",

    // Shopping Categories
    clothing: "👕 Clothing",
    cosmetics: "💄 Cosmetics",
    electronics: "📱 Electronics",
    food: "🍫 Food",
    dailySupplies: "🧴 Daily Supplies",
    outdoor: "🎒 Outdoor Equipment",

    // Contact Section
    contactTitle: "📞 Contact Information",
    recipientName: "Recipient Name *",
    recipientNamePlaceholder: "Please enter recipient name",
    recipientPhone: "Recipient Phone *",
    recipientPhonePlaceholder: "Please enter recipient phone",
    wechatLabel: "WeChat ID",
    deliveryWechatLabel: "Order WeChat ID",
    shoppingWechatLabel: "Order WeChat ID",
    wechatPlaceholder: "Optional, for easy contact",

    // Buttons
    validateAddress: "📍 Validate if address is in service range",
    submitOrder: "📤 Submit Order",
    submitting: "Submitting...",

    // Alerts
    pleaseSelectCountry: "Please fill in country and city",
    validateAddressPlease: "⚠️ Please fill in the detailed address first, then validate if the address is in the service range",
    selectCountryFirst: "⚠️ Please fill in country and city first",
    validateBeforeSubmit: "🚫 Please validate if your delivery address is in the service range first. Only after successful validation can you submit the order",
    validationFailed: "Address validation failed, please try again",
    submissionFailed: "Submission failed, please try again",

    // Guide
    guideTitle: "📖 Usage Instructions",
    guideSection1Title: "1. About Ordering",
    guideSection1: "This website is only for collecting your ordering needs. Currently, direct online ordering is not supported. Please leave your WeChat/phone number and other contact information when submitting the form so we can contact you promptly.",
    guideSection2Title: "2. Address Delivery Validation",
    guideSection2: "After filling in the delivery or pickup address, please validate the address. Due to different delivery coverage in various countries, not all areas can place orders. If it shows \"not supported\", it usually means the location cannot be delivered. We apologize for the inconvenience.",
    guideSection3Title: "3. Order Processing Flow",
    guideSection3: "After submitting the form, we will contact you shortly to confirm order details. Please keep your communication open. We will process your order as soon as possible.",

    // About
    aboutTitle: "ℹ️ About Us",
    aboutSection1: "We are a small team providing overseas food delivery and online shopping services for users.",
    aboutSection2: "We often handle cross-border ordering needs for customers and have sufficient understanding of the ordering processes, delivery rules, and common issues in various countries.",
    aboutSection3: "We adhere to standards of integrity, accuracy, and timeliness in our services. We maintain rigorous attitudes in confirming addresses, verifying delivery coverage, and communicating with merchants to ensure accurate order information and smooth service processes.",
    aboutSection4: "Our goal is to provide users with reliable, worry-free, and transparent ordering experience, making it easier and more reassuring for you to order overseas.",

    // Footer
    footerText: "© 2025 J's Global Link. All rights reserved.",

    // Validation Results
    customCountryConfirm: "✅ We have recorded your address. We will confirm manually as soon as possible whether we support delivery to this area.",
    addressNotSupported: "❌ This address is not currently supported.",
    addressSupported: "✅ This address is supported!",
    pleaseValidateBeforeSubmit: "Please validate if the address is in the service range first",
    submitSuccess: "Order submitted successfully!",
    orderNumber: "Order Number: ",
} as const;

export const translations: Record<Language, TranslationMap> = {
  zh: zhTranslations,
  en: enTranslations,
};

export const getTranslation = (lang: Language, key: TranslationKey): string => {
  const locale = translations[lang] ?? zhTranslations;
  return locale[key] ?? zhTranslations[key];
};
