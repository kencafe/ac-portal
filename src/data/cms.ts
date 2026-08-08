// cms-content.ts
// VERBATIM extraction from "FPTIS NS Blog CMS.dc.html" design prototype.
// Do NOT paraphrase / translate / shorten. Copy exact text.
// All [placeholder] bracketed text is kept as-is.

// ===========================================================================
// Types
// ===========================================================================

export type BlockKind = 'h' | 'p' | 'quote' | 'list' | 'img';
export type PostStatus = 'Bản nháp' | 'Chờ duyệt' | 'Đã xuất bản';
export type FeedLicense = 'CC BY' | 'CC BY-SA' | 'Cần xin phép' | string;
export type InboxStatus =
  | 'Mới lấy về'
  | 'Đã dịch'
  | 'Chờ duyệt bản dịch'
  | 'Chỉ tóm tắt'
  | 'Đã đăng';

export interface SeedPost {
  slug: string;
  title: string;
  cat: string;
  status: PostStatus;
  date: string;
  author: string;
  excerpt: string;
  tags: string[];
  featured?: boolean;      // pinned to the portal homepage
  coverUrl?: string;       // cover image URL (paste/upload/AI/auto)
  blocks: [BlockKind, string][];
}

export interface Feed {
  id: string;
  name: string;
  url: string;
  cat: string;          // targetCat
  schedule: string;     // intervalHours, human-readable
  last: string;         // lastFetchedAt (placeholder kept)
  license: FeedLicense;
  active: boolean;
}

export interface InboxItem {
  id: string;
  source: string;       // feed source name
  link: string;         // sourceUrl
  license: string;
  status: InboxStatus;
  cat: string;
  titleEn: string;
  titleVi: string;
  original: string[];   // paragraphs
  translated: string[]; // paragraphs
}

// ===========================================================================
// Categories & tone map
//   CATS: the CMS category list (no "Tất cả" here — that only exists on the blog)
//   TONE: category -> tone color hex
// ===========================================================================

export const CATS: string[] = [
  'SRE',
  'AIOps',
  'Cloud Platform',
  'Security',
  'Migration',
  'AI Infrastructure',
];

export const TONE: Record<string, string> = {
  SRE: '#0072BC',
  AIOps: '#F37021',
  'Cloud Platform': '#0072BC',
  Security: '#57A336',
  Migration: '#57A336',
  'AI Infrastructure': '#F37021',
};

// CATEGORIES with color hex. `count` is computed at runtime from posts
// (counts[cat]); in the seed data the derived counts are:
//   SRE 1, AIOps 1, Cloud Platform 1, Security 1, Migration 1, AI Infrastructure 1
export const CATEGORIES: { name: string; color: string; count: number }[] = [
  { name: 'SRE', color: '#0072BC', count: 1 },
  { name: 'AIOps', color: '#F37021', count: 1 },
  { name: 'Cloud Platform', color: '#0072BC', count: 1 },
  { name: 'Security', color: '#57A336', count: 1 },
  { name: 'Migration', color: '#57A336', count: 1 },
  { name: 'AI Infrastructure', color: '#F37021', count: 1 },
];

// Taxonomy view — "Add category" form
export const TAXONOMY_UI = {
  categoriesPanelHead: 'Chuyên mục',
  newCategoryPlaceholder: 'Tên chuyên mục mới',
  addButton: 'Thêm',
  tagsPanelHead: 'Tag đang dùng',
  categoryEditButton: 'Sửa',
  countSuffix: 'bài', // "{count} bài"
};

// ===========================================================================
// TAGS — usage counts are derived at runtime from SEED posts' tags (tagCount).
// From the SEED data below, each tag appears exactly once:
//   SLO 1, Error budget 1, On-call 1, AIOps 1, Alerting 1, MTTR 1,
//   6R 1, Cutover 1, Landing zone 1, FinOps 1, GPU 1, MLOps 1,
//   Zero Trust 1, IAM 1
// ===========================================================================

export const TAGS: { name: string; count: number }[] = [
  { name: 'SLO', count: 1 },
  { name: 'Error budget', count: 1 },
  { name: 'On-call', count: 1 },
  { name: 'AIOps', count: 1 },
  { name: 'Alerting', count: 1 },
  { name: 'MTTR', count: 1 },
  { name: '6R', count: 1 },
  { name: 'Cutover', count: 1 },
  { name: 'Landing zone', count: 1 },
  { name: 'FinOps', count: 1 },
  { name: 'GPU', count: 1 },
  { name: 'MLOps', count: 1 },
  { name: 'Zero Trust', count: 1 },
  { name: 'IAM', count: 1 },
];

