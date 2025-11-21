import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
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

const countryNameMap: Record<string, string> = {
  泰国: "Thailand",
  新加坡: "Singapore",
  马来西亚: "Malaysia",
  印度尼西亚: "Indonesia",
  越南: "Vietnam",
  德国: "Germany",
  澳大利亚: "Australia",
  柬埔寨: "Cambodia",
  菲律宾: "Philippines",
  日本: "Japan",
  墨西哥: "Mexico",
  台湾: "Taiwan",
};

const getLocalizedText = (text: string, lang: Language) => {
  const cleanText = stripFlagEmoji(text);

  if (lang === "en") {
    if (countryNameMap[cleanText]) {
      return countryNameMap[cleanText];
    }

    const parts = cleanText.split(/\s+/);
    const englishParts = parts.filter((part) => /^[A-Za-z]/.test(part));

    if (englishParts.length > 0) {
      return englishParts.join(" ");
    }
  }

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
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

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

  const handleFieldChange = (
    name: keyof OrderForm,
    value: string,
    isShopping: boolean = false
  ) => {
    const setters = {
      data: isShopping ? setShoppingFormData : setFormData,
      validation: isShopping ? setShoppingValidationResult : setValidationResult,
      submit: isShopping ? setShoppingSubmitResult : setSubmitResult,
    };

    setters.data((prev) => {
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
        console.log("Updated state (country):", nextState);
        return nextState;
      }
      const nextState = {
        ...prev,
        [name]: value,
      };
      return nextState;
    });

    if (
      ["country", "city", "customCountry", "customCity"].includes(name as string)
    ) {
      setters.validation(null);
      setters.submit(null);
    }
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isShopping: boolean = false
  ) => {
    const { name, value } = e.target;
    handleFieldChange(name as keyof OrderForm, value, isShopping);
  };

  const translateValidationMessage = (message: string): string => {
    if (language === "zh") return message;

    const translations: Record<string, string> = {
      "✅ 地址验证通过，我们支持该地区": "✅ Address validated, we support this area",
      "✅ 已记录您的地址，我们会尽快人工确认是否支持该地区配送":
        "✅ Address recorded, we will manually confirm delivery support soon",
      "请填写国家和城市": "Please fill in country and city",
      "地址验证失败，请重试": "Address validation failed, please try again",
      "暂不支持该国家": "This country is not supported yet",
    };

    if (translations[message]) {
      return translations[message];
    }

    if (message.includes("暂不支持") && message.includes("地区")) {
      return message.replace(
        /暂不支持(.+)的(.+)地区/,
        "We don't support $2 area in $1 yet"
      );
    }

    if (message.includes("暂不支持") && message.includes("区域")) {
      return message.replace(
        /暂不支持(.+)的(.+)区域/,
        "We don't support $2 district in $1 yet"
      );
    }

    return message;
  };

  const validateAddress = async (isShoppingForm: boolean = false) => {
    const data = isShoppingForm ? shoppingFormData : formData;
    const isCustomCountry = data.country === "custom";
    const country = isCustomCountry ? data.customCountry : data.country;
    const city = isCustomCountry ? data.customCity : data.city;

    if (!country || !city) {
      const message =
        language === "zh" ? "请填写国家和城市" : "Please fill in country and city";

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
      const message =
        language === "zh"
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
        message: translatedMessage,
      };

      if (isShoppingForm) {
        setShoppingValidationResult(result);
      } else {
        setValidationResult(result);
      }
    } catch (error) {
      const message =
        language === "zh"
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
          setSuccessNotice(
            language === "zh"
              ? "提交成功，您的订单我们已收到，请您稍等片刻我们会联系您，请留意您的微信"
              : "Submitted successfully. We've received your order and will contact you soon. Please keep an eye on your WeChat."
          );
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
          setSuccessNotice(
            language === "zh"
              ? "提交成功，您的订单我们已收到，请您稍等片刻我们会联系您，请留意您的微信"
              : "Submitted successfully. We've received your order and will contact you soon. Please keep an eye on your WeChat."
          );
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
      {
        number: 2,
        label: language === "zh" ? "订单" : "Order",
        icon: isShopping ? "🛍️" : "🍽️",
      },
      { number: 3, label: language === "zh" ? "联系" : "Contact", icon: "📞" },
    ];

    return (
      <div className="stepper-container">
        {steps.map((s, index) => (
          <React.Fragment key={s.number}>
            <div
              className={`stepper-step ${
                step >= s.number ? "active" : ""
              } ${step > s.number ? "completed" : ""}`}
            >
              <div className="stepper-circle">
                {step > s.number ? "✓" : s.number}
              </div>
              <div className="stepper-label">{s.label}</div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`stepper-line ${
                  step > s.number ? "completed" : ""
                }`}
              ></div>
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

    return (
      vResult?.valid &&
      data.detailAddress &&
      ((isCustomCountry && data.customCountry && data.customCity) ||
        (!isCustomCountry && data.country && data.city))
    );
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
    const formId = isShopping ? "shopping" : "delivery";

    return (
      <Card className="order-card">
        <CardHeader
          className="card-header-custom"
          title={
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
          }
        />
        <CardContent className="card-body">
          {renderStepper(step, isShopping)}

          <Alert
            icon={false}
            severity="info"
            className="mb-4 supported-areas-alert alert alert-info"
          >
            <div className="supported-areas-header">
              <span className="globe-icon">🌍</span>
              <strong>
                {language === "zh" ? "支持地区" : "Supported Areas"}
              </strong>
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
                    Thailand, Singapore, Malaysia, Indonesia, Vietnam, Cambodia,
                    Philippines
                    <br />
                    <span className="supported-areas-note">
                      (more regions coming soon)
                    </span>
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
                  Thailand, Singapore, Malaysia, Indonesia, Vietnam, Germany,
                  Australia, Cambodia, Philippines, Japan, Mexico, Taiwan
                  <br />
                  <span className="supported-areas-note">
                    (more regions coming soon)
                  </span>
                </>
              )}
            </p>
          </Alert>

          <Box component="form" onSubmit={(e) => handleSubmit(e, isShopping)}>
            {step === 1 && (
              <>
                <div className="step-header">
                  <h5 className="form-section-title">
                    <span className="step-icon">📍</span>
                    {language === "zh" ? "收货地址" : "Delivery Address"}
                  </h5>
                  <p className="step-subtitle">
                    {language === "zh"
                      ? "请填写您的收货地址"
                      : "Where should we deliver your order?"}
                  </p>
                </div>

                <div className="address-form-wrapper">
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth className="mui-input">
                        <InputLabel id={`country-${formId}-label`}>
                          {language === "zh" ? "国家 *" : "Country *"}
                        </InputLabel>
                        <Select
                          labelId={`country-${formId}-label`}
                          label={language === "zh" ? "国家 *" : "Country *"}
                          name="country"
                          value={data.country}
                          onChange={(e) => handleFieldChange("country", e.target.value, isShopping)}
                          required
                        >
                          <MenuItem value="">
                            <em>
                              {language === "zh"
                                ? "请选择国家"
                                : "Please select country"}
                            </em>
                          </MenuItem>
                          {countryList.map((country) => {
                            const flagEmoji = String.fromCodePoint(
                              127397 + country.code.charCodeAt(0),
                              127397 + country.code.charCodeAt(1)
                            );
                            const displayText = getLocalizedText(
                              country.displayName,
                              language
                            );
                            return (
                              <MenuItem
                                key={country.code}
                                value={country.displayName}
                              >
                                {flagEmoji} {displayText}
                              </MenuItem>
                            );
                          })}
                          <MenuItem value="custom">
                            {language === "zh"
                              ? "其他（需要人工确认）"
                              : "Other (manual confirmation required)"}
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {isCustomCountry && (
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label={
                            language === "zh"
                              ? "请输入国家名称"
                              : "Enter Country Name"
                          }
                          name="customCountry"
                          value={data.customCountry}
                          onChange={(e) => handleTextChange(e, isShopping)}
                          required
                          placeholder={
                            language === "zh"
                              ? "请输入国家名称"
                              : "Enter country name"
                          }
                          className="mui-input"
                        />
                      </Grid>
                    )}

                    <Grid item xs={12} md={6}>
                      {isCustomCountry ? (
                        <TextField
                          fullWidth
                          label={language === "zh" ? "城市" : "City"}
                          name="customCity"
                          value={data.customCity}
                          onChange={(e) => handleTextChange(e, isShopping)}
                          required
                          placeholder={
                            language === "zh"
                              ? "请输入城市名称"
                              : "Enter city name"
                          }
                          className="mui-input"
                        />
                      ) : (
                        <FormControl fullWidth className="mui-input">
                          <InputLabel id={`city-${formId}-label`}>
                            {language === "zh" ? "城市 *" : "City *"}
                          </InputLabel>
                          <Select
                            labelId={`city-${formId}-label`}
                            label={language === "zh" ? "城市 *" : "City *"}
                            name="city"
                            value={data.city}
                            onChange={(e) => handleFieldChange("city", e.target.value, isShopping)}
                            required
                            disabled={!selectedCountry}
                          >
                            <MenuItem value="">
                              <em>
                                {language === "zh"
                                  ? "请选择城市"
                                  : "Please select city"}
                              </em>
                            </MenuItem>
                            {selectedCountry?.cities.map((city) => (
                              <MenuItem key={city} value={city}>
                                {getLocalizedText(city, language)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      <div className="city-note">
                        {language === "zh"
                          ? "注：如果都不在以上城市，先随便选一个，再填写详细地址"
                          : "Note: If the city is not listed above, select any city first, then fill in the detailed address"}
                      </div>
                    </Grid>
                  </Grid>
                </div>

                <Grid container spacing={3} className="mb-4">
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={3}
                      label={
                        language === "zh" ? "详细地址" : "Detailed Address"
                      }
                      name="detailAddress"
                      value={data.detailAddress}
                      onChange={(e) => handleTextChange(e, isShopping)}
                      required
                      placeholder={
                        language === "zh"
                          ? "请输入详细地址，包括街道、门牌号、楼栋名称等"
                          : "Please enter detailed address, including street, door number, building name, etc."
                      }
                      className="mui-input"
                    />
                  </Grid>
                </Grid>

                {(!isCustomCountry && (!data.country || !data.city)) ||
                (isCustomCountry && (!data.customCountry || !data.customCity)) ? (
                  <Alert icon={false} severity="warning" className="validation-warning">
                    ⚠️{" "}
                    {language === "zh"
                      ? "请先填写国家和城市"
                      : "Please fill in country and city first"}
                  </Alert>
                ) : !data.detailAddress ? (
                  <Alert icon={false} severity="warning" className="validation-warning">
                    ⚠️{" "}
                    {language === "zh"
                      ? "请填写详细地址后验证"
                      : "Please validate your address before proceeding"}
                  </Alert>
                ) : null}

                <Button
                  onClick={() => validateAddress(isShopping)}
                  disabled={
                    (!isCustomCountry && (!data.country || !data.city)) ||
                    (isCustomCountry &&
                      (!data.customCountry || !data.customCity)) ||
                    !data.detailAddress
                  }
                  className="w-100 btn-validate-custom mb-3"
                  fullWidth
                  sx={{ textTransform: "none" }}
                >
                  {language === "zh" ? "📍 验证地址" : "📍 Validate Address"}
                </Button>

                {vResult && (
                  <Alert
                    icon={false}
                    severity={vResult.valid ? "success" : "error"}
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
                    sx={{ textTransform: "none" }}
                  >
                    {language === "zh"
                      ? "继续到订单详情 →"
                      : "Continue to Order Details →"}
                  </Button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="step-header">
                  <h5 className="form-section-title">
                    <span className="step-icon">
                      {isShopping ? "🛍️" : "🍽️"}
                    </span>
                    {isShopping
                      ? language === "zh"
                        ? "代购需求"
                        : "Shopping Requirements"
                      : language === "zh"
                      ? "订单需求"
                      : "Order Requirements"}
                  </h5>
                  <p className="step-subtitle">
                    {language === "zh"
                      ? "告诉我们您想要什么"
                      : "Tell us what you want"}
                  </p>
                </div>
                <Grid container spacing={3} className="mb-4">
                  <Grid item xs={12}>
                    <FormControl fullWidth className="mui-input">
                      <InputLabel id={`food-type-${formId}-label`}>
                        {isShopping
                          ? language === "zh"
                            ? "商品分类"
                            : "Product Category"
                          : language === "zh"
                          ? "食物类型"
                          : "Food Type"}{" "}
                        *
                      </InputLabel>
                      <Select
                        labelId={`food-type-${formId}-label`}
                        label={
                          isShopping
                            ? language === "zh"
                              ? "商品分类 *"
                              : "Product Category *"
                            : language === "zh"
                            ? "食物类型 *"
                            : "Food Type *"
                        }
                        name="foodType"
                        value={data.foodType}
                        onChange={(e) => handleFieldChange("foodType", e.target.value, isShopping)}
                        required
                      >
                        <MenuItem value="">
                          <em>
                            {isShopping
                              ? language === "zh"
                                ? "请选择商品分类"
                                : "Please select product category"
                              : language === "zh"
                              ? "请选择食物类型"
                              : "Please select food type"}
                          </em>
                        </MenuItem>
                        {!isShopping && (
                          <MenuItem value="奶茶">
                            🥤 {language === "zh" ? "奶茶" : "Bubble Tea"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="披萨">
                            🍕 {language === "zh" ? "披萨" : "Pizza"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="汉堡">
                            🍔 {language === "zh" ? "汉堡" : "Burger"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="商超">
                            🛒 {language === "zh" ? "商超" : "Grocery"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="中餐">
                            🥢 {language === "zh" ? "中餐" : "Chinese"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="西餐">
                            🍽️ {language === "zh" ? "西餐" : "Western"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="日料">
                            🍱 {language === "zh" ? "日料" : "Japanese"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="韩料">
                            🍖 {language === "zh" ? "韩料" : "Korean"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="泰餐">
                            🍛 {language === "zh" ? "泰餐" : "Thai"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="越南菜">
                            🥣 {language === "zh" ? "越南菜" : "Vietnamese"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="印尼菜">
                            🍲 {language === "zh" ? "印尼菜" : "Indonesian"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="马来菜">
                            🍛 {language === "zh" ? "马来菜" : "Malaysian"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="快餐">
                            🍟 {language === "zh" ? "快餐" : "Fast Food"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="烧烤">
                            🍢 {language === "zh" ? "烧烤" : "BBQ"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="甜品">
                            🍰 {language === "zh" ? "甜品" : "Dessert"}
                          </MenuItem>
                        )}
                        {!isShopping && (
                          <MenuItem value="其他">
                            🍱 {language === "zh" ? "其他" : "Other"}
                          </MenuItem>
                        )}
                        {isShopping && (
                          <MenuItem value="服装">
                            👕 {language === "zh" ? "服装" : "Clothing"}
                          </MenuItem>
                        )}
                        {isShopping && (
                          <MenuItem value="美妆">
                            💄 {language === "zh" ? "美妆" : "Beauty"}
                          </MenuItem>
                        )}
                        {isShopping && (
                          <MenuItem value="电子">
                            📱 {language === "zh" ? "电子产品" : "Electronics"}
                          </MenuItem>
                        )}
                        {isShopping && (
                          <MenuItem value="食品">
                            🍫 {language === "zh" ? "食品" : "Food"}
                          </MenuItem>
                        )}
                        {isShopping && (
                          <MenuItem value="日用品">
                            🧴 {language === "zh" ? "日用品" : "Daily Necessities"}
                          </MenuItem>
                        )}
                        {isShopping && (
                          <MenuItem value="户外">
                            🎒 {language === "zh" ? "户外用品" : "Outdoor"}
                          </MenuItem>
                        )}
                        {isShopping && (
                          <MenuItem value="其他">
                            📦 {language === "zh" ? "其他" : "Other"}
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      label={
                        language === "zh"
                          ? "您有什么需求吗？"
                          : "Do you have any requirements?"
                      }
                      name="notes"
                      value={data.notes}
                      onChange={(e) => handleTextChange(e, isShopping)}
                      placeholder={
                        isShopping
                          ? language === "zh"
                            ? "选填，例如：\n• 想买的商品名称与链接\n• 特殊要求或尺码信息"
                            : "Optional, for example:\n• Product names and links you want to buy\n• Special requests or size information"
                          : language === "zh"
                          ? "选填，例如：\n• 想点的餐厅或店铺名称\n• 需要加快配送\n• 特殊要求或过敏信息"
                          : "Optional, for example:\n• Restaurant or store name you want to order from\n• Need faster delivery\n• Special requirements or allergy information"
                      }
                      className="mui-input"
                    />
                  </Grid>
                </Grid>

                <div className="step-navigation">
                  <Button
                    variant="outlined"
                    onClick={() => handlePrevStep(isShopping)}
                    className="btn-prev-step"
                    sx={{ textTransform: "none" }}
                  >
                    ← {language === "zh" ? "返回" : "Back"}
                  </Button>
                  <Button
                    onClick={() => handleNextStep(isShopping)}
                    disabled={!canProceedToStep3(isShopping)}
                    className="btn-next-step"
                    sx={{ textTransform: "none" }}
                  >
                    {language === "zh"
                      ? "继续到联系方式 →"
                      : "Continue to Contact →"}
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <div className="step-header">
                  <h5 className="form-section-title">
                    <span className="step-icon">📞</span>
                    {language === "zh" ? "联系方式" : "Contact Information"}
                  </h5>
                  <p className="step-subtitle">
                    {language === "zh"
                      ? "请留下您的联系方式"
                      : "How can we reach you?"}
                  </p>
                </div>
                <Grid container spacing={3} className="mb-4">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={
                        language === "zh" ? "收货人姓名" : "Recipient Name"
                      }
                      name="customerName"
                      value={data.customerName}
                      onChange={(e) => handleTextChange(e, isShopping)}
                      required
                      placeholder={
                        language === "zh"
                          ? "请输入收货人姓名"
                          : "Please enter recipient name"
                      }
                      className="mui-input"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={
                        language === "zh" ? "收货人电话" : "Recipient Phone"
                      }
                      name="customerPhone"
                      value={data.customerPhone}
                      onChange={(e) => handleTextChange(e, isShopping)}
                      required
                      placeholder={
                        language === "zh"
                          ? "请输入收货人电话"
                          : "Please enter recipient phone"
                      }
                      className="mui-input"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={
                        isShopping
                          ? language === "zh"
                            ? "订购人微信号"
                            : "WeChat ID"
                          : language === "zh"
                          ? "订餐人微信号"
                          : "WeChat ID"
                      }
                      name="customerWechat"
                      value={data.customerWechat}
                      onChange={(e) => handleTextChange(e, isShopping)}
                      placeholder={
                        language === "zh"
                          ? "选填，方便联系"
                          : "Optional, for easy contact"
                      }
                      className="mui-input"
                    />
                  </Grid>
                </Grid>

                {sResult && (
                  <Alert
                    icon={false}
                    severity={sResult.success ? "success" : "error"}
                    className="mb-3"
                  >
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
                    variant="outlined"
                    onClick={() => handlePrevStep(isShopping)}
                    className="btn-prev-step"
                    sx={{ textTransform: "none" }}
                  >
                    ← {language === "zh" ? "返回" : "Back"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !vResult?.valid ||
                      !data.customerName ||
                      !data.customerPhone
                    }
                    className="btn-submit-final"
                    sx={{ textTransform: "none" }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress
                          size={18}
                          color="inherit"
                          thickness={5}
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
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderGuide = () => (
    <Card className="content-card">
      <CardHeader
        className="card-header-custom"
        title={
          <div className="card-header-content">
            <h4 className="mb-0">{t("guideTitle")}</h4>
            <p className="header-subtitle">
              {language === "zh"
                ? "关于海外外卖与网购代下您需要了解的一切"
                : "Everything you need to know about cross-border food delivery and shopping"}
            </p>
          </div>
        }
      />
      <CardContent className="card-body">
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
                sx={{ textTransform: "none" }}
              >
                🍽️ {language === "zh" ? "外卖配送" : "Food Delivery"}
              </Button>
              <Button
                onClick={() => setActiveTab("shopping")}
                className="order-link-btn"
                sx={{ textTransform: "none" }}
              >
                🛍️ {language === "zh" ? "网购代下" : "Online Shopping"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderAbout = () => (
    <Card className="content-card">
      <CardHeader
        className="card-header-custom"
        title={
          <div className="card-header-content">
            <h4 className="mb-0">{t("aboutTitle")}</h4>
            <p className="header-subtitle">
              {language === "zh"
                ? "您值得信赖的海外外卖与网购代下伙伴"
                : "Your trusted partner for global food delivery and online shopping"}
            </p>
          </div>
        }
      />
      <CardContent className="card-body">
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
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="App">
      <header className="header-custom">
        <Container maxWidth="lg">
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
                onClick={() => setActiveTab("delivery")}
                className={`nav-btn ${
                  activeTab === "delivery" ? "btn-custom-active" : ""
                }`}
                sx={{ textTransform: "none" }}
              >
                {t("navDelivery")}
              </Button>
              <Button
                onClick={() => setActiveTab("shopping")}
                className={`nav-btn ${
                  activeTab === "shopping" ? "btn-custom-active" : ""
                }`}
                sx={{ textTransform: "none" }}
              >
                {t("navShopping")}
              </Button>
              <Button
                onClick={() => setActiveTab("guide")}
                className={`nav-btn ${
                  activeTab === "guide" ? "btn-custom-active" : ""
                }`}
                sx={{ textTransform: "none" }}
              >
                {t("navGuide")}
              </Button>
              <Button
                onClick={() => setActiveTab("about")}
                className={`nav-btn ${
                  activeTab === "about" ? "btn-custom-active" : ""
                }`}
                sx={{ textTransform: "none" }}
              >
                {t("navAbout")}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
                className="nav-btn"
                title={language === "zh" ? "Switch to English" : "切换到中文"}
                sx={{ textTransform: "none" }}
              >
                {language === "zh" ? "English" : "中文"}
              </Button>
            </nav>
          </div>
        </Container>
      </header>

      <main className="main-content">
        <Container maxWidth="lg">
          <Grid container justifyContent="center">
            <Grid item xs={12} lg={10}>
              {activeTab === "delivery" && renderOrderForm(false)}
              {activeTab === "shopping" && renderOrderForm(true)}
              {activeTab === "guide" && renderGuide()}
              {activeTab === "about" && renderAbout()}
            </Grid>
          </Grid>
        </Container>
      </main>
      <Dialog
        open={!!successNotice}
        onClose={() => setSuccessNotice(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontWeight: 700,
          }}
        >
          ✅ {language === "zh" ? "提交成功" : "Submitted Successfully"}
        </DialogTitle>
        <DialogContent dividers>
          {successNotice}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessNotice(null)} variant="contained">
            {language === "zh" ? "好的" : "Got it"}
          </Button>
        </DialogActions>
      </Dialog>

      <footer className="footer-custom">
        <Container maxWidth="lg">
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
