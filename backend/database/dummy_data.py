# database/dummy_data.py

INITIAL_CATEGORIES = [
    {"name": "Bebidas", "description": "Bebidas gaseosas, jugos y aguas"},
    {"name": "Abarrotes", "description": "Productos de primera necesidad y comestibles"},
    {"name": "Limpieza", "description": "Artículos de limpieza para el hogar y negocio"}
]

INITIAL_PRODUCTS = [
    {"sku": "BEB-001", "name": "Coca Cola 1.5L", "description": "Bebida gaseosa retornable", "unit_price": 7.50, "cost_price": 5.00, "category_name": "Bebidas"},
    {"sku": "ABA-001", "name": "Arroz Superior 1kg", "description": "Arroz extra grano largo", "unit_price": 4.80, "cost_price": 3.80, "category_name": "Abarrotes"},
    {"sku": "LIM-001", "name": "Defens 900ml", "description": "Detergente líquido multiusos", "unit_price": 12.00, "cost_price": 8.50, "category_name": "Limpieza"}
]

INITIAL_CUSTOMERS = [
    {"document_type": "DNI", "document_number": "87654321", "name": "Juan Pérez Gómez", "phone": "987654321", "email": "juan.perez@example.com", "address": "Av. Principal 123"},
    {"document_type": "RUC", "document_number": "20601234567", "name": "Comercializadora S.A.C.", "phone": "912345678", "email": "ventas@comercializadora.com", "address": "Jr. Comercio 456"}
]