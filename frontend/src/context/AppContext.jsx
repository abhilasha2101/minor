import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as api from '../services/api.js';

const AppContext = createContext();

// ──────────────────────────────────────────────
// Mock News Articles (kept client-side for the Inshorts feed)
// These represent curated news content — in production, fetch from a CMS/API
// ──────────────────────────────────────────────
const INITIAL_NEWS_ARTICLES = [
  {
    id: 'news-1',
    title: 'ISRO Announces Mangalyaan-2 Mission Details for late 2026',
    category: 'National',
    summary: 'The Indian Space Research Organisation (ISRO) has officially unveiled the mission roadmap for its second Mars orbiter, Mangalyaan-2, scheduled for late 2026. The probe will carry advanced hyperspectral cameras and radar to analyze Mars surface composition.',
    fullArticle: 'ISRO has announced that Mangalyaan-2 will launch in late 2026. The orbiter is equipped with cutting-edge scientific payloads, including a sub-surface radar and a high-resolution thermal camera. Unlike its predecessor, this mission aims to study the atmospheric dynamics and surface chemistry of Mars in greater detail. ISRO officials confirm that the launch will be powered by the LVM3 rocket from Sriharikota, solidifying India\'s position in advanced space exploration.',
    imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-12',
    author: 'Space Desk, New Delhi',
    verifiedStatus: 'TRUE',
    confidence: 94,
    source: 'ISRO Official Press Release'
  },
  {
    id: 'news-2',
    title: 'Global Summit Agrees on Landmark AI Safety Treaty',
    category: 'International',
    summary: 'Delegates from 65 countries have signed a historic artificial intelligence treaty in Geneva, establishing strict safety guidelines for frontier neural networks and criminalizing autonomous offensive weapon systems.',
    fullArticle: 'In a landmark diplomatic achievement, representatives from 65 nations gathered in Geneva to sign the International Accord on Frontier AI Safety. The treaty mandates independent security audits for models exceeding 10^26 FLOPs of training compute. It also prohibits the integration of autonomous AI systems with military attack hardware. Technology conglomerates will face massive penalties for non-compliance, marking the first globally enforceable regulatory framework for AI.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-13',
    author: 'Geneva Bureau',
    verifiedStatus: 'TRUE',
    confidence: 89,
    source: 'Reuters / UN Press Service'
  },
  {
    id: 'news-3',
    title: 'New Bio-Battery Powered by Human Sweat Developed',
    category: 'Science',
    summary: 'Researchers in Tokyo have developed a flexible bio-battery that generates electricity from lactic acid in human sweat. The lightweight battery can power wearable devices like smartwatches for weeks.',
    fullArticle: 'A team of material scientists at the Tokyo Institute of Science has breakthrough technology: a epidermal patch bio-battery. By exploiting enzymes that break down lactate present in human sweat, the patch generates a continuous micro-current. During tests, athletes wearing the patch successfully powered health monitors and fitness trackers continuously without external charging. The battery is completely biodegradable and made from organic compounds.',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-11',
    author: 'Science Daily',
    verifiedStatus: 'TRUE',
    confidence: 92,
    source: 'Nature Biotechnology Journal'
  },
  {
    id: 'news-4',
    title: 'Superfluid Helium Discovered in Crater of the Moon',
    category: 'Science',
    summary: 'NASA\'s Artemis VI science instruments reportedly detected massive reserves of natural superfluid liquid helium inside a permanently shadowed crater at the Moon\'s south pole.',
    fullArticle: 'Viral social media reports claim NASA\'s latest lunar mission discovered superfluid helium flowing inside a lunar crater. Physicists point out that superfluid helium (Helium-4 at temperatures below 2.17 Kelvin) cannot exist naturally on the Moon. While cold, lunar craters do not reach the near-absolute-zero conditions or pressure dynamics required to sustain superfluidity, and helium gas would easily escape the Moon\'s weak gravity. NASA has debunked the claim, clarifying that only trace isotope concentrations of Helium-3 gas were analyzed in soil samples.',
    imageUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-10',
    author: 'Viral Rumor Watch',
    verifiedStatus: 'FALSE',
    confidence: 97,
    source: 'NASA Planetary Science Division'
  },
  {
    id: 'news-5',
    title: 'Tech Conglomerate to Release Fully Holographic Smartphone',
    category: 'Technology',
    summary: 'A viral video showing a paper-thin smartphone projecting a fully interactive 3D desktop in mid-air has gathered 50 million views, claiming a major tech firm will launch it this autumn.',
    fullArticle: 'A CGI-rendered concept video depicting a transparent glass device displaying interactive floating volumetric holograms has been widely shared as a leak for an upcoming smartphone. Optoelectronics experts have confirmed that mid-air light projection without a physical medium (like dust, mist, or transparent screens) violates basic laws of optics. No current display or laser projector fits into a phone form-factor capable of this. The parent company named in the video has confirmed the clip is a student digital art project and no such device is in development.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-08',
    author: 'Tech Truths',
    verifiedStatus: 'MISLEADING',
    confidence: 90,
    source: 'IEEE Spectrum Optics Fact Check'
  },
  {
    id: 'news-6',
    title: 'Billionaire Tech CEO Steps Down to Train for Mars Voyage',
    category: 'Technology',
    summary: 'Social media posts claim the CEO of a prominent electric vehicle manufacturer has resigned to enter a 12-month isolation chamber in preparation for a private Mars colonization mission.',
    fullArticle: 'Claims emerged online that a famous tech billionaire has resigned from all board positions to start physical training for a flight to Mars. Corporate filings show no such resignation has occurred. The rumor originated from a satirical article on a tech comedy website. While the CEO frequently posts about interplanetary travel, he has made no official announcements regarding immediate personal flight training or leaving his corporate leadership roles.',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-09',
    author: 'Rumor Buster',
    verifiedStatus: 'FALSE',
    confidence: 93,
    source: 'SEC Corporate Filings'
  },
  {
    id: 'news-7',
    title: 'Central Bank Launches Digital Currency for Nationwide Use',
    category: 'Business',
    summary: 'The reserve bank has officially rolled out its Central Bank Digital Currency (CBDC) for general retail use, making digital cash transactions available offline through secure hardware wallets.',
    fullArticle: 'The central bank has launched its retail digital currency, allowing citizens to transact digital currency peer-to-peer even without active internet access. The system uses secure elements on mobile SIM cards and special hardware smart cards. The digital currency is pegged 1:1 with paper currency, designed to reduce printing costs and improve transaction tracking while preserving user privacy thresholds specified in currency laws.',
    imageUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-13',
    author: 'Financial Times Desk',
    verifiedStatus: 'TRUE',
    confidence: 96,
    source: 'Reserve Bank Official Bulletin'
  },
  {
    id: 'news-8',
    title: 'Major Football Tournament to Expand to 64 Teams in 2030',
    category: 'Sports',
    summary: 'The international football federation has announced a controversial expansion of the global tournament structure, boosting the number of competing nations from 48 to 64.',
    fullArticle: 'A widely circulated infographic claims the world football governing body has approved a 64-team tournament format for the 2030 event. Official channels confirmed that the 2026 and 2030 tournaments are locked into the newly designed 48-team group stage format. No discussions regarding a further expansion to 64 teams have been tabled. The graphic was trace-linked to a conceptual fan art forum exploring hypothetical tournament formats.',
    imageUrl: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=800&q=80',
    date: '2026-06-07',
    author: 'Sports Fact Desk',
    verifiedStatus: 'FALSE',
    confidence: 95,
    source: 'FIFA Media Communications Office'
  }
];

