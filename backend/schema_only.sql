DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    old_price REAL,
    cat TEXT,
    in_stock INTEGER DEFAULT 1,
    badge TEXT,
    img TEXT,
    desc TEXT,
    sizes TEXT,
    variants TEXT,
    images TEXT,
    variant_style TEXT,
    variant_style TEXT,
    require_variant_selection INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0
);
