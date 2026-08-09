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
      "Giảm nhiễu cảnh báo [X]% — số liệu điền sau",
      "Rút ngắn MTTR [X]% — số liệu điền sau",
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
    name: "Cloud for AI",
    nameEn: "Cloud & data for AI",
    group: "Nền tảng cho AI",
    positioning:
      "Kho nhiên liệu của phi đội AI: nền tảng cloud và dữ liệu sẵn sàng cho workload AI/ML — từ thu thập, quản trị đến phục vụ mô hình ở quy mô sản xuất.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-AIC" },
      { k: "Nhóm dịch vụ", v: "Nền tảng dữ liệu & AI" },
      { k: "Phạm vi", v: "Data platform, feature store, quản trị dữ liệu, môi trường huấn luyện và phục vụ" },
      { k: "Đối tượng", v: "Tổ chức đang đưa AI/ML vào sản xuất" },
      { k: "Mô hình hợp tác", v: "Dự án nền tảng · đồng hành cùng đội data science" },
      { k: "Cam kết", v: "SLA theo hợp đồng · cam kết hiệu năng pipeline dữ liệu" },
    ],
    phases: buildPhases([
      ["Khảo sát nguồn dữ liệu", "Đánh giá mức độ sẵn sàng cho AI", "Thiết kế kiến trúc dữ liệu", "Chọn nền tảng và dự toán"],
      ["Dựng data lake / lakehouse", "Pipeline thu thập & xử lý", "Feature store", "Môi trường huấn luyện"],
      ["Vận hành pipeline dữ liệu", "Quản trị chất lượng dữ liệu", "Kiểm soát truy cập & dòng dữ liệu", "Theo dõi chi phí xử lý"],
      ["Tối ưu hiệu năng truy vấn", "Tối ưu chi phí lưu trữ theo lớp", "Mở rộng theo nhu cầu mô hình", "Chuẩn hoá tái sử dụng dữ liệu"],
    ]),
    deliverables: [
      "Kiến trúc dữ liệu cho workload AI",
      "Data lake/lakehouse và pipeline vận hành",
      "Quy tắc quản trị và phân quyền dữ liệu",
      "Môi trường huấn luyện và phục vụ mô hình",
    ],
    stack: ["Databricks", "Apache Spark", "Kafka", "Airflow", "dbt", "MinIO / S3", "Feast", "Snowflake", "PostgreSQL"],
    outcomes: [
      "Dữ liệu sạch và sẵn sàng cho mô hình",
      "Rút ngắn thời gian từ ý tưởng đến mô hình chạy thật",
      "Chi phí dữ liệu kiểm soát được",
    ],
  },

  aiinfra: {
    slug: "aiinfra",
    code: "GPU",
    serviceCode: "NS-GPU",
    accent: "orange",
    accentHex: ORANGE,
    name: "AI Infrastructure",
    nameEn: "GPU clusters & MLOps",
    group: "Hạ tầng AI",
    positioning:
      "Xưởng động cơ cho tiêm kích hạng nặng: hạ tầng GPU/accelerator, cluster huấn luyện, MLOps và phục vụ LLM ở quy mô sản xuất — đủ lực và đủ ổn định.",
    specs: [
      { k: "Mã dịch vụ", v: "NS-GPU" },
      { k: "Nhóm dịch vụ", v: "Hạ tầng AI" },
      { k: "Phạm vi", v: "Cluster GPU, scheduler, MLOps, model serving, tối ưu suy luận" },
      { k: "Đối tượng", v: "Tổ chức huấn luyện hoặc phục vụ mô hình lớn, bao gồm LLM" },
      { k: "Mô hình hợp tác", v: "Dự án dựng hạ tầng · vận hành cluster theo tháng" },
      { k: "Cam kết", v: "SLA theo hợp đồng · cam kết mức sẵn sàng cluster và thông lượng" },
    ],
    phases: buildPhases([
      ["Xác định workload và nhu cầu tính toán", "Thiết kế cluster GPU", "So sánh phương án on-prem / cloud", "Dự toán TCO"],
      ["Dựng cluster & scheduler", "Cấu hình mạng tốc độ cao và lưu trữ", "Triển khai MLOps pipeline", "Dựng lớp model serving"],
      ["Vận hành cluster 24/7", "Quản trị hạn mức GPU theo nhóm", "Theo dõi hiệu suất và nhiệt độ", "Bảo trì và cập nhật driver"],
      ["Tối ưu sử dụng GPU", "Quantization & tối ưu suy luận", "Autoscaling theo tải", "Giảm chi phí trên mỗi yêu cầu"],
    ]),
    deliverables: [
      "Thiết kế và triển khai cluster GPU",
      "MLOps pipeline từ huấn luyện đến phát hành mô hình",
      "Lớp phục vụ mô hình có giám sát",
      "Báo cáo hiệu suất sử dụng GPU",
    ],
    stack: ["NVIDIA GPU", "Kubernetes", "Kubeflow", "MLflow", "Ray", "Slurm", "vLLM", "Triton Inference Server", "NVIDIA GPU Operator"],
    outcomes: [
      "Tận dụng GPU hiệu quả hơn, giảm thời gian chờ",
      "Mô hình đưa vào sản xuất theo quy trình chuẩn",
      "Chi phí suy luận trên mỗi yêu cầu giảm",
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
  "aiinfra",
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
  sub: "Đội ngũ FPT-IS Next Gen Service sẽ khảo sát hiện trạng và đề xuất phương án trong [X] ngày làm việc.",
  phone: { key: "Điện thoại", value: "+84 973 391 388", href: "tel:+84973391388" },
  email: { key: "Email", value: "dungpv30@fpt.com.vn", href: "mailto:dungpv30@fpt.com.vn" },
  button: { label: "Gửi yêu cầu tư vấn", href: "FPTIS NS Landing v3 Ant.dc.html#contact" },
};

/** Footer (contains [2026] placeholder preserved verbatim) */
export const FOOTER = {
  copyright: "© [2026] FPT-IS Next Gen Service. Keangnam Landmark 72, E10, Nam Từ Liêm, Hà Nội.",
  backLink: { label: "← Về trang chính", href: "FPTIS NS Landing v3 Ant.dc.html" },
};
