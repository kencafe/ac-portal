// ---------------------------------------------------------------------------
// Verbatim design data extracted from:
//   design_handoff_fptis_ns_web/designs/FPTIS NS Service Detail.dc.html
//
// Source is a .dc.html design component. The SERVICES object lives in the
// <script type="text/x-dc"> block; layout/section labels live in the <x-dc>
// markup and in renderVals(). All Vietnamese/English strings below are copied
// exactly (no paraphrase, translation, or fill-in). [placeholder] brackets are
// preserved as-is.
// ---------------------------------------------------------------------------

// Accent hex constants (from source: const ORANGE / BLUE / GREEN)
export const ORANGE = "#F37021";
export const BLUE = "#0072BC";
export const GREEN = "#57A336";

export type Accent = "blue" | "orange" | "green";

/** Maps a raw tone hex back to its named accent. */
export const ACCENT_BY_HEX: Record<string, Accent> = {
  [ORANGE]: "orange",
  [BLUE]: "blue",
  [GREEN]: "green",
};

/** A single label→value row of the "Bảng mô tả dịch vụ" table. */
export interface Spec {
  /** label (k) */
  k: string;
  /** value (v) */
  v: string;
}

/**
 * A "giai đoạn" (phase) card. NOTE: in the source the phase TITLES are NOT
 * stored per-service — they are hard-coded once in renderVals() as
 * ["Tư vấn","Triển khai","Vận hành","Tối ưu"] (vi) /
 * ["Consult","Deploy","Operate","Optimize"] (en), with num "01".."04".
 * Only the bullet `items` come from each service's `phases[i]`.
 */
export interface Phase {
  /** "01".."04" */
  num: string;
  /** Vietnamese phase title */
  vi: string;
  /** English phase title */
  en: string;
  /** the "Hạng mục" bullets for this phase (verbatim, in order) */
  items: string[];
}

export interface ServiceDetail {
  slug: string;
  /** display / Vietnamese name */
  name: string;
  /** English subtitle line */
  nameEn: string;
  /** short service code shown on the plate (e.g. "DEV") */
  code: string;
  /** service code value from specs "Mã dịch vụ" (e.g. "NS-DEV") */
  serviceCode: string;
  /** nhóm dịch vụ tag label */
  group: string;
  /** named accent for the group/plate */
  accent: Accent;
  /** accent hex (source: `tone`) */
  accentHex: string;
  /** positioning / hero intro paragraph (source: `pitch`), verbatim */
  positioning: string;
  /** the 6 rows of "Bảng mô tả dịch vụ" */
  specs: Spec[];
  /** the 4 giai đoạn cards (titles injected from PHASE_TITLES) */
  phases: Phase[];
  /** Deliverables list (rendered with ✓) */
  deliverables: string[];
  /** technology tag list (Stack) */
  stack: string[];
  /** Outcomes list (rendered with →) */
  outcomes: string[];
}

// ---------------------------------------------------------------------------
// Phase titles — hard-coded in renderVals(), shared across every service.
// ---------------------------------------------------------------------------
export const PHASE_TITLES: { num: string; vi: string; en: string }[] = [
  { num: "01", vi: "Tư vấn", en: "Consult" },
  { num: "02", vi: "Triển khai", en: "Deploy" },
  { num: "03", vi: "Vận hành", en: "Operate" },
  { num: "04", vi: "Tối ưu", en: "Optimize" },
];

// Helper to build the 4 Phase objects from a service's raw phase-item arrays.
function buildPhases(itemGroups: string[][]): Phase[] {
  return PHASE_TITLES.map((t, i) => ({
    num: t.num,
    vi: t.vi,
    en: t.en,
    items: itemGroups[i],
  }));
}

