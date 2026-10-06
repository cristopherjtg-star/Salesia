-- Tabla de Empresas
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    ruc VARCHAR(11) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- Ej: ADMINISTRADOR, GERENTE, VENDEDOR, ANALISTA, ALMACEN
    description TEXT
);

-- Tabla de Permisos Sistema (Catálogo)
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL, -- Ej: 'sales:create', 'users:manage', 'customers:read'
    module VARCHAR(50) NOT NULL,      -- Ej: 'VENTAS', 'CONFIGURACION', 'ANALYTICS'
    description TEXT NOT NULL
);

-- Tabla de Usuarios (Login por DNI)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id),
    dni VARCHAR(12) UNIQUE NOT NULL,  -- Credencial de inicio de sesión
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Asignación Granular de Permisos por Usuario (Asignados por el Administrador)
CREATE TABLE user_permissions (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, permission_id)
);

-- Tabla de Clientes (Ubicados bajo Configuración / Mantenimiento)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    document_type VARCHAR(10) NOT NULL, -- DNI, RUC, CE
    document_number VARCHAR(15) NOT NULL,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(150),
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_customer_doc UNIQUE (company_id, document_number)
);

-- Categorías y Productos
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    category_id INT NOT NULL REFERENCES categories(id),
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_product_sku UNIQUE (company_id, sku)
);

-- Control de Inventario
CREATE TABLE inventory (
    id SERIAL PRIMARY KEY,
    product_id INT UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock INT DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cabecera y Detalle de Ventas
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    sale_code VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL REFERENCES customers(id),
    seller_id INT NOT NULL REFERENCES users(id),
    subtotal NUMERIC(12, 2) NOT NULL,
    tax NUMERIC(12, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED', -- COMPLETED, ANNULED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sale_details (
    id SERIAL PRIMARY KEY,
    sale_id INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL
);

-- Pagos y Auditoría
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    sale_id INT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    payment_method VARCHAR(30) NOT NULL, -- EFECTIVO, TARJETA, TRANSFERENCIA
    amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Datasets analíticos generados a partir de las operaciones de ventas
CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Historial de Análisis Estadístico (Media, Mediana, Bayes)
CREATE TABLE statistical_analyses (
    id SERIAL PRIMARY KEY,
    dataset_id INT REFERENCES datasets(id),
    user_id INT NOT NULL REFERENCES users(id),
    analysis_type VARCHAR(50) NOT NULL, -- CENTRAL_TENDENCY, BAYES, RANDOM_VARIABLE
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Empleados (Relacionada con usuarios/vendedores para métricas comerciales)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    company_id INT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id INT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
    dni VARCHAR(12) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position VARCHAR(100), -- Ej: Vendedor Senior, Jefe de Almacén
    hire_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trazabilidad de Movimientos de Inventario (Kardex: Entradas, Salidas, Ajustes)
CREATE TABLE inventory_movements (
    id SERIAL PRIMARY KEY,
    inventory_id INT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id),
    movement_type VARCHAR(20) NOT NULL, -- 'ENTRADA', 'SALIDA', 'AJUSTE', 'VENTA'
    quantity INT NOT NULL,
    reference_code VARCHAR(50), -- Ej: Código de Venta o N° de Guía
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Variables definidas dentro de un Dataset para análisis
CREATE TABLE dataset_variables (
    id SERIAL PRIMARY KEY,
    dataset_id INT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    variable_name VARCHAR(100) NOT NULL,
    variable_type VARCHAR(50) NOT NULL, -- 'CUALITATIVA_NOMINAL', 'CUANTITATIVA_DISCRETA', 'CUANTITATIVA_CONTINUA'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Observaciones / Muestras extraídas de las ventas para análisis
CREATE TABLE observations (
    id SERIAL PRIMARY KEY,
    dataset_id INT NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    variable_id INT NOT NULL REFERENCES dataset_variables(id) ON DELETE CASCADE,
    numeric_value NUMERIC(14, 4),
    string_value VARCHAR(255),
    observed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Análisis específicos de Teorema de Bayes
CREATE TABLE bayes_analyses (
    id SERIAL PRIMARY KEY,
    statistical_analysis_id INT NOT NULL REFERENCES statistical_analyses(id) ON DELETE CASCADE,
    prior_probability NUMERIC(6, 4) NOT NULL,    -- P(A)
    likelihood NUMERIC(6, 4) NOT NULL,           -- P(B|A)
    marginal_probability NUMERIC(6, 4) NOT NULL, -- P(B)
    posterior_probability NUMERIC(6, 4) NOT NULL,-- P(A|B)
    hypothesis_description TEXT,
    evidence_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Motor de Insights (Reglas automáticas basadas en resultados)
CREATE TABLE insights (
    id SERIAL PRIMARY KEY,
    statistical_analysis_id INT NOT NULL REFERENCES statistical_analyses(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    impact_level VARCHAR(20) DEFAULT 'INFO', -- 'INFO', 'WARNING', 'CRITICAL'
    evidence_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_dni ON users(dni);
CREATE INDEX idx_sales_company_created ON sales(company_id, created_at);
CREATE INDEX idx_sales_customer ON sales(customer_id);
CREATE INDEX idx_sale_details_sale ON sale_details(sale_id);
CREATE INDEX idx_sale_details_product ON sale_details(product_id);