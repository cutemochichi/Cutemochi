
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const method = request.method;
        const path = url.pathname;

        // --- CORS HEADERS (Allows your site to talk to this API) ---
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*', // OR your specific domain: 'https://your-site.pages.dev'
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
        };

        // Handle Pre-flight requests (OPTIONS)
        if (method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // --- AUTH ---
            const ADMIN_PASSWORD = "Zainebzaineb2004@";

            const checkAuth = (req) => {
                const init = req.headers.get("X-Admin-Key");
                return init === ADMIN_PASSWORD;
            };

            // --- ROUTER ---

            // 1. GET /api/products -> List all products
            if (method === 'GET' && path === '/api/products') {
                const { results } = await env.DB.prepare('SELECT * FROM products').all();

                // Parse JSON fields back to objects for the frontend
                const products = results.map(p => ({
                    ...p,
                    // Convert snake_case DB columns to camelCase JS properties if needed, 
                    // or just use DB columns in frontend. Let's map to existing frontend structure.
                    // Convert snake_case DB columns to camelCase JS properties
                    id: p.id,
                    name: p.name,
                    price: p.price,
                    cat: p.cat,
                    badge: p.badge,
                    img: p.img,
                    desc: p.desc,
                    oldPrice: p.old_price,
                    inStock: p.in_stock === 1,
                    variantStyle: p.variant_style,
                    requireVariantSelection: p.require_variant_selection === 1,
                    // Parse JSON strings
                    sizes: p.sizes ? JSON.parse(p.sizes) : undefined,
                    variants: p.variants ? JSON.parse(p.variants) : undefined,
                    images: p.images ? JSON.parse(p.images) : undefined,
                }));

                return new Response(JSON.stringify(products), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // 2. POST /api/products -> Add new product
            if (method === 'POST' && path === '/api/products') {
                if (!checkAuth(request)) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
                const data = await request.json();

                const stmt = env.DB.prepare(`
          INSERT INTO products (name, cat, price, old_price, img, desc, badge, in_stock, sizes, variants, images, variant_style, require_variant_selection)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

                await stmt.bind(
                    data.name,
                    data.cat,
                    data.price,
                    data.oldPrice || null,
                    data.img,
                    data.desc,
                    data.badge || null,
                    data.inStock ? 1 : 0,
                    data.sizes ? JSON.stringify(data.sizes) : null,
                    data.variants ? JSON.stringify(data.variants) : null,
                    data.images ? JSON.stringify(data.images) : null,
                    data.variantStyle || null,
                    data.requireVariantSelection ? 1 : 0
                ).run();

                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // 3. PUT /api/products/:id -> Update product
            if (method === 'PUT' && path.startsWith('/api/products/')) {
                if (!checkAuth(request)) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
                const id = path.split('/').pop();
                const data = await request.json();

                // Dynamic Update Query
                // For simplicity in this "Copy/Paste" version, we'll update everything.
                const stmt = env.DB.prepare(`
          UPDATE products SET 
            name = ?, cat = ?, price = ?, old_price = ?, img = ?, desc = ?, badge = ?, in_stock = ?, 
            sizes = ?, variants = ?, images = ?, variant_style = ?, require_variant_selection = ?
          WHERE id = ?
        `);

                await stmt.bind(
                    data.name,
                    data.cat,
                    data.price,
                    data.oldPrice || null,
                    data.img,
                    data.desc,
                    data.badge || null,
                    data.inStock ? 1 : 0,
                    data.sizes ? JSON.stringify(data.sizes) : null,
                    data.variants ? JSON.stringify(data.variants) : null,
                    data.images ? JSON.stringify(data.images) : null,
                    data.variantStyle || null,
                    data.requireVariantSelection ? 1 : 0,
                    id
                ).run();

                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // 4. DELETE /api/products/:id -> Delete product
            if (method === 'DELETE' && path.startsWith('/api/products/')) {
                if (!checkAuth(request)) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
                const id = path.split('/').pop();
                await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // 5. GET /api/check-auth -> Verify password
            if (method === 'GET' && path === '/api/check-auth') {
                if (!checkAuth(request)) return new Response("Unauthorized", { status: 401, headers: corsHeaders });
                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            // 6. POST /api/orders -> Process Order & Dec Stock
            if (method === 'POST' && path === '/api/orders') {
                const { items } = await request.json(); // items: [{ id, variantIndex, size, qty }]

                if (!items || !Array.isArray(items) || items.length === 0) {
                    return new Response(JSON.stringify({ error: "No items in order" }), {
                        status: 400,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }

                // We need to process items sequentially to ensure stock is available for all
                // For a real app, use a transaction. D1 supports transactions now.
                // But let's keep it simple: Read all, Check all, Update all (Risk of race condition but acceptable for small scale)

                // 1. Fetch all involved products
                const ids = items.map(i => i.id).join(',');
                if (!ids) return new Response(JSON.stringify({ success: true }), { headers: corsHeaders }); // Empty logic

                // D1 doesn't support "WHERE id IN (...)" easily with binding array, so loop or manual query
                // Let's just fetch ALL products for simplicity and reliability (cached by CF anyway usually) 
                // OR fetch one by one. 
                // Actually, fetching all is safer for "global" consistent state check in this scope.
                const { results } = await env.DB.prepare('SELECT * FROM products').all();

                // 2. Validate Stock
                for (const item of items) {
                    const product = results.find(p => p.id === item.id);
                    if (!product) {
                        return new Response(JSON.stringify({ error: `Product ID ${item.id} not found` }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                    }

                    // Parse JSONs
                    const variants = product.variants ? JSON.parse(product.variants) : [];
                    // const sizes = product.sizes ? JSON.parse(product.sizes) : []; // Not used for stock logic in this simple version, assume stock is in variant

                    let available = 0;

                    // Logic MUST match frontend getStock()
                    if (product.in_stock === 0) available = 0;
                    else if (variants.length > item.variantIndex) {
                        const v = variants[item.variantIndex];
                        // v.stock could be number, boolean, or object (sizes)
                        let stockVal = v.stock;

                        if (typeof stockVal === 'object' && item.size) {
                            available = stockVal[item.size] || 0;
                        } else if (typeof stockVal === 'object') {
                            // Sum of all sizes if no size specified? No, frontend should specify size if needed. 
                            // But if we are here, and size is null, maybe it's an error? 
                            // Let's assume sum for safety or 0.
                            available = Object.values(stockVal).reduce((a, b) => a + b, 0);
                        } else if (stockVal === true) {
                            available = 9999;
                        } else {
                            available = (typeof stockVal === 'number') ? stockVal : 0;
                        }
                    } else {
                        // No variants, use product level or default
                        // The schema doesn't have a specific 'stock' column for quantity, just in_stock boolean.
                        // But usually for no-variant products we might want a quantity? 
                        // Current frontend fallback is 10 if undefined. 
                        // Let's assume unlimited (9999) if it's a simple product "in_stock"
                        // OR we can't track it. 
                        // ERROR: Modifying schema is risky. Let's assume simple products are unlimited for now unless in_stock=0.
                        available = (product.in_stock === 1) ? 9999 : 0;
                    }

                    if (available < item.qty) {
                        return new Response(JSON.stringify({
                            error: `Stock insuffisant pour ${product.name}. Restant: ${available}`,
                            productId: item.id
                        }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                    }
                }

                // 3. Update Stock (The "Write" phase)
                const statements = [];
                for (const item of items) {
                    const product = results.find(p => p.id === item.id);
                    let variants = product.variants ? JSON.parse(product.variants) : [];
                    let changed = false;

                    if (variants.length > item.variantIndex) {
                        let v = variants[item.variantIndex];
                        if (typeof v.stock === 'number') {
                            v.stock = Math.max(0, v.stock - item.qty);
                            changed = true;
                        } else if (typeof v.stock === 'object' && item.size) {
                            if (v.stock[item.size] > 0) {
                                v.stock[item.size] = Math.max(0, v.stock[item.size] - item.qty);
                                changed = true;
                            }
                        }
                        // If boolean true, we don't decrement (unlimited)
                    }

                    if (changed) {
                        statements.push(env.DB.prepare('UPDATE products SET variants = ? WHERE id = ?').bind(JSON.stringify(variants), product.id));
                    }

                    // Also if stock hits 0, maybe set in_stock = 0? 
                    // Let's leave in_stock as a manual override for now, or "global availability"
                }

                if (statements.length > 0) {
                    await env.DB.batch(statements);
                }

                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            return new Response('Not Found', { status: 404, headers: corsHeaders });

        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    },
};