// ---------------------------------------------------------------------------
// SERVICES data — 9 services, key order per ORDER below.
// ---------------------------------------------------------------------------
export const SERVICES: Record<string, ServiceDetail> = {
  devops: {
    slug: "devops",
    code: "DEV",
    serviceCode: "NS-DEV",
    accent: "orange",
    accentHex: ORANGE,
    name: "DevOps / DevSecOps",
    nameEn: "Secure CI/CD & automation",
    group: "Harness Engineering",
    positioning:
      "Dựng và vận hành đường ống phát hành: CI/CD, GitOps, Infrastructure as Code, feature flag. Mục tiêu là mỗi thay đổi đi từ commit đến production một cách an toàn, có thể lặp lại và có thể quay lui.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-DEV" },
      { k: "Nhóm dịch vụ", v: "Harness Engineering — nền tảng phát hành" },
      { k: "Phạm vi", v: "Pipeline CI/CD, IaC, bảo mật trong pipeline (SAST/DAST/SCA), quản trị artifact, release governance" },
      { k: "Đối tượng", v: "Đội phát triển sản phẩm, khối CNTT có nhiều ứng dụng cùng phát hành" },
      { k: "Mô hình hợp tác", v: "Dự án triển khai · đồng hành theo sprint · managed pipeline" },
      { k: "Cam kết", v: "SLA theo hợp đồng · pipeline availability · thời gian phục hồi build" },
    ],
    phases: buildPhases([
      ["Đánh giá độ trưởng thành DevOps", "Rà soát repo, branch strategy", "Chuẩn hoá quy trình phát hành", "Thiết kế pipeline mục tiêu"],
      ["Dựng CI/CD pipeline", "IaC cho môi trường", "Artifact registry & scan", "SAST/DAST/SCA trong pipeline", "Feature flag & blue-green"],
      ["Vận hành pipeline", "Quản trị secret & quyền", "Theo dõi DORA metrics", "Hỗ trợ đội dev"],
      ["Giảm thời gian build", "Tự động hoá kiểm thử", "Progressive delivery", "Chuẩn hoá template dùng lại"],
    ]),
    deliverables: [
      "Tài liệu kiến trúc pipeline và quy trình phát hành",
      "Bộ pipeline CI/CD chạy thực tế trên môi trường khách hàng",
      "Repository IaC có version và review",
      "Bộ template dùng lại cho các ứng dụng tiếp theo",
      "Báo cáo DORA metrics định kỳ",
    ],
    stack: ["GitLab CI", "GitHub Actions", "Jenkins", "Argo CD", "Terraform", "Ansible", "Helm", "Harbor", "SonarQube", "Vault"],
    outcomes: [
      "Rút ngắn thời gian từ commit đến production",
      "Giảm tỷ lệ lỗi khi phát hành",
      "Phát hành lặp lại được, không phụ thuộc cá nhân",
    ],
  },

  sre: {
    slug: "sre",
    code: "SRE",
    serviceCode: "NS-SRE",
    accent: "blue",
    accentHex: BLUE,
    name: "SRE",
    nameEn: "Site reliability engineering",
    group: "Độ tin cậy & vận hành",
    positioning:
      "Đưa độ tin cậy thành một chỉ số có thể quản trị: SLO/SLI, error budget, observability đầy đủ và văn hoá blameless postmortem. Vận hành theo dữ liệu thay vì theo cảm tính.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-SRE" },
      { k: "Nhóm dịch vụ", v: "Độ tin cậy & vận hành" },
      { k: "Phạm vi", v: "SLO/SLI, error budget, observability, on-call, quản trị sự cố" },
      { k: "Đối tượng", v: "Hệ thống có yêu cầu sẵn sàng cao: giao dịch, cổng dịch vụ công, nền tảng số" },
      { k: "Mô hình hợp tác", v: "SRE embedded · SRE as a service · kíp trực 24/7" },
      { k: "Cam kết", v: "SLA 24/7 · thời gian phản hồi và khắc phục theo mức độ sự cố" },
    ],
    phases: buildPhases([
      ["Xác định hành trình người dùng quan trọng", "Đặt SLO/SLI và error budget", "Đánh giá khoảng trống observability", "Thiết kế mô hình on-call"],
      ["Triển khai metric, log, trace", "Dựng dashboard và cảnh báo theo SLO", "Xây runbook", "Thiết lập quy trình sự cố"],
      ["Kíp trực on-call 24/7", "Xử lý và điều phối sự cố", "Blameless postmortem", "Báo cáo error budget"],
      ["Giảm toil bằng tự động hoá", "Tinh chỉnh ngưỡng cảnh báo", "Diễn tập sự cố & chaos", "Cải tiến kiến trúc theo dữ liệu"],
    ]),
    deliverables: [
      "Bộ SLO/SLI cho các hành trình nghiệp vụ chính",
      "Hệ thống observability và dashboard vận hành",
      "Runbook và quy trình quản trị sự cố",
      "Báo cáo error budget, MTTR, postmortem định kỳ",
    ],
    stack: ["Prometheus", "Grafana", "Loki", "Tempo", "OpenTelemetry", "Elastic", "Zabbix", "PagerDuty", "Alertmanager"],
    outcomes: [
      "Giảm số sự cố lặp lại và thời gian khắc phục",
      "Nhìn thấy vấn đề trước khi người dùng phản ánh",
      "Cân bằng được tốc độ phát hành và độ ổn định",
    ],
  },

  aiops: {
    slug: "aiops",
    code: "AIO",
    serviceCode: "NS-AIO",
    accent: "orange",
    accentHex: ORANGE,
    name: "AIOps",
    nameEn: "Triển khai & vận hành AIOps",
    group: "Mới",
    positioning:
      "Đài chỉ huy tự đọc tín hiệu. Chúng tôi dựng nền tảng dữ liệu vận hành, đưa mô hình phát hiện bất thường vào đường dẫn cảnh báo, rồi vận hành cùng kíp SRE — không bàn giao một dashboard rồi rút.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-AIO" },
      { k: "Nhóm dịch vụ", v: "Vận hành thông minh — dịch vụ mới" },
      { k: "Phạm vi", v: "Nền tảng dữ liệu vận hành, phát hiện bất thường, gom nhóm cảnh báo, tự khắc phục" },
      { k: "Đối tượng", v: "Tổ chức có nhiều hệ thống, cảnh báo nhiều nhưng khó ưu tiên" },
      { k: "Mô hình hợp tác", v: "Triển khai nền tảng · vận hành cùng kíp SRE 24/7" },
      { k: "Cam kết", v: "SLA 24/7 · mục tiêu giảm nhiễu cảnh báo và MTTR theo cam kết hợp đồng" },
    ],
    phases: buildPhases([
      ["Kiểm kê nguồn tín hiệu", "Đánh giá chất lượng dữ liệu vận hành", "Chọn ca sử dụng ưu tiên", "Thiết kế kiến trúc AIOps"],
      ["Dựng pipeline log/metric/trace", "Chuẩn hoá kho sự kiện", "Triển khai mô hình phát hiện bất thường", "Nối vào quy trình on-call"],
      ["Gom nhóm và ưu tiên cảnh báo", "Phân tích nguyên nhân gốc", "Runbook tự chạy", "Kíp SRE trực cùng nền tảng"],
      ["Huấn luyện lại theo mùa tải", "Mở rộng tự khắc phục", "Giảm cảnh báo nhiễu", "Báo cáo hiệu quả theo SLO"],
    ]),
    deliverables: [
      "Nền tảng dữ liệu vận hành tập trung",
      "Mô hình phát hiện bất thường đưa vào sản xuất",
      "Bộ runbook tự động cho nhóm sự cố quen thuộc",
      "Báo cáo giảm nhiễu cảnh báo và MTTR",
    ],
    stack: ["OpenTelemetry", "Prometheus", "Elastic", "Grafana", "Kafka", "OpenSearch", "Python / ML pipeline", "Ansible", "n8n / Rundeck"],
    outcomes: [
      "Giảm nhiễu cảnh báo 60%",
      "Rút ngắn MTTR 45%",
      "Kíp vận hành tập trung vào việc đáng làm",
    ],
  },

  platform: {
    slug: "platform",
    code: "PLT",
    serviceCode: "NS-PLT",
    accent: "blue",
    accentHex: BLUE,
    name: "Cloud Platform",
    nameEn: "Landing zone & FinOps",
    group: "Nền tảng",
    positioning:
      "Thân hạm của toàn bộ hệ thống: landing zone chuẩn hoá, mạng, danh tính, quản trị chi phí. Nền tảng được dựng một lần cho đúng để mọi ứng dụng phía trên chạy trên cùng luật.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-PLT" },
      { k: "Nhóm dịch vụ", v: "Nền tảng cloud" },
      { k: "Phạm vi", v: "Landing zone, mạng, danh tính, tagging, guardrail, FinOps" },
      { k: "Đối tượng", v: "Tổ chức bắt đầu hoặc đang mở rộng trên nhiều tài khoản/đám mây" },
      { k: "Mô hình hợp tác", v: "Dự án dựng nền tảng · quản trị nền tảng theo tháng" },
      { k: "Cam kết", v: "SLA theo hợp đồng · báo cáo chi phí và tuân thủ định kỳ" },
    ],
    phases: buildPhases([
      ["Đánh giá hiện trạng cloud", "Thiết kế landing zone", "Mô hình tài khoản & phân quyền", "Dự toán TCO"],
      ["Dựng landing zone", "Cấu hình mạng & kết nối", "Guardrail và policy", "Chuẩn tagging & billing"],
      ["Quản trị nền tảng", "Theo dõi tuân thủ", "Quản lý hạn mức và quota", "Hỗ trợ đội ứng dụng"],
      ["FinOps tối ưu chi phí", "Rightsizing & reserved capacity", "Dọn tài nguyên không dùng", "Báo cáo hiệu quả chi phí"],
    ]),
    deliverables: [
      "Tài liệu thiết kế landing zone",
      "Landing zone triển khai bằng IaC",
      "Bộ policy, guardrail và chuẩn tagging",
      "Báo cáo FinOps định kỳ",
    ],
    stack: ["AWS", "Microsoft Azure", "Google Cloud", "FPT Smart Cloud", "VMware", "Terraform", "Cloud Custodian", "Entra ID"],
    outcomes: [
      "Nền tảng nhất quán, mở rộng có kiểm soát",
      "Chi phí cloud minh bạch theo đơn vị sử dụng",
      "Ứng dụng mới lên nhanh hơn",
    ],
  },

  security: {
    slug: "security",
    code: "SEC",
    serviceCode: "NS-SEC",
    accent: "green",
    accentHex: GREEN,
    name: "Cloud Security",
    nameEn: "Zero Trust & compliance",
    group: "Phòng thủ nhiều lớp",
    positioning:
      "Vành đai phòng thủ nhiều lớp quanh hạm đội: Zero Trust, quản trị danh tính, bảo vệ workload, giám sát liên tục và tuân thủ. Phát hiện từ xa, chặn ở nhiều tầng, phục hồi theo kịch bản đã diễn tập.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-SEC" },
      { k: "Nhóm dịch vụ", v: "Bảo mật & tuân thủ" },
      { k: "Phạm vi", v: "Zero Trust, IAM, bảo vệ workload, mã hoá, giám sát, tuân thủ" },
      { k: "Đối tượng", v: "Khối ngân hàng, khu vực công và doanh nghiệp có yêu cầu tuân thủ" },
      { k: "Mô hình hợp tác", v: "Dự án củng cố bảo mật · giám sát 24/7 · đánh giá định kỳ" },
      { k: "Cam kết", v: "SLA 24/7 · thời gian phản ứng sự cố theo mức độ" },
    ],
    phases: buildPhases([
      ["Đánh giá rủi ro & bề mặt tấn công", "Rà soát tuân thủ", "Thiết kế kiến trúc Zero Trust", "Lộ trình khắc phục"],
      ["Triển khai IAM & MFA", "Phân vùng mạng và policy", "Bảo vệ workload & mã hoá", "Quản trị bí mật"],
      ["Giám sát bảo mật 24/7", "Điều tra và xử lý sự cố", "Quản lý lỗ hổng & bản vá", "Diễn tập phục hồi"],
      ["Thu hẹp quyền theo least privilege", "Tự động hoá phản ứng", "Kiểm thử xâm nhập định kỳ", "Cải tiến theo khung tuân thủ"],
    ]),
    deliverables: [
      "Báo cáo đánh giá rủi ro và khoảng trống tuân thủ",
      "Kiến trúc và policy Zero Trust",
      "Hệ thống giám sát bảo mật vận hành",
      "Kịch bản ứng phó sự cố và biên bản diễn tập",
    ],
    stack: ["Entra ID", "Keycloak", "HashiCorp Vault", "Wazuh", "CrowdStrike", "Trivy", "WAF", "SIEM/SOAR", "CIS Benchmark"],
    outcomes: [
      "Giảm bề mặt tấn công và quyền dư thừa",
      "Phát hiện và phản ứng sự cố nhanh hơn",
      "Đáp ứng yêu cầu kiểm toán và tuân thủ",
    ],
  },

  cloudai: {
    slug: "cloudai",
    code: "AIC",
    serviceCode: "NS-AIC",
    accent: "blue",
    accentHex: BLUE,
    name: "Cloud & Hạ tầng AI",
    nameEn: "Cloud & AI Infrastructure",
    group: "Nền tảng & hạ tầng AI",
    positioning:
      "Kho nhiên liệu và xưởng động cơ của phi đội AI: nền tảng dữ liệu (data lake, feature store) hợp nhất với hạ tầng tính toán (GPU/accelerator, MLOps) — sẵn sàng cho toàn vòng đời AI/ML, từ dữ liệu tới phục vụ mô hình và LLM ở quy mô sản xuất.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-AIC" },
      { k: "Nhóm dịch vụ", v: "Nền tảng dữ liệu & hạ tầng AI" },
      { k: "Phạm vi", v: "Data platform, feature store, quản trị dữ liệu; cluster GPU, MLOps, model serving, tối ưu suy luận" },
      { k: "Đối tượng", v: "Tổ chức đưa AI/ML — kể cả LLM — vào sản xuất" },
      { k: "Mô hình hợp tác", v: "Dự án nền tảng · vận hành cluster theo tháng · đồng hành đội data science" },
      { k: "Cam kết", v: "SLA theo hợp đồng · hiệu năng pipeline dữ liệu và mức sẵn sàng cluster" },
    ],
    phases: buildPhases([
      ["Khảo sát nguồn dữ liệu & workload AI", "Đánh giá mức độ sẵn sàng", "Thiết kế kiến trúc dữ liệu + cluster GPU", "Dự toán TCO"],
      ["Dựng data lake/lakehouse & feature store", "Dựng cluster GPU & scheduler", "MLOps pipeline (huấn luyện → serving)", "Môi trường huấn luyện & model serving"],
      ["Vận hành pipeline dữ liệu & cluster 24/7", "Quản trị chất lượng & hạn mức GPU", "Kiểm soát truy cập & dòng dữ liệu", "Theo dõi hiệu suất & chi phí"],
      ["Tối ưu hiệu năng truy vấn & suy luận", "Quantization & autoscaling", "Tối ưu chi phí lưu trữ theo lớp và GPU", "Chuẩn hoá tái sử dụng dữ liệu & mô hình"],
    ]),
    deliverables: [
      "Kiến trúc dữ liệu và hạ tầng tính toán cho AI",
      "Data lake/lakehouse, feature store và pipeline vận hành",
      "Cluster GPU và MLOps pipeline từ huấn luyện đến phát hành mô hình",
      "Lớp phục vụ mô hình có giám sát và quy tắc quản trị dữ liệu",
    ],
    stack: ["Databricks", "Apache Spark", "Kafka", "Airflow", "Feast", "MinIO / S3", "NVIDIA GPU", "Kubernetes", "Kubeflow", "MLflow", "Ray", "vLLM", "Triton Inference Server"],
    outcomes: [
      "Dữ liệu sạch và hạ tầng đủ lực cho mô hình",
      "Rút ngắn thời gian từ ý tưởng đến mô hình chạy thật",
      "Chi phí dữ liệu và suy luận kiểm soát được",
    ],
  },

  migration: {
    slug: "migration",
    code: "MIG",
    serviceCode: "NS-MIG",
    accent: "green",
    accentHex: GREEN,
    name: "Cloud Migration",
    nameEn: "Assess & migrate",
    group: "Di trú & hiện đại hoá",
    positioning:
      "Chuyển cả phi đội sang hạm mới mà không gián đoạn nhiệm vụ: đánh giá, phân loại, di trú ứng dụng và dữ liệu, hiện đại hoá theo từng đợt có kiểm soát.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-MIG" },
      { k: "Nhóm dịch vụ", v: "Di trú & hiện đại hoá" },
      { k: "Phạm vi", v: "Đánh giá, thiết kế đích, di trú ứng dụng/dữ liệu, cutover, hiện đại hoá" },
      { k: "Đối tượng", v: "Tổ chức chuyển từ on-premise lên cloud hoặc giữa các đám mây" },
      { k: "Mô hình hợp tác", v: "Dự án theo đợt (wave) · hỗ trợ hậu di trú" },
      { k: "Cam kết", v: "Cam kết cửa sổ downtime và phương án quay lui cho từng đợt" },
    ],
    phases: buildPhases([
      ["Kiểm kê ứng dụng & phụ thuộc", "Phân loại 6R", "Thiết kế kiến trúc đích", "Lập kế hoạch theo đợt và TCO"],
      ["Dựng môi trường đích", "Di trú dữ liệu & ứng dụng", "Kiểm thử hiệu năng và nghiệp vụ", "Cutover và go-live"],
      ["Theo dõi sau di trú", "Xử lý tồn đọng", "Chuyển giao vận hành", "Đóng hệ thống cũ"],
      ["Hiện đại hoá dần sang cloud-native", "Tối ưu chi phí sau di trú", "Chuẩn hoá kiến trúc", "Cải tiến hiệu năng"],
    ]),
    deliverables: [
      "Báo cáo kiểm kê và phân loại 6R",
      "Kiến trúc đích và kế hoạch di trú theo đợt",
      "Hệ thống chạy trên môi trường mới",
      "Biên bản cutover và tài liệu chuyển giao vận hành",
    ],
    stack: ["AWS MGN", "Azure Migrate", "Velostrata", "VMware HCX", "Terraform", "Ansible", "DMS", "Veeam"],
    outcomes: [
      "Di trú theo đợt, hạn chế rủi ro gián đoạn",
      "Giảm chi phí duy trì hệ thống cũ",
      "Hệ thống sẵn sàng cho bước hiện đại hoá tiếp theo",
    ],
  },

  cloudapp: {
    slug: "cloudapp",
    code: "APP",
    serviceCode: "NS-APP",
    accent: "blue",
    accentHex: BLUE,
    name: "Cloud App",
    nameEn: "Cloud-native apps",
    group: "Ứng dụng cloud-native",
    positioning:
      "Xưởng đóng mới và nâng cấp phi cơ: phát triển, tái cấu trúc ứng dụng theo kiến trúc cloud-native, container/Kubernetes và microservice có thể vận hành lâu dài.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-APP" },
      { k: "Nhóm dịch vụ", v: "Ứng dụng cloud-native" },
      { k: "Phạm vi", v: "Kiến trúc microservice, container hoá, API, tái cấu trúc ứng dụng cũ" },
      { k: "Đối tượng", v: "Tổ chức có ứng dụng monolith cần mở rộng hoặc phát triển sản phẩm mới" },
      { k: "Mô hình hợp tác", v: "Dự án phát triển · đội phát triển tăng cường" },
      { k: "Cam kết", v: "SLA theo hợp đồng · cam kết chất lượng và bảo hành sau bàn giao" },
    ],
    phases: buildPhases([
      ["Đánh giá ứng dụng hiện tại", "Thiết kế kiến trúc microservice", "Xác định ranh giới nghiệp vụ", "Lộ trình tách dịch vụ"],
      ["Container hoá ứng dụng", "Triển khai trên Kubernetes/OpenShift", "Dựng API gateway & service mesh", "Tích hợp CI/CD"],
      ["Vận hành ứng dụng", "Theo dõi hiệu năng và lỗi", "Quản trị phiên bản", "Hỗ trợ người dùng"],
      ["Tối ưu tài nguyên container", "Autoscaling theo tải", "Refactor phần nghẽn", "Chuẩn hoá thư viện dùng chung"],
    ]),
    deliverables: [
      "Tài liệu kiến trúc ứng dụng cloud-native",
      "Ứng dụng container hoá chạy trên K8s/OpenShift",
      "Bộ API và tài liệu tích hợp",
      "Tài liệu vận hành và chuyển giao",
    ],
    stack: ["Kubernetes", "OpenShift", "Docker", "Helm", "Istio", "Kong", "Spring Boot", "Node.js", "PostgreSQL", "Redis"],
    outcomes: [
      "Ứng dụng mở rộng theo tải thay vì nâng cấp phần cứng",
      "Phát hành từng phần, giảm rủi ro",
      "Chi phí hạ tầng theo nhu cầu thực",
    ],
  },

  outsourcing: {
    slug: "outsourcing",
    code: "EOS",
    serviceCode: "NS-EOS",
    accent: "blue",
    accentHex: BLUE,
    name: "Thuê kỹ sư theo vị trí",
    nameEn: "Engineer outsourcing & staff augmentation",
    group: "Talent & Delivery",
    positioning:
      "Cung cấp kỹ sư theo từng vị trí — Cloud Engineer, DevOps Engineer, Platform Engineer, Security Engineer — theo hình thức thuê ngoài, bổ sung năng lực cho đội ngũ khách hàng theo dự án hoặc dài hạn. Kỹ sư được tuyển chọn, đào tạo theo chuẩn nội bộ và làm việc trực tiếp trong quy trình của khách hàng.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-EOS" },
      { k: "Nhóm dịch vụ", v: "Talent & Delivery — bổ sung năng lực kỹ thuật" },
      { k: "Vị trí cung cấp", v: "Cloud Engineer · DevOps Engineer · Platform Engineer · Security Engineer (Junior → Expert)" },
      { k: "Phạm vi", v: "Cung ứng kỹ sư Cloud/DevOps/Platform/Security theo cấp độ Junior→Expert" },
      { k: "Đối tượng", v: "Doanh nghiệp thiếu nhân sự chuyên sâu, cần mở rộng đội nhanh, hoặc cần chuyên gia theo giai đoạn" },
      { k: "Mô hình hợp tác", v: "Body-shopping · team thuê ngoài · managed team (có team lead) · onsite/hybrid/remote" },
      { k: "Cam kết", v: "SLA thay thế nhân sự · NDA & bảo mật · đánh giá năng lực định kỳ" },
    ],
    phases: buildPhases([
      ["Khảo sát nhu cầu & vị trí cần tuyển", "Thống nhất cấp độ, kỹ năng, ngân sách", "Chuẩn hoá JD và tiêu chí đánh giá", "Kế hoạch onboarding"],
      ["Tuyển chọn & phỏng vấn ứng viên", "Khách hàng phỏng vấn chốt", "Onboarding vào quy trình khách hàng", "Ký NDA & cấp quyền truy cập"],
      ["Kỹ sư làm việc trong team khách hàng", "Team lead theo dõi chất lượng", "Báo cáo tiến độ định kỳ", "Hỗ trợ & thay thế khi cần"],
      ["Đánh giá năng lực & phản hồi", "Đào tạo nâng cấp kỹ năng", "Điều chỉnh quy mô team theo nhu cầu", "Chuyển giao tri thức"],
    ]),
    deliverables: [
      "Hồ sơ năng lực (CV) ứng viên phù hợp cấp độ yêu cầu",
      "Kỹ sư onboard vào quy trình khách hàng đúng tiến độ",
      "Báo cáo tiến độ & timesheet định kỳ",
      "Cam kết SLA thay thế nhân sự khi biến động",
      "Tài liệu chuyển giao tri thức khi kết thúc",
    ],
    stack: ["DevOps", "SRE", "Kubernetes", "AWS", "Azure", "GCP", "Terraform", "CI/CD", "Security", "Platform Engineering"],
    outcomes: [
      "Mở rộng đội kỹ thuật nhanh, không tốn thời gian tuyển dụng",
      "Tiếp cận chuyên gia theo đúng giai đoạn dự án",
      "Chi phí linh hoạt theo nhu cầu, giảm rủi ro nhân sự",
    ],
  },

  attt: {
    slug: "attt",
    code: "ATT",
    serviceCode: "NS-ATT",
    accent: "orange",
    accentHex: ORANGE,
    name: "An toàn thông tin theo luật Việt Nam",
    nameEn: "Vietnam IT-security compliance (Cybersecurity & IS laws)",
    group: "Compliance & Assurance",
    positioning:
      "Tư vấn và triển khai tuân thủ pháp luật an toàn thông tin Việt Nam: Luật An ninh mạng, Luật An toàn thông tin mạng, Nghị định 85/2016 về bảo đảm an toàn hệ thống thông tin theo cấp độ, và các quy định về bảo vệ dữ liệu cá nhân (NĐ 13/2023). Đồng hành từ phân định cấp độ, lập hồ sơ đề xuất cấp độ đến triển khai phương án bảo vệ và duy trì tuân thủ.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-ATT" },
      { k: "Nhóm dịch vụ", v: "Compliance & Assurance — tuân thủ pháp luật ATTT" },
      { k: "Phạm vi", v: "Phân loại & xác định cấp độ ATHTTT (cấp 1–5), hồ sơ đề xuất cấp độ, phương án bảo đảm an toàn, tuân thủ Luật ANM / Luật ATTT mạng / NĐ 85 / NĐ 13" },
      { k: "Đối tượng", v: "Cơ quan nhà nước, doanh nghiệp vận hành hệ thống thông tin quan trọng, tổ chức xử lý dữ liệu cá nhân" },
      { k: "Mô hình hợp tác", v: "Tư vấn tuân thủ · lập hồ sơ cấp độ · triển khai kỹ thuật · đánh giá định kỳ" },
      { k: "Cam kết", v: "Hồ sơ đúng biểu mẫu quy định · phối hợp thẩm định với cơ quan chức năng · rà soát định kỳ" },
    ],
    phases: buildPhases([
      ["Khảo sát hệ thống thông tin", "Phân loại & xác định cấp độ an toàn (cấp 1–5)", "Rà soát khoảng trống so với quy định", "Tư vấn lộ trình tuân thủ"],
      ["Lập hồ sơ đề xuất cấp độ theo NĐ 85", "Thiết kế phương án bảo đảm an toàn theo cấp độ", "Triển khai biện pháp kỹ thuật & quản lý", "Phối hợp thẩm định, phê duyệt cấp độ"],
      ["Vận hành phương án bảo vệ", "Giám sát an toàn thông tin (SOC/SIEM)", "Ứng phó sự cố theo quy định", "Duy trì hồ sơ tuân thủ"],
      ["Đánh giá lại cấp độ định kỳ", "Cập nhật theo văn bản pháp luật mới", "Diễn tập ứng phó sự cố", "Tối ưu chi phí tuân thủ"],
    ]),
    deliverables: [
      "Báo cáo phân loại & xác định cấp độ an toàn hệ thống thông tin",
      "Hồ sơ đề xuất cấp độ theo mẫu Nghị định 85/2016",
      "Phương án bảo đảm an toàn thông tin theo cấp độ",
      "Bộ chính sách/quy chế ATTT tuân thủ Luật ANM & Luật ATTT mạng",
      "Báo cáo tuân thủ bảo vệ dữ liệu cá nhân (NĐ 13/2023)",
    ],
    stack: ["ISO 27001", "NĐ 85/2016", "Luật An ninh mạng", "Luật ATTT mạng", "NĐ 13/2023", "SIEM", "SOC", "IAM", "DLP", "Firewall"],
    outcomes: [
      "Hệ thống được phân định & phê duyệt cấp độ đúng quy định",
      "Giảm rủi ro pháp lý và rủi ro an ninh mạng",
      "Sẵn sàng thẩm định với cơ quan quản lý nhà nước",
    ],
  },

  managed: {
    slug: "managed",
    code: "MSP",
    serviceCode: "NS-MSP",
    accent: "green",
    accentHex: GREEN,
    name: "Cloud Managed Service toàn diện",
    nameEn: "Comprehensive cloud managed service",
    group: "Managed Operations",
    positioning:
      "Vận hành toàn diện hạ tầng cloud của khách hàng 24/7 với một đầu mối chịu trách nhiệm: giám sát, xử lý sự cố, vá bảo mật, sao lưu & phục hồi thảm hoạ, quản trị thay đổi, tối ưu chi phí và tuân thủ. Khách hàng tập trung vào sản phẩm, phần vận hành nền tảng do đội ngũ managed service đảm nhiệm theo SLA cam kết.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-MSP" },
      { k: "Nhóm dịch vụ", v: "Managed Operations — vận hành nền tảng theo SLA" },
      { k: "Phạm vi", v: "Giám sát 24/7, quản trị sự cố & thay đổi (ITSM), vá & cập nhật, backup/DR, security operations, FinOps, đa đám mây (AWS/Azure/GCP) và on-prem/K8s" },
      { k: "Đối tượng", v: "Doanh nghiệp muốn thuê ngoài toàn bộ vận hành hạ tầng, hệ thống yêu cầu sẵn sàng cao và tuân thủ" },
      { k: "Mô hình hợp tác", v: "Managed service theo gói · co-managed (đồng vận hành) · trọn gói theo SLA · onsite/remote" },
      { k: "Cam kết", v: "SLA 24/7 · uptime cam kết · RTO/RPO theo hợp đồng · báo cáo vận hành & chi phí định kỳ" },
    ],
    phases: buildPhases([
      ["Đánh giá hiện trạng hạ tầng & rủi ro", "Định nghĩa danh mục dịch vụ & SLA", "Kiểm kê tài sản, quyền truy cập, tuân thủ", "Lập runbook & service catalog"],
      ["Onboard hệ thống vào quản trị", "Dựng giám sát/cảnh báo & tooling", "Thiết lập backup/DR & security baseline", "Tích hợp ITSM và quy trình change/incident"],
      ["Vận hành & trực sự cố 24/7", "Vá, cập nhật & quản trị thay đổi", "Sao lưu và kiểm thử phục hồi định kỳ", "Báo cáo SLA, uptime & FinOps"],
      ["Tối ưu chi phí và hiệu năng", "Tự động hoá vận hành, giảm toil", "Cải tiến kiến trúc & bảo mật liên tục", "Rà soát SLA và lộ trình nâng cấp"],
    ]),
    deliverables: [
      "Danh mục dịch vụ (service catalog) và cam kết SLA rõ ràng",
      "Hệ thống giám sát 24/7, dashboard & cảnh báo theo SLA",
      "Runbook vận hành và quy trình ITSM (incident/change/problem)",
      "Kế hoạch backup/DR đã kiểm thử phục hồi",
      "Báo cáo vận hành, uptime và tối ưu chi phí định kỳ",
    ],
    stack: ["Prometheus", "Grafana", "ELK", "Zabbix", "Kubernetes", "Terraform", "Ansible", "AWS", "Azure", "GCP", "Veeam", "ITSM"],
    outcomes: [
      "Giảm gánh nặng vận hành cho đội ngũ nội bộ",
      "SLA cam kết với một đầu mối chịu trách nhiệm",
      "Tối ưu chi phí cloud và tuân thủ liên tục",
    ],
  },

  incident: {
    slug: "incident",
    code: "IRC",
    serviceCode: "NS-IRC",
    accent: "orange",
    accentHex: ORANGE,
    name: "Ứng cứu sự cố Cloud",
    nameEn: "Cloud incident response & emergency remediation",
    group: "Emergency & Assurance",
    positioning:
      "Ứng cứu sự cố khẩn cấp cho hệ thống trên cloud: tiếp nhận 24/7, phản ứng nhanh, lập war-room, khoanh vùng và khôi phục dịch vụ, rồi điều tra nguyên nhân gốc. Xử lý cả sự cố vận hành (downtime, quá tải, lỗi phát hành) lẫn sự cố an ninh (tấn công, xâm nhập, rò rỉ, ransomware). Dùng theo thuê bao ứng cứu (retainer) hoặc gọi khẩn theo vụ.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-IRC" },
      { k: "Nhóm dịch vụ", v: "Emergency & Assurance — ứng cứu & khôi phục" },
      { k: "Phạm vi", v: "Tiếp nhận & phân mức sự cố 24/7, war-room, khoanh vùng/ngăn chặn/khôi phục, điều tra nguyên nhân gốc; sự cố vận hành lẫn an ninh (DDoS, xâm nhập, ransomware), forensics cơ bản" },
      { k: "Đối tượng", v: "Hệ thống cloud quan trọng cần cam kết ứng cứu nhanh; tổ chức chưa có đội IR chuyên trách" },
      { k: "Mô hình hợp tác", v: "Retainer (thuê bao ứng cứu) · khẩn cấp theo vụ (call-out) · đồng trực với đội khách hàng" },
      { k: "Cam kết", v: "Hotline 24/7 · thời gian phản hồi theo mức độ sự cố · RTO mục tiêu · báo cáo sau sự cố" },
    ],
    phases: buildPhases([
      ["Đánh giá rủi ro & kịch bản sự cố", "Thiết lập kênh tiếp nhận & phân mức", "Xây IR playbook & mô hình war-room", "Thống nhất SLA phản hồi & liên hệ khẩn"],
      ["Tích hợp giám sát/cảnh báo & escalation", "Chuẩn bị công cụ forensics & khôi phục", "Diễn tập kịch bản (tabletop/drill)", "Thiết lập kênh war-room & on-call"],
      ["Tiếp nhận & ứng cứu 24/7", "Khoanh vùng, ngăn chặn & khôi phục dịch vụ", "Điều phối war-room, cập nhật liên tục", "Thu thập chứng cứ, log & mốc thời gian"],
      ["Điều tra nguyên nhân gốc (RCA)", "Blameless postmortem & khuyến nghị", "Cập nhật playbook, phòng ngừa tái diễn", "Rà soát & diễn tập định kỳ"],
    ]),
    deliverables: [
      "IR playbook và bảng phân mức sự cố",
      "Kênh hotline/tiếp nhận 24/7 với SLA phản hồi cam kết",
      "Báo cáo ứng cứu & dòng thời gian (timeline) từng sự cố",
      "Điều tra nguyên nhân gốc (RCA) + postmortem + khuyến nghị khắc phục",
      "Báo cáo diễn tập ứng phó sự cố định kỳ",
    ],
    stack: ["PagerDuty", "Opsgenie", "Prometheus", "Grafana", "ELK", "SIEM", "Falco", "Velero", "Veeam", "AWS", "Azure", "GCP"],
    outcomes: [
      "Rút ngắn MTTR khi xảy ra sự cố lớn",
      "Giảm thiệt hại và thời gian gián đoạn dịch vụ",
      "Sẵn sàng ứng cứu cả sự cố vận hành lẫn an ninh",
    ],
  },
};

