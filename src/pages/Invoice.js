import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Printer, Download, ArrowLeft, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, settings } = useAppContext();
  
  const order = orders.find(o => o.id === id);

  if (!order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Order not found</h2>
        <button onClick={() => navigate('/reports')} className="mt-4 text-brand-blue hover:underline">Return to reports</button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, use html2pdf.js or similar
    toast.success('PDF downloaded (Simulated)');
  };

  const dateStr = new Date(order.date).toLocaleDateString();
  const timeStr = new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6 no-print">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-brand-blue font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            className="px-6 py-3 rounded-lg font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" /> Save PDF
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-3 rounded-lg font-bold text-white bg-brand-blue hover:bg-blue-700 flex items-center gap-2 transition-colors shadow-md"
          >
            <Printer className="w-5 h-5" /> Print Receipt
          </button>
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg border border-slate-200 flex-1 print:shadow-none print:border-none print:p-0 text-slate-900" id="printable-invoice">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start border-b-2 border-slate-200 pb-8 mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="p-3 bg-brand-dark rounded-xl text-brand-light">
              <Store className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{settings.shopName}</h1>
              <p className="text-slate-500 mt-1 font-medium">Electronics & Solar Solutions</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <h2 className="text-4xl font-black text-brand-blue tracking-tight uppercase">Invoice</h2>
            <p className="font-bold text-xl mt-2">#{order.id}</p>
            <p className="text-slate-500 font-medium">{dateStr} {timeStr}</p>
          </div>
        </div>

        {/* Item Table */}
        <table className="w-full text-left mb-8">
          <thead>
            <tr className="border-b-2 border-slate-800 text-slate-800">
              <th className="py-3 px-2 font-bold uppercase text-sm tracking-wider">Description</th>
              <th className="py-3 px-2 font-bold uppercase text-sm tracking-wider text-center">Qty</th>
              <th className="py-3 px-2 font-bold uppercase text-sm tracking-wider text-right">Base Price</th>
              <th className="py-3 px-2 font-bold uppercase text-sm tracking-wider text-right">Negotiated</th>
              <th className="py-3 px-2 font-bold uppercase text-sm tracking-wider text-right">Discount</th>
              <th className="py-3 px-2 font-bold uppercase text-sm tracking-wider text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {order.items.map((item, index) => (
              <tr key={index}>
                <td className="py-4 px-2">
                  <p className="font-bold text-lg">{item.product.name}</p>
                  <p className="text-sm text-slate-500 font-mono">{item.product.sku}</p>
                </td>
                <td className="py-4 px-2 text-center text-lg font-medium">{item.qty}</td>
                <td className="py-4 px-2 text-right text-lg text-slate-500 line-through">₨{item.basePrice.toLocaleString()}</td>
                <td className="py-4 px-2 text-right text-lg font-medium">₨{item.negotiatedPrice.toLocaleString()}</td>
                <td className="py-4 px-2 text-right text-lg font-medium text-red-500">{item.discount < 0 ? `-₨${Math.abs(item.discount).toLocaleString()}` : '-'}</td>
                <td className="py-4 px-2 text-right text-lg font-bold">₨{item.lineTotal.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="w-full md:w-1/2 text-slate-500 italic">
            <p>Thank you for your business!</p>
            <p className="mt-2 text-sm">Returns accepted within 14 days with original receipt.</p>
          </div>
          
          <div className="w-full md:w-1/2 bg-slate-50 p-6 rounded-xl border border-slate-200">
            <div className="flex justify-between py-2 text-lg">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-bold">₨{order.subtotal.toLocaleString()}</span>
            </div>
            {order.totalDiscount < 0 && (
              <div className="flex justify-between py-2 text-lg text-red-600">
                <span className="font-medium">Total Discount</span>
                <span className="font-bold">-₨{Math.abs(order.totalDiscount).toLocaleString()}</span>
              </div>
            )}
            {order.tax > 0 && (
              <div className="flex justify-between py-2 text-lg">
                <span className="text-slate-600 font-medium">Tax ({settings.taxRate}%)</span>
                <span className="font-bold">₨{order.tax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between py-4 mt-2 border-t-2 border-slate-800 text-2xl">
              <span className="font-black uppercase tracking-wider">Total</span>
              <span className="font-black text-brand-blue text-4xl">₨ {order.finalTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
          <p>{settings.shopName} | Official Receipt</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