// ===========================================================================
// SEED — sample posts for the Posts view (verbatim; note bodies are shorter
// abstracts than the full blog articles).
// ===========================================================================

export const SEED: SeedPost[] = [
  {
    slug: 'error-budget',
    title: 'Error budget: cách chúng tôi cân tốc độ phát hành và độ ổn định',
    cat: 'SRE',
    status: 'Đã xuất bản',
    date: '[Ngày đăng]',
    author: 'Đội SRE — FPT-IS Next Gen Service',
    excerpt:
      'Một hệ thống “không bao giờ được lỗi” thường là hệ thống chậm đổi mới nhất.',
    tags: ['SLO', 'Error budget', 'On-call'],
    blocks: [
      [
        'p',
        'Khi một hệ thống đặt mục tiêu sẵn sàng 100%, mọi thay đổi đều trở thành rủi ro không được phép xảy ra.',
      ],
      ['h', 'Error budget là gì'],
      ['p', 'Phần còn lại của SLO chính là ngân sách rủi ro có giới hạn rõ ràng.'],
    ],
  },
  {
    slug: 'alert-noise',
    title: 'Giảm nhiễu cảnh báo trước khi nghĩ đến machine learning',
    cat: 'AIOps',
    status: 'Đã xuất bản',
    date: '[Ngày đăng]',
    author: 'Đội AIOps — FPT-IS Next Gen Service',
    excerpt:
      'Mô hình phát hiện bất thường không cứu được một hệ thống cảnh báo đã hỏng từ gốc.',
    tags: ['AIOps', 'Alerting', 'MTTR'],
    blocks: [
      [
        'p',
        'Vấn đề thường không nằm ở thuật toán mà ở việc cảnh báo đặt trên chỉ số máy móc.',
      ],
    ],
  },
  {
    slug: 'migration-waves',
    title: 'Di trú theo đợt: chia nhỏ để không đánh cược cả hệ thống',
    cat: 'Migration',
    status: 'Đã xuất bản',
    date: '[Ngày đăng]',
    author: 'Đội Migration — FPT-IS Next Gen Service',
    excerpt:
      'Kinh nghiệm phân loại 6R và thiết kế cửa sổ cutover cho hệ thống nghiệp vụ lớn.',
    tags: ['6R', 'Cutover'],
    blocks: [
      [
        'p',
        'Rủi ro lớn nhất của một dự án di trú không phải kỹ thuật, mà là phạm vi.',
      ],
    ],
  },
  {
    slug: 'landing-zone',
    title: 'Landing zone: những quyết định khó sửa nếu làm sai từ đầu',
    cat: 'Cloud Platform',
    status: 'Chờ duyệt',
    date: '[Ngày đăng]',
    author: 'Đội Cloud Platform — FPT-IS Next Gen Service',
    excerpt:
      'Mô hình tài khoản, phân vùng mạng và chuẩn tagging rất khó thay đổi về sau.',
    tags: ['Landing zone', 'FinOps'],
    blocks: [['p', 'Landing zone là tập hợp các quyết định về ranh giới.']],
  },
  {
    slug: 'gpu-utilization',
    title: 'GPU đắt, nhưng GPU chờ việc còn đắt hơn',
    cat: 'AI Infrastructure',
    status: 'Bản nháp',
    date: '[Ngày đăng]',
    author: 'Đội AI Infrastructure — FPT-IS Next Gen Service',
    excerpt:
      'Chỉ số cần theo dõi không phải số GPU, mà là tỷ lệ sử dụng thực tế.',
    tags: ['GPU', 'MLOps'],
    blocks: [
      [
        'p',
        'Một cluster đúng cấu hình vẫn có thể hiệu quả thấp nếu card chờ dữ liệu.',
      ],
    ],
  },
  {
    slug: 'zero-trust-thuc-te',
    title:
      'Zero Trust trong thực tế: bắt đầu từ danh tính, không từ thiết bị mạng',
    cat: 'Security',
    status: 'Bản nháp',
    date: '[Ngày đăng]',
    author: 'Đội Cloud Security — FPT-IS Next Gen Service',
    excerpt: 'Phần lớn công việc nằm ở quản trị danh tính và thu hẹp quyền.',
    tags: ['Zero Trust', 'IAM'],
    blocks: [
      ['p', 'Câu hỏi đầu tiên là hiện tại ai đang có quyền gì, và vì sao.'],
    ],
  },
];

