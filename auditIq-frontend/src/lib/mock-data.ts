import type { Transaction, Organization, Submission } from './types';

// ─── Organizations ───────────────────────────────────────────
const ORGANIZATIONS: Organization[] = [
  { id: 'org-1', name: 'Tata Motors Ltd', industry: 'Automotive', contactEmail: 'finance@tatamotors.com', logoColor: '#1a73e8' },
  { id: 'org-2', name: 'Reliance Retail', industry: 'Retail & FMCG', contactEmail: 'audit@relianceretail.com', logoColor: '#e53935' },
  { id: 'org-3', name: 'Infosys Technologies', industry: 'IT Services', contactEmail: 'compliance@infosys.com', logoColor: '#0288d1' },
  { id: 'org-4', name: 'Bajaj Auto Ltd', industry: 'Manufacturing', contactEmail: 'accounts@bajajauto.com', logoColor: '#f9a825' },
  { id: 'org-5', name: 'Sun Pharmaceutical', industry: 'Pharmaceuticals', contactEmail: 'finance@sunpharma.com', logoColor: '#43a047' },
];

// ─── Per-Organization Vendors ────────────────────────────────
// Each org has its own industry-specific vendor ecosystem — no cross-contamination
const ORG_VENDORS: Record<string, string[]> = {
  'org-1': [
    'Bharat Forge Components', 'JBM Auto Systems', 'Minda Industries', 'Valeo India Pvt',
    'Denso Haryana Pvt', 'Bosch Ltd', 'Continental AG India', 'Steel Authority India',
    'Tata Steel BSL', 'Schaeffler India', 'Lumax Industries', 'Sona BLW Precision',
    'Mahindra CIE Automotive', 'Sundaram Clayton', 'Endurance Technologies',
  ],
  'org-2': [
    'Hindustan Unilever', 'ITC Limited', 'Nestle India Pvt', 'Procter & Gamble India',
    'Godrej Consumer Products', 'Dabur India Ltd', 'Marico Limited', 'Britannia Industries',
    'Parle Agro Pvt', 'Amul Dairy Cooperative', 'Haldiram Foods', 'Emami Limited',
    'Patanjali Ayurved', 'Future Supply Chain', 'DHL Supply Chain India',
  ],
  'org-3': [
    'AWS India Pvt', 'Microsoft India Pvt', 'Google Cloud India', 'IBM India Pvt',
    'Accenture India', 'SAP Labs India', 'Oracle India Pvt', 'Cisco Systems India',
    'HP Enterprise India', 'Dell Technologies India', 'ServiceNow India', 'Salesforce India',
    'Adobe Systems India', 'Wipro Infrastructure', 'HCL Technologies',
  ],
  'org-4': [
    'Endurance Technologies', 'Varroc Engineering', 'Minda Corporation', 'Bharat Gears Ltd',
    'Exide Industries', 'Amara Raja Batteries', 'MRF Limited', 'CEAT Tyres Ltd',
    'Bosch Chassis Systems', 'Lumax Auto Technologies', 'Sandhar Technologies', 'Suprajit Engineering',
    'Hi-Tech Gears Ltd', 'Shriram Pistons', 'Gabriel India Ltd',
  ],
  'org-5': [
    'Laurus Labs Ltd', 'Divis Laboratories', 'Biocon Limited', 'Dr Reddys Laboratories',
    'Granules India Ltd', 'PI Industries Pvt', 'Aarti Industries', 'SRL Diagnostics',
    'Piramal Enterprises', 'Syngene International', 'Jubilant Pharmova', 'Glenmark Pharma',
    'Torrent Pharmaceuticals', 'Cipla Limited', 'Aurobindo Pharma',
  ],
};

// ─── Per-Organization Categories ─────────────────────────────
const ORG_CATEGORIES: Record<string, string[]> = {
  'org-1': ['Raw Materials', 'Auto Components', 'Logistics', 'Maintenance', 'Capital Equipment', 'Services'],
  'org-2': ['FMCG Procurement', 'Warehousing', 'Distribution', 'Marketing', 'Packaging', 'Cold Storage'],
  'org-3': ['Cloud Infrastructure', 'Software Licenses', 'Consulting', 'Hardware', 'Training', 'Subcontracting'],
  'org-4': ['Sheet Metal', 'Engine Parts', 'Assembly', 'Quality Testing', 'Freight', 'R&D Services'],
  'org-5': ['API Procurement', 'Lab Equipment', 'Clinical Trials', 'Packaging', 'Regulatory', 'Cold Chain'],
};

