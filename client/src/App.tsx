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

const getCountryFlagUrl = (countryCode: string): string => {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

const stripFlagEmoji = (text: string) => {
  return text.replace(/(?:\uD83C[\uDDE6-\uDDFF]){2}\s*/g, "").trim();
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

  const validateAddress = async (isShoppingForm: boolean = false) => {
    const data = isShoppingForm ? shoppingFormData : formData;
    const isCustomCountry = data.country === "custom";
    const country = isCustomCountry ? data.customCountry : data.country;
    const city = isCustomCountry ? data.customCity : data.city;

    if (!country || !city) {
      if (isShoppingForm) {
        setShoppingValidationResult({
          valid: false,
          message: "请填写国家和城市",
        });
      } else {
        setValidationResult({
          valid: false,
          message: "请填写国家和城市",
        });
      }
      return;
    }

    if (isCustomCountry) {
      const result = {
        valid: true,
        message: "✅ 已记录您的地址，我们会尽快人工确认是否支持该地区配送",
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

      if (isShoppingForm) {
        setShoppingValidationResult(response.data);
      } else {
        setValidationResult(response.data);
      }
    } catch (error) {
      const errorResult = {
        valid: false,
        message: "地址验证失败，请重试",
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

    return (
      <Card className="order-card">
        <Card.Header className="card-header-custom">
          <h4 className="mb-0">
            {isShopping
              ? language === "zh"
                ? "📦 网购代下订单"
                : "📦 Online Shopping"
              : language === "zh"
                ? "📝 外卖代点订单"
                : "📝 Food Delivery"}
          </h4>
        </Card.Header>
        <Card.Body>
          <Alert variant="info" className="mb-4">
            <Alert.Heading>🌍 {language === "zh" ? "支持地区" : "Supported Areas"}</Alert.Heading>
            {isShopping ? (
              <p className="mb-0">
                {language === "zh"
                  ? "目前仅支持东南亚地区：泰国、新加坡、马来西亚、印尼、越南、柬埔寨、菲律宾"
                  : "Currently only supported in Southeast Asia: Thailand, Singapore, Malaysia, Indonesia, Vietnam, Cambodia, Philippines"}
              </p>
            ) : (
              <>
                <p className="mb-2">
                  {language === "zh"
                    ? "目前支持：泰国、新加坡、马来西亚、印尼、越南、德国、澳大利亚、柬埔寨、菲律宾"
                    : "Currently supported: Thailand, Singapore, Malaysia, Indonesia, Vietnam, Germany, Australia, Cambodia, Philippines"}
                </p>
                <p className="mb-0">
                  <small>
                    {language === "zh"
                      ? "基于 Grab、Uber Eats 等主流平台覆盖范围"
                      : "Based on coverage of major platforms like Grab, Uber Eats, etc."}
                  </small>
                </p>
              </>
            )}
          </Alert>

          <Form onSubmit={(e) => handleSubmit(e, isShopping)}>
            <h5 className="form-section-title">📍 {language === "zh" ? "收货地址" : "Delivery Address"}</h5>

            {((!isCustomCountry && data.country) || data.customCountry) && (
              <Card className="address-preview-card">
                <Card.Body>
                  <div className="address-preview-content">
                    {!isCustomCountry && selectedCountry && (
                      <img
                        src={getCountryFlagUrl(selectedCountry.code)}
                        alt="flag"
                        className="flag-img"
                      />
                    )}
                    <div>
                      <div className="address-label">{language === "zh" ? "收货地址" : "Delivery Address"}</div>
                      <div className="address-text">
                        {isCustomCountry ? data.customCountry : data.country}
                        {data.city && ` · ${data.city}`}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            <Row className="mb-4">
              <Col md={4}>
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
                      return (
                        <option key={country.code} value={country.displayName}>
                          {flagEmoji} {country.displayName}
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
                <Col md={4}>
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
              <Col md={4}>
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
                          {city}
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
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>{language === "zh" ? "详细地址 *" : "Detailed Address *"}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
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
                        ? "请输入详细地址，包括街道、门牌号等"
                        : "Please enter detailed address, including street, door number, etc."
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mb-4">
              {(!isCustomCountry && (!data.country || !data.city)) ||
              (isCustomCountry && (!data.customCountry || !data.customCity)) ? (
                <Alert variant="warning" className="mb-3">
                  {language === "zh"
                    ? "⚠️ 请先填写国家和城市"
                    : "⚠️ Please fill in country and city first"}
                </Alert>
              ) : !data.detailAddress ? (
                <Alert variant="warning" className="mb-3">
                  {language === "zh"
                    ? "⚠️ 请先填写详细地址，然后验证地址是否在服务范围内"
                    : "⚠️ Please fill in the detailed address first, then validate if the address is in the service range"}
                </Alert>
              ) : null}

              <Button
                onClick={() => validateAddress(isShopping)}
                disabled={
                  (!isCustomCountry && (!data.country || !data.city)) ||
                  (isCustomCountry && (!data.customCountry || !data.customCity)) ||
                  !data.detailAddress
                }
                className="w-100 btn-validate-custom"
              >
                {language === "zh"
                  ? "📍 验证地址是否在服务范围内"
                  : "📍 Validate if address is in service range"}
              </Button>

              {vResult && (
                <Alert
                  variant={vResult.valid ? "success" : "danger"}
                  className="mt-3"
                >
                  {vResult.message}
                </Alert>
              )}
            </div>

            <h5 className="form-section-title">
              {isShopping
                ? language === "zh"
                  ? "🛍️ 代购需求"
                  : "🛍️ Shopping Requirements"
                : language === "zh"
                  ? "🍽️ 订单需求"
                  : "🍽️ Order Requirements"}
            </h5>
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
                    <option value="">
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
                        <option value="奶茶">🥤 奶茶</option>
                        <option value="披萨">🍕 披萨</option>
                        <option value="汉堡">🍔 汉堡</option>
                        <option value="商超">🛒 商超</option>
                        <option value="中餐">🥢 中餐</option>
                        <option value="西餐">🍽️ 西餐</option>
                        <option value="日料">🍱 日料</option>
                        <option value="韩料">🍖 韩料</option>
                        <option value="泰餐">🍛 泰餐</option>
                        <option value="越南菜">🥣 越南菜</option>
                        <option value="印尼菜">🍲 印尼菜</option>
                        <option value="马来菜">🍛 马来菜</option>
                        <option value="快餐">🍟 快餐</option>
                        <option value="烧烤">🍢 烧烤</option>
                        <option value="甜品">🍰 甜品</option>
                        <option value="其他">🍱 其他</option>
                      </>
                    )}
                    {isShopping && (
                      <>
                        <option value="服装">👕 服装</option>
                        <option value="美妆">💄 美妆</option>
                        <option value="电子">📱 电子产品</option>
                        <option value="食品">🍫 食品</option>
                        <option value="日用品">🧴 日用品</option>
                        <option value="户外">🎒 户外用品</option>
                        <option value="其他">📦 其他</option>
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

            <h5 className="form-section-title">📞 {language === "zh" ? "联系方式" : "Contact Information"}</h5>
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
              <Alert variant={sResult.success ? "success" : "danger"}>
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

            {!vResult?.valid && (
              <Alert variant="danger" className="mb-3">
                {language === "zh"
                  ? "🚫 请先验证收货地址是否在服务范围内，验证成功后才能提交订单"
                  : "🚫 Please validate if your delivery address is in the service range first. Only after successful validation can you submit the order"}
              </Alert>
            )}

            <Button
              type="submit"
              className="w-100 btn-validate-custom"
              size="lg"
              disabled={isSubmitting || !vResult?.valid}
              title={
                !vResult?.valid
                  ? language === "zh"
                    ? "请先验证收货地址是否在服务范围内"
                    : "Please validate the address first"
                  : language === "zh"
                    ? "点击提交订单"
                    : "Click to submit order"
              }
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
          </Form>
        </Card.Body>
      </Card>
    );
  };

  const renderGuide = () => (
    <Card className="content-card">
      <Card.Header className="card-header-custom">
        <h4 className="mb-0">{t("guideTitle")}</h4>
      </Card.Header>
      <Card.Body>
        <div className="content-section">
          <h5>{language === "zh" ? "1、关于下单" : "1. About Ordering"}</h5>
          <p>
            {language === "zh"
              ? "本网站仅用于收集您的代点需求，目前暂不支持直接在线下单。请在提交表单时务必留下微信/手机号等联系方式，方便我们及时与您沟通。"
              : "This website is only for collecting your ordering needs. Currently, direct online ordering is not supported. Please leave your WeChat/phone number and other contact information when submitting the form so we can contact you promptly."}
          </p>

          <h5>{language === "zh" ? "2、地址可达性验证" : "2. Address Delivery Validation"}</h5>
          <p>
            {language === "zh"
              ? "填写送餐或收货地址后，请您进行地址可达性验证。因各国配送覆盖范围不同，并非所有地区都能下单。如提示\"不支持\"，通常表示该地点无法配送，敬请谅解。"
              : "After filling in the delivery or pickup address, please validate the address. Due to different delivery coverage in various countries, not all areas can place orders. If it shows \"not supported\", it usually means the location cannot be delivered. We apologize for the inconvenience."}
          </p>

          <h5>{language === "zh" ? "3、订单处理流程" : "3. Order Processing Flow"}</h5>
          <p>
            {language === "zh"
              ? "表单提交后，我们会在短时间内主动联系您，确认订单详情。请保持通信畅通，我们会尽快为您处理。"
              : "After submitting the form, we will contact you shortly to confirm order details. Please keep your communication open. We will process your order as soon as possible."}
          </p>
        </div>
      </Card.Body>
    </Card>
  );

  const renderAbout = () => (
    <Card className="content-card">
      <Card.Header className="card-header-custom">
        <h4 className="mb-0">{t("aboutTitle")}</h4>
      </Card.Header>
      <Card.Body>
        <div className="content-section">
          <p>
            {language === "zh"
              ? "我们是一支面向中国用户提供海外外卖代点与网购代下服务的小型团队。"
              : "We are a small team providing overseas food delivery and online shopping services for users."}
          </p>

          <p>
            {language === "zh"
              ? "常为客户处理跨国下单相关需求，对各国的下单流程、配送规则与常见问题均有充分的了解。"
              : "We often handle cross-border ordering needs for customers and have sufficient understanding of the ordering processes, delivery rules, and common issues in various countries."}
          </p>

          <p>
            {language === "zh"
              ? "我们坚持以规范、准确、及时为服务标准，在确认地址、核实配送范围、与商家沟通等环节中保持严谨态度，确保订单信息准确无误、服务流程顺畅可控。"
              : "We adhere to standards of integrity, accuracy, and timeliness in our services. We maintain rigorous attitudes in confirming addresses, verifying delivery coverage, and communicating with merchants to ensure accurate order information and smooth service processes."}
          </p>

          <p>
            {language === "zh"
              ? "我们的目标是为用户提供可靠、省心、透明的代点体验，让您在海外下单变得更简单、更安心。"
              : "Our goal is to provide users with reliable, worry-free, and transparent ordering experience, making it easier and more reassuring for you to order overseas."}
          </p>
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
    </div>
  );
};

export default App;
