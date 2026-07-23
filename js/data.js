/* ==========================================================================
   Stackly — Static/mock data (single source of truth)
   Fictional data for destinations, flights, hotels, packages, and tours.
   Image/gallery paths below are written root-absolute for readability; see
   the fixPath() pass near the bottom of this file for why they're rewritten
   to be relative before use.
   ========================================================================== */

(function () {
  'use strict';

  // ---- Destinations ----
  var destinations = [
    {
      id: 'dest-01',
      name: 'Santorini',
      country: 'Greece',
      image: '/assets/images/destinations/santorini.webp',
      shortDescription: 'Whitewashed cliffs over the Aegean and legendary sunsets over Oia.',
      startingPrice: 68000,
      tags: ['beach'],
      bestTime: { period: 'Late April – October', note: 'Warm days, minimal rain, and the clearest caldera sunsets.' }
    },
    {
      id: 'dest-02',
      name: 'Kyoto',
      country: 'Japan',
      image: '/assets/images/destinations/kyoto.webp',
      shortDescription: 'Ancient temples, bamboo groves, and quiet geisha-district lanes.',
      startingPrice: 72000,
      tags: ['city'],
      bestTime: { period: 'March – May & October – November', note: 'Cherry blossoms in spring, fiery maple leaves in autumn.' }
    },
    {
      id: 'dest-03',
      name: 'Zermatt',
      country: 'Switzerland',
      image: '/assets/images/destinations/zermatt.webp',
      shortDescription: 'A car-free alpine village beneath the shadow of the Matterhorn.',
      startingPrice: 95000,
      tags: ['mountain', 'adventure'],
      bestTime: { period: 'Dec – Mar (skiing) or Jun – Sep (hiking)', note: 'Choose winter for the slopes, summer for alpine trails.' }
    },
    {
      id: 'dest-04',
      name: 'Bali',
      country: 'Indonesia',
      image: '/assets/images/destinations/bali.webp',
      shortDescription: 'Emerald rice terraces, clifftop temples, and quiet surf breaks.',
      startingPrice: 54000,
      tags: ['beach', 'adventure'],
      bestTime: { period: 'April – October', note: 'Dry season with lower humidity and calmer seas.' }
    },
    {
      id: 'dest-05',
      name: 'Cusco',
      country: 'Peru',
      image: '/assets/images/destinations/cusco.webp',
      shortDescription: 'Gateway to Machu Picchu and the Inca citadels of the Andes.',
      startingPrice: 110000,
      tags: ['adventure', 'mountain'],
      bestTime: { period: 'May – September', note: 'Dry season on the Inca Trail with cool, clear mountain air.' }
    },
    {
      id: 'dest-06',
      name: 'Paris',
      country: 'France',
      image: '/assets/images/destinations/paris.webp',
      shortDescription: 'Timeless elegance along the Seine, from the Louvre to Montmartre.',
      startingPrice: 78000,
      tags: ['city'],
      bestTime: { period: 'April – June & September – October', note: 'Mild weather and thinner crowds than peak summer.' }
    },
    {
      id: 'dest-07',
      name: 'Maldives',
      country: 'Maldives',
      image: '/assets/images/destinations/maldives.webp',
      shortDescription: 'Overwater villas suspended above impossibly clear coral lagoons.',
      startingPrice: 145000,
      tags: ['beach'],
      bestTime: { period: 'November – April', note: 'Dry season with calm seas and excellent underwater visibility.' }
    },
    {
      id: 'dest-08',
      name: 'Queenstown',
      country: 'New Zealand',
      image: '/assets/images/destinations/queenstown.webp',
      shortDescription: 'The adrenaline capital of the world, ringed by the Southern Alps.',
      startingPrice: 98000,
      tags: ['adventure', 'mountain'],
      bestTime: { period: 'Dec – Feb (summer) or Jun – Aug (ski season)', note: 'Pick summer for adventure sports, winter for skiing.' }
    },
    {
      id: 'dest-09',
      name: 'Banff',
      country: 'Canada',
      image: '/assets/images/destinations/banff.webp',
      shortDescription: 'Turquoise glacial lakes framed by the peaks of the Canadian Rockies.',
      startingPrice: 89000,
      tags: ['mountain'],
      bestTime: { period: 'June – September', note: 'Warm days with full access to high-altitude trails.' }
    },
    {
      id: 'dest-10',
      name: 'Dubai',
      country: 'United Arab Emirates',
      image: '/assets/images/destinations/dubai.webp',
      shortDescription: 'A futuristic skyline meets golden desert dunes on the Arabian Gulf.',
      startingPrice: 62000,
      tags: ['city', 'adventure'],
      bestTime: { period: 'November – March', note: 'Cooler desert temperatures ideal for outdoor exploring.' }
    },
    {
      id: 'dest-11',
      name: 'Amalfi Coast',
      country: 'Italy',
      image: '/assets/images/destinations/amalfi-coast.webp',
      shortDescription: 'Pastel villages clinging to cliffs above the Tyrrhenian Sea.',
      startingPrice: 84000,
      tags: ['beach', 'city'],
      bestTime: { period: 'May – September', note: 'Warm Mediterranean days, perfect for coastal boat trips.' }
    },
    {
      id: 'dest-12',
      name: 'Reykjavik',
      country: 'Iceland',
      image: '/assets/images/destinations/reykjavik.webp',
      shortDescription: 'Glaciers, geysers, and the aurora borealis at the edge of the Arctic.',
      startingPrice: 102000,
      tags: ['adventure', 'mountain'],
      bestTime: { period: 'Sep – Mar (Northern Lights) or Jun – Aug (midnight sun)', note: 'Visit for the aurora in winter or endless daylight in summer.' }
    }
  ];

  // ---- Flights ----
  var flights = [
    {
      id: 'flt-01',
      airline: 'Aurora Air',
      from: 'Mumbai (BOM)',
      to: 'Santorini (JTR)',
      departTime: '02:15',
      arriveTime: '14:40',
      duration: '9h 25m',
      stops: 1,
      price: 54000,
      class: 'Economy'
    },
    {
      id: 'flt-02',
      airline: 'Meridian Airways',
      from: 'Delhi (DEL)',
      to: 'Osaka (KIX)',
      departTime: '23:50',
      arriveTime: '14:20',
      duration: '11h 30m',
      stops: 1,
      price: 62000,
      class: 'Economy'
    },
    {
      id: 'flt-03',
      airline: 'Alpine Air',
      from: 'Mumbai (BOM)',
      to: 'Zurich (ZRH)',
      departTime: '03:40',
      arriveTime: '09:15',
      duration: '8h 35m',
      stops: 0,
      price: 78000,
      class: 'Premium Economy'
    },
    {
      id: 'flt-04',
      airline: 'Horizon Pacific',
      from: 'Bengaluru (BLR)',
      to: 'Denpasar (DPS)',
      departTime: '01:20',
      arriveTime: '10:05',
      duration: '6h 45m',
      stops: 1,
      price: 38000,
      class: 'Economy'
    },
    {
      id: 'flt-05',
      airline: 'Condor Skyways',
      from: 'Delhi (DEL)',
      to: 'Lima (LIM)',
      departTime: '20:10',
      arriveTime: '08:45',
      duration: '18h 35m',
      stops: 2,
      price: 132000,
      class: 'Economy'
    },
    {
      id: 'flt-06',
      airline: 'Solara Airways',
      from: 'Delhi (DEL)',
      to: 'Paris (CDG)',
      departTime: '03:15',
      arriveTime: '08:10',
      duration: '9h 55m',
      stops: 0,
      price: 71000,
      class: 'Business'
    },
    {
      id: 'flt-07',
      airline: 'Falcon Gulf Airways',
      from: 'Mumbai (BOM)',
      to: 'Male (MLE)',
      departTime: '09:30',
      arriveTime: '11:15',
      duration: '2h 45m',
      stops: 0,
      price: 28000,
      class: 'Economy'
    },
    {
      id: 'flt-08',
      airline: 'Southern Cross Air',
      from: 'Delhi (DEL)',
      to: 'Queenstown (ZQN)',
      departTime: '01:00',
      arriveTime: '22:30',
      duration: '24h 10m',
      stops: 2,
      price: 145000,
      class: 'Economy'
    },
    {
      id: 'flt-09',
      airline: 'Northstar Air',
      from: 'Delhi (DEL)',
      to: 'Calgary (YYC)',
      departTime: '04:45',
      arriveTime: '20:15',
      duration: '19h 30m',
      stops: 1,
      price: 118000,
      class: 'Premium Economy'
    },
    {
      id: 'flt-10',
      airline: 'Falcon Gulf Airways',
      from: 'Mumbai (BOM)',
      to: 'Dubai (DXB)',
      departTime: '06:20',
      arriveTime: '07:55',
      duration: '3h 35m',
      stops: 0,
      price: 19500,
      class: 'Economy'
    },
    {
      id: 'flt-11',
      airline: 'Meridian Airways',
      from: 'Delhi (DEL)',
      to: 'Naples (NAP)',
      departTime: '02:30',
      arriveTime: '09:50',
      duration: '9h 20m',
      stops: 1,
      price: 68000,
      class: 'Economy'
    },
    {
      id: 'flt-12',
      airline: 'Zenith Airlines',
      from: 'Mumbai (BOM)',
      to: 'Reykjavik (KEF)',
      departTime: '23:15',
      arriveTime: '14:40',
      duration: '13h 25m',
      stops: 1,
      price: 96000,
      class: 'Economy'
    }
  ];

  // ---- Hotels ----
  var hotels = [
    {
      id: 'htl-01',
      name: 'Aegean Cliffside Suites',
      destination: 'Santorini, Greece',
      image: '/assets/images/hotels/aegean-cliffside-suites.webp',
      rating: 4.9,
      pricePerNight: 42000,
      amenities: ['Infinity Pool', 'Free WiFi', 'Breakfast Included', 'Spa', 'Sea View'],
      roomTypes: [
        { type: 'Honeymoon Suite', price: 42000 },
        { type: 'Villa with Private Pool', price: 68000 }
      ]
    },
    {
      id: 'htl-02',
      name: 'Kyoto Riverstone Ryokan',
      destination: 'Kyoto, Japan',
      image: '/assets/images/hotels/kyoto-riverstone-ryokan.webp',
      rating: 4.8,
      pricePerNight: 38000,
      amenities: ['Free WiFi', 'Spa', 'River View', 'Breakfast Included', 'Concierge'],
      roomTypes: [
        { type: 'Deluxe Tatami Room', price: 38000 },
        { type: 'Kamogawa Suite', price: 72000 }
      ]
    },
    {
      id: 'htl-03',
      name: 'Matterhorn Alpine Lodge',
      destination: 'Zermatt, Switzerland',
      image: '/assets/images/hotels/matterhorn-alpine-lodge.webp',
      rating: 4.7,
      pricePerNight: 45000,
      amenities: ['Spa', 'Ski-in / Ski-out', 'Free WiFi', 'Breakfast Included', 'Fireplace Lounge'],
      roomTypes: [
        { type: 'Alpine Room', price: 45000 },
        { type: 'Matterhorn View Suite', price: 80000 }
      ]
    },
    {
      id: 'htl-04',
      name: 'Jimbaran Bay Villas',
      destination: 'Bali, Indonesia',
      image: '/assets/images/hotels/jimbaran-bay-villas.webp',
      rating: 4.9,
      pricePerNight: 32000,
      amenities: ['Private Pool Villas', 'Free WiFi', 'Spa', 'Beach Access', 'Breakfast Included'],
      roomTypes: [
        { type: 'Garden Pool Villa', price: 32000 },
        { type: 'Ocean View Villa', price: 52000 }
      ]
    },
    {
      id: 'htl-05',
      name: 'Sacred Valley Monastery Hotel',
      destination: 'Cusco, Peru',
      image: '/assets/images/hotels/sacred-valley-monastery-hotel.webp',
      rating: 4.6,
      pricePerNight: 36000,
      amenities: ['Free WiFi', 'Oxygen-Enriched Rooms', 'Spa', 'Breakfast Included'],
      roomTypes: [
        { type: 'Superior Room', price: 36000 },
        { type: 'Monastery Suite', price: 60000 }
      ]
    },
    {
      id: 'htl-06',
      name: 'Maison Seine Paris',
      destination: 'Paris, France',
      image: '/assets/images/hotels/maison-seine-paris.webp',
      rating: 4.8,
      pricePerNight: 55000,
      amenities: ['Free WiFi', 'Fine Dining', 'Spa', 'Concierge', 'Breakfast Included'],
      roomTypes: [
        { type: 'Classic Room', price: 55000 },
        { type: 'Belle Etoile Suite', price: 120000 }
      ]
    },
    {
      id: 'htl-07',
      name: 'Azure Lagoon Water Villas',
      destination: 'Maldives',
      image: '/assets/images/hotels/azure-lagoon-water-villas.webp',
      rating: 5.0,
      pricePerNight: 98000,
      amenities: ['Overwater Villa', 'Private Pool', 'Free WiFi', 'Spa', 'All-Inclusive'],
      roomTypes: [
        { type: '1-Bedroom Water Villa', price: 98000 },
        { type: '3-Bedroom Water Retreat', price: 210000 }
      ]
    },
    {
      id: 'htl-08',
      name: 'Remarkables View Hotel',
      destination: 'Queenstown, New Zealand',
      image: '/assets/images/hotels/remarkables-view-hotel.webp',
      rating: 4.7,
      pricePerNight: 41000,
      amenities: ['Lake View', 'Free WiFi', 'Breakfast Included', 'Spa'],
      roomTypes: [
        { type: 'Lake View Suite', price: 41000 },
        { type: 'Penthouse Suite', price: 95000 }
      ]
    },
    {
      id: 'htl-09',
      name: 'Rockies Springs Grand Hotel',
      destination: 'Banff, Canada',
      image: '/assets/images/hotels/rockies-springs-grand-hotel.webp',
      rating: 4.7,
      pricePerNight: 34000,
      amenities: ['Free WiFi', 'Spa', 'Golf Course', 'Mountain View', 'Breakfast Included'],
      roomTypes: [
        { type: 'Classic Room', price: 34000 },
        { type: 'Turret Suite', price: 75000 }
      ]
    },
    {
      id: 'htl-10',
      name: 'Dune Pearl Palace',
      destination: 'Dubai, UAE',
      image: '/assets/images/hotels/dune-pearl-palace.webp',
      rating: 4.9,
      pricePerNight: 120000,
      amenities: ['Butler Service', 'Free WiFi', 'Private Beach', 'Spa', 'All-Inclusive'],
      roomTypes: [
        { type: 'Deluxe Suite', price: 120000 },
        { type: 'Royal Suite', price: 350000 }
      ]
    },
    {
      id: 'htl-11',
      name: 'Cliffside Amalfi Retreat',
      destination: 'Amalfi Coast, Italy',
      image: '/assets/images/hotels/cliffside-amalfi-retreat.webp',
      rating: 4.8,
      pricePerNight: 62000,
      amenities: ['Infinity Pool', 'Sea View', 'Free WiFi', 'Spa', 'Breakfast Included'],
      roomTypes: [
        { type: 'Classic Room', price: 62000 },
        { type: 'Ravello Suite', price: 110000 }
      ]
    },
    {
      id: 'htl-12',
      name: 'Northern Lights Geothermal Retreat',
      destination: 'Reykjavik, Iceland',
      image: '/assets/images/hotels/northern-lights-geothermal-retreat.webp',
      rating: 4.9,
      pricePerNight: 88000,
      amenities: ['Geothermal Lagoon Access', 'Spa', 'Free WiFi', 'Breakfast Included'],
      roomTypes: [
        { type: 'Retreat Suite', price: 88000 },
        { type: 'Lagoon View Suite', price: 150000 }
      ]
    }
  ];

  // ---- Packages ----
  var packages = [
    {
      id: 'pkg-01',
      title: 'Santorini Sunset Escape',
      destination: 'Santorini, Greece',
      image: '/assets/images/destinations/santorini.webp',
      gallery: [
        '/assets/images/gallery/santorini-01.webp',
        '/assets/images/gallery/santorini-02.webp',
        '/assets/images/gallery/santorini-03.webp',
        '/assets/images/gallery/santorini-04.webp'
      ],
      duration: { days: 5, nights: 4 },
      price: 89000,
      rating: 4.8,
      description: 'Trade your itinerary for golden-hour views over the caldera. Five days pair cliffside luxury with a sunset cruise, volcanic hot springs, and quiet village wine trails — the essential Santorini, without the rush.',
      inclusions: ['Round-trip Flights', '4 Nights Accommodation', 'Daily Breakfast', 'Airport Transfers', 'Caldera Sunset Cruise'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Optional Wine Tasting Fees'],
      itinerary: [
        { day: 1, title: 'Arrival & Oia Welcome', description: 'Arrive in Santorini, transfer to your cliffside hotel, and take in the famous Oia sunset.' },
        { day: 2, title: 'Caldera Cruise & Volcano Hike', description: 'Sail the caldera, hike the active volcano, and swim in the volcanic hot springs.' },
        { day: 3, title: 'Wine & Village Trail', description: 'Visit family-run wineries in Pyrgos and wander the whitewashed lanes of Fira.' },
        { day: 4, title: 'Beach Day at Perissa', description: 'Relax on the black-sand beaches of the south coast.' },
        { day: 5, title: 'Departure', description: 'Free morning at leisure before transferring to the airport.' }
      ]
    },
    {
      id: 'pkg-02',
      title: 'Kyoto Heritage Trail',
      destination: 'Kyoto, Japan',
      image: '/assets/images/destinations/kyoto.webp',
      gallery: [
        '/assets/images/gallery/kyoto-01.webp',
        '/assets/images/gallery/kyoto-02.webp',
        '/assets/images/gallery/kyoto-03.webp',
        '/assets/images/gallery/kyoto-04.webp'
      ],
      duration: { days: 6, nights: 5 },
      price: 112000,
      rating: 4.7,
      description: 'Six days moving between temple courtyards, bamboo groves, and lantern-lit lanes, with a bullet train pass and guided visits to Kyoto’s most iconic sites. Built for travelers who want depth over a checklist.',
      inclusions: ['Round-trip Flights', '5 Nights Accommodation', 'Daily Breakfast', 'Bullet Train Pass', 'Guided Temple Tours'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Tea Ceremony Kimono Rental (optional)'],
      itinerary: [
        { day: 1, title: 'Arrival in Kyoto', description: 'Settle into your ryokan and stroll the lantern-lit streets of Gion.' },
        { day: 2, title: 'Fushimi Inari & Gion District', description: 'Walk the thousand torii gates and explore the historic geisha quarter.' },
        { day: 3, title: 'Arashiyama & the Golden Pavilion', description: 'Wander the bamboo grove and admire Kinkaku-ji reflected on its pond.' },
        { day: 4, title: 'Day Trip to Nara', description: 'Meet the free-roaming deer and visit Todai-ji temple.' },
        { day: 5, title: 'Tea Ceremony & Nishiki Market', description: 'Learn the art of tea ceremony, then sample street food at Nishiki Market.' },
        { day: 6, title: 'Departure', description: 'Final souvenir shopping before departure.' }
      ]
    },
    {
      id: 'pkg-03',
      title: 'Matterhorn Alpine Adventure',
      destination: 'Zermatt, Switzerland',
      image: '/assets/images/destinations/zermatt.webp',
      gallery: [
        '/assets/images/gallery/zermatt-01.webp',
        '/assets/images/gallery/zermatt-02.webp',
        '/assets/images/gallery/zermatt-03.webp',
        '/assets/images/gallery/zermatt-04.webp'
      ],
      duration: { days: 6, nights: 5 },
      price: 168000,
      rating: 4.9,
      description: 'Six days based in a car-free alpine village beneath the Matterhorn, mixing cable-car panoramas with a guided glacier trek and quiet chalet evenings. For travelers who want the Alps at full scale.',
      inclusions: ['Round-trip Flights', '5 Nights Accommodation', 'Daily Breakfast & Dinner', 'Cable Car Passes', 'Guided Glacier Trek'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Ski/Snowboard Equipment Rental'],
      itinerary: [
        { day: 1, title: 'Arrival in Zermatt', description: 'Transfer to the car-free village and settle in with Matterhorn views.' },
        { day: 2, title: 'Gornergrat Railway', description: 'Ride Europe’s highest open-air railway for panoramic alpine views.' },
        { day: 3, title: 'Glacier Paradise', description: 'Ascend to the highest cable car station in the Alps and walk the glacier ice palace.' },
        { day: 4, title: 'Five Lakes Trail', description: 'Guided hike past five alpine lakes reflecting the Matterhorn.' },
        { day: 5, title: 'Village & Spa Day', description: 'Explore local chalets and unwind at the hotel spa.' },
        { day: 6, title: 'Departure', description: 'Morning at leisure before transfer to the airport.' }
      ]
    },
    {
      id: 'pkg-04',
      title: 'Bali Bliss Retreat',
      destination: 'Bali, Indonesia',
      image: '/assets/images/destinations/bali.webp',
      gallery: [
        '/assets/images/gallery/bali-01.webp',
        '/assets/images/gallery/bali-02.webp',
        '/assets/images/gallery/bali-03.webp',
        '/assets/images/gallery/bali-04.webp'
      ],
      duration: { days: 7, nights: 6 },
      price: 94000,
      rating: 4.8,
      description: 'Seven days split between an Ubud pool villa and the Seminyak coast, with temple visits, a spa session, and a traditional fire-dance evening woven through. A gentle pace built around rice terraces and sunsets.',
      inclusions: ['Round-trip Flights', '6 Nights Villa Stay', 'Daily Breakfast', 'Airport Transfers', 'Spa Session', 'Temple Tour'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Spa Treatments Beyond the Included Session'],
      itinerary: [
        { day: 1, title: 'Arrival in Ubud', description: 'Check into your private pool villa surrounded by rice terraces.' },
        { day: 2, title: 'Tegallalang Rice Terraces', description: 'Walk the iconic terraces and visit a local coffee plantation.' },
        { day: 3, title: 'Temple & Culture Tour', description: 'Visit Tirta Empul and Ulun Danu Beratan temples.' },
        { day: 4, title: 'Spa & Wellness Day', description: 'Traditional Balinese massage and flower bath ritual.' },
        { day: 5, title: 'Transfer to Seminyak', description: 'Relocate to the coast for beach clubs and sunset views.' },
        { day: 6, title: 'Uluwatu & Kecak Dance', description: 'Clifftop temple visit followed by a traditional fire dance performance.' },
        { day: 7, title: 'Departure', description: 'Free morning before transfer to the airport.' }
      ]
    },
    {
      id: 'pkg-05',
      title: 'Inca Trail to Machu Picchu',
      destination: 'Cusco, Peru',
      image: '/assets/images/destinations/cusco.webp',
      gallery: [
        '/assets/images/gallery/cusco-01.webp',
        '/assets/images/gallery/cusco-02.webp',
        '/assets/images/gallery/cusco-03.webp',
        '/assets/images/gallery/cusco-04.webp'
      ],
      duration: { days: 8, nights: 7 },
      price: 215000,
      rating: 4.9,
      description: 'Eight days culminating in a sunrise entry to Machu Picchu after three days on the classic Inca Trail, with acclimatization time in Cusco and a full Sacred Valley tour. The definitive Peru trek, permits and guide included.',
      inclusions: ['Round-trip Flights', '7 Nights Accommodation', 'Daily Breakfast', 'Trekking Permits & Guide', 'Machu Picchu Entry'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Porter & Guide Gratuities'],
      itinerary: [
        { day: 1, title: 'Arrival in Cusco', description: 'Acclimatize to the altitude and explore the Plaza de Armas.' },
        { day: 2, title: 'Sacred Valley', description: 'Visit Pisac market and the Ollantaytambo ruins.' },
        { day: 3, title: 'Inca Trail: Day 1', description: 'Begin trekking through cloud forest and Inca ruins.' },
        { day: 4, title: 'Inca Trail: Day 2', description: 'Cross Dead Woman’s Pass, the trail’s highest point.' },
        { day: 5, title: 'Inca Trail: Day 3', description: 'Descend through remote ruins toward the Sun Gate.' },
        { day: 6, title: 'Machu Picchu Sunrise', description: 'Enter the citadel at dawn with a guided tour.' },
        { day: 7, title: 'Return to Cusco', description: 'Train back to Cusco, free evening to explore.' },
        { day: 8, title: 'Departure', description: 'Transfer to the airport for departure.' }
      ]
    },
    {
      id: 'pkg-06',
      title: 'Paris Romance Getaway',
      destination: 'Paris, France',
      image: '/assets/images/destinations/paris.webp',
      gallery: [
        '/assets/images/gallery/paris-01.webp',
        '/assets/images/gallery/paris-02.webp',
        '/assets/images/gallery/paris-03.webp',
        '/assets/images/gallery/paris-04.webp'
      ],
      duration: { days: 5, nights: 4 },
      price: 128000,
      rating: 4.6,
      description: 'Five days centered on the Louvre, Montmartre, and a Seine river cruise at sunset, with a day trip to Versailles. Compact enough for a long weekend, full enough to feel like Paris.',
      inclusions: ['Round-trip Flights', '4 Nights Accommodation', 'Daily Breakfast', 'Seine River Cruise', 'Louvre Skip-the-Line Tickets'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Versailles Audio Guide (optional)'],
      itinerary: [
        { day: 1, title: 'Arrival in Paris', description: 'Check in near the Champs-Élysées, evening at the Eiffel Tower.' },
        { day: 2, title: 'The Louvre & Tuileries', description: 'Skip-the-line tour of the Louvre followed by a stroll through the gardens.' },
        { day: 3, title: 'Montmartre & Seine Cruise', description: 'Explore the artist quarter, then cruise the Seine at sunset.' },
        { day: 4, title: 'Versailles Day Trip', description: 'Tour the Palace of Versailles and its gardens.' },
        { day: 5, title: 'Departure', description: 'Final morning of shopping before transfer to the airport.' }
      ]
    },
    {
      id: 'pkg-07',
      title: 'Maldives Overwater Escape',
      destination: 'Maldives',
      image: '/assets/images/destinations/maldives.webp',
      gallery: [
        '/assets/images/gallery/maldives-01.webp',
        '/assets/images/gallery/maldives-02.webp',
        '/assets/images/gallery/maldives-03.webp',
        '/assets/images/gallery/maldives-04.webp'
      ],
      duration: { days: 6, nights: 5 },
      price: 245000,
      rating: 4.9,
      description: 'Six days in a private-island water villa, with a seaplane transfer, reef snorkeling, and a sunset dolphin cruise included. All-inclusive dining means the only real decision is which lagoon to swim in first.',
      inclusions: ['Round-trip Flights', '5 Nights Water Villa', 'All-Inclusive Dining', 'Seaplane Transfers', 'Sunset Dolphin Cruise'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Premium Alcoholic Beverages', 'Motorized Water Sports'],
      itinerary: [
        { day: 1, title: 'Arrival & Seaplane Transfer', description: 'Scenic seaplane flight to your private island resort.' },
        { day: 2, title: 'Reef Snorkeling', description: 'Guided snorkel with resident reef sharks and tropical fish.' },
        { day: 3, title: 'Sunset Dolphin Cruise', description: 'Watch spinner dolphins play as the sun sets over the atoll.' },
        { day: 4, title: 'Spa & Sandbank Picnic', description: 'Private overwater spa treatment and a picnic on a sandbank.' },
        { day: 5, title: 'Leisure Day', description: 'Free day for water sports or simply relaxing over the lagoon.' },
        { day: 6, title: 'Departure', description: 'Seaplane transfer back to Male for your flight home.' }
      ]
    },
    {
      id: 'pkg-08',
      title: 'Queenstown Thrill Seeker',
      destination: 'Queenstown, New Zealand',
      image: '/assets/images/destinations/queenstown.webp',
      gallery: [
        '/assets/images/gallery/queenstown-01.webp',
        '/assets/images/gallery/queenstown-02.webp',
        '/assets/images/gallery/queenstown-03.webp',
        '/assets/images/gallery/queenstown-04.webp'
      ],
      duration: { days: 7, nights: 6 },
      price: 198000,
      rating: 4.7,
      description: 'Seven days built around bungee jumping, jet boating, and a full-day Milford Sound cruise, with a wine trail and Lord of the Rings filming locations for slower moments. New Zealand’s adventure capital, covered properly.',
      inclusions: ['Round-trip Flights', '6 Nights Accommodation', 'Daily Breakfast', 'Bungee Jump', 'Milford Sound Cruise'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Bungee Jump Photo & Video Package'],
      itinerary: [
        { day: 1, title: 'Arrival in Queenstown', description: 'Settle in lakeside beneath the Remarkables mountain range.' },
        { day: 2, title: 'Kawarau Bridge Bungee', description: 'Leap from the birthplace of commercial bungee jumping.' },
        { day: 3, title: 'Shotover Jet & Skyline Gondola', description: 'High-speed canyon jet boating followed by gondola views over the lake.' },
        { day: 4, title: 'Milford Sound Cruise', description: 'Full-day scenic drive and cruise through the fiord.' },
        { day: 5, title: 'Glenorchy & Lord of the Rings Trail', description: 'Explore the filming locations around Paradise and Glenorchy.' },
        { day: 6, title: 'Wine Trail in Gibbston Valley', description: 'Tasting tour through the region’s renowned vineyards.' },
        { day: 7, title: 'Departure', description: 'Free morning before transfer to the airport.' }
      ]
    },
    {
      id: 'pkg-09',
      title: 'Banff Rockies Explorer',
      destination: 'Banff, Canada',
      image: '/assets/images/destinations/banff.webp',
      gallery: [
        '/assets/images/gallery/banff-01.webp',
        '/assets/images/gallery/banff-02.webp',
        '/assets/images/gallery/banff-03.webp',
        '/assets/images/gallery/banff-04.webp'
      ],
      duration: { days: 6, nights: 5 },
      price: 172000,
      rating: 4.7,
      description: 'Six days threading through Lake Louise, the Icefields Parkway, and a guided wildlife safari, based from a mountain lodge in Banff. Built for glacial lakes, big peaks, and a real shot at spotting elk or bears.',
      inclusions: ['Round-trip Flights', '5 Nights Accommodation', 'Daily Breakfast', 'Lake Louise Canoe Tour', 'Wildlife Safari'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Wildlife Safari Optional Add-ons'],
      itinerary: [
        { day: 1, title: 'Arrival in Banff', description: 'Check into your mountain lodge and explore the town center.' },
        { day: 2, title: 'Lake Louise & Moraine Lake', description: 'Canoe on turquoise glacial waters framed by peaks.' },
        { day: 3, title: 'Icefields Parkway', description: 'Scenic drive to the Columbia Icefield with a glacier walk.' },
        { day: 4, title: 'Wildlife Safari', description: 'Guided safari in search of elk, bighorn sheep, and if lucky, bears.' },
        { day: 5, title: 'Sulphur Mountain Gondola', description: 'Ride to the summit for panoramic views of the Bow Valley.' },
        { day: 6, title: 'Departure', description: 'Transfer to Calgary for your flight home.' }
      ]
    },
    {
      id: 'pkg-10',
      title: 'Dubai Desert & Skyline',
      destination: 'Dubai, UAE',
      image: '/assets/images/destinations/dubai.webp',
      gallery: [
        '/assets/images/gallery/dubai-01.webp',
        '/assets/images/gallery/dubai-02.webp',
        '/assets/images/gallery/dubai-03.webp',
        '/assets/images/gallery/dubai-04.webp'
      ],
      duration: { days: 5, nights: 4 },
      price: 96000,
      rating: 4.6,
      description: 'Five days pairing Burj Khalifa and downtown Dubai with a dune-bashing desert safari and a BBQ dinner under the stars, plus a dhow cruise along the Marina. Skyline by day, desert by night.',
      inclusions: ['Round-trip Flights', '4 Nights Accommodation', 'Daily Breakfast', 'Desert Safari with BBQ Dinner', 'Burj Khalifa Tickets'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Optional Yacht or Helicopter Add-ons'],
      itinerary: [
        { day: 1, title: 'Arrival in Dubai', description: 'Check in and enjoy skyline views from your hotel.' },
        { day: 2, title: 'Burj Khalifa & Downtown', description: 'Ascend the world’s tallest building, then browse the Dubai Mall.' },
        { day: 3, title: 'Desert Safari', description: 'Dune bashing, camel rides, and a BBQ dinner under the stars.' },
        { day: 4, title: 'Old Dubai & Marina Cruise', description: 'Explore the souks by abra boat, then a dhow cruise along the Marina.' },
        { day: 5, title: 'Departure', description: 'Final morning at leisure before transfer to the airport.' }
      ]
    },
    {
      id: 'pkg-11',
      title: 'Amalfi Coast Indulgence',
      destination: 'Amalfi Coast, Italy',
      image: '/assets/images/destinations/amalfi-coast.webp',
      gallery: [
        '/assets/images/gallery/amalfi-coast-01.webp',
        '/assets/images/gallery/amalfi-coast-02.webp',
        '/assets/images/gallery/amalfi-coast-03.webp',
        '/assets/images/gallery/amalfi-coast-04.webp'
      ],
      duration: { days: 6, nights: 5 },
      price: 156000,
      rating: 4.8,
      description: 'Six days along the coast from Sorrento, with a Capri boat tour, a hands-on pasta and limoncello cooking class, and the hilltop gardens of Ravello. Built around long lunches and longer views.',
      inclusions: ['Round-trip Flights', '5 Nights Accommodation', 'Daily Breakfast', 'Boat Tour to Capri', 'Cooking Class'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Limoncello Tasting Fees'],
      itinerary: [
        { day: 1, title: 'Arrival in Sorrento', description: 'Settle into your clifftop hotel overlooking the bay.' },
        { day: 2, title: 'Positano & Amalfi Town', description: 'Coastal drive through the region’s most photographed villages.' },
        { day: 3, title: 'Capri Boat Tour', description: 'Sail to Capri, visiting the Blue Grotto and the Faraglioni rocks.' },
        { day: 4, title: 'Cooking Class in Sorrento', description: 'Learn to make fresh pasta and limoncello with a local chef.' },
        { day: 5, title: 'Ravello & Villa Cimbrone', description: 'Explore the hilltop gardens with sweeping coastal views.' },
        { day: 6, title: 'Departure', description: 'Transfer to Naples for your flight home.' }
      ]
    },
    {
      id: 'pkg-12',
      title: 'Iceland Northern Lights Chase',
      destination: 'Reykjavik, Iceland',
      image: '/assets/images/destinations/reykjavik.webp',
      gallery: [
        '/assets/images/gallery/reykjavik-01.webp',
        '/assets/images/gallery/reykjavik-02.webp',
        '/assets/images/gallery/reykjavik-03.webp',
        '/assets/images/gallery/reykjavik-04.webp'
      ],
      duration: { days: 6, nights: 5 },
      price: 182000,
      rating: 4.8,
      description: 'Six days circling the Golden Circle, a glacier lagoon, and the black-sand coast, with the Blue Lagoon on arrival and a dedicated evening excursion to chase the aurora. Iceland’s greatest hits, timed for the lights.',
      inclusions: ['Round-trip Flights', '5 Nights Accommodation', 'Daily Breakfast', 'Golden Circle Tour', 'Blue Lagoon Entry', 'Northern Lights Excursion'],
      exclusions: ['International Airfare Taxes & Surcharges', 'Travel Insurance', 'Personal Expenses & Shopping', 'Meals Not Mentioned in Inclusions', 'Northern Lights Photography Package'],
      itinerary: [
        { day: 1, title: 'Arrival & Blue Lagoon', description: 'Land in Reykjavik and unwind in the geothermal waters of the Blue Lagoon.' },
        { day: 2, title: 'Golden Circle Tour', description: 'Visit Thingvellir National Park, Geysir, and Gullfoss waterfall.' },
        { day: 3, title: 'South Coast & Black Sand Beach', description: 'Explore Seljalandsfoss waterfall and the black sands of Reynisfjara.' },
        { day: 4, title: 'Glacier Lagoon', description: 'Boat tour among the icebergs of Jökulsárlón.' },
        { day: 5, title: 'Northern Lights Hunt', description: 'Evening excursion away from city lights to chase the aurora.' },
        { day: 6, title: 'Departure', description: 'Final morning in Reykjavik before transfer to the airport.' }
      ]
    }
  ];

  // ---- Tours ----
  var tours = [
    {
      id: 'tur-01',
      title: 'Santorini Sunset Photography Tour',
      theme: 'Photography',
      destination: 'Santorini, Greece',
      image: '/assets/images/tours/santorini-sunset-photography-tour.webp',
      duration: '4 Days',
      groupSize: 'Max 8',
      price: 62000,
      rating: 4.9,
      highlights: ['Golden-hour shoots in Oia', 'Blue-domed church compositions', 'Professional photography guide', 'Small group of 8']
    },
    {
      id: 'tur-02',
      title: 'Kyoto Zen & Culture Immersion',
      theme: 'Cultural Heritage',
      destination: 'Kyoto, Japan',
      image: '/assets/images/tours/kyoto-zen-culture-immersion.webp',
      duration: '5 Days',
      groupSize: 'Max 10',
      price: 78000,
      rating: 4.8,
      highlights: ['Meditation with Zen monks', 'Traditional tea ceremony', 'Kimono walking tour', 'Local artisan workshops']
    },
    {
      id: 'tur-03',
      title: 'Swiss Alps Trekking Expedition',
      theme: 'Trekking',
      destination: 'Zermatt, Switzerland',
      image: '/assets/images/tours/swiss-alps-trekking-expedition.webp',
      duration: '6 Days',
      groupSize: 'Max 12',
      price: 132000,
      rating: 4.7,
      highlights: ['Five Lakes hiking trail', 'Glacier Paradise viewpoint', 'Mountain hut overnight', 'Expert alpine guide']
    },
    {
      id: 'tur-04',
      title: 'Bali Wellness & Yoga Journey',
      theme: 'Wellness',
      destination: 'Bali, Indonesia',
      image: '/assets/images/tours/bali-wellness-yoga-journey.webp',
      duration: '5 Days',
      groupSize: 'Max 10',
      price: 58000,
      rating: 4.8,
      highlights: ['Sunrise yoga in Ubud', 'Traditional Balinese healing ritual', 'Rice terrace trek', 'Farm-to-table organic meals']
    },
    {
      id: 'tur-05',
      title: 'Machu Picchu Trekking Trail',
      theme: 'Adventure',
      destination: 'Cusco, Peru',
      image: '/assets/images/tours/machu-picchu-trekking-trail.webp',
      duration: '7 Days',
      groupSize: 'Max 14',
      price: 168000,
      rating: 4.9,
      highlights: ['Classic Inca Trail trek', 'Sacred Valley exploration', 'Sunrise at Machu Picchu', 'Altitude acclimatization in Cusco']
    },
    {
      id: 'tur-06',
      title: 'Paris Culinary Discovery',
      theme: 'Culinary',
      destination: 'Paris, France',
      image: '/assets/images/tours/paris-culinary-discovery.webp',
      duration: '4 Days',
      groupSize: 'Max 8',
      price: 96000,
      rating: 4.7,
      highlights: ['Fine-dining tasting menu', 'Pastry-making class', 'Wine tasting in Montmartre', 'Market-to-table cooking session']
    },
    {
      id: 'tur-07',
      title: 'Maldives Marine Safari',
      theme: 'Nature',
      destination: 'Maldives',
      image: '/assets/images/tours/maldives-marine-safari.webp',
      duration: '5 Days',
      groupSize: 'Max 10',
      price: 148000,
      rating: 4.9,
      highlights: ['Manta ray snorkeling', 'Bioluminescent plankton night swim', 'Private sandbank picnic', 'Dolphin watching cruise']
    },
    {
      id: 'tur-08',
      title: 'Queenstown Adventure Rush',
      theme: 'Adventure',
      destination: 'Queenstown, New Zealand',
      image: '/assets/images/tours/queenstown-adventure-rush.webp',
      duration: '6 Days',
      groupSize: 'Max 12',
      price: 142000,
      rating: 4.6,
      highlights: ['Bungee jump at Kawarau Bridge', 'Shotover Jet boat ride', 'Skydive over Lake Wakatipu', 'Milford Sound day trip']
    },
    {
      id: 'tur-09',
      title: 'Banff Wildlife & Nature Tour',
      theme: 'Wildlife',
      destination: 'Banff, Canada',
      image: '/assets/images/tours/banff-wildlife-nature-tour.webp',
      duration: '5 Days',
      groupSize: 'Max 10',
      price: 118000,
      rating: 4.7,
      highlights: ['Grizzly bear viewing gondola', 'Moraine Lake canoe paddle', 'Icefields Parkway drive', 'Wildlife photography walk']
    },
    {
      id: 'tur-10',
      title: 'Dubai Luxury Desert Escape',
      theme: 'Luxury',
      destination: 'Dubai, UAE',
      image: '/assets/images/tours/dubai-luxury-desert-escape.webp',
      duration: '4 Days',
      groupSize: 'Max 8',
      price: 88000,
      rating: 4.8,
      highlights: ['Private dune dinner under the stars', 'Falconry experience', 'Luxury yacht cruise', 'VIP Burj Khalifa access']
    },
    {
      id: 'tur-11',
      title: 'Amalfi Coast Sailing Tour',
      theme: 'Cruise',
      destination: 'Amalfi Coast, Italy',
      image: '/assets/images/tours/amalfi-coast-sailing-tour.webp',
      duration: '5 Days',
      groupSize: 'Max 10',
      price: 122000,
      rating: 4.9,
      highlights: ['Private sailboat to Capri', 'Limoncello tasting in Sorrento', 'Coastal village hopping', 'Cliffside dinner in Positano']
    },
    {
      id: 'tur-12',
      title: 'Iceland Ring Road Explorer',
      theme: 'Nature',
      destination: 'Reykjavik, Iceland',
      image: '/assets/images/tours/iceland-ring-road-explorer.webp',
      duration: '7 Days',
      groupSize: 'Max 12',
      price: 158000,
      rating: 4.8,
      highlights: ['Northern Lights hunting', 'Glacier lagoon boat tour', 'Black sand beach at Vík', 'Golden Circle geysers']
    }
  ];

  // ---- Helpers ----
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  }

  function generateBookingId() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var id = '';
    for (var i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'VYR-' + id;
  }

  // hotels/tours store destination as a free-text string ("Dubai, UAE",
  // "Maldives") that doesn't always match `name + ', ' + country` exactly
  // (abbreviations, country-as-destination cases) — matching on the
  // destination name as a prefix, same convention as destination-detail.js's
  // belongsToDestination(). Returns undefined if no destination matches.
  function findDestinationId(destinationText) {
    var match = destinations.filter(function (d) {
      return destinationText.indexOf(d.name) === 0;
    })[0];
    return match ? match.id : undefined;
  }

  // Every image/gallery path above is written root-absolute ("/assets/...")
  // for readability, but this file is loaded from both the site root
  // (index.html) and one level down (pages/*.html) — a single hardcoded
  // relative prefix can't serve both, and root-absolute paths break on
  // GitHub Pages project sites (served at /repo-name/, not the domain
  // root). Rewriting the leading "/" with utils.js's runtime-detected
  // ROOT_PATH here fixes every image on every page in one place.
  var ROOT_PATH = (window.StacklyUtils && window.StacklyUtils.ROOT_PATH) || '';

  function fixPath(path) {
    return path && path.charAt(0) === '/' ? ROOT_PATH + path.slice(1) : path;
  }

  [destinations, hotels, tours, packages].forEach(function (list) {
    list.forEach(function (item) {
      if (item.image) item.image = fixPath(item.image);
      if (item.gallery) item.gallery = item.gallery.map(fixPath);
    });
  });

  window.StacklyData = {
    destinations: destinations,
    flights: flights,
    hotels: hotels,
    packages: packages,
    tours: tours,
    formatCurrency: formatCurrency,
    generateBookingId: generateBookingId,
    findDestinationId: findDestinationId
  };
})();
