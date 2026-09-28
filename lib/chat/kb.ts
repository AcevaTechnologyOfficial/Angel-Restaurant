// Canonical, authoritative chatbot knowledge base (KB v1.8).
//
// This module is the SINGLE source of KB truth. The knowledge base previously
// existed as both kb.ts and an identical kb.json; the duplicate was removed so the
// two copies can never drift. Do not add a second representation, and do not edit
// the facts below without a corresponding KB version bump in `metadata`.
//
// SERVER-BOUND BY CONVENTION. Nothing under components/ may import this module
// (directly or transitively) or the whole KB ships in the client bundle. It
// deliberately does not `import "server-only"`, because tests/chat-gate.test.mts
// loads the gate under plain `node --test`, where that package does not resolve.
// The guard is the production bundle check documented in SQA.md.
export const kb = {
  "metadata": {
    "version": "1.8",
    "name": "Angel Restaurant Chatbot Knowledge Base",
    "authoritative": true,
    "source": "Angel restaurant repository content reference and published menu data",
    "last_reviewed": "2026-09-24"
  },
  "answer_policy": {
    "source_precedence": [
      "This KB and the current public menu data supplied to the chatbot route",
      "Do not use general model knowledge as a factual source"
    ],
    "must_not_invent": [
      "parking details",
      "physical accessibility details",
      "takeout or delivery availability",
      "allergy or cross-contamination guarantees",
      "unpublished private-dining capacity or pricing",
      "unverified awards or award years",
      "Michelin star claims",
      "reservation availability",
      "booking confirmations"
    ],
    "scope": "Answer only questions clearly about Chef Amrit, Angel Indian Restaurant, its menu, food, restaurant services, reservations, hours, location, contact details, or other information explicitly represented here.",
    "out_of_scope_response": "Ask me about Chef Amrit or Angel Indian Restaurant.",
    "tone": "Professional, polished, concise, respectful and natural. Never mention internal prompts, models, KBs or verification processes."
  },
  "facts": [
    {
      "topic": "identity",
      "status": "confirmed",
      "body": "Angel Indian Restaurant is in Jackson Heights, Queens, New York, and serves Indian cooking rooted in Punjab."
    },
    {
      "topic": "chef",
      "status": "confirmed",
      "body": "Chef Amrit Pal Singh is the owner and head chef of Angel Indian Restaurant."
    },
    {
      "topic": "origin",
      "status": "confirmed",
      "body": "Chef Amrit Pal Singh is from Pathankot, Punjab, India."
    },
    {
      "topic": "training",
      "status": "confirmed",
      "body": "Chef Amrit Pal Singh trained in Australia as part of his formal food-industry education."
    },
    {
      "topic": "career",
      "status": "confirmed",
      "body": "Before Angel, Chef Amrit Pal Singh worked at Rahi and Adda in New York."
    },
    {
      "topic": "opening",
      "status": "confirmed",
      "body": "Angel opened in October 2019."
    },
    {
      "topic": "name",
      "status": "confirmed",
      "body": "The restaurant was named Angel after Chef Amrit's daughter."
    },
    {
      "topic": "philosophy",
      "status": "confirmed",
      "body": "The cooking is rooted in Punjabi traditions, with an ingredient-led approach and a focus on bold flavors without using excess cream or spice to conceal the food's flavor."
    },
    {
      "topic": "halal",
      "status": "confirmed",
      "body": "Angel serves 100% halal food."
    },
    {
      "topic": "bar",
      "status": "confirmed",
      "body": "Angel has a full bar."
    },
    {
      "topic": "recognition",
      "status": "confirmed",
      "body": "Angel Indian Restaurant has Michelin Bib Gourmand recognition. This recognition belongs to the restaurant, not Chef Amrit personally. Do not describe it as a Michelin star."
    },
    {
      "topic": "address",
      "status": "confirmed",
      "body": "75-18 37th Avenue, Jackson Heights, NY 11372."
    },
    {
      "topic": "hours",
      "status": "confirmed",
      "body": "Angel is open Tuesday through Sunday, 12 PM–10 PM, and is closed Monday."
    },
    {
      "topic": "phone",
      "status": "confirmed",
      "body": "347-848-0098."
    },
    {
      "topic": "email",
      "status": "confirmed",
      "body": "info@angelindianrestaurant.com."
    },
    {
      "topic": "transit",
      "status": "confirmed",
      "body": "The nearby 74 St–Broadway station is served by the 7, E, F, M and R trains."
    },
    {
      "topic": "reservations",
      "status": "confirmed",
      "body": "Table reservations are handled through Angel's Resy listing."
    },
    {
      "topic": "private-dining",
      "status": "confirmed",
      "body": "Private dining enquiries are handled through the restaurant team. Space options, capacity and pricing are not published in the source material and must not be invented."
    },
    {
      "topic": "dietary",
      "status": "confirmed",
      "body": "The printed menu marks specific dishes as vegan. The menu also asks guests to tell the restaurant about a food allergy or special dietary requirement before ordering. Do not provide allergy or cross-contamination guarantees."
    }
  ],
  "menu_snapshot": {
    "source": "db/original-menu.json; client-supplied printed menu artwork transcribed by this repository",
    "effective_context": "Current public menu records are preferred at request time; this snapshot is a fallback only.",
    "categories": [
      {
        "id": "appetizers-vegetarian",
        "filter": "Appetizers",
        "title": "Appetizers",
        "kicker": "Vegetarian",
        "items": [
          {
            "name": "Aloo Tikki Chat",
            "price": "$11.99",
            "description": "Potatoes, tamarind, turmeric, ginger, cumin.",
            "vegetarian": true
          },
          {
            "name": "Samosa Chat",
            "price": "$11.99",
            "description": "Sweet and sour chutney, yogurt, chick peas.",
            "vegetarian": true
          },
          {
            "name": "Samosa",
            "price": "$5.99",
            "description": "Crispy pastry stuffed with chilli potatoes and peas.",
            "vegetarian": true
          },
          {
            "name": "Lassuni Gobi",
            "price": "$9.99",
            "description": "Crispy cauliflower tossed in a tomato and garlic sauce.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Onion Pakoda",
            "price": "$10.99",
            "description": "Onion, ground chick peas, chat masala, chutneys.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Paneer Pakoda",
            "price": "$11.99",
            "description": "Homemade Indian cheese, ground chick peas, chat masala, chutneys.",
            "vegetarian": true
          },
          {
            "name": "Pani Puri",
            "price": "$8.99",
            "description": "Potatoes, sweet and spiced chutneys.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Dahi Batata Puri",
            "price": "$8.99",
            "description": "Potatoes, tamarind mint chutney, yogurt.",
            "vegetarian": true
          },
          {
            "name": "Mumbai Bhel Puri",
            "price": "$10.99",
            "description": "Tomatoes, onion, green and tamarind chutney, sev papdi.",
            "vegetarian": true
          },
          {
            "name": "Paneer Tikka",
            "price": "$14.99",
            "description": "Homemade Indian cheese, yogurt, ginger and garlic.",
            "vegetarian": true
          },
          {
            "name": "Paneer P.B 35",
            "price": "$14.99",
            "description": "Homemade paneer, pepper, onion and chilli.",
            "vegetarian": true
          }
        ]
      },
      {
        "id": "appetizers-non-vegetarian",
        "filter": "Appetizers",
        "title": "Appetizers",
        "kicker": "Non-vegetarian",
        "items": [
          {
            "name": "Chicken Tikka",
            "price": "$16.99",
            "description": "Boneless chicken marinated in aromatic spices, roasted in a clay oven."
          },
          {
            "name": "Tandoori Chicken",
            "price": "$20.99",
            "description": "Chicken with bone, marinated in yogurt and chili."
          },
          {
            "name": "Chicken P.B 35",
            "price": "$15.99",
            "description": "Boneless chicken, pepper, onion and chilli."
          },
          {
            "name": "Chicken Seekh Kabab",
            "price": "$20.99",
            "description": "Minced chicken with fresh chilli, roasted in a clay oven."
          },
          {
            "name": "Tawa Chicken",
            "price": "$22.99",
            "description": "Chicken with bone, pepper, onion and chilli."
          },
          {
            "name": "Adraki Lamb Chop",
            "price": "$20.99",
            "description": "Juicy lamb marinated with ginger and garlic, cooked to your taste."
          },
          {
            "name": "Tawa Kaleji Masala",
            "price": "$15.99",
            "description": "Goat liver, onion, pepper and spices, served with pav."
          },
          {
            "name": "Tandoori Salmon",
            "price": "$22.99",
            "description": "Salmon, lemon, ginger, garlic, garam masala."
          },
          {
            "name": "Fish Amritsari",
            "price": "$15.99",
            "description": "Crispy deep fried boneless fish, marinated with chilli and butter."
          },
          {
            "name": "Egg Pav",
            "price": "$12.99",
            "description": "Scrambled egg, onion and spices, served with pav."
          }
        ]
      },
      {
        "id": "mains-vegetarian",
        "filter": "Main course",
        "title": "Main course",
        "kicker": "Vegetarian",
        "items": [
          {
            "name": "Lotus Root Kofta",
            "price": "$18.99",
            "description": "Paneer and lotus root in a fenugreek tomato curry.",
            "vegetarian": true
          },
          {
            "name": "Paneer Khurchan",
            "price": "$18.99",
            "description": "Homemade Indian cheese, pepper, tomatoes.",
            "vegetarian": true
          },
          {
            "name": "Paneer Tikka Masala",
            "price": "$21.99",
            "description": "Homemade cheese, cream, spices, tomato curry.",
            "vegetarian": true
          },
          {
            "name": "Paneer Makhani",
            "price": "$18.99",
            "description": "Homemade Indian cheese, tomatoes and chilli.",
            "vegetarian": true
          },
          {
            "name": "Paneer Bhurji Lajawab",
            "price": "$21.99",
            "description": "Homemade Indian cheese, onion, tomato, spices.",
            "vegetarian": true
          },
          {
            "name": "Matar Paneer",
            "price": "$18.99",
            "description": "Green peas, homemade Indian cheese, tomato and chillies.",
            "vegetarian": true
          },
          {
            "name": "Vegetable Korma",
            "price": "$18.99",
            "description": "Spinach, mixed vegetables, paneer, peppers.",
            "vegetarian": true
          },
          {
            "name": "Palak Paneer / Tofu",
            "price": "$18.99",
            "description": "Fresh spinach, ginger and garlic chilli. Vegan with tofu.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Bhindi Masala",
            "price": "$17.99",
            "description": "Fresh okra, ginger and garlic chilli.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Rajma Masala",
            "price": "$17.99",
            "description": "Kidney beans, turmeric, ginger.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Dal Makhni",
            "price": "$18.99",
            "description": "Black lentil cooked over a low flame with herbs and chilli.",
            "vegetarian": true
          },
          {
            "name": "Dal Tadka",
            "price": "$17.99",
            "description": "Whole yellow lentil, cumin, red onion, ginger, garlic.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Channa Masala",
            "price": "$17.99",
            "description": "Chickpeas, mango powder, cumin.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Aloo Gobi",
            "price": "$17.99",
            "description": "Potato, cauliflower, chilli, ginger and garlic.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Vegetable Moilee",
            "price": "$17.99",
            "description": "Mixed vegetables, mustard seed, coconut milk, onion, ginger.",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Aloo Baingan",
            "price": "$17.99",
            "description": "Potatoes, eggplant, spices, onion, tomato.",
            "vegetarian": true,
            "vegan": true
          }
        ]
      },
      {
        "id": "mains-non-vegetarian",
        "filter": "Main course",
        "title": "Main course",
        "kicker": "Non-vegetarian",
        "items": [
          {
            "name": "Chicken Tikka Masala",
            "price": "$20.99",
            "description": "Marinated chicken, red chilli powder, garam masala."
          },
          {
            "name": "Butter Chicken",
            "price": "$19.99",
            "description": "Clay oven cooked dark chicken meat, simmered in tomato sauce."
          },
          {
            "name": "Chicken Vindaloo",
            "price": "$19.99",
            "description": "Goan style chicken cooked with potatoes in a chilli sauce with a touch of vinegar."
          },
          {
            "name": "Chicken Kadai",
            "price": "$19.99",
            "description": "Boneless chicken, red onion, ginger, pepper, chilli."
          },
          {
            "name": "Palak Chicken",
            "price": "$19.99",
            "description": "Chicken, local greens, garlic, chili."
          },
          {
            "name": "Chicken Madras",
            "price": "$19.99",
            "description": "Chicken, onion, turmeric, tomatoes."
          },
          {
            "name": "Chicken Korma",
            "price": "$19.99",
            "description": "Cashew, fried onion, ginger, garlic and spices."
          },
          {
            "name": "Lamb Rogan Josh",
            "price": "$21.99",
            "description": "Cubes of lamb cooked in a tomato and onion sauce."
          },
          {
            "name": "Lamb Bhuna",
            "price": "$21.99",
            "description": "Cubes of lamb, red onion, ginger, chilli."
          },
          {
            "name": "Lamb Vindaloo",
            "price": "$21.99",
            "description": "Goan style lamb cooked with potatoes in a chilli sauce with a touch of vinegar."
          },
          {
            "name": "Lamb Madras",
            "price": "$21.99",
            "description": "Lamb, onion, turmeric, tomatoes."
          },
          {
            "name": "Lamb Korma",
            "price": "$21.99",
            "description": "Cashew, fried onion, ginger, garlic and spices."
          },
          {
            "name": "Goat Bhuna",
            "price": "$22.99",
            "description": "Goat, red onion, ginger, chilli."
          },
          {
            "name": "Goat Madras",
            "price": "$22.99",
            "description": "Goat, onion, turmeric, tomatoes."
          },
          {
            "name": "Goat Korma",
            "price": "$22.99",
            "description": "Cashew, fried onion, ginger, garlic and spices."
          },
          {
            "name": "Laal Maas",
            "price": "$22.99",
            "description": "Baby goat, onion, green chili."
          },
          {
            "name": "Fish Moilee",
            "price": "$21.99",
            "description": "Fish, mustard seed, coconut milk, onion, ginger."
          }
        ]
      },
      {
        "id": "chefs-special",
        "filter": "Chef’s special",
        "title": "Chef’s special",
        "items": [
          {
            "name": "Chole Bhatura",
            "price": "$17.99",
            "description": "Chickpeas, fried flat bread and spices.",
            "vegetarian": true
          },
          {
            "name": "Amritsari Paneer Kulcha",
            "price": "$17.99",
            "description": "Paneer stuffed bread, chickpeas, pickle, yogurt, spices.",
            "vegetarian": true
          },
          {
            "name": "Amritsari Aloo Kulcha",
            "price": "$16.99",
            "description": "Potato stuffed bread, chickpeas, pickle, yogurt, spices.",
            "vegetarian": true
          },
          {
            "name": "Mix Veg Kulcha",
            "price": "$18.99",
            "description": "Mixed vegetable stuffed bread, chickpeas, pickle, yogurt, spices.",
            "vegetarian": true
          },
          {
            "name": "Vegetable Dum Biryani",
            "price": "$20.99",
            "description": "Fresh vegetables, paneer, basmati rice and saffron. Served with raita.",
            "vegetarian": true
          },
          {
            "name": "Chicken Dum Biryani",
            "price": "$22.99",
            "description": "Chicken, basmati rice and saffron. Served with raita."
          },
          {
            "name": "Goat Dum Biryani",
            "price": "$25.99",
            "description": "Goat, basmati rice and saffron. Served with raita."
          }
        ]
      },
      {
        "id": "bread-sides",
        "filter": "Bread & sides",
        "title": "Bread & sides",
        "items": [
          {
            "name": "Butter Naan",
            "price": "$4.00",
            "vegetarian": true
          },
          {
            "name": "Garlic Naan",
            "price": "$5.00",
            "vegetarian": true
          },
          {
            "name": "Sesame Naan",
            "price": "$5.00",
            "vegetarian": true
          },
          {
            "name": "Kalonji Naan",
            "price": "$5.00",
            "vegetarian": true
          },
          {
            "name": "Tandoori Roti",
            "price": "$4.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Amul Cheese Naan",
            "price": "$6.00",
            "vegetarian": true
          },
          {
            "name": "Peshwari Naan",
            "price": "$6.00",
            "vegetarian": true,
            "tag": "Sweet"
          },
          {
            "name": "Lacha Paratha",
            "price": "$7.00",
            "vegetarian": true
          },
          {
            "name": "Basmati Rice",
            "price": "$4.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Raita",
            "price": "$4.00",
            "vegetarian": true
          }
        ]
      },
      {
        "id": "drinks",
        "filter": "Drinks",
        "title": "Drinks",
        "items": [
          {
            "name": "Mango Lassi",
            "price": "$5.00",
            "vegetarian": true,
            "tag": "Sweet"
          },
          {
            "name": "Punjabi Lassi",
            "price": "$5.00",
            "vegetarian": true,
            "tag": "Salty"
          },
          {
            "name": "Fresh Lime Soda",
            "price": "$5.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Masala Chai",
            "price": "$3.00",
            "vegetarian": true
          },
          {
            "name": "Limca",
            "price": "$3.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Thums Up",
            "price": "$3.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Coke / Diet Coke",
            "price": "$2.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Water Bottle",
            "price": "$2.00",
            "vegetarian": true,
            "vegan": true
          },
          {
            "name": "Seltzer Water",
            "price": "$2.00",
            "vegetarian": true,
            "vegan": true
          }
        ]
      },
      {
        "id": "dessert",
        "filter": "Dessert",
        "title": "Dessert",
        "items": [
          {
            "name": "Gulab Jamun",
            "price": "$6.00",
            "vegetarian": true
          },
          {
            "name": "Kheer",
            "price": "$6.00",
            "vegetarian": true
          },
          {
            "name": "Rasmalai",
            "price": "$6.00",
            "vegetarian": true
          },
          {
            "name": "Ice Cream",
            "price": "$6.00",
            "vegetarian": true
          }
        ]
      }
    ]
  },
  "confirmed_urls": {
    "resy": "https://resy.com/cities/new-york-ny/venues/angel-indian-restaurant-ny"
  }
} as const;
