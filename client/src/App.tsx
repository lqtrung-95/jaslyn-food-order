import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import './App.css';

interface Country {
  name: string;
  code: string;
  cities: string[];
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

// 国旗映射 - 根据国家代码生成国旗URL
const getCountryFlagUrl = (countryCode: string): string => {
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

const App: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<{valid: boolean, message: string} | null>(null);
  const [submitResult, setSubmitResult] = useState<{success: boolean, message: string, orderId?: string} | null>(null);

  const [formData, setFormData] = useState<OrderForm>({
    customerName: '',
    customerPhone: '',
    customerWechat: '',
    country: '',
    city: '',
    district: '',
    detailAddress: '',
    foodType: '',
    notes: '',
    customCountry: '',
    customCity: ''
  });

  useEffect(() => {
    fetchCountries();
  }, []);

  const fetchCountries = async () => {
    try {
      const response = await axios.get('/api/supported-countries');
      setCountries(response.data);
    } catch (error) {
      console.error('获取国家列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 清除之前的验证结果
    if (['country', 'city', 'district'].includes(name)) {
      setValidationResult(null);
      setSubmitResult(null);
    }
  };

  const validateAddress = async () => {
    const country = isCustomCountry ? formData.customCountry : formData.country;
    const city = isCustomCountry ? formData.customCity : formData.city;

    if (!country || !city) {
      setValidationResult({
        valid: false,
        message: '请填写国家和城市'
      });
      return;
    }

    // 如果是自定义国家，直接提示需要人工确认
    if (isCustomCountry) {
      setValidationResult({
        valid: true,
        message: '✅ 已记录您的地址，我们会尽快人工确认是否支持该地区配送'
      });
      return;
    }

    try {
      // 提取国家名称（移除国旗emoji）
      const countryNameOnly = formData.country.replace(/^[\u1F1E6-\u1F1FF]{2}\s+/, '').trim();
      // 发送完整的城市名称（包括中英文）
      const cityNameOnly = formData.city;

      const response = await axios.post('/api/validate-address', {
        country: countryNameOnly,
        city: cityNameOnly,
        district: formData.district
      });

      setValidationResult(response.data);
    } catch (error) {
      setValidationResult({
        valid: false,
        message: '地址验证失败，请重试'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validationResult?.valid) {
      setSubmitResult({
        success: false,
        message: '请先验证地址是否在服务范围内'
      });
      return;
    }

    setSubmitting(true);

    // 准备提交的数据（提取国家名称去掉国旗）
    const countryNameOnly = formData.country.replace(/^[\u1F1E6-\u1F1FF]{2}\s+/, '').trim();
    // 发送完整的城市名称（包括中英文）
    const cityNameOnly = formData.city;

    const submitData = {
      ...formData,
      country: isCustomCountry ? formData.customCountry : countryNameOnly,
      city: isCustomCountry ? formData.customCity : cityNameOnly
    };

    try {
      const response = await axios.post('/api/submit-order', submitData);
      setSubmitResult(response.data);

      if (response.data.success) {
        // 重置表单
        setFormData({
          customerName: '',
          customerPhone: '',
          customerWechat: '',
          country: '',
          city: '',
          district: '',
          detailAddress: '',
          foodType: '',
          notes: '',
          customCountry: '',
          customCity: ''
        });
        setValidationResult(null);
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: '提交失败，请重试'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedCountry = countries.find(c => c.name === formData.country);
  const selectedCity = selectedCountry?.cities.find(city => city === formData.city);
  const isCustomCountry = formData.country === '其他' || formData.country === '';

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
      <header className="bg-primary text-white py-4 mb-4">
        <Container>
          <h1 className="text-center mb-0">🍜 异国小助手</h1>
          <p className="text-center mb-0 mt-2">专业的海外代点外卖服务平台</p>
        </Container>
      </header>

      <main className="mb-5">
        <Container>
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <Card className="shadow">
                <Card.Header className="bg-light">
                  <h4 className="mb-0">📝 代点外卖订单</h4>
                </Card.Header>
                <Card.Body>
                  {/* 支持地区说明 */}
                  <Alert variant="info" className="mb-4">
                    <Alert.Heading>🌍 支持地区</Alert.Heading>
                    <p className="mb-2">
                      目前支持：泰国、新加坡、马来西亚、印尼、越南、德国、澳大利亚、柬埔寨、菲律宾
                    </p>
                    <p className="mb-0">
                      <small>基于 Grab、Uber Eats 等主流平台覆盖范围</small>
                    </p>
                  </Alert>

                  <Form onSubmit={handleSubmit}>
                    {/* 客户信息 */}
                    <h5 className="mb-3">👤 联系信息</h5>
                    <Row className="mb-4">
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>收货人姓名 *</Form.Label>
                          <Form.Control
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleInputChange}
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
                            value={formData.customerPhone}
                            onChange={handleInputChange}
                            required
                            placeholder="请输入收货人电话"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>订餐人微信号</Form.Label>
                          <Form.Control
                            type="text"
                            name="customerWechat"
                            value={formData.customerWechat}
                            onChange={handleInputChange}
                            placeholder="选填，方便联系"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* 配送地址 */}
                    <h5 className="mb-3">📍 配送地址</h5>

                    {/* 地址预览卡片 */}
                    {(formData.country || formData.customCountry) && (
                      <Card className="mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <Card.Body style={{ padding: '15px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {!isCustomCountry && formData.country && (
                              <img
                                src={getCountryFlagUrl(
                                  countries.find(c => c.name === formData.country)?.code || 'un'
                                )}
                                alt="flag"
                                style={{
                                  width: '50px',
                                  height: '33px',
                                  borderRadius: '4px',
                                  objectFit: 'cover',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                              />
                            )}
                            <div>
                              <div style={{ fontSize: '14px', color: '#666' }}>配送地址</div>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '5px' }}>
                                {isCustomCountry ? formData.customCountry : formData.country?.replace(/^[\u1F1E6-\u1F1FF]{2}\s+/, '').trim()}
                                {formData.city && ` · ${formData.city}`}
                              </div>
                              {formData.district && (
                                <div style={{ fontSize: '14px', color: '#999', marginTop: '5px' }}>
                                  {formData.district}
                                </div>
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
                          <div style={{ position: 'relative' }}>
                            <Form.Select
                              name="country"
                              value={formData.country}
                              onChange={handleInputChange}
                              required
                              style={{ paddingLeft: '40px' }}
                            >
                              <option value="">请选择国家</option>
                              {countries.map(country => (
                                <option key={country.code} value={country.name}>
                                  {country.name.replace(/^[\u1F1E6-\u1F1FF]{2}\s+/, '').trim()}
                                </option>
                              ))}
                              <option value="其他">其他（需要人工确认）</option>
                            </Form.Select>
                            {/* 显示已选择国家的国旗 */}
                            {formData.country && formData.country !== '其他' && (
                              <img
                                src={getCountryFlagUrl(
                                  countries.find(c => c.name === formData.country)?.code || 'un'
                                )}
                                alt="flag"
                                style={{
                                  position: 'absolute',
                                  left: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  width: '25px',
                                  height: '16px',
                                  borderRadius: '2px',
                                  objectFit: 'cover',
                                  pointerEvents: 'none'
                                }}
                              />
                            )}
                          </div>
                        </Form.Group>
                      </Col>
                      {isCustomCountry && (
                        <Col md={4}>
                          <Form.Group className="mb-3">
                            <Form.Label>请输入国家名称 *</Form.Label>
                            <Form.Control
                              type="text"
                              name="customCountry"
                              value={formData.customCountry}
                              onChange={handleInputChange}
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
                              value={formData.customCity}
                              onChange={handleInputChange}
                              required
                              placeholder="请输入城市名称"
                            />
                          ) : (
                            <Form.Select
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              required
                              disabled={!selectedCountry}
                            >
                              <option value="">请选择城市</option>
                              {selectedCountry?.cities.map(city => (
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
                            value={formData.district}
                            onChange={handleInputChange}
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
                            value={formData.detailAddress}
                            onChange={handleInputChange}
                            required
                            placeholder="请输入详细地址，包括街道、门牌号等"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* 地址验证 */}
                    <div className="mb-4">
                      <Button
                        variant="outline-primary"
                        onClick={validateAddress}
                        disabled={
                          (!isCustomCountry && (!formData.country || !formData.city)) ||
                          (isCustomCountry && (!formData.customCountry || !formData.customCity))
                        }
                        className="w-100"
                      >
                        📍 验证地址是否在服务范围内
                      </Button>

                      {validationResult && (
                        <Alert
                          variant={validationResult.valid ? 'success' : 'danger'}
                          className="mt-3"
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {!isCustomCountry && formData.country && (
                              <img
                                src={getCountryFlagUrl(
                                  countries.find(c => c.name === formData.country)?.code || 'un'
                                )}
                                alt="flag"
                                style={{
                                  width: '30px',
                                  height: '20px',
                                  borderRadius: '3px',
                                  objectFit: 'cover',
                                  flexShrink: 0
                                }}
                              />
                            )}
                            <span>{validationResult.message}</span>
                          </div>
                        </Alert>
                      )}
                    </div>

                    {/* 订单需求 */}
                    <h5 className="mb-3">🍽️ 订单需求</h5>
                    <Row className="mb-4">
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>食物类型 *</Form.Label>
                          <Form.Select
                            name="foodType"
                            value={formData.foodType}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">请选择食物类型</option>
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
                            value={formData.notes}
                            onChange={handleInputChange}
                            placeholder="选填，例如：&#10;• 想点的餐厅或店铺名称&#10;• 需要加快配送&#10;• 特殊要求或过敏信息"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* 提交结果 */}
                    {submitResult && (
                      <Alert variant={submitResult.success ? 'success' : 'danger'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          {submitResult.success && !isCustomCountry && formData.country && (
                            <img
                              src={getCountryFlagUrl(
                                countries.find(c => c.name === formData.country)?.code || 'un'
                              )}
                              alt="flag"
                              style={{
                                width: '30px',
                                height: '20px',
                                borderRadius: '3px',
                                objectFit: 'cover',
                                flexShrink: 0
                              }}
                            />
                          )}
                          <span>{submitResult.message}</span>
                        </div>
                        {submitResult.orderId && (
                          <div className="mt-2">
                            <strong>订单号：{submitResult.orderId}</strong>
                          </div>
                        )}
                      </Alert>
                    )}

                    {/* 提交按钮 */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-100"
                      disabled={submitting || !validationResult?.valid}
                    >
                      {submitting ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                          <span className="ms-2">提交中...</span>
                        </>
                      ) : (
                        '📤 提交订单'
                      )}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>

      <footer className="bg-light py-4 mt-5">
        <Container>
          <div className="text-center">
            <small className="text-muted">
              © 2024 异国小助手. All rights reserved.
            </small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default App;