// ===========================================================================
// EDITOR — block types (KINDS) and status options
// ===========================================================================

export const KINDS: { k: BlockKind; label: string; hint: string; rows: number }[] =
  [
    { k: 'h', label: 'Tiêu đề', hint: 'Tiêu đề mục', rows: 1 },
    { k: 'p', label: 'Đoạn văn', hint: 'Nội dung đoạn…', rows: 3 },
    { k: 'quote', label: 'Trích dẫn', hint: 'Câu trích dẫn nổi bật', rows: 2 },
    { k: 'list', label: 'Danh sách', hint: 'Mỗi dòng một gạch đầu dòng', rows: 3 },
    { k: 'img', label: 'Ảnh', hint: 'Link ảnh (hoặc upload / tạo bằng AI)', rows: 1 },
  ];

export const EDITOR_UI = {
  contentPanelHead: 'Nội dung bài viết',
  fields: {
    title: { label: 'Tiêu đề', placeholder: 'Nhập tiêu đề bài viết' },
    slug: { label: 'Đường dẫn (slug)', prefix: '/blog/', placeholder: 'duong-dan-bai-viet' },
    excerpt: {
      label: 'Tóm tắt (standfirst)',
      placeholder: 'Hai đến ba câu mô tả nội dung bài viết',
    },
    blocksLabel: 'Khối nội dung',
  },
  blockAddPrefix: '+ ', // "+ Tiêu đề", "+ Đoạn văn", etc.
  publishPanelHead: 'Xuất bản',
  statusFieldLabel: 'Trạng thái',
  statusPicker: ['Bản nháp', 'Chờ duyệt', 'Đã xuất bản'] as PostStatus[],
  dateFieldLabel: 'Ngày xuất bản',
  datePlaceholder: '[dd/mm/yyyy]',
  authorFieldLabel: 'Tác giả',
  authorPlaceholder: 'Đội SRE — FPT-IS Next Gen Service',
  saveButton: 'Lưu bài viết',
  saveButtonDone: 'Đã lưu ✓',
  cancelButton: 'Huỷ',
  taxonomyPanelHead: 'Phân loại',
  categoryFieldLabel: 'Chuyên mục',
  tagFieldLabel: 'Tag',
  tagPlaceholder: 'Nhập tag rồi Enter',
  coverPanelHead: 'Ảnh bìa',
  coverDropText: 'Kéo ảnh vào đây hoặc chọn từ thư viện',
  coverHint: 'Khuyến nghị 1200×630px',
  coverPathTemplate: 'assets/cover-{slug}.png',
};

// New draft defaults (newDraft())
export const NEW_DRAFT_DEFAULTS = {
  slug: '',
  title: '',
  cat: 'SRE', // CATS[0]
  status: 'Bản nháp' as PostStatus,
  date: '[Ngày đăng]',
  author: '',
  excerpt: '',
  tags: [] as string[],
  coverUrl: '',
  blocks: [['p', '']] as [BlockKind, string][],
};

// ===========================================================================
// FEEDS — RSS/Atom sources
// ===========================================================================

export const FEEDS: Feed[] = [
  {
    id: 'cncf',
    name: 'CNCF Blog',
    url: 'https://www.cncf.io/feed/',
    cat: 'Cloud Platform',
    schedule: '6 giờ / lần',
    last: '[hh:mm dd/mm]',
    license: 'CC BY',
    active: true,
  },
  {
    id: 'k8s',
    name: 'Kubernetes Blog',
    url: 'https://kubernetes.io/feed.xml',
    cat: 'Cloud Platform',
    schedule: '6 giờ / lần',
    last: '[hh:mm dd/mm]',
    license: 'CC BY',
    active: true,
  },
  {
    id: 'redhat',
    name: 'Red Hat Developer',
    url: 'https://developers.redhat.com/blog/feed',
    cat: 'AI Infrastructure',
    schedule: '12 giờ / lần',
    last: '[hh:mm dd/mm]',
    license: 'Cần xin phép',
    active: true,
  },
  {
    id: 'sre',
    name: 'Google SRE',
    url: 'https://sre.google/feed.xml',
    cat: 'SRE',
    schedule: '24 giờ / lần',
    last: '[hh:mm dd/mm]',
    license: 'Cần xin phép',
    active: false,
  },
  {
    id: 'hashi',
    name: 'HashiCorp Blog',
    url: 'https://www.hashicorp.com/blog/feed.xml',
    cat: 'Security',
    schedule: '12 giờ / lần',
    last: '[hh:mm dd/mm]',
    license: 'Cần xin phép',
    active: true,
  },
];