// ---------------------------------------------------------------------------
// Canonical service order (source: const ORDER).
// ---------------------------------------------------------------------------
export const ORDER: string[] = [
  "devops",
  "sre",
  "aiops",
  "platform",
  "security",
  "cloudai",
  "migration",
  "cloudapp",
  "outsourcing",
  "managed",
  "incident",
  "attt",
];

/**
 * "Các dịch vụ khác" ordering logic (source: renderVals `others`):
 * take ORDER, drop the current slug, keep the remaining 8 in ORDER sequence.
 */
export function otherServices(currentSlug: string): ServiceDetail[] {
  return ORDER.filter((k) => k !== currentSlug).map((k) => SERVICES[k]);
}

// ---------------------------------------------------------------------------
// Static page chrome / section labels (verbatim from the <x-dc> markup).
// ---------------------------------------------------------------------------

/** Sticky brand block in the header */
export const BRAND = {
  logoAlt: "FPT-IS Next Gen Service",
  line1: "FPT-IS",
  line2: "NEXT GEN SERVICE",
  href: "FPTIS NS Landing v3 Ant.dc.html",
};

/** Header nav items (label → href) */
export const HEADER_NAV: { label: string; href: string }[] = [
  { label: "Tất cả dịch vụ", href: "FPTIS NS Landing v3 Ant.dc.html#services" },
  { label: "Phạm vi", href: "#scope" },
  { label: "Hạng mục", href: "#phases" },
  { label: "Công nghệ", href: "#stack" },
];

