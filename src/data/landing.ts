/**
 * landing-content.ts
 * ------------------------------------------------------------------
 * VERBATIM design data extracted from:
 *   design_handoff_fptis_ns_web/designs/FPTIS NS Landing v3 Ant.dc.html
 * FPT-IS Next Gen Service — landing page rebuild.
 *
 * All text, SVG markup, colors and asset paths are copied EXACTLY as
 * they appear in the source. Nothing was paraphrased or invented.
 *
 * ------------------------------------------------------------------
 * AMBIGUITIES / NOTES / PLACEHOLDERS (kept as-is, NOT filled):
 * ------------------------------------------------------------------
 * 1. LANGUAGE TOGGLE: The VN/EN segmented toggle (state.lang) does NOT
 *    swap any body copy. Both the Vietnamese line and the English line
 *    are always rendered together (VN main + EN sub). The only effect of
 *    `lang` is cosmetic: in the service cards it swaps the FONT SIZES of
 *    the VN title vs. the EN subtitle:
 *        const [nameSize, enSize] = vi ? [16, 12.5] : [12.5, 16];
 *    i.e. in EN mode the English subtitle becomes the larger/primary text.
 *    There is therefore NO separate EN string set to extract — the "EN
 *    variants" below are the English sub-lines already present in markup.
 *
 * 2. submitLabel is toggled by `state.sent` (NOT by language):
 *        sent ? "Đã gửi — cảm ơn bạn!" : "Gửi yêu cầu tư vấn"
 *
 * 3. Source uses HTML entity `&amp;` throughout; decoded to "&" in the
 *    strings below (that is the rendered text).
 *
 * 4. PLACEHOLDERS present in the source (left verbatim, DO NOT fill):
 *      - Blog dates:            real dd/mm/yyyy dates (all 3 blog teasers)
 *      - Footer copyright year: "[2026]"
 *      - Contact form inputs:
 *          Họ và tên  placeholder -> "[Nguyễn Văn A]"
 *          Email      placeholder -> "[name@company.com]"
 *          Công ty    placeholder -> "[Tên công ty]"
 *          Nhu cầu    placeholder -> "[Mô tả ngắn nhu cầu Cloud / AI của bạn]"
 *      - image-slot `placeholder` attrs that say "… — kéo logo vào"
 *        ("drag the logo in") are DESIGN HINTS, not shipped copy. Kept
 *        on each asset entry as `placeholderHint`.
 *
 * 5. The `plateStyle` prop (enum: solid | tinted | outline | stencil,
 *    default "solid") controls the SERVICE glyph plate appearance only;
 *    it does not change the glyph SVGs themselves.
 *
 * 6. All 9 glyph SVGs share identical outer <svg> attributes:
 *      width="24" height="24" viewBox="0 0 24 24" fill="none"
 *      stroke="currentColor" stroke-width="1.7"
 *      stroke-linecap="round" stroke-linejoin="round"
 *    Stored below are the INNER children only (see SERVICE_SVG_ATTRS).
 * ------------------------------------------------------------------
 */

/* ==================================================================
 * ACCENT COLORS
 * ================================================================== */
export const ACCENTS = {
  blue: "#0072BC",
  orange: "#F37021",
  green: "#57A336",
  cyan: "#38A3D8", // used only for MODEL phase 03 (Vận hành)
} as const;

export type Accent = keyof typeof ACCENTS;

/** Tinted (light) backgrounds + borders + text colors per accent, from tag()/plate() helpers. */
export const ACCENT_TINTS = {
  blue: { text: "#0072BC", bg: "#E6F1F9", border: "#B3D5EA", plateBorder: "#C2DCEF" },
  green: { text: "#3F7A26", bg: "#F0F8EB", border: "#C6E4B4", plateBorder: "#CDE7BC" },
  orange: { text: "#C25A17", bg: "#FEF1E9", border: "#F8CBA9", plateBorder: "#F7D2B8" },
} as const;

/* ==================================================================
 * 1. SERVICE GLYPHS — 9 hand-drawn SVG glyphs (inner markup, VERBATIM)
 *    Outer <svg> wrapper is identical for all (see SERVICE_SVG_ATTRS).
 * ================================================================== */
