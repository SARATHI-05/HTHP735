import React, { useState, useMemo } from 'react';

// Comprehensive Tamil Nadu District Geospatial Telemetry
export const TN_DISTRICTS_DATA = [
  // --- North / Coastal / Capital Region ---
  {
    id: 'chennai',
    name: 'Chennai',
    tamilName: 'சென்னை',
    zone: 'north',
    zoneName: 'Northern Metropolitan & Coastal',
    cx: 450,
    cy: 105,
    path: 'M 435 90 L 462 84 L 472 112 L 452 126 L 432 112 Z',
    riskScore: 94.2,
    status: 'Critical Alert',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    signalsCount: 22,
    reachEstimate: 245000,
    reachVelocity: '+32K/hr',
    topVector: 'Synthetic Audio / Voice Notes',
    vectorCategory: 'audio',
    vectorIcon: 'mic',
    containmentStatus: 'Escalated to Cyber Cell',
    containmentColor: 'text-red-500',
    activeClaimId: '#TN-8821',
    activeClaimTitle: 'Water reservoir contamination panic voice note in Red Hills / Chembarambakkam',
    activeClaimSnippet: 'Fake WhatsApp forward claiming drinking water supply in Chennai is contaminated with heavy metals.',
    authorityAdvisory: 'TWAD Board Advisory: Drinking water quality index certified optimal across all city treatment reservoirs.',
    vectorBreakdown: { audio: 55, video: 25, social: 15, text: 5 },
    population: '7.1 Million',
    headquarters: 'Chennai Central',
  },
  {
    id: 'thiruvallur',
    name: 'Thiruvallur',
    tamilName: 'திருவள்ளூர்',
    zone: 'north',
    zoneName: 'Northern Metropolitan & Coastal',
    cx: 410,
    cy: 78,
    path: 'M 375 58 L 438 52 L 462 84 L 435 90 L 418 108 L 372 98 L 368 76 Z',
    riskScore: 78.4,
    status: 'Elevated Risk',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    signalsCount: 8,
    reachEstimate: 88000,
    reachVelocity: '+9K/hr',
    topVector: 'Audio Voice Notes',
    vectorCategory: 'audio',
    vectorIcon: 'mic',
    containmentStatus: 'Under Active Triage',
    containmentColor: 'text-amber-500',
    activeClaimId: '#TN-8821',
    activeClaimTitle: 'Red Hills reservoir downstream overflow rumor',
    activeClaimSnippet: 'Spillover alerts falsely attributed to PWD engineers circulating in suburban resident associations.',
    authorityAdvisory: 'Thiruvallur District Collector: Dam shutters operating under standard regulated seasonal protocol.',
    vectorBreakdown: { audio: 45, video: 30, social: 15, text: 10 },
    population: '3.7 Million',
    headquarters: 'Thiruvallur',
  },
  {
    id: 'kanchipuram',
    name: 'Kanchipuram',
    tamilName: 'காஞ்சிபுரம்',
    zone: 'north',
    zoneName: 'Northern Metropolitan & Coastal',
    cx: 390,
    cy: 130,
    path: 'M 368 98 L 418 108 L 432 112 L 420 148 L 378 152 L 358 132 Z',
    riskScore: 66.5,
    status: 'Moderate Alert',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    signalsCount: 6,
    reachEstimate: 52000,
    reachVelocity: '+6K/hr',
    topVector: 'Fabricated Circulars',
    vectorCategory: 'text',
    vectorIcon: 'description',
    containmentStatus: 'Advisory Dispatched',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0812',
    activeClaimTitle: 'Forged temple trust jewel valuation auction notice',
    activeClaimSnippet: 'Fabricated letterhead purporting sale of historical endowments causing public alarm.',
    authorityAdvisory: 'HR&CE Commissioner: Official audit certificates published online; legal action initiated under IT Act.',
    vectorBreakdown: { audio: 20, video: 20, social: 25, text: 35 },
    population: '1.2 Million',
    headquarters: 'Kanchipuram',
  },
  {
    id: 'chengalpattu',
    name: 'Chengalpattu',
    tamilName: 'செங்கல்பட்டு',
    zone: 'north',
    zoneName: 'Northern Metropolitan & Coastal',
    cx: 440,
    cy: 155,
    path: 'M 420 148 L 452 126 L 472 112 L 468 174 L 430 178 L 414 158 Z',
    riskScore: 62.0,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 5,
    reachEstimate: 41000,
    reachVelocity: '+4K/hr',
    topVector: 'Social Video Clips',
    vectorCategory: 'video',
    vectorIcon: 'videocam',
    containmentStatus: 'Monitoring',
    containmentColor: 'text-sky-500',
    activeClaimId: '#TN-0644',
    activeClaimTitle: 'GST toll gate boycott rumor on GST road corridor',
    activeClaimSnippet: 'Misattributed clip of protest in neighboring state presented as Paranur plaza confrontation.',
    authorityAdvisory: 'Chengalpattu Police: Traffic flow normal across all NH-45 toll plazas.',
    vectorBreakdown: { audio: 15, video: 45, social: 30, text: 10 },
    population: '2.5 Million',
    headquarters: 'Chengalpattu',
  },
  {
    id: 'ranipet',
    name: 'Ranipet',
    tamilName: 'ராணிப்பேட்டை',
    zone: 'north',
    zoneName: 'Northern Metropolitan & Coastal',
    cx: 345,
    cy: 105,
    path: 'M 320 85 L 368 76 L 375 98 L 358 132 L 322 124 Z',
    riskScore: 54.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 3,
    reachEstimate: 21000,
    reachVelocity: '+1K/hr',
    topVector: 'Messaging Forwards',
    vectorCategory: 'social',
    vectorIcon: 'share',
    containmentStatus: 'Contained',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0518',
    activeClaimTitle: 'Leather industrial effluent contamination rumor in Palar river',
    activeClaimSnippet: 'Recycled photograph of chemical foam falsely linked to recent municipal water pumps.',
    authorityAdvisory: 'TNPCB: Real-time sensor telemetry confirms effluent zero discharge parameters.',
    vectorBreakdown: { audio: 20, video: 20, social: 50, text: 10 },
    population: '1.2 Million',
    headquarters: 'Ranipet',
  },
  {
    id: 'vellore',
    name: 'Vellore',
    tamilName: 'வேலூர்',
    zone: 'north',
    zoneName: 'Northern Metropolitan & Coastal',
    cx: 302,
    cy: 120,
    path: 'M 288 98 L 320 85 L 322 124 L 302 144 L 278 128 Z',
    riskScore: 62.8,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 5,
    reachEstimate: 41000,
    reachVelocity: '+5K/hr',
    topVector: 'Medical Hoax Clips',
    vectorCategory: 'audio',
    vectorIcon: 'mic',
    containmentStatus: 'Advisory Dispatched',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-1210',
    activeClaimTitle: 'Fake institutional alert regarding epidemic outbreak near medical college',
    activeClaimSnippet: 'Forged hospital circular urging avoidance of public transport in Vellore town.',
    authorityAdvisory: 'CMC Vellore & Health Dept: No atypical pathogen surges registered; circular is completely fraudulent.',
    vectorBreakdown: { audio: 40, video: 20, social: 25, text: 15 },
    population: '1.6 Million',
    headquarters: 'Vellore',
  },
  {
    id: 'tirupattur',
    name: 'Tirupattur',
    tamilName: 'திருப்பத்தூர்',
    zone: 'north',
    zoneName: 'Northern Metropolitan & Coastal',
    cx: 275,
    cy: 142,
    path: 'M 252 118 L 288 98 L 302 144 L 282 164 L 248 148 Z',
    riskScore: 46.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 2,
    reachEstimate: 14000,
    reachVelocity: '0/hr',
    topVector: 'Local SMS Chain',
    vectorCategory: 'social',
    vectorIcon: 'share',
    containmentStatus: 'Stable',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0433',
    activeClaimTitle: 'Yelagiri hill road landslide hoax',
    activeClaimSnippet: 'Monsoon footage from Kerala misrepresented as current road blockage in Yelagiri ghat section.',
    authorityAdvisory: 'Highways Dept: All 14 hairpin bends fully open and clear for tourist transit.',
    vectorBreakdown: { audio: 10, video: 50, social: 30, text: 10 },
    population: '1.1 Million',
    headquarters: 'Tirupattur',
  },

  // --- Western Agro-Industrial Hub ---
  {
    id: 'krishnagiri',
    name: 'Krishnagiri',
    tamilName: 'கிருஷ்ணகிரி',
    zone: 'west',
    zoneName: 'Western Agro-Industrial Hub',
    cx: 232,
    cy: 125,
    path: 'M 208 92 L 258 88 L 252 118 L 248 148 L 218 158 L 202 128 Z',
    riskScore: 51.0,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 3,
    reachEstimate: 19000,
    reachVelocity: '+1K/hr',
    topVector: 'Mango Export Price Hoax',
    vectorCategory: 'text',
    vectorIcon: 'description',
    containmentStatus: 'Monitoring',
    containmentColor: 'text-sky-500',
    activeClaimId: '#TN-0422',
    activeClaimTitle: 'Pochampalli mandi shutdown misinformation',
    activeClaimSnippet: 'False price fixation flyer encouraging farmers to dump fruit stock.',
    authorityAdvisory: 'Agricultural Marketing Board: Mandi operations active with MSP benchmark guarantees.',
    vectorBreakdown: { audio: 20, video: 15, social: 35, text: 30 },
    population: '1.8 Million',
    headquarters: 'Krishnagiri',
  },
  {
    id: 'dharmapuri',
    name: 'Dharmapuri',
    tamilName: 'தர்மபுரி',
    zone: 'west',
    zoneName: 'Western Agro-Industrial Hub',
    cx: 242,
    cy: 182,
    path: 'M 202 158 L 248 148 L 282 164 L 268 204 L 218 214 L 192 184 Z',
    riskScore: 58.2,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 4,
    reachEstimate: 29000,
    reachVelocity: '+3K/hr',
    topVector: 'Water Allocation Audio',
    vectorCategory: 'audio',
    vectorIcon: 'mic',
    containmentStatus: 'Active Triage',
    containmentColor: 'text-amber-500',
    activeClaimId: '#TN-0988',
    activeClaimTitle: 'Hogenakkal drinking water fluoride level scare',
    activeClaimSnippet: 'Doctored lab report alleging filtration failure in Hogenakkal water treatment phase 1.',
    authorityAdvisory: 'TWAD Dharmapuri: Treated water conforms stringently to BIS 10500 standards.',
    vectorBreakdown: { audio: 50, video: 20, social: 20, text: 10 },
    population: '1.5 Million',
    headquarters: 'Dharmapuri',
  },
  {
    id: 'salem',
    name: 'Salem',
    tamilName: 'சேலம்',
    zone: 'west',
    zoneName: 'Western Agro-Industrial Hub',
    cx: 268,
    cy: 236,
    path: 'M 218 214 L 268 204 L 308 218 L 298 262 L 248 268 L 222 242 Z',
    riskScore: 68.4,
    status: 'Elevated Risk',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    signalsCount: 8,
    reachEstimate: 62000,
    reachVelocity: '+4K/hr',
    topVector: 'Ration Shop Lockdown Rumors',
    vectorCategory: 'social',
    vectorIcon: 'share',
    containmentStatus: 'Public Clarification Issued',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-5421',
    activeClaimTitle: 'Unverified panic rumors claiming lockdown of local ration shops in Salem district.',
    activeClaimSnippet: 'Essential food supply panic targeting working-class beneficiaries across 42 Fair Price shops.',
    authorityAdvisory: 'Civil Supplies Dept: Full rice and dal supplies dispatched; all 42 Fair Price shops operate on regular schedule.',
    vectorBreakdown: { audio: 35, video: 15, social: 40, text: 10 },
    population: '3.5 Million',
    headquarters: 'Salem City',
  },
  {
    id: 'erode',
    name: 'Erode',
    tamilName: 'ஈரோடு',
    zone: 'west',
    zoneName: 'Western Agro-Industrial Hub',
    cx: 198,
    cy: 248,
    path: 'M 172 214 L 218 214 L 222 242 L 232 282 L 188 278 L 162 244 Z',
    riskScore: 58.7,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 4,
    reachEstimate: 38000,
    reachVelocity: '+2K/hr',
    topVector: 'Text Meme Chain on Turmeric MSP',
    vectorCategory: 'text',
    vectorIcon: 'description',
    containmentStatus: 'Monitoring',
    containmentColor: 'text-sky-500',
    activeClaimId: '#TN-2150',
    activeClaimTitle: 'Turmeric market regulatory fee hike hoax',
    activeClaimSnippet: 'Fabricated circular claiming 18% export levy on Perundurai turmeric auction terminal.',
    authorityAdvisory: 'Erode Regulated Market Committee: No new levies imposed. Trading normal.',
    vectorBreakdown: { audio: 20, video: 10, social: 30, text: 40 },
    population: '2.3 Million',
    headquarters: 'Erode',
  },
  {
    id: 'namakkal',
    name: 'Namakkal',
    tamilName: 'நாமக்கல்',
    zone: 'west',
    zoneName: 'Western Agro-Industrial Hub',
    cx: 268,
    cy: 288,
    path: 'M 248 268 L 298 262 L 292 312 L 242 308 L 232 282 Z',
    riskScore: 52.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 3,
    reachEstimate: 22000,
    reachVelocity: '+1K/hr',
    topVector: 'Avian Flu Audio Note',
    vectorCategory: 'audio',
    vectorIcon: 'mic',
    containmentStatus: 'Advisory Dispatched',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0599',
    activeClaimTitle: 'Poultry ban fake audio alert in Namakkal poultry belt',
    activeClaimSnippet: 'Voice recording mimicking veterinary officer advising against egg consumption.',
    authorityAdvisory: 'Animal Husbandry Dept: Biosecurity random testing negative; poultry is 100% certified safe.',
    vectorBreakdown: { audio: 60, video: 10, social: 20, text: 10 },
    population: '1.7 Million',
    headquarters: 'Namakkal',
  },
  {
    id: 'nilgiris',
    name: 'Nilgiris',
    tamilName: 'நீலகிரி',
    zone: 'west',
    zoneName: 'Western Agro-Industrial Hub',
    cx: 118,
    cy: 236,
    path: 'M 88 218 L 142 204 L 158 244 L 118 264 L 82 244 Z',
    riskScore: 42.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 2,
    reachEstimate: 12000,
    reachVelocity: '0/hr',
    topVector: 'Wildlife Sighting Deepfake',
    vectorCategory: 'video',
    vectorIcon: 'videocam',
    containmentStatus: 'Contained',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0322',
    activeClaimTitle: 'Doctored leopard intrusion video on Ooty tourist road',
    activeClaimSnippet: 'Old video from Assam tea estate recirculated as current Ooty town hazard.',
    authorityAdvisory: 'Nilgiris Forest Division: Drone patrols verify zero wild predator intrusion in municipal area.',
    vectorBreakdown: { audio: 10, video: 70, social: 15, text: 5 },
    population: '0.7 Million',
    headquarters: 'Udhagamandalam (Ooty)',
  },
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    tamilName: 'கோயம்புத்தூர்',
    zone: 'west',
    zoneName: 'Western Agro-Industrial Hub',
    cx: 132,
    cy: 302,
    path: 'M 112 264 L 162 258 L 172 318 L 122 338 L 92 304 Z',
    riskScore: 85.0,
    status: 'Critical Alert',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    signalsCount: 12,
    reachEstimate: 220000,
    reachVelocity: '+18K/hr',
    topVector: 'Messaging App Broadcasts (Agri loan waiver)',
    vectorCategory: 'social',
    vectorIcon: 'share',
    containmentStatus: 'Under Active Investigation',
    containmentColor: 'text-red-500',
    activeClaimId: 'CLM-5017',
    activeClaimTitle: 'False agricultural loan waiver broadcast spreading rapidly across rural farming communities.',
    activeClaimSnippet: 'High viral reach across farming communities claiming unconditional cooperative credit write-offs.',
    authorityAdvisory: 'TN Dept of Agriculture: No universal loan waiver circular exists. Direct verification via cooperative branches.',
    vectorBreakdown: { audio: 30, video: 20, social: 45, text: 5 },
    population: '3.5 Million',
    headquarters: 'Coimbatore City',
  },
  {
    id: 'tiruppur',
    name: 'Tiruppur',
    tamilName: 'திருப்பூர்',
    zone: 'west',
    zoneName: 'Western Agro-Industrial Hub',
    cx: 190,
    cy: 292,
    path: 'M 162 258 L 208 258 L 212 322 L 172 318 Z',
    riskScore: 58.0,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 4,
    reachEstimate: 36000,
    reachVelocity: '+2K/hr',
    topVector: 'Garment Unit Strike Hoax',
    vectorCategory: 'social',
    vectorIcon: 'share',
    containmentStatus: 'Monitoring',
    containmentColor: 'text-sky-500',
    activeClaimId: '#TN-1180',
    activeClaimTitle: 'Migrant worker mass exodus rumor in textile export cluster',
    activeClaimSnippet: 'Stitched audio claiming factory shutdowns in Palladam garment belt.',
    authorityAdvisory: 'Tiruppur City Police: Full workforce attendance verified; rumor mongers under cyber investigation.',
    vectorBreakdown: { audio: 35, video: 15, social: 40, text: 10 },
    population: '2.5 Million',
    headquarters: 'Tiruppur',
  },

  // --- Central Cauvery Delta ---
  {
    id: 'karur',
    name: 'Karur',
    tamilName: 'கரூர்',
    zone: 'delta',
    zoneName: 'Central Cauvery Delta & Basin',
    cx: 255,
    cy: 318,
    path: 'M 232 282 L 282 292 L 278 342 L 228 338 L 218 308 Z',
    riskScore: 50.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 3,
    reachEstimate: 18000,
    reachVelocity: '+1K/hr',
    topVector: 'Mosquito Fogging Chemical Hoax',
    vectorCategory: 'text',
    vectorIcon: 'description',
    containmentStatus: 'Contained',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0344',
    activeClaimTitle: 'Toxic municipal vector spraying rumor',
    activeClaimSnippet: 'Misattributed domestic chemical warning attributed to Karur municipal sanitary inspector.',
    authorityAdvisory: 'Karur Municipality: Fogging uses WHO-certified bio-safe pyrethrum formulation.',
    vectorBreakdown: { audio: 20, video: 10, social: 30, text: 40 },
    population: '1.1 Million',
    headquarters: 'Karur',
  },
  {
    id: 'tiruchirappalli',
    name: 'Tiruchirappalli',
    tamilName: 'திருச்சிராப்பள்ளி',
    zone: 'delta',
    zoneName: 'Central Cauvery Delta & Basin',
    cx: 318,
    cy: 325,
    path: 'M 282 292 L 342 278 L 358 332 L 298 352 L 278 342 Z',
    riskScore: 72.1,
    status: 'High Alert',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    signalsCount: 7,
    reachEstimate: 78000,
    reachVelocity: '+9K/hr',
    topVector: 'Fabricated Exam Postponement Circular',
    vectorCategory: 'text',
    vectorIcon: 'description',
    containmentStatus: 'Under Active Triage',
    containmentColor: 'text-amber-500',
    activeClaimId: '#TN-4112',
    activeClaimTitle: 'Forged university semester timetable cancellation circular',
    activeClaimSnippet: 'Fake university stamp and vice-chancellor signature claiming engineering exams deferred.',
    authorityAdvisory: 'Anna University & Bharathidasan University: Exam schedule remains unchanged; verified timetable at official portal.',
    vectorBreakdown: { audio: 15, video: 20, social: 30, text: 35 },
    population: '2.7 Million',
    headquarters: 'Tiruchirappalli (Trichy)',
  },
  {
    id: 'perambalur',
    name: 'Perambalur',
    tamilName: 'பெரம்பலூர்',
    zone: 'delta',
    zoneName: 'Central Cauvery Delta & Basin',
    cx: 328,
    cy: 260,
    path: 'M 302 238 L 352 242 L 342 278 L 298 272 Z',
    riskScore: 44.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 2,
    reachEstimate: 11000,
    reachVelocity: '0/hr',
    topVector: 'Fertilizer Quota Alert',
    vectorCategory: 'social',
    vectorIcon: 'share',
    containmentStatus: 'Stable',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0299',
    activeClaimTitle: 'Urea distribution shortage rumor',
    activeClaimSnippet: 'Fake PACCS cooperative memo circulating among cotton growers.',
    authorityAdvisory: 'Dept of Agriculture: Adequate buffer fertilizer stocks maintained at all block storage depots.',
    vectorBreakdown: { audio: 20, video: 10, social: 50, text: 20 },
    population: '0.6 Million',
    headquarters: 'Perambalur',
  },
  {
    id: 'ariyalur',
    name: 'Ariyalur',
    tamilName: 'அரியலூர்',
    zone: 'delta',
    zoneName: 'Central Cauvery Delta & Basin',
    cx: 375,
    cy: 265,
    path: 'M 352 242 L 402 238 L 392 282 L 342 278 Z',
    riskScore: 46.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 2,
    reachEstimate: 13000,
    reachVelocity: '0/hr',
    topVector: 'Cement Plant Emission Hoax',
    vectorCategory: 'video',
    vectorIcon: 'videocam',
    containmentStatus: 'Contained',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0305',
    activeClaimTitle: 'Limestone quarry blast structural damage fake claim',
    activeClaimSnippet: 'Structural cracks in old school building falsely blamed on regulated mining quarry.',
    authorityAdvisory: 'Mines Dept: Seismographic readings confirm blast vibrations within safe regulatory tolerances.',
    vectorBreakdown: { audio: 10, video: 60, social: 20, text: 10 },
    population: '0.8 Million',
    headquarters: 'Ariyalur',
  },
  {
    id: 'thanjavur',
    name: 'Thanjavur',
    tamilName: 'தஞ்சாவூர்',
    zone: 'delta',
    zoneName: 'Central Cauvery Delta & Basin',
    cx: 388,
    cy: 350,
    path: 'M 358 332 L 418 308 L 432 362 L 372 382 L 352 348 Z',
    riskScore: 54.2,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 4,
    reachEstimate: 31000,
    reachVelocity: '+1K/hr',
    topVector: 'Doctored Cyclonic Weather Alert',
    vectorCategory: 'video',
    vectorIcon: 'videocam',
    containmentStatus: 'Advisory Dispatched',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-1402',
    activeClaimTitle: 'Panic bulletin regarding unseasonal Cauvery river breaches',
    activeClaimSnippet: 'Edited news anchor broadcast falsely declaring red alert across delta paddy fields.',
    authorityAdvisory: 'IMD & Collectorate: Cauvery delta experiencing calm weather. No flood warning issued.',
    vectorBreakdown: { audio: 25, video: 40, social: 25, text: 10 },
    population: '2.4 Million',
    headquarters: 'Thanjavur',
  },
  {
    id: 'cuddalore',
    name: 'Cuddalore',
    tamilName: 'கடலூர்',
    zone: 'delta',
    zoneName: 'Central Cauvery Delta & Basin',
    cx: 430,
    cy: 220,
    path: 'M 412 208 L 462 168 L 472 238 L 422 252 L 392 232 Z',
    riskScore: 59.0,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 3,
    reachEstimate: 24000,
    reachVelocity: '+2K/hr',
    topVector: 'Tsunami Panic Voice Note',
    vectorCategory: 'audio',
    vectorIcon: 'mic',
    containmentStatus: 'Advisory Dispatched',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0740',
    activeClaimTitle: 'Coastal warning siren rumor in Silver Beach coastal villages',
    activeClaimSnippet: 'Voice clip urging fishermen evacuation based on fabricated INCOIS bulletin.',
    authorityAdvisory: 'Fisheries Dept: Coastal sea state normal; INCOIS confirms zero seismic or tidal anomaly.',
    vectorBreakdown: { audio: 50, video: 20, social: 20, text: 10 },
    population: '2.6 Million',
    headquarters: 'Cuddalore',
  },
  {
    id: 'mayiladuthurai',
    name: 'Mayiladuthurai',
    tamilName: 'மயிலாடுதுறை',
    zone: 'delta',
    zoneName: 'Central Cauvery Delta & Basin',
    cx: 452,
    cy: 275,
    path: 'M 422 252 L 472 248 L 482 292 L 438 292 Z',
    riskScore: 48.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 2,
    reachEstimate: 15000,
    reachVelocity: '0/hr',
    topVector: 'Fishermen Detainment Fake Clip',
    vectorCategory: 'video',
    vectorIcon: 'videocam',
    containmentStatus: 'Contained',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0318',
    activeClaimTitle: 'Poompuhar coast boat seizure misinformation',
    activeClaimSnippet: 'Archival video of Sri Lankan navy patrol presented as yesterday incident.',
    authorityAdvisory: 'Coast Guard: All registered mechanized trawlers accounted for safely in harbor.',
    vectorBreakdown: { audio: 15, video: 60, social: 20, text: 5 },
    population: '0.9 Million',
    headquarters: 'Mayiladuthurai',
  },
  {
    id: 'tiruvarur',
    name: 'Tiruvarur',
    tamilName: 'திருவாரூர்',
    zone: 'delta',
    zoneName: 'Central Cauvery Delta & Basin',
    cx: 445,
    cy: 338,
    path: 'M 422 308 L 462 308 L 468 362 L 428 362 Z',
    riskScore: 51.0,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 3,
    reachEstimate: 19000,
    reachVelocity: '+1K/hr',
    topVector: 'Direct Procurement Center Strike Hoax',
    vectorCategory: 'social',
    vectorIcon: 'share',
    containmentStatus: 'Monitoring',
    containmentColor: 'text-sky-500',
    activeClaimId: '#TN-0482',
    activeClaimTitle: 'Paddy moisture deduction dispute rumor',
    activeClaimSnippet: 'False WhatsApp claim that DPCs stopped grain procurement across Tiruvarur district.',
    authorityAdvisory: 'TNCSC: All 120 DPCs active and procuring daily at standard MSP tariffs.',
    vectorBreakdown: { audio: 30, video: 20, social: 35, text: 15 },
    population: '1.3 Million',
    headquarters: 'Tiruvarur',
  },
  {
    id: 'nagapattinam',
    name: 'Nagapattinam',
    tamilName: 'நாகப்பட்டினம்',
    zone: 'delta',
    zoneName: 'Central Cauvery Delta & Basin',
    cx: 478,
    cy: 345,
    path: 'M 462 308 L 488 298 L 492 378 L 462 372 Z',
    riskScore: 49.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 2,
    reachEstimate: 16000,
    reachVelocity: '0/hr',
    topVector: 'Ferry Service Suspension Hoax',
    vectorCategory: 'text',
    vectorIcon: 'description',
    containmentStatus: 'Contained',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0284',
    activeClaimTitle: 'Nagapattinam - Kankesanthurai ferry cancellation notice',
    activeClaimSnippet: 'Altered circular claiming passenger vessel grounded indefinitely.',
    authorityAdvisory: 'Port Officer: Passenger vessel operating on schedule; tickets available at counter.',
    vectorBreakdown: { audio: 20, video: 20, social: 20, text: 40 },
    population: '0.7 Million',
    headquarters: 'Nagapattinam',
  },
  {
    id: 'pudukkottai',
    name: 'Pudukkottai',
    tamilName: 'புதுக்கோட்டை',
    zone: 'delta',
    zoneName: 'Central Cauvery Delta & Basin',
    cx: 335,
    cy: 388,
    path: 'M 298 352 L 362 348 L 372 412 L 312 422 L 292 382 Z',
    riskScore: 47.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 2,
    reachEstimate: 14000,
    reachVelocity: '0/hr',
    topVector: 'Historical Fort Excavation Rumor',
    vectorCategory: 'social',
    vectorIcon: 'share',
    containmentStatus: 'Stable',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0266',
    activeClaimTitle: 'Treasure trove excavation hoax at Thirumayam fort',
    activeClaimSnippet: 'Doctored reel claiming archaeological gold artifacts seized by local police.',
    authorityAdvisory: 'ASI Chennai Circle: Regulated conservation maintenance in progress; rumor is baseless.',
    vectorBreakdown: { audio: 15, video: 50, social: 30, text: 5 },
    population: '1.6 Million',
    headquarters: 'Pudukkottai',
  },

  // --- Southern Cultural & Inland ---
  {
    id: 'dindigul',
    name: 'Dindigul',
    tamilName: 'திண்டுக்கல்',
    zone: 'south',
    zoneName: 'Southern Cultural & Inland Heartlands',
    cx: 205,
    cy: 368,
    path: 'M 172 318 L 228 338 L 242 402 L 178 392 L 158 348 Z',
    riskScore: 59.0,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 4,
    reachEstimate: 32000,
    reachVelocity: '+2K/hr',
    topVector: 'Kodaikanal Ghat Travel Ban Hoax',
    vectorCategory: 'social',
    vectorIcon: 'share',
    containmentStatus: 'Advisory Dispatched',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0612',
    activeClaimTitle: 'E-pass mandatory travel lockdown rumor for Kodaikanal tourists',
    activeClaimSnippet: 'Fake municipal commissioner decree causing hotel reservation cancellations.',
    authorityAdvisory: 'District Collector: Normal vehicular entry permitted with standard online green fee.',
    vectorBreakdown: { audio: 25, video: 20, social: 45, text: 10 },
    population: '2.2 Million',
    headquarters: 'Dindigul',
  },
  {
    id: 'theni',
    name: 'Theni',
    tamilName: 'தேனி',
    zone: 'south',
    zoneName: 'Southern Cultural & Inland Heartlands',
    cx: 150,
    cy: 408,
    path: 'M 128 378 L 178 372 L 182 432 L 132 438 L 112 398 Z',
    riskScore: 53.0,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 3,
    reachEstimate: 21000,
    reachVelocity: '+1K/hr',
    topVector: 'Mullaperiyar Dam Shutter Panic Audio',
    vectorCategory: 'audio',
    vectorIcon: 'mic',
    containmentStatus: 'Monitoring',
    containmentColor: 'text-sky-500',
    activeClaimId: '#TN-0544',
    activeClaimTitle: 'Fabricated dam water level emergency bulletin',
    activeClaimSnippet: 'Voice recording claiming midnight release into Periyar river basin.',
    authorityAdvisory: 'PWD Theni: Reservoir level at 136.2 ft; continuous monitored discharge within safety envelope.',
    vectorBreakdown: { audio: 65, video: 15, social: 15, text: 5 },
    population: '1.2 Million',
    headquarters: 'Theni',
  },
  {
    id: 'madurai',
    name: 'Madurai',
    tamilName: 'மதுரை',
    zone: 'south',
    zoneName: 'Southern Cultural & Inland Heartlands',
    cx: 228,
    cy: 432,
    path: 'M 182 392 L 252 402 L 262 462 L 192 462 L 178 432 Z',
    riskScore: 88.5,
    status: 'Critical Alert',
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    signalsCount: 14,
    reachEstimate: 180000,
    reachVelocity: '+24K/hr',
    topVector: 'Manipulated Video & Deepfakes',
    vectorCategory: 'video',
    vectorIcon: 'videocam',
    containmentStatus: 'Escalated to Cyber Cell',
    containmentColor: 'text-red-500',
    activeClaimId: '#TN-7734',
    activeClaimTitle: 'Altered video showing police confrontation at Madurai political gathering.',
    activeClaimSnippet: 'Doctored political rally video manipulating biometric subsidy verification rules; spliced from 2021 crowd footage.',
    authorityAdvisory: 'Madurai Police Commissionerate: Audiovisual forensic spectrogram proves doctored audio overlay superimposed onto archival assembly.',
    vectorBreakdown: { audio: 20, video: 60, social: 15, text: 5 },
    population: '3.1 Million',
    headquarters: 'Madurai City',
  },
  {
    id: 'sivaganga',
    name: 'Sivaganga',
    tamilName: 'சிவகங்கை',
    zone: 'south',
    zoneName: 'Southern Cultural & Inland Heartlands',
    cx: 310,
    cy: 442,
    path: 'M 262 402 L 342 412 L 352 472 L 272 468 Z',
    riskScore: 50.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 3,
    reachEstimate: 19000,
    reachVelocity: '+1K/hr',
    topVector: 'Keezhadi Archaeological Fake Relic',
    vectorCategory: 'video',
    vectorIcon: 'videocam',
    containmentStatus: 'Contained',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0377',
    activeClaimTitle: 'Altered photo of gold coin hoard near Keezhadi site',
    activeClaimSnippet: 'AI-generated image purporting secret treasure hoard concealed by state excavators.',
    authorityAdvisory: 'State Dept of Archaeology: All authentic artifact records cataloged publicly at Keezhadi Museum.',
    vectorBreakdown: { audio: 15, video: 55, social: 25, text: 5 },
    population: '1.4 Million',
    headquarters: 'Sivaganga',
  },
  {
    id: 'virudhunagar',
    name: 'Virudhunagar',
    tamilName: 'விருதுநகர்',
    zone: 'south',
    zoneName: 'Southern Cultural & Inland Heartlands',
    cx: 215,
    cy: 492,
    path: 'M 172 462 L 262 462 L 258 518 L 178 518 L 162 482 Z',
    riskScore: 67.0,
    status: 'Moderate Alert',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    signalsCount: 6,
    reachEstimate: 51000,
    reachVelocity: '+5K/hr',
    topVector: 'Sivakasi Firecracker Ban Circular',
    vectorCategory: 'text',
    vectorIcon: 'description',
    containmentStatus: 'Advisory Dispatched',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0820',
    activeClaimTitle: 'Fake Supreme Court ban notification targeting green crackers',
    activeClaimSnippet: 'Fabricated legal extract causing order cancellations across Sivakasi industrial printing units.',
    authorityAdvisory: 'District Collector: Certified green firecracker manufacturing fully permitted under PESO compliance.',
    vectorBreakdown: { audio: 20, video: 15, social: 35, text: 30 },
    population: '1.9 Million',
    headquarters: 'Virudhunagar',
  },
  {
    id: 'ramanathapuram',
    name: 'Ramanathapuram',
    tamilName: 'ராமநாதபுரம்',
    zone: 'south',
    zoneName: 'Southern Cultural & Inland Heartlands',
    cx: 345,
    cy: 505,
    path: 'M 272 468 L 362 462 L 428 492 L 378 538 L 282 522 Z',
    riskScore: 56.0,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 4,
    reachEstimate: 33000,
    reachVelocity: '+2K/hr',
    topVector: 'Pamban Railway Bridge Closure Hoax',
    vectorCategory: 'video',
    vectorIcon: 'videocam',
    containmentStatus: 'Monitoring',
    containmentColor: 'text-sky-500',
    activeClaimId: '#TN-0711',
    activeClaimTitle: 'Structural collapse warning regarding new Pamban sea lift span',
    activeClaimSnippet: 'Edited clip of hydraulic lift test presented as emergency mechanical failure.',
    authorityAdvisory: 'Southern Railway: New Pamban vertical lift bridge undergoing scheduled CRS oscillation trials.',
    vectorBreakdown: { audio: 15, video: 60, social: 20, text: 5 },
    population: '1.4 Million',
    headquarters: 'Ramanathapuram',
  },

  // --- Deep South ---
  {
    id: 'tenkasi',
    name: 'Tenkasi',
    tamilName: 'தென்காசி',
    zone: 'south',
    zoneName: 'Deep South Basin & Coastal Corridors',
    cx: 160,
    cy: 535,
    path: 'M 132 498 L 182 508 L 188 568 L 138 562 L 122 522 Z',
    riskScore: 48.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 2,
    reachEstimate: 15000,
    reachVelocity: '0/hr',
    topVector: 'Courtallam Flash Flood Scare',
    vectorCategory: 'video',
    vectorIcon: 'videocam',
    containmentStatus: 'Contained',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0335',
    activeClaimTitle: 'Main falls tourist sweeping hoax video',
    activeClaimSnippet: 'Five-year-old rescue clip recirculated claiming recent tourist fatalities.',
    authorityAdvisory: 'Tenkasi District Police: Regulated bathing permitted at all falls with lifeguard squads on duty.',
    vectorBreakdown: { audio: 20, video: 60, social: 15, text: 5 },
    population: '1.4 Million',
    headquarters: 'Tenkasi',
  },
  {
    id: 'tirunelveli',
    name: 'Tirunelveli',
    tamilName: 'திருநெல்வேலி',
    zone: 'south',
    zoneName: 'Deep South Basin & Coastal Corridors',
    cx: 218,
    cy: 552,
    path: 'M 182 508 L 248 512 L 252 588 L 192 592 L 182 552 Z',
    riskScore: 71.3,
    status: 'High Alert',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    signalsCount: 7,
    reachEstimate: 68000,
    reachVelocity: '+7K/hr',
    topVector: 'River Sand Mining Feud Video',
    vectorCategory: 'video',
    vectorIcon: 'videocam',
    containmentStatus: 'Under Active Triage',
    containmentColor: 'text-amber-500',
    activeClaimId: '#TN-2980',
    activeClaimTitle: 'Doctored communal clash video in Thamirabarani river basin.',
    activeClaimSnippet: 'Misleading video splicing private dispute in neighboring district as communal unrest.',
    authorityAdvisory: 'Tirunelveli District Police: Complete peace across river basin; legal notices served to rumor broadcast handles.',
    vectorBreakdown: { audio: 25, video: 55, social: 15, text: 5 },
    population: '1.7 Million',
    headquarters: 'Tirunelveli City',
  },
  {
    id: 'thoothukudi',
    name: 'Thoothukudi',
    tamilName: 'தூத்துக்குடி',
    zone: 'south',
    zoneName: 'Deep South Basin & Coastal Corridors',
    cx: 280,
    cy: 558,
    path: 'M 248 512 L 312 518 L 308 592 L 248 592 Z',
    riskScore: 63.0,
    status: 'Monitoring',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
    signalsCount: 5,
    reachEstimate: 45000,
    reachVelocity: '+3K/hr',
    topVector: 'Sterlite Factory Reopening Rumor',
    vectorCategory: 'social',
    vectorIcon: 'share',
    containmentStatus: 'Advisory Dispatched',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-1142',
    activeClaimTitle: 'Fabricated state cabinet reopening clearance order',
    activeClaimSnippet: 'Forged gazette extract claiming industrial plant resumption.',
    authorityAdvisory: 'Thoothukudi Collectorate: Gazette document is fake; state policy remains unchanged before Supreme Court.',
    vectorBreakdown: { audio: 20, video: 20, social: 45, text: 15 },
    population: '1.8 Million',
    headquarters: 'Thoothukudi',
  },
  {
    id: 'kanyakumari',
    name: 'Kanyakumari',
    tamilName: 'கன்னியாகுமரி',
    zone: 'south',
    zoneName: 'Deep South Basin & Coastal Corridors',
    cx: 190,
    cy: 618,
    path: 'M 168 588 L 228 588 L 212 648 L 172 638 L 152 602 Z',
    riskScore: 48.0,
    status: 'Stable',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    signalsCount: 2,
    reachEstimate: 14000,
    reachVelocity: '0/hr',
    topVector: 'Vivekananda Rock Ferry Stoppage Hoax',
    vectorCategory: 'text',
    vectorIcon: 'description',
    containmentStatus: 'Contained',
    containmentColor: 'text-emerald-500',
    activeClaimId: '#TN-0511',
    activeClaimTitle: 'Cape tourist ferry closure rumor during spring tide',
    activeClaimSnippet: 'Fake circular stating coastal ferry boats halted for 2 weeks.',
    authorityAdvisory: 'Poompuhar Shipping Corp: Regular ferry operations running between mainland, Vivekananda Rock, and Thiruvalluvar Statue.',
    vectorBreakdown: { audio: 15, video: 15, social: 30, text: 40 },
    population: '1.9 Million',
    headquarters: 'Nagercoil',
  },
];