// Feeds view UI
export const FEEDS_UI = {
  panelHead: 'Nguồn RSS / Atom',
  tableHead: ['Nguồn', 'Chuyên mục đích', 'Tần suất', 'Lần lấy gần nhất', 'Bản quyền', 'Thao tác'],
  fetchButton: 'Lấy ngay',
  fetchedLabel: 'vừa xong', // after onFetch
  pauseButton: 'Tạm dừng',
  resumeButton: 'Bật lại',
  pausedLastLabel: 'đã tạm dừng', // shown in "last" cell when inactive
  addFeed: {
    urlPlaceholder: 'https://example.com/feed.xml',
    addButton: 'Thêm nguồn',
    // new feed defaults on add: schedule "12 giờ / lần", last "chưa lấy", license "Cần kiểm tra", active true
    newFeedDefaults: { schedule: '12 giờ / lần', last: 'chưa lấy', license: 'Cần kiểm tra', active: true },
  },
  copyrightNotice: {
    title: 'Kiểm tra quyền đăng lại trước khi xuất bản',
    text:
      'Chỉ dịch và đăng lại toàn văn khi nguồn cho phép (CC BY, CC BY-SA hoặc có thoả thuận riêng). Với nguồn giữ toàn quyền, hệ thống chỉ tạo bản tóm tắt kèm liên kết gốc. Mọi bài nhập đều bắt buộc có canonical link về nguồn.',
  },
};

// ===========================================================================
// INBOX — translation queue sample items
// ===========================================================================

export const INBOX: InboxItem[] = [
  {
    id: 'i1',
    source: 'Kubernetes Blog',
    link: 'https://kubernetes.io/blog/',
    license: 'CC BY 4.0',
    status: 'Chờ duyệt bản dịch',
    cat: 'Cloud Platform',
    titleEn: 'Sidecar containers graduate to stable',
    titleVi: 'Sidecar container chính thức đạt trạng thái stable',
    original: [
      'Sidecar containers are now stable, giving workloads a first-class way to run helper processes alongside the main application container.',
      'The new lifecycle guarantees that sidecars start before application containers and terminate after them, which removes a long-standing class of shutdown races.',
      'Platform teams should review any custom startup ordering logic that was built to work around the previous behaviour.',
    ],
    translated: [
      'Sidecar container đã đạt trạng thái stable, cho phép workload chạy các tiến trình phụ trợ song song với container ứng dụng chính theo cách được hỗ trợ chính thức.',
      'Vòng đời mới bảo đảm sidecar khởi động trước container ứng dụng và kết thúc sau chúng, loại bỏ một nhóm lỗi tranh chấp khi tắt tiến trình tồn tại từ lâu.',
      'Đội nền tảng nên rà soát lại các đoạn logic tự viết để điều khiển thứ tự khởi động — trước đây phải làm vậy để lách hạn chế của cơ chế cũ.',
    ],
  },
  {
    id: 'i2',
    source: 'CNCF Blog',
    link: 'https://www.cncf.io/blog/',
    license: 'CC BY 4.0',
    status: 'Đã dịch',
    cat: 'Cloud Platform',
    titleEn:
      'Platform engineering: what teams get wrong about internal developer platforms',
    titleVi:
      'Platform engineering: những ngộ nhận thường gặp về nền tảng nội bộ cho lập trình viên',
    original: [
      'Many organisations treat an internal developer platform as a portal project, then wonder why adoption stalls after launch.',
      'The teams that succeed treat the platform as a product with real users, a roadmap, and measurable adoption goals.',
    ],
    translated: [
      'Nhiều tổ chức coi nền tảng nội bộ cho lập trình viên là một dự án làm cổng thông tin, rồi không hiểu vì sao mức sử dụng chững lại sau khi ra mắt.',
      'Những đội thành công coi nền tảng là một sản phẩm thật: có người dùng, có lộ trình và có mục tiêu mức độ sử dụng đo được.',
    ],
  },
  {
    id: 'i3',
    source: 'HashiCorp Blog',
    link: 'https://www.hashicorp.com/blog',
    license: 'Cần xin phép',
    status: 'Chỉ tóm tắt',
    cat: 'Security',
    titleEn: 'Rotating database credentials without downtime',
    titleVi:
      'Luân chuyển thông tin đăng nhập cơ sở dữ liệu không cần dừng dịch vụ',
    original: [
      'A pattern for issuing short-lived database credentials so that rotation never requires an application restart.',
    ],
    translated: [
      'Mô hình phát hành thông tin đăng nhập cơ sở dữ liệu có thời hạn ngắn, nhờ đó việc luân chuyển không đòi hỏi khởi động lại ứng dụng.',
    ],
  },
  {
    id: 'i4',
    source: 'Red Hat Developer',
    link: 'https://developers.redhat.com/blog',
    license: 'Cần xin phép',
    status: 'Mới lấy về',
    cat: 'AI Infrastructure',
    titleEn: 'Serving large language models on OpenShift AI',
    titleVi: '',
    original: [
      'A walkthrough of deploying an inference service with GPU scheduling and autoscaling on OpenShift AI.',
    ],
    translated: [],
  },
  {
    id: 'i5',
    source: 'Kubernetes Blog',
    link: 'https://kubernetes.io/blog/',
    license: 'CC BY 4.0',
    status: 'Mới lấy về',
    cat: 'SRE',
    titleEn: 'Understanding pod disruption budgets in practice',
    titleVi: '',
    original: [
      'Pod disruption budgets protect availability during voluntary disruptions, but only if they reflect the real capacity of the workload.',
    ],
    translated: [],
  },
];