// ──────────────────────────────────────────────
// Current Affairs Flashcards — Indian Competitive Exam Style
// Categories: Polity & Governance, Economy & Finance, Science & Tech,
// International Relations, Environment & Ecology, Defence & Security,
// Art & Culture, Social Issues, Sports
// ──────────────────────────────────────────────
const INITIAL_FLASHCARDS = [
  // Polity & Governance
  {
    id: 'fc-1',
    title: 'One Nation One Election Bill',
    fact: 'The Constitution (129th Amendment) Bill proposes simultaneous elections for Lok Sabha and State Assemblies. It recommends a common electoral roll prepared by the Election Commission of India (ECI) in consultation with State Election Commissions. The bill was referred to a Joint Parliamentary Committee (JPC) for detailed examination.',
    category: 'Polity & Governance',
    examTag: 'UPSC Prelims',
    date: 'June 2026'
  },
  {
    id: 'fc-2',
    title: 'Waqf (Amendment) Act 2025',
    fact: 'The Waqf (Amendment) Act, 2025 introduced key changes: mandatory registration of Waqf properties with district collectors, inclusion of non-Muslim members and women in Waqf boards, creation of a Central Waqf Council portal for transparency, and removal of Waqf Tribunal\'s suo motu powers. The law aims to ensure transparency and accountability in Waqf property management.',
    category: 'Polity & Governance',
    examTag: 'UPSC Mains',
    date: 'May 2026'
  },
  {
    id: 'fc-3',
    title: 'Eighth Schedule — Language Demand',
    fact: 'Multiple states have demanded inclusion of their regional languages in the Eighth Schedule of the Indian Constitution. Currently, 22 languages are listed. Demands include Bhojpuri, Rajasthani, Tulu, and Garo. The Eighth Schedule gives languages recognition for official purposes and representation in the Official Language Commission.',
    category: 'Polity & Governance',
    examTag: 'State PCS',
    date: 'June 2026'
  },
  // Economy & Finance
  {
    id: 'fc-4',
    title: 'RBI Digital Rupee (e₹) Retail Expansion',
    fact: 'The Reserve Bank of India expanded the e₹ (Central Bank Digital Currency) retail pilot to cover offline transactions using NFC-enabled smart cards and UPI-lite integration. The CBDC is legal tender, pegged 1:1 to the Indian Rupee, and settles instantly without intermediaries. It aims to reduce cash-handling costs and improve financial inclusion in rural areas.',
    category: 'Economy & Finance',
    examTag: 'Banking',
    date: 'June 2026'
  },
  {
    id: 'fc-5',
    title: 'SEBI Regulation on Finfluencers',
    fact: 'SEBI issued new regulations prohibiting registered entities (mutual funds, brokers) from associating with unregistered "finfluencers" for marketing. Social media influencers giving financial advice without SEBI registration face penalties. The regulation mandates disclosure of compensation and conflicts of interest in investment-related content.',
    category: 'Economy & Finance',
    examTag: 'UPSC Prelims',
    date: 'May 2026'
  },
  {
    id: 'fc-6',
    title: 'PM Vishwakarma Yojana — Progress Update',
    fact: 'PM Vishwakarma Yojana, launched for traditional artisans and craftspeople across 18 trades (carpenter, blacksmith, goldsmith, potter, etc.), provides skill training, toolkit support, and credit facility up to ₹3 lakh. The scheme has enrolled over 1.2 crore artisans as of 2026, with PM Vishwakarma certificates enabling access to GeM portal for government procurement.',
    category: 'Economy & Finance',
    examTag: 'SSC',
    date: 'June 2026'
  },
  // Science & Technology
  {
    id: 'fc-7',
    title: 'ISRO Gaganyaan — Crew Escape System Test',
    fact: 'ISRO successfully completed the in-flight abort test (D2 Mission) for the Gaganyaan programme, validating the Crew Escape System (CES) at Mach 1.2 speed. The CES demonstrated its ability to pull the crew module away from the launch vehicle during an emergency. Gaganyaan\'s first uncrewed orbital mission (G1) is scheduled for late 2026.',
    category: 'Science & Technology',
    examTag: 'UPSC Prelims',
    date: 'June 2026'
  },
  {
    id: 'fc-8',
    title: 'India\'s Semiconductor Fab Plant',
    fact: 'India\'s first commercial semiconductor fabrication plant by Tata Electronics in Dholera, Gujarat, achieved its first silicon wafer output. The ₹91,000 crore facility manufactures chips at 28nm and 40nm nodes. The India Semiconductor Mission (ISM) under MeitY approved four semiconductor and display fab projects with a total investment exceeding ₹1.5 lakh crore.',
    category: 'Science & Technology',
    examTag: 'UPSC Prelims',
    date: 'May 2026'
  },
  {
    id: 'fc-9',
    title: 'AI Safety & Regulation — India\'s Approach',
    fact: 'India released its advisory on AI regulation, choosing a "risk-based" framework rather than a blanket legislation approach. The Digital India Act (proposed) includes provisions for "High-Risk AI Systems" requiring mandatory testing, transparency labeling, and bias auditing. India co-chairs the Global Partnership on Artificial Intelligence (GPAI) and advocates for inclusive AI governance.',
    category: 'Science & Technology',
    examTag: 'UPSC Mains',
    date: 'June 2026'
  },
  // International Relations
  {
    id: 'fc-10',
    title: 'India-EFTA Trade Agreement (TEPA)',
    fact: 'India signed the Trade and Economic Partnership Agreement (TEPA) with the European Free Trade Association (EFTA) — Switzerland, Norway, Iceland, and Liechtenstein. EFTA committed $100 billion investment in India over 15 years. India gets improved market access for IT services, pharmaceuticals, and textiles while phasing out tariffs over 7-10 years on select goods.',
    category: 'International Relations',
    examTag: 'UPSC Prelims',
    date: 'May 2026'
  },
  {
    id: 'fc-11',
    title: 'BRICS Expansion & De-dollarisation',
    fact: 'Post expansion, BRICS now includes Egypt, Ethiopia, Iran, Saudi Arabia, and UAE (BRICS+). The bloc represents ~46% of the global population and ~35.6% of global GDP (PPP). Discussions on a common BRICS payment platform (alternative to SWIFT) and trade settlements in local currencies intensified, though a common currency remains far from implementation.',
    category: 'International Relations',
    examTag: 'UPSC Mains',
    date: 'June 2026'
  },
  // Environment & Ecology
  {
    id: 'fc-12',
    title: 'Cheetah Reintroduction — Status Update',
    fact: 'India\'s Project Cheetah at Kuno National Park, Madhya Pradesh, has seen the cheetah population stabilize with successful breeding. The programme follows the IUCN guidelines for large carnivore translocation. Key challenges include territorial conflicts with leopards, fencing adequacy, and prey-base management. Gandhi Sagar Wildlife Sanctuary is being prepared as the second relocation site.',
    category: 'Environment & Ecology',
    examTag: 'UPSC Prelims',
    date: 'June 2026'
  },
  {
    id: 'fc-13',
    title: 'India\'s Updated NDC — Climate Commitments',
    fact: 'India updated its Nationally Determined Contributions (NDC) under the Paris Agreement, targeting 50% cumulative electric power installed capacity from non-fossil fuel sources by 2030 (up from 40%). India also committed to reducing the carbon intensity of GDP by 45% by 2030 (from 2005 levels). The Long-Term Low Emissions Development Strategy (LT-LEDS) aligns with the Net Zero 2070 target.',
    category: 'Environment & Ecology',
    examTag: 'UPSC Mains',
    date: 'May 2026'
  },
  // Defence & Security
  {
    id: 'fc-14',
    title: 'INS Arighat — India\'s 2nd Nuclear Submarine',
    fact: 'INS Arighat (S3), India\'s second nuclear-powered ballistic missile submarine (SSBN), was commissioned into the Indian Navy. It is an Arihant-class vessel capable of carrying K-15 Sagarika SLBMs (750 km range) and K-4 missiles (3,500 km range). The SSBN strengthens India\'s nuclear triad and second-strike capability, critical for nuclear deterrence.',
    category: 'Defence & Security',
    examTag: 'UPSC Prelims',
    date: 'June 2026'
  },
  {
    id: 'fc-15',
    title: 'ASTRA MK-2 Beyond Visual Range Missile',
    fact: 'DRDO successfully test-fired the ASTRA MK-2 Beyond Visual Range Air-to-Air Missile (BVRAAM) with an extended range of 160 km. The missile features an active radar seeker, mid-course inertial navigation, and a high-energy solid-propellant motor. It will be integrated on Sukhoi Su-30MKI and Tejas Mk-1A fighter aircraft, reducing India\'s dependency on imported air-to-air missiles.',
    category: 'Defence & Security',
    examTag: 'SSC',
    date: 'May 2026'
  },
  // Art & Culture
  {
    id: 'fc-16',
    title: 'Moidams — India\'s 43rd UNESCO World Heritage Site',
    fact: 'The Moidams (Mound-Burial System of the Ahom Dynasty) in Charaideo, Assam, were inscribed as India\'s 43rd UNESCO World Heritage Site. These royal burial mounds of the 600-year Ahom dynasty (1228–1826 CE) represent a unique cultural tradition of vault burials in earthen mounds. India now has 43 World Heritage Sites (35 cultural, 7 natural, 1 mixed).',
    category: 'Art & Culture',
    examTag: 'UPSC Prelims',
    date: 'June 2026'
  },
  {
    id: 'fc-17',
    title: 'Classical Language Status — Marathi, Pali, Prakrit, Assamese, Bengali',
    fact: 'The Union Cabinet approved classical language status for Marathi, Pali, Prakrit, Assamese, and Bengali, taking the total count of classical languages in India to 11. Benefits include: a Centre of Excellence for studies, UGC Professorial Chairs, and international awards for scholars. Other classical languages include Tamil, Sanskrit, Kannada, Telugu, Malayalam, and Odia.',
    category: 'Art & Culture',
    examTag: 'SSC',
    date: 'May 2026'
  },
  // Social Issues
  {
    id: 'fc-18',
    title: 'Lateral Entry into Civil Services — Controversy',
    fact: 'The government\'s decision to recruit specialists through lateral entry at Joint Secretary and Director levels in central ministries sparked debate. The UPSC advertised 45 posts for lateral entry on contract basis (3-5 years). Critics argued it bypasses reservation provisions and undermines the career civil service system. Proponents cited the need for domain expertise in governance.',
    category: 'Social Issues',
    examTag: 'UPSC Mains',
    date: 'June 2026'
  },
  // Sports
  {
    id: 'fc-19',
    title: 'India\'s FIFA U-17 Women\'s World Cup Performance',
    fact: 'India hosted the FIFA U-17 Women\'s World Cup with matches across Bhubaneswar, Margao, and Navi Mumbai. While India exited in the group stage, the tournament was significant for boosting grassroots women\'s football infrastructure and securing FIFA\'s praise for organizational excellence. The Khelo India initiative allocated ₹200 crore for women\'s football development post-tournament.',
    category: 'Sports',
    examTag: 'SSC',
    date: 'May 2026'
  },
  {
    id: 'fc-20',
    title: 'ICC Champions Trophy 2025 — Hybrid Model',
    fact: 'The ICC Champions Trophy 2025 was held under a hybrid model — Pakistan hosted the majority of matches, while India\'s matches were held in Dubai (UAE) due to geopolitical considerations. This set a precedent for future ICC events. India reached the final, and the tournament generated over $500 million in broadcasting revenue, marking a record for the Champions Trophy format.',
    category: 'Sports',
    examTag: 'SSC',
    date: 'June 2026'
  }
];