const ledgerTypes = ['Purchase Ledger', 'Sales Ledger', 'General Ledger'];

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => Math.round((Math.random() * (max - min) + min) * 100) / 100;

const generateDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

const getWeightedVendorIndex = (vendorCount: number) => {
  const r = Math.random();
  if (r < 0.25) return 0;
  if (r < 0.45) return 1;
  if (r < 0.60) return 2;
  if (r < 0.68) return 3;
  if (r < 0.73) return Math.min(7, vendorCount - 1);
  if (r < 0.77) return Math.min(11, vendorCount - 1);
  if (r < 0.82) return Math.min(4, vendorCount - 1);
  if (r < 0.86) return Math.min(5, vendorCount - 1);
  if (r < 0.90) return Math.min(6, vendorCount - 1);
  return rand(Math.min(8, vendorCount - 1), vendorCount - 1);
};

// ─── Public API ──────────────────────────────────────────────

export const getOrganizations = (): Organization[] => ORGANIZATIONS;

/** Generate transactions scoped to a specific organization */
export const generateOrgDataset = (orgId: string, count = 500): Transaction[] => {
  const vendors = ORG_VENDORS[orgId] || ORG_VENDORS['org-1'];
  const categories = ORG_CATEGORIES[orgId] || ORG_CATEGORIES['org-1'];

  return Array.from({ length: count }, (_, i) => {
    const amount = Math.random() > 0.85 ? rand(1, 20) * 100000 : randFloat(5000, 450000);
    const balBefore = randFloat(1000000, 50000000);
    const vendorIdx = getWeightedVendorIndex(vendors.length);
    return {
      id: `${orgId}-txn-${i}`,
      transaction_id: `TXN-${String(i + 1).padStart(4, '0')}`,
      vendor_id: `V${String(vendorIdx + 1).padStart(3, '0')}`,
      vendor_name: vendors[vendorIdx],
      date: generateDate(rand(0, 180)),
      amount,
      ledger_type: ledgerTypes[rand(0, 2)],
      category: categories[rand(0, categories.length - 1)],
      balance_before: balBefore,
      balance_after: balBefore - amount,
    };
  });
};

/** Legacy function — kept for backward compatibility */
export const generateMockTransactions = (count = 200): Transaction[] => {
  return generateOrgDataset('org-1', count);
};

/** Generate pre-seeded submissions for demo — mix of completed, pending */
export const generateSubmissions = (): Submission[] => {
  const now = new Date();
  return [
    {
      id: 'sub-1',
      orgId: 'org-1',
      orgName: 'Tata Motors Ltd',
      fileName: 'TataMotors_FY26_PurchaseLedger.xlsx',
      uploadedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
      status: 'completed',
      rowCount: 500,
      transactions: generateOrgDataset('org-1', 500),
    },
    {
      id: 'sub-2',
      orgId: 'org-2',
      orgName: 'Reliance Retail',
      fileName: 'RelianceRetail_Q3_SalesLedger.csv',
      uploadedAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
      status: 'pending',
      rowCount: 420,
      transactions: generateOrgDataset('org-2', 420),
    },
    {
      id: 'sub-3',
      orgId: 'org-3',
      orgName: 'Infosys Technologies',
      fileName: 'Infosys_FY26_GeneralLedger.xlsx',
      uploadedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
      status: 'completed',
      rowCount: 380,
      transactions: generateOrgDataset('org-3', 380),
    },
    {
      id: 'sub-4',
      orgId: 'org-4',
      orgName: 'Bajaj Auto Ltd',
      fileName: 'BajajAuto_FY26_VendorPayments.xlsx',
      uploadedAt: new Date(now.getTime() - 0.5 * 86400000).toISOString(),
      status: 'pending',
      rowCount: 310,
      transactions: generateOrgDataset('org-4', 310),
    },
    {
      id: 'sub-5',
      orgId: 'org-5',
      orgName: 'Sun Pharmaceutical',
      fileName: 'SunPharma_FY26_APICosts.csv',
      uploadedAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      status: 'completed',
      rowCount: 460,
      transactions: generateOrgDataset('org-5', 460),
    },
  ];
};