// Inbox view UI
export const INBOX_UI = {
  searchPlaceholder: 'Tìm trong hàng chờ…',
  tabs: ['Tất cả', 'Mới lấy về', 'Đã dịch', 'Chờ duyệt bản dịch'],
  translateSelectedButton: 'Dịch các bài đã chọn',
  tableHead: ['', 'Bài gốc', 'Nguồn', 'Trạng thái', 'Thao tác'],
  openTranslationButton: 'Mở bản dịch',
  untranslatedTitlePlaceholder: '— chưa dịch —', // shown when titleVi empty
  // On "Dịch các bài đã chọn": items with status "Mới lấy về" & checked ->
  // status "Đã dịch", titleVi/translated default "[bản dịch AI — chờ biên tập]"
  aiDraftPlaceholder: '[bản dịch AI — chờ biên tập]',
  // items are checked by default when status === "Mới lấy về"
};

// ===========================================================================
// TRANSLATE workspace — config, glossary, checklist
// ===========================================================================

export const TRANSLATE_UI = {
  panelHeadEn: 'Bản gốc · English',
  panelHeadVi: 'Bản dịch · Tiếng Việt',
  aiBadge: 'AI',
  sourceLabel: 'Nguồn:', // "Nguồn: <source> · <license>"
  retranslateButton: 'Dịch lại bằng AI',
  retranslateButtonBusy: 'Đang dịch lại…',
  toDraftButton: 'Chuyển thành bài nháp',
  configPanelHead: 'Cấu hình dịch',
  glossaryPanelHead: 'Từ điển thuật ngữ',
  checklistPanelHead: 'Kiểm tra trước khi đăng',
};

export const TRANSLATE_CONFIG = {
  toneLabel: 'Giọng văn',
  toneOptions: ['Kỹ thuật, trung tính', 'Gần gũi', 'Trang trọng'],
  toneDefault: 'Kỹ thuật, trung tính',
  depthLabel: 'Mức biên tập',
  depthOptions: ['Dịch sát bản gốc', 'Dịch thoáng', 'Viết lại có dẫn nguồn'],
  depthDefault: 'Dịch sát bản gốc',
  checkboxes: {
    keepTerms: 'Giữ nguyên thuật ngữ kỹ thuật tiếng Anh', // default checked
    addCanonical: 'Chèn canonical link và ghi nguồn cuối bài', // default checked
  },
};

// Glossary sample rows (en -> vi)
export const GLOSSARY: { en: string; vi: string }[] = [
  { en: 'error budget', vi: 'error budget (giữ nguyên)' },
  { en: 'landing zone', vi: 'landing zone (giữ nguyên)' },
  { en: 'observability', vi: 'khả năng quan sát' },
  { en: 'blameless postmortem', vi: 'phân tích sự cố không quy trách nhiệm' },
  { en: 'least privilege', vi: 'quyền tối thiểu' },
  { en: 'workload', vi: 'workload (giữ nguyên)' },
];

// Glossary add form placeholders
export const GLOSSARY_UI = {
  enPlaceholder: 'thuật ngữ gốc',
  viPlaceholder: 'cách dịch',
  addButton: 'Thêm',
};