// ──────────────────────────────────────────────
// Quiz Questions — Indian Competitive Exam Style (UPSC/SSC/Banking)
// ──────────────────────────────────────────────
const INITIAL_QUIZZES = [
  {
    id: 'q-1',
    question: 'Consider the following statements regarding the "One Nation One Election" proposal:\n1. It requires an amendment to Article 83 and Article 172 of the Constitution.\n2. It proposes a common electoral roll for all elections.\n3. It was recommended by the committee headed by former President Ram Nath Kovind.\n\nWhich of the above statements is/are correct?',
    options: [
      '1 and 2 only',
      '2 and 3 only',
      '1 and 3 only',
      '1, 2 and 3'
    ],
    answer: 3,
    explanation: 'All three statements are correct. The One Nation One Election proposal requires amendments to Articles 83 and 172 (related to duration of Houses), proposes a common electoral roll prepared by ECI in consultation with SECs, and was recommended by the High-Level Committee chaired by former President Ram Nath Kovind.',
    category: 'Polity & Governance',
    examTag: 'UPSC Prelims'
  },
  {
    id: 'q-2',
    question: 'The Reserve Bank of India\'s "Digital Rupee" (e₹) is based on which of the following concepts?',
    options: [
      'Cryptocurrency based on blockchain like Bitcoin',
      'Central Bank Digital Currency (CBDC) issued as legal tender',
      'A private digital token backed by gold reserves',
      'A UPI-based virtual wallet with no central backing'
    ],
    answer: 1,
    explanation: 'The Digital Rupee (e₹) is a Central Bank Digital Currency (CBDC) issued by RBI as legal tender. Unlike cryptocurrencies, it is centrally issued and not based on a decentralized blockchain. It is pegged 1:1 to the physical rupee and settles instantly without intermediaries.',
    category: 'Economy & Finance',
    examTag: 'Banking'
  },
  {
    id: 'q-3',
    question: 'Consider the following about ISRO\'s Gaganyaan Mission:\n1. It will use the GSLV Mk III (LVM3) launch vehicle.\n2. The Crew Escape System was tested during the D2 Mission.\n3. India will become the fourth country to independently send humans to space.\n\nWhich of the statements given above is/are correct?',
    options: [
      '1 only',
      '1 and 2 only',
      '2 and 3 only',
      '1, 2 and 3'
    ],
    answer: 3,
    explanation: 'All three are correct. Gaganyaan uses the LVM3 (formerly GSLV Mk III) human-rated launch vehicle. The Crew Escape System was validated in the D2 in-flight abort test. Upon success, India will join the USA, Russia, and China as the fourth nation with independent human spaceflight capability.',
    category: 'Science & Technology',
    examTag: 'UPSC Prelims'
  },
  {
    id: 'q-4',
    question: 'The Moidams, recently inscribed as a UNESCO World Heritage Site, are associated with:',
    options: [
      'The Chola Dynasty of Tamil Nadu',
      'The Ahom Dynasty of Assam',
      'The Pallava Dynasty of Andhra Pradesh',
      'The Mughals of Delhi'
    ],
    answer: 1,
    explanation: 'The Moidams are the mound-burial system of the Ahom Dynasty, located in Charaideo, Assam. The Ahom dynasty ruled Assam for nearly 600 years (1228–1826 CE). The Moidams are India\'s 43rd UNESCO World Heritage Site and the first from the Northeast in the cultural category.',
    category: 'Art & Culture',
    examTag: 'UPSC Prelims'
  },
  {
    id: 'q-5',
    question: 'With reference to India\'s Nationally Determined Contributions (NDCs) under the Paris Agreement, consider the following:\n1. India targets 50% cumulative electric power from non-fossil fuel sources by 2030.\n2. India aims to achieve Net Zero emissions by 2050.\n3. India committed to reducing carbon intensity of GDP by 45% by 2030.\n\nWhich of the statements given above is/are correct?',
    options: [
      '1 and 2 only',
      '2 and 3 only',
      '1 and 3 only',
      '1, 2 and 3'
    ],
    answer: 2,
    explanation: 'Statements 1 and 3 are correct. India updated its NDC to target 50% non-fossil fuel power by 2030 and 45% reduction in carbon intensity by 2030 from 2005 levels. However, India\'s Net Zero target is 2070, NOT 2050 — making statement 2 incorrect.',
    category: 'Environment & Ecology',
    examTag: 'UPSC Prelims'
  },
  {
    id: 'q-6',
    question: 'The India-EFTA Trade and Economic Partnership Agreement (TEPA) was signed with which group of countries?',
    options: [
      'France, Germany, Italy, and Spain',
      'Switzerland, Norway, Iceland, and Liechtenstein',
      'USA, UK, Canada, and Australia',
      'Japan, South Korea, Singapore, and Thailand'
    ],
    answer: 1,
    explanation: 'TEPA was signed between India and the European Free Trade Association (EFTA), which comprises Switzerland, Norway, Iceland, and Liechtenstein. EFTA countries committed $100 billion investment in India over 15 years. EFTA is distinct from the European Union (EU).',
    category: 'International Relations',
    examTag: 'UPSC Prelims'
  },
  {
    id: 'q-7',
    question: 'INS Arighat, recently commissioned into the Indian Navy, is:',
    options: [
      'India\'s first aircraft carrier built domestically',
      'India\'s second nuclear-powered ballistic missile submarine (SSBN)',
      'A stealth guided-missile destroyer',
      'India\'s first diesel-electric submarine with AIP technology'
    ],
    answer: 1,
    explanation: 'INS Arighat (S3) is India\'s second Arihant-class SSBN (nuclear-powered ballistic missile submarine). It strengthens India\'s nuclear triad by ensuring a credible sea-based second-strike capability. It can carry K-15 Sagarika and K-4 submarine-launched ballistic missiles.',
    category: 'Defence & Security',
    examTag: 'UPSC Prelims'
  },
  {
    id: 'q-8',
    question: 'Which of the following is NOT one of the newly added classical languages of India (2024)?',
    options: [
      'Marathi',
      'Bengali',
      'Bhojpuri',
      'Assamese'
    ],
    answer: 2,
    explanation: 'Bhojpuri has NOT been granted classical language status. The five newly added classical languages are Marathi, Pali, Prakrit, Assamese, and Bengali — taking the total to 11. Classical language status provides benefits like a Centre of Excellence, UGC chairs, and international awards for scholars.',
    category: 'Art & Culture',
    examTag: 'SSC'
  },
  {
    id: 'q-9',
    question: 'Consider the following statements about the PM Vishwakarma Yojana:\n1. It covers 18 traditional trades including carpentry, blacksmithing, and pottery.\n2. It provides collateral-free credit up to ₹3 lakh.\n3. It is exclusively for SC/ST artisans only.\n\nWhich of the above statements is/are correct?',
    options: [
      '1 and 2 only',
      '2 and 3 only',
      '1 only',
      '1, 2 and 3'
    ],
    answer: 0,
    explanation: 'Statements 1 and 2 are correct. PM Vishwakarma covers 18 trades and provides credit up to ₹3 lakh. Statement 3 is incorrect — the scheme is for ALL traditional artisans and craftspeople irrespective of caste, identified through family-based traditional skills. It is NOT limited to SC/ST.',
    category: 'Economy & Finance',
    examTag: 'SSC'
  },
  {
    id: 'q-10',
    question: 'The "lateral entry" scheme in Indian civil services allows recruitment of:',
    options: [
      'Foreign nationals for diplomatic positions',
      'Private sector specialists at Joint Secretary and Director levels in central ministries',
      'Retired military officers for state-level governance',
      'IAS officers from one cadre to another without deputation'
    ],
    answer: 1,
    explanation: 'Lateral entry allows domain experts from the private sector, academia, and PSUs to be recruited at Joint Secretary and Director levels in central government ministries on a contract basis (3-5 years). It aims to bring specialized knowledge into governance but has sparked debate over bypassing reservation provisions.',
    category: 'Polity & Governance',
    examTag: 'UPSC Mains'
  }
];

