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
      ["country", "city", "district", "customCountry", "customCity"].includes(
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
      ["country", "city", "district", "customCountry", "customCity"].includes(
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
    const selectedCity = data.city;
    const vResult = isShopping ? shoppingValidationResult : validationResult;
    const sResult = isShopping ? shoppingSubmitResult : submitResult;
    const isSubmitting = isShopping ? shoppingSubmitting : submitting;

    return (
      <Card className="order-card">
        <Card.Header className="card-header-custom">
          <h4 className="mb-0">
            {isShopping ? "📦 网购代下订单" : "📝 外卖代点订单"}
          </h4>
        </Card.Header>
        <Card.Body>
          <Alert variant="info" className="mb-4">
            <Alert.Heading>🌍 支持地区</Alert.Heading>
            {isShopping ? (
              <p className="mb-0">
                目前仅支持东南亚地区：泰国、新加坡、马来西亚、印尼、越南、柬埔寨、菲律宾
              </p>
            ) : (
              <>
                <p className="mb-2">
                  目前支持：泰国、新加坡、马来西亚、印尼、越南、德国、澳大利亚、柬埔寨、菲律宾
                </p>
                <p className="mb-0">
                  <small>基于 Grab、Uber Eats 等主流平台覆盖范围</small>
                </p>
              </>
            )}
          </Alert>

          <Form onSubmit={(e) => handleSubmit(e, isShopping)}>
            <h5 className="form-section-title">📍 收货地址</h5>

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
                      <div className="address-label">收货地址</div>
                      <div className="address-text">
                        {isCustomCountry ? data.customCountry : data.country}
                        {data.city && ` · ${data.city}`}
                      </div>
                      {data.district && (
                        <div className="address-district">{data.district}</div>
                      )}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            <Row className="mb-4">
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>国家 *</Form.Label>
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
                    <option value="">请选择国家</option>
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
                    <option value="custom">其他（需要人工确认）</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {isCustomCountry && (
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>请输入国家名称 *</Form.Label>
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
                      placeholder="请输入国家名称"
                    />
                  </Form.Group>
                </Col>
              )}
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>城市 *</Form.Label>
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
                      placeholder="请输入城市名称"
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
                      <option value="">请选择城市</option>
                      {selectedCountry?.cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>区域</Form.Label>
                  <Form.Control
                    type="text"
                    name="district"
                    value={data.district}
                    onChange={(e) =>
                      isShopping
                        ? handleShoppingInputChange(e)
                        : handleInputChange(e)
                    }
                    placeholder="如：曼谷市中心的素坤逸"
                    disabled={!selectedCity}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>详细地址 *</Form.Label>
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
                    placeholder="请输入详细地址，包括街道、门牌号等"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mb-4">
              <Button
                onClick={() => validateAddress(isShopping)}
                disabled={
                  (!isCustomCountry && (!data.country || !data.city)) ||
                  (isCustomCountry && (!data.customCountry || !data.customCity))
                }
                className="w-100 btn-validate-custom"
              >
                📍 验证地址是否在服务范围内
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
              {isShopping ? "🛍️ 代购需求" : "🍽️ 订单需求"}
            </h5>
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {isShopping ? "商品分类" : "食物类型"} *
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
                      请选择{isShopping ? "商品分类" : "食物类型"}
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
                  <Form.Label>您有什么需求吗？</Form.Label>
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
                        ? "选填，例如：\n• 想买的商品名称与链接\n• 特殊要求或尺码信息"
                        : "选填，例如：\n• 想点的餐厅或店铺名称\n• 需要加快配送\n• 特殊要求或过敏信息"
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="form-section-title">📞 联系方式</h5>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>收货人姓名 *</Form.Label>
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
                    placeholder="请输入收货人姓名"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>收货人电话 *</Form.Label>
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
                    placeholder="请输入收货人电话"
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    {isShopping ? "订购人微信号" : "订餐人微信号"}
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
                    placeholder="选填，方便联系"
                  />
                </Form.Group>
              </Col>
            </Row>

            {sResult && (
              <Alert variant={sResult.success ? "success" : "danger"}>
                <div>{sResult.message}</div>
                {sResult.orderId && (
                  <div className="mt-2">
                    <strong>订单号：{sResult.orderId}</strong>
                  </div>
                )}
              </Alert>
            )}

            <Button
              type="submit"
              className="w-100 btn-validate-custom"
              size="lg"
              disabled={isSubmitting || !vResult?.valid}
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
                  <span className="ms-2">提交中...</span>
                </>
              ) : (
                "📤 提交订单"
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
        <h4 className="mb-0">📖 使用说明</h4>
      </Card.Header>
      <Card.Body>
        <div className="content-section">
          <h5>1、关于下单</h5>
          <p>
            本网站仅用于收集您的代点需求，目前暂不支持直接在线下单。
            请在提交表单时务必留下微信/手机号等联系方式，方便我们及时与您沟通。
          </p>

          <h5>2、地址可达性验证</h5>
          <p>
            填写送餐或收货地址后，请您进行地址可达性验证。
            因各国配送覆盖范围不同，并非所有地区都能下单。如提示"不支持"，通常表示该地点无法配送，敬请谅解。
          </p>

          <h5>3、订单处理流程</h5>
          <p>
            表单提交后，我们会在短时间内主动联系您，确认订单详情。
            请保持通信畅通，我们会尽快为您处理。
          </p>
        </div>
      </Card.Body>
    </Card>
  );

  const renderAbout = () => (
    <Card className="content-card">
      <Card.Header className="card-header-custom">
        <h4 className="mb-0">ℹ️ 关于我们</h4>
      </Card.Header>
      <Card.Body>
        <div className="content-section">
          <p>
            我们是一支面向中国用户提供海外外卖代点与网购代下服务的小型团队。
          </p>

          <p>
            常为客户处理跨国下单相关需求，对各国的下单流程、配送规则与常见问题均有充分的了解。
          </p>

          <p>
            我们坚持以规范、准确、及时为服务标准，在确认地址、核实配送范围、与商家沟通等环节中保持严谨态度，确保订单信息准确无误、服务流程顺畅可控。
          </p>

          <p>
            我们的目标是为用户提供可靠、省心、透明的代点体验，让您在海外下单变得更简单、更安心。
          </p>
        </div>
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">加载中...</span>
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
                <h1>J's Global Link</h1>
                <p>Global Bites & Buys, Handled by J.</p>
              </div>
            </div>
            <nav className="nav-buttons">
              <Button
                variant={activeTab === "delivery" ? "custom-active" : "custom"}
                onClick={() => setActiveTab("delivery")}
                className="nav-btn"
              >
                外卖代点
              </Button>
              <Button
                variant={activeTab === "shopping" ? "custom-active" : "custom"}
                onClick={() => setActiveTab("shopping")}
                className="nav-btn"
              >
                网购代下
              </Button>
              <Button
                variant={activeTab === "guide" ? "custom-active" : "custom"}
                onClick={() => setActiveTab("guide")}
                className="nav-btn"
              >
                使用说明
              </Button>
              <Button
                variant={activeTab === "about" ? "custom-active" : "custom"}
                onClick={() => setActiveTab("about")}
                className="nav-btn"
              >
                关于我们
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
            <p className="mb-0">© 2025 异国小助手. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default App;