/** Header primary CTA button */
export const HEADER_CTA = { label: "Liên hệ tư vấn", href: "FPTIS NS Landing v3 Ant.dc.html#contact" };

/** Breadcrumb labels (the 3rd item is the dynamic {{ name }}) */
export const BREADCRUMB: { label: string; href?: string; dynamic?: boolean }[] = [
  { label: "Trang chính", href: "FPTIS NS Landing v3 Ant.dc.html" },
  { label: "Dịch vụ", href: "FPTIS NS Landing v3 Ant.dc.html#services" },
  { label: "{{ name }}", dynamic: true },
];

/** Hero action buttons */
export const HERO_BUTTONS = {
  primary: { label: "Đặt buổi tư vấn", href: "FPTIS NS Landing v3 Ant.dc.html#contact" },
  secondary: { label: "Xem hạng mục công việc", href: "#phases" },
};

/** Section headings: Vietnamese h2 + English sub (h2sub) */
export const SECTION_HEADINGS = {
  scope: { id: "scope", vi: "Bảng mô tả dịch vụ", en: "Service description" },
  phases: { id: "phases", vi: "Hạng mục công việc theo giai đoạn", en: "Consult → Deploy → Operate → Optimize" },
  // The "stack" section (id="stack") has no top-level secHead; it uses two block heads below.
  others: { vi: "Các dịch vụ khác", en: "Other services" },
};

