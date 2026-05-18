export interface SectorStock {
  ticker: string;
  name: string;
}

export interface Sector {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;
  stocks: SectorStock[];
  backup: SectorStock[];
}

export interface RisingSector {
  id: string;
  name: string;
  icon: string;
  color: string;
  candidates: string[];
}

export const SECTORS: Sector[] = [
  {
    id: "ai", name: "Artificial Intelligence", desc: "AI platforms, foundation models, enterprise software",
    icon: "🤖", color: "#9b72cf",
    stocks: [
      { ticker: "NVDA", name: "NVIDIA" }, { ticker: "MSFT", name: "Microsoft" },
      { ticker: "GOOGL", name: "Alphabet" }, { ticker: "META", name: "Meta Platforms" },
      { ticker: "AMZN", name: "Amazon" }, { ticker: "ORCL", name: "Oracle" },
      { ticker: "IBM", name: "IBM" }, { ticker: "PLTR", name: "Palantir" },
      { ticker: "CRM", name: "Salesforce" }, { ticker: "SNOW", name: "Snowflake" },
    ],
    backup: [
      { ticker: "ADBE", name: "Adobe" }, { ticker: "NOW", name: "ServiceNow" },
      { ticker: "INTU", name: "Intuit" }, { ticker: "PANW", name: "Palo Alto Networks" },
    ],
  },
  {
    id: "semis", name: "Semiconductors", desc: "Chip design, fabrication equipment, memory",
    icon: "💾", color: "#4d9de0",
    stocks: [
      { ticker: "NVDA", name: "NVIDIA" }, { ticker: "AMD", name: "AMD" },
      { ticker: "INTC", name: "Intel" }, { ticker: "QCOM", name: "Qualcomm" },
      { ticker: "AVGO", name: "Broadcom" }, { ticker: "MU", name: "Micron Technology" },
      { ticker: "AMAT", name: "Applied Materials" }, { ticker: "LRCX", name: "Lam Research" },
      { ticker: "KLAC", name: "KLA Corporation" }, { ticker: "TXN", name: "Texas Instruments" },
    ],
    backup: [
      { ticker: "MCHP", name: "Microchip Technology" }, { ticker: "ON", name: "ON Semiconductor" },
      { ticker: "SWKS", name: "Skyworks Solutions" }, { ticker: "MPWR", name: "Monolithic Power" },
    ],
  },
  {
    id: "bigtech", name: "Big Tech", desc: "Mega-cap technology platforms and ecosystems",
    icon: "💻", color: "#45aaf2",
    stocks: [
      { ticker: "AAPL", name: "Apple" }, { ticker: "MSFT", name: "Microsoft" },
      { ticker: "GOOGL", name: "Alphabet" }, { ticker: "AMZN", name: "Amazon" },
      { ticker: "META", name: "Meta" }, { ticker: "NFLX", name: "Netflix" },
      { ticker: "ADBE", name: "Adobe" }, { ticker: "CRM", name: "Salesforce" },
      { ticker: "ORCL", name: "Oracle" }, { ticker: "NOW", name: "ServiceNow" },
    ],
    backup: [
      { ticker: "INTU", name: "Intuit" }, { ticker: "TEAM", name: "Atlassian" },
      { ticker: "ZM", name: "Zoom" }, { ticker: "DOCU", name: "DocuSign" },
    ],
  },
  {
    id: "health", name: "Healthcare & Biotech", desc: "Pharma, biotech, insurance, medical devices",
    icon: "💊", color: "#4cbb8a",
    stocks: [
      { ticker: "JNJ", name: "Johnson & Johnson" }, { ticker: "LLY", name: "Eli Lilly" },
      { ticker: "UNH", name: "UnitedHealth" }, { ticker: "ABBV", name: "AbbVie" },
      { ticker: "PFE", name: "Pfizer" }, { ticker: "MRK", name: "Merck" },
      { ticker: "AMGN", name: "Amgen" }, { ticker: "GILD", name: "Gilead Sciences" },
      { ticker: "BSX", name: "Boston Scientific" }, { ticker: "ISRG", name: "Intuitive Surgical" },
    ],
    backup: [
      { ticker: "TMO", name: "Thermo Fisher" }, { ticker: "DHR", name: "Danaher" },
      { ticker: "CVS", name: "CVS Health" }, { ticker: "HCA", name: "HCA Healthcare" },
    ],
  },
  {
    id: "energy", name: "Energy & Oil", desc: "Oil majors, refiners, pipelines, LNG",
    icon: "🛢️", color: "#e87d3e",
    stocks: [
      { ticker: "XOM", name: "ExxonMobil" }, { ticker: "CVX", name: "Chevron" },
      { ticker: "COP", name: "ConocoPhillips" }, { ticker: "SLB", name: "SLB" },
      { ticker: "OXY", name: "Occidental Petroleum" }, { ticker: "MPC", name: "Marathon Petroleum" },
      { ticker: "PSX", name: "Phillips 66" }, { ticker: "VLO", name: "Valero Energy" },
      { ticker: "KMI", name: "Kinder Morgan" }, { ticker: "WMB", name: "Williams Companies" },
    ],
    backup: [
      { ticker: "HAL", name: "Halliburton" }, { ticker: "EOG", name: "EOG Resources" },
      { ticker: "DVN", name: "Devon Energy" }, { ticker: "FANG", name: "Diamondback Energy" },
    ],
  },
  {
    id: "defense", name: "Defense & Aerospace", desc: "Military systems, weapons, government contracts",
    icon: "🛡️", color: "#e05555",
    stocks: [
      { ticker: "LMT", name: "Lockheed Martin" }, { ticker: "RTX", name: "RTX Corp" },
      { ticker: "NOC", name: "Northrop Grumman" }, { ticker: "GD", name: "General Dynamics" },
      { ticker: "LHX", name: "L3Harris" }, { ticker: "HII", name: "Huntington Ingalls" },
      { ticker: "LDOS", name: "Leidos" }, { ticker: "BAH", name: "Booz Allen Hamilton" },
      { ticker: "KTOS", name: "Kratos Defense" }, { ticker: "AXON", name: "Axon Enterprise" },
    ],
    backup: [
      { ticker: "MOOG", name: "Moog Inc." }, { ticker: "HEICO", name: "HEICO Corp" },
      { ticker: "TDG", name: "TransDigm" }, { ticker: "HWM", name: "Howmet Aerospace" },
    ],
  },
  {
    id: "finance", name: "Finance & Banking", desc: "Banks, asset managers, payments, fintech",
    icon: "🏦", color: "#d4a843",
    stocks: [
      { ticker: "JPM", name: "JPMorgan Chase" }, { ticker: "BAC", name: "Bank of America" },
      { ticker: "GS", name: "Goldman Sachs" }, { ticker: "MS", name: "Morgan Stanley" },
      { ticker: "WFC", name: "Wells Fargo" }, { ticker: "C", name: "Citigroup" },
      { ticker: "V", name: "Visa" }, { ticker: "MA", name: "Mastercard" },
      { ticker: "AXP", name: "American Express" }, { ticker: "BLK", name: "BlackRock" },
    ],
    backup: [
      { ticker: "COF", name: "Capital One" }, { ticker: "SCHW", name: "Charles Schwab" },
      { ticker: "USB", name: "U.S. Bancorp" }, { ticker: "TFC", name: "Truist Financial" },
    ],
  },
  {
    id: "ev", name: "EV & Auto", desc: "Electric vehicles, legacy auto, autonomous driving",
    icon: "⚡", color: "#26de81",
    stocks: [
      { ticker: "TSLA", name: "Tesla" }, { ticker: "GM", name: "General Motors" },
      { ticker: "F", name: "Ford" }, { ticker: "RIVN", name: "Rivian" },
      { ticker: "NIO", name: "NIO" }, { ticker: "LI", name: "Li Auto" },
      { ticker: "XPEV", name: "XPeng" }, { ticker: "TM", name: "Toyota" },
      { ticker: "HMC", name: "Honda" }, { ticker: "STLA", name: "Stellantis" },
    ],
    backup: [
      { ticker: "LEA", name: "Lear Corp" }, { ticker: "BWA", name: "BorgWarner" },
      { ticker: "APTV", name: "Aptiv" }, { ticker: "LCID", name: "Lucid Motors" },
    ],
  },
  {
    id: "cleanenergy", name: "Clean Energy", desc: "Solar, wind, renewables, utilities, storage",
    icon: "🌱", color: "#4cbb8a",
    stocks: [
      { ticker: "NEE", name: "NextEra Energy" }, { ticker: "ENPH", name: "Enphase Energy" },
      { ticker: "FSLR", name: "First Solar" }, { ticker: "BEP", name: "Brookfield Renewables" },
      { ticker: "SEDG", name: "SolarEdge" }, { ticker: "PLUG", name: "Plug Power" },
      { ticker: "RUN", name: "Sunrun" }, { ticker: "BE", name: "Bloom Energy" },
      { ticker: "AES", name: "AES Corporation" }, { ticker: "CEG", name: "Constellation Energy" },
    ],
    backup: [
      { ticker: "CWEN", name: "Clearway Energy" }, { ticker: "ORA", name: "Ormat Technologies" },
      { ticker: "ARRY", name: "Array Technologies" }, { ticker: "STEM", name: "Stem Inc." },
    ],
  },
  {
    id: "crypto", name: "Crypto & Digital Assets", desc: "Exchanges, miners, blockchain infrastructure",
    icon: "₿", color: "#f7b731",
    stocks: [
      { ticker: "COIN", name: "Coinbase" }, { ticker: "MSTR", name: "MicroStrategy" },
      { ticker: "MARA", name: "MARA Holdings" }, { ticker: "RIOT", name: "Riot Platforms" },
      { ticker: "CLSK", name: "CleanSpark" }, { ticker: "HUT", name: "Hut 8 Mining" },
      { ticker: "BITF", name: "Bitfarms" }, { ticker: "IREN", name: "Iris Energy" },
      { ticker: "BTBT", name: "Bit Digital" }, { ticker: "HOOD", name: "Robinhood" },
    ],
    backup: [
      { ticker: "CIFR", name: "Cipher Mining" }, { ticker: "WULF", name: "TeraWulf" },
      { ticker: "CORZ", name: "Core Scientific" }, { ticker: "SQ", name: "Block Inc." },
    ],
  },
  {
    id: "space", name: "Space & Satellites", desc: "Launch providers, satellites, space economy",
    icon: "🚀", color: "#45aaf2",
    stocks: [
      { ticker: "RKLB", name: "Rocket Lab" }, { ticker: "ASTS", name: "AST SpaceMobile" },
      { ticker: "GSAT", name: "Globalstar" }, { ticker: "VSAT", name: "Viasat" },
      { ticker: "IRDM", name: "Iridium Comms" }, { ticker: "PL", name: "Planet Labs" },
      { ticker: "LMT", name: "Lockheed Martin" }, { ticker: "NOC", name: "Northrop Grumman" },
      { ticker: "BA", name: "Boeing" }, { ticker: "RTX", name: "RTX Corp" },
    ],
    backup: [
      { ticker: "HWM", name: "Howmet Aerospace" }, { ticker: "TDG", name: "TransDigm" },
      { ticker: "SPCE", name: "Virgin Galactic" }, { ticker: "MNTS", name: "Momentus" },
    ],
  },
  {
    id: "consumer", name: "Consumer & Retail", desc: "E-commerce, brands, restaurants, retail chains",
    icon: "🛒", color: "#fd9644",
    stocks: [
      { ticker: "AMZN", name: "Amazon" }, { ticker: "WMT", name: "Walmart" },
      { ticker: "COST", name: "Costco" }, { ticker: "TGT", name: "Target" },
      { ticker: "HD", name: "Home Depot" }, { ticker: "LOW", name: "Lowe's" },
      { ticker: "NKE", name: "Nike" }, { ticker: "SBUX", name: "Starbucks" },
      { ticker: "MCD", name: "McDonald's" }, { ticker: "CMG", name: "Chipotle" },
    ],
    backup: [
      { ticker: "YUM", name: "Yum Brands" }, { ticker: "DPZ", name: "Domino's Pizza" },
      { ticker: "DRI", name: "Darden Restaurants" }, { ticker: "DKNG", name: "DraftKings" },
    ],
  },
  {
    id: "realestate", name: "Real Estate & REITs", desc: "Property, data centers, industrial, residential",
    icon: "🏠", color: "#a55eea",
    stocks: [
      { ticker: "PLD", name: "Prologis" }, { ticker: "AMT", name: "American Tower" },
      { ticker: "EQIX", name: "Equinix" }, { ticker: "WELL", name: "Welltower" },
      { ticker: "SPG", name: "Simon Property" }, { ticker: "O", name: "Realty Income" },
      { ticker: "DLR", name: "Digital Realty" }, { ticker: "PSA", name: "Public Storage" },
      { ticker: "VICI", name: "VICI Properties" }, { ticker: "CCI", name: "Crown Castle" },
    ],
    backup: [
      { ticker: "EQR", name: "Equity Residential" }, { ticker: "AVB", name: "AvalonBay" },
      { ticker: "INVH", name: "Invitation Homes" }, { ticker: "NLY", name: "Annaly Capital" },
    ],
  },
];