export function AppProvider({ children }) {
  // ── Theme State ──
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // ── User Authentication State ──
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ── App Data State (fetched from backend) ──
  const [bookmarks, setBookmarks] = useState([]);
  const [history, setHistory] = useState([]);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [articles] = useState(INITIAL_NEWS_ARTICLES);

  // ── Sync Theme ──
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // ── Auto-restore session on mount ──
  useEffect(() => {
    async function restoreSession() {
      const token = api.getAuthToken();
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const data = await api.getCurrentUser();
        setUser(data.user);
        // Fetch user data in parallel
        await Promise.allSettled([
          fetchBookmarks(),
          fetchHistory(),
          fetchCommunityRequests()
        ]);
      } catch {
        // Token expired or invalid — clear it
        api.logoutUser();
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    restoreSession();
  }, []);

  // ── Auth Actions ──
  const login = useCallback(async (credentials) => {
    const data = await api.loginUser(credentials);
    setUser(data.user);
    // Fetch user data after login
    await Promise.allSettled([
      fetchBookmarks(),
      fetchHistory(),
      fetchCommunityRequests()
    ]);
    return data;
  }, []);

  const signup = useCallback(async (userData) => {
    const data = await api.signupUser(userData);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    api.logoutUser();
    setUser(null);
    setBookmarks([]);
    setHistory([]);
  }, []);

  const updateUserProfile = useCallback(async (details) => {
    if (!user) return;
    try {
      const data = await api.updateProfileDetails(details);
      setUser(data.user);
      return data;
    } catch (err) {
      console.error('Update profile error:', err.message);
      throw err;
    }
  }, [user]);

  // ── Bookmark Actions ──
  async function fetchBookmarks() {
    try {
      const data = await api.getUserBookmarks();
      setBookmarks(data.bookmarks || []);
    } catch {
      // Silently fail — user might not be logged in
    }
  }

  const addBookmark = useCallback(async (article) => {
    if (!user) return;
    try {
      await api.addBookmark(article);
      // Optimistically add to state
      setBookmarks(prev => {
        if (prev.some(b => b.articleId === article.id || b.id === article.id)) return prev;
        return [...prev, { ...article, articleId: article.id, createdAt: new Date().toISOString() }];
      });
    } catch (err) {
      console.error('Bookmark error:', err.message);
    }
  }, [user]);

  const removeBookmark = useCallback(async (articleId) => {
    if (!user) return;
    try {
      await api.removeBookmark(articleId);
      setBookmarks(prev => prev.filter(b => b.id !== articleId && b.articleId !== articleId));
    } catch (err) {
      console.error('Remove bookmark error:', err.message);
    }
  }, [user]);

  // ── History Actions ──
  async function fetchHistory() {
    try {
      const data = await api.getUserHistory();
      setHistory(data.history || []);
    } catch {
      // Silently fail
    }
  }

  const addHistoryItem = useCallback(async (claim, result) => {
    // History is auto-logged by the backend on verification.
    // This just updates local state for immediate UI feedback.
    const newItem = {
      id: `hist-${Date.now()}`,
      claim,
      ...result,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50));
  }, []);

  const clearHistory = useCallback(async () => {
    if (!user) return;
    try {
      await api.clearUserHistory();
      setHistory([]);
    } catch (err) {
      console.error('Clear history error:', err.message);
    }
  }, [user]);

  // ── Community Actions ──
  async function fetchCommunityRequests() {
    try {
      const data = await api.getCommunityRequests();
      setCommunityRequests(data.requests || []);
    } catch {
      // Silently fail
    }
  }

  const addCommunityRequest = useCallback(async (claim, category) => {
    if (!user) return;
    try {
      const data = await api.addCommunityRequest({ claim, category });
      setCommunityRequests(prev => [data.request, ...prev]);
    } catch (err) {
      console.error('Community request error:', err.message);
      throw err; // Let the UI component handle the error
    }
  }, [user]);

  const upvoteRequest = useCallback(async (requestId) => {
    if (!user) return;
    try {
      const data = await api.upvoteCommunityRequest(requestId);
      setCommunityRequests(prev => prev.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            upvotes: data.upvotes,
            hasUpvoted: data.upvoted
          };
        }
        return req;
      }));
    } catch (err) {
      console.error('Upvote error:', err.message);
    }
  }, [user]);

  // Refresh community requests (for real-time-ish updates)
  const refreshCommunity = useCallback(() => {
    fetchCommunityRequests();
  }, []);

  return (
    <AppContext.Provider value={{
      theme,
      toggleTheme,
      user,
      authLoading,
      login,
      signup,
      logout,
      updateUserProfile,
      bookmarks,
      addBookmark,
      removeBookmark,
      history,
      addHistoryItem,
      clearHistory,
      communityRequests,
      addCommunityRequest,
      upvoteRequest,
      refreshCommunity,
      articles,
      flashcards: INITIAL_FLASHCARDS,
      quizzes: INITIAL_QUIZZES
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