/** Block headings inside the Stack/Deliverables/Outcomes section */
export const BLOCK_HEADINGS = {
  deliverables: "Sản phẩm bàn giao / Deliverables",
  stack: "Công nghệ & nền tảng / Stack",
  outcomes: "Kết quả kỳ vọng / Outcomes",
};

/**
 * CTA panel at the bottom of the page. `title` interpolates the service name.
 * `sub` contains a [X] placeholder preserved verbatim.
 */
export const CTA_PANEL = {
  title: "Cần lộ trình cụ thể cho {{ name }}?",
  sub: "Đội ngũ FPT-IS Next Gen Service sẽ khảo sát hiện trạng và đề xuất phương án trong 3 ngày làm việc.",
  phone: { key: "Điện thoại", value: "+84 973 391 388", href: "tel:+84973391388" },
  email: { key: "Email", value: "contact@appcarrier.cloud hoặc dungpv30@fpt.com", href: "mailto:contact@appcarrier.cloud" },
  button: { label: "Gửi yêu cầu tư vấn", href: "FPTIS NS Landing v3 Ant.dc.html#contact" },
};

/** Footer (contains [2026] placeholder preserved verbatim) */
export const FOOTER = {
  copyright: "© 2026 FPT-IS Next Gen Service. Keangnam Landmark 72, E6 Phạm Hùng, Nam Từ Liêm, Hà Nội.",
  backLink: { label: "← Về trang chính", href: "FPTIS NS Landing v3 Ant.dc.html" },
};

