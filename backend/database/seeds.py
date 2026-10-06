# database/seeds.py
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine, Base
from app.models.company import Company
from app.models.role_permission import Role, Permission
from app.models.user import User
from app.models.product import Category, Product
from app.models.inventory import Inventory
from app.models.customer import Customer
from app.core.security import get_password_hash
from database.dummy_data import INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_CUSTOMERS

def run_seed():
    # Crear tablas si no existen
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        print("🌱 Iniciando inserción de semillas (Seeders)...")

        # 1. Empresa por defecto
        company = db.query(Company).filter(Company.ruc == "20100000001").first()
        if not company:
            company = Company(name="SalesIA Enterprise S.A.C.", ruc="20100000001")
            db.add(company)
            db.commit()
            db.refresh(company)

# 2. Permisos del Sistema (Granulares)
        permissions_list = [
            ("users:manage", "CONFIGURACION", "Gestión total de usuarios"),
            ("products:read", "PRODUCTOS", "Ver catálogo de productos"),
            ("products:create", "PRODUCTOS", "Crear nuevos productos"),
            ("inventory:read", "INVENTARIO", "Ver inventario y stock"),
            ("inventory:manage", "INVENTARIO", "Ajustar inventario y kardex"),
            ("sales:create", "VENTAS", "Registrar ventas POS"),
            ("analytics:read", "ANALYTICS", "Ver módulos de estadística y bayes")
        ]
        
        perm_objs = {}
        for code, module, desc in permissions_list:
            p = db.query(Permission).filter(Permission.code == code).first()
            if not p:
                p = Permission(code=code, module=module, description=desc)
                db.add(p)
                db.commit()
                db.refresh(p)
            perm_objs[code] = p

        # 3. Rol Administrador
        admin_role = db.query(Role).filter(Role.name == "ADMINISTRADOR").first()
        if not admin_role:
            admin_role = Role(name="ADMINISTRADOR", description="Acceso total al sistema")
            admin_role.permissions = list(perm_objs.values())
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)

        # 4. Usuario Administrador predeterminado (Login por DNI)
        admin_user = db.query(User).filter(User.dni == "12345678").first()
        if not admin_user:
            admin_user = User(
                company_id=company.id,
                role_id=admin_role.id,
                dni="12345678",
                first_name="Admin",
                last_name="SalesIA",
                email="admin@salesia.com",
                password_hash=get_password_hash("securepassword")
            )
            db.add(admin_user)
            db.commit()

        # 5. Categorías y Productos de prueba
        for cat_data in INITIAL_CATEGORIES:
            cat = db.query(Category).filter(Category.name == cat_data["name"]).first()
            if not cat:
                # Se añade company_id para cumplir con la restricción NOT NULL de la base de datos
                cat = Category(company_id=company.id, **cat_data)
                db.add(cat)
                db.commit()
                db.refresh(cat)

        for prod_data in INITIAL_PRODUCTS:
            cat_name = prod_data.pop("category_name")
            cat = db.query(Category).filter(Category.name == cat_name).first()
            
            prod = db.query(Product).filter(Product.sku == prod_data["sku"]).first()
            if not prod:
                prod = Product(company_id=company.id, category_id=cat.id, **prod_data)
                db.add(prod)
                db.commit()
                db.refresh(prod)

                # Crear stock inicial en inventario
                inv = Inventory(product_id=prod.id, current_stock=50, min_stock=5)
                db.add(inv)
                db.commit()

        # 6. Clientes de prueba
        for cust_data in INITIAL_CUSTOMERS:
            cust = db.query(Customer).filter(Customer.document_number == cust_data["document_number"]).first()
            if not cust:
                cust = Customer(company_id=company.id, **cust_data)
                db.add(cust)
                db.commit()

        print("¡Base de datos sembrada exitosamente!")

    except Exception as e:
        db.rollback()
        print(f"Error al sembrar la base de datos: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()