// posts-content.ts
// VERBATIM extraction from "FPTIS NS Blog.dc.html" design prototype.
// Do NOT paraphrase / translate / shorten. Copy exact text.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BlockKind = 'h' | 'p' | 'quote' | 'list' | 'img';

export interface Block {
  kind: BlockKind;
  text?: string;      // for 'h' | 'p' | 'quote'
  items?: string[];   // for 'list'
}

export interface Post {
  slug: string;
  cat: string;                // category name
  tone: string;               // category tone color hex from source
  featured?: boolean;
  title: string;
  excerpt: string;            // also used as the article standfirst
  author: string;
  role: string;
  initials: string;
  date: string;               // placeholder kept verbatim
  read: string;
  tags: string[];
  coverUrl: string;           // derived: assets/cover-<slug>.png
  blocks: Block[];
}

// ---------------------------------------------------------------------------
// POSTS — 6 articles (verbatim article bodies)
// ---------------------------------------------------------------------------

export const POSTS: Post[] = [
  {
    slug: 'error-budget',
    cat: 'SRE',
    tone: '#0072BC',
    featured: true,
    title: 'Error budget: cách chúng tôi cân tốc độ phát hành và độ ổn định',
    excerpt:
      'Một hệ thống “không bao giờ được lỗi” thường là hệ thống chậm đổi mới nhất. Error budget biến câu hỏi cảm tính đó thành một con số mà cả kỹ thuật và nghiệp vụ đều đồng ý được.',
    author: 'Đội SRE — FPT-IS Next Gen Service',
    role: 'Site Reliability Engineering',
    initials: 'SRE',
    date: '05/08/2026',
    read: '8 phút đọc',
    tags: ['SLO', 'Error budget', 'On-call', 'Postmortem'],
    coverUrl: 'assets/cover-error-budget.png',
    blocks: [
      {
        kind: 'p',
        text: 'Khi một hệ thống đặt mục tiêu sẵn sàng 100%, mọi thay đổi đều trở thành rủi ro không được phép xảy ra. Kết quả thường thấy: quy trình phê duyệt dài, phát hành theo quý, và cuối cùng là một lần go-live lớn mang theo toàn bộ rủi ro đã dồn nén.',
      },
      { kind: 'h', text: 'Error budget là gì' },
      {
        kind: 'p',
        text: 'Nếu SLO của một hành trình nghiệp vụ là 99,9% trong 30 ngày, phần 0,1% còn lại chính là error budget — khoảng thời gian hệ thống được phép không đạt mục tiêu. Đây không phải sự cho phép cẩu thả, mà là ngân sách rủi ro có giới hạn rõ ràng.',
      },
      {
        kind: 'quote',
        text: 'Còn ngân sách thì đội phát triển được phát hành. Hết ngân sách thì ưu tiên chuyển sang việc làm hệ thống ổn định lại.',
      },
      { kind: 'h', text: 'Ba việc cần làm trước khi đặt con số' },
      {
        kind: 'list',
        items: [
          'Xác định hành trình người dùng quan trọng — không đặt SLO cho từng máy chủ, mà cho việc người dùng cần làm.',
          'Đo được trước khi cam kết: nếu chưa có dữ liệu ba tháng, con số SLO chỉ là mong muốn.',
          'Thống nhất với phía nghiệp vụ về hệ quả khi hết ngân sách, trước khi sự cố đầu tiên xảy ra.',
        ],
      },
      { kind: 'h', text: 'Điều thường bị bỏ qua' },
      {
        kind: 'p',
        text: 'Error budget chỉ có tác dụng nếu nó dẫn đến quyết định. Nếu ngân sách cạn mà mọi thứ vẫn tiếp diễn như cũ, con số đó chỉ là một ô trên dashboard. Trong các hệ thống chúng tôi vận hành, quy tắc dừng phát hành được ghi vào tài liệu vận hành và được chính đội phát triển đồng thuận từ đầu.',
      },
      {
        kind: 'p',
        text: 'Điểm cuối: hãy đi kèm blameless postmortem. Nếu mỗi lần cạn ngân sách là một lần tìm người chịu trách nhiệm, đội vận hành sẽ học cách che số liệu thay vì cải thiện hệ thống.',
      },
    ],
  },
  {
    slug: 'alert-noise',
    cat: 'AIOps',
    tone: '#F37021',
    title: 'Giảm nhiễu cảnh báo trước khi nghĩ đến machine learning',
    excerpt:
      'Mô hình phát hiện bất thường không cứu được một hệ thống cảnh báo đã hỏng từ gốc. Ba việc phải làm với dữ liệu vận hành trước khi nói đến AIOps.',
    author: 'Đội AIOps — FPT-IS Next Gen Service',
    role: 'Vận hành thông minh',
    initials: 'AIO',
    date: '22/07/2026',
    read: '6 phút đọc',
    tags: ['AIOps', 'Observability', 'Alerting', 'MTTR'],
    coverUrl: 'assets/cover-alert-noise.png',
    blocks: [
      {
        kind: 'p',
        text: 'Yêu cầu phổ biến nhất chúng tôi nhận được về AIOps là: “giúp giảm số cảnh báo”. Nhưng phần lớn trường hợp, vấn đề không nằm ở thuật toán mà ở việc cảnh báo được đặt trên chỉ số máy móc chứ không phải trên trải nghiệm người dùng.',
      },
      { kind: 'h', text: 'Việc thứ nhất: dọn ngưỡng cảnh báo cũ' },
      {
        kind: 'p',
        text: 'Một hệ thống vận hành nhiều năm thường tích lũy hàng trăm rule không ai dám tắt. Bước đầu luôn là thống kê: rule nào bắn nhiều nhất, rule nào chưa từng dẫn đến hành động nào. Nhóm thứ hai nên bị xoá, không phải đưa vào mô hình.',
      },
      { kind: 'h', text: 'Việc thứ hai: chuẩn hoá dữ liệu' },
      {
        kind: 'list',
        items: [
          'Log, metric và trace phải có chung định danh dịch vụ và môi trường.',
          'Sự kiện cần mốc thời gian nhất quán — lệch giờ giữa các nguồn phá vỡ mọi phân tích tương quan.',
          'Thay đổi hệ thống (deploy, cấu hình) cũng là dữ liệu vận hành, cần đưa vào cùng kho sự kiện.',
        ],
      },
      { kind: 'h', text: 'Việc thứ ba: xác định ca sử dụng cụ thể' },
      {
        kind: 'p',
        text: '“Phát hiện bất thường” là mục tiêu quá rộng để triển khai. Ca sử dụng đầu tiên nên hẹp và đo được: gom nhóm cảnh báo cùng nguyên nhân, hoặc phát hiện tăng độ trễ trước ngưỡng cứng. Khi mô hình chứng minh được giá trị trên một ca cụ thể, việc mở rộng dễ thuyết phục hơn nhiều.',
      },
      {
        kind: 'quote',
        text: 'Machine learning làm rõ tín hiệu, nó không tạo ra tín hiệu ở nơi không có.',
      },
    ],
  },
  {
    slug: 'migration-waves',
    cat: 'Migration',
    tone: '#57A336',
    title: 'Di trú theo đợt: chia nhỏ để không đánh cược cả hệ thống',
    excerpt:
      'Kinh nghiệm phân loại 6R và thiết kế cửa sổ cutover cho hệ thống nghiệp vụ lớn, nơi một lần dừng dịch vụ ngoài kế hoạch là điều không thể giải thích.',
    author: 'Đội Migration — FPT-IS Next Gen Service',
    role: 'Di trú & hiện đại hoá',
    initials: 'MIG',
    date: '10/07/2026',
    read: '9 phút đọc',
    tags: ['Migration', '6R', 'Cutover', 'TCO'],
    coverUrl: 'assets/cover-migration-waves.png',
    blocks: [
      {
        kind: 'p',
        text: 'Rủi ro lớn nhất của một dự án di trú không phải kỹ thuật, mà là phạm vi. Khi toàn bộ hệ thống được chuyển trong một đợt, mọi giả định sai đều lộ ra cùng lúc và trong cùng một đêm cutover.',
      },
      { kind: 'h', text: 'Phân loại trước khi lập kế hoạch' },
      {
        kind: 'p',
        text: 'Chúng tôi phân loại theo 6R — retain, retire, rehost, replatform, refactor, repurchase. Điều quan trọng là retire: trong hầu hết các đợt kiểm kê, luôn có một tỷ lệ ứng dụng không còn ai dùng nhưng vẫn được cấp tài nguyên. Đây là phần tiết kiệm dễ nhất.',
      },
      { kind: 'h', text: 'Thiết kế đợt di trú' },
      {
        kind: 'list',
        items: [
          'Đợt đầu chọn ứng dụng ít phụ thuộc và có đội hỗ trợ sẵn sàng — mục tiêu là học quy trình, không phải chuyển được nhiều nhất.',
          'Mỗi đợt phải có phương án quay lui được diễn tập, không chỉ được viết ra.',
          'Cửa sổ cutover cần tính cả thời gian kiểm thử nghiệp vụ, không chỉ thời gian sao chép dữ liệu.',
        ],
      },
      { kind: 'h', text: 'Sau khi go-live' },
      {
        kind: 'p',
        text: 'Việc hay bị cắt bỏ khi dự án chậm tiến độ là đóng hệ thống cũ. Nếu hệ thống nguồn vẫn chạy song song nhiều tháng, phần tiết kiệm chi phí đã hứa sẽ không xuất hiện trong báo cáo, và tổ chức sẽ kết luận sai rằng cloud đắt hơn.',
      },
    ],
  },
  {
    slug: 'landing-zone',
    cat: 'Cloud Platform',
    tone: '#0072BC',
    title: 'Landing zone: những quyết định khó sửa nếu làm sai từ đầu',
    excerpt:
      'Mô hình tài khoản, phân vùng mạng và chuẩn tagging là ba thứ rất khó thay đổi sau khi đã có hàng trăm tài nguyên chạy trên đó.',
    author: 'Đội Cloud Platform — FPT-IS Next Gen Service',
    role: 'Nền tảng cloud',
    initials: 'PLT',
    date: '24/06/2026',
    read: '7 phút đọc',
    tags: ['Landing zone', 'FinOps', 'Governance', 'IaC'],
    coverUrl: 'assets/cover-landing-zone.png',
    blocks: [
      {
        kind: 'p',
        text: 'Landing zone không phải một bước thủ tục trước khi triển khai ứng dụng. Đó là tập hợp các quyết định về ranh giới: ai được tạo tài nguyên gì, ở đâu, và chi phí được ghi vào đâu.',
      },
      { kind: 'h', text: 'Mô hình tài khoản' },
      {
        kind: 'p',
        text: 'Tách theo môi trường hay theo đơn vị nghiệp vụ là câu hỏi đầu tiên và khó đảo ngược nhất. Nguyên tắc chúng tôi dùng: ranh giới tài khoản nên trùng với ranh giới trách nhiệm ngân sách, vì đó là ranh giới mà tổ chức thực sự vận hành theo.',
      },
      { kind: 'h', text: 'Chuẩn tagging phải bắt buộc bằng policy' },
      {
        kind: 'list',
        items: [
          'Tag do con người nhớ để điền sẽ không tồn tại sau ba tháng.',
          'Guardrail chặn tạo tài nguyên thiếu tag hiệu quả hơn mọi tài liệu hướng dẫn.',
          'Không có tagging nhất quán thì FinOps chỉ là tổng hoá đơn, không phải công cụ ra quyết định.',
        ],
      },
      {
        kind: 'quote',
        text: 'Landing zone dựng một lần cho đúng rẻ hơn nhiều so với chuẩn hoá lại khi đã có 300 tài nguyên đang chạy.',
      },
    ],
  },
  {
    slug: 'gpu-utilization',
    cat: 'AI Infrastructure',
    tone: '#F37021',
    title: 'GPU đắt, nhưng GPU chờ việc còn đắt hơn',
    excerpt:
      'Vì sao chỉ số cần theo dõi trên một cluster huấn luyện không phải là số GPU, mà là tỷ lệ sử dụng thực tế và thời gian chờ hàng đợi.',
    author: 'Đội AI Infrastructure — FPT-IS Next Gen Service',
    role: 'Hạ tầng AI',
    initials: 'GPU',
    date: '09/06/2026',
    read: '6 phút đọc',
    tags: ['GPU', 'MLOps', 'Scheduler', 'Inference'],
    coverUrl: 'assets/cover-gpu-utilization.png',
    blocks: [
      {
        kind: 'p',
        text: 'Một cluster GPU được đầu tư đúng cấu hình vẫn có thể mang lại hiệu quả thấp, nếu phần lớn thời gian card ở trạng thái chờ dữ liệu hoặc chờ được cấp phát.',
      },
      { kind: 'h', text: 'Hai điểm nghẽn thường gặp' },
      {
        kind: 'list',
        items: [
          'Pipeline dữ liệu không đủ nhanh: GPU xử lý xong batch trước khi batch sau kịp nạp.',
          'Không có scheduler và hạn mức theo nhóm: một job lớn chiếm toàn bộ tài nguyên, các job ngắn xếp hàng nhiều giờ.',
        ],
      },
      { kind: 'h', text: 'Suy luận là bài toán khác với huấn luyện' },
      {
        kind: 'p',
        text: 'Với phục vụ mô hình, chỉ số quan trọng chuyển sang độ trễ và chi phí trên mỗi yêu cầu. Quantization, batching động và chọn đúng runtime suy luận thường mang lại cải thiện lớn hơn việc bổ sung phần cứng.',
      },
    ],
  },
  {
    slug: 'zero-trust-thuc-te',
    cat: 'Security',
    tone: '#57A336',
    title: 'Zero Trust trong thực tế: bắt đầu từ danh tính, không từ thiết bị mạng',
    excerpt:
      'Zero Trust thường được bán như một sản phẩm. Trong triển khai thật, phần lớn công việc nằm ở quản trị danh tính và thu hẹp quyền, không ở việc mua thêm thiết bị.',
    author: 'Đội Cloud Security — FPT-IS Next Gen Service',
    role: 'Bảo mật & tuân thủ',
    initials: 'SEC',
    date: '21/05/2026',
    read: '7 phút đọc',
    tags: ['Zero Trust', 'IAM', 'Least privilege', 'Compliance'],
    coverUrl: 'assets/cover-zero-trust-thuc-te.png',
    blocks: [
      {
        kind: 'p',
        text: 'Câu hỏi đầu tiên trong một dự án Zero Trust không phải “dùng giải pháp nào”, mà “hiện tại ai đang có quyền gì, và vì sao”. Trong hầu hết các đợt đánh giá, phần quyền dư thừa lớn nhất đến từ các tài khoản dịch vụ được cấp quyền rộng để cho nhanh.',
      },
      { kind: 'h', text: 'Thứ tự công việc chúng tôi thường dùng' },
      {
        kind: 'list',
        items: [
          'Kiểm kê danh tính con người và danh tính máy — thường số thứ hai lớn hơn và ít được quản lý hơn.',
          'Bắt buộc MFA cho mọi truy cập quản trị trước khi làm bất cứ việc gì phức tạp hơn.',
          'Thu hẹp quyền theo từng vòng, có đo lường, thay vì một lần rà soát lớn rồi bỏ đó.',
        ],
      },
      {
        kind: 'quote',
        text: 'Không có danh tính rõ ràng thì phân vùng mạng chỉ làm chậm kẻ tấn công, không chặn được.',
      },
      {
        kind: 'p',
        text: 'Cuối cùng là diễn tập. Một kịch bản ứng phó chưa từng được chạy thử thì trong sự cố thật sẽ không được dùng.',
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Category chip list (blog list page filter). "Tất cả" = "All".
// ---------------------------------------------------------------------------

export const CATS: string[] = [
  'Tất cả',
  'SRE',
  'AIOps',
  'Cloud Platform',
  'Security',
  'Migration',
  'AI Infrastructure',
];

// "Tất cả" is used as the filter sentinel; only its display label is localized.
export const ALL_CATS_LABEL = { vi: 'Tất cả', en: 'All' };

/** Localized display label for a category chip (values stay stable for filtering). */
export function catLabel(cat: string, lang: 'vi' | 'en'): string {
  return cat === 'Tất cả' ? (lang === 'en' ? ALL_CATS_LABEL.en : ALL_CATS_LABEL.vi) : cat;
}

// ---------------------------------------------------------------------------
// Blog list-page hero strings (verbatim)
// ---------------------------------------------------------------------------

export const LIST_HERO = {
  tag: 'Engineering blog',
  h1: 'Ghi chép từ các vị trí chiến đấu trong hạm đội',
  sub: 'Field notes from across the fleet',
  lead:
    'Kinh nghiệm vận hành hạ tầng Cloud, AI và bảo mật của đội FPT-IS Next Gen Service — viết bởi tất cả các vị trí chiến đấu trong thủy thủ đoàn.',
  searchPlaceholder: 'Tìm bài viết…',
  // countLabel is computed at runtime: `${filtered.length} bài viết`
  countLabelSuffix: 'bài viết',
  // EN Phase 2 — English variants (tag & sub are already English).
  h1En: 'Field notes from across the fleet',
  subEn: 'Ghi chép từ các vị trí chiến đấu trong hạm đội',
  leadEn:
    "Operational lessons in Cloud, AI and security infrastructure from the FPT-IS Next Gen Service team — written by every battle station in the crew.",
  searchPlaceholderEn: 'Search posts…',
  countLabelSuffixEn: 'posts',
};

// Header (sticky nav) strings
export const HEADER = {
  brandName: 'FPT-IS',
  brandUnit: 'NEXT GEN SERVICE',
  sectionBadge: 'BLOG',
  navItems: [
    { label: 'Dịch vụ', href: 'FPTIS NS Landing v3 Ant.dc.html#services' },
    { label: 'Đối tác', href: 'FPTIS NS Landing v3 Ant.dc.html#partners' },
    { label: 'Khách hàng', href: 'FPTIS NS Landing v3 Ant.dc.html#cases' },
  ],
  ctaLabel: 'Liên hệ tư vấn',
  ctaHref: 'FPTIS NS Landing v3 Ant.dc.html#contact',
};

// ---------------------------------------------------------------------------
// Section headers on the list page
// ---------------------------------------------------------------------------

export const SECTION_HEADERS = {
  featured: { h2: 'Bài nổi bật', sub: 'Featured', h2En: 'Featured', subEn: 'Bài nổi bật' },
  // list heading is computed: "Tất cả bài viết" when cat === "Tất cả", else the category name
  allArticlesDefaultHeading: 'Tất cả bài viết',
  allArticlesDefaultHeadingEn: 'All articles',
  allArticlesSub: 'All articles',
  allArticlesSubEn: 'Tất cả bài viết',
  related: { h2: 'Bài liên quan', sub: 'Related', h2En: 'Related', subEn: 'Bài liên quan' },
};

// Card CTA label
export const READ_MORE_LABEL = 'Đọc bài →';
export const READ_MORE_LABEL_EN = 'Read post →';

// ---------------------------------------------------------------------------
// Search / empty-state strings (verbatim)
// ---------------------------------------------------------------------------

export const EMPTY_STATE = {
  title: 'Không có bài viết khớp với bộ lọc',
  desc: 'Thử từ khoá khác hoặc chọn lại chuyên mục.',
  resetButton: 'Xoá bộ lọc',
  titleEn: 'No posts match your filter',
  descEn: 'Try a different keyword or pick another category.',
  resetButtonEn: 'Clear filter',
};

// ---------------------------------------------------------------------------
// Subscribe panel strings (verbatim)
// ---------------------------------------------------------------------------

export const SUBSCRIBE_PANEL = {
  title: 'Nhận bài mới qua email',
  sub: 'Mỗi tháng một lần, chỉ nội dung kỹ thuật. Không quảng cáo dịch vụ.',
  emailPlaceholder: '[name@company.com]',
  buttonLabel: 'Đăng ký',          // default state
  buttonLabelSubscribed: 'Đã đăng ký', // after subscribe
  titleEn: 'Get new posts by email',
  subEn: 'Once a month, technical content only. No service ads.',
  emailPlaceholderEn: '[name@company.com]',
  buttonLabelEn: 'Subscribe',
  buttonLabelSubscribedEn: 'Subscribed',
};

// ---------------------------------------------------------------------------
// Article page strings (verbatim)
// ---------------------------------------------------------------------------

export const ARTICLE_PAGE = {
  breadcrumb: {
    home: 'Trang chính',
    homeEn: 'Home',
    homeHref: 'FPTIS NS Landing v3 Ant.dc.html',
    blog: 'Blog',
    blogEn: 'Blog',
    // third crumb = article.cat
  },
  meta: {
    authored: { vi: 'Soạn:', en: 'Drafted:' },
    published: { vi: 'Đăng:', en: 'Published:' },
    backToCms: { vi: '← Quay lại CMS', en: '← Back to CMS' },
  },
  footerButtons: {
    back: '← Tất cả bài viết',
    backEn: '← All posts',
    contact: 'Liên hệ đội kỹ thuật',
    contactEn: 'Contact the engineering team',
    contactHref: 'FPTIS NS Landing v3 Ant.dc.html#contact',
  },
};

// ---------------------------------------------------------------------------
// Footer strings (verbatim)
// ---------------------------------------------------------------------------

export const FOOTER = {
  copyright:
    '© [2026] FPT-IS Next Gen Service. Keangnam Landmark 72, E10, Nam Từ Liêm, Hà Nội.',
  backLink: '← Về trang chính',
  backHref: 'FPTIS NS Landing v3 Ant.dc.html',
};

// ---------------------------------------------------------------------------
// Related-posts logic (from renderVals):
//   related = POSTS.filter(p => p.slug !== article.slug).slice(0, 3)
// i.e. the first 3 posts (in POSTS order) that are not the current article.
// ---------------------------------------------------------------------------

export function getRelatedPosts(currentSlug: string): Post[] {
  return POSTS.filter((p) => p.slug !== currentSlug).slice(0, 3);
}

// ---------------------------------------------------------------------------
// Featured / filtering logic (from renderVals), for reference:
//   featured        = POSTS.find(p => p.featured)   // => 'error-budget'
//   showFeatured    = !article && cat === "Tất cả" && !query
//   filtered        = POSTS filtered by (cat === "Tất cả" || p.cat === cat)
//                     AND (!query || (title+excerpt+tags).toLowerCase().includes(query))
//   listed          = showFeatured ? filtered.filter(p => !p.featured) : filtered
//   countLabel      = filtered.length + " bài viết"
//   listHeading     = cat === "Tất cả" ? "Tất cả bài viết" : cat
// Category tone -> chip colors (catStyle):
//   ORANGE (#F37021): bg #FEF1E9, border #F8CBA9, fg #C25A17
//   GREEN  (#57A336): bg #F0F8EB, border #C6E4B4, fg #3F7A26
//   BLUE   (#0072BC): bg #E6F1F9, border #B3D5EA, fg #0072BC
// ---------------------------------------------------------------------------
