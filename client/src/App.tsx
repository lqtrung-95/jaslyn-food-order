import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";
import "./App.css";
import logo from "./assets/logo-7.png";
import { translations, type Language, getTranslation } from "./i18n";
import { Analytics } from "@vercel/analytics/react";

type TabType = "delivery" | "shopping" | "guide" | "about";

interface ApiCountry {
  name: string;
  code: string;
  cities: string[];
}

interface Country extends ApiCountry {
  displayName: string;
}

interface OrderForm {
  customerName: string;
  customerPhone: string;
  customerWechat: string;
  country: string;
  city: string;
  district: string;
  detailAddress: string;
  foodType: string;
  notes: string;
  customCountry: string;
  customCity: string;
}

const stripFlagEmoji = (text: string) => {
  return text.replace(/(?:\uD83C[\uDDE6-\uDDFF]){2}\s*/g, "").trim();
};

// Country name mapping from Chinese to English
const countryNameMap: Record<string, string> = {
  "泰国": "Thailand",
  "新加坡": "Singapore",
  "马来西亚": "Malaysia",
  "印度尼西亚": "Indonesia",
  "越南": "Vietnam",
  "德国": "Germany",
  "澳大利亚": "Australia",
  "柬埔寨": "Cambodia",
  "菲律宾": "Philippines",
  "日本": "Japan",
  "墨西哥": "Mexico",
  "台湾": "Taiwan"
};

