-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_wechat VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  detail_address TEXT NOT NULL,
  food_type VARCHAR(100) NOT NULL,
  notes TEXT,
  custom_country VARCHAR(100),
  custom_city VARCHAR(100),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supported_cities table for better data management
CREATE TABLE IF NOT EXISTS supported_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(3) NOT NULL UNIQUE,
  currency VARCHAR(5) NOT NULL,
  platforms JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supported_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID REFERENCES supported_countries(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  aliases JSONB,
  districts JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_country ON orders(country);
CREATE INDEX IF NOT EXISTS idx_supported_countries_code ON supported_countries(code);
CREATE INDEX IF NOT EXISTS idx_supported_cities_country ON supported_cities(country_id);

-- Enable RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE supported_cities ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a public service)
CREATE POLICY "Allow public read access to orders" ON orders
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert to orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to supported_countries" ON supported_countries
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to supported_cities" ON supported_cities
  FOR SELECT USING (true);

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();