// ===========================================================================
// EN PHASE 2 — English overlay for the /dich-vu/[slug] service detail pages.
// Consumed via useLang()/pick() in the ServiceDetailView client component.
// Each SERVICES_EN[slug] mirrors the shape of SERVICES[slug] field-by-field:
//   specs[i]      ↔ SERVICES[slug].specs[i]      (same order/length)
//   phaseItems[i] ↔ SERVICES[slug].phases[i].items (4 phase groups)
//   stack is optional — falls back to the VN stack (tech names are identical).
// ===========================================================================
export interface ServiceEN {
  /** English service name (falls back to the VN `name` when omitted) */
  enName?: string;
  /** English group / plate tag label */
  group: string;
  /** English positioning / hero paragraph */
  positioning: string;
  /** English "Service description" rows (parallel to specs) */
  specs: Spec[];
  /** English phase bullets — 4 groups parallel to phases[i].items */
  phaseItems: string[][];
  /** English deliverables */
  deliverables: string[];
  /** English outcomes */
  outcomes: string[];
  /** Optional English stack (defaults to the VN stack) */
  stack?: string[];
}

export const SERVICES_EN: Record<string, ServiceEN> = {
  devops: {
    group: "Harness Engineering — release platform",
    positioning:
      "Build and operate the release pipeline: CI/CD, GitOps, Infrastructure as Code and feature flags. The goal is for every change to move from commit to production safely, repeatably and reversibly.",
    specs: [
      { k: "Service code", v: "NS-DEV" },
      { k: "Service group", v: "Harness Engineering — release platform" },
      { k: "Scope", v: "CI/CD pipelines, IaC, in-pipeline security (SAST/DAST/SCA), artifact management, release governance" },
      { k: "Who it's for", v: "Product engineering teams and IT units shipping many applications in parallel" },
      { k: "Engagement model", v: "Implementation project · sprint-based collaboration · managed pipeline" },
      { k: "Commitments", v: "Contractual SLA · pipeline availability · build recovery time" },
    ],
    phaseItems: [
      ["DevOps maturity assessment", "Repo & branch strategy review", "Standardize the release process", "Design the target pipeline"],
      ["Build the CI/CD pipeline", "IaC for environments", "Artifact registry & scanning", "SAST/DAST/SCA in the pipeline", "Feature flags & blue-green"],
      ["Operate the pipeline", "Secret & access management", "Track DORA metrics", "Support the dev team"],
      ["Reduce build time", "Test automation", "Progressive delivery", "Standardize reusable templates"],
    ],
    deliverables: [
      "Pipeline architecture and release-process documentation",
      "A working CI/CD pipeline running in the client environment",
      "A versioned, reviewed IaC repository",
      "A reusable template set for subsequent applications",
      "Periodic DORA metrics reports",
    ],
    outcomes: [
      "Shorten the time from commit to production",
      "Reduce the release failure rate",
      "Repeatable releases that don't depend on individuals",
    ],
  },

  sre: {
    group: "Reliability & operations",
    positioning:
      "Turn reliability into a governable metric: SLO/SLI, error budgets, full observability and a blameless postmortem culture. Operate on data rather than intuition.",
    specs: [
      { k: "Service code", v: "NS-SRE" },
      { k: "Service group", v: "Reliability & operations" },
      { k: "Scope", v: "SLO/SLI, error budget, observability, on-call, incident management" },
      { k: "Who it's for", v: "Systems with high-availability requirements: transactions, public-service portals, digital platforms" },
      { k: "Engagement model", v: "Embedded SRE · SRE as a service · 24/7 on-call rotation" },
      { k: "Commitments", v: "24/7 SLA · response and remediation time by incident severity" },
    ],
    phaseItems: [
      ["Identify critical user journeys", "Set SLO/SLI and error budgets", "Assess observability gaps", "Design the on-call model"],
      ["Deploy metrics, logs and traces", "Build SLO-based dashboards and alerts", "Write runbooks", "Establish the incident process"],
      ["24/7 on-call rotation", "Incident handling and coordination", "Blameless postmortems", "Error-budget reporting"],
      ["Reduce toil through automation", "Tune alert thresholds", "Incident & chaos drills", "Data-driven architecture improvements"],
    ],
    deliverables: [
      "An SLO/SLI set for the main business journeys",
      "An observability system and operations dashboards",
      "Runbooks and an incident-management process",
      "Periodic error-budget, MTTR and postmortem reports",
    ],
    outcomes: [
      "Fewer recurring incidents and shorter remediation time",
      "See problems before users report them",
      "Balance release speed with stability",
    ],
  },

  aiops: {
    group: "Intelligent operations — new service",
    positioning:
      "A command deck that reads its own signals. We build the operational-data platform, put anomaly-detection models into the alerting path, then operate alongside the SRE crew — we don't hand over a dashboard and walk away.",
    specs: [
      { k: "Service code", v: "NS-AIO" },
      { k: "Service group", v: "Intelligent operations — new service" },
      { k: "Scope", v: "Operational-data platform, anomaly detection, alert correlation, auto-remediation" },
      { k: "Who it's for", v: "Organizations with many systems and many alerts that are hard to prioritize" },
      { k: "Engagement model", v: "Platform implementation · operated with the 24/7 SRE crew" },
      { k: "Commitments", v: "24/7 SLA · alert-noise and MTTR reduction targets per contract" },
    ],
    phaseItems: [
      ["Inventory signal sources", "Assess operational-data quality", "Choose priority use cases", "Design the AIOps architecture"],
      ["Build log/metric/trace pipelines", "Standardize the event store", "Deploy anomaly-detection models", "Wire into the on-call process"],
      ["Correlate and prioritize alerts", "Root-cause analysis", "Self-running runbooks", "SRE crew operating with the platform"],
      ["Retrain for seasonal load", "Expand auto-remediation", "Reduce noisy alerts", "Report effectiveness against SLOs"],
    ],
    deliverables: [
      "A centralized operational-data platform",
      "Anomaly-detection models in production",
      "Automated runbooks for familiar incident classes",
      "Alert-noise and MTTR reduction reports",
    ],
    outcomes: [
      "Reduce alert noise by 60%",
      "Shorten MTTR by 45%",
      "Let the operations crew focus on work that matters",
    ],
  },

  platform: {
    group: "Cloud platform",
    positioning:
      "The hull of the whole system: a standardized landing zone, networking, identity and cost governance. The platform is built right once so every application on top runs by the same rules.",
    specs: [
      { k: "Service code", v: "NS-PLT" },
      { k: "Service group", v: "Cloud platform" },
      { k: "Scope", v: "Landing zone, networking, identity, tagging, guardrails, FinOps" },
      { k: "Who it's for", v: "Organizations starting or scaling across multiple accounts/clouds" },
      { k: "Engagement model", v: "Platform-build project · monthly platform governance" },
      { k: "Commitments", v: "Contractual SLA · periodic cost and compliance reporting" },
    ],
    phaseItems: [
      ["Assess the current cloud estate", "Design the landing zone", "Account & access model", "TCO estimate"],
      ["Build the landing zone", "Configure networking & connectivity", "Guardrails and policy", "Tagging & billing standards"],
      ["Govern the platform", "Track compliance", "Manage limits and quotas", "Support application teams"],
      ["FinOps cost optimization", "Rightsizing & reserved capacity", "Clean up unused resources", "Cost-efficiency reporting"],
    ],
    deliverables: [
      "Landing-zone design documentation",
      "A landing zone deployed as IaC",
      "Policy, guardrail and tagging standards",
      "Periodic FinOps reports",
    ],
    outcomes: [
      "A consistent platform that scales under control",
      "Transparent cloud cost by consuming unit",
      "Faster time-to-live for new applications",
    ],
  },

  security: {
    group: "Security & compliance",
    positioning:
      "A layered defensive perimeter around the fleet: Zero Trust, identity governance, workload protection, continuous monitoring and compliance. Detect from afar, block at multiple tiers, recover by rehearsed playbooks.",
    specs: [
      { k: "Service code", v: "NS-SEC" },
      { k: "Service group", v: "Security & compliance" },
      { k: "Scope", v: "Zero Trust, IAM, workload protection, encryption, monitoring, compliance" },
      { k: "Who it's for", v: "Banking, public sector and enterprises with compliance requirements" },
      { k: "Engagement model", v: "Security-hardening project · 24/7 monitoring · periodic assessment" },
      { k: "Commitments", v: "24/7 SLA · incident response time by severity" },
    ],
    phaseItems: [
      ["Risk & attack-surface assessment", "Compliance review", "Design the Zero Trust architecture", "Remediation roadmap"],
      ["Deploy IAM & MFA", "Network segmentation and policy", "Workload protection & encryption", "Secrets management"],
      ["24/7 security monitoring", "Incident investigation and response", "Vulnerability & patch management", "Recovery drills"],
      ["Narrow permissions to least privilege", "Automate response", "Periodic penetration testing", "Improve against the compliance framework"],
    ],
    deliverables: [
      "A risk-assessment and compliance-gap report",
      "Zero Trust architecture and policy",
      "A running security-monitoring system",
      "Incident-response playbooks and drill records",
    ],
    outcomes: [
      "Reduced attack surface and excess privilege",
      "Faster incident detection and response",
      "Meets audit and compliance requirements",
    ],
  },

  cloudai: {
    group: "Data & AI platform + infrastructure",
    positioning:
      "The fuel depot and engine shop of the AI squadron: a unified data platform (data lake, feature store) and compute infrastructure (GPU/accelerator, MLOps) — ready for the whole AI/ML lifecycle, from data to serving models and LLMs at production scale.",
    specs: [
      { k: "Service code", v: "NS-AIC" },
      { k: "Service group", v: "Data & AI platform + infrastructure" },
      { k: "Scope", v: "Data platform, feature store, data governance; GPU cluster, MLOps, model serving, inference optimization" },
      { k: "Who it's for", v: "Organizations moving AI/ML — including LLMs — into production" },
      { k: "Engagement model", v: "Platform project · monthly cluster operations · partnering with the data-science team" },
      { k: "Commitments", v: "Contractual SLA · data-pipeline performance and cluster availability" },
    ],
    phaseItems: [
      ["Survey data sources & AI workloads", "Assess readiness", "Design data architecture + GPU cluster", "TCO estimate"],
      ["Build data lake/lakehouse & feature store", "Build GPU cluster & scheduler", "MLOps pipeline (training → serving)", "Training & model-serving environments"],
      ["Operate data pipelines & cluster 24/7", "Data-quality & GPU-quota governance", "Access control & data lineage", "Track performance & cost"],
      ["Optimize query & inference performance", "Quantization & autoscaling", "Tiered storage and GPU cost optimization", "Standardize data & model reuse"],
    ],
    deliverables: [
      "A data architecture and compute infrastructure for AI",
      "A data lake/lakehouse, feature store and operational pipelines",
      "A GPU cluster and an MLOps pipeline from training to model release",
      "A monitored model-serving layer and data-governance rules",
    ],
    outcomes: [
      "Clean data and enough compute for models",
      "Shorter time from idea to a model running for real",
      "Controllable data and inference cost",
    ],
  },

  migration: {
    group: "Migration & modernization",
    positioning:
      "Move the whole fleet to a new carrier without interrupting the mission: assess, classify, migrate applications and data, and modernize in controlled waves.",
    specs: [
      { k: "Service code", v: "NS-MIG" },
      { k: "Service group", v: "Migration & modernization" },
      { k: "Scope", v: "Assessment, target design, application/data migration, cutover, modernization" },
      { k: "Who it's for", v: "Organizations moving from on-premise to cloud or between clouds" },
      { k: "Engagement model", v: "Wave-based project · post-migration support" },
      { k: "Commitments", v: "Committed downtime window and rollback plan for each wave" },
    ],
    phaseItems: [
      ["Application & dependency inventory", "6R classification", "Target-architecture design", "Wave plan and TCO"],
      ["Build the target environment", "Migrate data & applications", "Performance and business testing", "Cutover and go-live"],
      ["Post-migration monitoring", "Handle leftover items", "Operations handover", "Decommission the legacy system"],
      ["Gradual modernization to cloud-native", "Post-migration cost optimization", "Architecture standardization", "Performance improvement"],
    ],
    deliverables: [
      "An inventory and 6R classification report",
      "Target architecture and a wave-based migration plan",
      "Systems running in the new environment",
      "Cutover records and operations-handover documentation",
    ],
    outcomes: [
      "Wave-based migration that limits disruption risk",
      "Lower cost of maintaining legacy systems",
      "Systems ready for the next modernization step",
    ],
  },

  cloudapp: {
    group: "Cloud-native applications",
    positioning:
      "The shipyard for building and upgrading aircraft: developing and refactoring applications to cloud-native architecture, containers/Kubernetes and microservices that can be operated long-term.",
    specs: [
      { k: "Service code", v: "NS-APP" },
      { k: "Service group", v: "Cloud-native applications" },
      { k: "Scope", v: "Microservice architecture, containerization, APIs, legacy-application refactoring" },
      { k: "Who it's for", v: "Organizations with monoliths that need to scale, or building new products" },
      { k: "Engagement model", v: "Development project · augmented development team" },
      { k: "Commitments", v: "Contractual SLA · quality commitment and post-handover warranty" },
    ],
    phaseItems: [
      ["Assess the current application", "Design the microservice architecture", "Define business boundaries", "Service-decomposition roadmap"],
      ["Containerize the application", "Deploy on Kubernetes/OpenShift", "Build API gateway & service mesh", "Integrate CI/CD"],
      ["Operate the application", "Track performance and errors", "Version management", "User support"],
      ["Optimize container resources", "Autoscaling by load", "Refactor bottlenecks", "Standardize shared libraries"],
    ],
    deliverables: [
      "Cloud-native application architecture documentation",
      "A containerized application running on K8s/OpenShift",
      "An API set and integration documentation",
      "Operations and handover documentation",
    ],
    outcomes: [
      "Applications scale with load instead of hardware upgrades",
      "Incremental releases with lower risk",
      "Infrastructure cost matched to real demand",
    ],
  },

  outsourcing: {
    enName: "Engineer Outsourcing",
    group: "Talent & Delivery",
    positioning:
      "We provide engineers by role — Cloud Engineer, DevOps Engineer, Platform Engineer, Security Engineer — as an outsourcing model, augmenting the client's team by project or long-term. Engineers are selected, trained to internal standards, and work directly within the client's own processes.",
    specs: [
      { k: "Service code", v: "NS-EOS" },
      { k: "Service group", v: "Talent & Delivery — technical capacity augmentation" },
      { k: "Roles provided", v: "Cloud Engineer · DevOps Engineer · Platform Engineer · Security Engineer (Junior → Expert)" },
      { k: "Scope", v: "Supplying Cloud/DevOps/Platform/Security engineers from Junior to Expert level" },
      { k: "Who it's for", v: "Businesses lacking deep specialists, needing to scale a team quickly, or needing experts for a specific phase" },
      { k: "Engagement model", v: "Body-shopping · outsourced team · managed team (with team lead) · onsite/hybrid/remote" },
      { k: "Commitments", v: "Staff-replacement SLA · NDA & confidentiality · periodic competency assessment" },
    ],
    phaseItems: [
      ["Survey needs & roles to hire", "Agree on level, skills and budget", "Standardize the JD and evaluation criteria", "Onboarding plan"],
      ["Select & interview candidates", "Client final interview", "Onboard into the client's processes", "Sign NDA & grant access"],
      ["Engineers work within the client's team", "Team lead monitors quality", "Periodic progress reports", "Support & replacement when needed"],
      ["Competency assessment & feedback", "Skill-upgrade training", "Adjust team size to demand", "Knowledge transfer"],
    ],
    deliverables: [
      "Candidate CVs matching the required level",
      "Engineers onboarded into the client's processes on schedule",
      "Periodic progress reports & timesheets",
      "A staff-replacement SLA commitment during turnover",
      "Knowledge-transfer documentation at engagement end",
    ],
    outcomes: [
      "Scale the technical team fast without recruitment overhead",
      "Access experts matched to each project phase",
      "Flexible cost by demand, lower staffing risk",
    ],
  },

  attt: {
    enName: "Vietnam IT-Security Compliance",
    group: "Compliance & Assurance",
    positioning:
      "Advisory and implementation for compliance with Vietnam's information-security laws: the Cybersecurity Law, the Law on Network Information Security, Decree 85/2016 on securing information systems by classification level, and personal-data protection regulations (Decree 13/2023). We accompany you from level classification and level-proposal dossiers through to protection deployment and ongoing compliance.",
    specs: [
      { k: "Service code", v: "NS-ATT" },
      { k: "Service group", v: "Compliance & Assurance — IT-security legal compliance" },
      { k: "Scope", v: "Classification & determination of information-system security level (levels 1–5), level-proposal dossiers, protection plans, compliance with the Cybersecurity Law / Law on Network Information Security / Decree 85 / Decree 13" },
      { k: "Who it's for", v: "State agencies, businesses operating critical information systems, and organizations processing personal data" },
      { k: "Engagement model", v: "Compliance advisory · level-dossier preparation · technical implementation · periodic assessment" },
      { k: "Commitments", v: "Dossiers in the prescribed forms · coordination on appraisal with authorities · periodic review" },
    ],
    phaseItems: [
      ["Survey the information system", "Classify & determine the security level (levels 1–5)", "Review gaps against the regulations", "Advise on the compliance roadmap"],
      ["Prepare the level-proposal dossier per Decree 85", "Design the protection plan by level", "Deploy technical & management measures", "Coordinate appraisal and level approval"],
      ["Operate the protection plan", "Information-security monitoring (SOC/SIEM)", "Incident response per the regulations", "Maintain compliance records"],
      ["Periodic level re-assessment", "Update to new legal documents", "Incident-response drills", "Optimize compliance cost"],
    ],
    deliverables: [
      "An information-system classification & security-level determination report",
      "A level-proposal dossier per the Decree 85/2016 forms",
      "An information-security protection plan by level",
      "An IS-security policy/regulation set compliant with the Cybersecurity Law & the Law on Network Information Security",
      "A personal-data protection compliance report (Decree 13/2023)",
    ],
    stack: ["ISO 27001", "Decree 85/2016", "Cybersecurity Law", "Network Information Security Law", "Decree 13/2023", "SIEM", "SOC", "IAM", "DLP", "Firewall"],
    outcomes: [
      "Systems classified & level-approved per regulation",
      "Reduced legal and cybersecurity risk",
      "Ready for appraisal by state authorities",
    ],
  },

  managed: {
    enName: "Comprehensive Cloud Managed Service",
    group: "Managed Operations",
    positioning:
      "Comprehensive 24/7 operation of the client's cloud infrastructure with a single point of accountability: monitoring, incident handling, security patching, backup & disaster recovery, change management, cost optimization and compliance. The client focuses on the product while the managed-service team runs the platform to a committed SLA.",
    specs: [
      { k: "Service code", v: "NS-MSP" },
      { k: "Service group", v: "Managed Operations — platform operations to SLA" },
      { k: "Scope", v: "24/7 monitoring, incident & change management (ITSM), patching & updates, backup/DR, security operations, FinOps, multi-cloud (AWS/Azure/GCP) and on-prem/K8s" },
      { k: "Who it's for", v: "Businesses wanting to outsource all infrastructure operations, with systems requiring high availability and compliance" },
      { k: "Engagement model", v: "Managed service by package · co-managed · full-package to SLA · onsite/remote" },
      { k: "Commitments", v: "24/7 SLA · committed uptime · contractual RTO/RPO · periodic operations & cost reports" },
    ],
    phaseItems: [
      ["Assess infrastructure state & risk", "Define the service catalog & SLA", "Inventory assets, access and compliance", "Build runbooks & service catalog"],
      ["Onboard systems into management", "Set up monitoring/alerting & tooling", "Establish backup/DR & security baseline", "Integrate ITSM and change/incident processes"],
      ["24/7 operations & incident on-call", "Patching, updates & change management", "Periodic backup and recovery testing", "SLA, uptime & FinOps reporting"],
      ["Cost and performance optimization", "Automate operations, reduce toil", "Continuous architecture & security improvement", "SLA review and upgrade roadmap"],
    ],
    deliverables: [
      "A clear service catalog and SLA commitments",
      "A 24/7 monitoring system, dashboards & SLA-based alerts",
      "Operations runbooks and ITSM processes (incident/change/problem)",
      "A recovery-tested backup/DR plan",
      "Periodic operations, uptime and cost-optimization reports",
    ],
    outcomes: [
      "Reduced operational burden on the internal team",
      "A committed SLA with a single point of accountability",
      "Optimized cloud cost and continuous compliance",
    ],
  },

  incident: {
    enName: "Cloud Incident Response",
    group: "Emergency & Assurance",
    positioning:
      "Emergency incident response for systems on the cloud: 24/7 intake, fast response, war-room setup, containment and service recovery, then root-cause investigation. We handle both operational incidents (downtime, overload, release failures) and security incidents (attacks, intrusions, leaks, ransomware). Available on a response retainer or as an emergency call-out per case.",
    specs: [
      { k: "Service code", v: "NS-IRC" },
      { k: "Service group", v: "Emergency & Assurance — response & recovery" },
      { k: "Scope", v: "24/7 intake & incident triage, war-room, containment/prevention/recovery, root-cause investigation; both operational and security incidents (DDoS, intrusion, ransomware), basic forensics" },
      { k: "Who it's for", v: "Critical cloud systems needing a fast-response commitment; organizations without a dedicated IR team" },
      { k: "Engagement model", v: "Retainer (response subscription) · per-case emergency (call-out) · joint on-call with the client's team" },
      { k: "Commitments", v: "24/7 hotline · response time by incident severity · target RTO · post-incident report" },
    ],
    phaseItems: [
      ["Risk & incident-scenario assessment", "Set up intake channels & triage", "Build the IR playbook & war-room model", "Agree on response SLA & emergency contacts"],
      ["Integrate monitoring/alerting & escalation", "Prepare forensics & recovery tools", "Rehearse scenarios (tabletop/drill)", "Set up the war-room channel & on-call"],
      ["24/7 intake & response", "Contain, prevent & recover services", "Coordinate the war-room, continuous updates", "Collect evidence, logs & timeline"],
      ["Root-cause analysis (RCA)", "Blameless postmortem & recommendations", "Update the playbook, prevent recurrence", "Periodic review & drills"],
    ],
    deliverables: [
      "An IR playbook and incident-severity matrix",
      "A 24/7 hotline/intake channel with a committed response SLA",
      "A response report & timeline for each incident",
      "Root-cause analysis (RCA) + postmortem + remediation recommendations",
      "Periodic incident-response drill reports",
    ],
    outcomes: [
      "Shorter MTTR during major incidents",
      "Reduced damage and service-disruption time",
      "Ready to respond to both operational and security incidents",
    ],
  },
};