const getLocalizedText = (text: string, lang: Language) => {
  // Remove flag emoji first
  const cleanText = stripFlagEmoji(text);
  
  if (lang === "en") {
    // Check if this is a country name (no spaces in Chinese text)
    if (countryNameMap[cleanText]) {
      return countryNameMap[cleanText];
    }
    
    // For city names: "Chinese English" format
    // Extract only the English part
    const parts = cleanText.split(/\s+/);
    
    // If there are multiple parts, take the last part(s) that are in Latin script
    const englishParts = parts.filter(part => /^[A-Za-z]/.test(part));
    
    if (englishParts.length > 0) {
      return englishParts.join(" ");
    }
  }
  
  // For Chinese or if no English found, return the full text
  return cleanText;
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language") as Language | null;
    return saved || "zh";
  });
  const t = (key: keyof typeof translations["zh"]) =>
    getTranslation(language, key);

  const [activeTab, setActiveTab] = useState<TabType>("delivery");
  const [countries, setCountries] = useState<Country[]>([]);
  const [shoppingCountries, setShoppingCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
    orderId?: string;
  } | null>(null);

  const [formData, setFormData] = useState<OrderForm>({
    customerName: "",
    customerPhone: "",
    customerWechat: "",
    country: "",
    city: "",
    district: "",
    detailAddress: "",
    foodType: "",
    notes: "",
    customCountry: "",
    customCity: "",
  });

  const [shoppingFormData, setShoppingFormData] = useState<OrderForm>({
    customerName: "",
    customerPhone: "",
    customerWechat: "",
    country: "",
    city: "",
    district: "",
    detailAddress: "",
    foodType: "",
    notes: "",
    customCountry: "",
    customCity: "",
  });

  const [shoppingValidationResult, setShoppingValidationResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);
  const [shoppingSubmitResult, setShoppingSubmitResult] = useState<{
    success: boolean;
    message: string;
    orderId?: string;
  } | null>(null);
  const [shoppingSubmitting, setShoppingSubmitting] = useState(false);

  // Step-by-step flow state
  const [currentStep, setCurrentStep] = useState(1);
  const [shoppingCurrentStep, setShoppingCurrentStep] = useState(1);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const fetchCountries = async () => {
    try {
      const [deliveryRes, shoppingRes] = await Promise.all([
        axios.get<ApiCountry[]>("/api/supported-countries"),
        axios.get<ApiCountry[]>("/api/supported-countries/shopping"),
      ]);

      const formattedDelivery = deliveryRes.data.map((country) => ({
        ...country,
        displayName: stripFlagEmoji(country.name),
      }));
      const formattedShopping = shoppingRes.data.map((country) => ({
        ...country,
        displayName: stripFlagEmoji(country.name),
      }));

      setCountries(formattedDelivery);
      setShoppingCountries(formattedShopping);
    } catch (error) {
      console.error("获取国家列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "country") {
        const nextState = {
          ...prev,
          country: value,
          city: "",
          district: "",
        };
        if (value !== "custom") {
          nextState.customCountry = "";
          nextState.customCity = "";
        }
        return nextState;
      }
      return {
        ...prev,
        [name]: value,
      };
    });

    if (
      ["country", "city", "customCountry", "customCity"].includes(
        name
      )
    ) {
      setValidationResult(null);
      setSubmitResult(null);
    }
  };

  const handleShoppingInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setShoppingFormData((prev) => {
      if (name === "country") {
        const nextState = {
          ...prev,
          country: value,
          city: "",
          district: "",
        };
        if (value !== "custom") {
          nextState.customCountry = "";
          nextState.customCity = "";
        }
        return nextState;
      }
      return {
        ...prev,
        [name]: value,
      };
    });

    if (
      ["country", "city", "customCountry", "customCity"].includes(
        name
      )
    ) {
      setShoppingValidationResult(null);
      setShoppingSubmitResult(null);
    }
  };

  const translateValidationMessage = (message: string): string => {
    if (language === "zh") return message;
    
    // Translation map for validation messages
    const translations: Record<string, string> = {
      "✅ 地址验证通过，我们支持该地区": "✅ Address validated, we support this area",
      "✅ 已记录您的地址，我们会尽快人工确认是否支持该地区配送": "✅ Address recorded, we will manually confirm delivery support soon",
      "请填写国家和城市": "Please fill in country and city",
      "地址验证失败，请重试": "Address validation failed, please try again",
      "暂不支持该国家": "This country is not supported yet"
    };
    
    // Check for exact match first
    if (translations[message]) {
      return translations[message];
    }
    
    // Handle dynamic messages like "暂不支持泰国的某某地区"
    if (message.includes("暂不支持") && message.includes("地区")) {
      return message.replace(/暂不支持(.+)的(.+)地区/, "We don't support $2 area in $1 yet");
    }
    
    if (message.includes("暂不支持") && message.includes("区域")) {
      return message.replace(/暂不支持(.+)的(.+)区域/, "We don't support $2 district in $1 yet");
    }
    
    return message;
  };

  const validateAddress = async (isShoppingForm: boolean = false) => {
    const data = isShoppingForm ? shoppingFormData : formData;
    const isCustomCountry = data.country === "custom";
    const country = isCustomCountry ? data.customCountry : data.country;
    const city = isCustomCountry ? data.customCity : data.city;

    if (!country || !city) {
      const message = language === "zh" 
        ? "请填写国家和城市" 
        : "Please fill in country and city";
      
      if (isShoppingForm) {
        setShoppingValidationResult({
          valid: false,
          message,
        });
      } else {
        setValidationResult({
          valid: false,
          message,
        });
      }
      return;
    }

    if (isCustomCountry) {
      const message = language === "zh"
        ? "✅ 已记录您的地址，我们会尽快人工确认是否支持该地区配送"
        : "✅ Address recorded, we will manually confirm delivery support soon";
      
      const result = {
        valid: true,
        message,
      };
      if (isShoppingForm) {
        setShoppingValidationResult(result);
      } else {
        setValidationResult(result);
      }
      return;
    }

    try {
      const response = await axios.post("/api/validate-address", {
        country,
        city,
        district: data.district,
      });

      const translatedMessage = translateValidationMessage(response.data.message);
      const result = {
        ...response.data,
        message: translatedMessage
      };

      if (isShoppingForm) {
        setShoppingValidationResult(result);
      } else {
        setValidationResult(result);
      }
    } catch (error) {
      const message = language === "zh"
        ? "地址验证失败，请重试"
        : "Address validation failed, please try again";
      
      const errorResult = {
        valid: false,
        message,
      };
      if (isShoppingForm) {
        setShoppingValidationResult(errorResult);
      } else {
        setValidationResult(errorResult);
      }
    }
  };

  const handleSubmit = async (
    e: React.FormEvent,
    isShoppingForm: boolean = false
  ) => {
    e.preventDefault();

    const data = isShoppingForm ? shoppingFormData : formData;
    const validationRes = isShoppingForm
      ? shoppingValidationResult
      : validationResult;

    if (!validationRes?.valid) {
      const errorResult = {
        success: false,
        message: "请先验证地址是否在服务范围内",
      };
      if (isShoppingForm) {
        setShoppingSubmitResult(errorResult);
      } else {
        setSubmitResult(errorResult);
      }
      return;
    }

    if (isShoppingForm) {
      setShoppingSubmitting(true);
    } else {
      setSubmitting(true);
    }

    const isCustomCountry = data.country === "custom";
    const submitData = {
      ...data,
      country: isCustomCountry ? data.customCountry : data.country,
      city: isCustomCountry ? data.customCity : data.city,
    };

    try {
      const response = await axios.post("/api/submit-order", submitData);
      if (isShoppingForm) {
        setShoppingSubmitResult(response.data);
        if (response.data.success) {
          setShoppingFormData({
            customerName: "",
            customerPhone: "",
            customerWechat: "",
            country: "",
            city: "",
            district: "",
            detailAddress: "",
            foodType: "",
            notes: "",
            customCountry: "",
            customCity: "",
          });
          setShoppingValidationResult(null);
          setShoppingCurrentStep(1);
        }
      } else {
        setSubmitResult(response.data);
        if (response.data.success) {
          setFormData({
            customerName: "",
            customerPhone: "",
            customerWechat: "",
            country: "",
            city: "",
            district: "",
            detailAddress: "",
            foodType: "",
            notes: "",
            customCountry: "",
            customCity: "",
          });
          setValidationResult(null);
          setCurrentStep(1);
        }
      }
    } catch (error) {
      const errorResult = {
        success: false,
        message: "提交失败，请重试",
      };
      if (isShoppingForm) {
        setShoppingSubmitResult(errorResult);
      } else {
        setSubmitResult(errorResult);
      }
    } finally {
      if (isShoppingForm) {
        setShoppingSubmitting(false);
      } else {
        setSubmitting(false);
      }
    }
  };

  const renderStepper = (step: number, isShopping: boolean = false) => {
    const steps = [
      { number: 1, label: language === "zh" ? "地址" : "Address", icon: "📍" },
      { number: 2, label: language === "zh" ? "订单" : "Order", icon: isShopping ? "🛍️" : "🍽️" },
      { number: 3, label: language === "zh" ? "联系" : "Contact", icon: "📞" },
    ];

    return (
      <div className="stepper-container">
        {steps.map((s, index) => (
          <React.Fragment key={s.number}>
            <div className={`stepper-step ${step >= s.number ? "active" : ""} ${step > s.number ? "completed" : ""}`}>
              <div className="stepper-circle">
                {step > s.number ? "✓" : s.number}
              </div>
              <div className="stepper-label">{s.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div className={`stepper-line ${step > s.number ? "completed" : ""}`}></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const canProceedToStep2 = (isShopping: boolean = false) => {
    const data = isShopping ? shoppingFormData : formData;
    const vResult = isShopping ? shoppingValidationResult : validationResult;
    const isCustomCountry = data.country === "custom";
    
    return vResult?.valid && data.detailAddress && 
           ((isCustomCountry && data.customCountry && data.customCity) || 
            (!isCustomCountry && data.country && data.city));
  };

  const canProceedToStep3 = (isShopping: boolean = false) => {
    const data = isShopping ? shoppingFormData : formData;
    return data.foodType !== "";
  };

  const handleNextStep = (isShopping: boolean = false) => {
    const step = isShopping ? shoppingCurrentStep : currentStep;
    
    if (step === 1 && canProceedToStep2(isShopping)) {
      isShopping ? setShoppingCurrentStep(2) : setCurrentStep(2);
    } else if (step === 2 && canProceedToStep3(isShopping)) {
      isShopping ? setShoppingCurrentStep(3) : setCurrentStep(3);
    }
  };

  const handlePrevStep = (isShopping: boolean = false) => {
    const step = isShopping ? shoppingCurrentStep : currentStep;
    if (step > 1) {
      isShopping ? setShoppingCurrentStep(step - 1) : setCurrentStep(step - 1);
    }
  };

  const renderOrderForm = (isShopping: boolean = false) => {
    const data = isShopping ? shoppingFormData : formData;
    const countryList = isShopping ? shoppingCountries : countries;
    const isCustomCountry = data.country === "custom";
    const selectedCountry = !isCustomCountry
      ? countryList.find((c) => c.displayName === data.country)
      : undefined;
    const vResult = isShopping ? shoppingValidationResult : validationResult;
    const sResult = isShopping ? shoppingSubmitResult : submitResult;
    const isSubmitting = isShopping ? shoppingSubmitting : submitting;
    const step = isShopping ? shoppingCurrentStep : currentStep;

    return (
      <Card className="order-card">
        <Card.Header className="card-header-custom">
          <div className="card-header-content">
            <h4 className="mb-0">
              {isShopping
                ? language === "zh"
                  ? "📦 网购代下订单"
                  : "📦 Online Shopping"
                : language === "zh"
                  ? "📝 外卖代点订单"
                  : "📝 Food Delivery"}
            </h4>
            <p className="header-subtitle">
              {language === "zh"
                ? isShopping
                  ? "从本地到国际商品，跨国配送服务不断扩展。"
                  : "从本地特色到国际美食，跨国配送服务不断扩展。"
                : isShopping
                  ? "From local to international products, delivered across multiple countries and still growing."
                  : "From local favorites to international dishes, delivered across multiple countries and still growing."}
            </p>
          </div>
        </Card.Header>
        <Card.Body>
          {renderStepper(step, isShopping)}

          <Alert variant="info" className="mb-4 supported-areas-alert">
            <div className="supported-areas-header">
              <span className="globe-icon">🌍</span>
              <strong>{language === "zh" ? "支持地区" : "Supported Areas"}</strong>
            </div>
            <p className="supported-areas-text">
              {isShopping ? (
                language === "zh" ? (
                  <>
                    泰国、新加坡、马来西亚、印度尼西亚、越南、柬埔寨、菲律宾
                    <br />
                    <span className="supported-areas-note">(更多地区探索中)</span>
                  </>
                ) : (
                  <>
                    Thailand, Singapore, Malaysia, Indonesia, Vietnam, Cambodia, Philippines
                    <br />
                    <span className="supported-areas-note">(more regions coming soon)</span>
                  </>
                )
              ) : language === "zh" ? (
                <>
                  泰国、新加坡、马来西亚、印度尼西亚、越南、德国、澳大利亚、柬埔寨、菲律宾、日本、墨西哥、台湾
                  <br />
                  <span className="supported-areas-note">(更多地区陆续开放)</span>
                </>
              ) : (
                <>
                  Thailand, Singapore, Malaysia, Indonesia, Vietnam, Germany, Australia, Cambodia, Philippines, Japan, Mexico, Taiwan
                  <br />
                  <span className="supported-areas-note">(more regions coming soon)</span>
                </>
              )}
            </p>
          </Alert>

          <Form onSubmit={(e) => handleSubmit(e, isShopping)}>
            {/* Step 1: Address */}
            {step === 1 && (
              <>
                <div className="step-header">
                  <h5 className="form-section-title">
                    <span className="step-icon">📍</span>
                    {language === "zh" ? "收货地址" : "Delivery Address"}
                  </h5>
                  <p className="step-subtitle">
                    {language === "zh" ? "请填写您的收货地址" : "Where should we deliver your order?"}
                  </p>
                </div>

                <div className="address-form-wrapper">
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{language === "zh" ? "国家 *" : "Country *"}</Form.Label>
                        <Form.Select
                          name="country"
                          value={data.country}
                          onChange={(e) =>
                            isShopping
                              ? handleShoppingInputChange(e)
                              : handleInputChange(e)
                          }
                          required
                        >
                          <option value="">{language === "zh" ? "请选择国家" : "Please select country"}</option>
                          {countryList.map((country) => {
                            const flagEmoji = String.fromCodePoint(
                              127397 + country.code.charCodeAt(0),
                              127397 + country.code.charCodeAt(1)
                            );
                            const displayText = getLocalizedText(country.displayName, language);
                            return (
                              <option key={country.code} value={country.displayName}>
                                {flagEmoji} {displayText}
                              </option>
                            );
                          })}
                          <option value="custom">
                            {language === "zh" ? "其他（需要人工确认）" : "Other (manual confirmation required)"}
                          </option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    {isCustomCountry && (
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            {language === "zh" ? "请输入国家名称 *" : "Enter Country Name *"}
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="customCountry"
                            value={data.customCountry}
                            onChange={(e) =>
                              isShopping
                                ? handleShoppingInputChange(e)
                                : handleInputChange(e)
                            }
                            required
                            placeholder={language === "zh" ? "请输入国家名称" : "Enter country name"}
                          />
                        </Form.Group>
                      </Col>
                    )}
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>{language === "zh" ? "城市 *" : "City *"}</Form.Label>
                        {isCustomCountry ? (
                          <Form.Control
                            type="text"
                            name="customCity"
                            value={data.customCity}
                            onChange={(e) =>
                              isShopping
                                ? handleShoppingInputChange(e)
                                : handleInputChange(e)
                            }
                            required
                            placeholder={language === "zh" ? "请输入城市名称" : "Enter city name"}
                          />
                        ) : (
                          <Form.Select
                            name="city"
                            value={data.city}
                            onChange={(e) =>
                              isShopping
                                ? handleShoppingInputChange(e)
                                : handleInputChange(e)
                            }
                            required
                            disabled={!selectedCountry}
                          >
                            <option value="">{language === "zh" ? "请选择城市" : "Please select city"}</option>
                            {selectedCountry?.cities.map((city) => (
                              <option key={city} value={city}>
                                {getLocalizedText(city, language)}
                              </option>
                            ))}
                          </Form.Select>
                        )}
                        <div className="city-note">
                          {language === "zh"
                            ? "注：如果都不在以上城市，先随便选一个，再填写详细地址"
                            : "Note: If the city is not listed above, select any city first, then fill in the detailed address"}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
                <Row className="mb-4">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>{language === "zh" ? "详细地址 *" : "Detailed Address *"}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="detailAddress"
                    value={data.detailAddress}
                    onChange={(e) =>
                      isShopping
                        ? handleShoppingInputChange(e)
                        : handleInputChange(e)
                    }
                    required
                    placeholder={
                      language === "zh"
                        ? "请输入详细地址，包括街道、门牌号、楼栋名称等"
                        : "Please enter detailed address, including street, door number, building name, etc."
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            {(!isCustomCountry && (!data.country || !data.city)) ||
            (isCustomCountry && (!data.customCountry || !data.customCity)) ? (
              <Alert variant="warning" className="validation-warning">
                ⚠️ {language === "zh"
                  ? "请先填写国家和城市"
                  : "Please fill in country and city first"}
              </Alert>
            ) : !data.detailAddress ? (
              <Alert variant="warning" className="validation-warning">
                ⚠️ {language === "zh"
                  ? "请填写详细地址后验证"
                  : "Please validate your address before proceeding"}
              </Alert>
            ) : null}

            <Button
              onClick={() => validateAddress(isShopping)}
              disabled={
                (!isCustomCountry && (!data.country || !data.city)) ||
                (isCustomCountry && (!data.customCountry || !data.customCity)) ||
                !data.detailAddress
              }
              className="w-100 btn-validate-custom mb-3"
            >
              {language === "zh"
                ? "📍 验证地址"
                : "📍 Validate Address"}
            </Button>

            {vResult && (
              <Alert
                variant={vResult.valid ? "success" : "danger"}
                className="validation-result"
              >
                {vResult.message}
              </Alert>
            )}

            <div className="step-navigation">
              <Button
                onClick={() => handleNextStep(isShopping)}
                disabled={!canProceedToStep2(isShopping)}
                className="btn-next-step"
              >
                {language === "zh" ? "继续到订单详情 →" : "Continue to Order Details →"}
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Order Details */}
        {step === 2 && (
          <>
            <div className="step-header">
              <h5 className="form-section-title">
                <span className="step-icon">{isShopping ? "🛍️" : "🍽️"}</span>
                {isShopping
                  ? language === "zh"
                    ? "代购需求"
                    : "Shopping Requirements"
                  : language === "zh"
                    ? "订单需求"
                    : "Order Requirements"}
              </h5>
              <p className="step-subtitle">
                {language === "zh" ? "告诉我们您想要什么" : "Tell us what you want"}
              </p>
            </div>
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {isShopping
                      ? language === "zh"
                        ? "商品分类"
                        : "Product Category"
                      : language === "zh"
                        ? "食物类型"
                        : "Food Type"} *
                  </Form.Label>
                  <Form.Select
                    name="foodType"
                    value={data.foodType}
                    onChange={(e) =>
                      isShopping
                        ? handleShoppingInputChange(e)
                        : handleInputChange(e)
                    }
                    required
                  >
                    <option value=""                    >
                      {isShopping
                        ? language === "zh"
                          ? "请选择商品分类"
                          : "Please select product category"
                        : language === "zh"
                          ? "请选择食物类型"
                          : "Please select food type"}
                    </option>
                    {!isShopping && (
                      <>
                        <option value="奶茶">🥤 {language === "zh" ? "奶茶" : "Bubble Tea"}</option>
                        <option value="披萨">🍕 {language === "zh" ? "披萨" : "Pizza"}</option>
                        <option value="汉堡">🍔 {language === "zh" ? "汉堡" : "Burger"}</option>
                        <option value="商超">🛒 {language === "zh" ? "商超" : "Grocery"}</option>
                        <option value="中餐">🥢 {language === "zh" ? "中餐" : "Chinese"}</option>
                        <option value="西餐">🍽️ {language === "zh" ? "西餐" : "Western"}</option>
                        <option value="日料">🍱 {language === "zh" ? "日料" : "Japanese"}</option>
                        <option value="韩料">🍖 {language === "zh" ? "韩料" : "Korean"}</option>
                        <option value="泰餐">🍛 {language === "zh" ? "泰餐" : "Thai"}</option>
                        <option value="越南菜">🥣 {language === "zh" ? "越南菜" : "Vietnamese"}</option>
                        <option value="印尼菜">🍲 {language === "zh" ? "印尼菜" : "Indonesian"}</option>
                        <option value="马来菜">🍛 {language === "zh" ? "马来菜" : "Malaysian"}</option>
                        <option value="快餐">🍟 {language === "zh" ? "快餐" : "Fast Food"}</option>
                        <option value="烧烤">🍢 {language === "zh" ? "烧烤" : "BBQ"}</option>
                        <option value="甜品">🍰 {language === "zh" ? "甜品" : "Dessert"}</option>
                        <option value="其他">🍱 {language === "zh" ? "其他" : "Other"}</option>
                      </>
                    )}
                    {isShopping && (
                      <>
                        <option value="服装">👕 {language === "zh" ? "服装" : "Clothing"}</option>
                        <option value="美妆">💄 {language === "zh" ? "美妆" : "Beauty"}</option>
                        <option value="电子">📱 {language === "zh" ? "电子产品" : "Electronics"}</option>
                        <option value="食品">🍫 {language === "zh" ? "食品" : "Food"}</option>
                        <option value="日用品">🧴 {language === "zh" ? "日用品" : "Daily Necessities"}</option>
                        <option value="户外">🎒 {language === "zh" ? "户外用品" : "Outdoor"}</option>
                        <option value="其他">📦 {language === "zh" ? "其他" : "Other"}</option>
                      </>
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {language === "zh"
                      ? "您有什么需求吗？"
                      : "Do you have any requirements?"}
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="notes"
                    value={data.notes}
                    onChange={(e) =>
                      isShopping
                        ? handleShoppingInputChange(e)
                        : handleInputChange(e)
                    }
                    placeholder={
                      isShopping
                        ? language === "zh"
                          ? "选填，例如：\n• 想买的商品名称与链接\n• 特殊要求或尺码信息"
                          : "Optional, for example:\n• Product names and links you want to buy\n• Special requests or size information"
                        : language === "zh"
                          ? "选填，例如：\n• 想点的餐厅或店铺名称\n• 需要加快配送\n• 特殊要求或过敏信息"
                          : "Optional, for example:\n• Restaurant or store name you want to order from\n• Need faster delivery\n• Special requirements or allergy information"
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="step-navigation">
              <Button
                variant="outline-secondary"
                onClick={() => handlePrevStep(isShopping)}
                className="btn-prev-step"
              >
                ← {language === "zh" ? "返回" : "Back"}
              </Button>
              <Button
                onClick={() => handleNextStep(isShopping)}
                disabled={!canProceedToStep3(isShopping)}
                className="btn-next-step"
              >
                {language === "zh" ? "继续到联系方式 →" : "Continue to Contact →"}
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Contact Information */}
        {step === 3 && (
          <>
            <div className="step-header">
              <h5 className="form-section-title">
                <span className="step-icon">📞</span>
                {language === "zh" ? "联系方式" : "Contact Information"}
              </h5>
              <p className="step-subtitle">
                {language === "zh" ? "请留下您的联系方式" : "How can we reach you?"}
              </p>
            </div>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {language === "zh" ? "收货人姓名 *" : "Recipient Name *"}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="customerName"
                    value={data.customerName}
                    onChange={(e) =>
                      isShopping
                        ? handleShoppingInputChange(e)
                        : handleInputChange(e)
                    }
                    required
                    placeholder={language === "zh" ? "请输入收货人姓名" : "Please enter recipient name"}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {language === "zh" ? "收货人电话 *" : "Recipient Phone *"}
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="customerPhone"
                    value={data.customerPhone}
                    onChange={(e) =>
                      isShopping
                        ? handleShoppingInputChange(e)
                        : handleInputChange(e)
                    }
                    required
                    placeholder={language === "zh" ? "请输入收货人电话" : "Please enter recipient phone"}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {isShopping
                      ? language === "zh"
                        ? "订购人微信号"
                        : "WeChat ID"
                      : language === "zh"
                        ? "订餐人微信号"
                        : "WeChat ID"}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="customerWechat"
                    value={data.customerWechat}
                    onChange={(e) =>
                      isShopping
                        ? handleShoppingInputChange(e)
                        : handleInputChange(e)
                    }
                    placeholder={language === "zh" ? "选填，方便联系" : "Optional, for easy contact"}
                  />
                </Form.Group>
              </Col>
            </Row>

            {sResult && (
              <Alert variant={sResult.success ? "success" : "danger"} className="mb-3">
                <div>{sResult.message}</div>
                {sResult.orderId && (
                  <div className="mt-2">
                    <strong>
                      {language === "zh" ? "订单号：" : "Order Number: "}
                      {sResult.orderId}
                    </strong>
                  </div>
                )}
              </Alert>
            )}

            <div className="step-navigation">
              <Button
                variant="outline-secondary"
                onClick={() => handlePrevStep(isShopping)}
                className="btn-prev-step"
              >
                ← {language === "zh" ? "返回" : "Back"}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !vResult?.valid || !data.customerName || !data.customerPhone}
                className="btn-submit-final"
              >
                {isSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">
                      {language === "zh" ? "提交中..." : "Submitting..."}
                    </span>
                  </>
                ) : (
                  `📤 ${language === "zh" ? "提交订单" : "Submit Order"}`
                )}
              </Button>
            </div>
          </>
        )}
          </Form>
        </Card.Body>
      </Card>
    );
  };

  const renderGuide = () => (
    <Card className="content-card">
      <Card.Header className="card-header-custom">
        <div className="card-header-content">
          <h4 className="mb-0">{t("guideTitle")}</h4>
          <p className="header-subtitle">
            {language === "zh"
              ? "关于海外外卖与网购代下您需要了解的一切"
              : "Everything you need to know about cross-border food delivery and shopping"}
          </p>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="guide-section">
          <div className="guide-item">
            <div className="guide-icon-wrapper">
              <span className="guide-icon">📖</span>
              <div className="guide-number">1</div>
            </div>
            <div className="guide-content">
              <h5>{language === "zh" ? "关于外卖与代购" : "About Delivery & Shopping"}</h5>
              <p>
                {language === "zh"
                  ? "本网站用于收集您海外外卖代点和网购代下的需求，目前暂不支持直接在线支付。请务必留下微信或手机号，方便我们及时与您沟通。"
                  : "This website collects your overseas food delivery and shopping requests. Direct payment online is not yet supported, so please leave WeChat or phone details so we can coordinate quickly."}
              </p>
            </div>
          </div>

          <div className="guide-item">
            <div className="guide-icon-wrapper">
              <span className="guide-icon">📍</span>
              <div className="guide-number">2</div>
            </div>
            <div className="guide-content">
              <h5>{language === "zh" ? "地址可达性验证" : "Address Delivery Validation"}</h5>
              <p>
                {language === "zh"
                  ? "填写送餐或收货地址后，请您进行地址可达性验证。因各国配送覆盖范围不同，并非所有地区都能下单。如提示\"不支持\"，通常表示该地点无法配送，敬请谅解。"
                  : "After filling in the delivery or pickup address, please validate the address. Due to different delivery coverage in various countries, not all areas can place orders. If it shows \"not supported\", it usually means the location cannot be delivered. We apologize for the inconvenience."}
              </p>
            </div>
          </div>

          <div className="guide-item">
            <div className="guide-icon-wrapper">
              <span className="guide-icon">⏱️</span>
              <div className="guide-number">3</div>
            </div>
            <div className="guide-content">
              <h5>{language === "zh" ? "订单处理流程" : "Order Processing Flow"}</h5>
              <p>
                {language === "zh"
                  ? "表单提交后，我们会在短时间内主动联系您，确认订单详情。请保持通信畅通，我们会尽快为您处理。"
                  : "After submitting the form, we will contact you shortly to confirm order details. Please keep your communication open. We will process your order as soon as possible."}
              </p>
            </div>
          </div>

          <div className="ready-to-order-section">
            <div className="ready-to-order-header">
              <span className="check-icon">✅</span>
              <h5>{language === "zh" ? "准备好下单了吗？" : "Ready to Order?"}</h5>
            </div>
            <p>
              {language === "zh"
                ? "选择下面的服务，开启外卖配送或网购代下。"
                : "Pick a service below to start food delivery or online shopping."}
            </p>
            <div className="order-links">
              <Button
                onClick={() => setActiveTab("delivery")}
                className="order-link-btn"
              >
                🍽️ {language === "zh" ? "外卖配送" : "Food Delivery"}
              </Button>
              <Button
                onClick={() => setActiveTab("shopping")}
                className="order-link-btn"
              >
                🛍️ {language === "zh" ? "网购代下" : "Online Shopping"}
              </Button>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  const renderAbout = () => (
    <Card className="content-card">
      <Card.Header className="card-header-custom">
        <div className="card-header-content">
          <h4 className="mb-0">{t("aboutTitle")}</h4>
          <p className="header-subtitle">
            {language === "zh"
              ? "您值得信赖的海外外卖与网购代下伙伴"
              : "Your trusted partner for global food delivery and online shopping"}
          </p>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="about-section">
          <div className="about-item">
            <div className="about-icon-wrapper">
              <span className="about-icon">ℹ️</span>
            </div>
            <div className="about-content">
              <h5>{language === "zh" ? "我们是谁" : "Who We Are"}</h5>
              <p>
                {language === "zh"
                  ? "我们是一支面向用户提供海外外卖代点与网购代下服务的小型团队。"
                  : "We are a small team providing overseas food delivery and online shopping services for users."}
              </p>
            </div>
          </div>

          <div className="about-item">
            <div className="about-icon-wrapper">
              <span className="about-icon">🌍</span>
            </div>
            <div className="about-content">
              <h5>{language === "zh" ? "全球专业知识" : "Global Expertise"}</h5>
              <p>
                {language === "zh"
                  ? "常为客户处理跨国下单相关需求，对各国的下单流程、配送规则与常见问题均有充分的了解。"
                  : "We often handle cross-border ordering needs for customers and have sufficient understanding of the ordering processes, delivery rules, and common issues in various countries."}
              </p>
            </div>
          </div>

          <div className="about-item">
            <div className="about-icon-wrapper">
              <span className="about-icon">🛡️</span>
            </div>
            <div className="about-content">
              <h5>{language === "zh" ? "信任与可靠性" : "Trust & Reliability"}</h5>
              <p>
                {language === "zh"
                  ? "我们坚持以规范、准确、及时为服务标准，在确认地址、核实配送范围、与商家沟通等环节中保持严谨态度，确保订单信息准确无误、服务流程顺畅可控。"
                  : "We adhere to standards of integrity, accuracy, and timeliness in our services. We maintain rigorous attitudes in confirming addresses, verifying delivery coverage, and communicating with merchants to ensure accurate order information and smooth service processes."}
              </p>
            </div>
          </div>

          <div className="about-item">
            <div className="about-icon-wrapper">
              <span className="about-icon">🎯</span>
            </div>
            <div className="about-content">
              <h5>{language === "zh" ? "我们的使命" : "Our Mission"}</h5>
              <p>
                {language === "zh"
                  ? "我们的目标是为用户提供可靠、省心、透明的代点体验，让您在海外下单变得更简单、更安心。"
                  : "Our goal is to provide users with reliable, worry-free, and transparent ordering experience, making it easier and more reassuring for you to order overseas."}
              </p>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="header-custom">
        <Container>
          <div className="header-content">
            <div className="logo-brand">
              <img src={logo} alt="J's Global Link Logo" className="logo-img" />
              <div className="brand-text">
                <h1>{t("headerTitle")}</h1>
                <p>{t("headerSubtitle")}</p>
              </div>
            </div>
            <nav className="nav-buttons">
              <Button
                variant={activeTab === "delivery" ? "custom-active" : "custom"}
                onClick={() => setActiveTab("delivery")}
                className="nav-btn"
              >
                {t("navDelivery")}
              </Button>
              <Button
                variant={activeTab === "shopping" ? "custom-active" : "custom"}
                onClick={() => setActiveTab("shopping")}
                className="nav-btn"
              >
                {t("navShopping")}
              </Button>
              <Button
                variant={activeTab === "guide" ? "custom-active" : "custom"}
                onClick={() => setActiveTab("guide")}
                className="nav-btn"
              >
                {t("navGuide")}
              </Button>
              <Button
                variant={activeTab === "about" ? "custom-active" : "custom"}
                onClick={() => setActiveTab("about")}
                className="nav-btn"
              >
                {t("navAbout")}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() =>
                  setLanguage(language === "zh" ? "en" : "zh")
                }
                className="nav-btn"
                title={language === "zh" ? "Switch to English" : "切换到中文"}
              >
                {language === "zh" ? "English" : "中文"}
              </Button>
            </nav>
          </div>
        </Container>
      </header>

      <main className="main-content">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              {activeTab === "delivery" && renderOrderForm(false)}
              {activeTab === "shopping" && renderOrderForm(true)}
              {activeTab === "guide" && renderGuide()}
              {activeTab === "about" && renderAbout()}
            </Col>
          </Row>
        </Container>
      </main>

      <footer className="footer-custom">
        <Container>
          <div className="footer-content">
            <p className="mb-0">
              {language === "zh"
                ? "© 2025 异国小助手. All rights reserved."
                : "© 2025 J's Global Link. All rights reserved."}
            </p>
          </div>
        </Container>
      </footer>
      <Analytics />
    </div>
  );
};

export default App;