// Prepublish checklist (4 items). `ok` shown: false -> "!" (orange), true -> "✓" (green).
// The 'ok' values reflect the seed state (addCanonical default = true).
export const PREPUBLISH_CHECKLIST: { label: string; ok: boolean }[] = [
  { label: 'Có canonical link về bài gốc', ok: true }, // = state.addCanonical
  { label: 'Ghi rõ tên nguồn và tác giả gốc', ok: true },
  { label: 'Giấy phép nguồn cho phép đăng lại', ok: true },
  { label: 'Đã có người biên tập đọc lại bản dịch', ok: false },
];

// onToDraft() creates a post: author "Biên dịch — FPT-IS Next Gen Service",
// status "Chờ duyệt", tags ["Dịch", <source>], excerpt = translated[0].slice(0,160)

// ===========================================================================
// API_PROVIDERS — translation providers + model lists + connection defaults
// ===========================================================================

export const API_PROVIDERS: {
  name: string;
  desc: string;
  defaultState: string;
  models: string[];
}[] = [
  {
    name: 'Claude (Anthropic)',
    desc: 'Chất lượng dịch kỹ thuật tốt, giữ thuật ngữ ổn định',
    defaultState: 'Đang dùng',
    models: ['claude-sonnet-4-5', 'claude-opus-4-1', 'claude-haiku-4-5'],
  },
  {
    name: 'OpenAI',
    desc: 'Hệ sinh thái rộng, nhiều model để chọn',
    defaultState: 'Chưa cấu hình',
    models: ['gpt-4.1', 'gpt-4o', 'gpt-4o-mini'],
  },
  {
    name: 'Google Gemini',
    desc: 'Giá thấp cho khối lượng lớn',
    defaultState: 'Chưa cấu hình',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash'],
  },
  {
    name: 'Mô hình nội bộ (self-hosted)',
    desc: 'Dữ liệu không rời hạ tầng của tổ chức',
    defaultState: 'Chưa cấu hình',
    models: ['qwen2.5-72b-instruct', 'llama-3.3-70b-instruct'],
  },
];

// Default API connection settings (state.api) — active provider = "Claude (Anthropic)"
export const API_DEFAULTS = {
  activeProvider: 'Claude (Anthropic)',
  endpoint: 'https://api.anthropic.com/v1/messages',
  key: 'sk-ant-••••••••••••••••••••••••',
  model: 'claude-sonnet-4-5',
  temp: '0.2',
  maxTokens: '4000',
  timeout: '60',
  prompt:
    'Dịch bài viết kỹ thuật sau sang tiếng Việt. Giữ nguyên thuật ngữ hạ tầng và tên sản phẩm. Văn phong trung tính, đúng giọng tài liệu kỹ thuật, không thêm ý không có trong bản gốc.',
};

// API view UI strings
export const API_UI = {
  providersPanelHead: 'Nhà cung cấp dịch thuật',
  providerStateInUse: 'Đang dùng',
  providerStateUnconfigured: 'Chưa cấu hình',
  connectionPanelHead: 'Thông tin kết nối — {provider}',
  fields: {
    endpoint: { label: 'Endpoint', placeholder: 'https://api.provider.com/v1/messages' },
    apiKey: { label: 'API key', placeholder: 'sk-...' },
    apiKeyHint:
      'Khoá được lưu ở biến môi trường phía server, không bao giờ gửi xuống trình duyệt.',
    model: 'Model',
    temperature: 'Nhiệt độ (temperature)',
    maxTokens: 'Giới hạn token / bài',
    timeout: 'Timeout (giây)',
    systemPrompt: 'Prompt hệ thống',
  },
  keyShow: 'Hiện',
  keyHide: 'Ẩn',
  testButton: 'Kiểm tra kết nối',
  testButtonBusy: 'Đang kiểm tra…',
  testResult: 'Kết nối thành công · độ trễ [X] ms',
  saveButton: 'Lưu cấu hình',
  saveButtonDone: 'Đã lưu ✓',
  // Limits & cost panel
  limitsPanelHead: 'Giới hạn & chi phí',
  quotaDayLabel: 'Số bài dịch tối đa / ngày',
  quotaDayDefault: '20',
  quotaBudgetLabel: 'Ngân sách tối đa / tháng (USD)',
  quotaBudgetDefault: '200',
  usage: {
    usedThisMonth: 'Đã dùng tháng này',
    usedThisMonthValue: '[X] / {quotaBudget} USD',
    articlesTranslated: 'Số bài đã dịch',
    articlesTranslatedValue: '[X] bài',
    avgTokens: 'Token trung bình / bài',
    avgTokensValue: '[X] token',
    // usage bar fill width = 38%
  },
  limitCheckboxes: {
    autoStop: 'Tự dừng khi vượt ngân sách', // default checked
    autoTranslate: 'Tự dịch bài mới ngay khi lấy về', // default unchecked
    needReview: 'Bắt buộc biên tập viên duyệt trước khi xuất bản', // default checked
  },
  // Public API panel
  publicApiPanelHead: 'API công khai của blog',
  publicApiHint: 'Các endpoint đọc dữ liệu blog cho website và ứng dụng khác.',
  publicKeyLabel: 'Khoá truy cập công khai (read-only)',
  publicKeyDefault: 'pk_live_ns_blog_••••••••',
  rotateButton: 'Tạo khoá mới',
  rotateButtonDone: 'Đã tạo mới',
  webhookLabel: 'Webhook khi có bài mới',
  webhookPlaceholder: 'https://hooks.example.com/blog',
  apiKeyNotice: {
    title: 'Không đưa khoá API vào mã nguồn trang',
    text:
      'Mọi lệnh gọi mô hình dịch phải đi qua backend của CMS. Trang blog công khai chỉ dùng khoá read-only ở trên, không truy cập trực tiếp nhà cung cấp AI.',
  },
};

