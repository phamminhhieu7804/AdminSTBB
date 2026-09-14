import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PackageSearch, 
  Settings, 
  Users, 
  Link as LinkIcon, 
  Plus, 
  Trash2,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

const API_BASE = import.meta.env.DEV 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3000') 
  : (import.meta.env.VITE_API_URL || 'https://searchtobuy.vercel.app');

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 px-2 py-4 mb-4">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Settings size={20} />
          </div>
          <h1 className="font-bold text-lg text-slate-800">AdminSTB</h1>
        </div>

        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
            activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BarChart3 size={18} />
          <span>Lịch sử tìm kiếm</span>
        </button>

        <button 
          onClick={() => setActiveTab('promos')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
            activeTab === 'promos' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <PackageSearch size={18} />
          <span>Quản lý Deal Độc Quyền</span>
        </button>

        <button 
          onClick={() => setActiveTab('trends')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
            activeTab === 'trends' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TrendingUp size={18} />
          <span>🔥 TikTok Hot Trends</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'promos' && <PromosTab />}
        {activeTab === 'trends' && <TrendsTab />}
      </main>
    </div>
  );
}

function DashboardTab() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch history
    fetch(`${API_BASE}/api/admin/history`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setHistory(data.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Lịch sử người dùng tìm kiếm</h2>
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Lịch sử gần đây ({history.length} lượt)</h3>
        </div>
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-medium text-slate-500">
            <tr>
              <th className="px-6 py-3">Từ khóa / Link</th>
              <th className="px-6 py-3">Loại</th>
              <th className="px-6 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {history.map(item => (
              <tr key={item.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800 truncate max-w-md">
                  {item.keyword}
                </td>
                <td className="px-6 py-4">
                  {item.isLink ? (
                    <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">Link</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-semibold">Từ khóa</span>
                  )}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {new Date(item.timestamp).toLocaleString('vi-VN')}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan="3" className="px-6 py-8 text-center text-slate-400">Chưa có dữ liệu tìm kiếm</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PromosTab() {
  const [promos, setPromos] = useState([]);
  const [linkInput, setLinkInput] = useState('');
  const [isFetching, setIsFetching] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/promos`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setPromos(data.data);
      });
  }, []);

  const handleFetchData = async () => {
    if (!linkInput.trim()) return;
    setIsFetching(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/fetch-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linkInput })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewData({
          ...data.data,
          originalUrl: linkInput
        });
      } else {
        alert(data.message || 'Không thể cào dữ liệu từ link này');
      }
    } catch (e) {
      alert('Lỗi hệ thống khi cào dữ liệu');
    }
    setIsFetching(false);
  };

  const handleSavePromo = async () => {
    if (!previewData) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/admin/promos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...previewData,
          isActive: true
        })
      });
      const result = await res.json();
      if (result.success) {
        setPromos([result.data, ...promos]);
        setPreviewData(null);
        setLinkInput('');
      }
    } catch (e) {
      alert('Lỗi khi lưu Deal');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa deal này?')) return;
    try {
      await fetch(`${API_BASE}/api/admin/promos?id=${id}`, { method: 'DELETE' });
      setPromos(promos.filter(p => p.id !== id));
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Quản lý Deal Độc Quyền</h2>
      
      {/* Auto-fetch Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Plus size={18} /> Thêm Deal mới (Tự động cào data)
        </h3>
        
        <div className="flex gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              placeholder="Dán link sản phẩm Shopee / TikTok..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
            />
          </div>
          <button 
            onClick={handleFetchData}
            disabled={isFetching || !linkInput.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 rounded-xl font-medium transition-colors"
          >
            {isFetching ? 'Đang tải...' : 'Lấy thông tin'}
          </button>
        </div>

        {previewData && (
          <div className="mt-6 border border-slate-200 rounded-xl p-4 bg-slate-50 flex gap-4">
            <img src={previewData.img} alt="preview" className="w-24 h-24 object-cover rounded-lg" />
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 line-clamp-2">{previewData.title}</h4>
              <p className="text-red-500 font-bold mt-1">{previewData.price?.toLocaleString()}đ</p>
              <div className="mt-3 flex gap-2">
                <button onClick={handleSavePromo} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Lưu lên Search-to-Buy
                </button>
                <button onClick={() => setPreviewData(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Danh sách Đã Đăng ({promos.length})</h3>
        </div>
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-slate-50 text-xs uppercase font-medium text-slate-500">
            <tr>
              <th className="px-6 py-3">Sản phẩm</th>
              <th className="px-6 py-3">Nền tảng</th>
              <th className="px-6 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {promos.map(p => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={p.img} alt={p.title} className="w-10 h-10 rounded object-cover" />
                    <div>
                      <p className="font-medium text-slate-800 line-clamp-1 max-w-xs">{p.title}</p>
                      <p className="text-red-500 text-xs font-bold">{p.price?.toLocaleString()}đ</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                    {p.link?.includes('shopee') ? 'Shopee' : 'TikTok'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrendsTab() {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/tiktok-trends`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrends(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">🔥 TikTok Hot Trends</h2>
          <p className="text-slate-500 mt-1">Danh sách chiến dịch và sản phẩm nổi bật có hoa hồng cao trên Accesstrade</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500 flex flex-col items-center">
            <span className="animate-spin text-3xl mb-3">⏳</span>
            Đang cào dữ liệu Hot Trend...
          </div>
        ) : trends.length > 0 ? (
          trends.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <img src={item.img} alt={item.title} className="w-full h-48 object-cover" />
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-slate-800 line-clamp-2" title={item.title}>{item.title}</h3>
                
                <div className="mt-3 flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">Hoa hồng:</span>
                  <span className="font-bold text-green-600">{item.commissionText || `${item.commissionRate}%`}</span>
                </div>
                
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-slate-500">Đã bán:</span>
                  <span className="font-semibold text-slate-700">{item.soldText}</span>
                </div>
                <div className="mt-1 flex justify-between items-center text-sm">
                  <span className="text-slate-500">Giá:</span>
                  <span className="font-bold text-red-500">{item.price.toLocaleString('vi-VN')}đ</span>
                </div>

                <a 
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full bg-slate-900 text-white text-center py-2.5 rounded-xl font-medium text-sm hover:bg-slate-800 flex justify-center items-center gap-2"
                >
                  Sao chép Link <ExternalLink size={16} />
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-500">
            Không thể lấy được dữ liệu Trend lúc này.
          </div>
        )}
      </div>
    </div>
  );
}