export const SERVICE_SVG_ATTRS = {
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const SERVICE_GLYPHS: Record<string, string> = {
  devops:
    '<path d="M8.9 9.4a3.7 3.7 0 1 0 0 5.2l5.2-5.2a3.7 3.7 0 1 1 0 5.2"/><circle cx="11.5" cy="12" r="1.15" fill="currentColor" stroke="none"/>',
  sre:
    '<path d="M4 16.4a8.4 8.4 0 1 1 16 0"/><path d="M12 16.4l3.6-4.4"/><circle cx="12" cy="16.4" r="1.1" fill="currentColor" stroke="none"/><path d="M4 19.4h16"/>',
  aiops:
    '<path d="M3.4 15.6h2.6l1.7-3.2 2.3 6 2-8.4 2 5.6 1.5-2.4h2.4"/><path d="M18.4 4.6v3M16.9 6.1h3"/>',
  platform:
    '<path d="M8.2 10.1a3.9 3.9 0 0 1 7.5-.6 2.8 2.8 0 0 1-.4 5.6H8.5a2.6 2.6 0 0 1-.3-5z"/><path d="M4.4 18.4h15.2M7.2 21h9.6"/>',
  security:
    '<path d="M12 3.4l6.6 2.5v5.6c0 4.3-2.8 7.4-6.6 9.1-3.8-1.7-6.6-4.8-6.6-9.1V5.9z"/><circle cx="12" cy="11" r="1.5"/><path d="M12 12.5v2.4"/>',
  cloudai:
    '<ellipse cx="9.4" cy="6.4" rx="4.6" ry="2"/><path d="M4.8 6.4v9.4c0 1.1 2 2 4.6 2"/><path d="M14 6.4v3.4"/><path d="M4.8 11.1c0 1.1 2 2 4.6 2"/><path d="M17.4 12.6l1.3 2.7 2.7 1.3-2.7 1.3-1.3 2.7-1.3-2.7-2.7-1.3 2.7-1.3z"/>',
  aiinfra:
    '<rect x="3.4" y="7" width="17.2" height="10" rx="1.6"/><circle cx="9" cy="12" r="2.2"/><circle cx="15.6" cy="12" r="2.2"/><path d="M6 19.6v1.6M18 19.6v1.6M6.6 7V5.2M17.4 7V5.2"/>',
  migration:
    '<path d="M4.4 8.6a3.1 3.1 0 0 1 5.9-.5"/><path d="M10.6 12.4H5.2a2.4 2.4 0 0 1-.4-4.8"/><path d="M19.6 15.4a3.1 3.1 0 0 1-5.9.5"/><path d="M13.4 11.6h5.4a2.4 2.4 0 0 1 .4 4.8"/><path d="M9.8 5.6l2.4 2.4-2.4 2.4M14.2 18.4l-2.4-2.4 2.4-2.4"/>',
  cloudapp:
    '<path d="M12 3.2l7.4 3.6v8L12 20.8 4.6 14.8v-8z"/><path d="M10.4 9.6L8.2 12l2.2 2.4M13.6 9.6L15.8 12l-2.2 2.4"/>',
  outsourcing:
    '<circle cx="8.6" cy="8.4" r="2.6"/><path d="M3.6 18.6a5 5 0 0 1 10 0"/><circle cx="16.4" cy="9.4" r="2.1"/><path d="M14.2 14.2a4.4 4.4 0 0 1 6.2 4.4"/>',
  attt:
    '<path d="M12 3.4l6.6 2.5v5.6c0 4.3-2.8 7.4-6.6 9.1-3.8-1.7-6.6-4.8-6.6-9.1V5.9z"/><path d="M9.2 11.8l2 2 3.6-3.8"/>',
};

/* ==================================================================
 * 2. HERO
 * ================================================================== */
export const HERO = {
  tag: "FPT-IS Next Gen Service",
  h1: "Đối tác Cloud & AI end-to-end cho doanh nghiệp",
  h1En: "Your end-to-end Cloud & AI partner",
  h1sub: "Your end-to-end Cloud & AI partner",
  lead:
    "Tư vấn, triển khai, vận hành và tối ưu trên đa nền tảng cloud — một đầu mối chịu trách nhiệm suốt vòng đời hệ thống, với đội ngũ kỹ sư chứng chỉ quốc tế.",
  leadEn:
    "Consulting, implementation, operations and optimization across multi-cloud — a single point of accountability across the system lifecycle, delivered by internationally-certified engineers.",
  buttons: {
    primary: "Liên hệ tư vấn", // -> #contact
    secondary: "Xem các dịch vụ", // -> #services
    primaryEn: "Contact us",
    secondaryEn: "View services",
  },
  // Decorative navy panel next to the hero copy
  panel: {
    tag: "APPCARRIER · CARRIER PLATFORM",
    image: "assets/appcarrier-carrier.png",
    imageAlt: "AppCarrier aircraft carrier",
    chips: [
      "Nền tảng = tàu sân bay",
      "App & microservice = phi đội",
      "Bảo mật = vành đai",
    ],
    chipsEn: [
      "Platform = aircraft carrier",
      "Apps & microservices = squadrons",
      "Security = the perimeter",
    ],
  },
  // NOTE: no separate EN copy set — EN toggle does not translate body text.
} as const;

/* ==================================================================
 * 3. STATS — 4 items in the navy stats panel
 * ================================================================== */
export const STATS = [
  { value: "100", suffix: "+", accent: "#F37021", label: "Dự án triển khai", en: "Projects delivered" },
  { value: "50", suffix: "", accent: "#5FC2F5", label: "Chứng chỉ", en: "Cloud · OpenShift · K8s · Security" },
  { value: "10", suffix: "", accent: "#8FD96B", label: "Năm kinh nghiệm", en: "Years of experience" },
  { value: "6", suffix: "+", accent: "#F37021", label: "Nền tảng cloud", en: "AWS · Azure · GCP · FPT Smart Cloud" },
] as const;
// NOTE: stat accent hexes are the "light/vivid on navy" variants:
//   orange #F37021, blue #5FC2F5, green #8FD96B (NOT the base brand blue/green).

/* ==================================================================
 * 4. ABOUT
 * ================================================================== */
export const ABOUT = {
  title: { vi: "Dịch vụ Cloud & AI Infrastructure", en: "Cloud & AI infrastructure services unit" },
  intro: {
    vi: "FPT-IS Next Gen Service cung cấp dịch vụ hạ tầng Cloud & AI toàn trình — từ tư vấn kiến trúc, di trú và triển khai, tới vận hành 24/7 và tối ưu chi phí – hiệu năng.",
    en: "Full-lifecycle Cloud & AI infrastructure services — architecture advisory, migration and build, 24/7 operations, cost and performance optimization.",
  },
  quote: {
    // Full quote text. Colored keywords called out below.
    text: "Nền tảng là tàu sân bay. Ứng dụng và microservice là phi đội. Bảo mật là vành đai phòng thủ. Một sở chỉ huy duy nhất.",
    keywords: [
      { text: "tàu sân bay", color: "#F37021" }, // orange
      { text: "phi đội", color: "#0072BC" }, // blue
      { text: "vành đai phòng thủ", color: "#57A336" }, // green
    ],
    by: "Mô hình vận hành AppCarrier",
    textEn: "The platform is the aircraft carrier. Apps and microservices are the squadrons. Security is the defensive perimeter. A single command center.",
    keywordsEn: [
      { text: "aircraft carrier", color: "#F37021" }, // orange
      { text: "squadrons", color: "#0072BC" }, // blue
      { text: "defensive perimeter", color: "#57A336" }, // green
    ],
    byEn: "The AppCarrier operating model",
  },
  // 8 value cards (title / en desc / lucide icon / accent — as authored, in order)
  valueCards: [
    { title: "Toàn trình, một đầu mối", en: "Single accountability", icon: "target", accent: "orange" },
    { title: "Đa nền tảng cloud", en: "Multi-cloud coverage", icon: "cloudy", accent: "blue" },
    { title: "Bảo mật theo thiết kế", en: "Secure by design", icon: "shield-check", accent: "green" },
    { title: "Chứng chỉ", en: "Certified specialists", icon: "award", accent: "blue" },
    { title: "Tự động hoá vận hành", en: "Automated operations", icon: "refresh-cw", accent: "orange" },
    { title: "Cam kết SLA 24/7", en: "SLA-backed delivery", icon: "clock-9", accent: "green" },
    { title: "Văn hoá SRE", en: "Error budget · blameless postmortem · toil reduction", icon: "heart-pulse", accent: "blue" },
    { title: "Harness Engineering", en: "CI/CD · GitOps · feature flags · chaos experiment", icon: "git-branch", accent: "orange" },
  ],
  // "Nền tảng vận hành" platform tag strip (label + tags, with tag accent)
  platformStrip: {
    label: "Nền tảng vận hành",
    labelEn: "Operating platforms",
    tags: [
      { text: "AWS", accent: "blue" },
      { text: "Microsoft Azure", accent: "blue" },
      { text: "Google Cloud", accent: "blue" },
      { text: "FPT Smart Cloud", accent: "orange" },
      { text: "Private cloud", accent: "green" },
      { text: "Hybrid cloud", accent: "green" },
      { text: "OpenShift", accent: "orange" },
      { text: "Kubernetes", accent: "blue" },
    ],
  },
} as const;

/* ==================================================================
 * 5. SERVICES_META — 9 service cards
 *    All link to: FPTIS NS Service Detail.dc.html#<slug>
 * ================================================================== */
export const SERVICES_META = [
  { num: 1, name: "DevOps / DevSecOps", en: "CI/CD & automation", slug: "devops", accent: "blue",
    desc: "Harness Engineering: CI/CD, GitOps, IaC, feature flag — rút ngắn thời gian phát hành.",
    descEn: "Harness Engineering: CI/CD, GitOps, IaC, feature flags — shorter, safer release cycles." },
  { num: 2, name: "SRE", en: "Site reliability engineering", slug: "sre", accent: "orange",
    desc: "SLO/SLI, error budget, observability, blameless postmortem — độ tin cậy là văn hoá, không chỉ là chỉ số.",
    descEn: "SLO/SLI, error budgets, observability, blameless postmortems — reliability as a culture, not just a metric." },
  { num: 3, name: "AIOps", en: "Deploy & operate", slug: "aiops", accent: "green", ribbon: "MỚI",
    desc: "Phát hiện bất thường, gom nhóm cảnh báo, tự khắc phục sự cố, giảm MTTR.",
    descEn: "Anomaly detection, alert correlation and auto-remediation to lower MTTR." },
  { num: 4, name: "Cloud Platform", en: "Landing zone & FinOps", slug: "platform", accent: "blue",
    desc: "Landing zone, đa đám mây, quản trị và tối ưu chi phí.",
    descEn: "Landing zone, multi-cloud, governance and cost optimization." },
  { num: 5, name: "Cloud Security", en: "Zero Trust & compliance", slug: "security", accent: "orange",
    desc: "Zero Trust, IAM, tuân thủ, giám sát bảo mật liên tục.",
    descEn: "Zero Trust, IAM, compliance and continuous security monitoring." },
  { num: 6, name: "Cloud for AI", en: "Cloud & data for AI", slug: "cloudai", accent: "green",
    desc: "Nền tảng cloud và dữ liệu phục vụ workload AI/ML.",
    descEn: "Cloud and data platforms for AI/ML workloads." },
  { num: 7, name: "AI Infrastructure", en: "GPU clusters & MLOps", slug: "aiinfra", accent: "blue",
    desc: "Hạ tầng GPU/accelerator, cluster, MLOps, phục vụ LLM.",
    descEn: "GPU/accelerator infrastructure, clusters and MLOps for LLMs." },
  { num: 8, name: "Cloud Migration", en: "Assess & migrate", slug: "migration", accent: "orange",
    desc: "Đánh giá và di trú ứng dụng/dữ liệu, hiện đại hoá hệ thống.",
    descEn: "Assess and migrate applications and data, and modernize systems." },
  { num: 9, name: "Cloud App", en: "Cloud-native apps", slug: "cloudapp", accent: "green",
    desc: "Phát triển và hiện đại hoá ứng dụng cloud-native, container/K8s.",
    descEn: "Build and modernize cloud-native applications on containers/K8s." },
  { num: 10, name: "Thuê kỹ sư theo vị trí", nameEn: "Engineer outsourcing", en: "Engineer outsourcing", slug: "outsourcing", accent: "blue", ribbon: "MỚI",
    desc: "Cung cấp Cloud Engineer, DevOps Engineer, Platform Engineer, Security Engineer theo dự án hoặc dài hạn — bổ sung năng lực đội ngũ nhanh, linh hoạt.",
    descEn: "Cloud, DevOps, Platform and Security Engineers on a project or long-term basis — scale your team quickly and flexibly." },
  { num: 11, name: "ATTT theo luật VN", nameEn: "Vietnam IT-security compliance", en: "Vietnam IT-security compliance", slug: "attt", accent: "orange", ribbon: "MỚI",
    desc: "Tuân thủ Luật An ninh mạng, Luật ATTT mạng; phân định & lập hồ sơ cấp độ an toàn hệ thống thông tin (NĐ 85), bảo vệ dữ liệu cá nhân (NĐ 13).",
    descEn: "Compliance with Vietnam's Cybersecurity and Information-Security laws; classifying and documenting system security levels (Decree 85) and personal-data protection (Decree 13)." },
  { num: 12, name: "Cloud Managed Service", en: "Comprehensive managed service", slug: "managed", accent: "green", ribbon: "MỚI",
    desc: "Vận hành hạ tầng cloud toàn diện 24/7 theo SLA: giám sát, sự cố, vá bảo mật, backup/DR, FinOps — một đầu mối chịu trách nhiệm.",
    descEn: "Comprehensive 24/7 SLA-based cloud operations: monitoring, incidents, security patching, backup/DR and FinOps — a single accountable owner." },
  { num: 13, name: "Ứng cứu sự cố Cloud", nameEn: "Cloud incident response", en: "Cloud incident response", slug: "incident", accent: "orange", ribbon: "MỚI",
    desc: "Ứng cứu sự cố khẩn cấp 24/7: war-room, khoanh vùng & khôi phục, điều tra nguyên nhân gốc — cả sự cố vận hành lẫn an ninh.",
    descEn: "Emergency 24/7 incident response: war-room, containment & recovery, and root-cause investigation — for both operational and security incidents." },
] as const;
// NOTE: card #3 (AIOps) is the "hot" card — green border + "MỚI" ribbon.
//   Its EN subtitle is Vietnamese ("Triển khai & vận hành"), authored that way.

/* ==================================================================
 * 6. MODEL — 4 phases (Consult -> Deploy -> Operate -> Optimize)
 * ================================================================== */
export const MODEL = {
  title: { vi: "Mô hình dịch vụ toàn trình", en: "Consult → Deploy → Operate → Optimize" },
  phases: [
    { num: 1, phaseLabel: "Giai đoạn 01", phaseLabelEn: "Phase 01", title: "Tư vấn", en: "Consult", color: "#F37021",
      chips: ["Đánh giá hiện trạng", "Kiến trúc mục tiêu", "Lộ trình", "TCO / ROI", "Chọn nền tảng"],
      chipsEn: ["Current-state assessment", "Target architecture", "Roadmap", "TCO / ROI", "Platform selection"] },
    { num: 2, phaseLabel: "Giai đoạn 02", phaseLabelEn: "Phase 02", title: "Triển khai", en: "Deploy", color: "#0072BC",
      chips: ["Landing zone", "Migrate", "CI/CD", "Nền tảng AIOps", "Go-live"],
      chipsEn: ["Landing zone", "Migrate", "CI/CD", "AIOps platform", "Go-live"] },
    { num: 3, phaseLabel: "Giai đoạn 03", phaseLabelEn: "Phase 03", title: "Vận hành", en: "Operate", color: "#38A3D8",
      chips: ["Managed 24/7", "AIOps monitoring", "On-call SRE", "Patching", "DR / Backup"],
      chipsEn: ["Managed 24/7", "AIOps monitoring", "On-call SRE", "Patching", "DR / Backup"] },
    { num: 4, phaseLabel: "Giai đoạn 04", phaseLabelEn: "Phase 04", title: "Tối ưu", en: "Optimize", color: "#57A336",
      chips: ["FinOps", "Tuning hiệu năng", "Tự động hoá nâng cao", "Cải tiến liên tục"],
      chipsEn: ["FinOps", "Performance tuning", "Advanced automation", "Continuous improvement"] },
  ],
} as const;
// NOTE: phaseLabel is authored as "Giai đoạn 0X"; displayed UPPERCASE via CSS
//   (text-transform: uppercase) -> renders "GIAI ĐOẠN 0X".

/* ==================================================================
 * 7. INDUSTRIES — 10 items (in order, with hover-border accent)
 * ================================================================== */
export const INDUSTRIES = [
  { vi: "Ngân hàng – Tài chính", en: "Banking & finance", accent: "blue" },
  { vi: "Chính phủ", en: "Government", accent: "blue" },
  { vi: "Sản xuất", en: "Manufacturing", accent: "orange" },
  { vi: "Bán lẻ", en: "Retail", accent: "orange" },
  { vi: "Y tế", en: "Healthcare", accent: "green" },
  { vi: "Viễn thông", en: "Telecom", accent: "green" },
  { vi: "Giáo dục", en: "Education", accent: "blue" },
  { vi: "Logistics", en: "Logistics", accent: "orange" },
  { vi: "Năng lượng – Tiện ích", en: "Energy & utilities", accent: "blue" },
  { vi: "Bảo hiểm – Chứng khoán", en: "Insurance & securities", accent: "green" },
] as const;

/* ==================================================================
 * 8. PARTNERS — technology partners
 *    lead + each: name, desc, logo src (CDN url or asset path), slot id.
 * ================================================================== */
export const PARTNERS_LEAD =
  "Chúng tôi triển khai và vận hành trên nền tảng của các hãng công nghệ hàng đầu, với đội ngũ kỹ sư được chứng nhận trực tiếp bởi hãng.";

export const PARTNERS_LEAD_EN =
  "We implement and operate on the platforms of leading technology vendors, with engineers certified directly by those vendors.";

export const PARTNERS = [
  { id: "partner-redhat", name: "Red Hat OpenShift", desc: "Nền tảng container doanh nghiệp", descEn: "Enterprise container platform",
    logo: "https://cdn.simpleicons.org/redhatopenshift", placeholderHint: "Red Hat OpenShift" },
  { id: "partner-vmware", name: "VMware", desc: "Ảo hoá & private cloud", descEn: "Virtualization & private cloud",
    logo: "https://cdn.simpleicons.org/vmware", placeholderHint: "VMware" },
  { id: "partner-tanzu", name: "VMware Tanzu", desc: "Quản trị Kubernetes đa cụm", descEn: "Multi-cluster Kubernetes management",
    logo: "assets/logo-tanzu.png", placeholderHint: "VMware Tanzu — kéo logo vào" },
  { id: "partner-hashicorp", name: "HashiCorp", desc: "Terraform · Vault · Consul", descEn: "Terraform · Vault · Consul",
    logo: "https://cdn.simpleicons.org/hashicorp", placeholderHint: "HashiCorp" },
  { id: "partner-nvidia", name: "NVIDIA", desc: "GPU & AI Enterprise", descEn: "GPU & AI Enterprise",
    logo: "https://cdn.simpleicons.org/nvidia", placeholderHint: "NVIDIA" },
  { id: "partner-aws", name: "AWS", desc: "Public cloud", descEn: "Public cloud",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg", placeholderHint: "AWS" },
  { id: "partner-azure", name: "Microsoft Azure", desc: "Public cloud & Entra ID", descEn: "Public cloud & Entra ID",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/azure/azure-original.svg", placeholderHint: "Microsoft Azure" },
  { id: "partner-gcp", name: "Google Cloud", desc: "Public cloud & data", descEn: "Public cloud & data",
    logo: "https://cdn.simpleicons.org/googlecloud", placeholderHint: "Google Cloud" },
  { id: "partner-fptsc", name: "FPT Smart Cloud", desc: "Cloud nội địa", descEn: "Domestic cloud",
    logo: "assets/logo-fptsc.png", placeholderHint: "FPT Smart Cloud — kéo logo vào" },
  { id: "partner-elastic", name: "Elastic", desc: "Observability & search", descEn: "Observability & search",
    logo: "https://cdn.simpleicons.org/elastic", placeholderHint: "Elastic" },
  { id: "partner-veeam", name: "Veeam", desc: "Backup & DR", descEn: "Backup & DR",
    logo: "https://cdn.simpleicons.org/veeam/00B336", placeholderHint: "Veeam — kéo logo vào" },
  { id: "partner-cncf", name: "CNCF / Kubernetes", desc: "Hệ sinh thái cloud-native", descEn: "Cloud-native ecosystem",
    logo: "https://cdn.simpleicons.org/kubernetes", placeholderHint: "CNCF / Kubernetes" },
  { id: "partner-cisco", name: "Cisco", desc: "Mạng & hạ tầng doanh nghiệp", descEn: "Enterprise networking & infrastructure",
    logo: "https://cdn.simpleicons.org/cisco", placeholderHint: "Cisco" },
  { id: "partner-fortinet", name: "Fortinet", desc: "Network & cloud security", descEn: "Network & cloud security",
    logo: "https://cdn.simpleicons.org/fortinet", placeholderHint: "Fortinet" },
  { id: "partner-paloalto", name: "Palo Alto Networks", desc: "Zero Trust & NGFW", descEn: "Zero Trust & NGFW",
    logo: "https://cdn.simpleicons.org/paloaltonetworks", placeholderHint: "Palo Alto Networks" },
  { id: "partner-cloudflare", name: "Cloudflare", desc: "CDN · WAF · Zero Trust", descEn: "CDN · WAF · Zero Trust",
    logo: "https://cdn.simpleicons.org/cloudflare", placeholderHint: "Cloudflare" },
  { id: "partner-sap", name: "SAP", desc: "Nền tảng ứng dụng doanh nghiệp", descEn: "Enterprise application platform",
    logo: "https://cdn.simpleicons.org/sap", placeholderHint: "SAP" },
  { id: "partner-databricks", name: "Databricks", desc: "Lakehouse & AI/ML", descEn: "Lakehouse & AI/ML",
    logo: "https://cdn.simpleicons.org/databricks", placeholderHint: "Databricks" },
  { id: "partner-snowflake", name: "Snowflake", desc: "Data cloud & analytics", descEn: "Data cloud & analytics",
    logo: "https://cdn.simpleicons.org/snowflake", placeholderHint: "Snowflake" },
  { id: "partner-datadog", name: "Datadog", desc: "Observability & monitoring", descEn: "Observability & monitoring",
    logo: "https://cdn.simpleicons.org/datadog", placeholderHint: "Datadog" },
  { id: "partner-grafana", name: "Grafana", desc: "Metrics · logs · dashboards", descEn: "Metrics · logs · dashboards",
    logo: "https://cdn.simpleicons.org/grafana", placeholderHint: "Grafana" },
  { id: "partner-splunk", name: "Splunk", desc: "SIEM & log analytics", descEn: "SIEM & log analytics",
    logo: "https://cdn.simpleicons.org/splunk", placeholderHint: "Splunk" },
  { id: "partner-gitlab", name: "GitLab", desc: "DevSecOps platform", descEn: "DevSecOps platform",
    logo: "https://cdn.simpleicons.org/gitlab", placeholderHint: "GitLab" },
  { id: "partner-nutanix", name: "Nutanix", desc: "Hyperconverged & hybrid cloud", descEn: "Hyperconverged & hybrid cloud",
    logo: "https://cdn.simpleicons.org/nutanix", placeholderHint: "Nutanix" },
  { id: "partner-suse", name: "SUSE", desc: "Enterprise Linux & Rancher", descEn: "Enterprise Linux & Rancher",
    logo: "https://cdn.simpleicons.org/suse", placeholderHint: "SUSE" },
] as const;

/* ==================================================================
 * 9. BLOG_TEASERS — 3 cards on the landing page
 *    All link to: FPTIS NS Blog.dc.html#<slug>
 *    Date: real publish dates (dd/mm/yyyy), matching src/data/posts.ts
 * ================================================================== */
export const BLOG_TEASERS = [
  { slug: "error-budget", category: "SRE", accent: "blue", date: "05/08/2026",
    title: "Error budget: cách chúng tôi cân tốc độ phát hành và độ ổn định",
    excerpt: 'Vì sao một hệ thống "không bao giờ được lỗi" thường là hệ thống chậm đổi mới nhất.' },
  { slug: "alert-noise", category: "AIOPS", accent: "orange", date: "22/07/2026",
    title: "Giảm nhiễu cảnh báo trước khi nghĩ đến machine learning",
    excerpt: "Ba việc phải làm với dữ liệu vận hành trước khi đưa mô hình phát hiện bất thường vào sản xuất." },
  { slug: "migration-waves", category: "MIGRATION", accent: "green", date: "10/07/2026",
    title: "Di trú theo đợt: chia nhỏ để không đánh cược cả hệ thống",
    excerpt: "Kinh nghiệm phân loại 6R và thiết kế cửa sổ cutover cho hệ thống nghiệp vụ lớn." },
] as const;

/* ==================================================================
 * 10. CASES — 3 case-study cards (all link to #contact)
 *     linkLabel is "Xem chi tiết →"
 * ================================================================== */
export const CASES = [
  {
    tag: "CHÍNH PHỦ & KHU VỰC CÔNG",
    tagEn: "GOVERNMENT & PUBLIC SECTOR",
    tagAccent: "blue",
    gridBg: "#EAF3FA", // logoWallGov
    title: "Hạ tầng cloud & bảo mật cho cơ quan nhà nước",
    titleEn: "Cloud & security infrastructure for state agencies",
    desc: "Triển khai nền tảng, di trú hệ thống nghiệp vụ và vận hành 24/7 cho khối bộ ngành.",
    descEn: "Platform deployment, business-system migration and 24/7 operations for ministries and agencies.",
    linkLabel: "Xem chi tiết →",
    logos: [
      { id: "logo-btp", src: "assets/logo-btp.png", placeholderHint: "Bộ Tư pháp — kéo logo vào" },
      { id: "logo-bdttg", src: "assets/logo-bdttg.png", placeholderHint: "Bộ Dân tộc & Tôn giáo — kéo logo vào" },
      { id: "logo-mttq", src: "assets/logo-mttq.png", placeholderHint: "Mặt trận Tổ quốc — kéo logo vào" },
      { id: "logo-bng", src: "assets/logo-bng.png", placeholderHint: "Bộ Ngoại giao — kéo logo vào" },
      { id: "logo-btc", src: "assets/logo-btc.png", placeholderHint: "Bộ Tài chính — kéo logo vào" },
      { id: "logo-evn", src: "assets/logo-evn.png", placeholderHint: "EVN — kéo logo vào" },
    ],
  },
  {
    tag: "NGÂN HÀNG – TÀI CHÍNH (BFSI)",
    tagEn: "BANKING & FINANCE (BFSI)",
    tagAccent: "green",
    gridBg: "#EFF7EA", // logoWallBfsi
    title: "Nền tảng chịu tải cao, tuân thủ và luôn sẵn sàng",
    titleEn: "A high-load, compliant and always-available platform",
    desc: "Kiến trúc đa vùng, DR/backup, giám sát bảo mật và SRE cho hệ thống giao dịch.",
    descEn: "Multi-region architecture, DR/backup, security monitoring and SRE for transaction systems.",
    linkLabel: "Xem chi tiết →",
    logos: [
      { id: "logo-bidv", src: "assets/logo-bidv.png", placeholderHint: "BIDV — kéo logo vào" },
      { id: "logo-vpbank", src: "assets/logo-vpbank.png", placeholderHint: "VPBank — kéo logo vào" },
      { id: "logo-techcombank", src: "assets/logo-techcombank.png", placeholderHint: "Techcombank — kéo logo vào" },
      { id: "logo-vib", src: "assets/logo-vib.png", placeholderHint: "VIB — kéo logo vào" },
      { id: "logo-ocb", src: "assets/logo-ocb.png", placeholderHint: "OCB — kéo logo vào" },
      { id: "logo-ncb", src: "assets/logo-ncb.png", placeholderHint: "NCB Bank — kéo logo vào" },
    ],
  },
  {
    tag: "DOANH NGHIỆP · NỀN TẢNG SỐ",
    tagEn: "ENTERPRISE · DIGITAL PLATFORMS",
    tagAccent: "orange",
    gridBg: "#FEF2EA", // logoWallBiz
    title: "Hạ tầng cho các nền tảng giao dịch số",
    titleEn: "Infrastructure for digital transaction platforms",
    desc: "Cloud-native, container/K8s, tự động hoá phát hành cho các dịch vụ quy mô lớn.",
    descEn: "Cloud-native, containers/K8s and release automation for large-scale services.",
    linkLabel: "Xem chi tiết →",
    logos: [
      { id: "logo-econtract", src: "assets/logo-econtract.png", placeholderHint: "eContract — kéo logo vào" },
      { id: "logo-einvoice", src: "assets/logo-einvoice.png", placeholderHint: "eInvoice — kéo logo vào" },
      { id: "logo-ekyc", src: "assets/logo-ekyc.png", placeholderHint: "eKYC — kéo logo vào" },
    ],
  },
] as const;

/* ==================================================================
 * 11. CONTACT
 * ================================================================== */
export const CONTACT = {
  heading: {
    vi: "Sẵn sàng chuyển đổi cùng FPT-IS Next Gen Service?",
    en: "Ready to transform with FPT-IS Next Gen Service?",
  },
  panelTitle: "Thông tin liên hệ / Contact",
  panelTitleEn: "Contact information",
  phone: { label: "Điện thoại", labelEn: "Phone", value: "+84 973 391 388", href: "tel:+84973391388" },
  email: { label: "Email", labelEn: "Email", value: "dungpv30@fpt.com.vn", href: "mailto:dungpv30@fpt.com.vn" },
  office: { label: "Văn phòng", labelEn: "Office", value: "FPT IS — Keangnam Landmark 72, E10, Nam Từ Liêm, Hà Nội" },
  form: {
    fields: [
      { label: "Họ và tên", labelEn: "Full name", type: "text", placeholder: "[Nguyễn Văn A]", placeholderEn: "[John Smith]" },
      { label: "Email", labelEn: "Email", type: "email", placeholder: "[name@company.com]", placeholderEn: "[name@company.com]" },
      { label: "Công ty", labelEn: "Company", type: "text", placeholder: "[Tên công ty]", placeholderEn: "[Company name]" },
      { label: "Nhu cầu", labelEn: "Your needs", type: "textarea", rows: 3, placeholder: "[Mô tả ngắn nhu cầu Cloud / AI của bạn]", placeholderEn: "[Briefly describe your Cloud / AI needs]" },
    ],
    submit: { default: "Gửi yêu cầu tư vấn", sent: "Đã gửi — cảm ơn bạn!", defaultEn: "Send a consultation request", sentEn: "Sent — thank you!" },
    errors: {
      required: { vi: "Vui lòng nhập họ tên và nhu cầu.", en: "Please enter your name and needs." },
      email: { vi: "Email chưa hợp lệ.", en: "That email is not valid." },
    },
  },
} as const;

/* ==================================================================
 * 12. FOOTER
 * ================================================================== */
export const FOOTER = {
  brand: { line1: "FPT-IS", line2: "NEXT GEN SERVICE", logo: "assets/ns-logo.png" },
  blurb: "Dịch vụ hạ tầng Cloud & AI toàn trình cho doanh nghiệp.",
  blurbEn: "Full-lifecycle Cloud & AI infrastructure services for enterprises.",
  phone: { value: "+84 973 391 388", href: "tel:+84973391388" },
  email: { value: "dungpv30@fpt.com.vn", href: "mailto:dungpv30@fpt.com.vn" },
  columns: [
    {
      head: "Dịch vụ",
      headEn: "Services",
      links: [
        { label: "DevOps / DevSecOps & SRE", labelEn: "DevOps / DevSecOps & SRE", href: "#services" },
        { label: "AIOps", labelEn: "AIOps", href: "#services" },
        { label: "Cloud Platform", labelEn: "Cloud Platform", href: "#services" },
        { label: "Cloud Security", labelEn: "Cloud Security", href: "#services" },
      ],
    },
    {
      head: "Mô hình",
      headEn: "Model",
      links: [
        { label: "Tư vấn", labelEn: "Consult", href: "#model" },
        { label: "Triển khai", labelEn: "Deploy", href: "#model" },
        { label: "Vận hành", labelEn: "Operate", href: "#model" },
        { label: "Tối ưu", labelEn: "Optimize", href: "#model" },
      ],
    },
    {
      head: "Ngành",
      headEn: "Industries",
      links: [
        { label: "Ngân hàng – Tài chính", labelEn: "Banking & finance", href: "#industries" },
        { label: "Chính phủ", labelEn: "Government", href: "#industries" },
        { label: "Sản xuất", labelEn: "Manufacturing", href: "#industries" },
        { label: "Bán lẻ", labelEn: "Retail", href: "#industries" },
      ],
    },
    {
      head: "Về chúng tôi",
      headEn: "About us",
      links: [
        { label: "Giới thiệu", labelEn: "About", href: "#about" },
        { label: "Đối tác công nghệ", labelEn: "Technology partners", href: "#partners" },
        { label: "Khách hàng", labelEn: "Clients", href: "#cases" },
        { label: "Blog", labelEn: "Blog", href: "FPTIS NS Blog.dc.html" },
        { label: "Liên hệ", labelEn: "Contact", href: "#contact" },
      ],
    },
  ],
  bottom: {
    copyright: "© [2026] FPT-IS Next Gen Service. All rights reserved.",
    address: "Keangnam Landmark 72, E10, Nam Từ Liêm, Hà Nội",
  },
} as const;

/* ==================================================================
 * 13. SECTION TITLES + repeated UI strings
 * ================================================================== */
export const SECTION_TITLES = {
  about: { vi: "Dịch vụ Cloud & AI Infrastructure", en: "Cloud & AI infrastructure services unit", mark: "orange" },
  services: { vi: "Các dịch vụ", en: "Our services", mark: "blue" },
  model: { vi: "Mô hình dịch vụ toàn trình", en: "Consult → Deploy → Operate → Optimize", mark: "green" },
  industries: { vi: "Ngành phục vụ", en: "Industries we serve", mark: "blue" },
  partners: { vi: "Đối tác công nghệ", en: "Technology partners", mark: "green" },
  cases: { vi: "Case study tiêu biểu", en: "Selected client stories", mark: "orange" },
  blog: { vi: "Blog kỹ thuật", en: "Engineering blog", mark: "blue" },
  contact: {
    vi: "Sẵn sàng chuyển đổi cùng FPT-IS Next Gen Service?",
    en: "Ready to transform with FPT-IS Next Gen Service?",
    mark: "green",
  },
} as const;

/** Header nav + brand + language toggle. */
export const HEADER = {
  brand: { line1: "FPT-IS", line2: "NEXT GEN SERVICE", logo: "assets/ns-logo.png", href: "#top" },
  nav: [
    { label: "Giới thiệu", labelEn: "About", href: "#about" },
    { label: "Dịch vụ", labelEn: "Services", href: "#services" },
    { label: "Mô hình", labelEn: "Approach", href: "#model" },
    { label: "Ngành", labelEn: "Industries", href: "#industries" },
    { label: "Đối tác", labelEn: "Partners", href: "#partners" },
    { label: "Khách hàng", labelEn: "Customers", href: "#cases" },
    { label: "Blog", labelEn: "Blog", href: "FPTIS NS Blog.dc.html" },
    { label: "Liên hệ", labelEn: "Contact", href: "#contact" },
  ],
  langToggle: { vi: "VN", en: "EN", default: "vi" },
  ctaButton: { label: "Liên hệ tư vấn", labelEn: "Get in touch", href: "#contact" },
} as const;

/** Repeated CTA / link strings used across cards. */
export const UI_STRINGS = {
  serviceCardLink: "Xem thêm →",
  caseCardLink: "Xem chi tiết →",
  blogCardLink: "Đọc bài →",
  blogSeeAll: "Xem tất cả bài viết →",
  serviceCardLinkEn: "Learn more →",
  caseCardLinkEn: "View details →",
  blogCardLinkEn: "Read post →",
  blogSeeAllEn: "View all posts →",
  blogEmpty: "Chưa có bài viết nào được xuất bản.",
  blogEmptyEn: "No posts have been published yet.",
  seeAllHref: "FPTIS NS Blog.dc.html",
  serviceDetailHrefBase: "FPTIS NS Service Detail.dc.html#", // + slug
  blogHrefBase: "FPTIS NS Blog.dc.html#", // + slug
} as const;