// ===========================================================================
// PUBLIC_API — 4 read-only endpoints (all GET)
// ===========================================================================

export const PUBLIC_API: { method: string; path: string; desc: string }[] = [
  { method: 'GET', path: '/api/v1/posts', desc: 'Danh sách bài đã xuất bản, hỗ trợ phân trang' },
  { method: 'GET', path: '/api/v1/posts/{slug}', desc: 'Chi tiết một bài viết' },
  { method: 'GET', path: '/api/v1/categories', desc: 'Danh sách chuyên mục kèm số bài' },
  { method: 'GET', path: '/api/v1/feed.xml', desc: 'RSS đầu ra của blog FPT-IS Next Gen Service' },
];

// ===========================================================================
// STATISTICS tiles per view
// ===========================================================================

// Posts view stat tiles. Values are computed from posts; seed-derived numbers shown.
export const POSTS_STATS = [
  { label: 'Tổng bài viết', value: 6, note: 'total = posts.length' },
  { label: 'Đã xuất bản', value: 3, note: 'status === "Đã xuất bản"', color: '#57A336' },
  { label: 'Bản nháp', value: 2, note: 'status === "Bản nháp"', color: '#F37021' },
  { label: 'Chờ duyệt', value: 1, note: 'status === "Chờ duyệt"', color: '#0072BC' },
];

// Feeds view stat tiles. Seed-derived values.
export const FEEDS_STATS = [
  { label: 'Nguồn đang theo dõi', value: 4, note: 'feeds.filter(active).length' },
  { label: 'Bài mới lấy về', value: 5, note: 'inbox.length', color: '#0072BC' },
  { label: 'Chờ dịch / duyệt', value: 5, note: 'inbox.filter(status !== "Đã đăng").length', color: '#F37021' },
  { label: 'Đã đăng từ nguồn', value: 0, note: 'inbox.filter(status === "Đã đăng").length', color: '#57A336' },
];

// ===========================================================================
// Sidebar navigation structure (groups + items + counts/badges)
// ===========================================================================

export const SIDEBAR = {
  brand: {
    name: 'FPT-IS',
    unit: 'NEXT GEN SERVICE',
    sub: 'Content Studio',
    logo: 'assets/ns-logo.png',
  },
  groups: [
    {
      group: 'Nội dung',
      items: [
        { key: 'posts', label: 'Bài viết', icon: '▤', count: '{total}' }, // = posts.length (6)
        { key: 'editor', label: 'Trình soạn thảo', icon: '✎' },
        { key: 'taxonomy', label: 'Chuyên mục & tag', icon: '⛭' },
      ],
    },
    {
      group: 'Nhập nội dung',
      items: [
        { key: 'feeds', label: 'Nguồn RSS', icon: '⟳', count: '{feedCount}' }, // active feeds (4)
        { key: 'inbox', label: 'Hàng chờ biên tập', icon: '↓', badge: '{pendingCount}' }, // pending (5)
        { key: 'aistudio', label: 'AI tự động', icon: '✨' },
      ],
    },
    {
      group: 'Hệ thống',
      items: [
        { key: 'api', label: 'Cấu hình API', icon: '⚿' },
        { key: 'admin', label: 'Quản trị', icon: '⚙' },
      ],
    },
    {
      group: 'Kênh',
      items: [
        { label: 'Xem blog', icon: '↗', href: '/blog' },
        { label: 'Trang chính', icon: '↗', href: '/' },
      ],
    },
  ],
  // note: "inbox" nav is highlighted for both "inbox" and "translate" views
  footer: {
    avatar: 'PVD',
    name: 'dungpv30',
    role: 'Editor',
  },
};

