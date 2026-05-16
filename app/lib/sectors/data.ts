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

export const RISING_SECTORS: RisingSector[] = [
  {
    id: "ai", name: "Artificial Intelligence", icon: "🤖", color: "#9b72cf",
    candidates: [
      // AI-native software & platforms
      "BBAI","SOUN","RXRX","PATH","AI","GTLB","DDOG","MNDY","VEEV","HIMS",
      "AMBA","IONQ","QUBT","RGTI","TMDX","RBRK","ZS","CRWD","OKTA","UIPATH",
      "ASAN","WDAY","PEGA","EXLS","EPAM","SMCI","NTAP","PSTG","DELL","HPE",
      "CEVA","LPSN","VERI","PRCT","SEMR","BRZE","APPN","PCTY","JAMF","DOCU",
      "SDGR","ABCL","BEAM","EDIT","NTLA","MDB","ESTC","DOMO","SPSC","HUBS",
      "ZI","DOCN","TENB","FIVN","GKOS","IDCC","NTGR","ACMR","POWI","IRBT",
      // SaaS & cloud infrastructure
      "ADSK","ANSS","CDNS","INTU","ADBE","CRM","NOW","TOST","FRSH","PAYC",
      "BILL","SHOP","NCNO","WK","FROG","ALTR","YEXT","BIGC","PRGS","WIX",
      "BL","NTNX","TTD","CRTO","DV","IAS","MGNI","PUBM","ALRM","KVYO",
      "OLO","CART","RDDT","ARM","ANET","PERI","AZPN","MELI","SE","GRAB",
      // AI infrastructure & data
      "PLTR","SNOW","NVDA","MSFT","GOOGL","META","AMZN","ORCL","IBM","TSM",
      "ASML","AMAT","LRCX","KLAC","MU","AMD","QCOM","AVGO","TXN","INTC",
      // Applied AI & vertical SaaS
      "CWAN","TOST","FOUR","PCVX","PHR","ACCD","TDOC","DOCS","OMCL","NXGN",
      "VEEV","EXAS","GDRX","HOLX","MMSI","QDEL","MEDP","ICLR","IQVIA","ICON",
      "CRL","PRTA","REGN","RCUS","KYMR","DNLI","IMCR","ROIV","APLS","SAGE",
      // Enterprise & productivity
      "TWLO","BAND","FIVN","NICE","KNSA","VERA","PSTG","NTAP","NTNX","DDOG",
      "ESTC","MDB","CFLT","NET","FSLY","INFN","VIAV","CIEN","CALX","S",
    ],
  },
  {
    id: "semis", name: "Semiconductors", icon: "💾", color: "#4d9de0",
    candidates: [
      // Large-cap semis
      "NVDA","AMD","INTC","MU","TXN","AVGO","QCOM","AMAT","LRCX","KLAC",
      "TSM","ASML","ARM","ANET","MCHP","ON","SWKS","QRVO","NXPI","MPWR",
      // Mid & small-cap semis
      "WOLF","CRUS","ACLS","FORM","RMBS","SITM","DIOD","AEIS","ICHR","COHU",
      "ONTO","LFUS","AOSL","SGH","LITE","COHR","ALGM","AMKR","VICR","PLXS",
      "SLAB","MACOM","ANSS","CDNS","MKSI","NOVT","UCTT","BRKS","IPGP","VIAV",
      "TTMI","SIMO","AEHR","ACMR","MXL","KLIC","TER","CGNX","MTSI","IDCC",
      // Equipment & materials
      "ENTG","AZTA","CCMP","CMC","AIXI","HIMX","PWRB","POWI","CEVA","AMBA",
      "SMCI","PSTG","NTAP","DELL","HPE","SMTC","IMOS","ISSI","AGTC","NVTS",
      // International ADRs
      "STM","IFNNY","TOELY","SSNLF","ASX","SPNS","DSPG","NPKI","EMKR","RLAY",
      // Packaging & testing
      "ASX","AMKR","UTAC","MFLEX","ONTO","COHU","ICHR","ACLS","FORM","BRKS",
      // Power semis
      "ON","WOLF","AEIS","VICR","LFUS","MPWR","SLAB","DIOD","AOSL","CRUS",
      // RF & wireless
      "QRVO","SWKS","MTSI","MACOM","LITE","COHR","VIAV","IIVI","IPGP","II",
      // Memory & storage
      "MU","WDC","STX","NAND","VNET","PSTG","NTAP","IOTS","SLAB","SGH",
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
      "SEMR","BAND","IRDM","GSAT","VSAT","NCNO","PEGA","WK","ASAN","WDAY",
      "BMBL","MTCH","ANGI","CARG","TDC","OPEN","HOUS","RDDT","OLO","CART",
      // Platforms & marketplaces
      "ABNB","LYFT","DASH","UBER","GRUB","SPOT","ROKU","FUBO","SIRI","WMG",
      "LGF","PARA","FOXA","DISCA","NWSA","IAC","ANGI","CARG","TDC","CARS",
      // Enterprise software
      "ADSK","ANSS","CDNS","AZPN","BL","ALTR","NTNX","YEXT","BIGC","PRGS",
      "WIX","FROG","TOST","FRSH","KVYO","ALRM","CWAN","DV","IAS","MGNI",
      "PUBM","CRTO","TTD","MELI","SE","GRAB","ARM","ANET","PERI","MELI",
      // Cloud infrastructure
      "DDOG","MDB","ESTC","CFLT","NET","FSLY","INFN","VIAV","CIEN","CALX",
      "DOCN","ZI","HUBS","TWLO","BAND","FIVN","NICE","KNSA","VERA","PSTG",
    ],
  },
  {
    id: "health", name: "Healthcare & Biotech", icon: "💊", color: "#4cbb8a",
    candidates: [
      // Gene editing & genomics
      "BEAM","EDIT","NTLA","CRBU","VERV","FATE","TWST","RXRX","ABCL","IOVA",
      "ACAD","NUVB","ARWR","RARE","IONS","KRYS","ALNY","PCVX","XNCR","IMVT",
      "VKTX","HALO","RYTM","AKRO","ALDX","HIMS","TMDX","SDGR","PRGO","NVCR",
      "AXNX","PRCT","GKOS","NTRA","ACCD","PHR","TDOC","DOCS","OMCL","NXGN",
      "VEEV","EXAS","GDRX","HOLX","MMSI","QDEL","MEDP","ICLR","IQVIA","ICON",
      "CRL","PRTA","REGN","RCUS","KYMR","DNLI","IMCR","ROIV","APLS","SAGE",
      // Large pharma & biotech
      "LLY","ABBV","MRK","PFE","AMGN","GILD","BIIB","MRNA","BNTX","REGN",
      "BMY","AZN","NVO","RHHBY","SNY","GSK","TAK","PBR","VTRS","PRGO",
      // Medical devices
      "ISRG","BSX","MDT","ABT","SYK","ZBH","EW","DXCM","PODD","INSP",
      "NTRA","AXNX","PRCT","GKOS","TMDX","MMSI","QDEL","HOLX","EXAS","IDXX",
      // Health IT & services
      "ACCD","PHR","TDOC","DOCS","OMCL","NXGN","VEEV","GDRX","AMWL","ONEM",
      "HIMS","HALO","ACMR","SPNV","OPGN","RPRX","PHAT","TRUP","PETS","WELL",
      // Specialty pharma
      "ARWR","RARE","IONS","ALNY","KRYS","XNCR","IMVT","VKTX","RYTM","AKRO",
      "NUVB","ABCL","IOVA","ACAD","ALDX","PRGO","NVCR","SAGE","APLS","ROIV",
      // CROs & tools
      "ICLR","ICON","CRL","MEDP","IQVIA","TMO","DHR","WAT","BIO","BRKR",
      "NTRA","EXAS","HOLX","QDEL","MMSI","GDRX","VEEV","INSP","PODD","DXCM",
    ],
  },
  {
    id: "energy", name: "Energy & Oil", icon: "🛢️", color: "#e87d3e",
    candidates: [
      // E&P (exploration & production)
      "CIVI","SM","MTDR","VTLE","NOG","CPE","REI","GPOR","CHRD","HPK",
      "TALO","SBOW","ERF","MEG","CNQ","SU","DINO","PARR","FANG","EOG",
      "DVN","COP","PXD","OXY","MRO","APA","CHK","ESTE","BATL","MNRL",
      "VNOM","PHX","FLMN","ROCC","ACDC","NINE","KLXE","NR","DNOW","PTEN",
      "HP","CVE","BTE","GRNT","SWN","RRC","EQT","AR","CRK","CNX",
      // Midstream & pipelines
      "MPLX","TRGP","AM","HESM","WMB","KMI","EPD","MMP","PAA","PAGP",
      "SHLX","DKL","CAPL","PBFX","NBLX","CIVI","NGL","KNOP","GMLP","GLOP",
      // LNG & gas
      "TELL","GLNG","NFE","CLNE","GEVO","GPRE","REX","AMTX","NRGV","ARIS",
      // Refiners & marketing
      "MPC","PSX","VLO","PBF","CLMT","PARR","DINO","ALJ","CALUMET","HF",
      // Oilfield services
      "SLB","HAL","BKR","FTI","CHX","DNOW","NR","KLXE","NINE","ACDC",
      // Integrated majors
      "XOM","CVX","BP","SHEL","TTE","ENB","SU","CNQ","CVE","IMO",
    ],
  },
  {
    id: "defense", name: "Defense & Aerospace", icon: "🛡️", color: "#e05555",
    candidates: [
      // Space & launch
      "RKLB","ASTS","PL","SPIR","MNTS","BKSY","RDW","SATX","IRDM","GSAT",
      // UAM & drones
      "JOBY","ACHR","BLADE","AVAV","KTOS","DRS","BBAI","SKYW","MESA","AIR",
      // Cybersecurity (defense-adjacent)
      "CRWD","ZS","S","OKTA","VRNS","QLYS","TENB","CYBR","LDOS","BAH",
      "SAIC","CACI","MANT","TELOS","MAXR","VSAT","LMT","RTX","NOC","GD",
      // Prime contractors
      "LHX","HII","AXON","HEICO","HWM","CAE","TDG","MOOG","FLIR","CGNX",
      "CEVA","AMOT","DLB","MOBL","GNSS","TTMI","PLXS","WIRE","PRFT","EVTC",
      // C4ISR & intelligence
      "LDOS","BAH","SAIC","CACI","MANT","TELOS","RDWR","SPNS","AMBA","BBAI",
      "DRS","KTOS","AXON","AVAV","HII","GD","NOC","LMT","RTX","LHX",
      // Missile & space systems
      "LMT","NOC","RTX","GD","LHX","HII","TDG","HEICO","HWM","MOOG",
      // Electronics & sensors
      "CGNX","FLIR","AMOT","DLB","MOBL","GNSS","TTMI","PLXS","WIRE","RDWR",
      // Emerging defense tech
      "RKLB","ASTS","BBAI","DRS","KTOS","AVAV","JOBY","ACHR","BLADE","AIR",
      // Government IT
      "LDOS","BAH","SAIC","CACI","MANT","TELOS","CSC","ATOS","PLXS","PRFT",
      // Navy & maritime
      "HII","GD","LMT","NOC","LHX","RTX","KTOS","DRS","HEICO","HWM",
    ],
  },
  {
    id: "finance", name: "Finance & Banking", icon: "🏦", color: "#d4a843",
    candidates: [
      // Fintech & neobanks
      "SOFI","AFRM","UPST","LC","DAVE","NRDS","TREE","PRAA","HOOD","REPAY",
      "FLYW","EVTC","PAYO","BILL","PAYC","FOUR","ROOT","LMND","HIPPO","CNNE",
      // Regional banks
      "WAL","BOKF","IBOC","CVBF","HTLF","CATY","FFIN","SBCF","TRMK","SFNC",
      "COLB","PACW","WAFD","FULT","WSBC","NBTB","NBT","EFSC","HAFC","BANR",
      "UBSI","MBWM","TIXT","STBA","FBMS","CFFN","BRKL","AMNB","ESSA","HONE",
      // Asset managers & brokers
      "ENV","FDS","VRTS","AMG","WDR","IVZ","WETF","MKTX","VIRT","IBKR",
      "LPLA","EVR","PJT","LAZ","MC","HLI","COWN","FBP","PIPR","GCMG",
      // Payments & processing
      "V","MA","AXP","PYPL","SQ","PAYX","FIS","FISV","GPN","WEX",
      "NXPI","RPAY","PAYO","FLYW","EVTC","FOUR","BILL","PAYC","REPAY","NRDS",
      // Insurance & insurtech
      "ROOT","LMND","HIPPO","HGTY","METC","KBSF","HRTG","HIPO","KINS","SNCY",
      // Credit & lending
      "SOFI","AFRM","UPST","LC","DAVE","PRAA","WRLD","FCFS","CACC","EFC",
      // Crypto-adjacent finance
      "COIN","MSTR","HOOD","PYPL","SQ","NVEI","FLYW","REPAY","EVTC","FOUR",
      // Specialty finance
      "GPMT","BXMT","STWD","LADR","MKTX","VIRT","IBKR","LPLA","EVR","MC",
    ],
  },
  {
    id: "ev", name: "EV & Auto", icon: "⚡", color: "#26de81",
    candidates: [
      // EV pure-plays
      "TSLA","RIVN","LCID","NIO","LI","XPEV","FFIE","FSR","GOEV","WKHS",
      "NKLA","AYRO","HYLN","NIU","ADN","SL","SOLO","KNDI","KANDI","ZEV",
      // EV charging
      "BLNK","EVGO","CHPT","VLTA","AMPX","BEEM","AMPE","SHPW","WAVE","OPTT",
      // Lidar & sensors
      "LAZR","INVZ","OUST","AEVA","MVIS","LIDR","VELO","AEYE","LEDS","PGRW",
      // Battery tech
      "QS","ENVX","SLDP","MVST","CBAT","FREYR","ILIKA","NXGN","BATT","LTBR",
      // Battery materials
      "ALB","SQM","LAC","PLL","LTHM","ALTM","MP","SQFL","PGMFF","NOVLF",
      // Legacy auto & suppliers
      "GM","F","TM","HMC","STLA","VWAGY","BMW","MBGYY","LEA","BWA",
      "APTV","MODV","GNSS","DLPH","DAN","VC","SMP","THRM","ADNT","GNTX",
      // Autonomous driving
      "MBLY","TSLA","GOOGL","UBER","LYFT","LAZR","INVZ","OUST","AEVA","MVIS",
      // Auto retail & services
      "AN","KMX","LAD","SAH","GPI","ABG","PAG","CRVL","CVNA","VRM",
      // Two/three-wheelers
      "NIU","AYRO","ZEV","SOLO","KNDI","KANDI","GOEV","AYRO","SL","ADN",
    ],
  },
  {
    id: "cleanenergy", name: "Clean Energy", icon: "🌱", color: "#4cbb8a",
    candidates: [
      // Solar
      "NOVA","SHLS","ARRY","SPWR","MAXN","CSIQ","DQ","JKS","FSLR","ENPH",
      "SEDG","RUN","SUNW","STTK","FTCI","AMPS","PEGI","CWEN","REGI","GPRE",
      // Wind & storage
      "STEM","FLUX","PLUG","BE","HASI","AMRC","CLNE","NRGV","OPTT","MKFG",
      "BWEN","AMSC","KNTK","AY","TERP","CWCO","MSEX","YORW","ARTNA","SJW",
      // Nuclear
      "CEG","SMR","BWX","OKLO","NNE","BWXT","UEC","CCJ","LEU","UUUU",
      "NLR","URG","DNN","PALAF","URA","UROY","LTBR","NUKE","GEV","NANO",
      // Utilities & grid
      "NEE","AES","BEP","NRG","VST","WEC","XEL","EIX","PCG","D",
      "ED","SO","DTE","CNP","AEP","PPL","NI","IDA","EVRG","POR",
      // Hydrogen & fuel cell
      "PLUG","BE","BLOOM","FCEL","HTOO","HYLN","DLOT","HYSR","HYZN","NKLA",
      // Water & recycling
      "AWK","WTRG","AWR","GWRS","SJW","YORW","MSEX","CWCO","ARTNA","PNTM",
      // Carbon & ESG
      "XPEL","CLNV","AMRC","HASI","CWEN","PEGI","AY","TERP","REGI","GPRE",
      // Geothermal & other
      "ORA","WAVE","AMPE","SHPW","FLUX","AMPS","ENVX","QS","SLDP","FREYR",
    ],
  },
  {
    id: "crypto", name: "Crypto & Digital Assets", icon: "₿", color: "#f7b731",
    candidates: [
      // Bitcoin miners
      "MARA","RIOT","CLSK","HUT","BITF","IREN","BTBT","CIFR","WULF","CORZ",
      "SDIG","HIVE","MGTI","BTCS","ARBK","GREE","GRIID","BENF","NBTC","DMGI",
      // Ethereum & alt-coin adjacent
      "COIN","HOOD","MSTR","SQ","PYPL","NVEI","FLYW","REPAY","EVTC","FOUR",
      // Crypto infrastructure
      "NCTY","FRMO","BTCS","EBON","BTCM","CBIT","NXTD","WRAP","RIOT","MARA",
      // Digital asset firms
      "COIN","HOOD","MSTR","GBTC","ETHE","BITO","BTF","BLOK","DAPP","BITS",
      // Fintech with crypto exposure
      "SQ","PYPL","SOFI","HOOD","AFRM","UPST","LC","DAVE","NRDS","TREE",
      // Gaming & NFT
      "RBLX","TTWO","EA","ZNGA","ATVI","GLUU","PENN","GENI","EVERI","AGS",
      // Blockchain infrastructure
      "IBM","ORCL","MSFT","AMZN","GOOGL","META","TSM","NVDA","AMD","INTC",
      // Payment rails
      "V","MA","AXP","FIS","FISV","GPN","WEX","PAYX","VIRT","MKTX",
      // Web3 & metaverse
      "META","RBLX","U","SNAP","PINS","MTCH","BMBL","IAC","ANGI","CARG",
      // Exchanges & trading
      "COIN","HOOD","IBKR","VIRT","MKTX","EVR","LAZ","MC","HLI","COWN",
    ],
  },
  {
    id: "space", name: "Space & Satellites", icon: "🚀", color: "#45aaf2",
    candidates: [
      // New space (launch & satellites)
      "RKLB","ASTS","PL","SPIR","MNTS","BKSY","RDW","SATX","IRDM","GSAT",
      "VSAT","MAXR","ASTR","SPCE","VORB","CPLP","LVOX","TSAT","TSAT","GHVI",
      // Prime aerospace contractors
      "LMT","RTX","NOC","GD","LHX","HII","BA","AXON","HEICO","TDG",
      "HWM","MOOG","CAE","FLIR","CGNX","DRS","KTOS","AVAV","DRS","BBAI",
      // Satellite communications
      "IRDM","GSAT","VSAT","ASTS","SPIR","PL","BKSY","SATX","MAXR","ORBK",
      // Defense electronics
      "CEVA","AMOT","DLB","MOBL","GNSS","TTMI","PLXS","WIRE","RDWR","SPNS",
      // Earth observation
      "PL","BKSY","SPIR","SATX","MAXR","ORBK","VSAT","IRDM","GSAT","ASTS",
      // Space exploration tech
      "RKLB","ASTR","MNTS","SPCE","VORB","CPLP","LMT","NOC","RTX","BA",
      // Avionics & propulsion
      "HWM","HEICO","TDG","CAE","MOOG","FLIR","CGNX","AMOT","DLB","MOBL",
      // Government IT & analytics
      "LDOS","BAH","SAIC","CACI","MANT","TELOS","MAXR","VRSK","GHM","SPNS",
      // UAM
      "JOBY","ACHR","BLADE","SKYW","MESA","AIR","EVTC","PRFT","RDWR","PLXS",
      // Telecom infrastructure
      "IRDM","GSAT","VSAT","AMT","CCI","SBAC","UNIT","SHEN","LUMN","FYBR",
    ],
  },
  {
    id: "consumer", name: "Consumer & Retail", icon: "🛒", color: "#fd9644",
    candidates: [
      // Beauty, wellness & DTC
      "PRPL","BARK","XPOF","ELF","OLPX","SKIN","HIMS","FIGS","ONON","BIRK",
      // Food & beverage
      "CAVA","BROS","WING","DNUT","TXRH","JACK","CAKE","PLAY","EAT","FAT",
      "SHAK","HABT","PZZA","NDLS","RRGB","DIN","FAT","EAT","CAKE","DRI",
      // Discount & specialty retail
      "FIVE","OLLI","BIG","CONN","PRTY","TLYS","BOOT","HIBB","DKNG","PENN",
      "GENI","EVERI","CNTY","AGS","RBLX","TTWO","EA","ZNGA","GLUU","ATVI",
      // Fashion & apparel
      "NKE","LULU","ONON","BIRK","CROX","SKX","DECK","BOOT","HIBB","TLYS",
      "GES","PVH","HBI","KSS","JWN","M","PRTY","LOVE","LESL","CURV",
      // Home & garden
      "HD","LOW","TREX","FBHS","DOOR","MHO","BLDR","GMS","IBP","SITE",
      // Travel & leisure
      "ABNB","LYFT","DASH","UBER","MAR","HLT","H","IHG","RCL","CCL",
      "NCLH","EXPE","BKNG","TRIP","VACN","TNL","SVC","AHOTL","VIEE","PK",
      // Health & personal care
      "HIMS","FIGS","XPOF","ELF","OLPX","SKIN","PRTY","LOVE","LESL","CURV",
      // E-commerce
      "SHOP","ETSY","CHWY","FTCH","REAL","OSTK","OVERSTOCK","WISH","IPOE","VRM",
      // Auto & parts
      "AN","KMX","LAD","SAH","GPI","ABG","PAG","AAP","GPC","ORLY",
      // Entertainment
      "NFLX","DIS","PARA","WMG","LGF","FOXA","SIRI","SPOT","ROKU","FUBO",
    ],
  },
  {
    id: "realestate", name: "Real Estate & REITs", icon: "🏠", color: "#a55eea",
    candidates: [
      // PropTech
      "OPEN","RDFN","EXPI","HOUS","DBRG","SAFE","IIPR","GMRE","GOOD","LAND",
      "PINE","SACH","RC","TWO","MFA","RITM","EARN","RWT","TPVG","STAG",
      // Industrial & logistics
      "EGP","FR","REXR","COLD","PLD","STAG","EGP","FR","REXR","COLD",
      // Self-storage
      "CUBE","EXR","LSI","NSA","PSA","SELF","NSAT","SST","STORAGE","STOR",
      // Residential
      "EQR","AVB","INVH","AMH","NLY","ROIC","KITE","UE","BRX","KIM",
      "CPT","UDR","MAA","ESS","NHI","LTC","CSR","IRET","ELME","VRE",
      // Mortgage REITs
      "NLY","AGNC","PMT","MITT","EFC","GPMT","BXMT","STWD","LADR","TWO",
      "MFA","RITM","EARN","RWT","RC","SACH","BRMK","FBRT","BRSP","TRTX",
      // Office & diversified
      "BXP","VNO","SLG","CUZ","PDM","DEA","OFC","VER","CLPR","ESRT",
      "HIW","PKI","CTRE","CHCT","MPW","PEB","RLJ","SHO","APLE","AHT",
      // Data centers
      "EQIX","DLR","AMT","CCI","SBAC","UNIT","CORR","CLNC","SWCH","CONE",
      // Healthcare REITs
      "WELL","VTR","HR","DOC","LTC","NHI","OHI","SNH","SBRA","CTRE",
      // Net lease
      "O","NNN","EPRT","NTST","ADC","GTY","STOR","ARCP","SPIRIT","PREIT",
      // Hotel REITs
      "MAR","HLT","H","PK","RLJ","SHO","APLE","AHT","CLDT","NXRT",
    ],
  },
];