/**
 * English chrome for the service detail page (breadcrumb, hero buttons, phase
 * word, block headings, CTA panel). Consumed via useLang() in ServiceDetailView.
 */
export const DETAIL_UI = {
  breadcrumbHome: { vi: "Trang chính", en: "Home" },
  breadcrumbServices: { vi: "Dịch vụ", en: "Services" },
  heroPrimary: { vi: "Đặt buổi tư vấn", en: "Book a consultation" },
  heroSecondary: { vi: "Xem hạng mục công việc", en: "View the work breakdown" },
  phaseWord: { vi: "Giai đoạn", en: "Phase" },
  blockHeadings: {
    deliverables: { vi: "Sản phẩm bàn giao", en: "Deliverables" },
    stack: { vi: "Công nghệ & nền tảng", en: "Stack" },
    outcomes: { vi: "Kết quả kỳ vọng", en: "Outcomes" },
  },
  cta: {
    title: { vi: "Cần lộ trình cụ thể cho {{ name }}?", en: "Need a concrete roadmap for {{ name }}?" },
    sub: {
      vi: "Đội ngũ FPT-IS Next Gen Service sẽ khảo sát hiện trạng và đề xuất phương án trong 3 ngày làm việc.",
      en: "The FPT-IS Next Gen Service team will assess your current state and propose a plan within 3 business days.",
    },
    phoneKey: { vi: "Điện thoại", en: "Phone" },
    emailKey: { vi: "Email", en: "Email" },
    button: { vi: "Gửi yêu cầu tư vấn", en: "Send a consultation request" },
  },
} as const;