export default function DistrictMisinfoMap({
  onSelectClaim,
  onNavigateToQueue,
  onNavigateToLab,
  isReachHidden = false,
  highlightedDistrictId = null,
}) {
  const [selectedDistrictId, setSelectedDistrictId] = useState(highlightedDistrictId || 'chennai');
  const [hoveredDistrictId, setHoveredDistrictId] = useState(null);
  const [activeLayer, setActiveLayer] = useState('risk'); // 'risk' | 'volume' | 'vector' | 'containment'
  const [selectedZone, setSelectedZone] = useState('all'); // 'all' | 'north' | 'west' | 'delta' | 'south'
  const [searchQuery, setSearchQuery] = useState('');
  const [advisoryFeedback, setAdvisoryFeedback] = useState(null);

  // Sync if highlightedDistrictId changes from parent
  React.useEffect(() => {
    if (highlightedDistrictId) {
      setSelectedDistrictId(highlightedDistrictId);
    }
  }, [highlightedDistrictId]);

  // Find currently selected and hovered district
  const selectedDistrict = useMemo(() => {
    return TN_DISTRICTS_DATA.find((d) => d.id === selectedDistrictId) || TN_DISTRICTS_DATA[0];
  }, [selectedDistrictId]);

  const hoveredDistrict = useMemo(() => {
    return hoveredDistrictId ? TN_DISTRICTS_DATA.find((d) => d.id === hoveredDistrictId) : null;
  }, [hoveredDistrictId]);

  // Filtered districts by zone and search
  const visibleDistricts = useMemo(() => {
    return TN_DISTRICTS_DATA.filter((d) => {
      if (selectedZone !== 'all' && d.zone !== selectedZone) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          d.name.toLowerCase().includes(q) ||
          d.tamilName.includes(q) ||
          d.topVector.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedZone, searchQuery]);

  // District fill color calculation based on active layer
  const getDistrictColor = (district) => {
    const isMuted = selectedZone !== 'all' && district.zone !== selectedZone;

    if (activeLayer === 'risk') {
      if (district.riskScore >= 80) return isMuted ? '#fca5a5' : '#ef4444'; // Red
      if (district.riskScore >= 68) return isMuted ? '#fdba74' : '#f97316'; // Orange
      if (district.riskScore >= 55) return isMuted ? '#fde047' : '#eab308'; // Yellow/Gold
      return isMuted ? '#93c5fd' : '#0ea5e9'; // Blue/Sky
    }

    if (activeLayer === 'volume') {
      if (district.signalsCount >= 12) return '#dc2626'; // High density
      if (district.signalsCount >= 7) return '#f97316';
      if (district.signalsCount >= 4) return '#3b82f6';
      return '#64748b'; // Low density
    }

    if (activeLayer === 'vector') {
      switch (district.vectorCategory) {
        case 'audio':
          return '#8b5cf6'; // Violet / Audio
        case 'video':
          return '#ec4899'; // Pink / Deepfake Video
        case 'text':
          return '#f59e0b'; // Amber / Document Hoax
        case 'social':
        default:
          return '#06b6d4'; // Cyan / Forward Chain
      }
    }

    if (activeLayer === 'containment') {
      if (district.riskScore >= 80) return '#ef4444'; // Cyber Cell Escalation
      if (district.riskScore >= 65) return '#f59e0b'; // Under Triage
      return '#10b981'; // Contained / Advisory Issued
    }

    return '#cbd5e1';
  };

  const handleIssueAdvisory = (district) => {
    setAdvisoryFeedback(`Dispatched Counter-Advisory broadcast for ${district.name} via Fact-Check Syndicate!`);
    setTimeout(() => setAdvisoryFeedback(null), 4000);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${Math.round(num / 1000)}K`;
    return num.toLocaleString();
  };

  // Top critical hotspots for radar ping animation
  const activeHotspots = useMemo(() => {
    return TN_DISTRICTS_DATA.filter((d) => d.riskScore >= 68);
  }, []);

  return (
    <div className="w-full flex flex-col gap-4 bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#38bdf8 1px, transparent 1px), radial-gradient(#38bdf8 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Top Header & Layer Mode Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">map</span>
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Tamil Nadu District Surveillance Map
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
                LIVE RADAR
              </span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time geospatial telemetry across all 38 revenue districts, monitoring viral velocity and threat vector clusters.
          </p>
        </div>

        {/* Layer Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => setActiveLayer('risk')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              activeLayer === 'risk'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">local_fire_department</span>
            <span>Risk Heatmap</span>
          </button>
          <button
            onClick={() => setActiveLayer('volume')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              activeLayer === 'volume'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">radar</span>
            <span>Signal Volume</span>
          </button>
          <button
            onClick={() => setActiveLayer('vector')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              activeLayer === 'vector'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">category</span>
            <span>Threat Vector</span>
          </button>
          <button
            onClick={() => setActiveLayer('containment')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 cursor-pointer ${
              activeLayer === 'containment'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">shield_check</span>
            <span>Containment</span>
          </button>
        </div>
      </div>

      {/* Zone Quick-Filters & Search Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Zone:</span>
          {[
            { id: 'all', label: 'All Tamil Nadu (38)' },
            { id: 'north', label: 'North Coastal / Capital' },
            { id: 'west', label: 'Western Agro-Industrial' },
            { id: 'delta', label: 'Cauvery Delta' },
            { id: 'south', label: 'Southern Heartlands' },
          ].map((zone) => (
            <button
              key={zone.id}
              onClick={() => setSelectedZone(zone.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                selectedZone === zone.id
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
              }`}
            >
              {zone.label}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-60">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[16px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search district or topic..."
            className="w-full bg-slate-800/90 border border-slate-700/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Interactive Map (Left) + Selected District Telemetry Dossier (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10 mt-1">
        {/* SVG Map Container (7 Cols on desktop) */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 rounded-xl p-3 sm:p-5 relative flex flex-col items-center justify-center overflow-hidden min-h-[460px]">
          {/* Compass & Scale Indicators */}
          <div className="absolute top-4 left-4 flex flex-col items-center pointer-events-none text-slate-400 select-none">
            <span className="text-[10px] font-mono font-bold text-sky-400">N</span>
            <span className="material-symbols-outlined text-[18px] text-sky-400 -mt-1">navigation</span>
            <span className="text-[9px] font-mono text-slate-500 mt-1">100 km ━━</span>
          </div>

          {/* Bay of Bengal & Indian Ocean Ambient Labels */}
          <div className="absolute top-1/3 right-4 rotate-90 text-[11px] font-mono tracking-widest text-slate-600 select-none pointer-events-none">
            BAY OF BENGAL
          </div>
          <div className="absolute bottom-3 right-1/4 text-[10px] font-mono tracking-widest text-slate-600 select-none pointer-events-none">
            GULF OF MANNAR
          </div>
          <div className="absolute bottom-1 text-[10px] font-mono tracking-widest text-slate-600 select-none pointer-events-none">
            INDIAN OCEAN
          </div>

          {/* SVG Canvas */}
          <svg
            viewBox="0 0 540 670"
            className="w-full max-w-[500px] h-auto max-h-[580px] drop-shadow-2xl select-none"
            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <radialGradient id="hotspotRed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Render all District Polygons */}
            {TN_DISTRICTS_DATA.map((district) => {
              const isSelected = selectedDistrictId === district.id;
              const isHovered = hoveredDistrictId === district.id;
              const isFilteredOut = selectedZone !== 'all' && district.zone !== selectedZone;
              const color = getDistrictColor(district);

              return (
                <g
                  key={district.id}
                  className="cursor-pointer transition-transform duration-200"
                  onClick={() => setSelectedDistrictId(district.id)}
                  onMouseEnter={() => setHoveredDistrictId(district.id)}
                  onMouseLeave={() => setHoveredDistrictId(null)}
                >
                  {/* District Boundary Path */}
                  <path
                    d={district.path}
                    fill={color}
                    fillOpacity={isFilteredOut ? 0.25 : isSelected ? 0.95 : isHovered ? 0.85 : 0.65}
                    stroke={isSelected ? '#38bdf8' : isHovered ? '#ffffff' : '#0f172a'}
                    strokeWidth={isSelected ? 2.5 : isHovered ? 1.8 : 1}
                    className="transition-all duration-200 hover:brightness-125"
                    style={{
                      transformOrigin: `${district.cx}px ${district.cy}px`,
                      filter: isSelected ? 'url(#glow)' : undefined,
                    }}
                  />

                  {/* Centroid Dot */}
                  <circle
                    cx={district.cx}
                    cy={district.cy}
                    r={isSelected ? 3.5 : 2}
                    fill={isSelected ? '#ffffff' : '#0f172a'}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                  />

                  {/* District Abbreviation Label */}
                  <text
                    x={district.cx}
                    y={district.cy - 5}
                    textAnchor="middle"
                    className={`font-mono text-[9px] pointer-events-none select-none font-bold ${
                      isSelected
                        ? 'fill-white'
                        : isHovered
                        ? 'fill-sky-200'
                        : 'fill-slate-200 opacity-80'
                    }`}
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                  >
                    {district.name.toUpperCase().slice(0, 5)}
                  </text>
                </g>
              );
            })}

            {/* Radar Pulsing Hotspots for Critical Districts */}
            {activeHotspots.map((hotspot) => (
              <g key={`hotspot-${hotspot.id}`} pointerEvents="none">
                <circle
                  cx={hotspot.cx}
                  cy={hotspot.cy}
                  r="6"
                  fill="#ef4444"
                  opacity="0.8"
                />
                <circle
                  cx={hotspot.cx}
                  cy={hotspot.cy}
                  r="14"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  className="animate-ping"
                  style={{ transformOrigin: `${hotspot.cx}px ${hotspot.cy}px` }}
                />
              </g>
            ))}
          </svg>

          {/* Floating Hover Tooltip HUD */}
          {hoveredDistrict && (
            <div
              className="absolute bottom-4 left-4 bg-slate-900/95 border border-sky-500/40 rounded-xl p-3 shadow-xl backdrop-blur-md text-xs pointer-events-none flex flex-col gap-1 max-w-[260px] animate-fadeIn"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                <span className="font-bold text-white text-sm">
                  {hoveredDistrict.name} ({hoveredDistrict.tamilName})
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${hoveredDistrict.badgeClass}`}>
                  {hoveredDistrict.riskScore}%
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                <span className="text-slate-400">Signals:</span> <strong className="text-white">{hoveredDistrict.signalsCount}</strong> •{' '}
                <span className="text-slate-400">Reach:</span> <strong className="text-white">{isReachHidden ? '••••' : formatNumber(hoveredDistrict.reachEstimate)}</strong>
              </div>
              <div className="text-[11px] text-sky-400 truncate">
                ⚡ Vector: {hoveredDistrict.topVector}
              </div>
            </div>
          )}

          {/* Map Legend Bar */}
          <div className="w-full mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
            <span className="font-semibold text-slate-300">Legend ({activeLayer.toUpperCase()}):</span>
            {activeLayer === 'risk' && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical (&ge;80%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High (68-79%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> Moderate (55-67%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Stable (&lt;55%)
                </span>
              </div>
            )}
            {activeLayer === 'vector' && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Audio
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span> Video Deepfake
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Document
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Social Chain
                </span>
              </div>
            )}
            {activeLayer === 'volume' && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> &ge;12 signals
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> 7-11
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> 4-6
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span> 1-3
                </span>
              </div>
            )}
            {activeLayer === 'containment' && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Cyber Cell Escalated
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Active Triage
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Advisory Issued
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Selected District Telemetry & Action Dossier (5 Cols on desktop) */}
        <div className="lg:col-span-5 bg-slate-800/50 border border-slate-700/80 rounded-xl p-4 sm:p-5 flex flex-col gap-4 shadow-sm">
          {/* District Header */}
          <div className="flex items-start justify-between border-b border-slate-700 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">
                  {selectedDistrict.name}
                </h3>
                <span className="text-slate-400 font-medium text-xs">
                  ({selectedDistrict.tamilName})
                </span>
              </div>
              <p className="text-xs text-sky-400 font-medium mt-0.5">
                {selectedDistrict.zoneName}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${selectedDistrict.badgeClass}`}>
              {selectedDistrict.status}
            </span>
          </div>

          {/* Key Metrics Quick Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Risk Score</span>
              <span className="text-lg font-bold text-red-400 font-mono">
                {selectedDistrict.riskScore}%
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Flagged Signals</span>
              <span className="text-lg font-bold text-white font-mono">
                {selectedDistrict.signalsCount}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reach Est.</span>
              <span className="text-lg font-bold text-sky-400 font-mono">
                {isReachHidden ? '••••' : formatNumber(selectedDistrict.reachEstimate)}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-700/60">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Velocity</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {selectedDistrict.reachVelocity}
              </span>
            </div>
          </div>

          {/* Dominant Vector & Threat Profile */}
          <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-700/50 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <span className="material-symbols-outlined text-[16px] text-sky-400">
                  {selectedDistrict.vectorIcon}
                </span>
                Primary Vector:
              </span>
              <strong className="text-white font-semibold">{selectedDistrict.topVector}</strong>
            </div>

            {/* Vector Composition Bar */}
            <div className="mt-1">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Vector Breakdown</span>
                <span>Audio {selectedDistrict.vectorBreakdown.audio}% • Video {selectedDistrict.vectorBreakdown.video}% • Social {selectedDistrict.vectorBreakdown.social}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden">
                <div style={{ width: `${selectedDistrict.vectorBreakdown.audio}%` }} className="bg-purple-500" title="Audio"></div>
                <div style={{ width: `${selectedDistrict.vectorBreakdown.video}%` }} className="bg-pink-500" title="Video"></div>
                <div style={{ width: `${selectedDistrict.vectorBreakdown.social}%` }} className="bg-cyan-500" title="Social"></div>
                <div style={{ width: `${selectedDistrict.vectorBreakdown.text}%` }} className="bg-amber-500" title="Document"></div>
              </div>
            </div>
          </div>

          {/* Active Claim Spotlight in this District */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-700 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-sky-400 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">warning</span>
                Active Incident {selectedDistrict.activeClaimId}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                HQ: {selectedDistrict.headquarters}
              </span>
            </div>

            <p className="text-xs font-semibold text-white leading-snug">
              "{selectedDistrict.activeClaimTitle}"
            </p>
            <p className="text-[11px] text-slate-300 italic">
              {selectedDistrict.activeClaimSnippet}
            </p>

            {/* Authority Rebuttal / Evidence Contradiction */}
            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 mt-1 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-emerald-400 shrink-0 mt-0.5">
                verified
              </span>
              <div>
                <strong className="block text-emerald-200 font-semibold mb-0.5">
                  Official Contradiction Advisory
                </strong>
                <span>{selectedDistrict.authorityAdvisory}</span>
              </div>
            </div>
          </div>

          {/* District Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              onClick={() => {
                if (onSelectClaim) onSelectClaim(selectedDistrict.activeClaimId);
              }}
              className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Open in Queue</span>
            </button>

            {onNavigateToLab && (
              <button
                onClick={() => onNavigateToLab(selectedDistrict.activeClaimId)}
                className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">biotech</span>
                <span>Forensic Lab</span>
              </button>
            )}

            <button
              onClick={() => handleIssueAdvisory(selectedDistrict)}
              className="w-full sm:w-auto py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Broadcast verified contradiction advisory to regional fact-checking syndicate"
            >
              <span className="material-symbols-outlined text-[16px]">campaign</span>
              <span className="hidden sm:inline">Advisory</span>
            </button>
          </div>

          {/* Advisory Dispatch Notification */}
          {advisoryFeedback && (
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-2 animate-fadeIn">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{advisoryFeedback}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