// ─── Rising Stars candidate pools ────────────────────────────────────────────
// Each list is deduplicated within the sector.
// Cross-sector duplicates are resolved at scan-time via the DB dedup.

export const RISING_SECTORS: RisingSector[] = [
  {
    id: "ai", name: "Artificial Intelligence", icon: "🤖", color: "#9b72cf",
    candidates: [
      // AI-native software & platforms
      "BBAI","SOUN","RXRX","PATH","AI","GTLB","DDOG","MNDY","HIMS","AMBA",
      "IONQ","QUBT","RGTI","TMDX","RBRK","ZS","CRWD","OKTA","ASAN","WDAY",
      "PEGA","EXLS","EPAM","SMCI","NTAP","PSTG","CEVA","LPSN","VERI","PRCT",
      "SEMR","BRZE","APPN","PCTY","JAMF","DOCU","SDGR","MDB","ESTC","DOMO",
      "SPSC","HUBS","ZI","DOCN","TENB","FIVN","IDCC","IRBT","ABCL","BEAM",
      // SaaS & cloud platforms
      "ADSK","ANSS","CDNS","INTU","ADBE","CRM","NOW","TOST","FRSH","PAYC",
      "BILL","SHOP","NCNO","WK","FROG","ALTR","YEXT","BIGC","PRGS","WIX",
      "BL","NTNX","TTD","CRTO","DV","IAS","MGNI","PUBM","ALRM","KVYO",
      "OLO","CART","RDDT","ARM","ANET","PERI","AZPN","MELI","SE","GRAB",
      // AI infrastructure & data
      "PLTR","SNOW","CFLT","NET","FSLY","INFN","VIAV","CIEN","CALX","S",
      "TWLO","BAND","NICE","VERA","LSCC","MRVL","ADI","SNPS","INFA","AVPT",
      // Applied AI & vertical SaaS
      "CWAN","FOUR","PHR","ACCD","TDOC","DOCS","OMCL","NXGN","EXAS","GDRX",
      "MEDP","ICLR","IQVIA","ICON","CRL","IMCR","ROIV","APLS","EDIT","NTLA",
      // Enterprise productivity & analytics
      "PCOR","TASK","DUOL","CDAY","GEN","VRNT","RAMP","AMPL","SMAR","CNXC",
      "CXM","MBLY","GENI","ALIT","RSKD","RELY","LAZR","OUST","QTWO","EGHT",
      "RNG","TNET","CCCS","EVCM","DNA","AEVA","INVZ","AVAV","KTOS","DRS",
      // Security AI
      "PANW","FTNT","VRNS","QLYS","CYBR","RDWR","NTCT","OSPN","TELOS",
      // Global AI & digital plays
      "CPNG","STNE","OPEN","CHGG","VNET","GDS","EVBG","LSPD","CPAY","AIXI",
      "INPX","GFAI","BFLY","SSYS","DM","GLOB","PAGS","BEKE","TOTVS","RELY",
      // AI robotics & autonomous
      "LAZR","INVZ","OUST","AEVA","MBLY","AVAV","KTOS","DRS","BBAI","GENI",
    ],
  },
  {
    id: "semis", name: "Semiconductors", icon: "💾", color: "#4d9de0",
    candidates: [
      // Mega-cap & large-cap semis
      "NVDA","AMD","INTC","MU","TXN","AVGO","QCOM","AMAT","LRCX","KLAC",
      "TSM","ASML","ARM","ADI","MCHP","ON","SWKS","QRVO","NXPI","MPWR",
      // Networking & data center silicon
      "MRVL","ANET","LSCC","SYNA","SMCI","NTAP","PSTG","NTNX","WDC","STX",
      // Fabless design — analog, power & mixed-signal
      "WOLF","CRUS","DIOD","AOSL","ALGM","VICR","SLAB","SITM","RMBS","MXL",
      "SMTC","HIMX","POWI","CEVA","AMBA","NVTS","STM","NVTS","INDI","AXTI",
      // RF, optical & photonics
      "MTSI","COHR","LITE","IPGP","LASR","AAOI","EMKR","VIAV","MACOM",
      // EDA & design automation
      "SNPS","CDNS","ANSS","AZPN",
      // Semiconductor equipment & materials
      "ACLS","FORM","AEIS","ICHR","COHU","ONTO","LFUS","AMKR","MKSI","UCTT",
      "AZTA","ENTG","CCMP","ACMR","BRKS","KLIC","TER","CGNX","ASYS","CAMT",
      "NOVA","NOVT","PLXS","TTMI",
      // Packaging & testing
      "ASX","IFNNY","TOELY","IMOS","PLAB","RBCN","OLED",
      // Memory & storage
      "SGH","SIMO",
      // Compound semis & specialty
      "AXTI","INDI","OLED","RBCN","IMOS","PLAB","ASYS","CAMT","NOVA",
      // Additional mid & small-cap
      "ACLS","FORM","RMBS","SITM","DIOD","ALGM","AMKR","VICR","SLAB",
      "ONTO","LFUS","AOSL","COHU","MXL","KLIC","SMTC","HIMX","POWI",
      "EMKR","LASR","AAOI","STM","NVTS","SYNA","INDI","AXTI",
      // Sensor & imaging semis
      "CGNX","ONTO","COHU","FORM","AEHR","TER","KLIC","AMKR","ASX","IMOS",
    ],
  },
  {
    id: "bigtech", name: "Big Tech", icon: "💻", color: "#45aaf2",
    candidates: [
      // Growth internet & SaaS
      "RBLX","SNAP","PINS","TWLO","HUBS","ZI","DOCN","ESTC","MDB","TENB",
      "APPN","PCTY","JAMF","GTLB","BRZE","EXLS","EPAM","DDOG","FSLY","NET",
      "CFLT","CALX","CIEN","INFN","VIAV","CRWD","ZS","OKTA","S","QLYS",
      "VRNS","EVTC","PRFT","SHOP","PAYC","BILL","LSPD","SPSC","DOMO","VEEV",
      "SEMR","BAND","NCNO","PEGA","WK","ASAN","WDAY","BMBL","MTCH","RDDT",
      // Platforms & marketplaces
      "ABNB","LYFT","DASH","UBER","SPOT","ROKU","SIRI","WMG","PARA","FOXA",
      "NWSA","IAC","ANGI","CARG","TDC","CARS","LGF","FUBO","ZETA","TBLA",
      // Enterprise software
      "ADSK","ANSS","CDNS","AZPN","BL","ALTR","NTNX","YEXT","BIGC","PRGS",
      "WIX","FROG","TOST","FRSH","KVYO","ALRM","CWAN","DV","IAS","MGNI",
      "PUBM","CRTO","TTD","PERI","ARM","DOCU","OLO","CART","FOUR","EVCM",
      // Cloud infrastructure & DevOps
      "CFLT","INFN","VIAV","CIEN","CALX","BAND","FIVN","NICE","DOCN","ZI",
      "RAMP","AMPL","SMAR","PCOR","TASK","CCCS","EGHT","RNG","TNET","INFA",
      // Global internet & e-commerce
      "MELI","SE","GRAB","CPNG","STNE","PAGS","GLOB","TOTVS","BEKE","GDS",
      "VNET","LSPD","RELY","OPEN","TDUP","CHGG","EVBG","AVPT","CNXC","GENI",
      // Ad-tech & media-tech
      "DV","IAS","MGNI","PUBM","CRTO","ZETA","TBLA","APPS","SEMR","RDDT",
      // Communications & collaboration
      "EGHT","RNG","FIVN","NICE","BAND","TWLO","VRNT","BRZE","KVYO","PCTY",
      // Security platforms
      "PANW","FTNT","CRWD","ZS","OKTA","S","VRNS","QLYS","TENB","CYBR",
      "GEN","RDWR","NTCT","OSPN","TELOS","RAMP","AMPL","PCOR","TASK","DUOL",
      // Data & analytics
      "SNOW","PLTR","DDOG","ESTC","CFLT","INFA","VRNT","AMPL","RAMP","RDDT",
    ],
  },
  {
    id: "health", name: "Healthcare & Biotech", icon: "💊", color: "#4cbb8a",
    candidates: [
      // Gene editing & genomics
      "BEAM","EDIT","NTLA","CRBU","VERV","FATE","TWST","RXRX","ABCL","IOVA",
      "ACAD","NUVB","ARWR","RARE","IONS","KRYS","ALNY","XNCR","IMVT","VKTX",
      "HALO","RYTM","AKRO","ALDX","TMDX","SDGR","PRGO","NVCR","PRCT","GKOS",
      "NTRA","AXNX","RCUS","KYMR","DNLI","PRTA",
      // Large pharma & biotech
      "LLY","ABBV","MRK","PFE","AMGN","GILD","BIIB","MRNA","BNTX","BMY",
      "AZN","NVO","SNY","GSK","TAK","VTRS","JAZZ","ALKS","INCY","EXEL",
      "HZNP","SGEN","FOLD","ARQT","ACLX","RXST",
      // Medical devices
      "ISRG","BSX","MDT","ABT","SYK","ZBH","EW","DXCM","PODD","INSP",
      "MASI","ALGN","NVRO","ELOS","MMSI","QDEL","HOLX","IDXX","WAT","NEOG",
      "SEER","CDXS","PRME","DNA","BRKR","BIO",
      // Health IT & digital health
      "ACCD","PHR","TDOC","DOCS","OMCL","NXGN","GDRX","AMWL","HIMS","LFMD",
      "WELL","RPRX","TRUP","PETS","CHWY","ONEM","VEEV","ICLR","IQVIA","ICON",
      // Specialty pharma & rare disease
      "ARWR","RARE","IONS","ALNY","KRYS","XNCR","IMVT","VKTX","RYTM","AKRO",
      "NUVB","ABCL","IOVA","ACAD","ALDX","PRGO","NVCR","SAGE","APLS","ROIV",
      "FOLD","ARQT","HZNP","SGEN","INCY","EXEL","ALKS","REGN","IMCR","ROIV",
      // CROs & research tools
      "TMO","DHR","WAT","BIO","BRKR","MEDP","ICLR","IQVIA","ICON","CRL",
      "EXAS","HOLX","QDEL","MMSI","IDXX","NEOG","NTRA","VEEV","DXCM","SEER",
      // Immunology & oncology
      "IMCR","RCUS","KYMR","DNLI","FATE","IOVA","ACAD","BEAM","EDIT","NTLA",
      "CRBU","VERV","NUVB","ARWR","IONS","ALNY","KRYS","XNCR","IMVT","VKTX",
      // Managed care & hospital services
      "HCA","UNH","CVS","CI","ELV","CNC","MOH","HUM","MCK","CAH",
      "HSIC","PDCO","ACCD","PHR","TDOC","DOCS","GDRX","LFMD","AMWL","ONEM",
    ],
  },
  {
    id: "energy", name: "Energy & Oil", icon: "🛢️", color: "#e87d3e",
    candidates: [
      // E&P — large & mega
      "XOM","CVX","COP","OXY","EOG","DVN","FANG","MRO","APA","CHK",
      "CRC","PDCE","CDEV","SWN","RRC","EQT","AR","CRK","CNX","GPOR",
      // E&P — mid cap
      "CIVI","SM","MTDR","VTLE","NOG","CPE","REI","CHRD","HPK","TALO",
      "SBOW","ESTE","BATL","MNRL","VNOM","PHX","GRNT","REX","CTRA","ENLC",
      // E&P — small cap
      "ROCC","NINE","NR","DNOW","PTEN","HP","CVE","BTE","ACDC","STEP",
      "PUMP","LBRT","RES","WTTR","ARIS","NGAS","CTTB","KLXE","CEQP","DT",
      // Midstream & pipelines
      "WMB","KMI","EPD","MPLX","TRGP","AM","HESM","PAA","PAGP","SHLX",
      "DKL","CAPL","NGL","KNOP","GLOP","NBLX","HEP","USAC","NS","SMLP",
      "GLP","MMLP","GMLP","ET","HMLP","CPLP","ENLC","CEQP",
      // LNG & gas infrastructure
      "TELL","GLNG","NFE","CLNE","GEVO","GPRE","AMTX","NRGV","ARIS","NEXT",
      "LNG","CQP","TGP","FLNG",
      // Refiners & marketing
      "MPC","PSX","VLO","PBF","CLMT","PARR","DINO","HF","CAPL","PBFX",
      // Oilfield services
      "SLB","HAL","BKR","FTI","CHX","KLXE","NINE","ACDC","STEP","PUMP",
      "LBRT","RES","WTTR","PTEN","HP","NR","DNOW",
      // Integrated majors
      "XOM","CVX","BP","SHEL","TTE","ENB","SU","CNQ","CVE","IMO",
      // Coal & royalties
      "BTU","ARCH","AMR","METC","CEIX","HCC","SXC","ARLP","FELP","NACCO",
      "VNOM","PHX","MNRL","DMLP","NOG","BATL","ESTE","SBOW",
    ],
  },
  {
    id: "defense", name: "Defense & Aerospace", icon: "🛡️", color: "#e05555",
    candidates: [
      // Prime contractors
      "LMT","RTX","NOC","GD","LHX","HII","BA","LDOS","BAH","SAIC",
      "CACI","MANT","TELOS","AXON","KTOS","DRS","AVAV","MRCY","VSE","OSIS",
      // Aerospace sub-systems
      "HEICO","HWM","TDG","MOOG","CAE","TDY","AIR","SKYW","MESA","TTMI",
      "PLXS","WIRE","AMOT","CGNX","GNSS","RDWR","SPNS","DLB","MOBL","ESE",
      // UAM & drones
      "JOBY","ACHR","BLADE","RKLB","ASTR","MNTS","BBAI","FLIR","AIR",
      // Cybersecurity (defense-grade)
      "PANW","FTNT","CRWD","ZS","S","OKTA","VRNS","QLYS","TENB","CYBR",
      "GEN","RDWR","NTCT","OSPN","ICF","PRFT","EVTC","ACMR",
      // Satellites & comms
      "IRDM","GSAT","VSAT","ASTS","PL","BKSY","SPIR","SATX","MAXR","AMT",
      "CCI","SBAC","LUMN","FYBR","TSAT","LVOX","RDW","GHVI",
      // Electronic warfare & sensors
      "CEVA","AMBA","CGNX","AMOT","TTMI","PLXS","LSCC","NVTS","LASR",
      "AAOI","VIAV","MTSI","EMKR","COHR","IPGP","FNSR","OSIS","TDY",
      // Government IT & analytics
      "LDOS","BAH","SAIC","CACI","MANT","TELOS","PLTR","VRSK","IBM","CSCO",
      "ORCL","ICF","MMS","VSE","MRCY","KTOS","DRS","AXON","AVAV",
      // C4ISR & intelligence
      "MAXR","VSAT","IRDM","GSAT","ASTS","PL","BKSY","SPIR","SATX","ORBK",
      // Industrial with defense exposure
      "HON","GE","MMM","CARR","TT","ITT","ESE","CW","KAMAN","HEI",
      "TDG","HEICO","HWM","MOOG","CAE","FLIR","TDY","TTMI","PLXS","WIRE",
    ],
  },
  {
    id: "finance", name: "Finance & Banking", icon: "🏦", color: "#d4a843",
    candidates: [
      // Fintech & neobanks
      "SOFI","AFRM","UPST","LC","DAVE","NRDS","TREE","PRAA","HOOD","REPAY",
      "FLYW","EVTC","PAYO","BILL","PAYC","FOUR","RELY","NVEI","STNE","PAGS",
      // Regional banks — tier 1
      "WAL","BOKF","IBOC","CVBF","HTLF","CATY","FFIN","SBCF","TRMK","SFNC",
      "COLB","WAFD","FULT","WSBC","NBTB","EFSC","HAFC","BANR","UBSI","MBWM",
      // Regional banks — tier 2
      "STBA","FBMS","BRKL","AMNB","ESSA","HONE","LKFN","NWBI","OCFC","BMTC",
      "SASR","SBSI","FBNC","CCBG","GABC","HIFS","FUNC","CHMG","RBCAA","TIXT",
      // Regional banks — tier 3
      "CVLY","FCNCA","SRCE","CFFI","PFIS","ACNB","WNEB","FNLC","BSRR","COFS",
      "FFBC","HBCP","SFST","CIVB","FMAO","LBAI","MLVF","PBIP","NBTB","EFSC",
      // Asset managers & brokers
      "ENV","FDS","VRTS","AMG","IVZ","WETF","MKTX","VIRT","IBKR","LPLA",
      "EVR","PJT","LAZ","MC","HLI","PIPR","GCMG","STEP","COWN","FBP",
      // Payments & processing
      "PYPL","SQ","PAYX","FIS","FISV","GPN","WEX","RPAY","PAYO","FLYW",
      "EVTC","FOUR","BILL","PAYC","REPAY","NRDS","CPAY","PRTH","NVEI",
      // Insurance & insurtech
      "ROOT","LMND","HIPPO","HGTY","KBSF","HRTG","KINS","RYAN","ACGL","RLI",
      "HIG","MKL","AFG","WRB","ERIE","GLRE","BCRX","SNCY","HIPO","METC",
      // Credit & lending
      "SOFI","AFRM","UPST","LC","DAVE","PRAA","WRLD","FCFS","CACC","EFC",
      "TREE","CURO","RCII","EZCORP","RM","ENOVA","PFSI","GHLD","UWMC",
      // Specialty finance & BDCs
      "GPMT","BXMT","STWD","LADR","RITM","EFC","EARN","RWT","RC","TPVG",
      "BXSL","OBDC","ARCC","FSK","MAIN","GBDC","PSEC","SLRC","CGBD",
    ],
  },
  {
    id: "ev", name: "EV & Auto", icon: "⚡", color: "#26de81",
    candidates: [
      // EV pure-plays
      "TSLA","RIVN","LCID","NIO","LI","XPEV","FSR","GOEV","WKHS","NKLA",
      "AYRO","HYLN","NIU","SL","ZEV","KNDI","FFIE","MULN","SOLO","ADN",
      // EV charging infrastructure
      "BLNK","EVGO","CHPT","VLTA","AMPX","BEEM","AMPE","SHPW","WAVE","OPTT",
      "GEVI","MKFG","FREYR","ENVX","FLUX","STEM","FLNC","AMPX",
      // Lidar & autonomous sensing
      "LAZR","INVZ","OUST","AEVA","MVIS","LIDR","AEYE","MBLY","ARBE","INDI",
      "VLDR","LSCC","CEPTON","OSUR",
      // Battery technology
      "QS","ENVX","SLDP","MVST","CBAT","FREYR","ILIKA","BATT","LTBR","SES",
      "HLTH","BEAM","NKLA","HYLN","GOEV","STEM","FLUX",
      // Battery materials & mining
      "ALB","SQM","LAC","PLL","LTHM","ALTM","MP","SGML","STLD","NLC",
      "UUUU","NXE","FCX","VALE","PLAG","NOVLF","SQFL","BATT",
      // Legacy auto & suppliers
      "GM","F","TM","HMC","STLA","VWAGY","LEA","BWA","APTV","DAN",
      "VC","GNTX","SMP","THRM","ADNT","MODV","MOD","DORM",
      // Autonomous driving software
      "MBLY","LAZR","INVZ","OUST","AEVA","MVIS","AEYE","ARBE","INDI","GOOGL",
      // Auto retail & services
      "AN","KMX","LAD","SAH","GPI","ABG","PAG","CRVL","CVNA","VRM",
      // Fleet & telematics
      "KARO","OSIS","PTVE","FLXN","MOBL","GNSS",
      // Two & three-wheelers
      "NIU","AYRO","ZEV","SOLO","KNDI","KANDI","GOEV","SL","ADN","MULN",
    ],
  },
  {
    id: "cleanenergy", name: "Clean Energy", icon: "🌱", color: "#4cbb8a",
    candidates: [
      // Solar manufacturers & installers
      "NOVA","SHLS","ARRY","SPWR","MAXN","CSIQ","DQ","JKS","FSLR","ENPH",
      "SEDG","RUN","SUNW","FTCI","AMPS","PEGI","CWEN","REGI","GPRE","HASI",
      // Wind & offshore
      "BWEN","AMSC","KNTK","AY","TERP","NEP","ORION","FLNC","AMRC","NRGV",
      "OPTT","MKFG","SPNV","STEM","FLUX",
      // Nuclear & uranium
      "CEG","SMR","BWX","OKLO","NNE","BWXT","UEC","CCJ","LEU","UUUU",
      "URG","DNN","URA","UROY","LTBR","GEV","HPNN","NLR","NANO",
      // Utilities & grid modernization
      "NEE","AES","BEP","NRG","VST","WEC","XEL","EIX","PCG","D",
      "ED","SO","DTE","CNP","AEP","PPL","NI","IDA","EVRG","POR",
      "AWK","ATO","NWE","OGE","AVA","LNT","MDU","PNM","UTL","SRE",
      // Hydrogen & fuel cell
      "PLUG","BE","FCEL","HTOO","HYLN","DLOT","HYSR","HYZN","NKLA","BLOOM",
      "CLNE","OPAL","GEVO","AMTX","REX","NRGV","ARIS",
      // Water & recycling
      "AWK","WTRG","AWR","GWRS","SJW","YORW","MSEX","CWCO","ARTNA","PNTM",
      "ERII","CDZI","EPAC","CECO","CWT","SWWC","ITRI",
      // Energy storage
      "STEM","FLUX","FLNC","AMPX","BEEM","BLNK","CHPT","VLTA","EVGO","ENVX",
      "QS","SLDP","FREYR","MVST","CBAT","ILIKA","BATT","SES",
      // Carbon & ESG
      "XPEL","CLNV","AMRC","HASI","CWEN","PEGI","AY","TERP","REGI","GPRE",
      // Geothermal & other
      "ORA","WAVE","AMPE","SHPW","NOVA","SUNW","FTCI","AMPS",
    ],
  },
  {
    id: "crypto", name: "Crypto & Digital Assets", icon: "₿", color: "#f7b731",
    candidates: [
      // Bitcoin miners
      "MARA","RIOT","CLSK","HUT","BITF","IREN","BTBT","CIFR","WULF","CORZ",
      "SDIG","HIVE","MGTI","BTCS","ARBK","GREE","GRIID","BENF","DMGI","NBTC",
      // Crypto exchanges & prime brokers
      "COIN","HOOD","IBKR","VIRT","MKTX","EVR","LAZ","MC","HLI","COWN",
      // Corporate BTC treasury & strategy
      "MSTR","SQ","PYPL","TSLA","ORCL","NVDA",
      // Digital payment rails
      "NVEI","FLYW","REPAY","EVTC","FOUR","BILL","PAYC","RELY","CPAY","PRTH",
      // Fintech with crypto exposure
      "SOFI","AFRM","UPST","LC","DAVE","NRDS","TREE","STNE","PAGS","GLOB",
      // Web3 infrastructure & blockchain
      "IBM","ORCL","MSFT","AMZN","GOOGL","META","TSM","NVDA","AMD","INTC",
      // Gaming & NFT adjacent
      "RBLX","TTWO","EA","PENN","GENI","EVERI","AGS","DKNG","SKLZ","ZNGA",
      // Web3 & metaverse plays
      "META","RBLX","U","SNAP","PINS","MTCH","BMBL","IAC","ANGI","CARG",
      // Payment infrastructure with crypto rails
      "V","MA","AXP","FIS","FISV","GPN","WEX","PAYX","VIRT","MKTX",
      // ETF issuers & trading platforms
      "BLK","SCHW","LPLA","IBKR","EVR","MC","HLI","PIPR","GCMG","STEP",
    ],
  },
  {
    id: "space", name: "Space & Satellites", icon: "🚀", color: "#45aaf2",
    candidates: [
      // New space — launch vehicles
      "RKLB","ASTR","SPCE","VORB","MNTS","CPLP","GHVI","RDW","LVOX","TSAT",
      // Earth observation & imaging
      "PL","BKSY","SPIR","SATX","MAXR","ORBK","VSAT","IRDM","GSAT","ASTS",
      // Satellite communications
      "IRDM","GSAT","VSAT","ASTS","SPIR","PL","BKSY","SATX","MAXR","AMT",
      "CCI","SBAC","UNIT","SHEN","LUMN","FYBR","TSAT","LVOX","GHVI","RDW",
      // Prime aerospace contractors
      "LMT","RTX","NOC","GD","LHX","HII","BA","AXON","HEICO","TDG",
      "HWM","MOOG","CAE","CGNX","DRS","KTOS","AVAV","LDOS","BAH","SAIC",
      // Defense electronics & avionics
      "CEVA","AMOT","DLB","MOBL","GNSS","TTMI","PLXS","WIRE","RDWR","SPNS",
      "FLIR","AMBA","BBAI","CACI","MANT","TELOS","MAXR","VRSK","GHM","OSIS",
      // Propulsion & space systems
      "LMT","NOC","RTX","BA","HWM","TDG","HEICO","MOOG","CAE","KAMOS",
      // UAM — urban air mobility
      "JOBY","ACHR","BLADE","SKYW","MESA","AIR","RKLB","ASTR","MNTS",
      // Telecom infrastructure
      "AMT","CCI","SBAC","UNIT","SHEN","LUMN","FYBR","TSAT","LVOX","GHVI",
      // Government space IT
      "LDOS","BAH","SAIC","CACI","MANT","TELOS","MAXR","VRSK","GHM","SPNS",
      // Cybersecurity for space assets
      "PANW","FTNT","CRWD","ZS","S","OKTA","VRNS","QLYS","TENB","CYBR",
      // Industrial with space exposure
      "HON","GE","MMM","CARR","TT","ITT","ESE","CW","KAMAN","HEI",
    ],
  },
  {
    id: "consumer", name: "Consumer & Retail", icon: "🛒", color: "#fd9644",
    candidates: [
      // Beauty, wellness & DTC
      "PRPL","BARK","XPOF","ELF","OLPX","SKIN","HIMS","FIGS","ONON","BIRK",
      "CROX","LULU","SKX","DECK","BOOT","HIBB","TLYS","GES","PVH","HBI",
      // Food & beverage brands
      "CAVA","BROS","WING","DNUT","TXRH","JACK","CAKE","PLAY","EAT","FAT",
      "SHAK","HABT","PZZA","NDLS","RRGB","DIN","USFD","PFGC","SYY","CHEF",
      // Discount & specialty retail
      "FIVE","OLLI","BIG","CONN","PRTY","LOVE","LESL","CURV","CATO","DXLG",
      "BURL","TUEM","RVLV","GOOS","LEVI","VFC","JOANN","KSS","JWN","M",
      // Dining — QSR & fast casual
      "YUM","DPZ","DRI","CMG","MCD","QSR","SBUX","WING","TXRH","CAVA",
      "DNUT","JACK","CAKE","EAT","FAT","SHAK","HABT","NDLS","RRGB","PLAY",
      // Home & garden improvement
      "HD","LOW","TREX","FBHS","DOOR","MHO","BLDR","GMS","IBP","SITE",
      "SHW","RPM","AAON","MAS","AZEK","LPX","HXL","CARR","TT","PGRE",
      // Travel & leisure
      "ABNB","LYFT","DASH","UBER","MAR","HLT","H","IHG","RCL","CCL",
      "NCLH","EXPE","BKNG","TRIP","TNL","SVC","PK","VACN","PLNT","SFIX",
      // Health & personal care
      "HIMS","FIGS","XPOF","ELF","OLPX","SKIN","LOVE","LESL","CURV","LFMD",
      "ONEM","AMWL","TDOC","ACCD","PHR","GDRX","TRUP","PETS","CHWY",
      // E-commerce & marketplaces
      "SHOP","ETSY","CHWY","REAL","OSTK","WISH","VRM","CVNA","TDUP","DKNG",
      // Auto & parts retail
      "AN","KMX","LAD","SAH","GPI","ABG","PAG","AAP","GPC","ORLY",
      // Entertainment & gaming
      "NFLX","DIS","PARA","WMG","LGF","FOXA","SIRI","SPOT","ROKU","FUBO",
      "RBLX","TTWO","EA","PENN","GENI","EVERI","AGS","SKLZ","DKNG",
    ],
  },
  {
    id: "realestate", name: "Real Estate & REITs", icon: "🏠", color: "#a55eea",
    candidates: [
      // PropTech & iBuyers
      "OPEN","RDFN","EXPI","HOUS","DBRG","SAFE","IIPR","GMRE","GOOD","LAND",
      "PINE","SACH","RC","TWO","MFA","RITM","EARN","RWT","TPVG","STAG",
      // Industrial & logistics REITs
      "EGP","FR","REXR","COLD","PLD","TRNO","ILPT","LXP","NXRT","PLYM",
      "INDUS","CTT","BSR","BRSP","STAG","IIPR","GMRE","GOOD","LAND","PINE",
      // Self-storage REITs
      "CUBE","EXR","LSI","NSA","PSA","NST","STOR","SELF","SST","REXR",
      // Residential REITs
      "EQR","AVB","INVH","AMH","NLY","ROIC","KITE","UE","BRX","KIM",
      "CPT","UDR","MAA","ESS","NHI","LTC","CSR","IRET","ELME","VRE",
      // Mortgage REITs
      "NLY","AGNC","PMT","MITT","EFC","GPMT","BXMT","STWD","LADR","TWO",
      "MFA","RITM","EARN","RWT","RC","SACH","BRMK","FBRT","BRSP","TRTX",
      "BXSL","OBDC","ARCC","FSK","MAIN","GBDC","PSEC","SLRC","CGBD",
      // Office REITs
      "BXP","VNO","SLG","CUZ","PDM","DEA","OFC","CLPR","ESRT","HIW",
      "PKI","CTRE","MPW","PEB","RLJ","SHO","APLE","AHT","NXRT","CLDT",
      // Data center REITs
      "EQIX","DLR","AMT","CCI","SBAC","UNIT","CORR","CLNC","SWCH","CONE",
      // Healthcare REITs
      "WELL","VTR","HR","DOC","LTC","NHI","OHI","SNH","SBRA","CTRE",
      "CHCT","MPW","PEAK","GMRE","GOOD","CSR","IRET",
      // Net lease REITs
      "O","NNN","EPRT","NTST","ADC","GTY","STOR","SPIRIT","PREIT","WPC",
      // Hotel REITs
      "MAR","HLT","H","PK","RLJ","SHO","APLE","AHT","CLDT","NXRT",
    ],
  },
];
