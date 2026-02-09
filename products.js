const products = [
    {
        "id": 1,
        "name": "Adidas Chinese New Year jacket",
        "price": 250,
        "cat": "autres",
        "inStock": true,
        "badge": "Best",
        "img": "adidas-chinese-new-year-jacket-purple.jpg",
        "desc": "Chinese Jacket Become like a real one.",
        "variants": [
            {
                "name": "violet",
                "hex": "#d0a2be",
                "img": "adidas-chinese-new-year-jacket-purple.jpg",
                "stock": {
                    "S/M": 0,
                    "M/L": 0
                }
            },
            {
                "name": "Roseclair",
                "hex": "#fdcddd",
                "img": "adidas-chinese-new-year-jacket-lightpink.jpg",
                "stock": {
                    "S/M": 0,
                    "M/L": 1
                }
            },
            {
                "name": "Bleu",
                "hex": "#012d6a",
                "img": "adidas-chinese-new-year-jacket-blue.jpg",
                "stock": {
                    "S/M": 0,
                    "M/L": 0
                }
            },
            {
                "name": "Orange",
                "hex": "#c44123",
                "img": "adidas-chinese-new-year-jacket-orange.jpg",
                "stock": {
                    "S/M": 0,
                    "M/L": 1
                }
            },
            {
                "name": "Rose",
                "hex": "#d1738d",
                "img": "adidas-chinese-new-year-jacket-pink.jpg",
                "stock": {
                    "S/M": 0,
                    "M/L": 0
                }
            }
        ],
        "sizes": [
            "S/M",
            "M/L"
        ]
    },
    {
        "id": 2,
        "name": "Pantalon Hello Kitty",
        "price": 150,
        "cat": "hellokitty",
        "badge": "Best",
        "img": "pantalon-hello-kitty-1.jpeg",
        "desc": "hello kitty pyjama.",
        "variants": [
            {
                "name": "Blanc",
                "hex": "#ffffffff",
                "img": "pantalon-hello-kitty-1.jpeg",
                "stock": {
                    "XS": 0,
                    "S": 1,
                    "M": 0,
                    "L": 0
                }
            },
            {
                "name": "Rose",
                "hex": "#ff4181ff",
                "img": "pantalon-hello-kitty-2.jpeg",
                "stock": {
                    "XS": 0,
                    "S": 0,
                    "M": 0,
                    "L": 0
                }
            },
            {
                "name": "Noir",
                "hex": "#000000ff",
                "img": "pantalon-hello-kitty-3.jpeg",
                "stock": {
                    "XS": 0,
                    "S": 0,
                    "M": 0,
                    "L": 0
                }
            }
        ],
        "sizes": [
            "XS",
            "S",
            "M",
            "L"
        ]
    },
    {
        "id": 3,
        "name": "Hello Kitty UGGs",
        "price": 260,
        "cat": "hellokitty",
        "badge": "Best",
        "img": "hello-kitty-uggs-1.jpeg",
        "desc": "hello kitty UGGs.",
        "variants": [
            {
                "name": "Rose",
                "hex": "#ffffffff",
                "img": "hello-kitty-uggs-1.jpeg",
                "stock": 0
            },
            {
                "name": "Maron",
                "hex": "#ffa379d5",
                "img": "hello-kitty-uggs-2.jpeg",
                "stock": 0
            },
            {
                "name": "Noir",
                "hex": "#ec5a058f",
                "img": "hello-kitty-uggs-3.jpeg",
                "stock": 1
            }
        ],
        "sizes": [
            "37-38-39"
        ]
    },
    {
        "id": 4,
        "name": "Pearl Necklace",
        "price": 160,
        "cat": "accessoires",
        "inStock": false,
        "images": [
            "pearl-necklace-1.jpeg",
            "pearl-necklace-2.jpeg",
            "pearl-necklace-3.jpeg",
            "pearl-necklace-4.jpeg",
            "pearl-necklace-5.jpeg"
        ],
        "badge": "Best",
        "img": "pearl-necklace-1.jpeg",
        "desc": "Pearl Necklace."
    },
    {
        "id": 5,
        "name": "Cute Bandana",
        "price": 40,
        "cat": "accessoires",
        "badge": "Best",
        "img": "cute-bandana-1.jpeg",
        "desc": "Cute Bandana.",
        "variants": [
            {
                "name": "1",
                "hex": "#bf1b32",
                "img": "cute-bandana-1.jpeg",
                "stock": 1
            },
            {
                "name": "2",
                "hex": "#e2cdb2",
                "img": "cute-bandana-2.jpeg",
                "stock": 1
            },
            {
                "name": "3",
                "hex": "#e1b4b4",
                "img": "cute-bandana-3.jpeg",
                "stock": 1
            },
            {
                "name": "4",
                "hex": "#9c9443",
                "img": "cute-bandana-4.jpeg",
                "stock": 1
            },
            {
                "name": "5",
                "hex": "#587853",
                "img": "cute-bandana-5.jpeg",
                "stock": 1
            },
            {
                "name": "6",
                "hex": "#b8bfda",
                "img": "cute-bandana-6.jpeg",
                "stock": 0
            }
        ]
    },
    {
        "id": 6,
        "name": "Mikasa Scarf",
        "price": 120,
        "cat": "accessoires",
        "inStock": true,
        "images": [
            "mikasa-scarf-1.jpeg",
            "mikasa-scarf-2.jpeg"
        ],
        "badge": "Best",
        "img": "mikasa-scarf-1.jpeg",
        "desc": "Mikasa Scarf."
    },
    {
        "id": 7,
        "name": "Lampe Tulip",
        "price": 89,
        "cat": "deco",
        "inStock": false,
        "images": [
            "lampe-tulip-1.jpeg",
            "lampe-tulip-2.jpeg"
        ],
        "badge": "Best",
        "img": "lampe-tulip-1.jpeg",
        "desc": "Lampe Tulip."
    },
    {
        "id": 8,
        "name": "Ceinture Vintage",
        "price": 190,
        "cat": "accessoires",
        "inStock": false,
        "badge": "Best",
        "img": "ceinture-vintage-1.jpeg",
        "desc": "Ceinture Vintage.",
        "variants": [
            {
                "name": "1",
                "img": "ceinture-vintage-1.jpeg",
                "stock": 1
            },
            {
                "name": "2",
                "img": "ceinture-vintage-2.jpeg",
                "stock": 1
            }
        ],
        "variantStyle": "button",
        "requireVariantSelection": true
    },
    {
        "id": 9,
        "name": "Lunettes MiuMiu anti-reflets",
        "price": 90,
        "cat": "accessoires",
        "inStock": true,
        "images": [
            "lunettes-miumiu-1.jpeg",
            "lunettes-miumiu-2.jpeg",
            "lunettes-miumiu-3.jpeg",
            "lunettes-miumiu-4.jpeg",
            "lunettes-miumiu-5.jpeg"
        ],
        "badge": "Best",
        "img": "lunettes-miumiu-1.jpeg",
        "desc": "Lunettes MiuMiu anti-reflets For The best cozy nights."
    },
    {
        "id": 10,
        "name": "Tenue Maroc personnalisé",
        "price": 360,
        "cat": "autres",
        "inStock": true,
        "images": [
            "tenue-maroc-personnalisee-1.jpeg",
            "tenue-maroc-personnalisee-2.jpeg",
            "tenue-maroc-personnalisee-3.jpeg",
            "tenue-maroc-personnalisee-4.jpeg",
            "tenue-maroc-personnalisee-5.jpeg"
        ],
        "badge": "Best",
        "img": "tenue-maroc-personnalisee-1.jpeg",
        "desc": "Tenue Maroc personnalisé."
    },
    {
        "id": 11,
        "name": "Collier Hello Kitty en acier inoxydable",
        "price": 40,
        "cat": "hellokitty",
        "inStock": true,
        "images": [
            "collier-hello-kitty-acier-inoxydable-1.jpeg",
            "collier-hello-kitty-acier-inoxydable-2.jpeg",
            "collier-hello-kitty-acier-inoxydable-3.jpeg"
        ],
        "badge": "Best",
        "img": "collier-hello-kitty-acier-inoxydable-1.jpeg",
        "desc": "Collier Hello Kitty en acier inoxydable."
    },
    {
        "id": 12,
        "name": "Sac Hello Kitty",
        "price": 160,
        "oldPrice": 199,
        "cat": "hellokitty",
        "inStock": true,
        "images": [
            "sac-hello-kitty-1.jpeg",
            "sac-hello-kitty-2.jpeg",
            "sac-hello-kitty-3.jpeg",
            "sac-hello-kitty-4.jpeg"
        ],
        "badge": "Best",
        "img": "sac-hello-kitty-1.jpeg",
        "desc": "Sac Hello Kitty. 38cm/31cm/6cm"
    },
    {
        "id": 13,
        "name": "Waist Chains",
        "price": 600,
        "oldPrice": 150,
        "cat": "accessoires",
        "inStock": false,
        "badge": "Best",
        "img": "waist-chains-1.jpeg",
        "desc": "Waist Chains.",
        "variants": [
            {
                "name": "1",
                "img": "waist-chains-1.jpeg",
                "hex": "#000000",
                "stock": 1
            },
            {
                "name": "2",
                "img": "waist-chains-2.jpeg",
                "hex": "#000000",
                "stock": 1
            },
            {
                "name": "3",
                "img": "waist-chains-3.jpeg",
                "hex": "#000000",
                "stock": 1
            },
            {
                "name": "4",
                "img": "waist-chains-4.jpeg",
                "hex": "#000000",
                "stock": 1
            },
            {
                "name": "5",
                "img": "waist-chains-5.jpeg",
                "hex": "#000000",
                "stock": 1
            }
        ],
        "variantStyle": "button",
        "requireVariantSelection": true
    }
];