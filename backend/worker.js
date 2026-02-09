
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const method = request.method;
        const path = url.pathname;

        // --- CORS HEADERS (Allows your site to talk to this API) ---
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*', // OR your specific domain: 'https://your-site.pages.dev'
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle Pre-flight requests (OPTIONS)
        if (method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
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
                const id = path.split('/').pop();
                await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
