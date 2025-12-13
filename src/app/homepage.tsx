import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Dịch Vụ Cloud <span className="text-blue-600">Chuyên Nghiệp</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Chuyên gia Cloud & Platform Engineering với kinh nghiệm thực tế trong môi trường production. 
              Chúng tôi cung cấp giải pháp enterprise cho các team DevOps, SRE và Platform Engineering.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/services"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Khám Phá Dịch Vụ
              </Link>
              <Link
                href="/blog"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Blog Kỹ Thuật
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Dịch Vụ Chuyên Nghiệp
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Chúng tôi cung cấp giải pháp Cloud toàn diện từ tư vấn đến triển khai và vận hành
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 text-blue-600">💡</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cloud Consulting</h3>
              <p className="text-gray-600 text-sm">Tư vấn chiến lược và thiết kế kiến trúc cloud</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 text-green-600">🚀</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Implementation</h3>
              <p className="text-gray-600 text-sm">Triển khai Cloud, K8s và DevSecOps pipeline</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 text-purple-600">⚙️</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Operations</h3>
              <p className="text-gray-600 text-sm">Vận hành 24x7, SRE và tối ưu hiệu năng</p>
            </div>

            <div className="text-center p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-6 h-6 text-red-600">🔒</div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-600 text-sm">Bảo mật cloud, compliance và DevSecOps</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Sẵn Sàng Bắt Đầu Dự Án Cloud?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Tư vấn miễn phí với các Cloud Architects của chúng tôi
          </p>
          <Link
            href="/contact"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Tư Vấn Miễn Phí
          </Link>
        </div>
      </section>
    </div>
  );
}