// Topbar / breadcrumb
export const TOPBAR = {
  crumbPrefix: 'Content Studio / ',
  viewLabels: {
    posts: 'Bài viết',
    editor: 'Trình soạn thảo',
    taxonomy: 'Chuyên mục & tag',
    feeds: 'Nguồn RSS',
    inbox: 'Hàng chờ biên tập',
    translate: 'AI biên tập',
    api: 'Cấu hình API',
    admin: 'Quản trị hệ thống',
    aistudio: 'AI tự động',
  },
  saveHint: 'Đã lưu bản mới nhất', // shown when state.saved
  newPostButton: '+ Bài viết mới',
};

// Admin / system-configuration panel.
export const ADMIN_UI = {
  account: {
    title: 'Tài khoản',
    hint: 'Đăng nhập bằng Keycloak (sso.appcarrier.cloud) qua oauth2-proxy.',
    signOut: 'Đăng xuất',
    localBadge: 'Chế độ cục bộ (chưa qua OpenShift)',
    fields: { user: 'Người dùng', email: 'Email', role: 'Vai trò', groups: 'Nhóm OpenShift' },
  },
  site: {
    title: 'Cấu hình site',
    save: 'Lưu cấu hình',
    saved: 'Đã lưu cấu hình',
    adminOnly: 'Chỉ Quản trị mới sửa được cấu hình.',
    fields: {
      siteName: 'Tên site',
      blogHost: 'Tên miền blog',
      postsPerPage: 'Số bài mỗi trang',
      defaultLanguage: 'Ngôn ngữ mặc định',
      requireApprovalToPublish: 'Bắt buộc duyệt trước khi xuất bản (4 mắt)',
      autoPublishAiPosts: 'Tự động xuất bản bài AI biên tập',
    },
  },
  access: {
    title: 'Phân quyền (RBAC)',
    hint: 'Vai trò = realm role trên Keycloak (realm ac-portal); gán tại sso.appcarrier.cloud → Users → Role mapping.',
    cols: ['Vai trò', 'Realm role (Keycloak)', 'Quyền chính'],
    rows: [
      ['Tác giả', 'blog-author', 'Tạo/sửa nháp của mình, gửi duyệt'],
      ['Biên dịch', 'blog-translator', 'Sửa trường bản dịch (vi↔en)'],
      ['Biên tập', 'blog-editor', 'Sửa mọi nháp, duyệt/trả lại'],
      ['Kiểm duyệt', 'blog-publisher', 'Xuất bản / gỡ xuất bản'],
      ['Quản trị', 'blog-admin', 'Toàn quyền + xoá + cấu hình'],
    ] as [string, string, string][],
  },
};

// ===========================================================================
// Posts view — table & toolbar strings
// ===========================================================================

export const POSTS_VIEW_UI = {
  searchPlaceholder: 'Tìm theo tiêu đề hoặc tag…',
  statusTabs: ['Tất cả', 'Đã xuất bản', 'Chờ duyệt', 'Bản nháp'],
  // toolbar count label: `${filtered.length} / ${posts.length} bài`
  countLabelTemplate: '{filtered} / {total} bài',
  tableHead: ['Tiêu đề', 'Chuyên mục', 'Trạng thái', 'Ngày', 'Thao tác'],
  rowSlugPrefix: '/blog/', // "/blog/{slug}"
  editButton: 'Sửa',
  publishButton: 'Xuất bản', // when not published
  hideButton: 'Ẩn', // when published
  emptyTitle: 'Không có bài nào khớp bộ lọc',
  emptyResetButton: 'Xoá bộ lọc',
};

// ===========================================================================
// Status -> pill color mapping (statusStyle):
//   "Đã xuất bản"  -> fg #3F7A26, bg #F0F8EB, border #C6E4B4 (green)
//   "Chờ duyệt"    -> fg #0072BC, bg #E6F1F9, border #B3D5EA (blue)
//   other/"Bản nháp" -> fg #C25A17, bg #FEF1E9, border #F8CBA9 (orange)
// Inbox status -> pill:
//   "Đã đăng"          -> green
//   "Mới lấy về"       -> neutral (ink2 / #FAFAFA / split)
//   "Chỉ tóm tắt"      -> orange
//   other              -> blue
// Feed license -> pill: starts with "CC" -> green, else orange
// ===========================================================================
